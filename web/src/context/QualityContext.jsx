import { createContext, useContext } from 'react';
import { useRenderQuality } from '../hooks/useRenderQuality.js';

const QualityContext = createContext(null);

export function QualityProvider({ children }) {
  const quality = useRenderQuality();
  return (
    <QualityContext.Provider value={quality}>{children}</QualityContext.Provider>
  );
}

export function useQuality() {
  const ctx = useContext(QualityContext);
  if (!ctx) {
    throw new Error('useQuality must be used within QualityProvider');
  }
  return ctx;
}
