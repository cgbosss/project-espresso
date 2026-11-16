// Level 01: graybox test room. Pure data, no code.
// Coordinates are in world units on the floor: x runs west to east, z runs north to south (north is -z).
// yaw is the facing direction in radians: 0 faces north, Math.PI faces south.
export default {
  name: 'Graybox square',
  half: 20,            // the room is a square from -half to +half on both axes
  cell: 2,             // checker cell size
  wallHeight: 4,
  teams: {
    north: { label: 'North team', color: '#63b7ff' },
    south: { label: 'South team', color: '#ffae52' },
  },
  // Axis-aligned boxes: centre x/z, width w (x), depth d (z), height h
  obstacles: [
    { x: 0,  z: 0,  w: 4,   d: 4,   h: 2.5, kind: 'vault' },   // stands in for the vault
    { x: -9, z: -8, w: 1.6, d: 1.6, h: 4 },
    { x: 9,  z: -8, w: 1.6, d: 1.6, h: 4 },
    { x: -9, z: 8,  w: 1.6, d: 1.6, h: 4 },
    { x: 9,  z: 8,  w: 1.6, d: 1.6, h: 4 },
  ],
  crew: [
    { call: 'N1', team: 'north', color: '#63b7ff', x: -1.5, z: -17, yaw: Math.PI },
    { call: 'N2', team: 'north', color: '#a5d8ff', x: 1.5,  z: -17, yaw: Math.PI },
    { call: 'S1', team: 'south', color: '#ffae52', x: -1.5, z: 17,  yaw: 0 },
    { call: 'S2', team: 'south', color: '#ffd69a', x: 1.5,  z: 17,  yaw: 0 },
  ],
  guards: [],          // patrol routes go here once guardAI exists
};
