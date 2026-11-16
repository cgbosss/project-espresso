import { CONFIG } from '../config.js';
import { fitCanvas, paintMap } from './minimap.js';

// Everything on screen that is not the 3D view: the rail of crew maps, the bodycam labels and the overview.
const $ = (id) => document.getElementById(id);
let cards = [];
let overviewFrame = null;   // last drawn size and scale of the overview, for hit-testing clicks
let appState = null;

export function initHud(state, { onSelect }) {
  appState = state;
  const view = $('view'), rail = $('rail');

  rail.textContent = '';
  cards = state.crew.map((m, i) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'cam-card';
    card.style.setProperty('--team', m.color);
    const head = document.createElement('span'); head.className = 'cam-head';
    const key = document.createElement('span'); key.className = 'key'; key.textContent = String(i + 1);
    const call = document.createElement('span'); call.className = 'call'; call.textContent = m.call;
    const team = document.createElement('span'); team.className = 'team'; team.textContent = m.teamLabel;
    const status = document.createElement('span'); status.className = 'state';
    head.append(key, call, team, status);
    const canvas = document.createElement('canvas');
    card.append(head, canvas);
    card.addEventListener('click', () => { onSelect(i); view.focus(); });
    rail.appendChild(card);
    return { el: card, canvas, status };
  });

  $('ovrOpen').addEventListener('click', () => toggleOverview(true));
  $('ovrClose').addEventListener('click', () => toggleOverview(false));
  $('ovrCanvas').addEventListener('click', (e) => {
    if (!overviewFrame) return;
    const r = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - r.left, my = e.clientY - r.top;
    let best = -1, bestDist = 26;
    state.crew.forEach((m, i) => {
      const d = Math.hypot(overviewFrame.w / 2 + m.x * overviewFrame.scale - mx, overviewFrame.h / 2 + m.z * overviewFrame.scale - my);
      if (d < bestDist) { bestDist = d; best = i; }
    });
    if (best >= 0) onSelect(best);
  });
}

// Call whenever the controlled crew member changes.
export function showActive(state) {
  cards.forEach((c, i) => {
    const on = i === state.active;
    c.el.classList.toggle('active', on);
    c.el.setAttribute('aria-pressed', on ? 'true' : 'false');
    c.status.textContent = on ? 'LIVE · YOU' : 'HOLDING';
  });
  const m = state.crew[state.active];
  const name = $('camName');
  name.textContent = `CAM ${state.active + 1} · ${m.call}`;
  name.style.color = m.color;
  $('camTeam').textContent = m.teamLabel;
  const fx = $('static');   // brief signal cut when the feed switches
  fx.classList.remove('on'); void fx.offsetWidth; fx.classList.add('on');
}

// The overview covers the whole screen and the game keeps running underneath.
export function toggleOverview(force) {
  const el = $('overview');
  const open = force === undefined ? el.hidden : force;
  el.hidden = !open;
  if (appState) appState.overviewOpen = open;
  if (!open) $('view').focus();
}

// Redraws the maps and the clock. Call once per frame.
export function updateHud(state) {
  cards.forEach((c, i) => {
    const { g, w, h } = fitCanvas(c.canvas);
    if (!w || !h) return;
    const scale = Math.min(w, h) / CONFIG.miniMapSpan;
    paintMap(g, w, h, state.crew[i].x, state.crew[i].z, scale, i, state);
  });

  if (state.overviewOpen) {
    const { g, w, h } = fitCanvas($('ovrCanvas'));
    if (w && h) {
      const scale = Math.min(w, h) / (state.level.half * 2 + 4);
      overviewFrame = { w, h, scale };
      paintMap(g, w, h, 0, 0, scale, state.active, state);
    }
  }

  const s = Math.floor(state.time);
  $('clock').textContent = `T+${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export function showWebglError() {
  const el = document.createElement('div');
  el.className = 'fail';
  el.textContent = 'This browser could not start WebGL, so the bodycam cannot be drawn. The maps still work.';
  $('view').appendChild(el);
}
