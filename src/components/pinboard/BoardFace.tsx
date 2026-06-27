import type { ReactNode } from 'react';
import { boardLabels, boardSides, type BoardSide } from './types';
import type { BoardTransition } from './types';

type BoardFaceProps = {
  side: BoardSide;
  activeSide: BoardSide;
  isSwitching: boolean;
  transition: BoardTransition | null;
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
    backgroundColor: '#6b5743',
    backgroundImage: `
      radial-gradient(40% 32% at 22% 20%, rgba(34, 24, 14, 0.12), transparent 70%),
      radial-gradient(34% 26% at 80% 74%, rgba(36, 26, 16, 0.1), transparent 72%),
      repeating-linear-gradient(7deg, rgba(232, 222, 200, 0.016) 0 1px, transparent 1px 19px),
      repeating-linear-gradient(99deg, rgba(28, 19, 10, 0.04) 0 1px, transparent 1px 23px),
      linear-gradient(135deg, #6f5b46 0%, #574734 52%, #453829 100%)
    `,
    boxShadow: '0 18px 50px rgba(0, 0, 0, 0.36), inset 0 0 100px rgba(32, 23, 13, 0.4)',
    frameColor: '#3b3125',
    frameHighlight: 'rgba(214, 198, 166, 0.1)',
    innerShadow: 'inset 5px 7px 26px rgba(0, 0, 0, 0.13), inset -4px -3px 18px rgba(228, 214, 180, 0.035)',
  },
  research: {
    backgroundColor: '#675847',
    backgroundImage: `
      radial-gradient(38% 30% at 20% 78%, rgba(32, 24, 15, 0.12), transparent 70%),
      radial-gradient(32% 26% at 82% 22%, rgba(34, 26, 17, 0.09), transparent 72%),
      repeating-linear-gradient(-5deg, rgba(232, 224, 204, 0.014) 0 1px, transparent 1px 20px),
      repeating-linear-gradient(86deg, rgba(26, 18, 11, 0.04) 0 1px, transparent 1px 24px),
      linear-gradient(132deg, #6a5b48 0%, #534636 52%, #423629 100%)
    `,
    boxShadow: '0 18px 50px rgba(0, 0, 0, 0.36), inset 0 0 104px rgba(28, 21, 13, 0.4)',
    frameColor: '#383023',
    frameHighlight: 'rgba(212, 198, 168, 0.09)',
    innerShadow: 'inset 5px 7px 28px rgba(0, 0, 0, 0.15), inset -5px -4px 20px rgba(226, 214, 184, 0.03)',
  },
  play: {
    backgroundColor: '#6d5742',
    backgroundImage: `
      radial-gradient(40% 30% at 24% 76%, rgba(34, 23, 14, 0.12), transparent 70%),
      radial-gradient(32% 26% at 78% 24%, rgba(36, 25, 16, 0.09), transparent 72%),
      repeating-linear-gradient(-9deg, rgba(233, 223, 201, 0.014) 0 1px, transparent 1px 18px),
      repeating-linear-gradient(80deg, rgba(28, 18, 10, 0.04) 0 1px, transparent 1px 22px),
      linear-gradient(135deg, #715b45 0%, #564631 50%, #443728 100%)
    `,
    boxShadow: '0 18px 50px rgba(0, 0, 0, 0.36), inset 0 0 100px rgba(32, 22, 13, 0.38)',
    frameColor: '#3a2f23',
    frameHighlight: 'rgba(216, 196, 166, 0.09)',
    innerShadow: 'inset 5px 7px 28px rgba(0, 0, 0, 0.15), inset -5px -4px 20px rgba(228, 212, 180, 0.035)',
  },
};

const titleNoteRotations: Record<BoardSide, string> = {
  work: '-2.5deg',
  research: '1.5deg',
  play: '-1.25deg',
};

export default function BoardFace({ side, activeSide, isSwitching, transition, onFlipBoard, children }: BoardFaceProps) {
  const isActive = activeSide === side;
  const isTransitionOutgoing = isSwitching && transition?.fromSide === side;
  const isTransitionIncoming = isSwitching && transition?.toSide === side;
  const faceStyle = faceStyles[side];
  const transitionDirection = transition?.direction || 1;
  const isVisible = isActive || isTransitionOutgoing || isTransitionIncoming;
  const faceTransform = isTransitionIncoming ? `rotateY(${transitionDirection * 180}deg)` : 'rotateY(0deg)';
  const faceNextSide = boardSides[(boardSides.indexOf(side) + 1) % boardSides.length];

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
        willChange: isSwitching && isVisible ? 'transform' : 'auto',
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
          border: `clamp(9px, 1.5vw, 16px) solid ${faceStyle.frameColor}`,
          boxShadow: `inset 0 0 0 1px ${faceStyle.frameHighlight}, inset 0 0 24px rgba(0, 0, 0, 0.3)`,
        }}
      />
      <div
        className="pointer-events-none absolute inset-[clamp(9px,1.5vw,16px)]"
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
      {isVisible && (
        <button
          type="button"
          className="board-flip-button absolute right-5 top-6 z-[38] sm:right-9 sm:top-9"
          onClick={onFlipBoard}
          disabled={isSwitching || !isActive}
          aria-keyshortcuts="ArrowRight D"
          aria-label={`Flip to ${boardLabels[faceNextSide]}`}
        >
          <span>Next</span>
          <strong>{boardLabels[faceNextSide]}</strong>
        </button>
      )}
      {children}
    </div>
  );
}