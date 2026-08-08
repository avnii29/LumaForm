import { useEffect, useRef } from 'react';
import { luminanceToChar } from '../lib/characters.js';
import { pixelLuminance, adjustTone } from '../lib/luminance.js';
import { useQuality } from '../context/QualityContext.jsx';

/**
 * Character field that settles into a sharp, well defined ASCII portrait.
 * Early scroll: light depth. Late scroll: clean colored glyph grid.
 */
export default function CharacterFieldCanvas({
  image,
  progress = 0,
  pointer = { x: 0, y: 0 },
}) {
  const canvasRef = useRef(null);
  const cacheRef = useRef(null);
  const progressRef = useRef(progress);
  const pointerRef = useRef(pointer);
  const quality = useQuality();

  progressRef.current = progress;
  pointerRef.current = pointer;

  useEffect(() => {
    cacheRef.current = null;
  }, [image, quality.level]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return undefined;

    const dprCap = quality.level === 'LOW' ? 1.25 : 2;
    let raf = 0;
    let running = true;
    let visible = true;
    let lastProgress = -1;

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    io.observe(canvas);

    const ensureCache = () => {
      // Denser grid = clearer faces and edges
      const base =
        quality.level === 'HIGH' ? 110 : quality.level === 'MEDIUM' ? 88 : 64;
      const cols = base;
      const rows = Math.max(
        1,
        Math.round(cols * (image.height / image.width) * (8 / 14))
      );
      const key = `${cols}x${rows}`;
      if (cacheRef.current?.key === key) return cacheRef.current;

      const sample = document.createElement('canvas');
      sample.width = cols;
      sample.height = rows;
      const sctx = sample.getContext('2d');
      sctx.imageSmoothingEnabled = true;
      sctx.imageSmoothingQuality = 'high';
      sctx.drawImage(image, 0, 0, cols, rows);
      const { data } = sctx.getImageData(0, 0, cols, rows);

      const cells = [];
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const i = (y * cols + x) * 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const lum = adjustTone(pixelLuminance(r, g, b), 4, 28);
          cells.push({
            x,
            y,
            lum,
            r,
            g,
            b,
            ch: luminanceToChar(lum, 'detailed', false),
          });
        }
      }
      cacheRef.current = { key, cols, rows, cells };
      return cacheRef.current;
    };

    const paint = (time) => {
      if (!running) return;

      const progressValue = progressRef.current;
      const pointerValue = pointerRef.current;
      const needsFrame =
        visible &&
        (quality.continuousField ||
          Math.abs(progressValue - lastProgress) > 0.002 ||
          quality.level === 'HIGH');

      if (!needsFrame) {
        raf = requestAnimationFrame(paint);
        return;
      }
      lastProgress = progressValue;

      const dpr = Math.min(quality.viewport.dpr, dprCap);
      const cssW = canvas.clientWidth || 320;
      const cssH = canvas.clientHeight || 240;
      const tw = Math.floor(cssW * dpr);
      const th = Math.floor(cssH * dpr);
      if (canvas.width !== tw || canvas.height !== th) {
        canvas.width = tw;
        canvas.height = th;
      }

      const ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = '#0a0908';
      ctx.fillRect(0, 0, cssW, cssH);

      const { cols, rows, cells } = ensureCache();

      // Fit ASCII block to canvas while keeping cell aspect
      const cellAspect = 8 / 14;
      let cellW = cssW / cols;
      let cellH = cellW / cellAspect;
      if (cellH * rows > cssH) {
        cellH = cssH / rows;
        cellW = cellH * cellAspect;
      }
      const gridW = cellW * cols;
      const gridH = cellH * rows;
      const ox = (cssW - gridW) / 2;
      const oy = (cssH - gridH) / 2;
      const cx = cssW / 2;
      const cy = cssH / 2;

      const settle = progressValue;
      // Keep dimensional space longer, then resolve into a sharp plane
      const depthAmp = (1 - Math.min(1, settle / 0.75)) * Math.max(0.35, quality.depthAmp);
      const drift =
        quality.reducedMotion || settle > 0.7
          ? 0
          : Math.sin(time * 0.0008) * (1 - settle) * 2.2;
      const parallax = settle > 0.7 ? 0 : quality.parallax * 0.85;

      ctx.textBaseline = 'top';
      ctx.textAlign = 'left';
      const fontSize = Math.max(8, cellH * 0.96);
      ctx.font = `600 ${fontSize}px "IBM Plex Mono", monospace`;

      for (const p of cells) {
        if (p.ch === ' ') continue;

        const depth = (0.25 + (1 - p.lum / 255) * 0.75) * depthAmp;
        const px = ox + p.x * cellW;
        const py = oy + p.y * cellH;
        const scale = 1 + depth * 0.7;
        const sx =
          cx +
          (px - cx) * scale +
          pointerValue.x * 22 * depth * parallax +
          drift * depth * 2;
        const sy =
          cy +
          (py - cy) * scale +
          pointerValue.y * 16 * depth * parallax -
          depth * 42 * (1 - settle);

        ctx.globalAlpha = settle < 0.35 ? 0.55 + settle : 1;

        if (settle > 0.4) {
          // Color ASCII once structure locks in
          const boost = 1.08;
          const r = Math.min(255, Math.round(p.r * boost));
          const g = Math.min(255, Math.round(p.g * boost));
          const b = Math.min(255, Math.round(p.b * boost));
          ctx.fillStyle = `rgb(${r},${g},${b})`;
        } else {
          const tone = Math.round(70 + (p.lum / 255) * 170);
          ctx.fillStyle = `rgb(${tone},${tone + 8},${tone})`;
        }
        ctx.fillText(p.ch, sx, sy);
      }
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(paint);
    };

    const onResize = () => {
      lastProgress = -1;
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);

    raf = requestAnimationFrame(paint);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, [image, quality]);

  return (
    <canvas
      ref={canvasRef}
      className="stage-canvas field-canvas"
      role="img"
      aria-label="Character field resolving into ASCII art"
    />
  );
}
