import React, { useState, useRef, useEffect } from 'react';

type Size = 'sm' | 'md' | 'lg';

type Props = {
  image: string;
  initialRotate?: number;
  hoverRotate?: number;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  disableAnimation?: boolean;
  size?: Size;
  mousePosition?: { x: number; y: number } | null;
  trackMouse?: boolean;
};

const sizeClasses: Record<Size, string> = {
  sm: 'w-20 sm:w-28 md:w-40 lg:w-56 xl:w-72',
  md: 'w-24 sm:w-32 md:w-48 lg:w-64 xl:w-80',
  lg: 'w-28 sm:w-40 md:w-56 lg:w-80 xl:w-[20rem]',
};

export default function DecorativePatch({
  image,
  initialRotate = 0,
  hoverRotate = 15,
  alt = 'decorative patch',
  className,
  style,
  disableAnimation = false,
  size = 'md',
  mousePosition = null,
  trackMouse = false,
}: Props) {
  const [hovering, setHovering] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const shineRef = useRef<HTMLDivElement>(null);
  const cachedRect = useRef<DOMRect | null>(null);
  const rafId = useRef<number | null>(null);

  // Cache bounding rect on mount and resize
  useEffect(() => {
    const updateRect = () => {
      if (imgRef.current) {
        cachedRect.current = imgRef.current.getBoundingClientRect();
      }
    };
    updateRect();
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect);
    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect);
    };
  }, []);

  // Update transforms directly via CSS custom properties (GPU-friendly)
  useEffect(() => {
    if (!trackMouse || disableAnimation || !mousePosition) {
      // Reset to default
      if (containerRef.current) {
        containerRef.current.style.setProperty('--tilt-x', '0');
        containerRef.current.style.setProperty('--tilt-y', '0');
        containerRef.current.style.setProperty('--shine-x', '50%');
        containerRef.current.style.setProperty('--shine-y', '50%');
        containerRef.current.style.setProperty('--shine-opacity', '0');
      }
      return;
    }

    // Use RAF to throttle updates
    if (rafId.current !== null) return;
    
    rafId.current = requestAnimationFrame(() => {
      rafId.current = null;
      
      // Update cached rect if needed
      if (!cachedRect.current && imgRef.current) {
        cachedRect.current = imgRef.current.getBoundingClientRect();
      }
      
      const rect = cachedRect.current;
      if (!rect || !containerRef.current) return;

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = mousePosition.x - centerX;
      const dy = mousePosition.y - centerY;

      const maxTilt = 15;
      const scale = 0.02;
      
      const rotateY = Math.max(-maxTilt, Math.min(maxTilt, dx * scale));
      const rotateX = Math.max(-maxTilt, Math.min(maxTilt, -dy * scale));

      // Calculate shine position
      const shineX = 50 - rotateY * 2;
      const shineY = 50 + rotateX * 2;
      const shineOpacity = Math.min(0.5, (Math.abs(rotateX) + Math.abs(rotateY)) / 36);

      // Set CSS custom properties directly (no React re-render)
      containerRef.current.style.setProperty('--tilt-x', `${rotateX}`);
      containerRef.current.style.setProperty('--tilt-y', `${rotateY}`);
      containerRef.current.style.setProperty('--shine-x', `${shineX}%`);
      containerRef.current.style.setProperty('--shine-y', `${shineY}%`);
      containerRef.current.style.setProperty('--shine-opacity', `${shineOpacity}`);
    });

    return () => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
    };
  }, [mousePosition, trackMouse, disableAnimation]);

  const shouldAnimate = !disableAnimation && hovering;
  const baseRotate = shouldAnimate ? hoverRotate : initialRotate;

  return (
    <div
      ref={containerRef}
      className={`${sizeClasses[size]} ${className || ''}`}
      style={{
        position: 'absolute',
        height: 'auto',
        zIndex: 20,
        // Initialize CSS custom properties
        '--tilt-x': '0',
        '--tilt-y': '0',
        '--shine-x': '50%',
        '--shine-y': '50%',
        '--shine-opacity': '0',
        ...style,
      } as React.CSSProperties}
    >
      <img
        ref={imgRef}
        src={image}
        alt={alt}
        aria-hidden
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        className="w-full h-auto"
        style={{
          transition: disableAnimation ? 'none' : 'transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          transform: trackMouse && !disableAnimation
            ? `perspective(500px) rotateX(calc(var(--tilt-x) * 1deg)) rotateY(calc(var(--tilt-y) * 1deg)) rotate(${baseRotate}deg)`
            : `rotate(${baseRotate}deg)`,
          pointerEvents: disableAnimation ? 'none' : 'auto',
          transformStyle: 'preserve-3d',
          willChange: trackMouse ? 'transform' : 'auto',
        }}
      />
      {/* Sunlight reflection overlay - masked to image shape */}
      {trackMouse && !disableAnimation && (
        <div
          ref={shineRef}
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 100% 70% at var(--shine-x) var(--shine-y), rgba(255,255,240,var(--shine-opacity)) 0%, rgba(255,250,220,calc(var(--shine-opacity) * 0.5)) 30%, rgba(255,255,255,0) 70%)`,
            transition: 'background 200ms ease-out',
            mixBlendMode: 'overlay',
            transform: `perspective(500px) rotateX(calc(var(--tilt-x) * 1deg)) rotateY(calc(var(--tilt-y) * 1deg)) rotate(${baseRotate}deg)`,
            WebkitMaskImage: `url(${image})`,
            maskImage: `url(${image})`,
            WebkitMaskSize: 'contain',
            maskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskPosition: 'center',
            willChange: trackMouse ? 'transform' : 'auto',
          }}
        />
      )}
    </div>
  );
}
