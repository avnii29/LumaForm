import { useEffect, useRef } from 'react';
import { useQuality } from '../context/QualityContext.jsx';

// Soft photographic worlds — car first, collage lands on later scroll
const BG_URLS = ['/bg/wheel.png', '/bg/clouds.png', '/bg/collage.png'];

/** Glyphs that read as “code rain” without looking like Matrix-copy. */
const RAIN_CHARS =
  '12e6&*w6(#%-@%#*+=-:;.!?/\\|{}[]<>~^abcdefghijklmnopqrstuvwxyz0123456789';

/**
 * Full-viewport pixelated photo world + columnar illuminated ASCII rain.
 * Backgrounds use cover (no stretch). Images crossfade with page scroll.
 */
export default function WorldBackdrop({ active = true }) {
  const canvasRef = useRef(null);
  const quality = useQuality();
  const imagesRef = useRef([]);
  const columnsRef = useRef([]);
  const scrollRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      BG_URLS.map(
        (url) =>
          new Promise((resolve) => {
            const img = new Image();
            img.decoding = 'async';
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null);
            img.src = url;
          })
      )
    ).then((imgs) => {
      if (!cancelled) imagesRef.current = imgs.filter(Boolean);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!active) return undefined;

    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    let raf = 0;
    let running = true;

    const onScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      scrollRef.current = window.scrollY / max;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const rebuildColumns = (w, h) => {
      const gap = quality.level === 'LOW' ? 26 : quality.level === 'MEDIUM' ? 22 : 20;
      const count = Math.max(10, Math.floor(w / gap));
      columnsRef.current = Array.from({ length: count }, (_, i) => ({
        x: (i + 0.5) * (w / count),
        y: Math.random() * h * 1.2,
        speed: 0.85 + Math.random() * 2.4,
        length: 8 + Math.floor(Math.random() * 16),
        seed: Math.floor(Math.random() * 1000),
        warm: Math.random() > 0.68,
      }));
    };

    const resize = () => {
      const dpr = Math.min(quality.viewport.dpr, quality.level === 'LOW' ? 1.25 : 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      rebuildColumns(w, h);
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('orientationchange', resize);

    const drawCover = (img, alpha) => {
      if (!img || alpha <= 0) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      // Slight overscale + soft blur feel via downscale upsample
      const scale = Math.max(w / img.width, h / img.height) * 1.08;
      const dw = img.width * scale;
      const dh = img.height * scale;
      const dx = (w - dw) / 2;
      const dy = (h - dh) / 2;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.filter = 'blur(1.2px) saturate(1.05) brightness(1.08)';
      ctx.drawImage(img, dx, dy, dw, dh);
      ctx.filter = 'none';
      ctx.restore();
    };

    const draw = (time) => {
      if (!running) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const imgs = imagesRef.current;
      const t = scrollRef.current;

      ctx.clearRect(0, 0, w, h);
      // Lifted base so the world feels lit, not muddy
      ctx.fillStyle = '#1a1714';
      ctx.fillRect(0, 0, w, h);

      if (imgs.length) {
        const seg = Math.min(0.999, Math.max(0, t)) * (imgs.length - 0.001);
        const i0 = Math.floor(seg);
        const i1 = Math.min(imgs.length - 1, i0 + 1);
        const f = seg - i0;
        const ease = f * f * (3 - 2 * f);
        drawCover(imgs[i0], 1);
        if (i1 !== i0) drawCover(imgs[i1], ease);
      }

      // Brighten pass
      ctx.fillStyle = 'rgba(255, 236, 200, 0.1)';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(120, 220, 160, 0.06)';
      ctx.fillRect(0, 0, w, h);

      // Lighter veil for readability without killing the photo
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, 'rgba(12,10,8,0.22)');
      g.addColorStop(0.45, 'rgba(12,10,8,0.08)');
      g.addColorStop(1, 'rgba(12,10,8,0.28)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // Columnar ASCII rain (large, readable glyphs)
      if (!quality.reducedMotion) {
        const fontSize = quality.level === 'LOW' ? 18 : quality.level === 'MEDIUM' ? 22 : 26;
        ctx.font = `600 ${fontSize}px "IBM Plex Mono", monospace`;
        ctx.textBaseline = 'top';

        for (const col of columnsRef.current) {
          col.y += col.speed * (quality.level === 'LOW' ? 0.85 : 1.15);
          if (col.y - col.length * fontSize > h) {
            col.y = -Math.random() * h * 0.35;
            col.speed = 0.85 + Math.random() * 2.4;
            col.length = 8 + Math.floor(Math.random() * 16);
          }

          for (let n = 0; n < col.length; n++) {
            const yy = col.y - n * fontSize;
            if (yy < -fontSize || yy > h) continue;
            const ch =
              RAIN_CHARS[(col.seed + n + Math.floor(time * 0.02 + col.x)) % RAIN_CHARS.length];
            const head = n === 0;
            const fade = 1 - n / col.length;
            if (col.warm) {
              ctx.fillStyle = head
                ? `rgba(255, 236, 130, ${1})`
                : `rgba(235, 195, 70, ${0.22 + fade * 0.65})`;
            } else {
              ctx.fillStyle = head
                ? `rgba(190, 255, 175, ${1})`
                : `rgba(70, 230, 120, ${0.18 + fade * 0.65})`;
            }
            ctx.fillText(ch, col.x, yy);
          }
        }
      } else {
        // Static sparse columns when reduced motion
        ctx.font = `12px "IBM Plex Mono", monospace`;
        ctx.fillStyle = 'rgba(100, 210, 130, 0.28)';
        for (let i = 0; i < columnsRef.current.length; i += 2) {
          const col = columnsRef.current[i];
          for (let n = 0; n < 6; n++) {
            const ch = RAIN_CHARS[(col.seed + n) % RAIN_CHARS.length];
            ctx.fillText(ch, col.x, ((i * 37 + n * 18) % h));
          }
        }
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', resize);
      window.removeEventListener('orientationchange', resize);
    };
  }, [active, quality.level, quality.reducedMotion, quality.viewport.dpr]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="world-backdrop"
      aria-hidden="true"
    />
  );
}
