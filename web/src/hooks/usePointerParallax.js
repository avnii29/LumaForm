import { useEffect, useState } from 'react';
import { useReducedMotion } from './useReducedMotion.js';

/** Normalized pointer/touch offset in roughly -1…1 for subtle parallax. */
export function usePointerParallax(enabled = true, strength = 1) {
  const reduced = useReducedMotion();
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled || reduced || strength <= 0) {
      setOffset({ x: 0, y: 0 });
      return undefined;
    }

    let frame = 0;
    const apply = (clientX, clientY) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const x = ((clientX / window.innerWidth) * 2 - 1) * strength;
        const y = ((clientY / window.innerHeight) * 2 - 1) * strength;
        setOffset({ x, y });
      });
    };

    const onMove = (e) => apply(e.clientX, e.clientY);
    const onTouch = (e) => {
      const t = e.touches?.[0];
      if (t) apply(t.clientX, t.clientY);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('touchmove', onTouch, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('touchmove', onTouch);
    };
  }, [enabled, reduced, strength]);

  return offset;
}
