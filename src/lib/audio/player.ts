import { gsap } from '@/lib/animations/gsap';
import type { Cleanup } from '@/lib/env';
import { formatTime } from '@/lib/content/format';
import { AudioManager, type AudioSnapshot, type TrackRef } from './audio-manager';
import { createVisualizer, type Visualizer } from './visualizer';

export interface PlayerOptions {
  /** Nombre del artista para la Media Session (pantalla bloqueada, etc.). */
  artist: string;
  animate: boolean;
  /** Nivel de audio por frame mientras suena (lo usa la atmósfera WebGL). */
  onLevel?: (level: number) => void;
}

const STATUS: Record<AudioSnapshot['state'], string> = {
  idle: 'Listo',
  loading: 'Cargando…',
  playing: 'Sonando',
  paused: 'En pausa',
  error: 'No se pudo reproducir',
};

/**
 * Conecta el AudioManager con el HTML del player (MusicPlayer.astro) y con
 * el control global de la navegación. El HTML ya es funcional y semántico;
 * esto solo agrega comportamiento.
 */
export function initPlayer(options: PlayerOptions): Cleanup {
  const root = document.querySelector<HTMLElement>('[data-player]');
  if (!root) return () => {};

  const toggles = [...root.querySelectorAll<HTMLButtonElement>('[data-track-toggle]')];
  const tracks: TrackRef[] = toggles.map((btn) => ({
    id: btn.dataset['trackToggle'] ?? '',
    title: btn.dataset['title'] ?? '',
    src: btn.dataset['src'] ?? '',
    duration: Number(btn.dataset['duration'] ?? 0),
  }));
  const first = tracks[0];
  if (!first) return () => {};

  const deck = root.querySelector<HTMLElement>('[data-deck]');
  const deckToggle = root.querySelector<HTMLButtonElement>('[data-deck-toggle]');
  const deckTitle = root.querySelector<HTMLElement>('[data-deck-title]');
  const deckStatus = root.querySelector<HTMLElement>('[data-deck-status]');
  const current = root.querySelector<HTMLElement>('[data-deck-current]');
  const total = root.querySelector<HTMLElement>('[data-deck-duration]');
  const seek = root.querySelector<HTMLInputElement>('[data-deck-seek]');
  const announcer = root.querySelector<HTMLElement>('[data-deck-announcer]');
  const vizCanvas = root.querySelector<HTMLCanvasElement>('[data-deck-viz]');
  const mini = document.querySelector<HTMLButtonElement>('[data-mini-toggle]');
  const miniLabel = document.querySelector<HTMLElement>('[data-mini-label]');

  const audio = new AudioManager();
  const visualizer: Visualizer | null = vizCanvas ? createVisualizer(vizCanvas, audio, { animate: options.animate }) : null;
  const abort = new AbortController();
  const { signal } = abort;
  let seeking = false;
  let levelRunning = false;
  let lastTrackId = '';
  let lastState: AudioSnapshot['state'] = 'idle';

  audio.load(first);
  visualizer?.setTrack(first.id);

  // ── Render del estado ───────────────────────────────
  const renderTime = (snap: AudioSnapshot) => {
    const { currentTime, duration } = snap;
    if (current) current.textContent = formatTime(currentTime);
    if (total) total.textContent = formatTime(duration);
    if (seek && !seeking) {
      seek.max = String(Math.max(1, Math.floor(duration)));
      seek.value = String(Math.floor(currentTime));
    }
    if (seek) {
      seek.style.setProperty('--fill', `${duration > 0 ? (currentTime / duration) * 100 : 0}%`);
      seek.setAttribute('aria-valuetext', `${formatTime(currentTime)} de ${formatTime(duration)}`);
    }
    visualizer?.refresh();
  };

  const renderState = (snap: AudioSnapshot) => {
    const { track, state } = snap;
    if (!track) return;
    const active = state === 'playing' || state === 'loading';

    toggles.forEach((btn) => {
      const id = btn.dataset['trackToggle'];
      const title = btn.dataset['title'] ?? '';
      const isCurrent = id === track.id;
      const row = btn.closest<HTMLElement>('[data-track-row]');
      const label = btn.querySelector('[data-track-label]');
      const playingThis = isCurrent && active;
      btn.setAttribute('aria-label', `${playingThis ? 'Pausar' : 'Reproducir'} ${title}`);
      if (label) label.textContent = playingThis ? 'Pausa' : 'Play';
      if (row) {
        if (isCurrent && state !== 'idle') row.dataset['state'] = active ? 'playing' : state;
        else delete row.dataset['state'];
      }
    });

    if (deck) deck.dataset['state'] = active ? 'playing' : state;
    if (deckTitle) deckTitle.textContent = track.title;
    if (deckStatus) deckStatus.textContent = STATUS[state];
    deckToggle?.setAttribute('aria-label', `${active ? 'Pausar' : 'Reproducir'} ${track.title}`);

    if (mini && state !== 'idle') {
      mini.hidden = false;
      mini.dataset['state'] = active ? 'playing' : 'paused';
      mini.setAttribute('aria-label', `${active ? 'Pausar' : 'Reanudar'} ${track.title}`);
      if (miniLabel) miniLabel.textContent = active ? 'Pausa' : 'Play';
    }

    // Anuncio solo en cambios relevantes (no en cada timeupdate).
    if (announcer && (track.id !== lastTrackId || (state !== lastState && state !== 'loading'))) {
      announcer.textContent = state === 'error' ? `${STATUS.error}: ${track.title}` : `${STATUS[state]}: ${track.title}`;
    }
    if (track.id !== lastTrackId) visualizer?.setTrack(track.id);
    lastTrackId = track.id;
    lastState = state;

    if (state === 'playing') {
      visualizer?.start();
      startLevelLoop();
    } else {
      visualizer?.stop();
      stopLevelLoop();
    }
    updateMediaSession(snap);
  };

  // ── Nivel de audio → atmósfera ──────────────────────
  const levelTick = () => options.onLevel?.(audio.getLevel());
  const startLevelLoop = () => {
    if (!options.onLevel || levelRunning) return;
    levelRunning = true;
    gsap.ticker.add(levelTick);
  };
  const stopLevelLoop = () => {
    if (!levelRunning) return;
    levelRunning = false;
    gsap.ticker.remove(levelTick);
    options.onLevel?.(0);
  };

  // ── Media Session (controles del sistema / pantalla bloqueada) ─
  const updateMediaSession = (snap: AudioSnapshot) => {
    if (!('mediaSession' in navigator) || !snap.track) return;
    navigator.mediaSession.metadata = new MediaMetadata({ title: snap.track.title, artist: options.artist });
    navigator.mediaSession.playbackState = snap.state === 'playing' ? 'playing' : 'paused';
  };
  const indexOfCurrent = () => tracks.findIndex((t) => t.id === audio.snapshot.track?.id);
  const playAt = (i: number) => {
    const t = tracks[(i + tracks.length) % tracks.length];
    if (t) void audio.play(t);
  };
  if ('mediaSession' in navigator) {
    const ms = navigator.mediaSession;
    const handlers: [MediaSessionAction, MediaSessionActionHandler][] = [
      ['play', () => void audio.play()],
      ['pause', () => audio.pause()],
      ['nexttrack', () => playAt(indexOfCurrent() + 1)],
      ['previoustrack', () => playAt(indexOfCurrent() - 1)],
      ['seekto', (d) => d.seekTime !== undefined && audio.seek(d.seekTime)],
    ];
    handlers.forEach(([action, fn]) => {
      try {
        ms.setActionHandler(action, fn);
      } catch {
        /* acción no soportada por este navegador */
      }
    });
    signal.addEventListener('abort', () => handlers.forEach(([a]) => ms.setActionHandler(a, null)));
  }

  // ── Eventos ─────────────────────────────────────────
  const unsubscribe = audio.subscribe((snap, event) => {
    if (event === 'time') renderTime(snap);
    if (event === 'state') {
      renderState(snap);
      renderTime(snap);
    }
    if (event === 'ended') {
      const next = indexOfCurrent() + 1;
      if (next < tracks.length) playAt(next);
      else audio.seek(0);
    }
  });

  toggles.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      const t = tracks[i];
      if (t) void audio.toggle(t);
    }, { signal });
  });
  deckToggle?.addEventListener('click', () => void audio.toggle(), { signal });
  mini?.addEventListener('click', () => void audio.toggle(), { signal });

  if (seek) {
    seek.addEventListener('input', () => {
      seeking = true;
      const value = Number(seek.value);
      const { duration } = audio.snapshot;
      if (current) current.textContent = formatTime(value);
      seek.style.setProperty('--fill', `${duration > 0 ? (value / duration) * 100 : 0}%`);
    }, { signal });
    seek.addEventListener('change', () => {
      seeking = false;
      audio.seek(Number(seek.value));
    }, { signal });
  }

  renderState(audio.snapshot);

  return () => {
    abort.abort();
    unsubscribe();
    stopLevelLoop();
    visualizer?.destroy();
    audio.destroy();
  };
}
