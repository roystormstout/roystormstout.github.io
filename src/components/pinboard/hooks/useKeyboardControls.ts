import { useEffect, useRef } from 'react';

export type KeyBinding = {
  /** Keys that trigger the action, matched case-insensitively against KeyboardEvent.key. */
  keys: readonly string[];
  /** Handler invoked when one of the bound keys is pressed. */
  action: (event: KeyboardEvent) => void;
  /** Prevent the key's default browser behaviour. Defaults to true. */
  preventDefault?: boolean;
  /** Allow the binding to fire while a text field is focused. Defaults to false. */
  allowInInput?: boolean;
};

type UseKeyboardControlsOptions = {
  /** When false no listeners are attached and all bindings are dormant. Defaults to true. */
  enabled?: boolean;
  /** Event target to bind to. Defaults to window. */
  target?: Window | HTMLElement | null;
};

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
}

/**
 * A small, declarative keyboard-control system. Pass a list of bindings that map
 * keys to actions; the hook owns listener lifecycle, modifier/typing guards, and
 * default-prevention so individual components stay free of inline key handling.
 */
export default function useKeyboardControls(
  bindings: readonly KeyBinding[],
  { enabled = true, target }: UseKeyboardControlsOptions = {},
): void {
  // Hold the latest bindings in a ref so the listener never needs re-attaching
  // when callers pass freshly-created closures on every render.
  const bindingsRef = useRef(bindings);
  useEffect(() => {
    bindingsRef.current = bindings;
  });

  useEffect(() => {
    if (!enabled) return;
    const node: Window | HTMLElement = target ?? window;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Leave browser/OS chords (Ctrl/Meta/Alt) alone.
      if (event.ctrlKey || event.metaKey || event.altKey) return;

      const key = event.key.toLowerCase();
      const editable = isEditableTarget(event.target);

      for (const binding of bindingsRef.current) {
        if (!binding.keys.some((boundKey) => boundKey.toLowerCase() === key)) continue;
        if (editable && !binding.allowInInput) continue;

        if (binding.preventDefault ?? true) {
          event.preventDefault();
        }
        binding.action(event);
        return;
      }
    };

    node.addEventListener('keydown', handleKeyDown as EventListener);
    return () => node.removeEventListener('keydown', handleKeyDown as EventListener);
  }, [enabled, target]);
}
