// Collects keyboard, mouse and touch input. It never moves anything itself:
// movement.js asks for the current input each frame through pollInput().
const keys = new Set();
const MOVE_KEYS = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
const stick = { x: 0, y: 0 };
let lookX = 0, lookY = 0;

export function initInput(view, { onSwitch, onToggleOverview, onCloseOverview }) {
  addEventListener('keydown', (e) => {
    if (e.code.startsWith('Digit')) { onSwitch(Number(e.code.slice(5)) - 1); return; }
    if (e.code === 'KeyM') { onToggleOverview(); return; }
    if (e.code === 'Escape') { onCloseOverview(); return; }
    if (MOVE_KEYS.includes(e.code)) { keys.add(e.code); e.preventDefault(); }
  });
  addEventListener('keyup', (e) => keys.delete(e.code));
  addEventListener('blur', () => keys.clear());

  // Drag on the bodycam to look. On touch, the left part of the view is a move stick.
  const stickEl = document.getElementById('stick');
  const knob = document.getElementById('knob');
  let lookId = null, lastX = 0, lastY = 0, stickId = null, stickX = 0, stickY = 0;

  view.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button')) return;
    view.focus();
    const r = view.getBoundingClientRect();
    const leftZone = e.pointerType === 'touch' && (e.clientX - r.left) < r.width * 0.42;
    if (leftZone && stickId === null) {
      stickId = e.pointerId; stickX = e.clientX; stickY = e.clientY;
      stickEl.style.display = 'block';
      stickEl.style.left = `${e.clientX - r.left}px`;
      stickEl.style.top = `${e.clientY - r.top}px`;
      knob.style.transform = '';
    } else if (lookId === null) {
      lookId = e.pointerId; lastX = e.clientX; lastY = e.clientY;
    }
    try { view.setPointerCapture(e.pointerId); } catch (_) { /* capture is optional */ }
  });

  view.addEventListener('pointermove', (e) => {
    if (e.pointerId === lookId) {
      lookX += e.clientX - lastX; lookY += e.clientY - lastY;
      lastX = e.clientX; lastY = e.clientY;
    } else if (e.pointerId === stickId) {
      let dx = (e.clientX - stickX) / 44, dy = (e.clientY - stickY) / 44;
      const len = Math.hypot(dx, dy);
      if (len > 1) { dx /= len; dy /= len; }
      stick.x = dx; stick.y = dy;
      knob.style.transform = `translate(${dx * 30}px, ${dy * 30}px)`;
    }
  });

  const endPointer = (e) => {
    if (e.pointerId === lookId) lookId = null;
    if (e.pointerId === stickId) { stickId = null; stick.x = stick.y = 0; stickEl.style.display = 'none'; }
  };
  view.addEventListener('pointerup', endPointer);
  view.addEventListener('pointercancel', endPointer);
}

// Returns this frame's input and clears the accumulated look movement.
// forward/strafe are -1..1, turn is -1..1 (positive turns left), lookX/lookY are pixels dragged.
export function pollInput() {
  let forward = 0, strafe = 0, turn = 0;
  if (keys.has('KeyW') || keys.has('ArrowUp')) forward += 1;
  if (keys.has('KeyS') || keys.has('ArrowDown')) forward -= 1;
  if (keys.has('KeyD')) strafe += 1;
  if (keys.has('KeyA')) strafe -= 1;
  if (keys.has('ArrowLeft')) turn += 1;
  if (keys.has('ArrowRight')) turn -= 1;
  forward -= stick.y; strafe += stick.x;
  const out = { forward, strafe, turn, lookX, lookY };
  lookX = 0; lookY = 0;
  return out;
}
