import { useEffect, useState } from "react";

import { Virtualizer } from "@tanstack/react-virtual";

const useVirtualizerVelocity = ({
  virtualizer,
  estimateSize,
}: {
  virtualizer: Virtualizer<HTMLDivElement, Element> | null;
  estimateSize: (index: number) => number;
}) => {
  const [lastScrollOffset, setLastScrollOffset] = useState<number>(0);
  const [normalizedVelocity, setNormalizedVelocity] = useState<number>(0);

  useEffect(() => {
    if (!virtualizer) return;
    const interval = setInterval(() => {
      const currentScrollOffset = virtualizer.scrollOffset;
      if (currentScrollOffset == null) {
        return;
      }
      const newVelocity = currentScrollOffset - lastScrollOffset;
      setNormalizedVelocity(newVelocity / estimateSize(0));
      setLastScrollOffset(currentScrollOffset);
    }, 50);
    return () => clearInterval(interval);
  }, [lastScrollOffset, virtualizer, estimateSize]);

  return { normalizedVelocity };
};

export default useVirtualizerVelocity;
