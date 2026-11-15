// Side elevation of a vertical rectangular gate in a wall, water on the left.
// Exam figure: shows the givens only (no pressure diagram, no resultant).
import { formatFixed } from '../engine/format.js';

const m = (v) => formatFixed(v, 2);

export function figHydroGateVertical({ b, h, d }) {
  const W = 640;
  const surfaceY = 56;
  const scale = 190 / (d + h);          // the full water depth always fills 190 units
  const wallX = 380;
  const topY = surfaceY + d * scale;    // gate top edge (hinge)
  const botY = surfaceY + (d + h) * scale; // gate bottom edge = floor level
  const H = Math.ceil(botY + 44);
  const out = [];

  // Water body and free surface.
  out.push(`<rect class="fig-water" x="70" y="${surfaceY}" width="${wallX - 70}" height="${botY - surfaceY}"/>`);
  out.push(`<line class="fig-ink" x1="70" y1="${surfaceY}" x2="${wallX}" y2="${surfaceY}"/>`);
  out.push(`<polygon class="fig-member" points="150,${surfaceY - 14} 166,${surfaceY - 14} 158,${surfaceY - 2}"/>`);
  for (const [dy, half] of [[6, 10], [11, 6], [16, 2.5]]) {
    out.push(`<line class="fig-thin" x1="${158 - half}" y1="${surfaceY + dy}" x2="${158 + half}" y2="${surfaceY + dy}"/>`);
  }
  out.push(`<text class="fig-dim-text" x="178" y="${surfaceY - 8}">water surface</text>`);

  // Floor, and the wall above the opening.
  out.push(`<line class="fig-ink" x1="70" y1="${botY}" x2="${wallX + 150}" y2="${botY}"/>`);
  for (let x = 82; x <= wallX + 146; x += 14) out.push(`<line class="fig-thin" x1="${x}" y1="${botY}" x2="${x - 7}" y2="${botY + 8}"/>`);
  out.push(`<rect class="fig-wall" x="${wallX}" y="${surfaceY - 30}" width="22" height="${topY - surfaceY + 30}"/>`);

  // Gate, hinge on top, stop at the bottom on the dry side.
  out.push(`<rect class="fig-member" x="${wallX + 4}" y="${topY}" width="12" height="${botY - topY}"/>`);
  out.push(`<circle class="fig-member" cx="${wallX + 10}" cy="${topY}" r="6"/>`);
  out.push(`<rect class="fig-ink-fill" x="${wallX + 16}" y="${botY - 12}" width="16" height="12"/>`);
  out.push(`<text class="fig-text" x="${wallX + 34}" y="${topY + 5}">hinge</text>`);
  out.push(`<text class="fig-text" x="${wallX + 40}" y="${botY - 16}">stop</text>`);
  out.push(`<text class="fig-text" x="${wallX - 12}" y="${(topY + botY) / 2 + 5}" text-anchor="end">gate</text>`);

  // Vertical dimensions on the dry side.
  const dimX = wallX + 110;
  const tick = (y) => `<line class="fig-dim" x1="${dimX - 5}" y1="${y + 5}" x2="${dimX + 5}" y2="${y - 5}"/>`;
  out.push(`<line class="fig-dim" x1="${dimX}" y1="${surfaceY}" x2="${dimX}" y2="${botY}"/>`);
  out.push(`<line class="fig-guide" x1="${wallX + 22}" y1="${surfaceY}" x2="${dimX + 10}" y2="${surfaceY}"/>`);
  out.push(`<line class="fig-guide" x1="${wallX + 84}" y1="${topY}" x2="${dimX + 10}" y2="${topY}"/>`);
  out.push(tick(surfaceY) + tick(topY) + tick(botY));
  out.push(`<text class="fig-dim-text" x="${dimX + 12}" y="${(surfaceY + topY) / 2 + 5}">${m(d)} m</text>`);
  out.push(`<text class="fig-dim-text" x="${dimX + 12}" y="${(topY + botY) / 2 + 5}">${m(h)} m</text>`);

  out.push(`<text class="fig-dim-text" x="70" y="${botY + 32}">Gate width (into the page) = ${m(b)} m</text>`);

  const label = `Side view of a vertical rectangular gate ${m(h)} m high and ${m(b)} m wide in a wall, hinged along its top edge `
    + `and resting against a stop at its bottom edge. Water stands on one side with its surface ${m(d)} m above the top of the gate.`;
  return `<svg class="fig" viewBox="0 0 ${W} ${H}" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg">${out.join('')}</svg>`;
}
