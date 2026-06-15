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
  BOARD_SWITCH_DURATION_MS,
  CLICK_MOVE_THRESHOLD,
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
import {
  boardSides,
  type BoardSide,
  type BoardSwitchDirection,
  type BoardTransition,
  type DragState,
  type PatchId,
  type PatchPosition,
  type PinboardProps,
  type SelectedPin,
} from './pinboard/types';

const emptySelectedPins: Record<BoardSide, SelectedPin | null> = {
  work: null,
  research: null,
  play: null,
};

const emptyNoteTextReady: Record<BoardSide, boolean> = {
  work: false,
  research: false,
  play: false,
};

function getBoardIndex(side: BoardSide) {
  return boardSides.indexOf(side);
}

function getBoardDirection(fromSide: BoardSide, toSide: BoardSide): BoardSwitchDirection {
  return getBoardIndex(toSide) > getBoardIndex(fromSide) ? 1 : -1;
}

function getNextBoard(side: BoardSide) {
  return boardSides[(getBoardIndex(side) + 1) % boardSides.length];
}

export default function Pinboard({ onClose }: PinboardProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<DragState | null>(null);
  const swingFrame = useRef<number | null>(null);
  const patchSizes = useRef<Partial<Record<PatchId, { width: number; height: number }>>>({});
  const switchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedPinsRef = useRef<Record<BoardSide, SelectedPin | null>>(emptySelectedPins);
  const isSwitchingRef = useRef(false);
  const activeSideRef = useRef<BoardSide>('work');
  const lastInteractionMoved = useRef(false);
  const [activeSide, setActiveSide] = useState<BoardSide>('work');
  const [draggingPatch, setDraggingPatch] = useState<PatchId | null>(null);
  const [isSwitching, setIsSwitching] = useState(false);
  const [isFlipResetting, setIsFlipResetting] = useState(false);
  const [boardTransition, setBoardTransition] = useState<BoardTransition | null>(null);
  const [selectedPins, setSelectedPins] = useState<Record<BoardSide, SelectedPin | null>>(emptySelectedPins);
  const [noteTextReady, setNoteTextReady] = useState<Record<BoardSide, boolean>>(emptyNoteTextReady);
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
    const currentPin = selectedPinsRef.current[side];

    setPatchPositions((positions) => ({
      ...positions,
      ...(currentPin && currentPin.id !== id
        ? { [currentPin.id]: currentPin.previousPosition }
        : {}),
      [id]: nextPosition,
    }));
    setNoteTextReady((ready) => ({ ...ready, [side]: false }));
    setSelectedPins((pins) => ({ ...pins, [side]: { side, id, previousPosition } }));
  }, [getNotePinPosition]);

  function detachPinFromNote(side: BoardSide) {
    const pin = selectedPinsRef.current[side];

    if (!pin) return;

    setPatchPositions((positions) => ({
      ...positions,
      [pin.id]: pin.previousPosition,
    }));
    lastInteractionMoved.current = false;
    setNoteTextReady((ready) => ({ ...ready, [side]: false }));
    setSelectedPins((pins) => ({ ...pins, [side]: null }));
  }

  useEffect(() => {
    selectedPinsRef.current = selectedPins;
  }, [selectedPins]);

  useEffect(() => {
    const timeoutIds = (Object.entries(selectedPins) as Array<[BoardSide, SelectedPin | null]>).flatMap(([side, pin]) => {
      if (!pin) return [];

      const timeoutId = setTimeout(() => {
        setNoteTextReady((ready) => ({ ...ready, [side]: true }));
      }, NOTE_TEXT_DELAY_MS);

      return [timeoutId];
    });

    return () => {
      timeoutIds.forEach((timeoutId) => clearTimeout(timeoutId));
    };
  }, [selectedPins]);

  useEffect(() => {
    isSwitchingRef.current = isSwitching;
  }, [isSwitching]);

  useEffect(() => {
    activeSideRef.current = activeSide;
  }, [activeSide]);

  const switchBoard = useCallback((nextSide: BoardSide, directionOverride?: BoardSwitchDirection) => {
    const fromSide = activeSideRef.current;
    if (isSwitchingRef.current || fromSide === nextSide) return;

    const direction = directionOverride || getBoardDirection(fromSide, nextSide);

    setIsSwitching(true);
    setBoardTransition({ fromSide, toSide: nextSide, direction });
    setDraggingPatch(null);
    lastInteractionMoved.current = false;
    dragState.current = null;
    setActiveSide(nextSide);

    if (switchTimeout.current) {
      clearTimeout(switchTimeout.current);
    }

    if (resetTimeout.current) {
      clearTimeout(resetTimeout.current);
    }

    switchTimeout.current = setTimeout(() => {
      setIsFlipResetting(true);
      setActiveSide(nextSide);
      setIsSwitching(false);
      setBoardTransition(null);

      resetTimeout.current = setTimeout(() => {
        setIsFlipResetting(false);
      }, 32);
    }, BOARD_SWITCH_DURATION_MS);
  }, []);

  useEffect(() => {
    setPatchPositions((positions) => {
      const nextPositions: Partial<Record<PatchId, PatchPosition>> = {};
      const selectedPinsBySide = selectedPinsRef.current;

      Object.entries(positions).forEach(([id, position]) => {
        if (!position) return;
        const patchId = id as PatchId;
        const size = patchSizes.current[patchId];
        const selected = Object.values(selectedPinsBySide).find((pin) => pin?.id === patchId);

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

      const openPin = selectedPinsRef.current[drag.side];
      if (openPin?.id === drag.id && openPin.side === drag.side) {
        const pinCenterX = nextX + drag.width / 2;
        const pinCenterY = nextY + drag.height / 2;

        if (drag.hasMoved && !isPointInsideNote(pinCenterX, pinCenterY)) {
          setNoteTextReady((ready) => ({ ...ready, [drag.side]: false }));
          setSelectedPins((pins) => ({ ...pins, [drag.side]: null }));
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
      stopSwing();
      if (switchTimeout.current) {
        clearTimeout(switchTimeout.current);
      }
      if (resetTimeout.current) {
        clearTimeout(resetTimeout.current);
      }
    };
  }, [attachPinToNote, isPointInsideNote]);

  function startDragging(side: BoardSide, id: PatchId, event: ReactPointerEvent<HTMLElement>) {
    if (isSwitching) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const boardRect = boardRef.current?.getBoundingClientRect();
    const boardLeft = boardRect?.left || 0;
    const boardTop = boardRect?.top || 0;

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
  }

  function getSelectedPinConfig(side: BoardSide) {
    const selectedPin = selectedPins[side];
    if (!selectedPin) return null;
    return boardPins[side].find((pin) => pin.id === selectedPin.id) || null;
  }

  const note = getNoteLayout();
  const dockHeight = getDockHeight();
  const nextSide = getNextBoard(activeSide);

  return (
    <section
      id="pinboard"
      className="relative h-full overflow-hidden px-4 py-4 sm:px-8 sm:py-7"
      style={{
        color: 'var(--text-primary)',
        backgroundColor: '#100f0d',
        backgroundImage: `
          radial-gradient(circle at 50% 0%, rgba(255, 210, 120, 0.12), transparent 36%),
          linear-gradient(145deg, #17130f 0%, #090b0d 100%)
        `,
      }}
    >
      <PinboardHeader activeSide={activeSide} isSwitching={isSwitching} onSelectBoard={switchBoard} onClose={onClose} />
      <PinboardScene
        activeSide={activeSide}
        isSwitching={isSwitching}
        isResetting={isFlipResetting}
        transition={boardTransition}
        boardRef={boardRef}
      >
        {boardSides.map((side) => {
          const selectedPinConfig = getSelectedPinConfig(side);
          const selectedPin = selectedPins[side];
          const isFilled = Boolean(selectedPin && selectedPinConfig);
          const contentTop = isFilled ? dockHeight + NOTE_CONTENT_GAP : dockHeight;
          const isFaceVisible = side === activeSide || side === boardTransition?.fromSide || side === boardTransition?.toSide;

          return (
            <BoardFace
              key={side}
              side={side}
              activeSide={activeSide}
              isSwitching={isSwitching}
              transition={boardTransition}
              nextSide={nextSide}
              onFlipBoard={() => switchBoard(nextSide, 1)}
            >
              <PinLayer
                side={side}
                activeSide={activeSide}
                isSwitching={isSwitching}
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
                isVisible={isFaceVisible}
                note={note}
                pin={selectedPinConfig}
                isFilled={isFilled}
                noteTextReady={noteTextReady[side]}
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