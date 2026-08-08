import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { CELL_W, CELL_H } from '../lib/constants.js';

/**
 * Renders ASCII onto a canvas. Scales display size to fit the container
 * without shrinking glyphs below a readable floor — horizontal scroll if needed.
 */
const AsciiCanvas = forwardRef(function AsciiCanvas(
  { result, colorMode, maxDisplayWidth },
  ref
) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);

  useImperativeHandle(ref, () => canvasRef.current);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !result) return undefined;

    const paint = () => {
      const { cols, rows, cells, colors } = result;
      canvas.width = cols * CELL_W;
      canvas.height = rows * CELL_H;

      const ctx = canvas.getContext('2d');
      const darkUi = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const bg =
        colorMode === 'color' ? '#0e0e0e' : darkUi ? '#1a1814' : '#f7f3eb';
      const monoFg = darkUi ? '#e8e2d8' : '#1a1814';

      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${CELL_H}px "IBM Plex Mono", "Courier New", monospace`;
      ctx.textBaseline = 'top';

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const i = y * cols + x;
          const ch = String.fromCharCode(cells[i]);
          if (ch === ' ') continue;

          if (colorMode === 'color') {
            const c = i * 3;
            ctx.fillStyle = `rgb(${colors[c]},${colors[c + 1]},${colors[c + 2]})`;
          } else {
            ctx.fillStyle = monoFg;
          }
          ctx.fillText(ch, x * CELL_W, y * CELL_H);
        }
      }

      // Fit to container width, but never below ~0.7 scale (keep readable)
      const parentW =
        wrapRef.current?.clientWidth ||
        maxDisplayWidth ||
        canvas.width;
      const natural = cols * CELL_W;
      const scale = Math.min(1, parentW / natural);
      const displayW = Math.max(natural * Math.max(scale, 0.7), Math.min(natural, parentW));
      canvas.style.width = `${displayW}px`;
      canvas.style.height = 'auto';
    };

    paint();
    const ro = wrapRef.current ? new ResizeObserver(paint) : null;
    if (wrapRef.current && ro) ro.observe(wrapRef.current);
    window.addEventListener('orientationchange', paint);
    return () => {
      ro?.disconnect();
      window.removeEventListener('orientationchange', paint);
    };
  }, [result, colorMode, maxDisplayWidth]);

  if (!result) return null;

  return (
    <div className="ascii-canvas-wrap" ref={wrapRef}>
      <canvas
        ref={canvasRef}
        className="ascii-canvas"
        role="img"
        aria-label="ASCII art result"
      />
    </div>
  );
});

export default AsciiCanvas;
