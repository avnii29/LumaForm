import { useCallback, useEffect, useRef, useState } from 'react';

const ACCEPT = 'image/png,image/jpeg,image/webp,image/gif';
const MAX_BYTES = 25 * 1024 * 1024; // 25 MB soft limit

export default function UploadZone({ onImage, disabled }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');

  const handleFile = useCallback(
    async (file) => {
      setError('');
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        setError('That file isn’t an image. Try a PNG, JPG, or WEBP.');
        return;
      }

      const okType =
        /image\/(png|jpeg|jpg|webp|gif)/i.test(file.type) ||
        /\.(png|jpe?g|webp|gif)$/i.test(file.name);
      if (!okType) {
        setError('Supported formats: PNG, JPG, WEBP, and GIF.');
        return;
      }

      if (file.size > MAX_BYTES) {
        setError('That image is too large (max 25 MB). Try a smaller file.');
        return;
      }

      try {
        const bitmap = await createImageBitmap(file);
        if (bitmap.width * bitmap.height > 40_000_000) {
          bitmap.close?.();
          setError('That image is too large to process in the browser.');
          return;
        }
        onImage({
          bitmap,
          file,
          name: file.name,
          width: bitmap.width,
          height: bitmap.height,
        });
      } catch {
        setError("That image couldn’t be processed. Try a PNG or JPG.");
      }
    },
    [onImage]
  );

  useEffect(() => {
    const onPaste = (e) => {
      if (disabled) return;
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          handleFile(item.getAsFile());
          return;
        }
      }
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [disabled, handleFile]);

  return (
    <div
      className={`upload-zone ${dragging ? 'dragging' : ''} ${disabled ? 'disabled' : ''}`}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (!disabled) handleFile(e.dataTransfer.files?.[0]);
      }}
      tabIndex={0}
      role="button"
      aria-label="Upload an image"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      onClick={() => !disabled && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        hidden
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <p className="upload-glyph" aria-hidden="true">
        . : - = + * # % @
      </p>
      <p className="upload-title">Drop an image here</p>
      <p className="upload-sub">or click to upload · PNG, JPG, WEBP, GIF</p>
      <p className="upload-privacy">Your images stay in your browser.</p>
      {error && (
        <p className="upload-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
