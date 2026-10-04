import { claimMediaFocus, registerMediaOwner } from '@/lib/audio/media-focus';
import type { Cleanup } from '@/lib/env';

const YT_ORIGIN = 'https://www.youtube-nocookie.com';

/**
 * Video destacado (Video.astro).
 *
 * Local: el <video> trae `controls` para funcionar sin JS; acá se ocultan y
 * se muestra el play propio. Tras el primer play quedan los controles nativos.
 *
 * YouTube: "fachada". El poster es una imagen liviana; el iframe (y todo su
 * JS) se crea recién cuando el usuario da play. Sin JS, el play es un link a
 * YouTube.
 *
 * Audio: el video se registra en media-focus. Si arranca, pausa el player de
 * tracks; si arranca un track, el video se pausa. Nunca suenan juntos.
 */
export function initFeaturedVideo(): Cleanup {
  const frame = document.querySelector<HTMLElement>('[data-video-frame]');
  const play = frame?.querySelector<HTMLElement>('[data-video-play]');
  if (!frame || !play) return () => {};

  const abort = new AbortController();
  const { signal } = abort;
  const kind = frame.dataset['videoKind'];
  let offFocus: () => void = () => {};

  if (kind === 'local') {
    const video = frame.querySelector<HTMLVideoElement>('video[data-video-media]');
    if (!video) return () => {};
    video.controls = false;

    play.addEventListener(
      'click',
      () => {
        video.controls = true;
        frame.dataset['state'] = 'started';
        void video.play().catch(() => {
          // Si el navegador bloquea el play, quedan los controles nativos.
        });
        video.focus({ preventScroll: true });
      },
      { signal },
    );
    video.addEventListener(
      'play',
      () => {
        frame.dataset['state'] = 'started';
        claimMediaFocus('video');
      },
      { signal },
    );
    offFocus = registerMediaOwner({ id: 'video', pause: () => video.pause() });
  }

  if (kind === 'youtube') {
    const holder = frame.querySelector<HTMLElement>('[data-youtube-id]');
    const id = holder?.dataset['youtubeId'];
    if (!holder || !id) return () => {};
    let iframe: HTMLIFrameElement | null = null;
    const post = (message: object) => iframe?.contentWindow?.postMessage(JSON.stringify(message), YT_ORIGIN);

    play.addEventListener(
      'click',
      (event) => {
        event.preventDefault();
        if (iframe) return;
        iframe = document.createElement('iframe');
        iframe.src = `${YT_ORIGIN}/embed/${encodeURIComponent(id)}?autoplay=1&enablejsapi=1&playsinline=1&rel=0`;
        iframe.title = holder.dataset['youtubeTitle'] ?? 'Video';
        iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
        // Pedir eventos de estado para saber cuándo vuelve a sonar.
        iframe.addEventListener('load', () => post({ event: 'listening', id: 'featured-video' }), { signal });
        holder.replaceChildren(iframe);
        frame.dataset['state'] = 'started';
        claimMediaFocus('video');
        iframe.focus();
      },
      { signal },
    );

    window.addEventListener(
      'message',
      (event) => {
        if (event.origin !== YT_ORIGIN || event.source !== iframe?.contentWindow) return;
        try {
          const data = JSON.parse(String(event.data)) as { info?: { playerState?: number } };
          if (data.info?.playerState === 1) claimMediaFocus('video'); // 1 = reproduciendo
        } catch {
          /* mensajes ajenos a la API */
        }
      },
      { signal },
    );
    offFocus = registerMediaOwner({
      id: 'video',
      pause: () => post({ event: 'command', func: 'pauseVideo', args: [] }),
    });
  }

  return () => {
    offFocus();
    abort.abort();
  };
}
