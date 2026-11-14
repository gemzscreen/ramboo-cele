// Stage 3 — Models and templates (ROADMAP §6).
//
// Per template: >=500 random instances -> answers finite and physically
// valid, all choices distinct, correct choice present, constraints respected,
// and the reference instance matches its hand-solved values. Live Figure
// models are checked against closed-form formulas.
//
// Those checks depend on template schema v1 (D5), which is not approved yet,
// and no solver or template exists. Until then this stage fails closed: it
// passes only while there is nothing to verify, so no template or model can
// be committed ahead of its checks.
import { walk } from './util.js';

export async function run(root) {
  const templates = walk(root, 'content/templates', /\.js$/);
  const models = walk(root, 'js/models', /\.js$/);
  const found = [...templates, ...models];

  if (found.length === 0) {
    return {
      checked: 0,
      failures: [],
      notes: ['no templates or models yet — per-template checks arrive with schema v1 (D5)'],
    };
  }
  return {
    checked: found.length,
    failures: found.map((f) => `${f}: no Stage 3 verification implemented for this file yet`),
  };
}
