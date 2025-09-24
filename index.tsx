import { type FC, useState } from "react";

// Import required CSS
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

import FullScreenModal from "./components/full-screen-modal";
import { ReactPdfViewer } from "./components/react-pdf-viewer";
import Toolbar from "./components/toolbar";
import type { ReaderAPI } from "./types";

interface PDFViewerProps {
  url: string;
  title?: string;
}

const PDFViewer: FC<PDFViewerProps> = ({ url, title }) => {
  const [fullScreenModalDetails, setFullScreenModalDetails] = useState(false);
  const [readerAPI, setReaderAPI] = useState<ReaderAPI | null>(null);

  return (
    <>
      <div className="group m-0 flex h-full w-full p-0" id="pdf-viewer">
        <div id="pdf-render-container" className="h-full w-full">
          <ReactPdfViewer url={url} onReaderAPIReady={setReaderAPI} />
        </div>

        <Toolbar
          readerAPI={readerAPI}
          onMaximize={() => setFullScreenModalDetails(true)}
        />
      </div>

      {fullScreenModalDetails && (
        <FullScreenModal
          doc={{
            url: url,
            fileName: title || "Document.pdf",
          }}
          onClose={() => setFullScreenModalDetails(false)}
        />
      )}
    </>
  );
};

export default PDFViewer;
