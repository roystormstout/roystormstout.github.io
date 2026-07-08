import { describe, expect, it } from 'vitest';
import {
  MAX_NOTE_DOCK_HEIGHT,
  MIN_NOTE_DOCK_HEIGHT,
  NOTE_DOCK_HEIGHT_RATIO,
} from './constants';
import { clamp, getNoteLayoutForSize, getNotePinPositionForSize } from './layout';

describe('pinboard layout helpers', () => {
  it('clamps values to the provided range', () => {
    expect(clamp(8, 0, 10)).toBe(8);
    expect(clamp(-3, 0, 10)).toBe(0);
    expect(clamp(12, 0, 10)).toBe(10);
  });

  it('centers the note while preserving reserved side and vertical space', () => {
    expect(getNoteLayoutForSize(1200, 800)).toEqual({
      width: 660,
      height: 720,
      x: 270,
      y: 40,
    });

    expect(getNoteLayoutForSize(500, 400)).toEqual({
      width: 360,
      height: 348,
      x: 70,
      y: 26,
    });
  });

  it('places docked pins near the note dock and inside board bounds', () => {
    const position = getNotePinPositionForSize(1200, 800, 100, 80);
    const dockHeight = clamp(800 * NOTE_DOCK_HEIGHT_RATIO, MIN_NOTE_DOCK_HEIGHT, MAX_NOTE_DOCK_HEIGHT);

    expect(position.x).toBe(294);
    expect(position.y).toBeCloseTo(40 + dockHeight * 0.8 - 80);
    expect(position.x).toBeGreaterThanOrEqual(0);
    expect(position.y).toBeGreaterThanOrEqual(0);
    expect(position.x).toBeLessThanOrEqual(1100);
    expect(position.y).toBeLessThanOrEqual(720);
  });
});