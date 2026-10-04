/**
 * Entrada del cliente. Orquesta los sistemas en orden de progressive
 * enhancement: HTML/CSS ya funcionan; esto agrega scroll, motion, audio y,
 * al final y en diferido, la atmósfera WebGL.
 */
import { ScrollTrigger } from '@/lib/animations/gsap';
import { initMotion } from '@/lib/animations';
import { glitchOnce } from '@/lib/animations/glitch';
import { initPlayer } from '@/lib/audio/player';
import { prefersReducedMotion, whenIdle, type Cleanup } from '@/lib/env';
import { initAnchors, restoreHashPosition } from '@/lib/scroll/anchors';
import { initHeaderState } from '@/lib/scroll/header';
import { initSections } from '@/lib/scroll/sections';
import { initSmoothScroll } from '@/lib/scroll/smooth-scroll';
import { initCopyButtons } from '@/lib/ui/copy';
import { initLightbox } from '@/lib/ui/lightbox';
import { initMobileMenu } from '@/lib/ui/mobile-menu';
import { initFeaturedVideo } from '@/lib/video/featured-video';
import type { Atmosphere } from '@/lib/webgl/atmosphere';
import { loadAtmosphere } from '@/lib/webgl';

const reduced = prefersReducedMotion();
const cleanups: Cleanup[] = [];
let atmosphere: Atmosphere | null = null;
let disposed = false;

const scroll = initSmoothScroll({ smooth: !reduced });
cleanups.push(() => scroll.destroy());
cleanups.push(initAnchors(scroll));
cleanups.push(initMobileMenu(scroll));

cleanups.push(
  initMotion({
    hero: {
      onProgress: (p) => atmosphere?.setHero(p),
      onImpact: () => atmosphere?.pulse(),
    },
    onSceneChange: () => {
      atmosphere?.pulse();
      glitchOnce(document.querySelector('[data-archive-closing]'));
    },
  }),
);

cleanups.push(initSections(({ atmosphere: intensity }) => atmosphere?.setIntensity(intensity)));
cleanups.push(initHeaderState());

const band = document.querySelector('meta[property="og:site_name"]')?.getAttribute('content') ?? '';
cleanups.push(
  initPlayer({
    artist: band,
    animate: !reduced,
    onLevel: (level) => atmosphere?.setAudioLevel(level),
  }),
);
cleanups.push(initFeaturedVideo());
cleanups.push(initLightbox(scroll));
cleanups.push(initCopyButtons());

// Señal para el timeout de seguridad del <head>: el motion system arrancó.
document.documentElement.setAttribute('data-motion-ready', '');

// La carga de fuentes cambia métricas: recalcular posiciones una vez.
void document.fonts?.ready.then(() => {
  if (disposed) return;
  ScrollTrigger.refresh();
  restoreHashPosition(scroll);
});

const offScroll = scroll.onVelocity((v) => atmosphere?.setTurbulence(Math.abs(v) / 60));
cleanups.push(offScroll);

cleanups.push(
  whenIdle(() => {
    void loadAtmosphere(reduced).then((instance) => {
      if (disposed) instance?.destroy();
      else atmosphere = instance;
    });
  }),
);
cleanups.push(() => atmosphere?.destroy());

// HMR en desarrollo: limpiar listeners, triggers y loops antes de recargar.
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    disposed = true;
    cleanups.reverse().forEach((fn) => fn());
  });
}
