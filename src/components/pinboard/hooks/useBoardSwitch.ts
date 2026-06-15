import { useCallback, useEffect, useRef, useState } from 'react';
import { BOARD_SWITCH_DURATION_MS } from '../constants';
import {
  boardSides,
  type BoardSide,
  type BoardSwitchDirection,
  type BoardTransition,
} from '../types';

function getBoardIndex(side: BoardSide) {
  return boardSides.indexOf(side);
}

function getBoardDirection(fromSide: BoardSide, toSide: BoardSide): BoardSwitchDirection {
  return getBoardIndex(toSide) > getBoardIndex(fromSide) ? 1 : -1;
}

function getNextBoard(side: BoardSide) {
  return boardSides[(getBoardIndex(side) + 1) % boardSides.length];
}

type UseBoardSwitchOptions = {
  reduceMotion: boolean;
};

export default function useBoardSwitch({ reduceMotion }: UseBoardSwitchOptions) {
  const switchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSwitchingRef = useRef(false);
  const activeSideRef = useRef<BoardSide>('work');
  const [activeSide, setActiveSide] = useState<BoardSide>('work');
  const [isSwitching, setIsSwitching] = useState(false);
  const [isFlipResetting, setIsFlipResetting] = useState(false);
  const [boardTransition, setBoardTransition] = useState<BoardTransition | null>(null);

  useEffect(() => {
    isSwitchingRef.current = isSwitching;
  }, [isSwitching]);

  useEffect(() => {
    activeSideRef.current = activeSide;
  }, [activeSide]);

  const switchBoard = useCallback((nextSide: BoardSide, directionOverride?: BoardSwitchDirection) => {
    const fromSide = activeSideRef.current;
    if (isSwitchingRef.current || fromSide === nextSide) return false;

    const direction = directionOverride || getBoardDirection(fromSide, nextSide);
    const switchDuration = reduceMotion ? 0 : BOARD_SWITCH_DURATION_MS;
    const resetDuration = reduceMotion ? 0 : 32;

    setIsSwitching(true);
    setBoardTransition({ fromSide, toSide: nextSide, direction });
    setActiveSide(nextSide);

    if (switchTimeout.current) {
      clearTimeout(switchTimeout.current);
    }

    if (resetTimeout.current) {
      clearTimeout(resetTimeout.current);
    }

    switchTimeout.current = setTimeout(() => {
      setIsFlipResetting(true);
      setActiveSide(nextSide);
      setIsSwitching(false);
      setBoardTransition(null);

      resetTimeout.current = setTimeout(() => {
        setIsFlipResetting(false);
      }, resetDuration);
    }, switchDuration);

    return true;
  }, [reduceMotion]);

  useEffect(() => {
    return () => {
      if (switchTimeout.current) {
        clearTimeout(switchTimeout.current);
      }

      if (resetTimeout.current) {
        clearTimeout(resetTimeout.current);
      }
    };
  }, []);

  return {
    activeSide,
    activeSideRef,
    boardTransition,
    isFlipResetting,
    isSwitching,
    isSwitchingRef,
    nextSide: getNextBoard(activeSide),
    switchBoard,
  };
}