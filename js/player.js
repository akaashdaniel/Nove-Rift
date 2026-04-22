// ═══════════════════════════════════════════════════════════════
//  NOVA RIFT — player.js
//  Player state, movement, rendering, and bullet management
// ═══════════════════════════════════════════════════════════════

import { playShoot } from './audio.js';

export const player = {
  x: 300, y: 700,
  w: 24,  h: 30,
  speed: 280,
  health: 100, maxHealth: 100,
  shootCooldown: 0, shootRate: 0.15,
  invincible: 0,
  thrusterAnim: 0,
  trail: [],
};

export const bullets = [];

// ── Reset ─────────────────────────────────────────────────────
export function resetPlayer(W, H) {
  player.x = W / 2;
  player.y = H - 100;
  player.health = player.maxHealth;
  player.invincible = 0;
  player.trail = [];
  player.thrusterAnim = 0;
  bullets.length = 0;
}

// ── Shoot ─────────────────────────────────────────────────────
export function spawnBullet() {
  bullets.push({
    x: player.x,
    y: player.y - player.h / 2 - 4,
    vy: -600,
    w: 3, h: 14,
  });
  playShoot();
}

// ── Update ────────────────────────────────────────────────────
export function updatePlayer(dt, keys, W, H) {
  const px_old = player.x;

  if ((keys['ArrowLeft']  || keys['KeyA']) && player.x - player.w / 2 > 5)    player.x -= player.speed * dt;
  if ((keys['ArrowRight'] || keys['KeyD']) && player.x + player.w / 2 < W - 5) player.x += player.speed * dt;
  if ((keys['ArrowUp']    || keys['KeyW']) && player.y - player.h / 2 > 5)    player.y -= player.speed * dt;
  if ((keys['ArrowDown']  || keys['KeyS']) && player.y + player.h / 2 < H - 30) player.y += player.speed * dt;

  // Engine trail
  if (Math.abs(player.x - px_old) > 0.1 || keys['ArrowUp'] || keys['KeyW']) {
    player.trail.push({ x: player.x, y: player.y + player.h / 2 });
    if (player.trail.length > 10) player.trail.shift();
  }

  // Shoot
  player.shootCooldown -= dt;
  if ((keys['Space'] || keys['ArrowUp']) && player.shootCooldown <= 0) {
    spawnBullet();
    player.shootCooldown = player.shootRate;
  }

  if (player.invincible > 0) player.invincible -= dt;
}

export function updateBullets(dt, H) {
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].y += bullets[i].vy * dt;
    if (bullets[i].y < -20) bullets.splice(i, 1);
  }
}

// ── Draw ──────────────────────────────────────────────────────
export function drawPlayer(ctx) {
  if (player.invincible > 0 && Math.floor(player.invincible * 10) % 2 === 0) return;

  const { x, y, w, h } = player;

  // Trail
  player.trail.forEach((t, i) => {
    const a = (i / player.trail.length) * 0.4;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = '#00aaff';
    ctx.beginPath();
    ctx.arc(t.x, t.y, 3 * (i / player.trail.length), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // Thruster flame
  player.thrusterAnim += 0.15;
  const thrW = 10 + Math.sin(player.thrusterAnim) * 3;
  const thrH = 20 + Math.sin(player.thrusterAnim * 1.3) * 5;
  const thrGrad = ctx.createLinearGradient(x, y + h / 2, x, y + h / 2 + thrH);
  thrGrad.addColorStop(0, 'rgba(0,180,255,0.9)');
  thrGrad.addColorStop(0.4, 'rgba(0,100,255,0.5)');
  thrGrad.addColorStop(1, 'rgba(0,50,200,0)');
  ctx.save();
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = thrGrad;
  ctx.beginPath();
  ctx.moveTo(x - thrW / 2, y + h / 2);
  ctx.lineTo(x + thrW / 2, y + h / 2);
  ctx.lineTo(x, y + h / 2 + thrH);
  ctx.closePath(); ctx.fill();
  ctx.restore();

  // Ship body
  ctx.save();
  ctx.shadowColor = 'rgba(0, 200, 255, 0.8)';
  ctx.shadowBlur = 20;

  // Outer glow
  ctx.fillStyle = 'rgba(0, 150, 255, 0.15)';
  ctx.beginPath();
  ctx.moveTo(x, y - h / 2 - 6);
  ctx.lineTo(x + w / 2 + 6, y + h / 2 + 6);
  ctx.lineTo(x - w / 2 - 6, y + h / 2 + 6);
  ctx.closePath(); ctx.fill();

  // Main triangle
  const bodyGrad = ctx.createLinearGradient(x, y - h / 2, x, y + h / 2);
  bodyGrad.addColorStop(0, '#80ffee');
  bodyGrad.addColorStop(0.5, '#00ccff');
  bodyGrad.addColorStop(1, '#0055cc');
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(x, y - h / 2);
  ctx.lineTo(x + w / 2, y + h / 2);
  ctx.lineTo(x - w / 2, y + h / 2);
  ctx.closePath(); ctx.fill();

  // Highlight streak
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.beginPath();
  ctx.moveTo(x, y - h / 2);
  ctx.lineTo(x + 4, y);
  ctx.lineTo(x - 4, y);
  ctx.closePath(); ctx.fill();

  ctx.restore();
}

export function drawBullets(ctx) {
  bullets.forEach(b => {
    ctx.save();
    ctx.shadowColor = '#00ffcc';
    ctx.shadowBlur = 12;
    const g = ctx.createLinearGradient(b.x, b.y, b.x, b.y + b.h);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.3, '#00ffcc');
    g.addColorStop(1, 'rgba(0,200,180,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.roundRect(b.x - b.w / 2, b.y - b.h, b.w, b.h, 2);
    ctx.fill();
    ctx.restore();
  });
}
