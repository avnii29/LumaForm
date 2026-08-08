import { useEffect, useRef } from 'react';
import { useQuality } from '../context/QualityContext.jsx';

export default function PixelStageCanvas({ image, progress = 0 }) {
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
      ctx.fillStyle = '#1a1814';
      ctx.fillRect(0, 0, cssW, cssH);

      const scale = Math.min(cssW / image.width, cssH / image.height) * 0.92;
      const dw = image.width * scale;
      const dh = image.height * scale;
      const dx = (cssW - dw) / 2;
      const dy = (cssH - dh) / 2;

      const maxBlock = quality.level === 'LOW' ? 18 : quality.level === 'MEDIUM' ? 24 : 28;
      const block = Math.max(1, Math.round(1 + progress * maxBlock));

      const tmp = document.createElement('canvas');
      const tw = Math.max(1, Math.round(dw / block));
      const th = Math.max(1, Math.round(dh / block));
      tmp.width = tw;
      tmp.height = th;
      const tctx = tmp.getContext('2d');
      tctx.imageSmoothingEnabled = true;
      tctx.drawImage(image, 0, 0, tw, th);

      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(tmp, dx, dy, dw, dh);

      if (progress > 0.08 && quality.level !== 'LOW') {
        ctx.strokeStyle = `rgba(255,252,247,${0.08 + progress * 0.22})`;
        ctx.lineWidth = 1;
        for (let x = dx; x <= dx + dw; x += block) {
          ctx.beginPath();
          ctx.moveTo(x, dy);
          ctx.lineTo(x, dy + dh);
          ctx.stroke();
        }
        for (let y = dy; y <= dy + dh; y += block) {
          ctx.beginPath();
          ctx.moveTo(dx, y);
          ctx.lineTo(dx + dw, y);
          ctx.stroke();
        }
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
  }, [image, progress, quality.level, quality.viewport.dpr]);

  return (
    <canvas
      ref={canvasRef}
      className="stage-canvas"
      role="img"
      aria-label="Image transforming into a pixel grid"
    />
  );
}
