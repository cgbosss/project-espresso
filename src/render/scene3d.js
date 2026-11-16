import * as THREE from 'three';

// Builds the 3D world from the level data and keeps the crew models in step with the state.
// Nothing here changes the game state.
let renderer = null;
let scene = null;
const crewModels = [];   // one { root, body } per crew member, same order as state.crew

const lambert = (color) => new THREE.MeshLambertMaterial({ color });

function addBox(x, y, z, w, h, d, material) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  scene.add(mesh);
  return mesh;
}

function checkerTexture(level) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = '#a3a6a9'; g.fillRect(0, 0, 128, 128);
  g.fillStyle = '#74787c'; g.fillRect(0, 0, 64, 64); g.fillRect(64, 64, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  const repeats = (level.half * 2) / (level.cell * 2);   // the texture holds 2 x 2 cells
  t.repeat.set(repeats, repeats);
  t.magFilter = THREE.NearestFilter;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function labelSprite(text, color) {
  const c = document.createElement('canvas');
  c.width = 128; c.height = 64;
  const g = c.getContext('2d');
  g.font = '600 40px "IBM Plex Mono", monospace';
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillStyle = 'rgba(11,15,19,.75)'; g.fillRect(14, 8, 100, 48);
  g.fillStyle = color; g.fillText(text, 64, 34);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: t }));
  sprite.scale.set(0.9, 0.45, 1);
  sprite.position.y = 2.25;
  return sprite;
}

// Graybox stand-in for a crew member: a capsule with a dark visor showing which way they face.
function crewModel(member) {
  const root = new THREE.Group();   // position and yaw; the bodycam is attached to this
  const body = new THREE.Group();   // everything visible, hidden while you are this member
  const capsule = new THREE.Mesh(new THREE.CapsuleGeometry(0.4, 1.0, 6, 16), lambert(member.color));
  capsule.position.y = 0.9;
  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.16, 0.12), lambert(0x14191e));
  visor.position.set(0, 1.5, -0.36);   // local -z is forward
  body.add(capsule, visor, labelSprite(member.call, member.color));
  root.add(body);
  return { root, body };
}

// Returns false if the browser cannot start WebGL.
export function initScene(view, state) {
  const level = state.level;
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0f1418);
  scene.fog = new THREE.Fog(0x0f1418, 34, 80);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x4a5058, 2.4));
  const sun = new THREE.DirectionalLight(0xffffff, 1.2);
  sun.position.set(8, 20, 6);
  scene.add(sun);

  const H = level.half, WH = level.wallHeight;
  const floorTexture = checkerTexture(level);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(H * 2, H * 2), new THREE.MeshLambertMaterial({ map: floorTexture }));
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  const wall = lambert(0x868c92);
  addBox(0, WH / 2, -H - 0.25, H * 2 + 1, WH, 0.5, wall);
  addBox(0, WH / 2, H + 0.25, H * 2 + 1, WH, 0.5, wall);
  addBox(-H - 0.25, WH / 2, 0, 0.5, WH, H * 2, wall);
  addBox(H + 0.25, WH / 2, 0, 0.5, WH, H * 2, wall);
  // team-coloured bands so you can tell north from south at a glance
  addBox(0, WH - 0.5, -H + 0.02, H * 2, 0.35, 0.04, new THREE.MeshBasicMaterial({ color: level.teams.north.color }));
  addBox(0, WH - 0.5, H - 0.02, H * 2, 0.35, 0.04, new THREE.MeshBasicMaterial({ color: level.teams.south.color }));

  for (const o of level.obstacles) {
    addBox(o.x, o.h / 2, o.z, o.w, o.h, o.d, lambert(o.kind === 'vault' ? 0xc3c7ca : 0x9da3a8));
  }

  crewModels.length = 0;
  for (const member of state.crew) {
    const model = crewModel(member);
    scene.add(model.root);
    crewModels.push(model);
  }

  try {
    renderer = new THREE.WebGLRenderer({ antialias: true });
  } catch (_) {
    renderer = null;
    return false;
  }
  floorTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  view.insertBefore(renderer.domElement, view.firstChild);
  return true;
}

// The groups the bodycams attach to, in crew order.
export function getCrewRoots() {
  return crewModels.map((m) => m.root);
}

// Copy positions and facing from the state onto the models.
export function syncScene(state) {
  state.crew.forEach((member, i) => {
    const model = crewModels[i];
    model.root.position.set(member.x, 0, member.z);
    model.root.rotation.y = member.yaw;
    model.body.visible = i !== state.active;   // don't draw yourself in your own cam
  });
}

export function resizeScene(width, height) {
  if (!renderer) return;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(width, height, false);
}

// Only the active bodycam is ever drawn in 3D.
export function renderScene(camera) {
  if (renderer) renderer.render(scene, camera);
}
