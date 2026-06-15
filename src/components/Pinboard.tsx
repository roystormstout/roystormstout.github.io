import { useRef, useState } from 'react';
import './pinboard/Pinboard.css';
import BoardFace from './pinboard/BoardFace';
import PinboardHeader from './pinboard/PinboardHeader';
import PinboardScene from './pinboard/PinboardScene';
import PinLayer from './pinboard/PinLayer';
import PinNote from './pinboard/PinNote';
import { boardPins, type PatchId } from './pinboard/data';
import useBoardSize from './pinboard/hooks/useBoardSize';
import { NOTE_CONTENT_GAP } from './pinboard/constants';
import useBoardSwitch from './pinboard/hooks/useBoardSwitch';
import useNoteDock, { useDockedPinResize } from './pinboard/hooks/useNoteDock';
import usePinDrag from './pinboard/hooks/usePinDrag';
import usePrefersReducedMotion from './pinboard/hooks/usePrefersReducedMotion';
import useSelectedPins from './pinboard/hooks/useSelectedPins';
import {
  boardSides,
  type BoardSide,
  type BoardSwitchDirection,
  type PatchPositions,
  type PatchSwings,
  type PinboardProps,
} from './pinboard/types';

export default function Pinboard({ onClose }: PinboardProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const reduceMotion = usePrefersReducedMotion();
  const boardSize = useBoardSize(boardRef);
  const [patchPositions, setPatchPositions] = useState<PatchPositions<PatchId>>({});
  const [patchSwings, setPatchSwings] = useState<PatchSwings<PatchId>>({});
  const { dockHeight, getNotePinPosition, isPointInsideNote, note } = useNoteDock(boardSize);
  const {
    activeSide,
    boardTransition,
    isFlipResetting,
    isSwitching,
    isSwitchingRef,
    nextSide,
    switchBoard,
  } = useBoardSwitch({ reduceMotion });
  const {
    attachPinToNote,
    clearSelectedPin,
    detachPinFromNote,
    getSelectedPinConfig,
    noteTextReady,
    selectedPins,
    selectedPinsRef,
  } = useSelectedPins({
    getNotePinPosition,
    onDetach: () => undefined,
    reduceMotion,
    setPatchPositions,
  });
  const {
    activatePinFromElement,
    draggingPatch,
    patchSizes,
    resetDrag,
    startDragging,
  } = usePinDrag({
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
  });

  useDockedPinResize({
    boardSize,
    patchSizes,
    selectedPinsRef,
    setPatchPositions,
  });

  function handleSwitchBoard(side: BoardSide, directionOverride?: BoardSwitchDirection) {
    if (switchBoard(side, directionOverride)) {
      resetDrag();
    }
  }

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
      <PinboardHeader activeSide={activeSide} isSwitching={isSwitching} onSelectBoard={handleSwitchBoard} onClose={onClose} />
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
              onFlipBoard={() => handleSwitchBoard(nextSide, 1)}
            >
              {isFaceVisible && (
                <>
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
                </>
              )}
            </BoardFace>
          );
        })}
      </PinboardScene>
    </section>
  );
}