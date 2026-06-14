import type { BoardSide } from './types';

type PinboardHeaderProps = {
  activeSide: BoardSide;
  isFlipping: boolean;
  onFlip: () => void;
  onClose: () => void;
};

export default function PinboardHeader({ activeSide, isFlipping, onFlip, onClose }: PinboardHeaderProps) {
  return (
    <header className="relative z-40 flex items-center justify-between gap-4" style={{ fontFamily: '"Inclusive Sans", sans-serif' }}>
      <h2 className="text-sm sm:text-base font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--accent-amber)' }}>
        {activeSide === 'professional' ? 'Professional + Academia' : 'Hobby + College'}
      </h2>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onFlip}
          className="px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] transition-all duration-300 hover:-translate-y-0.5 disabled:cursor-default disabled:opacity-70"
          disabled={isFlipping}
          style={{ backgroundColor: 'rgba(83, 47, 25, 0.78)', borderColor: 'rgba(255, 210, 120, 0.65)' }}
        >
          {isFlipping ? 'Flipping' : activeSide === 'professional' ? 'Flip to Hobby' : 'Flip to Career'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] transition-all duration-300 hover:-translate-y-0.5"
          style={{ backgroundColor: 'rgba(11, 15, 20, 0.55)', borderColor: 'rgba(255, 210, 120, 0.55)' }}
        >
          Bio
        </button>
      </div>
    </header>
  );
}