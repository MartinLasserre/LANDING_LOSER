/**
 * Shaders de la atmósfera. Dos pases:
 *   1. SMOKE (baja resolución): humo fBm con domain warping. Es lo caro.
 *   2. POST (resolución de canvas): aberración cromática, pulso de "acorde",
 *      paleta y viñeta. Muestrea la textura del pase 1 tres veces: barato.
 * El grano de película vive en CSS (body::after) para mantenerse nítido.
 */

export const FULLSCREEN_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

export const smokeFragment = (octaves: number) => /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform float uAspect;
uniform float uTurbulence;
uniform float uAudio;
uniform vec2 uMouse;

float noise(vec3 p) {
  vec3 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float n = i.x + i.y * 57.0 + 113.0 * i.z;
  vec4 h = fract(sin(vec4(n, n + 1.0, n + 57.0, n + 58.0)) * 43758.5453);
  vec4 h2 = fract(sin(vec4(n + 113.0, n + 114.0, n + 170.0, n + 171.0)) * 43758.5453);
  return mix(mix(mix(h.x, h.y, f.x), mix(h.z, h.w, f.x), f.y),
             mix(mix(h2.x, h2.y, f.x), mix(h2.z, h2.w, f.x), f.y), f.z);
}

float fbm(vec3 p) {
  float a = 0.5, s = 0.0;
  for (int i = 0; i < ${octaves}; i++) { s += a * noise(p); p = p * 2.02 + 7.1; a *= 0.5; }
  return s;
}

void main() {
  vec2 scale = vec2(uAspect, 1.0) * 1.6;
  vec2 p = vUv * scale;
  vec2 m = uMouse * scale;
  // El cursor empuja el humo como una corriente de aire.
  float md = length(p - m);
  p += (p - m) * 0.25 * exp(-md * md * 1.5) * (0.6 + uAudio);

  float t = uTime;
  vec3 q = vec3(p, t * 0.06);
  vec2 w = vec2(fbm(q + vec3(0.0, 0.0, t * 0.03)), fbm(q + vec3(5.2, 1.3, 0.0)));
  float n = fbm(vec3(p + (1.6 + uTurbulence * 1.5 + uAudio * 0.8) * w, t * 0.05));
  gl_FragColor = vec4(smoothstep(0.25, 0.95, n), 0.0, 0.0, 1.0);
}
`;

export const POST_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D uSmoke;
uniform float uPulse;
uniform float uTurbulence;
uniform float uAudio;
uniform float uIntensity;
uniform float uHero;

vec3 ramp(float d) {
  // Paleta de las fotos: ink → oxblood → blood, picos neon.
  vec3 col = mix(vec3(0.03, 0.0, 0.0), vec3(0.30, 0.0, 0.03), d);
  return col + vec3(0.55, 0.06, 0.04) * pow(d, 4.0) * (0.35 + 0.3 * uAudio);
}

void main() {
  vec2 uv = vUv;
  vec2 c = uv - 0.5;
  float r = length(c);

  // Pulso: onda radial breve, como un golpe de acorde distorsionado.
  uv += c * sin(r * 30.0 - uPulse * 12.0) * 0.012 * uPulse;

  float ca = 0.002 + 0.005 * (uTurbulence + uAudio) + 0.004 * uHero;
  vec2 off = c * ca * 3.0;
  vec3 col;
  col.r = ramp(texture2D(uSmoke, uv + off).r).r;
  col.g = ramp(texture2D(uSmoke, uv).r).g;
  col.b = ramp(texture2D(uSmoke, uv - off).r).b;

  col *= mix(0.45, 1.0, uIntensity);
  col *= smoothstep(1.2, 0.2, r * 1.2);
  gl_FragColor = vec4(max(col, 0.0), 1.0);
}
`;
