import { Page, pdfjs } from "react-pdf";

import Reader from "./pdf-reader";
import Loader from "../../ui/loader";
import type { RenderPageProps, ReaderAPI } from "../types";

// Configure worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export const ReactPdfViewer = ({
  url,
  onReaderAPIReady,
}: {
  url: string;
  onReaderAPIReady?: (api: ReaderAPI) => void;
}) => {
  const handleReaderAPIReady = (api: ReaderAPI) => {
    onReaderAPIReady?.(api);
  };

  const renderPage = (props: RenderPageProps) => {
    return <Page {...props} />;
  };

  return (
    <div
      id="pdf-viewer-container"
      className="relative m-0 h-full w-full flex-1 overflow-hidden p-0"
    >
      <Reader
        file={url}
        // initialScale={1}
        renderPage={renderPage}
        setReaderAPI={handleReaderAPIReady}
        reactPDFDocumentProps={{ loading: LoadingComponent }}
        virtualizerOptions={{ overscan: 2 }}
      />
    </div>
  );
};

const LoadingComponent = () => {
  return <Loader invertcolor={true} size={30} />;
};
