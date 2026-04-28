export const enemies   = [];
export const asteroids = [];

// ── Enemy 
export function spawnEnemy(W, baseSpeed) {
  const size = 22 + Math.random() * 16;
  enemies.push({
    x:         size + Math.random() * (W - size * 2),
    y:         -size,
    size,
    speed:     baseSpeed + Math.random() * 50,
    angle:     0,
    rotSpeed:  (Math.random() - 0.5) * 2,
    color:     `hsl(${Math.random() * 40 + 330}, 90%, 65%)`,
    glowColor: `hsl(${Math.random() * 40 + 330}, 90%, 50%)`,
  });
}

export function updateEnemies(dt, H) {
  for (let i = enemies.length - 1; i >= 0; i--) {
    enemies[i].y     += enemies[i].speed * dt;
    enemies[i].angle += enemies[i].rotSpeed * dt;
    if (enemies[i].y > H + enemies[i].size * 2) enemies.splice(i, 1);
  }
}

export function drawEnemies(ctx) {
  enemies.forEach(e => {
    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.rotate(e.angle);
    ctx.shadowColor = e.glowColor;
    ctx.shadowBlur  = 15;

    // Glow halo
    const gs = e.size + 6;
    ctx.fillStyle = e.glowColor.replace('hsl', 'hsla').replace(')', ', 0.15)');
    ctx.fillRect(-gs / 2, -gs / 2, gs, gs);

    // Main body
    const g = ctx.createLinearGradient(-e.size / 2, -e.size / 2, e.size / 2, e.size / 2);
    g.addColorStop(0, e.color);
    g.addColorStop(1, e.glowColor);
    ctx.fillStyle = g;
    ctx.fillRect(-e.size / 2, -e.size / 2, e.size, e.size);

    // Inner detail cross-hatch
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(-e.size / 4, -e.size / 4, e.size / 2, e.size / 2);

    ctx.restore();
  });
}

// ── Asteroid
function generateShape(sides, size) {
  const pts = [];
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI * 2 / sides) * i;
    const r     = size * (0.65 + Math.random() * 0.35);
    pts.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r });
  }
  return pts;
}

export function spawnAsteroid(W) {
  const size  = 14 + Math.random() * 28;
  const sides = 7  + Math.floor(Math.random() * 5);
  asteroids.push({
    x:        size + Math.random() * (W - size * 2),
    y:        -size,
    size,
    speed:    60 + Math.random() * 80,
    angle:    0,
    rotSpeed: (Math.random() - 0.5) * 1.5,
    shape:    generateShape(sides, size),
    gray:     Math.floor(90 + Math.random() * 60),
  });
}

export function updateAsteroids(dt, H) {
  for (let i = asteroids.length - 1; i >= 0; i--) {
    asteroids[i].y     += asteroids[i].speed * dt;
    asteroids[i].angle += asteroids[i].rotSpeed * dt;
    if (asteroids[i].y > H + asteroids[i].size * 2) asteroids.splice(i, 1);
  }
}

export function drawAsteroids(ctx) {
  asteroids.forEach(a => {
    ctx.save();
    ctx.translate(a.x, a.y);
    ctx.rotate(a.angle);
    ctx.shadowColor = `rgba(${a.gray + 40}, ${a.gray + 20}, ${a.gray - 20}, 0.5)`;
    ctx.shadowBlur  = 8;
    ctx.fillStyle   = `rgb(${a.gray}, ${a.gray - 10}, ${a.gray - 30})`;
    ctx.strokeStyle = `rgba(${a.gray + 60}, ${a.gray + 40}, ${a.gray}, 0.7)`;
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    ctx.moveTo(a.shape[0].x, a.shape[0].y);
    for (let i = 1; i < a.shape.length; i++) ctx.lineTo(a.shape[i].x, a.shape[i].y);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.restore();
  });
}

// ── Reset 
export function resetEnemies() {
  enemies.length   = 0;
  asteroids.length = 0;
}
