import type { CSSProperties } from 'react';

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

export type PatchSize = {
  width: number;
  height: number;
};

export type PatchSizes<Id extends string = string> = Partial<Record<Id, PatchSize>>;
export type PatchPositions<Id extends string = string> = Partial<Record<Id, PatchPosition>>;
export type PatchSwings<Id extends string = string> = Partial<Record<Id, number>>;

export type DragState<Id extends string = string> = PatchPosition & {
  id: Id;
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
  /** Whether the pinboard is the active view; gates keyboard controls. Defaults to true. */
  active?: boolean;
};

export type PinImageSet = {
  src: string;
  avifSrcSet: string;
  webpSrcSet: string;
  sizes: string;
};

export type PinConfigBase<Id extends string = string> = {
  id: Id;
  image: PinImageSet;
  size: 'sm' | 'md' | 'lg';
  initialRotate: number;
  hoverRotate: number;
  anchor: CSSProperties;
  title: string;
  year: string;
  subtitle: string;
  description: string;
  bullets: readonly string[];
  link?: string;
  linkLabel?: string;
};

export type SelectedPin<Id extends string = string> = {
  side: BoardSide;
  id: Id;
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