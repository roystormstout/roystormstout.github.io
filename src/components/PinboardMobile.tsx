import { useState } from 'react';
import './pinboard/Pinboard.css';
import { boardPins, type PinConfig } from './pinboard/data';
import { boardLabels, boardSides, type BoardSide } from './pinboard/types';

type PinboardMobileProps = {
  onClose: () => void;
};

const mobileTabLabels: Record<BoardSide, string> = {
  work: 'Work',
  research: 'Research',
  play: 'Games',
};

// Newest-first: use the latest 4-digit year in the label; treat "Present" as ongoing.
function recencyKey(year: string): number {
  if (/present/i.test(year)) return Number.POSITIVE_INFINITY;
  const matches = year.match(/\d{4}/g);
  if (!matches) return 0;
  return Math.max(...matches.map(Number));
}

function sortNewestFirst(pins: readonly PinConfig[]): PinConfig[] {
  return [...pins].sort((a, b) => recencyKey(b.year) - recencyKey(a.year));
}

function PinCard({ pin }: { pin: PinConfig }) {
  return (
    <article className="pin-card">
      <div className="pin-card-badge">
        <picture>
          <source type="image/avif" srcSet={pin.image.avifSrcSet} sizes={pin.image.sizes} />
          <source type="image/webp" srcSet={pin.image.webpSrcSet} sizes={pin.image.sizes} />
          <img src={pin.image.src} alt="" aria-hidden draggable={false} loading="lazy" decoding="async" />
        </picture>
      </div>
      <div className="pin-card-note">
        <p className="pin-card-eyebrow">
          <time>{pin.year}</time>
        </p>
        <h3 className="pin-card-title">{pin.title}</h3>
        <p className="pin-card-subtitle">{pin.subtitle}</p>
        <p className="pin-card-desc">{pin.description}</p>
        <ul className="pin-card-bullets">
          {pin.bullets.map((bullet) => (
            <li key={bullet}>
              <span aria-hidden>–</span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
        {pin.link && (
          <a
            href={pin.link}
            target="_blank"
            rel="noopener noreferrer"
            className="pin-card-link"
          >
            {pin.linkLabel || 'Open link'}
          </a>
        )}
      </div>
    </article>
  );
}

export default function PinboardMobile({ onClose }: PinboardMobileProps) {
  const [activeSide, setActiveSide] = useState<BoardSide>('work');
  const pins = sortNewestFirst(boardPins[activeSide]);

  return (
    <section className="pinboard-mobile" id="pinboard">
      <header className="pinboard-mobile-bar">
        <div className="board-tab-strip" aria-label="Select pinboard">
          {boardSides.map((side) => (
            <button
              key={side}
              type="button"
              className="board-tab"
              data-active={side === activeSide}
              aria-pressed={side === activeSide}
              onClick={() => setActiveSide(side)}
            >
              {mobileTabLabels[side]}
            </button>
          ))}
        </div>
        <button type="button" className="board-tab board-tab-bio" onClick={onClose}>
          Bio
        </button>
      </header>

      <div className="pinboard-mobile-scroll">
        <div className="pinboard-mobile-board">
          <h2 className="board-title-note pinboard-mobile-title">{boardLabels[activeSide]}</h2>
          <div key={activeSide} className="pin-card-stack">
            {pins.map((pin) => (
              <PinCard key={pin.id} pin={pin} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
