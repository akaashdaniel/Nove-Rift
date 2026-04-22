// ═══════════════════════════════════════════════════════════════
//  NOVA RIFT — game.js
//  Core game loop, state management, collision detection, HUD
// ═══════════════════════════════════════════════════════════════

import { unlockAudio, playExplosion, playHit } from './audio.js';
import { initStars, updateStars, drawStars, drawNebula } from './background.js';
import {
  player, bullets,
  resetPlayer, updatePlayer, updateBullets,
  drawPlayer, drawBullets,
} from './player.js';
import {
  enemies, asteroids,
  spawnEnemy, spawnAsteroid,
  updateEnemies, updateAsteroids,
  drawEnemies, drawAsteroids,
  resetEnemies,
} from './enemies.js';
import {
  spawnExplosion, spawnScorePopup,
  updateParticles, updateScorePopups,
  drawParticles, drawScorePopups,
  resetEffects,
} from './effects.js';

// ── Canvas Setup ──────────────────────────────────────────────
const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;

// ── DOM refs ──────────────────────────────────────────────────
const scoreEl       = document.getElementById('scoreDisplay');
const hiScoreEl     = document.getElementById('hiScoreDisplay');
const waveEl        = document.getElementById('waveDisplay');
const healthFill    = document.getElementById('healthFill');
const waveIndicator = document.getElementById('waveIndicator');

const startScreen    = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreEl   = document.getElementById('finalScore');
const finalHiScoreEl = document.getElementById('finalHiScore');
const newRecordBadge = document.getElementById('newRecordBadge');

// ── Game State ────────────────────────────────────────────────
let gameState = 'start'; // 'start' | 'playing' | 'gameover'
let score     = 0;
let hiScore   = parseInt(localStorage.getItem('novarift_hi') || '0');
let wave      = 1;
let waveTimer = 0;
let waveShowTimer = 0;

let enemySpawnTimer  = 0;
let enemySpawnRate   = 1.8;
let enemyBaseSpeed   = 80;
let asteroidSpawnTimer = 0;
let asteroidSpawnRate  = 3.5;

const keys = {};
let lastTime = null;

// ── HUD ───────────────────────────────────────────────────────
function updateHUD() {
  scoreEl.textContent   = score;
  hiScoreEl.textContent = hiScore;
  waveEl.textContent    = wave;

  const pct = (player.health / player.maxHealth) * 100;
  healthFill.style.width = pct + '%';
  const r = Math.round(255 - pct * 1.5);
  const g = Math.round(pct * 1.8);
  healthFill.style.background =
    `linear-gradient(90deg, rgb(${r},${g < 50 ? 10 : 50},20), rgb(${r},${Math.min(g, 200)},20))`;
}

// ── Wave Announce ─────────────────────────────────────────────
function showWaveAnnounce(n) {
  waveIndicator.textContent = `WAVE ${n}`;
  waveIndicator.classList.add('show');
  waveShowTimer = 2;
}

// ── Reset ─────────────────────────────────────────────────────
function resetGame() {
  score = 0; wave = 1; waveTimer = 0;
  enemySpawnRate   = 1.8; enemyBaseSpeed  = 80;
  asteroidSpawnRate = 3.5;
  enemySpawnTimer  = 0; asteroidSpawnTimer = 0;
  resetPlayer(W, H);
  resetEnemies();
  resetEffects();
  updateHUD();
  showWaveAnnounce(1);
}

// ── Collision Helpers ─────────────────────────────────────────
function circleRect(cx, cy, cr, rx, ry, rw, rh) {
  const dx = Math.abs(cx - rx), dy = Math.abs(cy - ry);
  if (dx > rw / 2 + cr || dy > rh / 2 + cr) return false;
  if (dx <= rw / 2 || dy <= rh / 2) return true;
  return (dx - rw / 2) ** 2 + (dy - rh / 2) ** 2 <= cr ** 2;
}

function circleCircle(x1, y1, r1, x2, y2, r2) {
  return Math.hypot(x1 - x2, y1 - y2) < r1 + r2;
}

// ── Game Over ─────────────────────────────────────────────────
function triggerGameOver() {
  gameState = 'gameover';
  spawnExplosion(player.x, player.y, '#00ccff', 40);
  playExplosion();

  finalScoreEl.textContent   = score;
  finalHiScoreEl.textContent = hiScore;
  newRecordBadge.classList.toggle('show', score >= hiScore && score > 0);

  setTimeout(() => gameOverScreen.classList.remove('hidden'), 800);
}

