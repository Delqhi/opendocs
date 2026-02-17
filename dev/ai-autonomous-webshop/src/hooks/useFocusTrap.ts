import { useEffect } from 'react';

function getFocusable(container: HTMLElement) {
  const selectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(',');

  return Array.from(container.querySelectorAll<HTMLElement>(selectors)).filter((el) => {
    const style = window.getComputedStyle(el);
    return style.visibility !== 'hidden' && style.display !== 'none';
  });
}

export function useFocusTrap(options: {
  active: boolean;
  containerRef: React.RefObject<HTMLElement | null>;
  onEscape?: () => void;
  initialFocusSelector?: string;
  lockScroll?: boolean;
}) {
  const { active, containerRef, onEscape, initialFocusSelector, lockScroll = true } = options;

  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;

    const previousActive = document.activeElement as HTMLElement | null;

    // Scroll lock
    let previousOverflow: string | null = null;
    if (lockScroll) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }

    // Initial focus
    const focusTarget = initialFocusSelector
      ? (container.querySelector(initialFocusSelector) as HTMLElement | null)
      : null;

    const focusables = getFocusable(container);
    (focusTarget ?? focusables[0] ?? container).focus?.();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onEscape?.();
        return;
      }

      if (e.key !== 'Tab') return;

      const currentFocusables = getFocusable(container);
      if (currentFocusables.length === 0) {
        e.preventDefault();
        return;
      }

      const first = currentFocusables[0];
      const last = currentFocusables[currentFocusables.length - 1];
      const activeEl = document.activeElement as HTMLElement | null;

      if (e.shiftKey) {
        if (!activeEl || activeEl === first || !container.contains(activeEl)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (!activeEl || activeEl === last || !container.contains(activeEl)) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (lockScroll && previousOverflow !== null) {
        document.body.style.overflow = previousOverflow;
      }
      previousActive?.focus?.();
    };
  }, [active, containerRef, initialFocusSelector, lockScroll, onEscape]);
}
