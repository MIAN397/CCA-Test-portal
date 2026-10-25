import Lenis from 'lenis';
import { useEffect } from 'react';

let lenisInstance: Lenis | null = null;
let activeModalCount = 0;

/**
 * Initializes the global Lenis smooth scrolling instance
 */
export function initLenis(): Lenis | null {
  if (typeof window === 'undefined') return null;
  if (!lenisInstance) {
    lenisInstance = new Lenis({
      duration: 0.9,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });

    function raf(time: number) {
      if (lenisInstance) {
        lenisInstance.raf(time);
      }
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }
  return lenisInstance;
}

export function getLenis(): Lenis | null {
  return lenisInstance;
}

/**
 * Stop Lenis and lock body scroll when a modal/popup opens
 */
export function lockScroll(): void {
  activeModalCount++;
  if (activeModalCount === 1) {
    if (lenisInstance) {
      lenisInstance.stop();
    }
    document.body.classList.add('modal-open');
  }
}

/**
 * Resume Lenis and restore body scroll when all modals are closed
 */
export function unlockScroll(): void {
  activeModalCount = Math.max(0, activeModalCount - 1);
  if (activeModalCount === 0) {
    if (lenisInstance) {
      lenisInstance.start();
    }
    document.body.classList.remove('modal-open');
  }
}

/**
 * React hook to lock body & Lenis scroll while a modal is open
 */
export function useModalScrollLock(isOpen: boolean): void {
  useEffect(() => {
    if (isOpen) {
      lockScroll();
      return () => {
        unlockScroll();
      };
    }
  }, [isOpen]);
}
