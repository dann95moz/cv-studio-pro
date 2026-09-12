import { useState, useEffect, useRef, useCallback } from 'react';

export interface CanvasTouchGesturesOptions {
  containerRef: React.RefObject<HTMLElement | null>;
  baseScale: number;
  minScale?: number;
  maxScale?: number;
  onScaleChange?: (scale: number) => void;
  onResetFit?: () => void;
}

export interface CanvasTouchGesturesResult {
  currentScale: number;
  isPinching: boolean;
  isZoomed: boolean;
  resetToFit: () => void;
  setManualScale: (scale: number) => void;
}

/**
 * High-Performance Touch Gestures Hook for A4 Document Canvas.
 * Implements 0ms-latency 2-finger Pinch-to-Zoom without introducing
 * double-tap delays or blocking native single-finger scrolling.
 */
export function useCanvasTouchGestures({
  containerRef,
  baseScale,
  minScale = 0.35,
  maxScale = 2.5,
  onScaleChange,
  onResetFit,
}: CanvasTouchGesturesOptions): CanvasTouchGesturesResult {
  const [currentScale, setCurrentScale] = useState<number>(baseScale);
  const [isPinching, setIsPinching] = useState<boolean>(false);

  const initialDistanceRef = useRef<number>(0);
  const initialScaleRef = useRef<number>(baseScale);
  const hasUserOverriddenScaleRef = useRef<boolean>(false);

  // Sync with baseScale when not manually overridden
  useEffect(() => {
    if (!hasUserOverriddenScaleRef.current) {
      setCurrentScale(baseScale);
    }
  }, [baseScale]);

  const resetToFit = useCallback(() => {
    hasUserOverriddenScaleRef.current = false;
    setCurrentScale(baseScale);
    onResetFit?.();
  }, [baseScale, onResetFit]);

  const setManualScale = useCallback((scale: number) => {
    hasUserOverriddenScaleRef.current = true;
    const clamped = Math.min(maxScale, Math.max(minScale, scale));
    setCurrentScale(clamped);
    onScaleChange?.(clamped);
  }, [minScale, maxScale, onScaleChange]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        setIsPinching(true);
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        initialDistanceRef.current = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        initialScaleRef.current = currentScale;
        hasUserOverriddenScaleRef.current = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && initialDistanceRef.current > 0) {
        e.preventDefault(); // Prevent browser-level viewport zoom
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );

        const scaleFactor = currentDistance / initialDistanceRef.current;
        const newScale = Math.min(
          maxScale,
          Math.max(minScale, initialScaleRef.current * scaleFactor)
        );

        setCurrentScale(newScale);
        onScaleChange?.(newScale);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        setIsPinching(false);
        initialDistanceRef.current = 0;
      }
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    element.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [containerRef, currentScale, minScale, maxScale, onScaleChange]);

  const isZoomed = Math.abs(currentScale - baseScale) > 0.05;

  return {
    currentScale,
    isPinching,
    isZoomed,
    resetToFit,
    setManualScale,
  };
}
