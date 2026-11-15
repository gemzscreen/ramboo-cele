// Stage 3 — Models and templates (ROADMAP §6).
//
// Models (js/models/*.js): each must have tests/models/<name>.check.js, which
// compares it against closed-form formulas over random inputs. A model with no
// check file fails the stage.
//
// Templates (content/templates/**/*.js): schema check, then RUNS random
// value sets (every allowed combination when the grid is small, else RUNS random) -> variables in range and on step, constraints respected, model
// values finite and positive, 4 distinct choices with exactly one correct and
// equal to the model value, deterministic for a seed; and the reference
// instance must reproduce its hand-solved answers.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { walk } from './util.js';

const RUNS = 1000;
const MAX_FALLBACK_SHARE = 0.10; // an item may lean on the generic fallback choice in at most 10% of instances
const SEED = 20261114;
const SUBJECTS = ['PSAD', 'MSTE', 'HGE'];
const STATUSES = ['draft', 'verified', 'live'];
const load = (root, rel) => import(pathToFileURL(path.join(root, rel)).href);

function schemaProblems(t, file) {
  const p = [];
  const need = (ok, msg) => { if (!ok) p.push(msg); };
  need(typeof t.id === 'string' && /^[A-Z]+(-[A-Z0-9]+)+-\d{3}$/.test(t.id), 'id missing or malformed');
  need(path.basename(file, '.js') === t.id, 'file name must equal the template id');
  need(SUBJECTS.includes(t.subject), `subject must be one of ${SUBJECTS.join('/')}`);
  need(file.split(path.sep).includes(String(t.subject).toLowerCase()), 'template is in the wrong subject folder');
  need(typeof t.topic === 'string' && t.topic, 'topic missing');
  need(typeof t.archetype === 'string' && t.archetype, 'archetype missing');
  need(['situation', 'single'].includes(t.format), 'format must be "situation" or "single"');
  need([1, 2, 3].includes(t.difficulty), 'difficulty must be 1-3');
  need(STATUSES.includes(t.status), `status must be one of ${STATUSES.join('/')}`);
  need(typeof t.stem === 'string' && t.stem.length > 40, 'stem missing');
  need(typeof t.model === 'function', 'model must be a function');
  need(typeof t.figure === 'function' || t.figure === null, 'figure must be a function or null');
  need(typeof t.solution === 'function', 'solution must be a function');
  need(Array.isArray(t.refs) && t.refs.length > 0, 'refs missing');
  need(t.vars && Object.keys(t.vars).length > 0, 'vars missing');
  for (const [name, s] of Object.entries(t.vars || {})) {
    need([s.min, s.max, s.step].every(Number.isFinite) && s.step > 0 && s.max >= s.min, `var ${name}: bad min/max/step`);
    need(typeof s.unit === 'string', `var ${name}: unit missing`);
  }
  need(Array.isArray(t.constraints) && t.constraints.every((c) => typeof c.rule === 'string' && typeof c.test === 'function'), 'constraints must be {rule, test} pairs');
  need(Array.isArray(t.items) && t.items.length === (t.format === 'situation' ? 3 : 1), 'a situation needs 3 items, a single needs 1');
  for (const item of t.items || []) {
    need(typeof item.ask === 'string' && typeof item.pick === 'string' && typeof item.unit === 'string' && Number.isInteger(item.sig), `item "${item.ask}": ask/pick/unit/sig`);
    need(Array.isArray(item.distractors) && item.distractors.length >= 3 && item.distractors.every((d) => typeof d.name === 'string' && typeof d.value === 'function'), `item "${item.ask}": needs >= 3 named distractors`);
  }
  const ref = t.reference_instance;
  need(ref && ref.vars && Array.isArray(ref.answers) && ref.answers.length === (t.items || []).length, 'reference_instance needs vars and one hand-solved answer per item');
  need(!/actual board|official prc/i.test(t.stem || ''), 'stem must not claim to be an actual board question');
  return p;
}

