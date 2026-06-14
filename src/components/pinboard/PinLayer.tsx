import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import DecorativePatch from '../DecorativePatch';
import type { BoardSide, PatchId, PatchPosition, PinConfig, SelectedPin } from './types';

type PinLayerProps = {
  side: BoardSide;
  activeSide: BoardSide;
  isFlipping: boolean;
  pins: PinConfig[];
  selectedPin: SelectedPin | null;
  draggingPatch: PatchId | null;
  patchPositions: Partial<Record<PatchId, PatchPosition>>;
  patchSwings: Partial<Record<PatchId, number>>;
  onPointerDown: (side: BoardSide, id: PatchId, event: ReactPointerEvent<HTMLDivElement>) => void;
  onActivate: (side: BoardSide, id: PatchId, element: HTMLElement) => void;
};

function getPatchStyle(id: PatchId, anchoredStyle: CSSProperties, patchPositions: Partial<Record<PatchId, PatchPosition>>): CSSProperties {
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
  isFlipping,
  pins,
  selectedPin,
  draggingPatch,
  patchPositions,
  patchSwings,
  onPointerDown,
  onActivate,
}: PinLayerProps) {
  const isActivePinSide = !isFlipping && activeSide === side;

  return (
    <>
      {pins.map((pin) => (
        <DecorativePatch
          key={pin.id}
          image={pin.image}
          style={{
            ...getPatchStyle(pin.id, pin.anchor, patchPositions),
            zIndex: selectedPin?.id === pin.id && selectedPin.side === side ? 34 : undefined,
          }}
          size={pin.size}
          initialRotate={pin.initialRotate}
          hoverRotate={pin.hoverRotate}
          disableAnimation={false}
          draggable={isActivePinSide}
          isDragging={draggingPatch === pin.id}
          swingRotation={patchSwings[pin.id] || 0}
          boardShadow
          role={isActivePinSide ? 'button' : undefined}
          tabIndex={isActivePinSide ? 0 : -1}
          ariaLabel={isActivePinSide ? `Open details for ${pin.title}` : undefined}
          onPointerDown={(event) => onPointerDown(side, pin.id, event)}
          onClick={(event) => onActivate(side, pin.id, event.currentTarget)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              onActivate(side, pin.id, event.currentTarget);
            }
          }}
        />
      ))}
    </>
  );
}