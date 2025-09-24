import { useCallback, useRef } from "react";

const ZOOM_LEVELS = [
  0.5, 0.7, 0.8, 0.9, 1, 1.1, 1.2, 1.3, 1.5, 1.7, 2, 2.5, 3, 3.5, 4,
  // 50, 70, 80, 90, 100, 110, 120, 130, 150, 170, 200, 250, 300, 350, 400,
];

const useZoom = ({
  scale,
  defaultScale,
  setScale,
}: {
  scale: number | undefined;
  defaultScale: number | null;
  setScale: (newScale: number) => void;
}) => {
  const zoomTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setScaleDebounced = useCallback(
    (newScale: number) => {
      if (zoomTimeoutRef.current) {
        clearTimeout(zoomTimeoutRef.current);
      }

      setScale(newScale);

      zoomTimeoutRef.current = setTimeout(() => {
        zoomTimeoutRef.current = null;
      }, 100);
    },
    [setScale],
  );

  const increaseZoom = useCallback(
    (levels = 1) => {
      if (!scale) return;
      const currentIndex = ZOOM_LEVELS.findIndex((level) => level >= scale);
      const nextIndex =
        currentIndex + levels < ZOOM_LEVELS.length
          ? currentIndex + levels
          : ZOOM_LEVELS.length - 1;
      const nextScale = ZOOM_LEVELS[nextIndex];

      setScaleDebounced(nextScale);
    },
    [scale, setScaleDebounced],
  );

  const decreaseZoom = useCallback(
    (levels = 1) => {
      if (!scale) return;
      const currentIndex = ZOOM_LEVELS.findIndex((level) => level >= scale);
      const prevIndex = currentIndex - levels >= 0 ? currentIndex - levels : 0;
      const nextScale = ZOOM_LEVELS[prevIndex];
      setScaleDebounced(nextScale);
    },
    [scale, setScaleDebounced],
  );

  const zoomFitWidth = useCallback(() => {
    if (!defaultScale) return;
    setScaleDebounced(defaultScale);
  }, [defaultScale, setScaleDebounced]);

  return { increaseZoom, decreaseZoom, zoomFitWidth };
};

export default useZoom;
