// Template engine: turns a template (content/templates/**) into a concrete
// problem instance. Deterministic for a given rng.
import { formatSig, nearRoundingBoundary } from './format.js';

export const CHOICES_PER_ITEM = 4;
// Two choices closer than this (relative) are treated as the same number, so
// a rounding slip can never land on a wrong choice.
export const MIN_CHOICE_GAP = 0.02;
const MAX_SAMPLE_TRIES = 2000;
// Used only when an item's named mistakes cannot supply three well-separated
// wrong choices for a particular set of values. Stage 3 limits how often.
const FALLBACK_FACTORS = [0.8, 1.25, 0.6, 1.5, 0.9, 1.1];
export const FALLBACK_MISTAKE = 'arithmeticSlip';

// A value set is usable when it meets the template's constraints and none of
// its keyed answers sits on a rounding boundary (where the last digit shown
// would depend on how the solver rounded along the way).
export function isUsable(template, vars) {
  if (!template.constraints.every((c) => c.test(vars))) return false;
  const result = template.model(vars);
  return template.items.every((item) => !nearRoundingBoundary(result[item.pick], item.sig));
}

// Every usable combination of variable values, or null when there are more
// than `limit` grid points (the harness then falls back to random sampling).
export function allVarSets(template, limit = 300000) {
  const names = Object.keys(template.vars);
  const axes = names.map((n) => {
    const s = template.vars[n];
    const steps = Math.round((s.max - s.min) / s.step);
    return Array.from({ length: steps + 1 }, (_, k) => Number((s.min + k * s.step).toFixed(6)));
  });
  if (axes.reduce((n, axis) => n * axis.length, 1) > limit) return null;
  let sets = [{}];
  axes.forEach((axis, i) => { sets = sets.flatMap((set) => axis.map((value) => ({ ...set, [names[i]]: value }))); });
  return sets.filter((vars) => isUsable(template, vars));
}

export function sampleVars(template, rng) {
  for (let attempt = 0; attempt < MAX_SAMPLE_TRIES; attempt++) {
    const vars = {};
    for (const [name, spec] of Object.entries(template.vars)) {
      const steps = Math.round((spec.max - spec.min) / spec.step);
      const k = Math.floor(rng() * (steps + 1));
      vars[name] = Number((spec.min + k * spec.step).toFixed(6));
    }
    if (isUsable(template, vars)) return vars;
  }
  throw new Error(`${template.id}: no usable variable set in ${MAX_SAMPLE_TRIES} tries`);
}

export function fillStem(stem, vars) {
  return stem.replace(/\{(\w+)\}/g, (match, name) => {
    if (!(name in vars)) throw new Error(`stem uses unknown variable {${name}}`);
    return String(vars[name]);
  });
}

function tooClose(x, y) {
  return Math.abs(x - y) <= MIN_CHOICE_GAP * Math.max(Math.abs(x), Math.abs(y));
}

function shuffle(list, rng) {
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function buildItem(template, item, vars, result, rng) {
  const correct = result[item.pick];
  if (!Number.isFinite(correct)) throw new Error(`${template.id}: model value "${item.pick}" is not a finite number`);

  const picked = [{ value: correct, text: formatSig(correct, item.sig), correct: true }];
  const tryAdd = (value, mistake, fallback) => {
    if (!Number.isFinite(value) || value <= 0) return;
    if (item.valid && !item.valid(value, vars, result)) return; // e.g. a distance beyond the span
    const text = formatSig(value, item.sig);
    if (picked.some((p) => p.text === text || tooClose(p.value, value))) return;
    picked.push({ value, text, correct: false, mistake, ...(fallback ? { fallback: true } : {}) });
  };
  // Distractors are named common mistakes, taken in the listed order; one is
  // skipped when it lands on (or too near) a choice already chosen.
  for (const d of item.distractors) {
    if (picked.length === CHOICES_PER_ITEM) break;
    tryAdd(d.value(vars, result), d.name, false);
  }
  for (const factor of FALLBACK_FACTORS) {
    if (picked.length === CHOICES_PER_ITEM) break;
    tryAdd(correct * factor, FALLBACK_MISTAKE, true);
  }
  if (picked.length < CHOICES_PER_ITEM) {
    throw new Error(`${template.id}: "${item.ask}" has only ${picked.length} distinct choices for ${JSON.stringify(vars)}`);
  }

  const choices = shuffle(picked, rng);
  return {
    ask: item.ask,
    unit: item.unit,
    choices,
    answerIndex: choices.findIndex((c) => c.correct),
    answerText: picked[0].text,
  };
}

// Pass `vars` to build a specific instance (e.g. the reference instance);
// omit it to sample one.
export function buildInstance(template, rng, vars = sampleVars(template, rng)) {
  const result = template.model(vars);
  return {
    templateId: template.id,
    vars,
    result,
    stem: fillStem(template.stem, vars),
    items: template.items.map((item) => buildItem(template, item, vars, result, rng)),
    solution: template.solution(vars, result),
  };
}
