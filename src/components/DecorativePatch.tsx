import React, { useRef } from 'react';
import type { PinImageSet } from './pinboard/types';

type Size = 'sm' | 'md' | 'lg';

type Props = {
  image: PinImageSet;
  initialRotate?: number;
  hoverRotate?: number;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  size?: Size;
  draggable?: boolean;
  isDragging?: boolean;
  swingRotation?: number;
  boardShadow?: boolean;
  onPointerDown?: React.PointerEventHandler<HTMLElement>;
  onClick?: React.MouseEventHandler<HTMLElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLElement>;
  role?: string;
  tabIndex?: number;
  ariaLabel?: string;
};

const sizeWidths: Record<Size, string> = {
  sm: 'clamp(5.5rem, 14vw, 11rem)',
  md: 'clamp(6.5rem, 16vw, 12.5rem)',
  lg: 'clamp(7.5rem, 18vw, 14rem)',
};

export default function DecorativePatch({
  image,
  initialRotate = 0,
  hoverRotate = 15,
  alt = 'decorative patch',
  className,
  style,
  size = 'md',
  draggable = false,
  isDragging = false,
  swingRotation = 0,
  boardShadow = false,
  onPointerDown,
  onClick,
  onKeyDown,
  role,
  tabIndex,
  ariaLabel,
}: Props) {
  const containerRef = useRef<HTMLElement>(null);

  const restRotate = initialRotate + swingRotation;
  const activeHoverRotate = hoverRotate + swingRotation;
  const shadowOffsetX = Math.round(swingRotation * 0.28);
  const imageTransform = 'rotate(var(--pin-rotate)) scale(var(--pin-scale))';
  const isInteractive = role === 'button';
  const containerStyle = {
    position: 'absolute',
    width: sizeWidths[size],
    height: 'auto',
    cursor: draggable ? (isDragging ? 'grabbing' : 'grab') : undefined,
    touchAction: draggable ? 'none' : undefined,
    userSelect: draggable ? 'none' : undefined,
    '--pin-rest-rotate': `${restRotate}deg`,
    '--pin-hover-rotate': `${activeHoverRotate}deg`,
    '--pin-scale': isDragging ? '1.045' : '1',
    ...style,
    zIndex: isDragging ? 45 : style?.zIndex || 20,
    ...(isInteractive
      ? {
          appearance: 'none',
          backgroundColor: 'transparent',
          border: 0,
          boxShadow: 'none',
          outline: 'none',
          padding: 0,
          font: 'inherit',
          color: 'inherit',
          WebkitTapHighlightColor: 'transparent',
        }
      : {}),
  } as React.CSSProperties;

  const content = (
    <>
      <picture>
        <source type="image/avif" srcSet={image.avifSrcSet} sizes={image.sizes} />
        <source type="image/webp" srcSet={image.webpSrcSet} sizes={image.sizes} />
        <img
          src={image.src}
          alt={alt}
          aria-hidden
          draggable={false}
          decoding="async"
          className="w-full h-auto"
          style={{
            transition: 'transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1), filter 180ms ease',
            transform: imageTransform,
            filter: boardShadow
              ? `drop-shadow(${shadowOffsetX}px ${isDragging ? 22 : 12}px ${isDragging ? 20 : 10}px rgba(0, 0, 0, ${isDragging ? 0.5 : 0.32}))`
              : undefined,
            pointerEvents: 'none',
            transformStyle: 'preserve-3d',
            transformOrigin: '50% 12%',
            willChange: draggable ? 'transform, filter' : 'auto',
          }}
        />
      </picture>
    </>
  );

  if (isInteractive) {
    return (
      <button
        ref={containerRef as React.Ref<HTMLButtonElement>}
        type="button"
        className={`decorative-patch ${className || ''}`}
        onPointerDown={onPointerDown as React.PointerEventHandler<HTMLButtonElement>}
        onClick={onClick as React.MouseEventHandler<HTMLButtonElement>}
        onKeyDown={onKeyDown as React.KeyboardEventHandler<HTMLButtonElement>}
        tabIndex={tabIndex}
        aria-label={ariaLabel}
        style={containerStyle}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      ref={containerRef as React.Ref<HTMLDivElement>}
      className={`decorative-patch ${className || ''}`}
      onPointerDown={onPointerDown as React.PointerEventHandler<HTMLDivElement>}
      onClick={onClick as React.MouseEventHandler<HTMLDivElement>}
      onKeyDown={onKeyDown as React.KeyboardEventHandler<HTMLDivElement>}
      tabIndex={tabIndex}
      aria-label={ariaLabel}
      style={containerStyle}
    >
      {content}
    </div>
  );
}
