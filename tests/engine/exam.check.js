// Stage 3 checks for the exam engine: set assembly, grading, timer, storage.
import { assembleSet, gradeSet, poolFor, mistakeTemplates, outstandingMistakes, unitKey, secondsPerItem, PACING, DRILLS, SUBJECTS, UNIT_FORMAT } from '../../js/engine/exam.js';
import { createTimer, formatClock } from '../../js/engine/timer.js';
import { createStore } from '../../js/engine/storage.js';
import { TEMPLATES } from '../../js/engine/bank.js';

export function check(rng, runs) {
  const failures = [];
  const fail = (msg) => { if (failures.length < 15) failures.push(msg); };

  // ---- Pacing: the board figures from ROADMAP Phase 1 ----
  const pace = Object.fromEntries(SUBJECTS.map((s) => [s, secondsPerItem(s)]));
  if (pace.PSAD !== 288 || pace.MSTE !== 240 || pace.HGE !== 288) fail(`pacing is ${JSON.stringify(pace)}, expected 288/240/288 s per item`);

  // ---- Set assembly ----
  for (const subject of SUBJECTS) {
    const pool = poolFor(subject, TEMPLATES);
    if (pool.length === 0) { fail(`${subject}: no templates of format ${UNIT_FORMAT[subject]} in the bank`); continue; }
    for (const drill of Object.keys(DRILLS)) {
      for (let i = 0; i < Math.max(50, runs / 10); i++) {
        const seed = Math.floor(rng() * 4294967296) >>> 0;
        const where = `${subject}/${drill}/seed ${seed}`;
        const set = assembleSet({ subject, drill, seed, templates: TEMPLATES });
        const wantUnits = DRILLS[drill].units[subject];
        const perUnit = UNIT_FORMAT[subject] === 'situation' ? 3 : 1;

        if (set.units.length !== wantUnits) fail(`${where}: ${set.units.length} units, expected ${wantUnits}`);
        if (set.questions.length !== wantUnits * perUnit) fail(`${where}: ${set.questions.length} questions, expected ${wantUnits * perUnit}`);
        if (set.timeLimitSec !== Math.round(set.questions.length * secondsPerItem(subject))) fail(`${where}: time limit is not items x board pace`);
        if (set.units.some((u) => !pool.some((t) => t.id === u.templateId))) fail(`${where}: a unit came from outside the subject pool`);
        if (set.distinctTemplates !== Math.min(pool.length, wantUnits)) fail(`${where}: uses ${set.distinctTemplates} templates; should use each once before repeating`);

        // A repeated template must come back with different values.
        const seen = new Set();
        for (const u of set.units) {
          const key = u.templateId + JSON.stringify(u.instance.vars);
          if (seen.has(key)) fail(`${where}: the same problem appears twice`);
          seen.add(key);
        }

        // Same seed, same set.
        const again = assembleSet({ subject, drill, seed, templates: TEMPLATES });
        const plain = (s) => JSON.stringify(s.units.map((u) => [u.templateId, u.seed, u.instance.vars, u.instance.items.map((it) => it.choices.map((c) => c.text))]));
        if (plain(set) !== plain(again)) fail(`${where}: assembly is not deterministic`);

        // ---- Grading ----
        const key = set.questions.map(({ unit, item }) => set.units[unit].instance.items[item].answerIndex);
        const perfect = gradeSet(set, key);
        if (perfect.correct !== perfect.total || perfect.total !== set.questions.length) fail(`${where}: the answer key does not score 100%`);
        const wrong = gradeSet(set, key.map((k) => (k + 1) % 4));
        if (wrong.correct !== 0 || wrong.perItem.some((p) => !p.mistake)) fail(`${where}: all-wrong answers should score 0 and each carry a mistake name`);
        const blank = gradeSet(set, key.map(() => null));
        if (blank.correct !== 0 || blank.answered !== 0) fail(`${where}: unanswered items must count as wrong`);
        const half = gradeSet(set, key.map((k, q) => (q % 2 ? k : null)));
        const topicSum = Object.values(half.byTopic).reduce((a, t) => ({ c: a.c + t.correct, n: a.n + t.total }), { c: 0, n: 0 });
        if (topicSum.c !== half.correct || topicSum.n !== half.total) fail(`${where}: per-topic totals do not add up to the score`);
      }
    }
  }
  for (const bad of [{ subject: 'TERMS', drill: 'quick' }, { subject: 'PSAD', drill: 'mock' }]) {
    let threw = false;
    try { assembleSet({ ...bad, seed: 1, templates: TEMPLATES }); } catch { threw = true; }
    if (!threw) fail(`assembleSet accepted ${JSON.stringify(bad)}`);
  }
  if (PACING.PSAD.items !== 75 || PACING.MSTE.items !== 75 || PACING.HGE.items !== 50) fail('mock lengths must be 75/75/50');

  // ---- Timer, on a fake clock ----
  let t = 1000;
  const timer = createTimer({ limitSec: 60, now: () => t });
  if (timer.elapsedSec() !== 0 || timer.running) fail('timer should start stopped at zero');
  timer.start(); t += 10000;
  if (timer.elapsedSec() !== 10 || timer.remainingSec() !== 50) fail('timer: 10 s after start should read 10 elapsed / 50 left');
  timer.pause(); t += 500000;
  if (timer.elapsedSec() !== 10 || timer.running) fail('timer: paused time must not count');
  timer.start(); timer.start(); t += 20000;
  if (timer.elapsedSec() !== 30) fail('timer: resume should continue from 10 s (double start must be harmless)');
  if (timer.expired()) fail('timer: expired too early');
  t += 30000;
  if (!timer.expired() || timer.remainingSec() !== 0) fail('timer: should expire exactly at the limit');
  t += 99999;
  if (timer.elapsedSec() !== 60) fail('timer: elapsed must stop at the limit');
  for (const [sec, want] of [[754, '12:34'], [3725, '1:02:05'], [0, '0:00'], [0.2, '0:01'], [59.01, '1:00'], [-5, '0:00']]) {
    if (formatClock(sec) !== want) fail(`formatClock(${sec}) = "${formatClock(sec)}", expected "${want}"`);
  }

  // ---- Storage, on fake backends ----
  const mem = () => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), map: m }; };
  const backend = mem();
  const store = createStore(backend);
  if (store.getHistory().length !== 0) fail('storage: new store should be empty');
  const summary = (n) => ({ at: n, subject: 'PSAD', drill: 'quick', correct: 2, total: 3, seconds: 100 });
  store.saveResult(summary(1), [{ templateId: 'X', seed: 5, item: 0 }]);
  store.saveResult(summary(2), [{ templateId: 'X', seed: 5, item: 0 }, { templateId: 'X', seed: 5, item: 2 }]);
  const reopened = createStore(backend);
  if (reopened.getHistory().length !== 2) fail('storage: history did not survive a reload');
  if (reopened.getMistakes().length !== 2) fail('storage: the same missed item must be stored once');
  if (reopened.getMistakes().some((m) => m.at !== 2 && m.item === 0)) fail('storage: a repeated miss should keep the latest date');
  for (let i = 0; i < 260; i++) reopened.saveResult(summary(10 + i));
  if (reopened.getHistory().length !== 200 || reopened.getHistory().at(-1).at !== 269) fail('storage: history should keep the latest 200 sets');
  reopened.clear();
  if (createStore(backend).getHistory().length !== 0) fail('storage: clear did not empty the store');

  const corrupt = mem(); corrupt.setItem('ramboo-cele.v1', '{not json');
  if (createStore(corrupt).getHistory().length !== 0) fail('storage: corrupt data should read as empty');
  const wrongShape = mem(); wrongShape.setItem('ramboo-cele.v1', '{"version":1,"history":"nope"}');
  if (createStore(wrongShape).getMistakes().length !== 0) fail('storage: malformed data should read as empty');

  const full = { getItem: () => null, setItem: () => { throw new Error('quota'); } };
  const fullStore = createStore(full);
  if (fullStore.saveResult(summary(1)).saved !== false || fullStore.getHistory().length !== 1 || fullStore.persistent) fail('storage: a refused write should fall back to memory for the visit');
  const none = createStore(null);
  none.saveResult(summary(1));
  if (none.getHistory().length !== 1) fail('storage: must work with no backend at all');


  // ---- Mistake bank: one entry per (problem type, item); cleared by a later correct answer ----
  const mb = createStore(mem());
  const m = (templateId, item, seed = 1) => ({ templateId, item, seed });
  let out = mb.saveResult(summary(1), [m('A', 0), m('A', 2), m('B', 1)]);
  if (out.added !== 3 || out.cleared !== 0 || !out.saved) fail(`mistakes: first save reported ${JSON.stringify(out)}`);
  out = mb.saveResult(summary(2), [m('A', 0, 99)], [m('A', 2, 7), m('C', 0)]);
  if (out.added !== 0 || out.cleared !== 1) fail(`mistakes: second save reported ${JSON.stringify(out)}, expected 0 added / 1 cleared`);
  const left = mb.getMistakes().map((x) => `${x.templateId}${x.item}`).sort().join(',');
  if (left !== 'A0,B1') fail(`mistakes: outstanding should be A0,B1 — got ${left}`);
  if (mb.getMistakes().find((x) => x.templateId === 'A').seed !== 99) fail('mistakes: a repeated miss should keep the latest instance');
  out = mb.saveResult(summary(3), [m('A', 0)], [m('A', 0)]); // wrong wins if both are reported
  if (mb.getMistakes().filter((x) => x.templateId === 'A').length !== 1) fail('mistakes: an item reported both right and wrong must stay outstanding');
  if (out.cleared !== 0 || out.added !== 0) fail(`mistakes: right-and-wrong on an outstanding item should report nothing added or cleared, got ${JSON.stringify(out)}`);

  // Ordering and counting by subject.
  const psad = poolFor('PSAD', TEMPLATES);
  if (psad.length >= 2) {
    const ms = [m(psad[1].id, 0), m(psad[1].id, 1), m(psad[0].id, 2), m('MSTE-NOT-PSAD-001', 0)];
    const order = mistakeTemplates('PSAD', TEMPLATES, ms).map((t) => t.id).join(',');
    if (order !== `${psad[1].id},${psad[0].id}`) fail(`mistakes: templates should come most-missed first, got ${order}`);
    if (outstandingMistakes('PSAD', TEMPLATES, ms) !== 3) fail('mistakes: count must only include the subject\'s own templates');
    if (mistakeTemplates('HGE', TEMPLATES, ms).length !== 0) fail('mistakes: another subject must not see PSAD mistakes');
    const onlyMissed = assembleSet({ subject: 'PSAD', drill: 'full', seed: 5, templates: mistakeTemplates('PSAD', TEMPLATES, [m(psad[0].id, 1)]) });
    if (onlyMissed.units.some((u) => u.templateId !== psad[0].id)) fail('mistakes: a mistakes set drew a problem type that was not missed');
  }

  // ---- Avoid-repeat ----
  const seenStore = createStore(mem());
  seenStore.addSeen(['a', 'b']); seenStore.addSeen(['b', 'c']);
  if ([...seenStore.getSeen()].join(',') !== 'a,b,c') fail('seen: keys should be stored once, in order');
  seenStore.addSeen(Array.from({ length: 450 }, (_, i) => `k${i}`));
  if (seenStore.getSeen().size !== 400 || seenStore.getSeen().has('a') || !seenStore.getSeen().has('k449')) fail('seen: should keep the latest 400 keys');
  const legacy = mem(); legacy.setItem('ramboo-cele.v1', JSON.stringify({ version: 1, history: [summary(1)], mistakes: [] }));
  if (createStore(legacy).getSeen().size !== 0 || createStore(legacy).getHistory().length !== 1) fail('seen: data saved before avoid-repeat must still load');

  for (const subject of SUBJECTS) {
    const avoid = new Set();
    let repeats = 0;
    let total = 0;
    for (let i = 0; i < 40; i++) {
      const set = assembleSet({ subject, drill: 'full', seed: 1000 + i, templates: TEMPLATES, avoid });
      for (const u of set.units) { total++; if (avoid.has(unitKey(u))) repeats++; avoid.add(unitKey(u)); }
    }
    if (repeats > 0) fail(`avoid-repeat: ${subject} showed ${repeats} of ${total} problems a second time across 40 sets`);
  }
  // With everything already seen the assembler must still return a full set.
  const all = { has: () => true };
  if (assembleSet({ subject: 'HGE', drill: 'full', seed: 3, templates: TEMPLATES, avoid: all }).units.length !== 3) fail('avoid-repeat: must still build a set when every problem has been seen');

  return failures;
}
