# project-espresso

A browser heist game prototype. You run a crew of four: you play one member in first person through their bodycam while the other three show as dots on the mini-maps, and you can switch bodycam at any time. Nothing pauses.

This is an early graybox: one square room, capsule characters, no guards or orders yet.

## Run it

```bash
npm install
npm run dev      # local dev server with live reload
npm run build    # production build into dist/
npm run preview  # serve the production build locally
```

Vercel detects Vite automatically, so importing this repo there needs no configuration.

## Controls

| Action | Keyboard and mouse | Touch |
| --- | --- | --- |
| Move | W A S D | Drag the left side of the bodycam |
| Look | Drag on the bodycam, or left/right arrows | Drag the right side of the bodycam |
| Switch bodycam | 1 to 4, or click a mini-map | Tap a mini-map |
| Overview map | M (Esc closes it) | Overview button |

## How the code is organised

Everything goes through one shared state. Levels are loaded into it, systems change it, and the render files only read it.

```
index.html             page markup
src/
  main.js              boot and game loop
  config.js            tuning values (speeds, field of view, map colours)
  state.js             the shared game state
  styles.css
  levels/
    level01.js         level data only: room, obstacles, crew start points
    loader.js          copies a level into the state
  systems/             game rules
    input.js           keyboard, mouse, touch
    movement.js        player movement and collision
    pathfinding.js     placeholder
    crewAI.js          placeholder: squad orders and tasks
    guardAI.js         placeholder: patrols and detection
    objectives.js      placeholder: loot, alarm, win and lose
  render/              drawing only
    scene3d.js         the 3D world and crew models
    cameras.js         one bodycam per crew member
    minimap.js         2D map painter for the mini-maps and overview
    hud.js             crew map rail, bodycam labels, overview
public/assets/         models, textures and sound go here later
```

To add a level, copy `src/levels/level01.js`, change the data, and load it in `src/main.js`.
