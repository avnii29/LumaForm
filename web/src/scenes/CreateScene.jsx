import { useEffect, useRef } from 'react';
import FloatingControls from '../components/FloatingControls.jsx';
import AsciiCanvas from '../components/AsciiCanvas.jsx';

/** Friendly samples only. Labels are not filenames. */
const SAMPLES = [
  { url: '/girl.jpg', label: 'Portrait' },
  { url: '/dog.jpeg', label: 'Friend' },
  { url: '/moon.png', label: 'Night' },
  { url: '/fox.jpg', label: 'Wild' },
  { url: '/animal.jpg', label: 'Soft' },
  { url: '/ani2.jpg', label: 'Calm' },
  { url: '/cow.png', label: 'Field' },
  { url: '/cursor.jpg', label: 'Mark' },
];

export default function CreateScene({
  onImage,
  onSample,
  imageInfo,
  previewUrl,
  result,
  settings,
  onChangeSettings,
  processing,
  canvasRef,
  onCopy,
  onDownloadTxt,
  onDownloadPng,
  copyState,
  onReplace,
  onClear,
}) {
  const sectionRef = useRef(null);
  const inputRef = useRef(null);
  const hasImage = Boolean(imageInfo);

  useEffect(() => {
    if (!hasImage) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    sectionRef.current?.scrollIntoView({
      behavior: reduce ? 'auto' : 'smooth',
      block: 'start',
    });
  }, [hasImage, imageInfo?.name]);

  const handleFiles = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    try {
      const bitmap = await createImageBitmap(file);
      onImage({
        bitmap,
        file,
        name: file.name,
        width: bitmap.width,
        height: bitmap.height,
      });
    } catch {
      /* invalid */
    }
  };

  const pickSample = (sample) => {
    onSample(sample.url, sample.label);
  };

  const sampleGrid = (heading) => (
    <div className="sample-gallery">
      <p className="sample-gallery-label">{heading}</p>
      <div className="sample-cards">
        {SAMPLES.map((s) => (
          <button
            key={s.url}
            type="button"
            className="sample-card"
            onClick={() => pickSample(s)}
            aria-label={s.label}
          >
            <img src={s.url} alt="" />
            <span>{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <section className="scene scene-create" id="scene-05" ref={sectionRef}>
      <div className="scene-sticky glass-sticky create-sticky">
        {!hasImage ? (
          <div className="upload-stage create-upload wide">
            <h2 className="display display-lit">
              Now make
              <br />
              your own.
            </h2>

            <div
              className="upload-slab"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFiles(e.dataTransfer.files?.[0]);
              }}
              onClick={() => inputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  inputRef.current?.click();
                }
              }}
              aria-label="Drop an image or browse files"
            >
              <input
                ref={inputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                hidden
                onChange={(e) => handleFiles(e.target.files?.[0])}
              />
              <p className="upload-slab-glyph" aria-hidden="true">
                . : = + * # % @
              </p>
              <p className="upload-slab-title">Drop an image here</p>
              <p className="upload-slab-sub">
                or <span className="linkish">browse</span>
              </p>
              <p className="upload-slab-meta">PNG JPG WEBP GIF</p>
              <p className="upload-slab-privacy">Your images stay in your browser.</p>
            </div>

            {sampleGrid('Try a sample')}
          </div>
        ) : (
          <div className="inline-studio" id="workspace">
            <div className="studio-top">
              <p className="scene-kicker glow">your image</p>
              <div className="workspace-meta">
                <span className="mono file-chip lit">{imageInfo.name}</span>
                <button type="button" className="btn solid touch" onClick={onReplace}>
                  Replace
                </button>
                <button type="button" className="btn solid touch" onClick={onClear}>
                  Clear
                </button>
              </div>
            </div>

            <div className="studio-grid">
              {previewUrl && (
                <aside className="float-preview inline-preview" aria-label="Original image">
                  <img src={previewUrl} alt="Original upload" />
                  <span>original</span>
                </aside>
              )}

              <div className="ascii-hero studio-hero">
                {processing && <p className="processing dark-text">Processing…</p>}
                {!processing && result && (
                  <div className="ascii-scroll">
                    <AsciiCanvas
                      ref={canvasRef}
                      result={result}
                      colorMode={settings.colorMode}
                    />
                  </div>
                )}
              </div>

              <FloatingControls
                settings={settings}
                onChange={onChangeSettings}
                onCopy={onCopy}
                onDownloadTxt={onDownloadTxt}
                onDownloadPng={onDownloadPng}
                copyState={copyState}
                hasResult={Boolean(result)}
                disabled={!imageInfo}
              />
            </div>

            {sampleGrid('Try another?')}
          </div>
        )}
      </div>
    </section>
  );
}
