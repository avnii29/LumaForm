import AsciiCanvas from './AsciiCanvas.jsx';

export default function CompareView({
  previewUrl,
  meta,
  result,
  colorMode,
  processing,
  canvasRef,
}) {
  return (
    <section className="compare" aria-label="Original and ASCII comparison">
      <div className="compare-panel">
        <h2>Original</h2>
        {previewUrl ? (
          <>
            <img src={previewUrl} alt="Uploaded original" className="preview-img" />
            {meta && (
              <p className="meta">
                {meta.name} · {meta.width}×{meta.height}
              </p>
            )}
          </>
        ) : (
          <p className="placeholder">Upload an image to begin.</p>
        )}
      </div>

      <div className="compare-arrow" aria-hidden="true">
        ↓
      </div>

      <div className="compare-panel ascii-panel">
        <h2>ASCII</h2>
        {processing && <p className="processing">Processing…</p>}
        {!processing && result && (
          <div className="ascii-scroll">
            <AsciiCanvas
              ref={canvasRef}
              result={result}
              colorMode={colorMode}
              maxDisplayWidth={720}
            />
          </div>
        )}
        {!processing && !result && previewUrl && (
          <p className="placeholder">Adjust settings to generate ASCII.</p>
        )}
        {!previewUrl && <p className="placeholder">Result appears here.</p>}
      </div>
    </section>
  );
}
