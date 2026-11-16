// Entry point: loads a level, starts every part of the game, then runs the loop.
import { state, setActive, onActiveChange } from './state.js';
import level01 from './levels/level01.js';
import { loadLevel } from './levels/loader.js';
import { initInput, pollInput } from './systems/input.js';
import { updateMovement } from './systems/movement.js';
import { updateCrewAI } from './systems/crewAI.js';
import { updateGuardAI } from './systems/guardAI.js';
import { updateObjectives } from './systems/objectives.js';
import { initScene, getCrewRoots, syncScene, resizeScene, renderScene } from './render/scene3d.js';
import { initCameras, syncCameras, setCameraAspect, getActiveCamera } from './render/cameras.js';
import { initHud, showActive, toggleOverview, updateHud, showWebglError } from './render/hud.js';

const view = document.getElementById('view');

loadLevel(level01);

const webglOk = initScene(view, state);
initCameras(getCrewRoots());
initHud(state, { onSelect: setActive });
if (!webglOk) showWebglError();

initInput(view, {
  onSwitch: setActive,
  onToggleOverview: () => toggleOverview(),
  onCloseOverview: () => { if (state.overviewOpen) toggleOverview(false); },
});

onActiveChange(() => showActive(state));
setActive(0);

function resize() {
  const w = view.clientWidth, h = view.clientHeight;
  if (!w || !h) return;
  state.aspect = w / h;
  setCameraAspect(state.aspect);
  resizeScene(w, h);
}
new ResizeObserver(resize).observe(view);
resize();

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  state.time += dt;

  // 1. systems change the state
  updateMovement(state, pollInput(), dt);
  updateCrewAI(state, dt);
  updateGuardAI(state, dt);
  updateObjectives(state, dt);

  // 2. render draws the state
  syncScene(state);
  syncCameras(state);
  renderScene(getActiveCamera(state));
  updateHud(state);

  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
