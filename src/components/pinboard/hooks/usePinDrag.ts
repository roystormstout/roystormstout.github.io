import { useCallback, useEffect, useRef, useState, type Dispatch, type MutableRefObject, type PointerEvent as ReactPointerEvent, type RefObject, type SetStateAction } from 'react';
import {
  CLICK_MOVE_THRESHOLD,
  MAX_SWING,
  SWING_DAMPING,
  SWING_FORCE,
  SWING_TENSION,
} from '../constants';
import { clamp } from '../layout';
import type { PatchId } from '../data';
import type {
  BoardSide,
  DragState,
  PatchPosition,
  PatchPositions,
  PatchSizes,
  PatchSwings,
  SelectedPin,
} from '../types';

type SelectedPinsBySide = Record<BoardSide, SelectedPin<PatchId> | null>;

type UsePinDragOptions = {
  attachPinToNote: (side: BoardSide, id: PatchId, previousPosition: PatchPosition, width: number, height: number) => void;
  boardRef: RefObject<HTMLDivElement | null>;
  clearSelectedPin: (side: BoardSide) => void;
  detachPinFromNote: (side: BoardSide) => void;
  isPointInsideNote: (x: number, y: number) => boolean;
  isSwitchingRef: MutableRefObject<boolean>;
  reduceMotion: boolean;
  selectedPinsRef: MutableRefObject<SelectedPinsBySide>;
  setPatchPositions: Dispatch<SetStateAction<PatchPositions<PatchId>>>;
  setPatchSwings: Dispatch<SetStateAction<PatchSwings<PatchId>>>;
};

export default function usePinDrag({
  attachPinToNote,
  boardRef,
  clearSelectedPin,
  detachPinFromNote,
  isPointInsideNote,
  isSwitchingRef,
  reduceMotion,
  selectedPinsRef,
  setPatchPositions,
  setPatchSwings,
}: UsePinDragOptions) {
  const dragState = useRef<DragState<PatchId> | null>(null);
  const patchSizes = useRef<PatchSizes<PatchId>>({});
  const dragFrame = useRef<number | null>(null);
  const pendingDragUpdate = useRef<{
    id: PatchId;
    position: PatchPosition;
    swing: number;
  } | null>(null);
  const swingFrame = useRef<number | null>(null);
  const lastInteractionMoved = useRef(false);
  const [draggingPatch, setDraggingPatch] = useState<PatchId | null>(null);

  const applyPendingDragUpdate = useCallback(() => {
    const update = pendingDragUpdate.current;

    dragFrame.current = null;
    pendingDragUpdate.current = null;

    if (!update) return;

    setPatchPositions((positions) => ({
      ...positions,
      [update.id]: update.position,
    }));
    setPatchSwings((swings) => ({
      ...swings,
      [update.id]: update.swing,
    }));
  }, [setPatchPositions, setPatchSwings]);

  const flushPendingDragUpdate = useCallback(() => {
    if (dragFrame.current !== null) {
      cancelAnimationFrame(dragFrame.current);
      dragFrame.current = null;
    }

    applyPendingDragUpdate();
  }, [applyPendingDragUpdate]);

  const scheduleDragUpdate = useCallback((id: PatchId, position: PatchPosition, swing: number) => {
    pendingDragUpdate.current = { id, position, swing };

    if (dragFrame.current === null) {
      dragFrame.current = requestAnimationFrame(applyPendingDragUpdate);
    }
  }, [applyPendingDragUpdate]);

  const stopSwing = useCallback(() => {
    if (swingFrame.current !== null) {
      cancelAnimationFrame(swingFrame.current);
      swingFrame.current = null;
    }
  }, []);

  const resetDrag = useCallback(() => {
    flushPendingDragUpdate();
    stopSwing();
    dragState.current = null;
    lastInteractionMoved.current = false;
    setDraggingPatch(null);
  }, [flushPendingDragUpdate, stopSwing]);

  const settleSwing = useCallback((id: PatchId, startSwing: number) => {
    if (reduceMotion) {
      setPatchSwings((swings) => ({ ...swings, [id]: 0 }));
      return;
    }

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
  }, [reduceMotion, setPatchSwings]);

  useEffect(() => {
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

      scheduleDragUpdate(
        drag.id,
        { x: nextX, y: nextY },
        reduceMotion ? 0 : clamp(drag.velocityX * SWING_FORCE, -MAX_SWING, MAX_SWING),
      );

      const openPin = selectedPinsRef.current[drag.side];
      if (openPin?.id === drag.id && openPin.side === drag.side) {
        const pinCenterX = nextX + drag.width / 2;
        const pinCenterY = nextY + drag.height / 2;

        if (drag.hasMoved && !isPointInsideNote(pinCenterX, pinCenterY)) {
          clearSelectedPin(drag.side);
        }
      }
    }

    function handlePointerUp() {
      const drag = dragState.current;

      if (drag) {
        flushPendingDragUpdate();
        stopSwing();
        const swing = reduceMotion ? 0 : clamp(drag.velocityX * SWING_FORCE, -MAX_SWING, MAX_SWING);
        settleSwing(drag.id, swing);
        lastInteractionMoved.current = drag.hasMoved;

        if (drag.hasMoved) {
          const pinCenterX = drag.currentX + drag.width / 2;
          const pinCenterY = drag.currentY + drag.height / 2;

          if (isPointInsideNote(pinCenterX, pinCenterY)) {
            const selectedPin = selectedPinsRef.current[drag.side];
            const previousPosition = selectedPin?.id === drag.id && selectedPin.side === drag.side
              ? selectedPin.previousPosition
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
      flushPendingDragUpdate();
      stopSwing();
    };
  }, [attachPinToNote, boardRef, clearSelectedPin, flushPendingDragUpdate, isPointInsideNote, reduceMotion, scheduleDragUpdate, selectedPinsRef, settleSwing, stopSwing]);

  const startDragging = useCallback((side: BoardSide, id: PatchId, event: ReactPointerEvent<HTMLElement>) => {
    if (isSwitchingRef.current) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const boardRect = boardRef.current?.getBoundingClientRect();
    const boardLeft = boardRect?.left || 0;
    const boardTop = boardRect?.top || 0;

    lastInteractionMoved.current = false;
    stopSwing();
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
  }, [boardRef, isSwitchingRef, patchSizes, setPatchPositions, setPatchSwings, stopSwing]);

  const activatePinFromElement = useCallback((side: BoardSide, id: PatchId, element: HTMLElement) => {
    if (isSwitchingRef.current) return;

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

    if (selectedPinsRef.current[side]?.id === id && selectedPinsRef.current[side]?.side === side) {
      detachPinFromNote(side);
      return;
    }

    attachPinToNote(side, id, previousPosition, rect.width, rect.height);
  }, [attachPinToNote, boardRef, detachPinFromNote, isSwitchingRef, selectedPinsRef]);

  return {
    activatePinFromElement,
    draggingPatch,
    patchSizes,
    resetDrag,
    startDragging,
  };
}