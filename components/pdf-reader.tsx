import { useCallback, useEffect, useRef, useState } from "react";

import {
  type VirtualizerOptions,
  elementScroll,
  useVirtualizer,
} from "@tanstack/react-virtual";
import { Document } from "react-pdf";

import type {
  ReaderProps,
  HighlightArea,
  PageViewport,
  PDFDocument,
} from "../types";
import { MainPage, EXTRA_WIDTH } from "./main-page";
import { DEFAULT_HEIGHT, VIRTUAL_ITEM_GAP } from "../constant";
import useVirtualizerVelocity from "../hooks/useVirtualizerVelocity";
import useZoom from "../hooks/useZoom";
import {
  easeOutQuint,
  getOffsetForIndexAndPercentage,
  getOffsetForIndexEager,
  getOffsetForHighlight,
} from "../util";

const determineScale = (parentElement: HTMLElement, width: number): number => {
  const scaleWidth = parentElement.clientWidth / width;
  return scaleWidth;
};

const Reader = ({
  file,
  initialScale,
  setReaderAPI,
  renderPage,
  reactPDFDocumentProps,
  virtualizerOptions = { overscan: 0 },
}: ReaderProps) => {
  const parentRef = useRef<HTMLDivElement | null>(null);
  const scrollingRef = useRef<number | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [viewports, setPageViewports] = useState<Array<PageViewport> | null>(
    null,
  );
  const [pdf, setPdf] = useState<PDFDocument | null>(null);
  const [scale, setScale] = useState<number | undefined>(initialScale);
  const [defaultScale, setDefaultScale] = useState<number | null>(null);

  const [scrollAnchor, setScrollAnchor] = useState<{
    index: number;
    percentageOffsetY: number;
    percentageOffsetX: number;
  } | null>(null);
  const [viewportsReady, setViewportsReady] = useState<boolean>(false);

  const scrollToFn: VirtualizerOptions<HTMLDivElement, Element>["scrollToFn"] =
    useCallback(
      (offset, canSmooth, instance) => {
        const duration = 400;
        const start = parentRef.current?.scrollTop || 0;
        const startTime = (scrollingRef.current = Date.now());
        if (canSmooth.behavior === "auto") {
          elementScroll(offset, canSmooth, instance);
          return;
        }
        const run = () => {
          if (scrollingRef.current !== startTime) return;
          const now = Date.now();
          const elapsed = now - startTime;
          const progress = easeOutQuint(Math.min(elapsed / duration, 1));
          const interpolated = start + (offset - start) * progress;

          if (elapsed < duration) {
            elementScroll(interpolated, { behavior: "auto" }, instance);
            requestAnimationFrame(run);
          } else {
            elementScroll(interpolated, { behavior: "auto" }, instance);
          }
        };

        requestAnimationFrame(run);
      },
      [parentRef],
    );

  const onDocumentLoadSuccess = async (newPdf: PDFDocument) => {
    try {
      setPdf(newPdf);
      setNumPages(newPdf.numPages);
    } catch (error) {
      console.error("Error in onDocumentLoadSuccess:", error);
    }
  };

  const onDocumentLoadError = (error: Error) => {
    console.error("PDF loading error:", error);
    setPdf(null);
    setNumPages(0);
  };

  // Reset states when file changes
  useEffect(() => {
    setPdf(null);
    setNumPages(0);
    setPageViewports(null);
    setViewportsReady(false);
  }, [file]);

  const estimateSize = useCallback(
    (index: number) => {
      if (!viewports || !viewports[index]) return DEFAULT_HEIGHT;
      return viewports[index].height;
    },
    [viewports],
  );

  const virtualizer = useVirtualizer({
    count: numPages || 0,
    getScrollElement: () => parentRef.current,
    estimateSize: estimateSize,
    overscan: virtualizerOptions.overscan ?? 1,
    scrollToFn,
    gap: VIRTUAL_ITEM_GAP,
    paddingStart: 0,
    enabled: viewportsReady,
  });

  const {
    increaseZoom: baseIncreaseZoom,
    decreaseZoom: baseDecreaseZoom,
    zoomFitWidth: baseZoomFitWidth,
  } = useZoom({
    scale,
    defaultScale,
    setScale,
  });

  const getVirtualItemAndOffsetAt = useCallback(
    (point?: { top: number; left: number }) => {
      if (!parentRef.current || !viewports) {
        return null;
      }

      const viewportTop = point?.top ?? parentRef.current.clientHeight / 2;
      const scrollOffset = parentRef.current.scrollTop + viewportTop;

      const virtualItem = virtualizer.getVirtualItemForOffset(scrollOffset);

      if (!virtualItem) {
        return null;
      }

      const offsetInItem = scrollOffset - virtualItem.start;
      const percentageOffsetY = (offsetInItem / virtualItem.size) * 100;

      const viewportLeft = point?.left ?? parentRef.current.clientWidth / 2;
      const pageViewport = viewports[virtualItem.index];

      if (!pageViewport) {
        return null;
      }

      const pageInnerBoxWidth = pageViewport.width + EXTRA_WIDTH;
      const containerWidth = parentRef.current.clientWidth;

      const pageLeftOffsetInContainer =
        (containerWidth - pageInnerBoxWidth) / 2;

      const absoluteX = parentRef.current.scrollLeft + viewportLeft;

      const offsetX = absoluteX - pageLeftOffsetInContainer;

      const percentageOffsetX = (offsetX / pageInnerBoxWidth) * 100;

      return { index: virtualItem.index, percentageOffsetY, percentageOffsetX };
    },
    [virtualizer, viewports],
  );

  const increaseZoom = useCallback(
    (levels?: number, point?: { top: number; left: number }) => {
      const anchor = getVirtualItemAndOffsetAt(point);
      if (anchor) {
        setScrollAnchor(anchor);
      }
      baseIncreaseZoom(levels);
    },
    [getVirtualItemAndOffsetAt, baseIncreaseZoom],
  );

  const decreaseZoom = useCallback(
    (levels?: number, point?: { top: number; left: number }) => {
      const anchor = getVirtualItemAndOffsetAt(point);
      if (anchor) {
        setScrollAnchor(anchor);
      }
      baseDecreaseZoom(levels);
    },
    [getVirtualItemAndOffsetAt, baseDecreaseZoom],
  );

  const zoomFitWidth = useCallback(() => {
    const anchor = getVirtualItemAndOffsetAt();
    if (anchor) {
      setScrollAnchor(anchor);
    }
    baseZoomFitWidth();
  }, [getVirtualItemAndOffsetAt, baseZoomFitWidth]);

  useEffect(() => {
    const calculateViewports = async () => {
      if (!pdf || scale === undefined) return;

      try {
        const viewports = await Promise.all(
          Array.from({ length: pdf.numPages }, async (_, index) => {
            const page = await pdf.getPage(index + 1);
            const viewport = page.getViewport({
              scale: scale,
              rotation: 0,
            });
            return viewport;
          }),
        );

        setPageViewports(viewports);
        setViewportsReady(true);
      } catch (error) {
        console.error("Error calculating viewports:", error);
        setViewportsReady(true); // Still set ready to prevent infinite loading
      }
    };

    // Only set not ready if viewports don't exist yet
    if (!viewports) {
      setViewportsReady(false);
    }
    calculateViewports();
  }, [pdf, scale]); // viewports intentionally excluded to prevent infinite loop

  useEffect(() => {
    if (!pdf) return;
    const fetchPageAndSetScale = async ({
      initialScale,
    }: {
      initialScale: number | undefined;
    }) => {
      const firstPage = await pdf.getPage(1);
      const firstViewPort = firstPage.getViewport({
        scale: 1,
        rotation: 0,
      });
      const newScale = determineScale(parentRef.current!, firstViewPort.width);
      if (!initialScale) setScale(newScale);
      if (initialScale) setScale(initialScale);
      setDefaultScale(newScale);
    };

    fetchPageAndSetScale({ initialScale });
  }, [pdf, initialScale]);

  useEffect(() => {
    if (!viewports || !viewportsReady) return;
    if (scale === undefined) return;
    virtualizer.measure();

    if (scrollAnchor) {
      const startOffset = getOffsetForIndexEager(
        scrollAnchor.index,
        virtualizer,
        estimateSize,
      );

      if (startOffset != null) {
        const itemHeight = estimateSize(scrollAnchor.index);
        const offset = getOffsetForIndexAndPercentage({
          itemHeight: itemHeight,
          percentage: scrollAnchor.percentageOffsetY,
          startOffset: startOffset,
        });

        virtualizer.scrollToOffset(offset, {
          align: "center",
          behavior: "auto",
        });

        if (parentRef.current) {
          const pageViewport = viewports[scrollAnchor.index];
          if (pageViewport) {
            const pageInnerBoxWidth = pageViewport.width + EXTRA_WIDTH;
            const containerWidth = parentRef.current.clientWidth;

            const offsetX =
              pageInnerBoxWidth * (scrollAnchor.percentageOffsetX / 100);

            const pageLeftOffsetInContainer =
              (containerWidth - pageInnerBoxWidth) / 2;

            const targetAbsoluteX = pageLeftOffsetInContainer + offsetX;

            const newScrollLeft = targetAbsoluteX - containerWidth / 2;

            parentRef.current.scrollLeft = newScrollLeft;
          }
        }
      }
      setScrollAnchor(null);
    }

    const jumpToPage = (
      pageIndex: number,
      options: {
        align: "start" | "center" | "end" | "auto";
        behavior: "auto" | "smooth";
      },
    ) => {
      const defaultOptions = {
        align: "start" as const,
        behavior: "smooth" as const,
      };
      const finalOptions = { ...defaultOptions, ...options };
      virtualizer.scrollToIndex(pageIndex, finalOptions);
    };

    const jumpToOffset = (offset: number) => {
      virtualizer.scrollToOffset(offset, {
        align: "start",
        behavior: "smooth",
      });
    };

    const jumpToHighlightArea = (area: HighlightArea) => {
      const startOffset = virtualizer.getOffsetForIndex?.(
        area.pageIndex,
        "start",
      )?.[0];

      if (startOffset == null) return;

      const itemHeight = estimateSize(area.pageIndex);
      const offset = getOffsetForHighlight({
        top: area.top,
        itemHeight: itemHeight - 10,
        startOffset: startOffset - 5,
      });

      virtualizer.scrollToOffset(offset, {
        align: "start",
        behavior: "smooth",
      });
    };

    setReaderAPI &&
      setReaderAPI({
        jumpToPage,
        jumpToHighlightArea,
        jumpToOffset,
        increaseZoom,
        decreaseZoom,
        zoomFitWidth,
        scale,
        getVirtualItemAndOffsetAt,
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewports, scale, viewportsReady, scrollAnchor]);

  // scale changes >> recalc viewports >> viewports ready >> zoom

  const { normalizedVelocity } = useVirtualizerVelocity({
    virtualizer,
    estimateSize,
  });

  const isScrollingFast = Math.abs(normalizedVelocity) > 1;
  const isZooming = scrollAnchor !== null;

  const shouldRender = isZooming || !isScrollingFast || !viewportsReady;

  return (
    <div
      id="reader-parent"
      ref={parentRef}
      className="h-full w-full overflow-auto"
    >
      <Document
        {...reactPDFDocumentProps}
        key={file}
        file={file}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
        // react-pdf 10.x allows scale to be passed to the document
        // scale={scale}
      >
        <div
          id="pages-container"
          style={{
            height: `${virtualizer.getTotalSize()}px`,
          }}
          className="relative w-full"
        >
          {pdf ? (
            virtualizer
              .getVirtualItems()
              .map((virtualItem) => (
                <MainPage
                  scale={scale}
                  key={virtualItem.key}
                  virtualItem={virtualItem}
                  shouldRender={shouldRender}
                  renderPage={renderPage}
                />
              ))
          ) : (
            <div />
          )}
        </div>
      </Document>
    </div>
  );
};

export default Reader;