export async function run(root) {
  const failures = [];
  const notes = [];
  let checked = 0;
  const { createRng } = await load(root, 'js/engine/rng.js');
  const { formatSig, nearRoundingBoundary } = await load(root, 'js/engine/format.js');

  // ---- Formatter ----
  checked++;
  for (const [x, sig, want] of [[26.666, 3, '26.7'], [40, 3, '40.0'], [1234, 3, '1230'], [90.24999999999999, 3, '90.3'], [72.25, 3, '72.3'], [1.005, 3, '1.01'], [0.09995, 3, '0.100'], [999.5, 3, '1000'], [3, 3, '3.00'], [-13.33, 3, '\u221213.3'], [19.2533, 3, '19.3'], [125, 3, '125'], [0.026304, 5, '0.026304']]) {
    const got = formatSig(x, sig);
    if (got !== want) failures.push(`formatSig(${x}, ${sig}) = "${got}", expected "${want}"`);
  }
  if (!nearRoundingBoundary(72.25, 3) || nearRoundingBoundary(72.31, 3)) failures.push('nearRoundingBoundary misjudges 72.25 / 72.31');
  const { buildInstance, sampleVars, allVarSets, isUsable, CHOICES_PER_ITEM } = await load(root, 'js/engine/generator.js');

  // ---- Models ----
  for (const file of walk(root, 'js/models', /\.js$/)) {
    checked++;
    const checkFile = path.join('tests/models', `${path.basename(file, '.js')}.check.js`);
    if (!fs.existsSync(path.join(root, checkFile))) {
      failures.push(`${file}: no ${checkFile} — every model needs closed-form checks`);
      continue;
    }
    const { check } = await load(root, checkFile);
    for (const f of check(createRng(SEED), RUNS)) failures.push(`${file}: ${f}`);
  }

  // ---- Engine (tests/engine/*.check.js) ----
  for (const file of walk(root, 'tests/engine', /\.check\.js$/)) {
    checked++;
    try {
      const { check } = await load(root, file);
      for (const f of check(createRng(SEED), RUNS)) failures.push(`${file}: ${f}`);
    } catch (err) { failures.push(`${file}: crashed: ${err.stack || err}`); }
  }

  // ---- Templates ----
  const ids = new Set();
  for (const file of walk(root, 'content/templates', /\.js$/)) {
    checked++;
    const t = (await load(root, file)).default;
    const fail = (msg) => failures.push(`${file}: ${msg}`);
    if (!t) { fail('no default export'); continue; }
    const problems = schemaProblems(t, file);
    if (problems.length) { problems.forEach(fail); continue; }
    if (ids.has(t.id)) fail(`duplicate template id ${t.id}`);
    ids.add(t.id);

    const rng = createRng(SEED);
    const positions = new Array(CHOICES_PER_ITEM).fill(0);
    let reported = 0;
    // Every allowed combination of values when the grid is small enough;
    // otherwise RUNS random instances.
    const grid = allVarSets(t);
    const totalRuns = grid ? grid.length : RUNS;
    const fallbackUse = t.items.map(() => 0);
    for (let i = 0; i < totalRuns && reported < 5; i++) {
      let inst;
      try {
        inst = grid ? buildInstance(t, rng, grid[i]) : buildInstance(t, rng);
      } catch (err) { fail(`instance ${i}: ${err.message}`); reported++; continue; }
      const where = `instance ${i} ${JSON.stringify(inst.vars)}`;
      const bad = (msg) => { fail(`${where}: ${msg}`); reported++; };

      for (const [name, s] of Object.entries(t.vars)) {
        const v = inst.vars[name];
        const k = (v - s.min) / s.step;
        if (!(v >= s.min - 1e-9 && v <= s.max + 1e-9)) bad(`${name} out of range`);
        if (Math.abs(k - Math.round(k)) > 1e-6) bad(`${name} off its step`);
      }
      for (const c of t.constraints) if (!c.test(inst.vars)) bad(`constraint "${c.rule}" violated`);
      if (/\{\w+\}/.test(inst.stem)) bad('stem has an unfilled placeholder');
      if (!Array.isArray(inst.solution) || inst.solution.length === 0 || inst.solution.some((s) => /NaN|undefined|Infinity/.test(s))) bad('solution text is empty or contains NaN/undefined');

      inst.items.forEach((item, n) => {
        const src = t.items[n];
        const value = inst.result[src.pick];
        if (!Number.isFinite(value) || value <= 0) bad(`item ${n + 1}: answer ${value} is not a positive finite number`);
        if (nearRoundingBoundary(value, src.sig)) bad(`item ${n + 1}: answer ${value} sits on a rounding boundary`);
        if (item.choices.length !== CHOICES_PER_ITEM) bad(`item ${n + 1}: ${item.choices.length} choices`);
        if (new Set(item.choices.map((c) => c.text)).size !== item.choices.length) bad(`item ${n + 1}: choices are not distinct`);
        if (item.choices.filter((c) => c.correct).length !== 1) bad(`item ${n + 1}: needs exactly one correct choice`);
        const shown = Number(item.choices[item.answerIndex].text.replace('−', '-'));
        if (Math.abs(shown - value) > 0.006 * Math.abs(value)) bad(`item ${n + 1}: keyed choice ${shown} does not match model value ${value}`);
        positions[item.answerIndex]++;
        if (item.choices.some((c) => c.fallback)) fallbackUse[n]++;
        if (src.valid && item.choices.some((c) => !c.correct && !src.valid(c.value, inst.vars, inst.result))) bad(`item ${n + 1}: a choice fails the item's own validity rule`);
      });
    }

    fallbackUse.forEach((count, n) => {
      if (count > totalRuns * MAX_FALLBACK_SHARE) fail(`item ${n + 1}: generic fallback choice used in ${count} of ${totalRuns} instances (limit ${MAX_FALLBACK_SHARE * 100}%) — add more named mistakes`);
    });

    // Correct answers must not favour a letter.
    const total = positions.reduce((s, n) => s + n, 0);
    if (total && positions.some((n) => n < total * 0.2 || n > total * 0.3)) fail(`correct-answer positions are uneven: ${positions.join('/')}`);

    // Same seed, same instance.
    try {
      const plain = (k, v) => (typeof v === 'function' ? undefined : v);
      const once = JSON.stringify(buildInstance(t, createRng(7)), plain);
      const twice = JSON.stringify(buildInstance(t, createRng(7)), plain);
      if (once !== twice) fail('generation is not deterministic for a fixed seed');
    } catch (err) { fail(`determinism check: ${err.message}`); }

    // Reference instance vs hand-solved answers.
    const refVars = t.reference_instance.vars;
    if (!t.constraints.every((c) => c.test(refVars))) fail('reference instance violates the template constraints');
    else if (!isUsable(t, refVars)) fail('reference instance has an answer on a rounding boundary');
    try {
      const ref = buildInstance(t, createRng(1), refVars);
      ref.items.forEach((item, n) => {
        const want = t.reference_instance.answers[n];
        if (item.answerText !== want) fail(`reference instance item ${n + 1}: computed ${item.answerText}, hand-solved ${want}`);
      });
    } catch (err) { fail(`reference instance: ${err.message}`); }

    // The figure must draw for sampled values.
    if (t.figure) {
      try {
        const svg = t.figure(sampleVars(t, createRng(3)));
        if (typeof svg !== 'string' || !svg.startsWith('<svg') || /NaN|undefined/.test(svg)) fail('figure did not produce clean SVG');
      } catch (err) { fail(`figure: ${err.message}`); }
    }
    notes.push(`${t.id}: ${grid ? `all ${totalRuns} value sets` : `${totalRuns} random instances`}; fallback choice used in ${fallbackUse.map((c) => `${((100 * c) / totalRuns).toFixed(1)}%`).join(' / ')} per item; status ${t.status}`);
  }

  // The bank must list every template file, and nothing else.
  const { TEMPLATES } = await load(root, 'js/engine/bank.js');
  const banked = new Set(TEMPLATES.map((t) => t && t.id));
  for (const id of ids) if (!banked.has(id)) failures.push(`js/engine/bank.js: template ${id} exists but is not listed`);
  for (const id of banked) if (!ids.has(id)) failures.push(`js/engine/bank.js: lists ${id}, which has no valid template file`);
  if (banked.size !== TEMPLATES.length) failures.push('js/engine/bank.js: a template is listed twice');

  if (checked === 0) notes.push('no templates or models yet');
  return { checked, failures, notes };
}
