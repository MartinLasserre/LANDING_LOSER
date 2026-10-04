/**
 * Registro único de GSAP y plugins. Todo el sitio importa GSAP desde acá
 * para garantizar que los plugins estén registrados una sola vez.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

// En mobile la barra del navegador cambia el alto del viewport al scrollear:
// no recalcular todos los triggers por eso (evita saltos en secciones pinned).
ScrollTrigger.config({ ignoreMobileResize: true });

export { gsap, ScrollTrigger, SplitText };
