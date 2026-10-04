import type { Cleanup } from '@/lib/env';

/** Botones `[data-copy]`: copian su valor y lo confirman (visual + lector de pantalla). */
export function initCopyButtons(): Cleanup {
  const abort = new AbortController();
  document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((button) => {
    const label = button.querySelector<HTMLElement>('[data-copy-label]');
    const status = button.parentElement?.querySelector<HTMLElement>('[data-copy-status]');
    const original = label?.textContent?.trim() ?? '';
    let timer = 0;

    button.addEventListener(
      'click',
      async () => {
        const value = button.dataset['copy'] ?? '';
        let message: string;
        try {
          await navigator.clipboard.writeText(value);
          message = 'Copiado';
        } catch {
          message = 'No se pudo copiar';
        }
        if (label) label.textContent = message;
        if (status) status.textContent = message === 'Copiado' ? `${value} copiado al portapapeles` : message;
        window.clearTimeout(timer);
        timer = window.setTimeout(() => {
          if (label) label.textContent = original;
        }, 2000);
      },
      { signal: abort.signal },
    );
  });
  return () => abort.abort();
}
