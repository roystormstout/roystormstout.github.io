import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import './pinboard/Pinboard.css';
import BoardFace from './pinboard/BoardFace';
import PinboardHeader from './pinboard/PinboardHeader';
import PinboardScene from './pinboard/PinboardScene';
import PinLayer from './pinboard/PinLayer';
import PinNote from './pinboard/PinNote';
import { boardPins } from './pinboard/data';
import useBoardSize from './pinboard/hooks/useBoardSize';
import {
  CLICK_MOVE_THRESHOLD,
  FLIP_DURATION_MS,
  MAX_SWING,
  MAX_NOTE_DOCK_HEIGHT,
  MIN_NOTE_DOCK_HEIGHT,
  NOTE_CONTENT_GAP,
  NOTE_DOCK_HEIGHT_RATIO,
  NOTE_TEXT_DELAY_MS,
  SWING_DAMPING,
  SWING_FORCE,
  SWING_TENSION,
} from './pinboard/constants';
import { clamp, getNoteLayoutForSize, getNotePinPositionForSize } from './pinboard/layout';
import type { BoardSide, DragState, PatchId, PatchPosition, PinboardProps, SelectedPin } from './pinboard/types';

export default function Pinboard({ onClose }: PinboardProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<DragState | null>(null);
  const swingFrame = useRef<number | null>(null);
  const patchSizes = useRef<Partial<Record<PatchId, { width: number; height: number }>>>({});
  const flipTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedPinRef = useRef<SelectedPin | null>(null);
  const isFlippingRef = useRef(false);
  const lastInteractionMoved = useRef(false);
  const [activeSide, setActiveSide] = useState<BoardSide>('professional');
  const [draggingPatch, setDraggingPatch] = useState<PatchId | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [selectedPin, setSelectedPin] = useState<SelectedPin | null>(null);
  const [noteTextReady, setNoteTextReady] = useState(false);
  const boardSize = useBoardSize(boardRef);
  const [patchPositions, setPatchPositions] = useState<Partial<Record<PatchId, PatchPosition>>>({});
  const [patchSwings, setPatchSwings] = useState<Partial<Record<PatchId, number>>>({});

  const getNoteLayout = useCallback(() => {
    return getNoteLayoutForSize(boardSize.width, boardSize.height);
  }, [boardSize.height, boardSize.width]);

  const isPointInsideNote = useCallback((x: number, y: number) => {
    const note = getNoteLayout();

    return x >= note.x && x <= note.x + note.width && y >= note.y && y <= note.y + note.height;
  }, [getNoteLayout]);

  const getNotePinPosition = useCallback((width: number, height: number): PatchPosition => {
    return getNotePinPositionForSize(boardSize.width, boardSize.height, width, height);
  }, [boardSize.height, boardSize.width]);

  function getDockHeight() {
    return clamp(boardSize.height * NOTE_DOCK_HEIGHT_RATIO, MIN_NOTE_DOCK_HEIGHT, MAX_NOTE_DOCK_HEIGHT);
  }

  const attachPinToNote = useCallback((side: BoardSide, id: PatchId, previousPosition: PatchPosition, width: number, height: number) => {
    const nextPosition = getNotePinPosition(width, height);

    setPatchPositions((positions) => ({
      ...positions,
      ...(selectedPinRef.current && selectedPinRef.current.id !== id
        ? { [selectedPinRef.current.id]: selectedPinRef.current.previousPosition }
        : {}),
      [id]: nextPosition,
    }));
    setNoteTextReady(false);
    setSelectedPin({ side, id, previousPosition });
  }, [getNotePinPosition]);

  function detachPinFromNote() {
    const pin = selectedPinRef.current;

    if (!pin) return;

    setPatchPositions((positions) => ({
      ...positions,
      [pin.id]: pin.previousPosition,
    }));
    lastInteractionMoved.current = false;
    setNoteTextReady(false);
    setSelectedPin(null);
  }

  useEffect(() => {
    selectedPinRef.current = selectedPin;
  }, [selectedPin]);

  useEffect(() => {
    if (!selectedPin) return;

    const timeoutId = setTimeout(() => {
      setNoteTextReady(true);
    }, NOTE_TEXT_DELAY_MS);

    return () => clearTimeout(timeoutId);
  }, [selectedPin]);

  useEffect(() => {
    isFlippingRef.current = isFlipping;
  }, [isFlipping]);

  useEffect(() => {
    setPatchPositions((positions) => {
      const nextPositions: Partial<Record<PatchId, PatchPosition>> = {};
      const selected = selectedPinRef.current;

      Object.entries(positions).forEach(([id, position]) => {
        if (!position) return;
        const patchId = id as PatchId;
        const size = patchSizes.current[patchId];

        if (selected?.id === patchId && size) {
          nextPositions[patchId] = getNotePinPositionForSize(boardSize.width, boardSize.height, size.width, size.height);
          return;
        }

        nextPositions[patchId] = {
          x: clamp(position.x, 0, boardSize.width - (size?.width || 0)),
          y: clamp(position.y, 0, boardSize.height - (size?.height || 0)),
        };
      });

      return nextPositions;
    });
  }, [boardSize.height, boardSize.width]);

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

      const now = event.timeStamp;
      const elapsed = Math.max(1, now - drag.lastTime);
      const nextX = clamp(event.clientX - boardLeft - drag.x, 0, maxX);
      const nextY = clamp(event.clientY - boardTop - drag.y, 0, maxY);
      const movedDistance = Math.hypot(event.clientX - drag.startClientX, event.clientY - drag.startClientY);

      if (movedDistance > CLICK_MOVE_THRESHOLD) {
        drag.hasMoved = true;
      }

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

      const openPin = selectedPinRef.current;
      if (openPin?.id === drag.id && openPin.side === drag.side) {
        const pinCenterX = nextX + drag.width / 2;
        const pinCenterY = nextY + drag.height / 2;

        if (drag.hasMoved && !isPointInsideNote(pinCenterX, pinCenterY)) {
          setNoteTextReady(false);
          setSelectedPin(null);
        }
      }
    }

    function handlePointerUp() {
      const drag = dragState.current;

      if (drag) {
        stopSwing();
        const swing = clamp(drag.velocityX * SWING_FORCE, -MAX_SWING, MAX_SWING);
        settleSwing(drag.id, swing);
        lastInteractionMoved.current = drag.hasMoved;

        if (drag.hasMoved) {
          const pinCenterX = drag.currentX + drag.width / 2;
          const pinCenterY = drag.currentY + drag.height / 2;

          if (isPointInsideNote(pinCenterX, pinCenterY)) {
            const previousPosition = selectedPinRef.current?.id === drag.id && selectedPinRef.current.side === drag.side
              ? selectedPinRef.current.previousPosition
              : drag.previousPosition;

            attachPinToNote(drag.side, drag.id, previousPosition, drag.width, drag.height);
          }
        }
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
  }, [attachPinToNote, isPointInsideNote]);

  function startDragging(side: BoardSide, id: PatchId, event: ReactPointerEvent<HTMLDivElement>) {
    if (isFlipping) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const boardRect = boardRef.current?.getBoundingClientRect();
    const boardLeft = boardRect?.left || 0;
    const boardTop = boardRect?.top || 0;

    event.preventDefault();
    lastInteractionMoved.current = false;
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
      side,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      width: rect.width,
      height: rect.height,
      previousPosition: {
        x: rect.left - boardLeft,
        y: rect.top - boardTop,
      },
      currentX: rect.left - boardLeft,
      currentY: rect.top - boardTop,
      startClientX: event.clientX,
      startClientY: event.clientY,
      lastClientX: event.clientX,
      lastClientY: event.clientY,
      lastTime: event.timeStamp,
      velocityX: 0,
      velocityY: 0,
      hasMoved: false,
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

  function activatePinFromElement(side: BoardSide, id: PatchId, element: HTMLElement) {
    if (isFlippingRef.current) return;

    if (lastInteractionMoved.current) {
      lastInteractionMoved.current = false;
      return;
    }

    const rect = element.getBoundingClientRect();
    const boardRect = boardRef.current?.getBoundingClientRect();
    const boardLeft = boardRect?.left || 0;
    const boardTop = boardRect?.top || 0;
    const previousPosition = {
      x: rect.left - boardLeft,
      y: rect.top - boardTop,
    };

    if (selectedPinRef.current?.id === id && selectedPinRef.current.side === side) {
      detachPinFromNote();
      return;
    }

    attachPinToNote(side, id, previousPosition, rect.width, rect.height);
  }

  function flipBoard() {
    if (isFlipping) return;

    setIsFlipping(true);
    setDraggingPatch(null);
    setNoteTextReady(false);
    setSelectedPin(null);
    lastInteractionMoved.current = false;
    dragState.current = null;
    setActiveSide((side) => (side === 'professional' ? 'hobby' : 'professional'));

    if (flipTimeout.current) {
      clearTimeout(flipTimeout.current);
    }

    flipTimeout.current = setTimeout(() => {
      setIsFlipping(false);
    }, FLIP_DURATION_MS);
  }

  function getSelectedPinConfig(side: BoardSide) {
    if (!selectedPin || selectedPin.side !== side) return null;
    return boardPins[side].find((pin) => pin.id === selectedPin.id) || null;
  }

  const note = getNoteLayout();
  const dockHeight = getDockHeight();
  const contentTop = selectedPin ? dockHeight + NOTE_CONTENT_GAP : dockHeight;

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
      <PinboardHeader activeSide={activeSide} isFlipping={isFlipping} onFlip={flipBoard} onClose={onClose} />
      <PinboardScene activeSide={activeSide} boardRef={boardRef}>
        {(['professional', 'hobby'] as BoardSide[]).map((side) => {
          const selectedPinConfig = getSelectedPinConfig(side);
          const isFilled = Boolean(selectedPin && selectedPin.side === side && selectedPinConfig);

          return (
            <BoardFace key={side} side={side} activeSide={activeSide} isFlipping={isFlipping}>
              <PinLayer
                side={side}
                activeSide={activeSide}
                isFlipping={isFlipping}
                pins={boardPins[side]}
                selectedPin={selectedPin}
                draggingPatch={draggingPatch}
                patchPositions={patchPositions}
                patchSwings={patchSwings}
                onPointerDown={startDragging}
                onActivate={activatePinFromElement}
              />
              <PinNote
                side={side}
                activeSide={activeSide}
                note={note}
                pin={selectedPinConfig}
                isFilled={isFilled}
                noteTextReady={noteTextReady}
                dockHeight={dockHeight}
                contentTop={contentTop}
              />
            </BoardFace>
          );
        })}
      </PinboardScene>
    </section>
  );
}