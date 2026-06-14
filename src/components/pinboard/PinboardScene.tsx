import type { ReactNode, RefObject } from 'react';
import type { BoardSide } from './types';

type PinboardSceneProps = {
  activeSide: BoardSide;
  boardRef: RefObject<HTMLDivElement | null>;
  children: ReactNode;
};

export default function PinboardScene({ activeSide, boardRef, children }: PinboardSceneProps) {
  return (
    <div className="absolute inset-3 top-12 sm:inset-5 sm:top-14" style={{ perspective: '1600px' }}>
      <div
        ref={boardRef}
        className="relative h-full w-full transition-transform duration-[900ms] ease-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: activeSide === 'hobby' ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {children}
      </div>
    </div>
  );
}