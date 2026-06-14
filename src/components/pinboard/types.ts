import type { CSSProperties } from 'react';

export type PatchId = 'controller' | 'temple' | 'aussie' | 'corgi';
export type BoardSide = 'professional' | 'hobby';

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
  size: 'md' | 'lg';
  initialRotate: number;
  hoverRotate: number;
  anchor: CSSProperties;
  title: string;
  eyebrow: string;
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