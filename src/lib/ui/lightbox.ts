import type { Cleanup } from '@/lib/env';
import type { SmoothScroll } from '@/lib/scroll/smooth-scroll';

/**
 * Lightbox de flyers sobre `<dialog>` nativo: `showModal()` da semántica de
 * diálogo, Escape, fondo inerte y foco dentro. Acá se agrega: cargar la
 * imagen grande, cerrar con el botón o tocando fuera, bloquear el scroll y
 * devolver el foco al flyer que lo abrió.
 */
export function initLightbox(scroll: SmoothScroll): Cleanup {
  const dialog = document.querySelector<HTMLDialogElement>('[data-lightbox]');
  const img = dialog?.querySelector<HTMLImageElement>('[data-lightbox-img]');
  const caption = dialog?.querySelector<HTMLElement>('[data-lightbox-caption]');
  const closeButton = dialog?.querySelector<HTMLButtonElement>('[data-lightbox-close]');
  if (!dialog || !img || !closeButton) return () => {};

  const abort = new AbortController();
  const { signal } = abort;
  let opener: HTMLElement | null = null;

  document.querySelectorAll<HTMLButtonElement>('[data-lightbox-open]').forEach((button) => {
    button.addEventListener(
      'click',
      () => {
        const { fullSrc, fullWidth, fullHeight, alt, caption: text } = button.dataset;
        if (!fullSrc) return;
        opener = button;
        img.src = fullSrc;
        if (fullWidth) img.width = Number(fullWidth);
        if (fullHeight) img.height = Number(fullHeight);
        img.alt = alt ?? '';
        if (caption) caption.textContent = text ?? '';
        dialog.showModal();
        scroll.lock();
      },
      { signal },
    );
  });

  closeButton.addEventListener('click', () => dialog.close(), { signal });
  // Click fuera de la imagen (sobre el fondo del diálogo) cierra.
  dialog.addEventListener(
    'click',
    (event) => {
      if (event.target === dialog) dialog.close();
    },
    { signal },
  );
  dialog.addEventListener(
    'close',
    () => {
      scroll.unlock();
      opener?.focus({ preventScroll: true });
      opener = null;
    },
    { signal },
  );

  return () => {
    if (dialog.open) dialog.close();
    abort.abort();
  };
}
