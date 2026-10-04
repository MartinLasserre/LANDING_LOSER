export interface TrackRef {
  id: string;
  title: string;
  src: string;
  /** Duración conocida (dato del sitio) hasta que el archivo informe la real. */
  duration: number;
}

export type PlaybackState = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

export interface AudioSnapshot {
  track: TrackRef | null;
  state: PlaybackState;
  currentTime: number;
  duration: number;
}

export type AudioEvent = 'state' | 'time' | 'ended';
type Listener = (snapshot: AudioSnapshot, event: AudioEvent) => void;

/**
 * Fuente de audio única del sitio.
 *
 * - Un solo HTMLAudioElement: empezar un track pausa el anterior por diseño.
 * - `preload = 'none'`: no se descarga nada hasta que el usuario da play
 *   (los MP3 suman ~24 MB); las duraciones vienen de los datos del sitio.
 * - El análisis de nivel (Web Audio) se crea perezosamente en el primer play,
 *   que siempre ocurre tras un gesto del usuario.
 * - Todos los listeners se registran con un AbortController: `destroy()`
 *   los retira de una vez.
 */
export class AudioManager {
  private readonly audio: HTMLAudioElement;
  private readonly listeners = new Set<Listener>();
  private readonly abort = new AbortController();
  private track: TrackRef | null = null;
  private state: PlaybackState = 'idle';
  private context: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private levels: Uint8Array<ArrayBuffer> | null = null;

  constructor() {
    this.audio = new Audio();
    this.audio.preload = 'none';
    const { signal } = this.abort;
    const on = (type: keyof HTMLMediaElementEventMap, handler: () => void) =>
      this.audio.addEventListener(type, handler, { signal });

    on('playing', () => this.setState('playing'));
    on('waiting', () => this.setState('loading'));
    on('pause', () => {
      if (!this.audio.ended) this.setState('paused');
    });
    on('timeupdate', () => this.emit('time'));
    on('durationchange', () => this.emit('time'));
    on('ended', () => {
      this.setState('paused');
      this.emit('ended');
    });
    on('error', () => {
      if (this.audio.getAttribute('src')) this.setState('error');
    });
  }

  get snapshot(): AudioSnapshot {
    const real = this.audio.duration;
    return {
      track: this.track,
      state: this.state,
      currentTime: this.audio.currentTime || 0,
      duration: Number.isFinite(real) && real > 0 ? real : (this.track?.duration ?? 0),
    };
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** Selecciona un track sin reproducirlo. */
  load(track: TrackRef): void {
    if (this.track?.id === track.id) return;
    this.audio.pause();
    this.track = track;
    this.audio.src = track.src;
    this.setState('idle');
  }

  async play(track?: TrackRef): Promise<void> {
    if (track) this.load(track);
    if (!this.track) return;
    this.ensureAnalyser();
    if (this.context?.state === 'suspended') void this.context.resume();
    if (this.audio.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) this.setState('loading');
    try {
      await this.audio.play();
    } catch (error) {
      // AbortError: el play fue interrumpido por un pause/cambio de track. No es un error.
      if (error instanceof DOMException && error.name === 'AbortError') return;
      this.setState('error');
    }
  }

  pause(): void {
    this.audio.pause();
  }

  /** Play/pausa del track dado (o del actual). Cambiar de track pausa el anterior. */
  toggle(track?: TrackRef): Promise<void> {
    if (track && track.id !== this.track?.id) return this.play(track);
    if (this.audio.paused) return this.play();
    this.pause();
    return Promise.resolve();
  }

  seek(seconds: number): void {
    const { duration } = this.snapshot;
    this.audio.currentTime = Math.min(Math.max(0, seconds), duration || seconds);
    this.emit('time');
  }

  /** Nivel RMS actual (0–1). 0 si no hay análisis disponible o no suena nada. */
  getLevel(): number {
    if (!this.analyser || !this.levels || this.state !== 'playing') return 0;
    this.analyser.getByteTimeDomainData(this.levels);
    let sum = 0;
    for (const v of this.levels) {
      const n = (v - 128) / 128;
      sum += n * n;
    }
    return Math.min(1, Math.sqrt(sum / this.levels.length) * 2.5);
  }

  /** Bandas de frecuencia normalizadas (0–1) para el visualizador. */
  getBands(out: Float32Array): boolean {
    if (!this.analyser || !this.levels || this.state !== 'playing') return false;
    this.analyser.getByteFrequencyData(this.levels);
    const usable = Math.floor(this.levels.length * 0.7); // los agudos extremos casi no se mueven
    const per = usable / out.length;
    for (let i = 0; i < out.length; i++) {
      let peak = 0;
      const from = Math.floor(i * per);
      const to = Math.max(from + 1, Math.floor((i + 1) * per));
      for (let j = from; j < to; j++) peak = Math.max(peak, this.levels[j] ?? 0);
      out[i] = peak / 255;
    }
    return true;
  }

  destroy(): void {
    this.audio.pause();
    this.audio.removeAttribute('src');
    this.audio.load();
    this.abort.abort();
    this.listeners.clear();
    void this.context?.close();
    this.context = null;
    this.analyser = null;
  }

  private ensureAnalyser(): void {
    if (this.context || typeof AudioContext === 'undefined') return;
    try {
      this.context = new AudioContext();
      const source = this.context.createMediaElementSource(this.audio);
      this.analyser = this.context.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;
      this.levels = new Uint8Array(this.analyser.frequencyBinCount);
      source.connect(this.analyser).connect(this.context.destination);
    } catch {
      // Sin Web Audio el player funciona igual; solo no hay visualización reactiva.
      this.analyser = null;
    }
  }

  private setState(state: PlaybackState): void {
    if (state === this.state) return;
    this.state = state;
    this.emit('state');
  }

  private emit(event: AudioEvent): void {
    const snap = this.snapshot;
    this.listeners.forEach((fn) => fn(snap, event));
  }
}
