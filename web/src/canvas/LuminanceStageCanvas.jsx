import { useEffect, useRef } from 'react';
import { luminanceToChar } from '../lib/characters.js';
import { pixelLuminance } from '../lib/luminance.js';
import { useQuality } from '../context/QualityContext.jsx';

/**
 * Seamless morph: color → gray → full ASCII field.
 * No chunky boxes. Characters fade in as a continuous sheet.
 */
export default function LuminanceStageCanvas({ image, progress = 0 }) {
  const canvasRef = useRef(null);
  const quality = useQuality();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return undefined;

    const paint = () => {
      const dpr = Math.min(quality.viewport.dpr, quality.level === 'LOW' ? 1.25 : 2);
      const cssW = canvas.clientWidth || 320;
      const cssH = canvas.clientHeight || 240;
      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);
      const ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const scale = Math.min(cssW / image.width, cssH / image.height) * 0.92;
      const dw = image.width * scale;
      const dh = image.height * scale;
      const dx = (cssW - dw) / 2;
      const dy = (cssH - dh) / 2;

      ctx.fillStyle = '#0e0c0a';
      ctx.fillRect(0, 0, cssW, cssH);

      const cols = Math.max(36, Math.round(quality.storyCols * 0.95));
      const rows = Math.max(
        1,
        Math.round(cols * (image.height / image.width) * (8 / 14))
      );

      const sample = document.createElement('canvas');
      sample.width = cols;
      sample.height = rows;
      const sctx = sample.getContext('2d');
      sctx.drawImage(image, 0, 0, cols, rows);
      const { data } = sctx.getImageData(0, 0, cols, rows);

      // Ease progress for smoother feel
      const p = progress * progress * (3 - 2 * progress);
      const grayAmount = Math.min(1, p / 0.42);
      const asciiAmount = Math.max(0, (p - 0.28) / 0.72);

      // Photo layer fades as ASCII takes over
      ctx.save();
      ctx.globalAlpha = 1 - asciiAmount * 0.92;
      ctx.drawImage(image, dx, dy, dw, dh);
      if (grayAmount > 0.01) {
        ctx.globalCompositeOperation = 'saturation';
        ctx.fillStyle = `rgba(128,128,128,${grayAmount})`;
        ctx.fillRect(dx, dy, dw, dh);
        ctx.globalCompositeOperation = 'source-over';
      }
      ctx.restore();

      if (asciiAmount > 0.01) {
        const cellW = dw / cols;
        const cellH = dh / rows;
        const fontSize = Math.max(9, cellH * 0.98);
        ctx.font = `600 ${fontSize}px "IBM Plex Mono", monospace`;
        ctx.textBaseline = 'top';
        ctx.textAlign = 'left';

        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            const i = (y * cols + x) * 4;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const lum = pixelLuminance(r, g, b);
            const ch = luminanceToChar(lum, 'standard', false);
            if (ch === ' ') continue;

            // Soft wave reveal so it never looks like random blocks
            const wave =
              0.55 +
              0.45 *
                Math.sin((x / cols) * Math.PI * 2 + asciiAmount * 4) *
                Math.cos((y / rows) * Math.PI);
            const local = Math.min(1, Math.max(0, asciiAmount * (0.65 + wave * 0.55)));
            if (local < 0.04) continue;

            const tone = Math.round(40 + (lum / 255) * 200);
            ctx.globalAlpha = local * (0.55 + (1 - lum / 255) * 0.45);
            ctx.fillStyle = `rgb(${tone},${tone},${Math.min(255, tone + 8)})`;
            ctx.fillText(ch, dx + x * cellW, dy + y * cellH);
          }
        }
        ctx.globalAlpha = 1;
      }
    };

    paint();
    const ro = new ResizeObserver(paint);
    ro.observe(canvas);
    window.addEventListener('orientationchange', paint);
    return () => {
      ro.disconnect();
      window.removeEventListener('orientationchange', paint);
    };
  }, [image, progress, quality.level, quality.storyCols, quality.viewport.dpr]);

  return (
    <canvas
      ref={canvasRef}
      className="stage-canvas"
      role="img"
      aria-label="Image transitioning from color to luminance characters"
    />
  );
}
