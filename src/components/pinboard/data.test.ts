import { describe, expect, it } from 'vitest';
import { boardPins, type PinConfig } from './data';
import { boardSides, type BoardSide } from './types';

type PinEntry = {
  side: BoardSide;
  pin: PinConfig;
};

const allPins: PinEntry[] = boardSides.flatMap((side) => (
  (boardPins[side] as readonly PinConfig[]).map((pin) => ({ side, pin }))
));

describe('pinboard content data', () => {
  it('keeps pin IDs globally unique', () => {
    const ids = allPins.map(({ pin }) => pin.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has complete display content for every pin', () => {
    for (const { pin, side } of allPins) {
      expect(pin.title, `${side}/${pin.id} title`).not.toHaveLength(0);
      expect(pin.year, `${side}/${pin.id} year`).not.toHaveLength(0);
      expect(pin.subtitle, `${side}/${pin.id} subtitle`).not.toHaveLength(0);
      expect(pin.description, `${side}/${pin.id} description`).not.toHaveLength(0);
      expect(pin.bullets.length, `${side}/${pin.id} bullets`).toBeGreaterThan(0);
      expect(pin.bullets.every((bullet) => bullet.length > 0), `${side}/${pin.id} bullet text`).toBe(true);
    }
  });

  it('keeps optional external links well formed', () => {
    for (const { pin, side } of allPins) {
      const link = pin.link;

      if (!link) {
        expect(pin.linkLabel, `${side}/${pin.id} link label without link`).toBeUndefined();
        continue;
      }

      expect(() => new URL(link), `${side}/${pin.id} URL`).not.toThrow();
      expect(pin.linkLabel, `${side}/${pin.id} link label`).toBeTruthy();
    }
  });
});