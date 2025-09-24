// Utility functions for PDF viewer

export const getOffsetForIndexAndPercentage = ({
  itemHeight,
  percentage,
  startOffset,
}: {
  itemHeight: number;
  percentage: number;
  startOffset: number;
}) => {
  const extraOffset = (itemHeight * percentage) / 100;
  return startOffset + extraOffset;
};

export const easeOutQuint = (t: number) => {
  return 1 - Math.pow(1 - t, 5);
};

export const getOffsetForIndexEager = (
  index: number,
  virtualizer: { options: { paddingStart: number; gap: number } },
  estimateSize: (i: number) => number,
) => {
  let offset = virtualizer.options.paddingStart;
  for (let i = 0; i < index; i++) {
    offset += estimateSize(i) + virtualizer.options.gap;
  }
  return offset;
};

export const getOffsetForHighlight = ({
  top,
  itemHeight,
  startOffset,
}: {
  top: number;
  itemHeight: number;
  startOffset: number;
}) => {
  // Simple implementation for highlight positioning
  const relativeOffset = (itemHeight * top) / 100;
  return startOffset + relativeOffset;
};
