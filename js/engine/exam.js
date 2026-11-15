// Exam engine: assembles a set from the bank and grades it. Pure functions —
// no DOM, no clock, no storage — so the harness can test them directly.
import { buildInstance } from './generator.js';
import { createRng } from './rng.js';

// Board pacing carried from the legacy app (ROADMAP Phase 1).
export const PACING = {
  PSAD: { items: 75, minutes: 360 },
  MSTE: { items: 75, minutes: 300 },
  HGE: { items: 50, minutes: 240 },
};
export const SUBJECTS = Object.keys(PACING);
export const secondsPerItem = (subject) => (PACING[subject].minutes * 60) / PACING[subject].items;

// PSAD and HGE draw whole situations (3 items each); MSTE draws single items.
export const UNIT_FORMAT = { PSAD: 'situation', HGE: 'situation', MSTE: 'single' };
export const DRILLS = {
  quick: { label: 'Quick drill', units: { PSAD: 1, HGE: 1, MSTE: 5 } },
  full: { label: 'Full set', units: { PSAD: 3, HGE: 3, MSTE: 10 } },
};

export function poolFor(subject, templates) {
  return templates.filter((t) => t.subject === subject && t.format === UNIT_FORMAT[subject]);
}

const seedFrom = (rng) => Math.floor(rng() * 4294967296) >>> 0;

function shuffled(list, rng) {
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// One unit (a situation or a single item) is fully determined by its template
// and seed, so a stored { templateId, seed } is enough to show it again.
export function buildUnit(template, seed) {
  return { templateId: template.id, topic: template.topic, seed, instance: buildInstance(template, createRng(seed)) };
}

// A set is determined by (subject, drill, seed, bank).
export function assembleSet({ subject, drill, seed, templates }) {
  if (!PACING[subject]) throw new Error(`unknown subject "${subject}"`);
  if (!DRILLS[drill]) throw new Error(`unknown drill "${drill}"`);
  const pool = poolFor(subject, templates);
  if (pool.length === 0) throw new Error(`no ${subject} templates in the bank yet`);

  const rng = createRng(seed);
  const wanted = DRILLS[drill].units[subject];
  const units = [];
  let order = [];
  while (units.length < wanted) {
    // Go through every template once before any repeats; when the bank is
    // smaller than the set, a template comes back with different values.
    if (order.length === 0) order = shuffled(pool, rng);
    const template = order.shift();
    let unit;
    for (let attempt = 0; attempt < 50; attempt++) {
      unit = buildUnit(template, seedFrom(rng));
      const vars = JSON.stringify(unit.instance.vars);
      if (!units.some((u) => u.templateId === template.id && JSON.stringify(u.instance.vars) === vars)) break;
    }
    units.push(unit);
  }

  const questions = [];
  units.forEach((unit, u) => unit.instance.items.forEach((_, i) => questions.push({ unit: u, item: i })));

  return {
    subject, drill, seed, units, questions,
    timeLimitSec: Math.round(questions.length * secondsPerItem(subject)),
    distinctTemplates: new Set(units.map((u) => u.templateId)).size,
  };
}

// `answers[q]` is the chosen choice index for question q, or null if unanswered.
export function gradeSet(set, answers) {
  const byTopic = {};
  const perItem = set.questions.map(({ unit, item }, q) => {
    const u = set.units[unit];
    const it = u.instance.items[item];
    const chosen = answers[q] ?? null;
    const isCorrect = chosen === it.answerIndex;
    const topic = (byTopic[u.topic] ||= { correct: 0, total: 0 });
    topic.total++;
    if (isCorrect) topic.correct++;
    return {
      unit, item, chosen, isCorrect,
      answerIndex: it.answerIndex,
      templateId: u.templateId,
      seed: u.seed,
      mistake: chosen === null || isCorrect ? null : it.choices[chosen].mistake,
    };
  });
  const correct = perItem.filter((p) => p.isCorrect).length;
  return { total: perItem.length, correct, answered: perItem.filter((p) => p.chosen !== null).length, perItem, byTopic };
}
