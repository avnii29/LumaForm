import { useRef } from 'react';
import LuminanceStageCanvas from '../canvas/LuminanceStageCanvas.jsx';
import StageFrame from '../components/StageFrame.jsx';
import { useSceneProgress } from '../hooks/useSceneProgress.js';

export default function LuminanceScene({ image }) {
  const ref = useRef(null);
  const progress = useSceneProgress(ref);

  return (
    <section className="scene scene-luminance" id="scene-03" ref={ref}>
      <div className="scene-sticky glass-sticky space-scene">
        <div className="scene-grid filled depth-grid">
          <div className="scene-copy on-dark float-copy">
            <h2 className="display">
              Then remove
              <br />
              the color.
            </h2>
            <p className="scene-lead">
              Brightness becomes the alphabet. Dark regions map to dense
              glyphs. Light regions stay sparse.
            </p>
            <p className="glyph-ramp glow-text" aria-hidden="true">
              @ # % * + = - .
            </p>
            <p className="glyph-caption">dense to sparse</p>
          </div>
          <StageFrame image={image} className="stage-large">
            {image ? (
              <LuminanceStageCanvas image={image} progress={progress} />
            ) : (
              <div className="stage-fallback">Loading…</div>
            )}
          </StageFrame>
        </div>
      </div>
    </section>
  );
}