// ── Update ────────────────────────────────────────────────────
function update(dt) {
  if (gameState !== 'playing') return;

  // Player
  updatePlayer(dt, keys, W, H);
  updateBullets(dt, H);

  // Spawn timers
  enemySpawnTimer -= dt;
  if (enemySpawnTimer <= 0) {
    spawnEnemy(W, enemyBaseSpeed);
    enemySpawnTimer = enemySpawnRate * (0.8 + Math.random() * 0.4);
  }

  asteroidSpawnTimer -= dt;
  if (asteroidSpawnTimer <= 0) {
    spawnAsteroid(W);
    asteroidSpawnTimer = asteroidSpawnRate * (0.7 + Math.random() * 0.6);
  }

  // Wave progression
  waveTimer += dt;
  if (waveTimer > 20) {
    waveTimer = 0; wave++;
    enemyBaseSpeed   = Math.min(80 + wave * 15, 260);
    enemySpawnRate   = Math.max(0.5, 1.8 - wave * 0.12);
    asteroidSpawnRate = Math.max(1.2, 3.5 - wave * 0.15);
    showWaveAnnounce(wave);
  }

  if (waveShowTimer > 0) {
    waveShowTimer -= dt;
    if (waveShowTimer <= 0) waveIndicator.classList.remove('show');
  }

  updateEnemies(dt, H);
  updateAsteroids(dt, H);
  updateParticles(dt);
  updateScorePopups(dt);

  // Bullet ↔ Enemy
  for (let bi = bullets.length - 1; bi >= 0; bi--) {
    const b = bullets[bi];
    for (let ei = enemies.length - 1; ei >= 0; ei--) {
      const e = enemies[ei];
      if (circleRect(b.x, b.y, 3, e.x, e.y, e.size, e.size)) {
        const pts = 10 + wave * 5;
        score += pts;
        if (score > hiScore) {
          hiScore = score;
          localStorage.setItem('novarift_hi', hiScore);
        }
        spawnScorePopup(e.x, e.y, pts);
        spawnExplosion(e.x, e.y, e.color, 20);
        playExplosion();
        enemies.splice(ei, 1);
        bullets.splice(bi, 1);
        break;
      }
    }
  }

  // Player ↔ Enemy
  if (player.invincible <= 0) {
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      if (circleRect(player.x, player.y, player.w * 0.7, e.x, e.y, e.size, e.size)) {
        player.health -= 25;
        player.invincible = 1.5;
        spawnExplosion(e.x, e.y, e.color, 12);
        playHit();
        enemies.splice(i, 1);
        if (player.health <= 0) { triggerGameOver(); return; }
        break;
      }
    }

    // Player ↔ Asteroid
    for (let i = asteroids.length - 1; i >= 0; i--) {
      const a = asteroids[i];
      if (circleCircle(player.x, player.y, player.w * 0.65, a.x, a.y, a.size * 0.7)) {
        player.health -= 20;
        player.invincible = 1.5;
        spawnExplosion(a.x, a.y, '#aaaaaa', 10);
        playHit();
        asteroids.splice(i, 1);
        if (player.health <= 0) { triggerGameOver(); return; }
        break;
      }
    }
  }

  updateHUD();
}

// ── Draw ──────────────────────────────────────────────────────
function draw() {
  ctx.fillStyle = '#02020e';
  ctx.fillRect(0, 0, W, H);

  drawNebula(ctx, W, H);
  drawStars(ctx);

  if (gameState === 'playing' || gameState === 'gameover') {
    drawAsteroids(ctx);
    drawEnemies(ctx);
    drawBullets(ctx);
    if (gameState === 'playing') drawPlayer(ctx);
    drawParticles(ctx);
    drawScorePopups(ctx);
  }

  // Scanline overlay
  ctx.save();
  ctx.globalAlpha = 0.015;
  for (let y = 0; y < H; y += 3) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, y, W, 1);
  }
  ctx.restore();
}

// ── Main Loop ─────────────────────────────────────────────────
function loop(timestamp) {
  if (!lastTime) lastTime = timestamp;
  const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
  lastTime = timestamp;

  if (gameState === 'start') updateStars(dt, W, H);
  update(dt);
  draw();

  requestAnimationFrame(loop);
}

// ── Input ─────────────────────────────────────────────────────
document.addEventListener('keydown', e => { keys[e.code] = true; });
document.addEventListener('keyup',   e => { keys[e.code] = false; });

// ── UI Buttons ────────────────────────────────────────────────
document.getElementById('startBtn').addEventListener('click', () => {
  unlockAudio();
  startScreen.classList.add('hidden');
  resetGame();
  gameState = 'playing';
});

document.getElementById('restartBtn').addEventListener('click', () => {
  gameOverScreen.classList.add('hidden');
  resetGame();
  gameState = 'playing';
});

// ── Bootstrap ─────────────────────────────────────────────────
hiScoreEl.textContent = hiScore;
initStars(W, H);
requestAnimationFrame(loop);
