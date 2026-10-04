import './style.css';
import { initScene } from './scene.js';

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canvas = document.getElementById('bg');
const bg = initScene(canvas, { reducedMotion: reduced });
if (!bg) document.documentElement.classList.add('no-webgl');

// Revelado al scroll
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
}, { threshold: 0.2 });
document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = `${(i % 4) * 90}ms`;
  io.observe(el);
});

// Hover en música => más feedback en el fondo
document.querySelectorAll('.tracks li').forEach((li) => {
  li.addEventListener('pointerenter', () => bg && bg.setBoost(1));
  li.addEventListener('pointerleave', () => bg && bg.setBoost(0));
});

// Glitch del título cada 6–10s
if (!reduced) {
  const h1 = document.querySelector('.glitch');
  (function schedule() {
    setTimeout(() => {
      h1.classList.add('is-glitching');
      setTimeout(() => h1.classList.remove('is-glitching'), 150);
      schedule();
    }, 6000 + Math.random() * 4000);
  })();
}

// Reproductor
const audio = new Audio();
let currentTrack = null;
document.querySelectorAll('.tracks .track').forEach(tr => {
  tr.style.cursor = 'pointer';
  tr.addEventListener('click', () => {
    const src = tr.getAttribute('data-src');
    const btn = tr.querySelector('.btn');
    if (currentTrack === tr) {
      if (audio.paused) { audio.play(); btn.textContent = 'PAUSA'; tr.classList.add('playing'); }
      else { audio.pause(); btn.textContent = 'PLAY'; tr.classList.remove('playing'); }
    } else {
      if (currentTrack) {
        currentTrack.querySelector('.btn').textContent = 'PLAY';
        currentTrack.classList.remove('playing');
      }
      audio.src = src;
      audio.play();
      btn.textContent = 'PAUSA';
      tr.classList.add('playing');
      currentTrack = tr;
    }
  });
});

audio.addEventListener('ended', () => {
  if (currentTrack) {
    currentTrack.querySelector('.btn').textContent = 'PLAY';
    currentTrack.classList.remove('playing');
    currentTrack = null;
  }
});
