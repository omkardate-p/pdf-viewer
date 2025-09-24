import { memo, useEffect, useRef } from "react";

import Image from "next/image";

import { useOutsideClick } from "@/app/hooks/useOutsideClick";
import PdfIcon from "@/public/icons/pdf-icon.svg";

import { ReactPdfViewer } from "./react-pdf-viewer";
import { CrossBtn } from "../../ui/cross-btn";

interface FullScreenModalProps {
  doc: { url: string; fileName: string } | null;
  onClose: (doc: { url: string; fileName: string } | null) => void;
}

const FullScreenModal = ({ doc, onClose }: FullScreenModalProps) => {
  const modalContentRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  // Handle outside click to close modal
  useOutsideClick(modalContentRef, [headerRef], () => {
    onClose(null);
  });

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose(null);
      }
    };

    if (doc) {
      // Only run this effect in the browser
      if (typeof document === "undefined") return;

      document.addEventListener("keydown", handleKeyDown);
      return () => document?.removeEventListener("keydown", handleKeyDown);
    }
  }, [doc, onClose]);

  const { url, fileName } = doc || {};

  if (!url) return null;

  return (
    <div className="fixed top-0 left-0 z-[51] flex h-full w-full flex-row items-center justify-center gap-2 bg-black/50 backdrop-blur-lg transition-opacity duration-200">
      <div
        id="_header"
        ref={headerRef}
        className={`absolute top-0 right-0 left-0 z-20 flex h-[71px] items-center justify-between bg-black transition-colors duration-200`}
      >
        <div className="relative left-6 flex h-full items-center gap-2">
          <Image
            src={PdfIcon}
            className=""
            alt="file-2"
            width={18}
            height={18}
          />
          <span className="text-sm font-medium text-[#F3F3F3]">
            {fileName || "File"}
          </span>
        </div>
        <div
          className="relative right-6 cursor-pointer"
          onClick={() => onClose(null)}
        >
          <CrossBtn dark={true} />
        </div>
      </div>
      <div
        ref={modalContentRef}
        className="absolute top-[71px] flex h-[calc(100dvh-71px)] w-full max-w-4xl flex-col overflow-hidden bg-white shadow-2xl"
      >
        <div className="flex-1 overflow-hidden">
          <ReactPdfViewer url={url} />
        </div>
      </div>
    </div>
  );
};

export default memo(FullScreenModal);
