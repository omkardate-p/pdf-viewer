import type { ReactNode } from "react";

import { VirtualItem } from "@tanstack/react-virtual";
import { DocumentProps } from "react-pdf";

export interface PDFPage {
  getViewport: (options: { scale: number; rotation: number }) => PageViewport;
}

export interface PageViewport {
  width: number;
  height: number;
}

export interface PDFDocument {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PDFPage>;
}

export interface ReaderProps {
  file: string;
  initialScale?: number;
  setReaderAPI: (readerAPI: ReaderAPI) => void;
  renderPage: RenderPage;
  reactPDFDocumentProps: DocumentProps;
  virtualizerOptions: { overscan: number };
}

export interface ReaderAPI {
  jumpToPage: (
    pageIndex: number,
    options: {
      align: "start" | "center" | "end" | "auto";
      behavior: "auto" | "smooth";
    },
  ) => void;
  jumpToHighlightArea: (area: HighlightArea) => void;
  jumpToOffset: (offset: number) => void;
  increaseZoom: (
    levels?: number,
    point?: { top: number; left: number },
  ) => void;
  decreaseZoom: (
    levels?: number,
    point?: { top: number; left: number },
  ) => void;
  zoomFitWidth: () => void;
  scale: number | undefined;
  getVirtualItemAndOffsetAt: (point: {
    top: number;
    left: number;
  }) => { index: number; percentageOffsetY: number } | null;
}

// height, left, top, width are 0-100% values
export interface HighlightArea {
  height: number;
  left: number;
  top: number;
  width: number;
  pageIndex: number;
}

export interface RenderPageProps {
  scale: number;
  pageIndex: number;
  rotate: number;
}

export type RenderPage = (props: RenderPageProps) => ReactNode;

export interface ReaderPageProps {
  scale: number | undefined;
  virtualItem: VirtualItem;
  shouldRender: boolean;
  renderPage: RenderPage;
}
