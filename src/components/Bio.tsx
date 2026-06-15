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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= MOBILE_BREAKPOINT);
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
              willChange: 'transform',
            }}
          >
            ROY GUO
          </h1>
          <h2
            className="text-4xl sm:text-5xl md:text-7xl lg:text-[12rem] xl:text-[15rem] 2xl:text-[18rem] leading-[0.7] font-semibold relative z-10"
            style={{
              color: 'var(--text-tertiary)',
              willChange: 'transform',
            }}
          >
            DEV
          </h2>
          <h2
            className="text-4xl sm:text-5xl md:text-7xl lg:text-[12rem] xl:text-[15rem] 2xl:text-[18rem] leading-[0.7] font-semibold relative z-10"
            style={{
              color: 'var(--text-tertiary)',
              willChange: 'transform',
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
        className="group absolute bottom-8 left-1/2 z-20 -translate-x-1/2 px-5 py-3 text-sm font-bold uppercase tracking-[0.16em] transition-all duration-300 hover:-translate-y-1"
        style={{
          color: 'var(--text-primary)',
          backgroundColor: 'rgba(18, 24, 35, 0.72)',
          borderColor: 'var(--accent-amber)',
          boxShadow: '0 0 18px rgba(255, 210, 120, 0.16)',
        }}
      >
        Pinboard
        <span
          className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform duration-300 group-hover:scale-125"
          style={{ backgroundColor: 'var(--accent-amber)', boxShadow: '0 0 12px var(--accent-amber)' }}
        />
      </button>
    </section>
  );
}
