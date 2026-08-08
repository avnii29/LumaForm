import { useEffect, useState } from 'react';

/**
 * Scroll progress 0→1 through a tall scene section.
 * Section should be taller than the viewport; sticky content lives inside.
 */
export function useSceneProgress(sectionRef) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return undefined;

    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const travel = el.offsetHeight - window.innerHeight;
        if (travel <= 0) {
          setProgress(rect.top < window.innerHeight / 2 ? 1 : 0);
          return;
        }
        const scrolled = -rect.top;
        const raw = Math.min(1, Math.max(0, scrolled / travel));
        // Smoothstep for seamless stage morphs
        const p = raw * raw * (3 - 2 * raw);
        setProgress(p);
      });
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [sectionRef]);

  return progress;
}
