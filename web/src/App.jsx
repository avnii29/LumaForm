import { useCallback, useEffect, useRef, useState } from 'react';
import HeroScene from './scenes/HeroScene.jsx';
import PixelScene from './scenes/PixelScene.jsx';
import LuminanceScene from './scenes/LuminanceScene.jsx';
import CharacterScene from './scenes/CharacterScene.jsx';
import CreateScene from './scenes/CreateScene.jsx';
import ProgressNav, { SCENE_IDS } from './components/ProgressNav.jsx';
import WorldBackdrop from './canvas/WorldBackdrop.jsx';
import { useActiveScene } from './hooks/useActiveScene.js';
import { useQuality } from './context/QualityContext.jsx';
import { imageToAscii } from './lib/convert.js';
import { downloadText, downloadCanvasPng } from './lib/download.js';
import { loadDemoImage } from './lib/loadDemoImage.js';
import './App.css';

const BASE_SETTINGS = {
  width: 100,
  colorMode: 'color',
  charset: 'detailed',
  brightness: 0,
  contrast: 10,
  edgeEnhancement: 'low',
  dithering: false,
  invert: false,
};

export default function App() {
  const quality = useQuality();
  const [demoImage, setDemoImage] = useState(null);
  const [imageInfo, setImageInfo] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [settings, setSettings] = useState(BASE_SETTINGS);
  const [result, setResult] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [copyState, setCopyState] = useState('idle');
  const canvasRef = useRef(null);
  const debounceRef = useRef(null);
  const replaceRef = useRef(null);
  const activeScene = useActiveScene(SCENE_IDS);

  useEffect(() => {
    let alive = true;
    loadDemoImage('/girl.jpg')
      .then((bmp) => {
        if (alive) setDemoImage(bmp);
      })
      .catch(() => {
        loadDemoImage('/dog.jpeg').then((bmp) => {
          if (alive) setDemoImage(bmp);
        });
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const onPaste = async (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) handleFile(file);
          return;
        }
      }
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyImage = useCallback((bitmap, file, name) => {
    setImageInfo((prev) => {
      prev?.bitmap?.close?.();
      return {
        bitmap,
        file,
        name: name || file.name,
        width: bitmap.width,
        height: bitmap.height,
      };
    });
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  }, []);

  const handleFile = useCallback(
    async (file) => {
      if (!file) return;
      try {
        const bitmap = await createImageBitmap(file);
        if (bitmap.width * bitmap.height > 40_000_000) {
          bitmap.close?.();
          return;
        }
        applyImage(bitmap, file, file.name);
      } catch {
        /* ignore */
      }
    },
    [applyImage]
  );

  const onImage = useCallback(
    (info) => {
      applyImage(info.bitmap, info.file, info.name);
    },
    [applyImage]
  );

  const loadSample = useCallback(
    async (url, name) => {
      try {
        const res = await fetch(url);
        const blob = await res.blob();
        const file = new File([blob], name, { type: blob.type || 'image/jpeg' });
        await handleFile(file);
      } catch {
        /* ignore */
      }
    },
    [handleFile]
  );

  useEffect(() => {
    setSettings((prev) => {
      const nextWidth = Math.min(prev.width, quality.maxAsciiWidth);
      if (nextWidth === prev.width) return prev;
      return { ...prev, width: nextWidth };
    });
  }, [quality.maxAsciiWidth, quality.level]);

  useEffect(() => {
    if (!imageInfo?.bitmap) {
      setResult(null);
      return undefined;
    }

    setProcessing(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      try {
        const width = Math.min(settings.width, quality.maxAsciiWidth);
        const ascii = imageToAscii(imageInfo.bitmap, {
          width,
          charset: settings.charset,
          brightness: settings.brightness,
          contrast: settings.contrast,
          edgeEnhancement: settings.edgeEnhancement,
          dithering: settings.dithering,
          invert: settings.invert,
        });
        setResult(ascii);
      } catch (err) {
        console.error(err);
        setResult(null);
      } finally {
        setProcessing(false);
      }
    }, 120);

    return () => clearTimeout(debounceRef.current);
  }, [imageInfo, settings, quality.maxAsciiWidth]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      imageInfo?.bitmap?.close?.();
      demoImage?.close?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCopy = async () => {
    if (!result?.text) return;
    try {
      await navigator.clipboard.writeText(result.text);
      setCopyState('copied');
      setTimeout(() => setCopyState('idle'), 1600);
    } catch {
      setCopyState('idle');
    }
  };

  const onDownloadTxt = () => {
    if (!result?.text) return;
    const base = imageInfo?.name?.replace(/\.[^.]+$/, '') || 'ascii';
    downloadText(result.text, `${base}-ascii.txt`);
  };

  const onDownloadPng = () => {
    if (!canvasRef.current) return;
    const base = imageInfo?.name?.replace(/\.[^.]+$/, '') || 'ascii';
    downloadCanvasPng(canvasRef.current, `${base}-ascii.png`);
  };

  const clearImage = () => {
    imageInfo?.bitmap?.close?.();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImageInfo(null);
    setPreviewUrl('');
    setResult(null);
  };

  return (
    <div
      className={[
        'app-shell',
        'mode-story',
        quality.isPortrait ? 'portrait' : 'landscape',
        quality.isLandscapePhone ? 'landscape-phone' : '',
        `quality-${quality.level.toLowerCase()}`,
        imageInfo ? 'has-creation' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <a className="skip-link" href="#scene-05">
        Skip to create
      </a>

      <WorldBackdrop active />

      <ProgressNav activeId={activeScene} />
      <HeroScene image={demoImage} />
      <PixelScene image={demoImage} />
      <LuminanceScene image={demoImage} />
      <CharacterScene image={demoImage} />
      <CreateScene
        onImage={onImage}
        onSample={loadSample}
        imageInfo={imageInfo}
        previewUrl={previewUrl}
        result={result}
        settings={settings}
        onChangeSettings={setSettings}
        processing={processing}
        canvasRef={canvasRef}
        onCopy={onCopy}
        onDownloadTxt={onDownloadTxt}
        onDownloadPng={onDownloadPng}
        copyState={copyState}
        onReplace={() => replaceRef.current?.click()}
        onClear={clearImage}
      />

      <input
        ref={replaceRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        hidden
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
