// The one shared game state. Levels are loaded into it, systems change it, render only reads it.
export const state = {
  level: null,          // the level data currently loaded
  crew: [],             // { call, team, teamLabel, color, x, z, yaw, pitch, order }
  guards: [],           // filled in once guardAI exists
  active: 0,            // index of the crew member the player controls
  alarm: false,
  time: 0,              // seconds since the level started
  aspect: 16 / 9,       // bodycam aspect ratio, used for the map vision cones
  overviewOpen: false,
};

const activeListeners = [];

// Run fn(index) every time the controlled crew member changes.
export function onActiveChange(fn) {
  activeListeners.push(fn);
}

export function setActive(index) {
  if (!Number.isInteger(index) || index < 0 || index >= state.crew.length) return;
  state.active = index;
  activeListeners.forEach((fn) => fn(index));
}

export function activeMember() {
  return state.crew[state.active];
}
