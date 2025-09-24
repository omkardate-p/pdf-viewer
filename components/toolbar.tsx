import { useState, useEffect, memo } from "react";

import {
  MaximizeIcon,
  MoveHorizontalIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "lucide-react";

import Tooltip from "../../ui/tooltip";
import type { ReaderAPI } from "../types";

interface ToolbarProps {
  readerAPI: ReaderAPI | null;
  onMaximize?: () => void;
}

const Toolbar = ({ readerAPI, onMaximize }: ToolbarProps) => {
  const [currentZoom, setCurrentZoom] = useState<number>(100);

  useEffect(() => {
    if (readerAPI?.scale) {
      const newZoom = Math.round(readerAPI.scale * 100);
      setCurrentZoom(newZoom);
    }
  }, [readerAPI?.scale]);

  const handleZoomIn = () => {
    if (!readerAPI) return;
    readerAPI.increaseZoom();
  };

  const handleZoomOut = () => {
    if (!readerAPI) return;
    readerAPI.decreaseZoom();
  };

  const handleZoomFitWidth = () => {
    if (!readerAPI) return;
    readerAPI.zoomFitWidth();
  };

  return (
    <div className="absolute top-3 left-3 hidden items-center gap-1 rounded bg-white shadow-sm group-hover:flex focus:outline-none">
      <Tooltip text="Zoom Out" position="bottom">
        <button
          onClick={handleZoomOut}
          disabled={!readerAPI}
          className="flex cursor-pointer items-center justify-center rounded p-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ZoomOutIcon className="size-4 stroke-[#404040]" />
        </button>
      </Tooltip>

      <div className="flex min-w-[2.5rem] items-center justify-center px-2 font-mono text-xs text-[#404040]">
        {currentZoom}%
      </div>

      <Tooltip text="Zoom In" position="bottom">
        <button
          onClick={handleZoomIn}
          disabled={!readerAPI}
          className="flex cursor-pointer items-center justify-center rounded p-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ZoomInIcon className="size-4 stroke-[#404040]" />
        </button>
      </Tooltip>

      <div className="h-4 w-px rounded bg-[#404040]" />

      <Tooltip text="Fit to Width" position="bottom">
        <button
          onClick={handleZoomFitWidth}
          disabled={!readerAPI}
          className="flex cursor-pointer items-center justify-center rounded p-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          <MoveHorizontalIcon className="size-4 stroke-[#404040]" />
        </button>
      </Tooltip>

      <div className="h-4 w-px rounded bg-[#404040]" />

      <Tooltip text="Full Screen" position="bottom">
        <button
          onClick={onMaximize}
          disabled={!onMaximize}
          className="flex cursor-pointer items-center justify-center rounded p-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          <MaximizeIcon className="size-4 stroke-[#404040]" />
        </button>
      </Tooltip>
    </div>
  );
};

export default memo(Toolbar);
