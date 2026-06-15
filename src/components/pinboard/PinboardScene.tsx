import type { ReactNode, RefObject } from 'react';
import type { BoardSide, BoardTransition } from './types';

type PinboardSceneProps = {
  activeSide: BoardSide;
  isSwitching: boolean;
  isResetting: boolean;
  transition: BoardTransition | null;
  boardRef: RefObject<HTMLDivElement | null>;
  children: ReactNode;
};

export default function PinboardScene({ activeSide, isSwitching, isResetting, transition, boardRef, children }: PinboardSceneProps) {
  const baseRotation = activeSide === 'research' ? -0.25 : activeSide === 'play' ? 0.25 : 0;
  const switchRotation = isSwitching && transition ? transition.direction * -180 : 0;
  const sweepGradient = transition?.direction === -1
    ? 'linear-gradient(90deg, rgba(0, 0, 0, 0.44), transparent 42%, rgba(255, 229, 166, 0.08))'
    : 'linear-gradient(270deg, rgba(0, 0, 0, 0.44), transparent 42%, rgba(255, 229, 166, 0.08))';

  return (
    <div className="absolute inset-3 top-20 sm:inset-5 sm:top-16" style={{ perspective: '1700px' }}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-300"
        style={{ opacity: isSwitching ? 0.38 : 0, background: sweepGradient, borderRadius: 8 }}
      />
      <div
        ref={boardRef}
        className={isResetting ? 'relative h-full w-full' : 'relative h-full w-full transition-transform duration-[900ms] ease-out'}
        style={{
          transform: `rotate(${baseRotation}deg) rotateY(${switchRotation}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {children}
      </div>
    </div>
  );
}