// ═══════════════════════════════════════════════════════════════
//  NOVA RIFT — audio.js
//  Web Audio API sound effects
// ═══════════════════════════════════════════════════════════════

const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

export function unlockAudio() {
  if (!audioCtx) audioCtx = new AudioCtx();
}

function getAudio() {
  if (!audioCtx) audioCtx = new AudioCtx();
  return audioCtx;
}

export function playShoot() {
  try {
    const ac = getAudio();
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.connect(g); g.connect(ac.destination);
    o.type = 'square';
    o.frequency.setValueAtTime(880, ac.currentTime);
    o.frequency.exponentialRampToValueAtTime(220, ac.currentTime + 0.1);
    g.gain.setValueAtTime(0.15, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.12);
    o.start(); o.stop(ac.currentTime + 0.12);
  } catch (e) {}
}

export function playExplosion() {
  try {
    const ac = getAudio();
    const bufSize = ac.sampleRate * 0.3;
    const buf = ac.createBuffer(1, bufSize, ac.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++)
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
    const src = ac.createBufferSource();
    const g = ac.createGain();
    const filter = ac.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 400;
    src.buffer = buf;
    src.connect(filter); filter.connect(g); g.connect(ac.destination);
    g.gain.setValueAtTime(0.5, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.3);
    src.start();
  } catch (e) {}
}

export function playHit() {
  try {
    const ac = getAudio();
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.connect(g); g.connect(ac.destination);
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(120, ac.currentTime);
    g.gain.setValueAtTime(0.3, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.15);
    o.start(); o.stop(ac.currentTime + 0.15);
  } catch (e) {}
}
