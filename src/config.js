// Tuning values shared across the game. Change numbers here, not inside the systems.
export const CONFIG = {
  radius: 0.45,        // crew collision radius
  speed: 5,            // walking speed, units per second
  turnSpeed: 1.8,      // arrow-key turning, radians per second
  lookX: 0.005,        // drag-to-look sensitivity
  lookY: 0.004,
  maxPitch: 1.1,       // how far you can look up or down, radians
  eyeHeight: 1.6,      // bodycam height on the capsule
  vfov: 70,            // bodycam vertical field of view, degrees
  coneLength: 7,       // vision cone length on the maps, units
  miniMapSpan: 13,     // units shown across the short side of a mini-map
};

export const MAP_COLORS = {
  background: '#080b0e',
  floorA: '#151c23',
  floorB: '#1b242d',
  wall: '#56636f',
  obstacle: '#3c4955',
  obstacleEdge: '#66747f',
  label: '#e6edf2',
  dim: '#7d8c98',
};
