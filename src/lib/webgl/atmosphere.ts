import {
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderer,
  WebGLRenderTarget,
} from 'three';
import { gsap } from 'gsap';
import { FULLSCREEN_VERT, POST_FRAG, smokeFragment } from './shaders';

export type AtmosphereQuality = 'high' | 'low';

export interface AtmosphereOptions {
  reducedMotion: boolean;
  quality: AtmosphereQuality;
}

/** Interfaz que el resto del sitio usa para "tocar" la atmósfera. */
export interface Atmosphere {
  /** 0–1: densidad/brillo por sección. */
  setIntensity(value: number): void;
  /** 0–1: progreso del scroll del hero (más aberración al salir). */
  setHero(progress: number): void;
  /** 0–1: velocidad de scroll normalizada. */
  setTurbulence(value: number): void;
  /** 0–1: nivel del audio que está sonando. */
  setAudioLevel(value: number): void;
  /** Dispara un pulso de distorsión (cambio de escena). */
  pulse(): void;
  destroy(): void;
}

const QUALITY = {
  high: { smokeScale: 0.5, octaves: 5, maxPixelRatio: 1.5 },
  low: { smokeScale: 0.33, octaves: 3, maxPixelRatio: 1 },
} as const;

/**
 * Atmósfera WebGL: humo rojo de fondo, a pantalla completa.
 * Es un enhancement: devuelve `null` si WebGL no está disponible y el
 * fondo CSS del documento queda como fallback.
 */
export function createAtmosphere(canvas: HTMLCanvasElement, options: AtmosphereOptions): Atmosphere | null {
  const quality = QUALITY[options.quality];

  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
      depth: false,
      stencil: false,
      powerPreference: 'low-power',
    });
  } catch {
    return null;
  }
  // La atmósfera es blanda: más píxeles no suman nitidez, solo costo.
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, quality.maxPixelRatio));

  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const geometry = new PlaneGeometry(2, 2);
  const target = new WebGLRenderTarget(1, 1, { depthBuffer: false });

  const smokeUniforms = {
    uTime: { value: 0 },
    uAspect: { value: 1 },
    uTurbulence: { value: 0 },
    uAudio: { value: 0 },
    uMouse: { value: new Vector2(0.5, 0.5) },
  };
  const postUniforms = {
    uSmoke: { value: target.texture },
    uPulse: { value: 0 },
    uTurbulence: smokeUniforms.uTurbulence,
    uAudio: smokeUniforms.uAudio,
    uIntensity: { value: 1 },
    uHero: { value: 0 },
  };

  const smokeMaterial = new ShaderMaterial({
    vertexShader: FULLSCREEN_VERT,
    fragmentShader: smokeFragment(quality.octaves),
    uniforms: smokeUniforms,
    depthTest: false,
    depthWrite: false,
  });
  const postMaterial = new ShaderMaterial({
    vertexShader: FULLSCREEN_VERT,
    fragmentShader: POST_FRAG,
    uniforms: postUniforms,
    depthTest: false,
    depthWrite: false,
  });

  const mesh = new Mesh(geometry, smokeMaterial);
  const scene = new Scene();
  scene.add(mesh);

  // Objetivos suavizados: los setters fijan destino, el loop interpola.
  const targets = { intensity: 1, hero: 0, turbulence: 0, audio: 0 };
  const mouseTarget = new Vector2(0.5, 0.5);
  let time = 0;
  let nextPulse = 8;
  let pulse = 0;
  let width = 0;
  let height = 0;
  let running = false;
  let destroyed = false;

  function render() {
    mesh.material = smokeMaterial;
    renderer.setRenderTarget(target);
    renderer.render(scene, camera);
    mesh.material = postMaterial;
    renderer.setRenderTarget(null);
    renderer.render(scene, camera);
  }

  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w === width && h === height) return;
    width = w;
    height = h;
    renderer.setSize(w, h, false);
    const pr = renderer.getPixelRatio();
    target.setSize(Math.max(1, Math.round(w * pr * quality.smokeScale)), Math.max(1, Math.round(h * pr * quality.smokeScale)));
    smokeUniforms.uAspect.value = w / Math.max(1, h);
    if (!running) render();
  }

  const tick = (_time: number, deltaMs: number) => {
    const dt = Math.min(deltaMs / 1000, 0.05);
    time += dt;
    const ease = 1 - Math.pow(0.001, dt); // suavizado independiente del framerate

    smokeUniforms.uTime.value = time;
    postUniforms.uIntensity.value += (targets.intensity - postUniforms.uIntensity.value) * ease * 0.5;
    postUniforms.uHero.value += (targets.hero - postUniforms.uHero.value) * ease;
    smokeUniforms.uTurbulence.value += (targets.turbulence - smokeUniforms.uTurbulence.value) * ease * 0.4;
    smokeUniforms.uAudio.value += (targets.audio - smokeUniforms.uAudio.value) * ease;
    smokeUniforms.uMouse.value.lerp(mouseTarget, ease * 0.3);

    nextPulse -= dt;
    if (nextPulse <= 0) {
      pulse = 1;
      nextPulse = 8 + Math.random() * 4;
    }
    pulse = Math.max(0, pulse - dt * 3.3);
    postUniforms.uPulse.value = pulse;

    render();
  };

  function start() {
    if (running || destroyed || options.reducedMotion) return;
    running = true;
    gsap.ticker.add(tick);
  }

  function stop() {
    if (!running) return;
    running = false;
    gsap.ticker.remove(tick);
  }

  const onPointerMove = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return;
    mouseTarget.set(event.clientX / window.innerWidth, 1 - event.clientY / window.innerHeight);
  };
  const onVisibility = () => (document.hidden ? stop() : start());
  const onContextLost = (event: Event) => {
    event.preventDefault();
    stop();
    canvas.classList.remove('is-ready');
  };
  const resizeObserver = new ResizeObserver(resize);

  resizeObserver.observe(canvas);
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  document.addEventListener('visibilitychange', onVisibility);
  canvas.addEventListener('webglcontextlost', onContextLost);

  resize();
  // Reduced motion: un único cuadro estático (se redibuja solo al redimensionar).
  render();
  start();
  canvas.classList.add('is-ready');

  return {
    setIntensity(value) {
      targets.intensity = value;
      if (!running) {
        postUniforms.uIntensity.value = value;
        render();
      }
    },
    setHero(progress) {
      targets.hero = progress;
    },
    setTurbulence(value) {
      targets.turbulence = Math.min(1, Math.max(0, value));
    },
    setAudioLevel(value) {
      targets.audio = value;
    },
    pulse() {
      pulse = 1;
    },
    destroy() {
      destroyed = true;
      stop();
      resizeObserver.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.classList.remove('is-ready');
      geometry.dispose();
      smokeMaterial.dispose();
      postMaterial.dispose();
      target.dispose();
      renderer.dispose();
    },
  };
}
