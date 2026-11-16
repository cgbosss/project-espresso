import { CONFIG } from '../config.js';

// Moves the player-controlled crew member and keeps them out of walls and obstacles.
export function updateMovement(state, input, dt) {
  const m = state.crew[state.active];
  if (!m) return;

  // looking
  m.yaw -= input.lookX * CONFIG.lookX;
  m.yaw += input.turn * CONFIG.turnSpeed * dt;
  m.pitch = Math.max(-CONFIG.maxPitch, Math.min(CONFIG.maxPitch, m.pitch - input.lookY * CONFIG.lookY));

  // walking
  const len = Math.hypot(input.forward, input.strafe);
  if (len < 0.001) return;
  const k = (Math.min(1, len) / len) * CONFIG.speed * dt;
  const fx = -Math.sin(m.yaw), fz = -Math.cos(m.yaw);   // forward on the floor
  const rx = Math.cos(m.yaw), rz = -Math.sin(m.yaw);    // right
  m.x += (fx * input.forward + rx * input.strafe) * k;
  m.z += (fz * input.forward + rz * input.strafe) * k;
  collide(m, state.level);
}

// Circle against the room edges and each obstacle box.
export function collide(m, level) {
  const lim = level.half - CONFIG.radius;
  m.x = Math.max(-lim, Math.min(lim, m.x));
  m.z = Math.max(-lim, Math.min(lim, m.z));
  for (const o of level.obstacles) {
    const nx = Math.max(o.x - o.w / 2, Math.min(m.x, o.x + o.w / 2));
    const nz = Math.max(o.z - o.d / 2, Math.min(m.z, o.z + o.d / 2));
    const dx = m.x - nx, dz = m.z - nz, d = Math.hypot(dx, dz);
    if (d < CONFIG.radius && d > 1e-6) {
      m.x = nx + (dx / d) * CONFIG.radius;
      m.z = nz + (dz / d) * CONFIG.radius;
    }
  }
}
