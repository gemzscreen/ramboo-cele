// Template engine: turns a template (content/templates/**) into a concrete
// problem instance. Deterministic for a given rng.
import { formatSig } from './format.js';

export const CHOICES_PER_ITEM = 4;
// Two choices closer than this (relative) are treated as the same number, so
// a rounding slip can never land on a wrong choice.
export const MIN_CHOICE_GAP = 0.02;
const MAX_SAMPLE_TRIES = 2000;

export function sampleVars(template, rng) {
  for (let attempt = 0; attempt < MAX_SAMPLE_TRIES; attempt++) {
    const vars = {};
    for (const [name, spec] of Object.entries(template.vars)) {
      const steps = Math.round((spec.max - spec.min) / spec.step);
      const k = Math.floor(rng() * (steps + 1));
      vars[name] = Number((spec.min + k * spec.step).toFixed(6));
    }
    if (template.constraints.every((c) => c.test(vars))) return vars;
  }
  throw new Error(`${template.id}: no variable set satisfied the constraints in ${MAX_SAMPLE_TRIES} tries`);
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
  // Distractors are named common mistakes, taken in the listed order; one is
  // skipped when it lands on (or too near) a choice already chosen.
  for (const d of item.distractors) {
    if (picked.length === CHOICES_PER_ITEM) break;
    const value = d.value(vars, result);
    if (!Number.isFinite(value) || value <= 0) continue;
    const text = formatSig(value, item.sig);
    if (picked.some((p) => p.text === text || tooClose(p.value, value))) continue;
    picked.push({ value, text, correct: false, mistake: d.name });
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
