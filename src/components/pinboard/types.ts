import type { CSSProperties } from 'react';

export type PatchId = 'paper' | 'azure' | 'xbox' | 'mahjong' | 'killstreak' | 'ironman' | 'happyEnding';
export const boardSides = ['work', 'research', 'play'] as const;
export type BoardSide = (typeof boardSides)[number];
export type BoardSwitchDirection = -1 | 1;

export const boardLabels: Record<BoardSide, string> = {
  work: 'Work',
  research: 'Research Lab',
  play: 'Play Tests',
};

export type PatchPosition = {
  x: number;
  y: number;
};

export type DragState = PatchPosition & {
  id: PatchId;
  side: BoardSide;
  width: number;
  height: number;
  previousPosition: PatchPosition;
  currentX: number;
  currentY: number;
  startClientX: number;
  startClientY: number;
  lastClientX: number;
  lastClientY: number;
  lastTime: number;
  velocityX: number;
  velocityY: number;
  hasMoved: boolean;
};

export type PinboardProps = {
  onClose: () => void;
};

export type PinConfig = {
  id: PatchId;
  image: string;
  size: 'sm' | 'md' | 'lg';
  initialRotate: number;
  hoverRotate: number;
  anchor: CSSProperties;
  title: string;
  year: string;
  subtitle: string;
  description: string;
  bullets: string[];
  link?: string;
  linkLabel?: string;
};

export type SelectedPin = {
  side: BoardSide;
  id: PatchId;
  previousPosition: PatchPosition;
};

export type NoteLayout = PatchPosition & {
  width: number;
  height: number;
};

export type BoardTransition = {
  fromSide: BoardSide;
  toSide: BoardSide;
  direction: BoardSwitchDirection;
};