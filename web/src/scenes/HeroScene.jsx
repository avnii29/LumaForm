import DepthStage from '../components/DepthStage.jsx';
import { usePointerParallax } from '../hooks/usePointerParallax.js';
import { useQuality } from '../context/QualityContext.jsx';

export default function HeroScene({ image }) {
  const quality = useQuality();
  const pointer = usePointerParallax(true, quality.parallax * 0.6);

  return (
    <section
      className={`scene scene-intro ${quality.isPortrait ? 'portrait' : 'landscape'} quality-${quality.level.toLowerCase()}`}
      id="scene-01"
    >
      <div className="scene-sticky glass-sticky space-scene">
        <div className="hero-spread depth-grid">
          <div
            className="scene-copy intro-copy on-dark float-copy"
            style={{
              transform: quality.reducedMotion
                ? undefined
                : `translate3d(${pointer.x * -6}px, ${pointer.y * -4}px, 0)`,
            }}
          >
            <p className="scene-kicker glow">img2ascii-c</p>
            <h1 className="display display-lit">
              Every image
              <br />
              is
              <br />
              information.
            </h1>
            <p className="scene-lead lead-bright">
              See what happens when pixels become characters.
            </p>
          </div>

          {image && (
            <DepthStage className="hero-depth" aspectRatio="3 / 4" intensity={1.2}>
              <img
                src="/girl.jpg"
                alt=""
                className="hero-photo fill"
                draggable={false}
              />
            </DepthStage>
          )}
        </div>
      </div>
    </section>
  );
}
