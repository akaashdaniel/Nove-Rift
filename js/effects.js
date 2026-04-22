// ═══════════════════════════════════════════════════════════════
//  NOVA RIFT — effects.js
//  Particle explosions and floating score popups
// ═══════════════════════════════════════════════════════════════

export const particles    = [];
export const scorePopups  = [];

// ── Explosions ────────────────────────────────────────────────
export function spawnExplosion(x, y, color, count = 18) {
  // Debris particles
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
    const speed = 1.5 + Math.random() * 3.5;
    particles.push({
      x, y,
      vx:    Math.cos(angle) * speed,
      vy:    Math.sin(angle) * speed,
      life:  1,
      decay: 0.025 + Math.random() * 0.025,
      size:  2 + Math.random() * 3,
      color,
      flash: false,
    });
  }
  // Flash burst
  particles.push({
    x, y,
    vx: 0, vy: 0,
    life: 1, decay: 0.08,
    size: 30,
    color: 'rgba(255,255,255,0.8)',
    flash: true,
  });
}

export function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x  += p.vx * dt * 60;
    p.y  += p.vy * dt * 60;
    p.vy += 0.05 * dt * 60; // subtle gravity pull
    p.life -= p.decay * dt * 60;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

export function drawParticles(ctx) {
  particles.forEach(p => {
    ctx.save();
    if (p.flash) {
      ctx.globalAlpha = p.life * 0.8;
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * p.life);
      g.addColorStop(0, 'rgba(255,255,255,0.9)');
      g.addColorStop(1, 'rgba(255,180,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.globalAlpha = p.life;
      ctx.fillStyle   = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  });
}

// ── Score Popups ──────────────────────────────────────────────
export function spawnScorePopup(x, y, value) {
  scorePopups.push({ x, y, value, life: 1, vy: -1.2 });
}

export function updateScorePopups(dt) {
  for (let i = scorePopups.length - 1; i >= 0; i--) {
    scorePopups[i].y    += scorePopups[i].vy * dt * 60;
    scorePopups[i].life -= 0.018 * dt * 60;
    if (scorePopups[i].life <= 0) scorePopups.splice(i, 1);
  }
}

export function drawScorePopups(ctx) {
  scorePopups.forEach(p => {
    ctx.save();
    ctx.globalAlpha   = p.life;
    ctx.font          = 'bold 16px Orbitron, monospace';
    ctx.fillStyle     = '#ffd700';
    ctx.textAlign     = 'center';
    ctx.shadowColor   = 'rgba(255,215,0,0.8)';
    ctx.shadowBlur    = 10;
    ctx.fillText(`+${p.value}`, p.x, p.y);
    ctx.restore();
  });
}

// ── Reset ─────────────────────────────────────────────────────
export function resetEffects() {
  particles.length   = 0;
  scorePopups.length = 0;
}
