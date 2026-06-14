import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import DecorativePatch from './DecorativePatch';
import PatchController from '../assets/patch_game_controller.png';
import PatchTemple from '../assets/patch_temple.png';
import PatchCorgi from '../assets/patch_corgi.png';
import PatchAussie from '../assets/patch_aus.png';

const MAX_SWING = 18;
const SWING_FORCE = 1.4;
const SWING_TENSION = 0.08;
const SWING_DAMPING = 0.86;
const FLIP_DURATION_MS = 900;

type PatchId = 'controller' | 'temple' | 'aussie' | 'corgi';
type BoardSide = 'professional' | 'hobby';

type PatchPosition = {
  x: number;
  y: number;
};

type DragState = PatchPosition & {
  id: PatchId;
  width: number;
  height: number;
  currentX: number;
  currentY: number;
  lastClientX: number;
  lastClientY: number;
  lastTime: number;
  velocityX: number;
  velocityY: number;
};

type PinboardProps = {
  onClose: () => void;
};

type PinConfig = {
  id: PatchId;
  image: string;
  size: 'md' | 'lg';
  initialRotate: number;
  hoverRotate: number;
  anchor: CSSProperties;
};

const boardPins: Record<BoardSide, PinConfig[]> = {
  professional: [
    {
      id: 'temple',
      image: PatchTemple,
      size: 'md',
      initialRotate: -9,
      hoverRotate: -4,
      anchor: { left: 'clamp(28px, 8vw, 120px)', top: 'clamp(92px, 14vh, 124px)' },
    },
    {
      id: 'controller',
      image: PatchController,
      size: 'md',
      initialRotate: 12,
      hoverRotate: 6,
      anchor: { right: 'clamp(28px, 8vw, 112px)', top: 'clamp(100px, 15vh, 132px)' },
    },
  ],
  hobby: [
    {
      id: 'aussie',
      image: PatchAussie,
      size: 'lg',
      initialRotate: 7,
      hoverRotate: 2,
      anchor: { left: 'clamp(26px, 9vw, 138px)', bottom: 'clamp(74px, 10vh, 104px)' },
    },
    {
      id: 'corgi',
      image: PatchCorgi,
      size: 'lg',
      initialRotate: -8,
      hoverRotate: -2,
      anchor: { right: 'clamp(26px, 9vw, 132px)', bottom: 'clamp(74px, 10vh, 104px)' },
    },
  ],
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export default function Pinboard({ onClose }: PinboardProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<DragState | null>(null);
  const swingFrame = useRef<number | null>(null);
  const patchSizes = useRef<Partial<Record<PatchId, { width: number; height: number }>>>({});
  const flipTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [activeSide, setActiveSide] = useState<BoardSide>('professional');
  const [draggingPatch, setDraggingPatch] = useState<PatchId | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [patchPositions, setPatchPositions] = useState<Partial<Record<PatchId, PatchPosition>>>({});
  const [patchSwings, setPatchSwings] = useState<Partial<Record<PatchId, number>>>({});

  useEffect(() => {
    function handleResize() {
      const board = boardRef.current;
      const boardRect = board?.getBoundingClientRect();

      setPatchPositions((positions) => {
        const nextPositions: Partial<Record<PatchId, PatchPosition>> = {};

        Object.entries(positions).forEach(([id, position]) => {
          if (!position) return;
          const size = patchSizes.current[id as PatchId];

          nextPositions[id as PatchId] = {
            x: clamp(position.x, 0, (boardRect?.width || window.innerWidth) - (size?.width || 0)),
            y: clamp(position.y, 0, (boardRect?.height || window.innerHeight) - (size?.height || 0)),
          };
        });

        return nextPositions;
      });
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    function stopSwing() {
      if (swingFrame.current !== null) {
        cancelAnimationFrame(swingFrame.current);
        swingFrame.current = null;
      }
    }

    function settleSwing(id: PatchId, startSwing: number) {
      let swing = startSwing;
      let angularVelocity = 0;

      function step() {
        angularVelocity += -swing * SWING_TENSION;
        angularVelocity *= SWING_DAMPING;
        swing += angularVelocity;

        setPatchSwings((swings) => ({
          ...swings,
          [id]: swing,
        }));

        if (Math.abs(swing) > 0.2 || Math.abs(angularVelocity) > 0.2) {
          swingFrame.current = requestAnimationFrame(step);
        } else {
          swingFrame.current = null;
          setPatchSwings((swings) => ({
            ...swings,
            [id]: 0,
          }));
        }
      }

      swingFrame.current = requestAnimationFrame(step);
    }

    function handlePointerMove(event: PointerEvent) {
      const drag = dragState.current;
      if (!drag) return;
      const boardRect = boardRef.current?.getBoundingClientRect();
      const boardLeft = boardRect?.left || 0;
      const boardTop = boardRect?.top || 0;
      const maxX = (boardRect?.width || window.innerWidth) - drag.width;
      const maxY = (boardRect?.height || window.innerHeight) - drag.height;

      const now = performance.now();
      const elapsed = Math.max(1, now - drag.lastTime);
      const nextX = clamp(event.clientX - boardLeft - drag.x, 0, maxX);
      const nextY = clamp(event.clientY - boardTop - drag.y, 0, maxY);

      drag.velocityX = ((event.clientX - drag.lastClientX) / elapsed) * 16.67;
      drag.velocityY = ((event.clientY - drag.lastClientY) / elapsed) * 16.67;
      drag.currentX = nextX;
      drag.currentY = nextY;
      drag.lastClientX = event.clientX;
      drag.lastClientY = event.clientY;
      drag.lastTime = now;

      setPatchPositions((positions) => ({
        ...positions,
        [drag.id]: {
          x: nextX,
          y: nextY,
        },
      }));
      setPatchSwings((swings) => ({
        ...swings,
        [drag.id]: clamp(drag.velocityX * SWING_FORCE, -MAX_SWING, MAX_SWING),
      }));
    }

    function handlePointerUp() {
      const drag = dragState.current;

      if (drag) {
        stopSwing();
        settleSwing(drag.id, clamp(drag.velocityX * SWING_FORCE, -MAX_SWING, MAX_SWING));
      }

      dragState.current = null;
      setDraggingPatch(null);
    }

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      stopSwing();
      if (flipTimeout.current) {
        clearTimeout(flipTimeout.current);
      }
    };
  }, []);

  function startDragging(id: PatchId, event: ReactPointerEvent<HTMLDivElement>) {
    if (isFlipping) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const boardRect = boardRef.current?.getBoundingClientRect();
    const boardLeft = boardRect?.left || 0;
    const boardTop = boardRect?.top || 0;

    event.preventDefault();
    if (swingFrame.current !== null) {
      cancelAnimationFrame(swingFrame.current);
      swingFrame.current = null;
    }
    patchSizes.current[id] = {
      width: rect.width,
      height: rect.height,
    };

    dragState.current = {
      id,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      width: rect.width,
      height: rect.height,
      currentX: rect.left - boardLeft,
      currentY: rect.top - boardTop,
      lastClientX: event.clientX,
      lastClientY: event.clientY,
      lastTime: performance.now(),
      velocityX: 0,
      velocityY: 0,
    };
    setDraggingPatch(id);
    setPatchPositions((positions) => ({
      ...positions,
      [id]: {
        x: rect.left - boardLeft,
        y: rect.top - boardTop,
      },
    }));
    setPatchSwings((swings) => ({
      ...swings,
      [id]: 0,
    }));
  }

  function getPatchStyle(id: PatchId, anchoredStyle: CSSProperties): CSSProperties {
    const position = patchPositions[id];

    if (!position) {
      return anchoredStyle;
    }

    return {
      left: position.x,
      top: position.y,
    };
  }

  function flipBoard() {
    if (isFlipping) return;

    setIsFlipping(true);
    setDraggingPatch(null);
    dragState.current = null;
    setActiveSide((side) => (side === 'professional' ? 'hobby' : 'professional'));

    if (flipTimeout.current) {
      clearTimeout(flipTimeout.current);
    }

    flipTimeout.current = setTimeout(() => {
      setIsFlipping(false);
    }, FLIP_DURATION_MS);
  }

  function renderPins(side: BoardSide) {
    return boardPins[side].map((pin) => (
      <DecorativePatch
        key={pin.id}
        image={pin.image}
        style={getPatchStyle(pin.id, pin.anchor)}
        size={pin.size}
        initialRotate={pin.initialRotate}
        hoverRotate={pin.hoverRotate}
        disableAnimation={false}
        draggable={!isFlipping && activeSide === side}
        isDragging={draggingPatch === pin.id}
        swingRotation={patchSwings[pin.id] || 0}
        boardShadow
        onPointerDown={(event) => startDragging(pin.id, event)}
      />
    ));
  }

  return (
    <section
      id="pinboard"
      className="relative h-screen overflow-hidden px-4 py-4 sm:px-8 sm:py-7"
      style={{
        color: 'var(--text-primary)',
        backgroundColor: '#100f0d',
        backgroundImage: `
          radial-gradient(circle at 50% 0%, rgba(255, 210, 120, 0.12), transparent 36%),
          linear-gradient(145deg, #17130f 0%, #090b0d 100%)
        `,
      }}
    >
      <header className="relative z-40 flex items-center justify-between gap-4" style={{ fontFamily: '"Inclusive Sans", sans-serif' }}>
        <h2 className="text-sm sm:text-base font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--accent-amber)' }}>
          {activeSide === 'professional' ? 'Professional + Academia' : 'Hobby + College'}
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={flipBoard}
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

      <div className="absolute inset-5 top-16 sm:inset-10 sm:top-20" style={{ perspective: '1600px' }}>
        <div
          ref={boardRef}
          className="relative h-full w-full transition-transform duration-[900ms] ease-out"
          style={{
            transformStyle: 'preserve-3d',
            transform: activeSide === 'hobby' ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          <div
            className="absolute inset-0 overflow-hidden"
            style={{
              borderRadius: 8,
              backfaceVisibility: 'hidden',
              backgroundColor: '#8a5432',
              backgroundImage: `
                repeating-linear-gradient(8deg, rgba(255,255,255,0.045) 0 1px, transparent 1px 13px),
                repeating-linear-gradient(97deg, rgba(55,24,10,0.12) 0 1px, transparent 1px 17px),
                linear-gradient(72deg, rgba(255, 232, 184, 0.08), transparent 28%, rgba(45, 20, 8, 0.16) 64%, transparent 100%),
                linear-gradient(115deg, rgba(255, 229, 166, 0.14), transparent 34%),
                linear-gradient(135deg, #9b623a 0%, #70401f 46%, #5c331c 100%)
              `,
              boxShadow: '0 28px 70px rgba(0, 0, 0, 0.55), inset 0 0 70px rgba(45, 22, 10, 0.58), inset 0 2px 0 rgba(255, 240, 190, 0.18)',
              pointerEvents: activeSide === 'professional' && !isFlipping ? 'auto' : 'none',
            }}
          >
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                border: 'clamp(12px, 2vw, 24px) solid #3a2114',
                boxShadow: 'inset 0 0 0 1px rgba(255, 214, 143, 0.2), inset 0 0 30px rgba(0, 0, 0, 0.42)',
              }}
            />
            <div
              className="pointer-events-none absolute inset-[clamp(12px,2vw,24px)]"
              style={{
                boxShadow: 'inset 8px 10px 28px rgba(0, 0, 0, 0.18), inset -5px -4px 20px rgba(255, 228, 168, 0.08)',
              }}
            />
            <div className="pointer-events-none absolute left-8 top-8 z-10 text-xs font-bold uppercase tracking-[0.16em] sm:left-12 sm:top-10" style={{ color: 'rgba(255, 236, 188, 0.68)', fontFamily: '"Inclusive Sans", sans-serif' }}>
              Professional + Academia
            </div>
            {renderPins('professional')}
          </div>

          <div
            className="absolute inset-0 overflow-hidden"
            style={{
              borderRadius: 8,
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              backgroundColor: '#84503a',
              backgroundImage: `
                repeating-linear-gradient(-10deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 12px),
                repeating-linear-gradient(78deg, rgba(52,21,12,0.13) 0 1px, transparent 1px 16px),
                linear-gradient(70deg, rgba(255, 208, 144, 0.1), transparent 32%, rgba(36, 15, 10, 0.16) 68%, transparent 100%),
                linear-gradient(135deg, #9a644a 0%, #71432e 46%, #552d1f 100%)
              `,
              boxShadow: '0 28px 70px rgba(0, 0, 0, 0.55), inset 0 0 70px rgba(42, 18, 12, 0.56), inset 0 2px 0 rgba(255, 226, 188, 0.14)',
              pointerEvents: activeSide === 'hobby' && !isFlipping ? 'auto' : 'none',
            }}
          >
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                border: 'clamp(12px, 2vw, 24px) solid #321b16',
                boxShadow: 'inset 0 0 0 1px rgba(255, 206, 168, 0.18), inset 0 0 30px rgba(0, 0, 0, 0.42)',
              }}
            />
            <div
              className="pointer-events-none absolute inset-[clamp(12px,2vw,24px)]"
              style={{
                boxShadow: 'inset 7px 10px 30px rgba(0, 0, 0, 0.2), inset -6px -5px 22px rgba(255, 216, 180, 0.08)',
              }}
            />
            <div className="pointer-events-none absolute left-8 top-8 z-10 text-xs font-bold uppercase tracking-[0.16em] sm:left-12 sm:top-10" style={{ color: 'rgba(255, 228, 203, 0.7)', fontFamily: '"Inclusive Sans", sans-serif' }}>
              Hobby + College
            </div>
            {renderPins('hobby')}
          </div>
        </div>
      </div>
    </section>
  );
}