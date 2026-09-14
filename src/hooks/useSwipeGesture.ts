import { useRef, useCallback } from 'react';

export interface UseSwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  minDistance?: number;
  edgeThreshold?: number;
  enabled?: boolean;
}

const INTERACTIVE_SELECTORS = [
  'input',
  'textarea',
  'select',
  'button',
  'a',
  '[role="button"]',
  '.MuiInputBase-root',
  '.MuiIconButton-root',
  '.MuiChip-root',
  '.MuiButton-root',
  '.MuiButtonBase-root',
  '.no-swipe',
].join(',');

/**
 * High-precision swipe gesture hook tailored for forms and interactive views.
 * 
 * Safety features:
 * 1. 100% disabled when touch originates inside an interactive element (input, textarea, button, chip).
 * 2. 100% disabled within edge zones (< 24px) to avoid colliding with Android system back/navigation gestures.
 * 3. Immediately cancels horizontal gesture if vertical displacement exceeds horizontal (preserving native scrolling).
 */
export function useSwipeGesture({
  onSwipeLeft,
  onSwipeRight,
  minDistance = 45,
  edgeThreshold = 24,
  enabled = true,
}: UseSwipeGestureOptions) {
  const startXRef = useRef<number | null>(null);
  const startYRef = useRef<number | null>(null);
  const isCancelledRef = useRef<boolean>(false);
  const isHorizontalGestureRef = useRef<boolean>(false);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled || e.touches.length !== 1) {
        isCancelledRef.current = true;
        return;
      }

      const touch = e.touches[0];
      const target = e.target as HTMLElement | null;

      // 1. Exclusion: Never trigger on interactive elements (inputs, buttons, chips, textareas)
      if (target && target.closest(INTERACTIVE_SELECTORS)) {
        isCancelledRef.current = true;
        return;
      }

      // 2. Edge Exclusion: Never trigger near screen edges to protect Android system back gesture
      const clientX = touch.clientX;
      const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 360;
      if (clientX < edgeThreshold || clientX > screenWidth - edgeThreshold) {
        isCancelledRef.current = true;
        return;
      }

      startXRef.current = touch.clientX;
      startYRef.current = touch.clientY;
      isCancelledRef.current = false;
      isHorizontalGestureRef.current = false;
    },
    [enabled, edgeThreshold]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (isCancelledRef.current || startXRef.current === null || startYRef.current === null) {
        return;
      }

      const touch = e.touches[0];
      const deltaX = touch.clientX - startXRef.current;
      const deltaY = touch.clientY - startYRef.current;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      // If user is clearly scrolling vertically, cancel horizontal swipe recognition
      if (!isHorizontalGestureRef.current && absY > 10 && absY > absX) {
        isCancelledRef.current = true;
        return;
      }

      // Mark as locked into horizontal swipe once horizontal movement clearly dominates
      if (absX > 15 && absX > absY * 1.25) {
        isHorizontalGestureRef.current = true;
      }
    },
    []
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (isCancelledRef.current || startXRef.current === null || startYRef.current === null) {
        startXRef.current = null;
        startYRef.current = null;
        isCancelledRef.current = false;
        isHorizontalGestureRef.current = false;
        return;
      }

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - startXRef.current;
      const deltaY = touch.clientY - startYRef.current;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      // Verify horizontal threshold and dominance
      if (absX >= minDistance && absX > absY * 1.2) {
        if (typeof e.stopPropagation === 'function') {
          e.stopPropagation();
        }
        if (deltaX < 0) {
          onSwipeLeft?.();
        } else {
          onSwipeRight?.();
        }
      }

      startXRef.current = null;
      startYRef.current = null;
      isCancelledRef.current = false;
      isHorizontalGestureRef.current = false;
    },
    [minDistance, onSwipeLeft, onSwipeRight]
  );

  const handleTouchCancel = useCallback(() => {
    startXRef.current = null;
    startYRef.current = null;
    isCancelledRef.current = false;
    isHorizontalGestureRef.current = false;
  }, []);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: handleTouchCancel,
  };
}
