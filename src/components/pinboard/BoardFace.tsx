import type { ReactNode } from 'react';
import type { BoardSide } from './types';

type BoardFaceProps = {
  side: BoardSide;
  activeSide: BoardSide;
  isFlipping: boolean;
  children: ReactNode;
};

const faceCopy: Record<BoardSide, string> = {
  professional: 'Professional + Academia',
  hobby: 'Hobby + College',
};

export default function BoardFace({ side, activeSide, isFlipping, children }: BoardFaceProps) {
  const isProfessional = side === 'professional';
  const isActive = activeSide === side;

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      aria-hidden={!isActive}
      style={{
        borderRadius: 8,
        backfaceVisibility: 'hidden',
        transform: isProfessional ? undefined : 'rotateY(180deg)',
        backgroundColor: isProfessional ? '#8a5432' : '#84503a',
        backgroundImage: isProfessional
          ? `
            repeating-linear-gradient(8deg, rgba(255,255,255,0.045) 0 1px, transparent 1px 13px),
            repeating-linear-gradient(97deg, rgba(55,24,10,0.12) 0 1px, transparent 1px 17px),
            linear-gradient(72deg, rgba(255, 232, 184, 0.08), transparent 28%, rgba(45, 20, 8, 0.16) 64%, transparent 100%),
            linear-gradient(115deg, rgba(255, 229, 166, 0.14), transparent 34%),
            linear-gradient(135deg, #9b623a 0%, #70401f 46%, #5c331c 100%)
          `
          : `
            repeating-linear-gradient(-10deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 12px),
            repeating-linear-gradient(78deg, rgba(52,21,12,0.13) 0 1px, transparent 1px 16px),
            linear-gradient(70deg, rgba(255, 208, 144, 0.1), transparent 32%, rgba(36, 15, 10, 0.16) 68%, transparent 100%),
            linear-gradient(135deg, #9a644a 0%, #71432e 46%, #552d1f 100%)
          `,
        boxShadow: isProfessional
          ? '0 28px 70px rgba(0, 0, 0, 0.55), inset 0 0 70px rgba(45, 22, 10, 0.58), inset 0 2px 0 rgba(255, 240, 190, 0.18)'
          : '0 28px 70px rgba(0, 0, 0, 0.55), inset 0 0 70px rgba(42, 18, 12, 0.56), inset 0 2px 0 rgba(255, 226, 188, 0.14)',
        pointerEvents: isActive && !isFlipping ? 'auto' : 'none',
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          border: `clamp(12px, 2vw, 24px) solid ${isProfessional ? '#3a2114' : '#321b16'}`,
          boxShadow: `inset 0 0 0 1px ${isProfessional ? 'rgba(255, 214, 143, 0.2)' : 'rgba(255, 206, 168, 0.18)'}, inset 0 0 30px rgba(0, 0, 0, 0.42)`,
        }}
      />
      <div
        className="pointer-events-none absolute inset-[clamp(12px,2vw,24px)]"
        style={{
          boxShadow: isProfessional
            ? 'inset 8px 10px 28px rgba(0, 0, 0, 0.18), inset -5px -4px 20px rgba(255, 228, 168, 0.08)'
            : 'inset 7px 10px 30px rgba(0, 0, 0, 0.2), inset -6px -5px 22px rgba(255, 216, 180, 0.08)',
        }}
      />
      <div
        className="pointer-events-none absolute left-8 top-8 z-10 text-xs font-bold uppercase tracking-[0.16em] sm:left-12 sm:top-10"
        style={{ color: isProfessional ? 'rgba(255, 236, 188, 0.68)' : 'rgba(255, 228, 203, 0.7)', fontFamily: '"Inclusive Sans", sans-serif' }}
      >
        {faceCopy[side]}
      </div>
      {children}
    </div>
  );
}