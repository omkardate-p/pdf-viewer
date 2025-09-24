import { useRef } from "react";

import { Page as ReactPdfPage } from "react-pdf";

import { cn } from "@/utils/tailwind-utils";

import { ReaderPageProps, RenderPage, RenderPageProps } from "../types";

export const EXTRA_WIDTH = 5;

const MainPage = ({
  scale = 1,
  virtualItem,
  shouldRender,
  renderPage,
}: ReaderPageProps) => {
  const pageRef = useRef<HTMLDivElement | null>(null);

  const defaultPageRenderer: RenderPage = (props: RenderPageProps) => {
    return (
      <ReactPdfPage
        scale={props.scale}
        pageIndex={props.pageIndex}
        rotate={props.rotate}
      />
    );
  };

  const renderPageLayer = renderPage || defaultPageRenderer;

  return (
    <div
      ref={pageRef}
      id="page-outer-box"
      data-index={virtualItem.index}
      style={{
        height: `${virtualItem.size}px`,
        transform: `translateY(${virtualItem.start}px)`,
      }}
      className="absolute flex min-w-full justify-center"
    >
      <div
        id="page-inner-box"
        className={cn("flex h-full w-full max-w-fit shadow")}
      >
        {shouldRender ? (
          <div id="page-wrapper" className="relative h-full w-full">
            {renderPageLayer({
              scale,
              pageIndex: virtualItem.index,
              rotate: 0,
            })}
          </div>
        ) : (
          // Placeholder to maintain layout during non-render states
          <div
            id="page-placeholder"
            className="relative h-full w-full bg-white"
          />
        )}
      </div>
    </div>
  );
};

export { MainPage };
