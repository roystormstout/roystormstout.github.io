import type { CSSProperties } from 'react';
import type { BoardSide, NoteLayout, PinConfig } from './types';

type PinNoteProps = {
  side: BoardSide;
  isVisible: boolean;
  note: NoteLayout;
  pin: PinConfig | null;
  isFilled: boolean;
  noteTextReady: boolean;
  dockHeight: number;
  contentTop: number;
};

const noteRotations: Record<BoardSide, string> = {
  work: '-1deg',
  research: '0.5deg',
  play: '1deg',
};

export default function PinNote({ side, isVisible, note, pin, isFilled, noteTextReady, dockHeight, contentTop }: PinNoteProps) {
  if (!isVisible) return null;

  return (
    <article
      className="absolute z-30 max-w-[calc(100%-0.75rem)] overflow-x-hidden overflow-y-auto p-5 sm:p-7"
      style={{
        left: note.x,
        top: note.y,
        width: note.width,
        height: note.height,
        color: '#2d2015',
        backgroundColor: isFilled ? '#f3dfb2' : '#ead8ad',
        backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.3), transparent 42%), repeating-linear-gradient(0deg, transparent 0 30px, rgba(90, 60, 35, 0.08) 31px)',
        border: '1px solid rgba(84, 50, 25, 0.28)',
        borderRadius: 4,
        boxShadow: '0 18px 34px rgba(33, 18, 8, 0.3), inset 0 1px 0 rgba(255,255,255,0.55)',
        transform: `rotate(${noteRotations[side]})`,
        fontFamily: '"Inclusive Sans", sans-serif',
      }}
    >
      <span
        aria-hidden
        className="absolute left-1/2 top-0 h-7 w-32 -translate-x-1/2 -translate-y-1/2 rotate-[-2deg]"
        style={{ backgroundColor: 'rgba(226, 205, 151, 0.78)', boxShadow: '0 3px 8px rgba(47, 28, 13, 0.18)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-4 right-4 top-4 rounded"
        style={{
          height: dockHeight,
          border: isFilled ? '1px solid rgba(112, 70, 32, 0.16)' : '1px dashed rgba(112, 70, 32, 0.26)',
          backgroundColor: 'rgba(255, 246, 214, 0.1)',
        }}
      />
      {isFilled && pin && noteTextReady ? (
        <div key={`${side}-${pin.id}`} style={{ paddingTop: contentTop }}>
          <p className="note-sketch-item mb-2 flex flex-wrap gap-x-3 gap-y-1 text-xs font-bold uppercase tracking-[0.2em]" style={{ color: '#865225', '--note-delay': '0ms' } as CSSProperties}>
            <span>{pin.eyebrow}</span>
            <span aria-hidden>|</span>
            <time>{pin.year}</time>
          </p>
          <h3 className="note-sketch-item note-sketch-title pr-10 text-2xl font-black leading-tight sm:text-3xl" style={{ '--note-delay': '120ms' } as CSSProperties}>{pin.title}</h3>
          <p className="note-sketch-item mt-2 text-base font-bold" style={{ color: '#6f4729', '--note-delay': '240ms' } as CSSProperties}>{pin.subtitle}</p>
          <p className="note-sketch-item mt-4 text-base leading-relaxed" style={{ '--note-delay': '360ms' } as CSSProperties}>{pin.description}</p>
          <ul className="mt-4 space-y-2 text-base leading-snug">
            {pin.bullets.map((bullet, index) => (
              <li key={bullet} className="note-sketch-item flex gap-2" style={{ '--note-delay': `${480 + index * 110}ms` } as CSSProperties}>
                <span aria-hidden style={{ color: '#9c622d' }}>-</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
          {pin.link && (
            <a
              href={pin.link}
              target="_blank"
              rel="noopener noreferrer"
              className="note-link note-sketch-item mt-5 inline-block text-sm font-black uppercase tracking-[0.14em]"
              style={{ color: '#3c6b72', '--note-delay': `${560 + pin.bullets.length * 110}ms` } as CSSProperties}
            >
              {pin.linkLabel || 'Open link'}
            </a>
          )}
        </div>
      ) : isFilled ? null : (
        <div
          className="absolute left-4 right-4 top-4 flex flex-col items-center justify-center text-center"
          style={{ height: dockHeight }}
        >
          <p className="text-2xl font-black leading-tight sm:text-3xl" style={{ color: 'rgba(95, 58, 29, 0.56)' }}>Dock a pin here</p>
          <p className="mt-3 max-w-xs text-base font-bold leading-relaxed" style={{ color: 'rgba(135, 97, 59, 0.58)' }}>Drop or tap a pin to open its story.</p>
        </div>
      )}
    </article>
  );
}