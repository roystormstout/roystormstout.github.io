import type { CSSProperties } from 'react';
import type { PinConfig } from './data';
import type { BoardSide, NoteLayout } from './types';

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
      className="pinboard-note absolute z-30 max-w-[calc(100%-0.75rem)] overflow-x-hidden overflow-y-auto p-5 sm:p-7"
      style={{
        left: note.x,
        top: note.y,
        width: note.width,
        height: note.height,
        color: '#3c3428',
        backgroundColor: isFilled ? '#e9e1d0' : '#e1d8c5',
        backgroundImage: 'radial-gradient(52% 40% at 16% 12%, rgba(120, 96, 60, 0.05), transparent 64%), radial-gradient(46% 38% at 84% 82%, rgba(120, 96, 60, 0.045), transparent 66%), repeating-linear-gradient(0deg, transparent 0 31px, rgba(86, 62, 36, 0.05) 32px)',
        border: '1px solid rgba(74, 58, 36, 0.22)',
        borderRadius: '4px 7px 3px 6px',
        boxShadow: '0 14px 30px rgba(28, 20, 10, 0.2), inset 0 1px 0 rgba(252, 248, 240, 0.3)',
        transform: `rotate(${noteRotations[side]})`,
        fontFamily: '"Inclusive Sans", sans-serif',
      }}
    >
      <span
        aria-hidden
        className="absolute left-1/2 top-0 h-7 w-32 -translate-x-1/2 -translate-y-1/2 rotate-[-2deg]"
        style={{ backgroundColor: 'rgba(222, 213, 195, 0.5)', boxShadow: '0 2px 6px rgba(40, 28, 14, 0.1)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-4 right-4 top-4 rounded"
        style={{
          height: dockHeight,
          border: isFilled ? '1px solid rgba(112, 70, 32, 0.12)' : '1px dashed rgba(112, 70, 32, 0.2)',
          backgroundColor: 'rgba(255, 246, 214, 0.06)',
        }}
      />
      {isFilled && pin && noteTextReady ? (
        <div key={`${side}-${pin.id}`} style={{ paddingTop: contentTop }}>
          <p className="note-sketch-item mb-2 flex flex-wrap gap-x-3 gap-y-1 text-xs font-bold uppercase tracking-[0.2em]" style={{ color: '#7a6446', '--note-delay': '0ms' } as CSSProperties}>
            <time>{pin.year}</time>
          </p>
          <h3 className="note-sketch-item note-sketch-title pr-10 text-2xl font-black leading-tight sm:text-3xl" style={{ '--note-delay': '120ms' } as CSSProperties}>{pin.title}</h3>
          <p className="note-sketch-item mt-2 text-base font-bold" style={{ color: '#6c5a40', '--note-delay': '240ms' } as CSSProperties}>{pin.subtitle}</p>
          <p className="note-sketch-item mt-4 text-base leading-relaxed" style={{ '--note-delay': '360ms' } as CSSProperties}>{pin.description}</p>
          <ul className="mt-4 space-y-2 text-base leading-snug">
            {pin.bullets.map((bullet, index) => (
              <li key={bullet} className="note-sketch-item flex gap-2" style={{ '--note-delay': `${480 + index * 110}ms` } as CSSProperties}>
                <span aria-hidden style={{ color: '#8a7350' }}>-</span>
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
              style={{ color: '#5e6d63', '--note-delay': `${560 + pin.bullets.length * 110}ms` } as CSSProperties}
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
          <p className="text-base font-semibold uppercase tracking-[0.16em] sm:text-lg" style={{ color: 'rgba(92, 76, 52, 0.55)' }}>Dock a pin here</p>
          <p className="mt-3 max-w-xs text-sm font-medium leading-relaxed" style={{ color: 'rgba(120, 102, 74, 0.55)' }}>Drop or tap a pin to open its story.</p>
        </div>
      )}
    </article>
  );
}