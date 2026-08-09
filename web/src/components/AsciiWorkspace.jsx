import FloatingControls from './FloatingControls.jsx';
import AsciiCanvas from './AsciiCanvas.jsx';
import { useQuality } from '../context/QualityContext.jsx';

export default function AsciiWorkspace({
  previewUrl,
  meta,
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
  const quality = useQuality();

  return (
    <div
      className={`workspace ${quality.isPortrait ? 'portrait' : 'landscape'} quality-${quality.level.toLowerCase()}`}
      id="workspace"
    >
      <header className="workspace-top">
        <p className="brand">LumaForm</p>
        <div className="workspace-meta">
          <span className="mono file-chip">{meta?.name}</span>
          <span className="mono muted dims">
            {meta?.width}×{meta?.height}
          </span>
          <button type="button" className="btn ghost touch" onClick={onReplace}>
            Replace
          </button>
          <button type="button" className="btn ghost touch" onClick={onClear}>
            Story
          </button>
        </div>
      </header>

      <div className="workspace-stage">
        {previewUrl && (
          <aside className="float-preview" aria-label="Original image">
            <img src={previewUrl} alt="Original upload" />
            <span>original</span>
          </aside>
        )}

        <div className="ascii-hero">
          {processing && <p className="processing">Processing…</p>}
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
          disabled={!meta}
        />
      </div>
    </div>
  );
}
