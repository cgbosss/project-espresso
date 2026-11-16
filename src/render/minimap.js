import { CONFIG, MAP_COLORS } from '../config.js';
import { horizontalFov } from './cameras.js';

// The 2D map painter. The four mini-maps and the overview all use paintMap with different framing.
const FONT = '500 10px "IBM Plex Mono", monospace';

// Matches a canvas's pixel size to its on-screen size and returns a context scaled for sharp drawing.
export function fitCanvas(canvas) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = canvas.clientWidth, h = canvas.clientHeight;
  const pw = Math.round(w * dpr), ph = Math.round(h * dpr);
  if (canvas.width !== pw || canvas.height !== ph) { canvas.width = pw; canvas.height = ph; }
  const g = canvas.getContext('2d');
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { g, w, h };
}

// Paints the level with north up.
// cx/cz: world point at the centre. scale: pixels per unit. focus: index of the crew member to emphasise.
export function paintMap(g, w, h, cx, cz, scale, focus, state) {
  const level = state.level;
  const H = level.half, CELL = level.cell;
  const X = (x) => w / 2 + (x - cx) * scale;
  const Z = (z) => h / 2 + (z - cz) * scale;

  g.fillStyle = MAP_COLORS.background;
  g.fillRect(0, 0, w, h);

  // checker floor, only the cells in view
  const x0 = Math.max(-H, Math.floor((cx - w / 2 / scale) / CELL) * CELL), x1 = Math.min(H, cx + w / 2 / scale);
  const z0 = Math.max(-H, Math.floor((cz - h / 2 / scale) / CELL) * CELL), z1 = Math.min(H, cz + h / 2 / scale);
  for (let x = x0; x < x1; x += CELL) {
    for (let z = z0; z < z1; z += CELL) {
      g.fillStyle = ((Math.round(x / CELL) + Math.round(z / CELL)) & 1) ? MAP_COLORS.floorB : MAP_COLORS.floorA;
      g.fillRect(X(x), Z(z), CELL * scale + 0.5, CELL * scale + 0.5);
    }
  }

  // walls, with the north and south edges in team colours
  g.lineWidth = 2; g.strokeStyle = MAP_COLORS.wall;
  g.strokeRect(X(-H), Z(-H), H * 2 * scale, H * 2 * scale);
  g.lineWidth = 3;
  g.strokeStyle = level.teams.north.color; g.beginPath(); g.moveTo(X(-H), Z(-H)); g.lineTo(X(H), Z(-H)); g.stroke();
  g.strokeStyle = level.teams.south.color; g.beginPath(); g.moveTo(X(-H), Z(H)); g.lineTo(X(H), Z(H)); g.stroke();

  for (const o of level.obstacles) {
    g.fillStyle = MAP_COLORS.obstacle;
    g.fillRect(X(o.x - o.w / 2), Z(o.z - o.d / 2), o.w * scale, o.d * scale);
    g.lineWidth = 1; g.strokeStyle = MAP_COLORS.obstacleEdge;
    g.strokeRect(X(o.x - o.w / 2), Z(o.z - o.d / 2), o.w * scale, o.d * scale);
  }

  // vision cones first, dots on top
  const half = horizontalFov(state.aspect) / 2;
  state.crew.forEach((m, i) => {
    const a = Math.atan2(-Math.cos(m.yaw), -Math.sin(m.yaw));   // screen angle of "forward"
    const px = X(m.x), pz = Z(m.z), r = CONFIG.coneLength * scale;
    const grad = g.createRadialGradient(px, pz, 0, px, pz, r);
    grad.addColorStop(0, m.color + (i === focus ? 'aa' : '55'));
    grad.addColorStop(1, m.color + '00');
    g.fillStyle = grad;
    g.beginPath(); g.moveTo(px, pz); g.arc(px, pz, r, a - half, a + half); g.closePath(); g.fill();
  });
  state.crew.forEach((m, i) => {
    const px = X(m.x), pz = Z(m.z), r = i === focus ? 5.5 : 4;
    g.fillStyle = m.color; g.beginPath(); g.arc(px, pz, r, 0, Math.PI * 2); g.fill();
    if (i === state.active) { g.strokeStyle = '#fff'; g.lineWidth = 1.5; g.beginPath(); g.arc(px, pz, r + 3, 0, Math.PI * 2); g.stroke(); }
    g.fillStyle = MAP_COLORS.label; g.font = FONT; g.textBaseline = 'middle';
    g.fillText(m.call, px + r + 5, pz - r - 3);
  });

  g.fillStyle = MAP_COLORS.dim; g.font = FONT; g.textBaseline = 'top'; g.textAlign = 'right';
  g.fillText('N ▲', w - 6, 5);
  g.textAlign = 'left';
}
