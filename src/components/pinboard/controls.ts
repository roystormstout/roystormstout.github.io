/**
 * Pinboard keyboard control scheme.
 *
 * Every shortcut lives here so the mapping is defined in one place and consumed
 * declaratively via `useKeyboardControls`, rather than scattered across inline
 * key handlers. Keys are matched case-insensitively against `KeyboardEvent.key`.
 */
export const BOARD_KEY_CONTROLS = {
  /** Flip to the previous board. */
  previousBoard: ['ArrowLeft', 'a'],
  /** Flip to the next board. */
  nextBoard: ['ArrowRight', 'd'],
  /** Leave the pinboard and return to the bio. */
  back: ['Escape'],
} as const;

/** Human-readable shortcut hints for `aria-keyshortcuts` attributes. */
export const BOARD_KEY_HINTS = {
  nextBoard: 'ArrowRight D',
  previousBoard: 'ArrowLeft A',
  back: 'Escape',
} as const;
