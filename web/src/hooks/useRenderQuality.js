import { useEffect, useMemo, useState } from 'react';
import { useReducedMotion } from './useReducedMotion.js';

/**
 * Adaptive render quality for the shared visual world.
 * HIGH  — desktop / powerful
 * MEDIUM — tablets / average laptops
 * LOW   — phones / constrained devices
 */
export function useRenderQuality() {
  const reducedMotion = useReducedMotion();
  const [viewport, setViewport] = useState(() => readViewport());

  useEffect(() => {
    const update = () => setViewport(readViewport());
    update();
    window.addEventListener('resize', update, { passive: true });
    window.addEventListener('orientationchange', update, { passive: true });

    let ro;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(update);
      ro.observe(document.documentElement);
    }

    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
      ro?.disconnect();
    };
  }, []);

  const level = useMemo(() => {
    if (reducedMotion) return 'LOW';

    const { width, height, dpr, cores, saveData, coarse } = viewport;
    const shortSide = Math.min(width, height);
    const longSide = Math.max(width, height);

    // Phones / very small windows
    if (shortSide < 600 || width < 480) return 'LOW';

    // Weak hardware or data-saver
    if (saveData || (cores && cores <= 4 && dpr >= 2 && shortSide < 900)) {
      return shortSide < 820 ? 'LOW' : 'MEDIUM';
    }

    // Tablets / small laptops
    if (shortSide < 900 || longSide < 1100 || coarse) return 'MEDIUM';

    return 'HIGH';
  }, [reducedMotion, viewport]);

  return useMemo(() => {
    const profile = QUALITY[level];
    return {
      level,
      ...profile,
      viewport,
      reducedMotion,
      isPortrait: viewport.height >= viewport.width,
      isLandscapePhone:
        viewport.width < 900 &&
        viewport.height < 500 &&
        viewport.width > viewport.height,
    };
  }, [level, viewport, reducedMotion]);
}

function readViewport() {
  const width = window.innerWidth || 1024;
  const height = window.innerHeight || 768;
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  const cores = navigator.hardwareConcurrency || 0;
  const saveData = Boolean(navigator.connection?.saveData);
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  return { width, height, dpr, cores, saveData, coarse };
}

const QUALITY = {
  HIGH: {
    particleCount: 56,
    storyCols: 72,
    depthAmp: 0.55,
    parallax: 1,
    maxAsciiWidth: 160,
    defaultAsciiWidth: 100,
    stagePerspective: true,
    continuousField: true,
  },
  MEDIUM: {
    particleCount: 34,
    storyCols: 56,
    depthAmp: 0.35,
    parallax: 0.55,
    maxAsciiWidth: 120,
    defaultAsciiWidth: 80,
    stagePerspective: true,
    continuousField: true,
  },
  LOW: {
    particleCount: 18,
    storyCols: 40,
    depthAmp: 0.14,
    parallax: 0.2,
    maxAsciiWidth: 80,
    defaultAsciiWidth: 56,
    stagePerspective: false,
    continuousField: false,
  },
};
