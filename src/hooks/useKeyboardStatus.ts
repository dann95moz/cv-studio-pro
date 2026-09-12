import { useState, useEffect } from 'react';

export interface KeyboardStatus {
  isKeyboardVisible: boolean;
  keyboardHeight: number;
}

/**
 * Universal Mobile Keyboard Detection Hook.
 * Observes the browser/WebView `window.visualViewport` to accurately track
 * virtual keyboard appearance, dismissal, and height in real time.
 */
export function useKeyboardStatus(): KeyboardStatus {
  const [status, setStatus] = useState<KeyboardStatus>({
    isKeyboardVisible: false,
    keyboardHeight: 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) {
      return;
    }

    const vv = window.visualViewport;

    const updateKeyboardStatus = () => {
      const windowHeight = window.innerHeight;
      const viewportHeight = vv.height;
      const diff = windowHeight - viewportHeight;

      // Threshold: A height delta > 150px reliably indicates a virtual keyboard (e.g. Gboard, SwiftKey)
      const isVisible = diff > 150;
      const calculatedHeight = isVisible ? Math.round(diff) : 0;

      setStatus((prev) => {
        if (prev.isKeyboardVisible === isVisible && Math.abs(prev.keyboardHeight - calculatedHeight) < 5) {
          return prev;
        }
        return {
          isKeyboardVisible: isVisible,
          keyboardHeight: calculatedHeight,
        };
      });
    };

    vv.addEventListener('resize', updateKeyboardStatus);
    vv.addEventListener('scroll', updateKeyboardStatus);

    return () => {
      vv.removeEventListener('resize', updateKeyboardStatus);
      vv.removeEventListener('scroll', updateKeyboardStatus);
    };
  }, []);

  return status;
}
