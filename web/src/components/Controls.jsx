export default function Controls({
  settings,
  onChange,
  onDownloadTxt,
  onDownloadPng,
  onCopy,
  copyState,
  hasResult,
  disabled,
}) {
  const set = (key, value) => onChange({ ...settings, [key]: value });

  return (
    <section className="controls" aria-label="Conversion settings">
      <label className="control">
        <span>Width ({settings.width} chars)</span>
        <input
          type="range"
          min={40}
          max={220}
          step={1}
          value={settings.width}
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
          Monochrome
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
        <legend>Character set</legend>
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

      <label className="control">
        <span>Brightness ({settings.brightness})</span>
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
        <span>Contrast ({settings.contrast})</span>
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

      <div className="action-row">
        <button type="button" className="btn primary" disabled={!hasResult} onClick={onCopy}>
          {copyState === 'copied' ? 'Copied!' : 'Copy ASCII'}
        </button>
        <button type="button" className="btn" disabled={!hasResult} onClick={onDownloadTxt}>
          Download TXT
        </button>
        <button type="button" className="btn" disabled={!hasResult} onClick={onDownloadPng}>
          Download PNG
        </button>
      </div>
    </section>
  );
}
