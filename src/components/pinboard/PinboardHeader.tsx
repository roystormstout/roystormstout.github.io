import { boardLabels, boardSides, type BoardSide } from './types';

type PinboardHeaderProps = {
  activeSide: BoardSide;
  isSwitching: boolean;
  onSelectBoard: (side: BoardSide) => void;
  onClose: () => void;
};

export default function PinboardHeader({ activeSide, isSwitching, onSelectBoard, onClose }: PinboardHeaderProps) {
  return (
    <header className="relative z-40 flex flex-wrap items-center justify-between gap-4" style={{ fontFamily: '"Inclusive Sans", sans-serif' }}>
      <div className="board-tab-strip" aria-label="Select pinboard">
        {boardSides.map((side) => {
          const isActive = side === activeSide;

          return (
            <button
              key={side}
              type="button"
              onClick={() => onSelectBoard(side)}
              className="board-tab"
              data-active={isActive}
              disabled={isSwitching || isActive}
              aria-pressed={isActive}
            >
              {boardLabels[side]}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="board-tab board-tab-bio"
        aria-keyshortcuts="Escape"
      >
        Bio
      </button>
    </header>
  );
}