// ═══════════════════════════════════════════════════════════════
//  NOVA RIFT — background.js
//  Animated star field + nebula rendering
// ═══════════════════════════════════════════════════════════════

const STAR_LAYERS = [
  { count: 80,  speed: 0.3, size: 0.8, alpha: 0.3 },
  { count: 50,  speed: 0.7, size: 1.2, alpha: 0.5 },
  { count: 25,  speed: 1.4, size: 2.0, alpha: 0.8 },
];

export const stars = [];

export function initStars(W, H) {
  stars.length = 0;
  STAR_LAYERS.forEach((layer) => {
    for (let i = 0; i < layer.count; i++) {
      stars.push({
        x:       Math.random() * W,
        y:       Math.random() * H,
        speed:   layer.speed + Math.random() * 0.3,
        size:    layer.size  + Math.random() * 0.5,
        alpha:   layer.alpha * (0.7 + Math.random() * 0.3),
        twinkle: Math.random() * Math.PI * 2,
      });
    }
  });
}

export function updateStars(dt, W, H) {
  stars.forEach(s => {
    s.y       += s.speed * dt * 60;
    s.twinkle += 0.05;
    if (s.y > H + 5) { s.y = -5; s.x = Math.random() * W; }
  });
}

export function drawStars(ctx) {
  stars.forEach(s => {
    const a = s.alpha * (0.7 + 0.3 * Math.sin(s.twinkle));
    ctx.fillStyle = `rgba(200, 220, 255, ${a})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fill();
  });
}

export function drawNebula(ctx, W, H) {
  const grad1 = ctx.createRadialGradient(150, 200, 0, 150, 200, 220);
  grad1.addColorStop(0, 'rgba(80, 0, 160, 0.07)');
  grad1.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad1;
  ctx.fillRect(0, 0, W, H);

  const grad2 = ctx.createRadialGradient(460, 550, 0, 460, 550, 200);
  grad2.addColorStop(0, 'rgba(0, 60, 160, 0.06)');
  grad2.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad2;
  ctx.fillRect(0, 0, W, H);
}
