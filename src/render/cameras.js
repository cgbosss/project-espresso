import * as THREE from 'three';
import { CONFIG } from '../config.js';

// One bodycam per crew member, attached to that member's model so it moves and turns with them.
const cameras = [];

export function initCameras(crewRoots) {
  cameras.length = 0;
  for (const root of crewRoots) {
    const cam = new THREE.PerspectiveCamera(CONFIG.vfov, 16 / 9, 0.05, 140);
    cam.position.set(0, CONFIG.eyeHeight, -0.1);
    root.add(cam);
    cameras.push(cam);
  }
}

// Looking up and down tilts only the camera, not the body.
export function syncCameras(state) {
  state.crew.forEach((member, i) => { cameras[i].rotation.x = member.pitch; });
}

export function setCameraAspect(aspect) {
  for (const cam of cameras) { cam.aspect = aspect; cam.updateProjectionMatrix(); }
}

export function getActiveCamera(state) {
  return cameras[state.active];
}

// Horizontal field of view in radians, used to draw the vision cones on the maps.
export function horizontalFov(aspect) {
  return 2 * Math.atan(Math.tan((CONFIG.vfov * Math.PI) / 360) * aspect);
}
