import { useCallback, useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import {
  NOTE_TEXT_DELAY_MS,
} from '../constants';
import { getPinConfig, type PatchId } from '../data';
import { type BoardSide, type PatchPosition, type PatchPositions, type SelectedPin } from '../types';

type SelectedPinsBySide = Record<BoardSide, SelectedPin<PatchId> | null>;
type NoteTextReadyBySide = Record<BoardSide, boolean>;

const emptySelectedPins: SelectedPinsBySide = {
  work: null,
  research: null,
  play: null,
};

const emptyNoteTextReady: NoteTextReadyBySide = {
  work: false,
  research: false,
  play: false,
};

type UseSelectedPinsOptions = {
  getNotePinPosition: (width: number, height: number) => PatchPosition;
  reduceMotion: boolean;
  setPatchPositions: Dispatch<SetStateAction<PatchPositions<PatchId>>>;
  onDetach: () => void;
};

export default function useSelectedPins({
  getNotePinPosition,
  reduceMotion,
  setPatchPositions,
  onDetach,
}: UseSelectedPinsOptions) {
  const selectedPinsRef = useRef<SelectedPinsBySide>(emptySelectedPins);
  const [selectedPins, setSelectedPins] = useState<SelectedPinsBySide>(emptySelectedPins);
  const [noteTextReady, setNoteTextReady] = useState<NoteTextReadyBySide>(emptyNoteTextReady);

  const attachPinToNote = useCallback((side: BoardSide, id: PatchId, previousPosition: PatchPosition, width: number, height: number) => {
    const nextPosition = getNotePinPosition(width, height);
    const currentPin = selectedPinsRef.current[side];

    setPatchPositions((positions) => ({
      ...positions,
      ...(currentPin && currentPin.id !== id
        ? { [currentPin.id]: currentPin.previousPosition }
        : {}),
      [id]: nextPosition,
    }));
    setNoteTextReady((ready) => ({ ...ready, [side]: false }));
    setSelectedPins((pins) => ({ ...pins, [side]: { side, id, previousPosition } }));
  }, [getNotePinPosition, setPatchPositions]);

  const clearSelectedPin = useCallback((side: BoardSide) => {
    setNoteTextReady((ready) => ({ ...ready, [side]: false }));
    setSelectedPins((pins) => ({ ...pins, [side]: null }));
  }, []);

  const detachPinFromNote = useCallback((side: BoardSide) => {
    const pin = selectedPinsRef.current[side];

    if (!pin) return;

    setPatchPositions((positions) => ({
      ...positions,
      [pin.id]: pin.previousPosition,
    }));
    onDetach();
    clearSelectedPin(side);
  }, [clearSelectedPin, onDetach, setPatchPositions]);

  const getSelectedPinConfig = useCallback((side: BoardSide) => {
    const selectedPin = selectedPins[side];
    if (!selectedPin) return null;
    return getPinConfig(side, selectedPin.id);
  }, [selectedPins]);

  useEffect(() => {
    selectedPinsRef.current = selectedPins;
  }, [selectedPins]);

  useEffect(() => {
    if (reduceMotion) {
      return;
    }

    const timeoutIds = (Object.entries(selectedPins) as Array<[BoardSide, SelectedPin<PatchId> | null]>).flatMap(([side, pin]) => {
      if (!pin) return [];

      const timeoutId = setTimeout(() => {
        setNoteTextReady((ready) => ({ ...ready, [side]: true }));
      }, NOTE_TEXT_DELAY_MS);

      return [timeoutId];
    });

    return () => {
      timeoutIds.forEach((timeoutId) => clearTimeout(timeoutId));
    };
  }, [reduceMotion, selectedPins]);

  const readyState = useMemo(() => {
    if (!reduceMotion) return noteTextReady;

    return {
      work: Boolean(selectedPins.work),
      research: Boolean(selectedPins.research),
      play: Boolean(selectedPins.play),
    };
  }, [noteTextReady, reduceMotion, selectedPins.play, selectedPins.research, selectedPins.work]);

  return {
    attachPinToNote,
    clearSelectedPin,
    detachPinFromNote,
    getSelectedPinConfig,
    noteTextReady: readyState,
    selectedPins,
    selectedPinsRef,
  };
}