import { useEffect, useRef, useState } from 'react';
import DecorativePatch from './DecorativePatch';
import NavBar from './NavBar';
import PatchController from '../assets/patch_game_controller.png';
import PatchTemple from '../assets/patch_temple.png';
import PatchCorgi from '../assets/patch_corgi.png';
import PatchAussie from '../assets/patch_aus.png';

const MOBILE_BREAKPOINT = 768;

export default function Bio() {
  const contentRef = useRef<HTMLDivElement>(null);
  const lastMouse = useRef<{ x: number; y: number } | null>(null);
  const rafId = useRef<number | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= MOBILE_BREAKPOINT);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [scrollY, setScrollY] = useState(0);

  // Track viewport size for disabling animation on mobile
  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Parallax scroll effect
  useEffect(() => {
    function handleScroll() {
      setScrollY(window.scrollY);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Mouse-driven "sun ray" text shadow (disabled on mobile)
  useEffect(() => {
    if (isMobile) return;

    const el = contentRef.current;
    function applyShadow(clientX: number, clientY: number) {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      const dx = clientX - cx;
      const dy = clientY - cy;

      // scale down the offsets so shadow isn't huge
      const scale = 0.03;
      const ox = -Math.round(dx * scale);
      const oy = -Math.round(dy * scale);

      // build layered shadows for a warm, sun-like glow (better on dark backgrounds)
      const shadows = [
        `${ox}px ${oy}px 2px rgba(255,210,120,0.95)`,
        `${Math.round(ox * 1.7)}px ${Math.round(oy * 1.7)}px 8px rgba(255,160,60,0.65)`,
        `${Math.round(ox * 3)}px ${Math.round(oy * 3)}px 28px rgba(255,120,30,0.30)`,
      ].join(', ');

      el.querySelectorAll('h1, p').forEach((node) => {
        (node as HTMLElement).style.textShadow = shadows;
      });
    }

    function onMove(e: MouseEvent) {
      lastMouse.current = { x: e.clientX, y: e.clientY };
      setMousePos({ x: e.clientX, y: e.clientY });
      if (rafId.current === null) {
        rafId.current = requestAnimationFrame(() => {
          if (lastMouse.current) {
            applyShadow(lastMouse.current.x, lastMouse.current.y);
          }
          rafId.current = null;
        });
      }
    }

    // initialize with center (no offset) so there's a starting style
    applyShadow(window.innerWidth / 2, window.innerHeight / 2);

    window.addEventListener('mousemove', onMove);

    return () => {
      window.removeEventListener('mousemove', onMove);
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
      // clear shadows on cleanup
      if (!el) return;
      el.querySelectorAll('h1, p').forEach((node) => {
        (node as HTMLElement).style.textShadow = '';
      });
    };
  }, [isMobile]);

  return (
    <>
      <NavBar />

      <section
        id="bio"
        className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden pt-60 mb-80"
        style={{ fontFamily: '"Bodoni Moda", serif', color: 'var(--text-primary)' }}
      >
      <div
        ref={contentRef}
        className="max-w-full text-center relative z-10 w-full justify-end justify-self-end flex flex-col items-center px-4"
      >
        <div className="relative">
          <h1 
            className="text-5xl sm:text-7xl md:text-9xl lg:text-[12rem] xl:text-[15rem] 2xl:text-[18rem] leading-[0.7] font-bold bg-clip-text relative z-20 transition-transform duration-100" 
            style={{
              color: 'var(--text-primary)',
              transform: `translateY(${scrollY * -0.05}px)`,
            }}
          >
            ROY GUO
          </h1>
          <h2 
            className="text-5xl sm:text-7xl md:text-9xl lg:text-[12rem] xl:text-[15rem] 2xl:text-[18rem] leading-[0.7] font-semibold relative z-10 transition-transform duration-100" 
            style={{
              color: 'var(--text-tertiary)',
              transform: `translateY(${scrollY * -0.3}px)`,
            }}
          >
            DEV
          </h2>
          <h2 
            className="text-5xl sm:text-7xl md:text-9xl lg:text-[12rem] xl:text-[15rem] 2xl:text-[18rem] leading-[0.7] font-semibold relative z-10 transition-transform duration-100" 
            style={{
              color: 'var(--text-tertiary)',
              transform: `translateY(${scrollY * -0.45}px)`,
            }}
          >
            CREATOR
          </h2>
        </div>
      </div>
      <DecorativePatch image={PatchController} style={{right: isMobile ? 10 : 40, top: isMobile ? 80 : 40}} size="md" initialRotate={20} hoverRotate={5} disableAnimation={isMobile} mousePosition={mousePos} trackMouse />
      <DecorativePatch image={PatchTemple} style={{left: isMobile ? 10 : 40, top: isMobile ? 80 : 40}} size="md" initialRotate={-12} hoverRotate={9} disableAnimation={isMobile} mousePosition={mousePos} trackMouse />
      <DecorativePatch image={PatchAussie} style={{left: isMobile ? 10 : 40, bottom: isMobile ? 80 : 40}} size="lg" initialRotate={10} hoverRotate={-5} disableAnimation={isMobile} mousePosition={mousePos} trackMouse />
      <DecorativePatch image={PatchCorgi} style={{right: isMobile ? 10 : 40, bottom: isMobile ? 80 : 40}} size="lg" initialRotate={-12} hoverRotate={7} disableAnimation={isMobile} mousePosition={mousePos} trackMouse />
    </section>
    </>
  );
}
