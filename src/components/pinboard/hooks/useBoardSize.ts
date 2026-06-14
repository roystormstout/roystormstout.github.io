import { useEffect, useState, type RefObject } from 'react';

type BoardSize = {
  width: number;
  height: number;
};

export default function useBoardSize(ref: RefObject<HTMLElement | null>): BoardSize {
  const [boardSize, setBoardSize] = useState<BoardSize>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    function updateSize() {
      if (!element) return;
      const rect = element.getBoundingClientRect();
      setBoardSize({ width: rect.width, height: rect.height });
    }

    updateSize();

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(element);
    window.addEventListener('resize', updateSize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, [ref]);

  return boardSize;
}