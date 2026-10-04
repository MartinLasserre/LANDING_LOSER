import * as THREE from 'three';

const VERT = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float uTime, uScroll, uBoost, uPulse, uAspect;
uniform vec2 uMouse;

float hash(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p,p+45.32); return fract(p.x*p.y); }
float noise(vec3 p){
  vec3 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  float n = i.x + i.y*57.0 + 113.0*i.z;
  vec4 h = fract(sin(vec4(n, n+1.0, n+57.0, n+58.0))*43758.5453);
  vec4 h2 = fract(sin(vec4(n+113.0, n+114.0, n+170.0, n+171.0))*43758.5453);
  return mix(mix(mix(h.x,h.y,f.x), mix(h.z,h.w,f.x), f.y),
             mix(mix(h2.x,h2.y,f.x), mix(h2.z,h2.w,f.x), f.y), f.z);
}
float fbm(vec3 p){
  float a = 0.5, s = 0.0;
  for(int i=0;i<5;i++){ s += a*noise(p); p = p*2.02 + 7.1; a *= 0.5; }
  return s;
}
vec3 smoke(vec2 uv, float t, float chroma){
  vec2 p = uv * vec2(uAspect,1.0) * 1.6;
  vec2 m = (uMouse - 0.5) * vec2(uAspect,1.0) * 1.6;
  float md = length(p - m - vec2(0.0));
  p += (p - m) * 0.25 * exp(-md*md*1.5) * (0.6+uBoost);
  vec3 q = vec3(p, t*0.06);
  vec2 w = vec2(fbm(q + vec3(0.0,0.0,t*0.03)), fbm(q + vec3(5.2,1.3,0.0)));
  float n = fbm(vec3(p + (1.6 + uScroll*1.5 + uBoost)*w, t*0.05));
  float d = smoothstep(0.25, 0.95, n);
  vec3 col = mix(vec3(0.03,0.0,0.0), vec3(0.30,0.0,0.03), d);
  col += vec3(0.55,0.06,0.04) * pow(d, 4.0) * (0.35 + 0.15*uBoost);
  return col;
}
void main(){
  vec2 uv = vUv;
  vec2 c = uv - 0.5;
  float r = length(c);
  uv += c * sin(r*30.0 - uPulse*12.0) * 0.012 * uPulse; // pulso de acorde
  float ca = (0.002 + 0.004*(uScroll + uBoost)) ;
  vec2 off = c * ca * 3.0;
  vec3 col;
  col.r = smoke(uv + off, uTime, ca).r;
  col.g = smoke(uv, uTime, ca).g;
  col.b = smoke(uv - off, uTime, ca).b;
  // grano: fino por pixel + uno mas grueso que cambia por cuadro
  float g1 = hash(gl_FragCoord.xy + fract(uTime)*100.0) - 0.5;
  float g2 = hash(floor(gl_FragCoord.xy*0.5) + floor(uTime*24.0)*17.0) - 0.5;
  col += (g1*0.12 + g2*0.08) * (0.6 + 0.8*smoothstep(0.0, 0.4, max(col.r, 0.05)));
  col *= smoothstep(1.2, 0.2, r*1.2);                              // vineta
  gl_FragColor = vec4(max(col, 0.0), 1.0);
}`;

export function initScene(canvas, { reducedMotion = false } = {}) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'low-power' });
    if (!renderer.getContext()) throw new Error('no ctx');
  } catch (e) {
    return null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
  const scene = new THREE.Scene();
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const speed = reducedMotion ? 0.25 : 1;

  const uniforms = {
    uTime: { value: 0 }, uScroll: { value: 0 }, uBoost: { value: 0 }, uPulse: { value: 0 },
    uAspect: { value: 1 }, uMouse: { value: new THREE.Vector2(0.5, 0.5) },
  };
  scene.add(new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms, depthTest: false })
  ));

  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    uniforms.uAspect.value = w / h;
  }
  resize();
  window.addEventListener('resize', resize);

  const mouseT = new THREE.Vector2(0.5, 0.5);
  window.addEventListener('pointermove', (e) => {
    mouseT.set(e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight);
  });

  let scrollT = 0, scrollV = 0, lastY = window.scrollY, boostT = 0;
  const maxScroll = () => Math.max(1, document.documentElement.scrollHeight - window.innerHeight);

  const clock = new THREE.Clock();
  let t = 0, raf = 0, nextPulse = 8, pulseVal = 0;

  function frame() {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05);
    t += dt * speed;
    const y = window.scrollY;
    scrollV = scrollV * 0.92 + Math.min(Math.abs(y - lastY) / 60, 1) * 0.08;
    lastY = y;
    scrollT = y / maxScroll();
    uniforms.uTime.value = t;
    uniforms.uScroll.value += ((scrollT * 0.6 + scrollV) - uniforms.uScroll.value) * 0.05;
    uniforms.uBoost.value += (boostT - uniforms.uBoost.value) * 0.05;
    uniforms.uMouse.value.lerp(mouseT, 0.04);
    if (!reducedMotion) {
      nextPulse -= dt;
      if (nextPulse <= 0) { pulseVal = 1; nextPulse = 8 + Math.random() * 4; }
      pulseVal = Math.max(0, pulseVal - dt * 3.3);
      uniforms.uPulse.value = pulseVal;
    }
    renderer.autoClear = true;
    renderer.render(scene, cam);
  }

  const start = () => { if (!raf) { clock.getDelta(); frame(); } };
  const stop = () => { cancelAnimationFrame(raf); raf = 0; };
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  start();

  return { setBoost: (v) => { boostT = v; }, stop, start };
}
