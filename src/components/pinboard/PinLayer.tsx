import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import DecorativePatch from '../DecorativePatch';
import type { PatchId, PinConfig } from './data';
import type { BoardSide, PatchPositions, PatchSwings, SelectedPin } from './types';

type PinLayerProps = {
  side: BoardSide;
  activeSide: BoardSide;
  isSwitching: boolean;
  pins: readonly PinConfig[];
  selectedPin: SelectedPin<PatchId> | null;
  draggingPatch: PatchId | null;
  patchPositions: PatchPositions<PatchId>;
  patchSwings: PatchSwings<PatchId>;
  onPointerDown: (side: BoardSide, id: PatchId, event: ReactPointerEvent<HTMLElement>) => void;
  onActivate: (side: BoardSide, id: PatchId, element: HTMLElement) => void;
};

function getPatchStyle(id: PatchId, anchoredStyle: CSSProperties, patchPositions: PatchPositions<PatchId>): CSSProperties {
  const position = patchPositions[id];

  if (!position) {
    return anchoredStyle;
  }

  return {
    left: position.x,
    top: position.y,
  };
}

export default function PinLayer({
  side,
  activeSide,
  isSwitching,
  pins,
  selectedPin,
  draggingPatch,
  patchPositions,
  patchSwings,
  onPointerDown,
  onActivate,
}: PinLayerProps) {
  const isActivePinSide = !isSwitching && activeSide === side;

  return (
    <>
      {pins.map((pin) => {
        const isSelected = selectedPin?.id === pin.id && selectedPin.side === side;

        return (
          <DecorativePatch
            key={pin.id}
            image={pin.image}
            style={{
              ...getPatchStyle(pin.id, pin.anchor, patchPositions),
              zIndex: isSelected ? 42 : 36,
            }}
            size={pin.size}
            initialRotate={pin.initialRotate}
            hoverRotate={pin.hoverRotate}
            draggable={isActivePinSide}
            isDragging={draggingPatch === pin.id}
            swingRotation={patchSwings[pin.id] || 0}
            boardShadow
            role={isActivePinSide ? 'button' : undefined}
            tabIndex={isActivePinSide ? 0 : -1}
            ariaLabel={isActivePinSide ? `Open details for ${pin.title}` : undefined}
            onPointerDown={isActivePinSide ? (event) => onPointerDown(side, pin.id, event) : undefined}
            onClick={isActivePinSide ? (event) => onActivate(side, pin.id, event.currentTarget) : undefined}
          />
        );
      })}
    </>
  );
}