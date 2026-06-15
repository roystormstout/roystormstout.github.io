import type { ReactNode } from 'react';
import { boardLabels, type BoardSide } from './types';
import type { BoardTransition } from './types';

type BoardFaceProps = {
  side: BoardSide;
  activeSide: BoardSide;
  isSwitching: boolean;
  transition: BoardTransition | null;
  nextSide: BoardSide;
  onFlipBoard: () => void;
  children: ReactNode;
};

const faceStyles: Record<BoardSide, {
  backgroundColor: string;
  backgroundImage: string;
  boxShadow: string;
  frameColor: string;
  frameHighlight: string;
  innerShadow: string;
}> = {
  work: {
    backgroundColor: '#8a5432',
    backgroundImage: `
      repeating-linear-gradient(8deg, rgba(255,255,255,0.045) 0 1px, transparent 1px 13px),
      repeating-linear-gradient(97deg, rgba(55,24,10,0.12) 0 1px, transparent 1px 17px),
      linear-gradient(72deg, rgba(255, 232, 184, 0.08), transparent 28%, rgba(45, 20, 8, 0.16) 64%, transparent 100%),
      linear-gradient(115deg, rgba(255, 229, 166, 0.14), transparent 34%),
      linear-gradient(135deg, #9b623a 0%, #70401f 46%, #5c331c 100%)
    `,
    boxShadow: '0 28px 70px rgba(0, 0, 0, 0.55), inset 0 0 70px rgba(45, 22, 10, 0.58), inset 0 2px 0 rgba(255, 240, 190, 0.18)',
    frameColor: '#3a2114',
    frameHighlight: 'rgba(255, 214, 143, 0.2)',
    innerShadow: 'inset 8px 10px 28px rgba(0, 0, 0, 0.18), inset -5px -4px 20px rgba(255, 228, 168, 0.08)',
  },
  research: {
    backgroundColor: '#80553a',
    backgroundImage: `
      repeating-linear-gradient(-6deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 14px),
      repeating-linear-gradient(84deg, rgba(47,25,12,0.13) 0 1px, transparent 1px 18px),
      linear-gradient(68deg, rgba(238, 219, 168, 0.12), transparent 31%, rgba(34, 24, 13, 0.18) 72%, transparent 100%),
      linear-gradient(132deg, #91613f 0%, #6b472d 48%, #4f301f 100%)
    `,
    boxShadow: '0 28px 70px rgba(0, 0, 0, 0.55), inset 0 0 74px rgba(38, 24, 12, 0.58), inset 0 2px 0 rgba(244, 229, 181, 0.16)',
    frameColor: '#342618',
    frameHighlight: 'rgba(244, 222, 169, 0.19)',
    innerShadow: 'inset 8px 10px 30px rgba(0, 0, 0, 0.2), inset -6px -5px 22px rgba(243, 226, 184, 0.07)',
  },
  play: {
    backgroundColor: '#84503a',
    backgroundImage: `
      repeating-linear-gradient(-10deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 12px),
      repeating-linear-gradient(78deg, rgba(52,21,12,0.13) 0 1px, transparent 1px 16px),
      linear-gradient(70deg, rgba(255, 208, 144, 0.1), transparent 32%, rgba(36, 15, 10, 0.16) 68%, transparent 100%),
      linear-gradient(135deg, #9a644a 0%, #71432e 46%, #552d1f 100%)
    `,
    boxShadow: '0 28px 70px rgba(0, 0, 0, 0.55), inset 0 0 70px rgba(42, 18, 12, 0.56), inset 0 2px 0 rgba(255, 226, 188, 0.14)',
    frameColor: '#321b16',
    frameHighlight: 'rgba(255, 206, 168, 0.18)',
    innerShadow: 'inset 7px 10px 30px rgba(0, 0, 0, 0.2), inset -6px -5px 22px rgba(255, 216, 180, 0.08)',
  },
};

const titleNoteRotations: Record<BoardSide, string> = {
  work: '-2.5deg',
  research: '1.5deg',
  play: '-1.25deg',
};

export default function BoardFace({ side, activeSide, isSwitching, transition, nextSide, onFlipBoard, children }: BoardFaceProps) {
  const isActive = activeSide === side;
  const isTransitionOutgoing = isSwitching && transition?.fromSide === side;
  const isTransitionIncoming = isSwitching && transition?.toSide === side;
  const faceStyle = faceStyles[side];
  const transitionDirection = transition?.direction || 1;
  const isVisible = isActive || isTransitionOutgoing || isTransitionIncoming;
  const faceTransform = isTransitionIncoming ? `rotateY(${transitionDirection * 180}deg)` : 'rotateY(0deg)';

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      aria-hidden={!isActive}
      style={{
        borderRadius: 8,
        opacity: isVisible ? 1 : 0,
        transform: faceTransform,
        zIndex: isTransitionOutgoing ? 3 : isTransitionIncoming ? 2 : isActive ? 3 : 1,
        backgroundColor: faceStyle.backgroundColor,
        backgroundImage: faceStyle.backgroundImage,
        boxShadow: faceStyle.boxShadow,
        pointerEvents: isActive && !isSwitching ? 'auto' : 'none',
        transformOrigin: 'center center',
        backfaceVisibility: 'hidden',
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[60] transition-opacity duration-300"
        style={{
          opacity: isTransitionOutgoing ? 0.16 : 0,
          background: transitionDirection < 0
            ? 'linear-gradient(90deg, rgba(0,0,0,0.35), transparent 38%)'
            : 'linear-gradient(270deg, rgba(0,0,0,0.35), transparent 38%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          border: `clamp(12px, 2vw, 24px) solid ${faceStyle.frameColor}`,
          boxShadow: `inset 0 0 0 1px ${faceStyle.frameHighlight}, inset 0 0 30px rgba(0, 0, 0, 0.42)`,
        }}
      />
      <div
        className="pointer-events-none absolute inset-[clamp(12px,2vw,24px)]"
        style={{
          boxShadow: faceStyle.innerShadow,
        }}
      />
      <h2
        className="board-title-note pointer-events-none absolute left-6 top-6 z-[35] sm:left-10 sm:top-9"
        style={{ transform: `rotate(${titleNoteRotations[side]})` }}
      >
        {boardLabels[side]}
      </h2>
      {isActive && !isSwitching && (
        <button
          type="button"
          className="board-flip-button absolute right-5 top-6 z-[38] sm:right-9 sm:top-9"
          onClick={onFlipBoard}
          disabled={isSwitching}
          aria-label={`Flip to ${boardLabels[nextSide]}`}
        >
          <span>Next</span>
          <strong>{boardLabels[nextSide]}</strong>
        </button>
      )}
      {children}
    </div>
  );
}