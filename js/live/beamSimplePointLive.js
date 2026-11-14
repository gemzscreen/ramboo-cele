// Live Figure: simply supported beam with a movable point load.
// Drag the load or use the sliders; reactions and the V and M diagrams redraw
// from the same solver the exam items use.
import { beamSimplePoint } from '../models/beamSimplePoint.js';
import { figBeamSimplePoint, GEOMETRY } from '../figures/beamSimplePoint.js';
import { formatSig, formatFixed } from '../engine/format.js';

const EDGE = 0.5;      // m, closest the load may sit to a support
const A_STEP = 0.1;    // m
const P_MIN = 5;
const P_MAX = 80;      // kN; also the fixed scale reference for the diagrams

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

export function mountBeamLive(root, initial = { L: 6, P: 40, a: 2 }) {
  const state = { ...initial };

  root.innerHTML = `
    <div class="live-figure paper" data-role="figure"></div>
    <div class="live-controls">
      <div class="control">
        <label for="live-beam-a">Load position</label>
        <input id="live-beam-a" type="range" min="${EDGE}" max="${state.L - EDGE}" step="${A_STEP}">
        <output for="live-beam-a" data-role="a-out"></output>
      </div>
      <div class="control">
        <label for="live-beam-p">Load P</label>
        <input id="live-beam-p" type="range" min="${P_MIN}" max="${P_MAX}" step="1">
        <output for="live-beam-p" data-role="p-out"></output>
      </div>
    </div>
    <dl class="stat-row">
      <div class="stat"><dt>Reaction at A</dt><dd data-role="ra"></dd></div>
      <div class="stat"><dt>Reaction at B</dt><dd data-role="rb"></dd></div>
      <div class="stat stat-shear"><dt>Max shear</dt><dd data-role="vmax"></dd></div>
      <div class="stat stat-moment"><dt>Max moment</dt><dd data-role="mmax"></dd></div>
    </dl>
    <div class="live-actions">
      <button type="button" class="btn" data-role="reset">Reset to starting values</button>
    </div>`;

  const el = (role) => root.querySelector(`[data-role="${role}"]`);
  const figure = el('figure');
  const sliderA = root.querySelector('#live-beam-a');
  const sliderP = root.querySelector('#live-beam-p');

  function render() {
    const r = beamSimplePoint(state);
    figure.innerHTML = figBeamSimplePoint(state, {
      reactions: true, diagrams: true, handle: true, scale: { Pref: P_MAX },
    });
    sliderA.value = String(state.a);
    sliderP.value = String(state.P);
    el('a-out').textContent = `${formatFixed(state.a, 2)} m`;
    el('p-out').textContent = `${state.P} kN`;
    el('ra').textContent = `${formatSig(r.RA, 3)} kN`;
    el('rb').textContent = `${formatSig(r.RB, 3)} kN`;
    el('vmax').textContent = `${formatSig(r.Vmax, 3)} kN`;
    el('mmax').textContent = `${formatSig(r.Mmax, 3)} kN·m`;
  }

  function setA(a) {
    state.a = clamp(Math.round(a / A_STEP) * A_STEP, EDGE, state.L - EDGE);
    state.a = Number(state.a.toFixed(2));
    render();
  }

  sliderA.addEventListener('input', () => setA(Number(sliderA.value)));
  sliderP.addEventListener('input', () => { state.P = clamp(Number(sliderP.value), P_MIN, P_MAX); render(); });
  el('reset').addEventListener('click', () => { Object.assign(state, initial); render(); });

  // Dragging: the figure container owns the gesture (the SVG inside is redrawn
  // on every move), and only a press on the load starts it.
  const toSvgX = (clientX) => {
    const rect = figure.querySelector('svg').getBoundingClientRect();
    return ((clientX - rect.left) / rect.width) * GEOMETRY.width;
  };
  const aFromSvgX = (x) => ((x - GEOMETRY.x0) / (GEOMETRY.x1 - GEOMETRY.x0)) * state.L;
  let dragging = false;

  figure.addEventListener('pointerdown', (e) => {
    if (!e.target.closest || !e.target.closest('[data-drag="load"]')) return;
    dragging = true;
    figure.classList.add('is-dragging');
    if (figure.setPointerCapture) figure.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  figure.addEventListener('pointermove', (e) => { if (dragging) setA(aFromSvgX(toSvgX(e.clientX))); });
  const endDrag = () => { dragging = false; figure.classList.remove('is-dragging'); };
  figure.addEventListener('pointerup', endDrag);
  figure.addEventListener('pointercancel', endDrag);

  render();
  return { getState: () => ({ ...state }), setLoadPosition: setA };
}
