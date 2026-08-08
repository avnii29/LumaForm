import { useRef } from 'react';
import PixelStageCanvas from '../canvas/PixelStageCanvas.jsx';
import StageFrame from '../components/StageFrame.jsx';
import { useSceneProgress } from '../hooks/useSceneProgress.js';

export default function PixelScene({ image }) {
  const ref = useRef(null);
  const progress = useSceneProgress(ref);

  return (
    <section className="scene scene-pixels" id="scene-02" ref={ref}>
      <div className="scene-sticky glass-sticky space-scene">
        <div className="scene-grid filled depth-grid">
          <div className="scene-copy on-dark float-copy">
            <h2 className="display">Start with pixels.</h2>
            <p className="scene-lead">
              An image is a grid of samples. Keep moving to watch the structure
              appear.
            </p>
          </div>
          <StageFrame image={image} className="stage-large">
            {image ? (
              <PixelStageCanvas image={image} progress={progress} />
            ) : (
              <div className="stage-fallback">Loading…</div>
            )}
          </StageFrame>
        </div>
      </div>
    </section>
  );
}
