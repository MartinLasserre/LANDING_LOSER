import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { gsap, ScrollTrigger } from '@/lib/animations/gsap';

export type ScrollTarget = HTMLElement | number;

export interface SmoothScroll {
  /** Scroll animado (o instantáneo sin smooth) hacia un elemento o posición. */
  scrollTo(target: ScrollTarget, options?: { immediate?: boolean; onComplete?: () => void }): void;
  /** Suscripción a la velocidad de scroll (px/frame). */
  onVelocity(listener: (velocity: number) => void): () => void;
  destroy(): void;
}

/**
 * Sistema de scroll central.
 * - Con motion: Lenis, conducido por el ticker de GSAP (un solo loop rAF
 *   para Lenis, ScrollTrigger y WebGL) y sincronizado con ScrollTrigger.
 * - Con reduced motion: scroll nativo, sin smoothing.
 * En touch Lenis deja el scroll nativo (syncTouch: false por defecto).
 */
export function initSmoothScroll({ smooth }: { smooth: boolean }): SmoothScroll {
  const listeners = new Set<(velocity: number) => void>();

  if (!smooth) {
    let lastY = window.scrollY;
    const onScroll = () => {
      const v = window.scrollY - lastY;
      lastY = window.scrollY;
      listeners.forEach((fn) => fn(v));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return {
      scrollTo(target, options) {
        const top = typeof target === 'number' ? target : target.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top, behavior: 'auto' });
        options?.onComplete?.();
      },
      onVelocity(listener) {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
      destroy() {
        window.removeEventListener('scroll', onScroll);
        listeners.clear();
      },
    };
  }

  const lenis = new Lenis({ autoRaf: false, lerp: 0.1, smoothWheel: true });
  const onLenisScroll = (instance: Lenis) => {
    ScrollTrigger.update();
    listeners.forEach((fn) => fn(instance.velocity));
  };
  const tick = (time: number) => lenis.raf(time * 1000);

  lenis.on('scroll', onLenisScroll);
  gsap.ticker.add(tick);
  // Sin lag smoothing: Lenis y ScrollTrigger deben ver el mismo tiempo real.
  gsap.ticker.lagSmoothing(0);

  return {
    scrollTo(target, options) {
      lenis.scrollTo(target, {
        immediate: options?.immediate ?? false,
        duration: 1.4,
        ...(options?.onComplete && { onComplete: options.onComplete }),
      });
    },
    onVelocity(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    destroy() {
      gsap.ticker.remove(tick);
      lenis.destroy();
      listeners.clear();
    },
  };
}
