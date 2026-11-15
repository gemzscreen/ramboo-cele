// Stage 3 — Models and templates (ROADMAP §6).
//
// Models (js/models/*.js): each must have tests/models/<name>.check.js, which
// compares it against closed-form formulas over random inputs. A model with no
// check file fails the stage.
//
// Taxonomy (content/taxonomy.json): structure, unique ids that follow the
// subject.topic.subtopic pattern, weights summing to 100.
//
// Frequency table (content/frequency.json): counts only, every taxonomy topic
// listed once per subject, totals and per-sitting numbers add up, ranks follow
// the ordering, and no text fields (the file is public; see ROADMAP §3).
//
// Templates (content/templates/**/*.js): schema check (including topic_id and
// subtopic_id that exist in the taxonomy, under the template's own subject, and
// a `topic` label equal to the taxonomy's topic name), then RUNS random
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

function schemaProblems(t, file, tax) {
  const p = [];
  const need = (ok, msg) => { if (!ok) p.push(msg); };
  need(typeof t.id === 'string' && /^[A-Z]+(-[A-Z0-9]+)+-\d{3}$/.test(t.id), 'id missing or malformed');
  need(path.basename(file, '.js') === t.id, 'file name must equal the template id');
  need(SUBJECTS.includes(t.subject), `subject must be one of ${SUBJECTS.join('/')}`);
  need(file.split(path.sep).includes(String(t.subject).toLowerCase()), 'template is in the wrong subject folder');
  need(typeof t.topic === 'string' && t.topic, 'topic missing');
  const topic = tax.topics.get(t.topic_id);
  const sub = tax.subtopics.get(t.subtopic_id);
  need(topic, `topic_id "${t.topic_id}" is not in content/taxonomy.json`);
  need(sub, `subtopic_id "${t.subtopic_id}" is not in content/taxonomy.json`);
  if (topic) {
    need(topic.subject === t.subject, `topic_id belongs to ${topic.subject}, not ${t.subject}`);
    need(t.topic === topic.name, `topic "${t.topic}" must equal the taxonomy name "${topic.name}"`);
  }
  if (topic && sub) need(sub.topicId === t.topic_id, `subtopic_id is not under ${t.topic_id}`);
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

// Reads content/taxonomy.json; returns lookup maps and the structural problems.
function loadTaxonomy(root) {
  const problems = [];
  const topics = new Map(); // topic id -> { name, subject }
  const subtopics = new Map(); // subtopic id -> { name, topicId }
  let doc;
  try {
    doc = JSON.parse(fs.readFileSync(path.join(root, 'content/taxonomy.json'), 'utf8'));
  } catch (err) {
    return { topics, subtopics, problems: [`content/taxonomy.json: ${err.message}`] };
  }
  const bad = (msg) => problems.push(`content/taxonomy.json: ${msg}`);
  const slug = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  const seen = new Set();
  const node = (n, id, where, origins) => {
    if (typeof n.name !== 'string' || !n.name.trim()) bad(`${where}: name missing`);
    if (!origins.includes(n.origin)) bad(`${where}: origin must be ${origins.join(' or ')}`);
    if (seen.has(id)) bad(`${where}: duplicate id`);
    seen.add(id);
  };
  if (!Array.isArray(doc.subjects)) { bad('subjects must be an array'); return { topics, subtopics, problems }; }
  if (JSON.stringify(doc.subjects.map((s) => s.id)) !== JSON.stringify(SUBJECTS)) bad(`subjects must be ${SUBJECTS.join(', ')} in that order`);
  if (doc.subjects.reduce((sum, s) => sum + s.weight_percent, 0) !== 100) bad('subject weights must add up to 100');
  for (const s of doc.subjects) {
    node(s, s.id, `subject ${s.id}`, ['prc']);
    if (!Array.isArray(s.topics) || s.topics.length === 0) { bad(`subject ${s.id}: no topics`); continue; }
    const topicNames = new Set();
    for (const t of s.topics) {
      node(t, t.id, `topic ${t.id}`, ['prc']);
      const [subj, tslug, ...rest] = String(t.id).split('.');
      if (subj !== s.id.toLowerCase() || !slug.test(tslug || '') || rest.length) bad(`topic ${t.id}: id must be "${s.id.toLowerCase()}.<slug>"`);
      if (topicNames.has(t.name)) bad(`topic ${t.id}: name repeated within ${s.id}`);
      topicNames.add(t.name);
      topics.set(t.id, { name: t.name, subject: s.id });
      if (!Array.isArray(t.subtopics) || t.subtopics.length === 0) { bad(`topic ${t.id}: no subtopics`); continue; }
      const subNames = new Set();
      for (const u of t.subtopics) {
        node(u, u.id, `subtopic ${u.id}`, ['prc', 'ramboo', 'draft']);
        const [, , uslug, ...more] = String(u.id).split('.');
        if (!String(u.id).startsWith(`${t.id}.`) || !slug.test(uslug || '') || more.length) bad(`subtopic ${u.id}: id must be "${t.id}.<slug>"`);
        if (subNames.has(u.name)) bad(`subtopic ${u.id}: name repeated within ${t.id}`);
        subNames.add(u.name);
        subtopics.set(u.id, { name: u.name, topicId: t.id });
      }
    }
  }
  return { topics, subtopics, problems, revision: doc.taxonomy_revision };
}

// Reads content/frequency.json (D4) and checks it against the taxonomy.
// Returns { problems, notes }. The file is optional until D4 closes, but if
// present it must be consistent.
function frequencyCheck(root, tax) {
  const problems = [];
  const notes = [];
  const file = path.join(root, 'content/frequency.json');
  if (!fs.existsSync(file)) return { problems, notes: ['content/frequency.json not present yet'] };
  const bad = (msg) => problems.push(`content/frequency.json: ${msg}`);
  let doc;
  try { doc = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (err) { bad(err.message); return { problems, notes }; }
  const SITTING = /^\d{4}-(0[1-9]|1[0-2])$/;
  const TOPIC_KEYS = ['id', 'rank', 'items', 'sets', 'definition_items', 'sittings_seen', 'board_frequency', 'mean_share_percent', 'by_sitting'];
  const UNMAPPED_KEYS = ['label', 'items', 'sets', 'by_sitting'];
  const sameKeys = (o, keys, where) => {
    const extra = Object.keys(o).filter((k) => !keys.includes(k));
    const missing = keys.filter((k) => !(k in o));
    if (extra.length || missing.length) bad(`${where}: keys must be exactly ${keys.join(', ')} (extra: ${extra.join(', ') || 'none'}; missing: ${missing.join(', ') || 'none'})`);
    return !extra.length && !missing.length;
  };
  const isCount = (n) => Number.isInteger(n) && n >= 0;
  if (!isCount(doc.frequency_revision)) bad('frequency_revision must be a whole number');
  if (!Array.isArray(doc.sittings) || doc.sittings.length === 0) { bad('sittings must be a non-empty array'); return { problems, notes }; }
  const sittingIds = doc.sittings.map((s) => s.id);
  if (sittingIds.some((id) => !SITTING.test(id)) || new Set(sittingIds).size !== sittingIds.length) bad('sittings: ids must be unique YYYY-MM');
  if (JSON.stringify([...sittingIds].sort()) !== JSON.stringify(sittingIds)) bad('sittings must be in date order');
  const sumBy = (by) => Object.values(by).reduce((a, b) => a + b, 0);
  const byOk = (by, where) => {
    if (!by || JSON.stringify(Object.keys(by)) !== JSON.stringify(sittingIds) || !Object.values(by).every(isCount)) { bad(`${where}: by_sitting must hold a count for every sitting, in order`); return false; }
    return true;
  };
  if (!doc.subjects || JSON.stringify(Object.keys(doc.subjects)) !== JSON.stringify(SUBJECTS)) { bad(`subjects must be ${SUBJECTS.join(', ')} in that order`); return { problems, notes }; }
  if (!doc.board_items_per_sitting || !SUBJECTS.every((s) => isCount(doc.board_items_per_sitting[s]))) bad('board_items_per_sitting needs a count for each subject');
  if (doc.taxonomy_revision !== tax.revision) notes.push(`frequency.json was counted against taxonomy revision ${doc.taxonomy_revision}; taxonomy is now ${tax.revision}`);
  for (const subj of SUBJECTS) {
    const s = doc.subjects[subj];
    const where = `subject ${subj}`;
    const wanted = [...tax.topics].filter(([, t]) => t.subject === subj).map(([id]) => id);
    if (!Array.isArray(s.topics)) { bad(`${where}: topics must be an array`); continue; }
    const listed = s.topics.map((t) => t.id);
    for (const id of wanted) if (listed.filter((x) => x === id).length !== 1) bad(`${where}: topic ${id} must appear exactly once`);
    for (const id of listed) if (!wanted.includes(id)) bad(`${where}: topic ${id} is not a ${subj} topic in the taxonomy`);
    let topicItems = 0;
    let prev = null;
    const perSittingFromTopics = Object.fromEntries(sittingIds.map((id) => [id, 0]));
    for (const t of s.topics) {
      const tw = `${where}, ${t.id}`;
      if (!sameKeys(t, TOPIC_KEYS, tw)) continue;
      if (![t.rank, t.items, t.sets, t.definition_items, t.sittings_seen].every(isCount) || t.rank < 1) bad(`${tw}: rank, items, sets, definition_items and sittings_seen must be whole numbers (rank from 1)`);
      if (typeof t.mean_share_percent !== 'number' || t.mean_share_percent < 0 || t.mean_share_percent > 100) bad(`${tw}: mean_share_percent must be 0 to 100`);
      if (!byOk(t.by_sitting, tw)) continue;
      if (sumBy(t.by_sitting) !== t.items) bad(`${tw}: by_sitting adds up to ${sumBy(t.by_sitting)}, items says ${t.items}`);
      if (Object.values(t.by_sitting).filter((n) => n > 0).length !== t.sittings_seen) bad(`${tw}: sittings_seen does not match by_sitting`);
      if (t.board_frequency !== `${t.sittings_seen}/${sittingIds.length} sittings`) bad(`${tw}: board_frequency must read "${t.sittings_seen}/${sittingIds.length} sittings"`);
      if (t.sets > t.items || (t.items > 0 && t.sets === 0) || t.definition_items > t.items) bad(`${tw}: sets, items and definition_items disagree`);
      if (prev && (t.mean_share_percent > prev.mean_share_percent)) bad(`${tw}: topics must be listed from most to least frequent`);
      if (prev && t.rank < prev.rank) bad(`${tw}: rank goes backwards`);
      if (t.items === 0 && t.rank !== s.topics.filter((x) => x.items > 0).length + 1) bad(`${tw}: topics with no items share the last rank`);
      prev = t;
      topicItems += t.items;
      for (const id of sittingIds) perSittingFromTopics[id] += t.by_sitting[id];
    }
    let unmappedItems = 0;
    for (const u of s.unmapped || []) {
      if (!sameKeys(u, UNMAPPED_KEYS, `${where}, unmapped`)) continue;
      if (typeof u.label !== 'string' || u.label.length > 200) bad(`${where}, unmapped: label must be a short string`);
      if (!byOk(u.by_sitting, `${where}, unmapped`)) continue;
      if (sumBy(u.by_sitting) !== u.items) bad(`${where}, unmapped "${u.label}": by_sitting does not add up to items`);
      unmappedItems += u.items;
      for (const id of sittingIds) perSittingFromTopics[id] += u.by_sitting[id];
    }
    const tr = s.transcribed || {};
    if (tr.items !== topicItems + unmappedItems) bad(`${where}: transcribed.items is ${tr.items} but topics (${topicItems}) plus unmapped (${unmappedItems}) add up differently`);
    if (tr.mapped_items !== topicItems || tr.unmapped_items !== unmappedItems) bad(`${where}: mapped_items and unmapped_items do not match the lists`);
    for (const id of sittingIds) {
      const p = (s.per_sitting || {})[id];
      if (!p || p.items !== perSittingFromTopics[id]) bad(`${where}: per_sitting ${id} items do not match the topic counts`);
      else if (p.items > doc.board_items_per_sitting[subj]) bad(`${where}: per_sitting ${id} has more items than a board sitting`);
    }
    notes.push(`frequency ${subj}: ${tr.items} items in ${sittingIds.length} sittings, ${s.topics.filter((t) => t.items > 0).length}/${wanted.length} topics seen, ${unmappedItems} unmapped`);
  }
  return { problems, notes };
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

  // ---- Taxonomy ----
  checked++;
  const tax = loadTaxonomy(root);
  failures.push(...tax.problems);
  const freq = frequencyCheck(root, tax);
  failures.push(...freq.problems);
  notes.push(...freq.notes);
  checked++;

  // ---- Templates ----
  const ids = new Set();
  for (const file of walk(root, 'content/templates', /\.js$/)) {
    checked++;
    const t = (await load(root, file)).default;
    const fail = (msg) => failures.push(`${file}: ${msg}`);
    if (!t) { fail('no default export'); continue; }
    const problems = schemaProblems(t, file, tax);
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

  const tagged = new Set();
  for (const file of walk(root, 'content/templates', /\.js$/)) {
    const t = (await load(root, file)).default;
    if (t && tax.subtopics.has(t.subtopic_id)) tagged.add(t.subtopic_id);
  }
  notes.push(`taxonomy: ${tax.topics.size} topics, ${tax.subtopics.size} subtopics; ${tagged.size} subtopics have a template`);

  if (checked === 0) notes.push('no templates or models yet');
  return { checked, failures, notes };
}
