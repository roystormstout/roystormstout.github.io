import { MAX_NOTE_DOCK_HEIGHT, MIN_NOTE_DOCK_HEIGHT, NOTE_DOCK_HEIGHT_RATIO, NOTE_HEIGHT, NOTE_WIDTH } from './constants';
import type { NoteLayout, PatchPosition } from './types';

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function getNoteLayoutForSize(boardWidth: number, boardHeight: number): NoteLayout {
  const sideReserve = boardWidth >= 1000 ? 540 : boardWidth >= 760 ? 460 : boardWidth >= 620 ? 360 : 200;
  const verticalReserve = boardHeight >= 700 ? 80 : boardHeight >= 540 ? 64 : 52;
  const width = Math.min(NOTE_WIDTH, Math.max(360, boardWidth - sideReserve));
  const height = Math.min(NOTE_HEIGHT, Math.max(320, boardHeight - verticalReserve));

  return {
    width,
    height,
    x: Math.max(6, (boardWidth - width) / 2),
    y: Math.max(6, (boardHeight - height) / 2),
  };
}

export function getNotePinPositionForSize(boardWidth: number, boardHeight: number, width: number, height: number): PatchPosition {
  const note = getNoteLayoutForSize(boardWidth, boardHeight);
  const dockHeight = clamp(boardHeight * NOTE_DOCK_HEIGHT_RATIO, MIN_NOTE_DOCK_HEIGHT, MAX_NOTE_DOCK_HEIGHT);

  return {
    x: clamp(note.x + 24, 0, boardWidth - width),
    y: clamp(note.y + dockHeight * 0.8 - height, 0, boardHeight - height),
  };
}