import type { ReactNode, RefObject } from 'react';
import type { BoardSide } from './types';

type PinboardSceneProps = {
  activeSide: BoardSide;
  boardRef: RefObject<HTMLDivElement | null>;
  children: ReactNode;
};

export default function PinboardScene({ activeSide, boardRef, children }: PinboardSceneProps) {
  return (
    <div className="absolute inset-3 top-20 sm:inset-5 sm:top-16">
      <div
        ref={boardRef}
        className="relative h-full w-full transition-transform duration-[900ms] ease-out"
        style={{
          transform: activeSide === 'research' ? 'rotate(-0.25deg)' : activeSide === 'play' ? 'rotate(0.25deg)' : 'rotate(0deg)',
        }}
      >
        {children}
      </div>
    </div>
  );
}