import { useCallback, useEffect, useMemo, type Dispatch, type MutableRefObject, type SetStateAction } from 'react';
import type { PatchId } from '../data';
import {
  MAX_NOTE_DOCK_HEIGHT,
  MIN_NOTE_DOCK_HEIGHT,
  NOTE_DOCK_HEIGHT_RATIO,
} from '../constants';
import { clamp, getNoteLayoutForSize, getNotePinPositionForSize } from '../layout';
import type {
  BoardSide,
  PatchPositions,
  PatchPosition,
  PatchSizes,
  SelectedPin,
} from '../types';

type BoardSize = {
  width: number;
  height: number;
};

type SelectedPinsBySide = Record<BoardSide, SelectedPin<PatchId> | null>;

export default function useNoteDock(boardSize: BoardSize) {
  const note = useMemo(() => {
    return getNoteLayoutForSize(boardSize.width, boardSize.height);
  }, [boardSize.height, boardSize.width]);

  const dockHeight = useMemo(() => {
    return clamp(boardSize.height * NOTE_DOCK_HEIGHT_RATIO, MIN_NOTE_DOCK_HEIGHT, MAX_NOTE_DOCK_HEIGHT);
  }, [boardSize.height]);

  const isPointInsideNote = useCallback((x: number, y: number) => {
    return x >= note.x && x <= note.x + note.width && y >= note.y && y <= note.y + note.height;
  }, [note.height, note.width, note.x, note.y]);

  const getNotePinPosition = useCallback((width: number, height: number): PatchPosition => {
    return getNotePinPositionForSize(boardSize.width, boardSize.height, width, height);
  }, [boardSize.height, boardSize.width]);

  return {
    dockHeight,
    getNotePinPosition,
    isPointInsideNote,
    note,
  };
}

type UseDockedPinResizeOptions = {
  boardSize: BoardSize;
  patchSizes: MutableRefObject<PatchSizes<PatchId>>;
  selectedPinsRef: MutableRefObject<SelectedPinsBySide>;
  setPatchPositions: Dispatch<SetStateAction<PatchPositions<PatchId>>>;
};

export function useDockedPinResize({
  boardSize,
  patchSizes,
  selectedPinsRef,
  setPatchPositions,
}: UseDockedPinResizeOptions) {
  useEffect(() => {
    setPatchPositions((positions) => {
      const nextPositions: PatchPositions<PatchId> = {};
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
  }, [boardSize.height, boardSize.width, patchSizes, selectedPinsRef, setPatchPositions]);
}