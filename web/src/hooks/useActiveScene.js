import { useEffect, useState } from 'react';

/** Track which scene id is most visible; used by ProgressNav. */
export function useActiveScene(sceneIds) {
  const [active, setActive] = useState(sceneIds[0]);

  useEffect(() => {
    const nodes = sceneIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    if (!nodes.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) {
          setActive(visible[0].target.id);
        }
      },
      { threshold: [0.15, 0.35, 0.55], rootMargin: '-10% 0px -35% 0px' }
    );

    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [sceneIds]);

  return active;
}
