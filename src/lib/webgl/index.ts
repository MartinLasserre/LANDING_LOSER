import { prefersSaveData } from '@/lib/env';
import type { Atmosphere, AtmosphereQuality } from './atmosphere';

/** Chequeo barato de soporte, antes de descargar Three.js. */
function supportsWebGL(): boolean {
  try {
    const probe = document.createElement('canvas');
    return Boolean(probe.getContext('webgl2') ?? probe.getContext('webgl'));
  } catch {
    return false;
  }
}

function pickQuality(): AtmosphereQuality {
  const cores = navigator.hardwareConcurrency || 4;
  return window.innerWidth < 768 || cores <= 4 ? 'low' : 'high';
}

/**
 * Carga diferida de la atmósfera: Three.js (~130 KB gz) se descarga recién
 * cuando el navegador está ocioso, después del primer render, y nunca si
 * el dispositivo no soporta WebGL o el usuario pidió ahorrar datos.
 */
export async function loadAtmosphere(reducedMotion: boolean): Promise<Atmosphere | null> {
  const canvas = document.querySelector<HTMLCanvasElement>('[data-atmosphere]');
  if (!canvas || prefersSaveData() || !supportsWebGL()) return null;
  try {
    const { createAtmosphere } = await import('./atmosphere');
    return createAtmosphere(canvas, { reducedMotion, quality: pickQuality() });
  } catch (error) {
    // WebGL es enhancement: si falla, queda el fondo CSS.
    console.warn('[atmósfera] WebGL no disponible, se usa el fondo CSS.', error);
    return null;
  }
}
