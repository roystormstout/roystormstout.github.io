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
      <h2 className="text-sm sm:text-base font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--accent-amber)' }}>
        {boardLabels[activeSide]}
      </h2>
      <div className="flex flex-wrap items-center justify-end gap-2">
        <div className="flex flex-wrap items-center gap-1.5" aria-label="Select pinboard">
          {boardSides.map((side) => {
            const isActive = side === activeSide;

            return (
              <button
                key={side}
                type="button"
                onClick={() => onSelectBoard(side)}
                className="border px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] transition-all duration-300 hover:-translate-y-0.5 disabled:cursor-default disabled:opacity-70 sm:px-4"
                disabled={isSwitching || isActive}
                aria-pressed={isActive}
                style={{
                  color: isActive ? '#1f160f' : 'var(--text-primary)',
                  backgroundColor: isActive ? 'var(--accent-amber)' : 'rgba(83, 47, 25, 0.78)',
                  borderColor: isActive ? 'rgba(255, 235, 176, 0.9)' : 'rgba(255, 210, 120, 0.55)',
                }}
              >
                {boardLabels[side]}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="border px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] transition-all duration-300 hover:-translate-y-0.5"
          style={{ backgroundColor: 'rgba(11, 15, 20, 0.55)', borderColor: 'rgba(255, 210, 120, 0.55)' }}
        >
          Bio
        </button>
      </div>
    </header>
  );
}