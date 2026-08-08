import { useState } from 'react';
import { useQuality } from '../context/QualityContext.jsx';

export default function FloatingControls({
  settings,
  onChange,
  onDownloadTxt,
  onDownloadPng,
  onCopy,
  copyState,
  hasResult,
  disabled,
}) {
  const [openAdjust, setOpenAdjust] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const quality = useQuality();
  const set = (key, value) => onChange({ ...settings, [key]: value });
  const maxW = quality.maxAsciiWidth;

  const panel = (
    <>
      <div className="float-card primary-card">
        <label className="control">
          <span>Width {settings.width}</span>
          <input
            type="range"
            min={40}
            max={maxW}
            value={Math.min(settings.width, maxW)}
            disabled={disabled}
            onChange={(e) => set('width', Number(e.target.value))}
          />
        </label>

        <fieldset className="control segment" disabled={disabled}>
          <legend>Mode</legend>
          <label>
            <input
              type="radio"
              name="mode"
              checked={settings.colorMode === 'mono'}
              onChange={() => set('colorMode', 'mono')}
            />
            Mono
          </label>
          <label>
            <input
              type="radio"
              name="mode"
              checked={settings.colorMode === 'color'}
              onChange={() => set('colorMode', 'color')}
            />
            Color
          </label>
        </fieldset>

        <fieldset className="control segment" disabled={disabled}>
          <legend>Charset</legend>
          <label>
            <input
              type="radio"
              name="charset"
              checked={settings.charset === 'standard'}
              onChange={() => set('charset', 'standard')}
            />
            Standard
          </label>
          <label>
            <input
              type="radio"
              name="charset"
              checked={settings.charset === 'detailed'}
              onChange={() => set('charset', 'detailed')}
            />
            Detailed
          </label>
        </fieldset>

        <button
          type="button"
          className="btn ghost touch"
          onClick={() => setOpenAdjust((v) => !v)}
          aria-expanded={openAdjust}
        >
          {openAdjust ? 'Hide adjust' : 'Adjust'}
        </button>
      </div>

      {openAdjust && (
        <div className="float-card adjust-card">
          <label className="control">
            <span>Brightness · {settings.brightness}</span>
            <input
              type="range"
              min={-100}
              max={100}
              value={settings.brightness}
              disabled={disabled}
              onChange={(e) => set('brightness', Number(e.target.value))}
            />
          </label>
          <label className="control">
            <span>Contrast · {settings.contrast}</span>
            <input
              type="range"
              min={-100}
              max={100}
              value={settings.contrast}
              disabled={disabled}
              onChange={(e) => set('contrast', Number(e.target.value))}
            />
          </label>
          <label className="control">
            <span>Edge enhancement</span>
            <select
              value={settings.edgeEnhancement}
              disabled={disabled}
              onChange={(e) => set('edgeEnhancement', e.target.value)}
            >
              <option value="off">Off</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
          <fieldset className="control segment" disabled={disabled}>
            <legend>Dithering</legend>
            <label>
              <input
                type="radio"
                name="dither"
                checked={!settings.dithering}
                onChange={() => set('dithering', false)}
              />
              Off
            </label>
            <label>
              <input
                type="radio"
                name="dither"
                checked={settings.dithering}
                onChange={() => set('dithering', true)}
              />
              On
            </label>
          </fieldset>
          <fieldset className="control segment" disabled={disabled}>
            <legend>Invert</legend>
            <label>
              <input
                type="radio"
                name="invert"
                checked={!settings.invert}
                onChange={() => set('invert', false)}
              />
              Off
            </label>
            <label>
              <input
                type="radio"
                name="invert"
                checked={settings.invert}
                onChange={() => set('invert', true)}
              />
              On
            </label>
          </fieldset>
        </div>
      )}

      <div className="float-card actions-card">
        <button
          type="button"
          className="btn primary touch"
          disabled={!hasResult}
          onClick={onCopy}
        >
          {copyState === 'copied' ? 'Copied!' : 'Copy ASCII'}
        </button>
        <button
          type="button"
          className="btn touch"
          disabled={!hasResult}
          onClick={onDownloadTxt}
        >
          TXT
        </button>
        <button
          type="button"
          className="btn touch"
          disabled={!hasResult}
          onClick={onDownloadPng}
        >
          PNG
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop / tablet side panel */}
      <div className="float-controls desktop-controls" aria-label="Conversion settings">
        {panel}
      </div>

      {/* Mobile bottom sheet */}
      <div className="mobile-controls">
        <div className="mobile-action-bar">
          <button
            type="button"
            className="btn primary touch"
            disabled={!hasResult}
            onClick={onCopy}
          >
            {copyState === 'copied' ? 'Copied!' : 'Copy'}
          </button>
          <button
            type="button"
            className="btn touch"
            disabled={!hasResult}
            onClick={onDownloadTxt}
          >
            TXT
          </button>
          <button
            type="button"
            className="btn touch"
            disabled={!hasResult}
            onClick={onDownloadPng}
          >
            PNG
          </button>
          <button
            type="button"
            className="btn touch"
            aria-expanded={sheetOpen}
            onClick={() => setSheetOpen((v) => !v)}
          >
            {sheetOpen ? 'Close' : 'Controls'}
          </button>
        </div>

        {sheetOpen && (
          <div className="control-sheet" role="dialog" aria-label="Conversion settings">
            <div className="sheet-handle" aria-hidden="true" />
            {panel}
          </div>
        )}
      </div>
    </>
  );
}
