import { usePointerParallax } from '../hooks/usePointerParallax.js';
import { useQuality } from '../context/QualityContext.jsx';

/**
 * Floating 2.5D stage: perspective tilt, layered glow, soft floor shadow.
 * Makes frames feel like objects in space instead of flat boxes.
 */
export default function DepthStage({
  children,
  className = '',
  aspectRatio,
  intensity = 1,
}) {
  const quality = useQuality();
  const pointer = usePointerParallax(true, quality.parallax * 0.7 * intensity);
  const enable3d = quality.level !== 'LOW' && !quality.reducedMotion;

  const rotY = enable3d ? pointer.x * -7 * intensity : 0;
  const rotX = enable3d ? pointer.y * 5 * intensity : 0;
  const lift = enable3d ? 18 * intensity : 0;

  return (
    <div className={`depth-stage ${className}`}>
      <div className="depth-floor" aria-hidden="true" />
      <div
        className="depth-card"
        style={{
          aspectRatio: aspectRatio || undefined,
          transform: enable3d
            ? `perspective(1400px) rotateX(${8 + rotX}deg) rotateY(${rotY}deg) translateZ(${lift}px)`
            : undefined,
        }}
      >
        <div className="depth-glow" aria-hidden="true" />
        <div className="depth-inner">{children}</div>
      </div>
    </div>
  );
}
