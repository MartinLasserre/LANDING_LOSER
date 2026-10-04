/**
 * Glitch como acento puntual (entrada del logo, cambio de escena): agrega
 * `.is-glitching` una sola vez y la retira al terminar la animación CSS.
 */
export function glitchOnce(el: Element | null): void {
  if (!el) return;
  el.classList.remove('is-glitching');
  // Forzar reflow para poder re-disparar la animación.
  void (el as HTMLElement).offsetWidth;
  el.classList.add('is-glitching');
  el.addEventListener('animationend', () => el.classList.remove('is-glitching'), { once: true });
}
