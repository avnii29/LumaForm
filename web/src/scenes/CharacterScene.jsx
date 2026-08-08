import { useRef } from 'react';
import CharacterFieldCanvas from '../canvas/CharacterFieldCanvas.jsx';
import DepthStage from '../components/DepthStage.jsx';
import { useSceneProgress } from '../hooks/useSceneProgress.js';
import { usePointerParallax } from '../hooks/usePointerParallax.js';
import { useQuality } from '../context/QualityContext.jsx';

export default function CharacterScene({ image }) {
  const ref = useRef(null);
  const progress = useSceneProgress(ref);
  const quality = useQuality();
  const pointer = usePointerParallax(true, quality.parallax);

  const ratio =
    image && image.width > 0 && image.height > 0
      ? `${image.width} / ${image.height}`
      : '3 / 4';

  return (
    <section className="scene scene-field" id="scene-04" ref={ref}>
      <div className="scene-sticky glass-sticky space-scene">
        <div className="scene-grid filled depth-grid">
          <div
            className="scene-copy field-copy on-dark float-copy"
            style={{
              transform: quality.reducedMotion
                ? undefined
                : `translate3d(${pointer.x * -10}px, ${pointer.y * -6}px, 40px)`,
            }}
          >
            <h2 className="display display-lit">
              Shape from
              <br />
              characters.
            </h2>
            <p className="scene-lead lead-bright">
              Glyphs lock into the portrait so edges and faces stay clear.
            </p>
          </div>

          <DepthStage className="stage-large hero-depth" aspectRatio={ratio} intensity={1.15}>
            {image ? (
              <CharacterFieldCanvas
                image={image}
                progress={progress}
                pointer={pointer}
              />
            ) : (
              <div className="stage-fallback">Loading…</div>
            )}
          </DepthStage>
        </div>
      </div>
    </section>
  );
}
