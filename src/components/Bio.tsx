import { useEffect, useRef, useState } from 'react';
import usePrefersReducedMotion from './pinboard/hooks/usePrefersReducedMotion';

const MOBILE_BREAKPOINT = 768;

type BioProps = {
  onOpenPinboard: () => void;
  onPreloadPinboard: () => void;
};

export default function Bio({ onOpenPinboard, onPreloadPinboard }: BioProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const lastMouse = useRef<{ x: number; y: number } | null>(null);
  const rafId = useRef<number | null>(null);
  const mobileQuery = `(max-width: ${MOBILE_BREAKPOINT}px)`;
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(mobileQuery).matches);
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    const mediaQuery = window.matchMedia(mobileQuery);
    const handleChange = (event: MediaQueryListEvent) => setIsMobile(event.matches);

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mobileQuery]);

  useEffect(() => {
    if (isMobile || reduceMotion) return;

    const el = contentRef.current;
    function applyShadow(clientX: number, clientY: number) {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      const dx = clientX - cx;
      const dy = clientY - cy;

      const scale = 0.03;
      const ox = -Math.round(dx * scale);
      const oy = -Math.round(dy * scale);

      const shadows = [
        `${ox}px ${oy}px 2px rgba(255,210,120,0.95)`,
        `${Math.round(ox * 1.7)}px ${Math.round(oy * 1.7)}px 8px rgba(255,160,60,0.65)`,
        `${Math.round(ox * 3)}px ${Math.round(oy * 3)}px 28px rgba(255,120,30,0.30)`,
      ].join(', ');

      el.querySelectorAll('h1').forEach((node) => {
        (node as HTMLElement).style.textShadow = shadows;
      });
    }

    function onMove(event: MouseEvent) {
      lastMouse.current = { x: event.clientX, y: event.clientY };
      if (rafId.current === null) {
        rafId.current = requestAnimationFrame(() => {
          if (lastMouse.current) {
            applyShadow(lastMouse.current.x, lastMouse.current.y);
          }
          rafId.current = null;
        });
      }
    }

    applyShadow(window.innerWidth / 2, window.innerHeight / 2);
    window.addEventListener('mousemove', onMove);

    return () => {
      window.removeEventListener('mousemove', onMove);
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
      if (!el) return;
      el.querySelectorAll('h1').forEach((node) => {
        (node as HTMLElement).style.textShadow = '';
      });
    };
  }, [isMobile, reduceMotion]);

  return (
    <section
      id="bio"
      className="relative h-full flex flex-col items-center justify-center px-6 overflow-hidden"
      style={{ fontFamily: '"Bodoni Moda", serif', color: 'var(--text-primary)' }}
    >
      <div
        ref={contentRef}
        className="max-w-full text-center relative z-10 w-full justify-end justify-self-end flex flex-col items-center px-4"
      >
        <div className="relative">
          <h1
            className="text-5xl sm:text-7xl md:text-9xl lg:text-[12rem] xl:text-[15rem] 2xl:text-[18rem] leading-[0.7] font-bold bg-clip-text relative z-20"
            style={{
              color: 'var(--text-primary)',
            }}
          >
            ROY GUO
          </h1>
          <h2
            className="text-4xl sm:text-5xl md:text-7xl lg:text-[12rem] xl:text-[15rem] 2xl:text-[18rem] leading-[0.7] font-semibold relative z-10"
            style={{
              color: 'var(--text-tertiary)',
            }}
          >
            DEV
          </h2>
          <h2
            className="text-4xl sm:text-5xl md:text-7xl lg:text-[12rem] xl:text-[15rem] 2xl:text-[18rem] leading-[0.7] font-semibold relative z-10"
            style={{
              color: 'var(--text-tertiary)',
            }}
          >
            CREATOR
          </h2>
        </div>
      </div>

      <button
        type="button"
        onClick={onOpenPinboard}
        onFocus={onPreloadPinboard}
        onPointerDown={onPreloadPinboard}
        onPointerEnter={onPreloadPinboard}
        className="bio-cta"
        aria-label="Open pinboard"
      >
        <span className="bio-cta-label">Pinboard</span>
        <span className="bio-cta-line" aria-hidden />
      </button>
    </section>
  );
}
