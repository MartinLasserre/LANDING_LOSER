/** Media queries compartidas por CSS y JS (mantener en sincronía con los @media). */
export const MEDIA = {
  motion: '(prefers-reduced-motion: no-preference)',
  reduced: '(prefers-reduced-motion: reduce)',
  desktop: '(min-width: 64rem)',
  mobile: '(max-width: 63.99rem)',
  finePointer: '(hover: hover) and (pointer: fine)',
} as const;

export const prefersReducedMotion = (): boolean => window.matchMedia(MEDIA.reduced).matches;

export const isDesktop = (): boolean => window.matchMedia(MEDIA.desktop).matches;

interface NetworkInformationLike {
  saveData?: boolean;
}

/** El usuario pidió ahorrar datos (Chrome/Android). */
export const prefersSaveData = (): boolean =>
  (navigator as Navigator & { connection?: NetworkInformationLike }).connection?.saveData === true;

/** Ejecuta `task` cuando el navegador está ocioso (fallback: timeout). */
export function whenIdle(task: () => void, timeout = 2000): () => void {
  if ('requestIdleCallback' in window) {
    const id = window.requestIdleCallback(task, { timeout });
    return () => window.cancelIdleCallback(id);
  }
  const id = globalThis.setTimeout(task, 300);
  return () => globalThis.clearTimeout(id);
}

/** Tarea de limpieza: todo módulo que registra algo devuelve una. */
export type Cleanup = () => void;
