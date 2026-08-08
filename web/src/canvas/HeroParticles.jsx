import { useEffect, useRef } from 'react';
import { useQuality } from '../context/QualityContext.jsx';

const GLYPHS = ['.', ':', '-', '=', '+', '*', '#', '%', '@'];

export default function HeroParticles({ pointer = { x: 0, y: 0 } }) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const pointerRef = useRef(pointer);
  const quality = useQuality();

  pointerRef.current = pointer;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    let raf = 0;
    let running = true;
    let visible = true;

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    io.observe(canvas);

    const resize = () => {
      const dpr = Math.min(quality.viewport.dpr, quality.level === 'HIGH' ? 2 : 1.5);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = quality.particleCount;
      particlesRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z: 0.35 + Math.random() * 0.65,
        ch: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
        drift: (Math.random() - 0.5) * 0.15,
      }));
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('orientationchange', resize);

    const draw = (t) => {
      if (!running) return;
      if (!visible) {
        raf = requestAnimationFrame(draw);
        return;
      }

      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const ptr = pointerRef.current;
      const parallax = quality.parallax;
      ctx.clearRect(0, 0, w, h);

      const time = quality.reducedMotion ? 0 : t * 0.00012;
      for (const p of particlesRef.current) {
        const px =
          p.x +
          ptr.x * 18 * p.z * parallax +
          (quality.reducedMotion ? 0 : Math.sin(time + p.x) * 4 * p.drift);
        const py =
          p.y +
          ptr.y * 12 * p.z * parallax +
          (quality.reducedMotion ? 0 : Math.cos(time + p.y) * 3 * p.drift);
        const size = 10 + p.z * 10;
        ctx.globalAlpha = 0.08 + p.z * 0.14;
        ctx.fillStyle = '#2f5d50';
        ctx.font = `${size}px "IBM Plex Mono", monospace`;
        ctx.fillText(p.ch, px, py);
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('orientationchange', resize);
      io.disconnect();
    };
  }, [quality.level, quality.particleCount, quality.parallax, quality.reducedMotion, quality.viewport.dpr]);

  return <canvas ref={canvasRef} className="hero-particles" aria-hidden="true" />;
}
