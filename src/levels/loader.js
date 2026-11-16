import { state } from '../state.js';

// Copies a level's data into the shared state. Call once before the game starts.
export function loadLevel(level) {
  state.level = level;
  state.crew = level.crew.map((c) => ({
    ...c,
    teamLabel: level.teams[c.team].label,
    pitch: 0,
    order: 'hold',     // what an AI-controlled member is doing; only 'hold' exists so far
  }));
  state.guards = level.guards.map((g) => ({ ...g }));
  state.active = 0;
  state.alarm = false;
  state.time = 0;
}
