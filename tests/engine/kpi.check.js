// Stage 3 checks for the KPI figures, per-topic grading, Reset KPIs and backup.
import { computeKpis } from '../../js/engine/kpi.js';
import { assembleSet, gradeSet, SUBJECTS } from '../../js/engine/exam.js';
import { createStore, backupProblem } from '../../js/engine/storage.js';
import { TEMPLATES } from '../../js/engine/bank.js';

export function check(rng, runs) {
  const failures = [];
  const fail = (msg) => { if (failures.length < 15) failures.push(msg); };
  const mem = () => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)) }; };

  // ---- Hand-computed history ----
  // PSAD: 2 sets, 4 + 2 = 6 of 9 + 3 = 12 correct (50%), 3600 + 1200 = 4800 s -> 400 s/item (board 288).
  // MSTE: 1 set, 9 of 10 (90%), 1200 s -> 120 s/item (board 240). HGE: none.
  // Overall: 3 sets, 15 of 22 = 68.18 -> 68%, 6000 s.
  const history = [
    { at: 1, subject: 'PSAD', correct: 4, total: 9, seconds: 3600, topics: { 'psad.a': { name: 'Alpha', correct: 1, total: 6 }, 'psad.b': { name: 'Beta', correct: 3, total: 3 } } },
    { at: 2, subject: 'PSAD', correct: 2, total: 3, seconds: 1200, topics: { 'psad.a': { name: 'Alpha', correct: 2, total: 3 } } },
    { at: 3, subject: 'MSTE', correct: 9, total: 10, seconds: 1200, topics: { 'mste.c': { name: 'Gamma', correct: 6, total: 8 }, 'mste.d': { name: 'Delta', correct: 1, total: 2 } } },
  ];
  const k = computeKpis(history, new Map([['psad.b', 'Beta renamed']]));
  const o = k.overall;
  if (o.sets !== 3 || o.correct !== 15 || o.total !== 22 || o.percent !== 68 || o.seconds !== 6000) fail(`kpi: overall is ${JSON.stringify(o)}`);
  const p = k.bySubject.PSAD;
  if (p.sets !== 2 || p.correct !== 6 || p.total !== 12 || p.percent !== 50 || p.secondsPerItem !== 400 || p.boardSecondsPerItem !== 288) fail(`kpi: PSAD is ${JSON.stringify(p)}`);
  const m = k.bySubject.MSTE;
  if (m.sets !== 1 || m.percent !== 90 || m.secondsPerItem !== 120 || m.boardSecondsPerItem !== 240) fail(`kpi: MSTE is ${JSON.stringify(m)}`);
  if (k.bySubject.HGE.sets !== 0 || k.bySubject.HGE.percent !== 0 || k.bySubject.HGE.secondsPerItem !== 0) fail('kpi: an untried subject must read as zeros, not NaN');
  // Topics: Alpha 3/9 = 33%, Delta 1/2 = 50%, Gamma 6/8 = 75%, Beta 3/3 = 100%. Weakest first.
  const order = k.byTopic.map((t) => `${t.id}:${t.correct}/${t.total}:${t.percent}`).join(' ');
  if (order !== 'psad.a:3/9:33 mste.d:1/2:50 mste.c:6/8:75 psad.b:3/3:100') fail(`kpi: topic table is ${order}`);
  if (k.byTopic.find((t) => t.id === 'psad.b').name !== 'Beta renamed' || k.byTopic[0].name !== 'Alpha') fail('kpi: topic names should come from the bank, else from the saved set');
  // Advice: Alpha is weak (33% of 9). Delta has only 2 items, so it is not judged. Gamma is at 75%, so not flagged.
  // PSAD pace 400 s > 288 s is flagged; MSTE is faster than the board. HGE untried.
  const kinds = k.recommendations.map((r) => `${r.kind}:${r.topicId || r.subject}`).join(' ');
  if (kinds !== 'weak:psad.a pace:PSAD untried:HGE') fail(`kpi: recommendations are "${kinds}"`);
  if (!/3 of 9/.test(k.recommendations[0].text) || !/6\.7 min per item against the board's 4\.8/.test(k.recommendations[1].text)) fail(`kpi: advice text is wrong: ${k.recommendations.map((r) => r.text).join(' | ')}`);

  const none = computeKpis([]);
  if (none.overall.sets !== 0 || none.overall.percent !== 0 || none.byTopic.length || none.recommendations.length) fail('kpi: empty history must give zeros and no advice');
  const old = computeKpis([{ at: 1, subject: 'HGE', correct: 1, total: 3, seconds: 60 }]); // saved before topics were recorded
  if (old.overall.total !== 3 || old.byTopic.length !== 0) fail('kpi: a set without topics counts in the totals only');
  const mid = computeKpis([{ at: 1, subject: 'HGE', correct: 2, total: 3, seconds: 60, topics: { 'hge.x': { name: 'X', correct: 2, total: 3 } } }]);
  if (mid.recommendations.map((r) => r.kind).join(',') !== 'practice,untried,untried') fail(`kpi: 67% on 3 items should read "keep practising", got ${mid.recommendations.map((r) => r.kind)}`);

  // ---- Grading by topic id adds up, and every id is a real template topic ----
  const ids = new Set(TEMPLATES.map((t) => t.topic_id));
  for (const subject of SUBJECTS) {
    for (let i = 0; i < Math.max(20, runs / 50); i++) {
      const set = assembleSet({ subject, drill: 'full', seed: Math.floor(rng() * 4294967296) >>> 0, templates: TEMPLATES });
      const answers = set.questions.map(() => (rng() < 0.2 ? null : Math.floor(rng() * 4)));
      const r = gradeSet(set, answers);
      const sum = Object.values(r.byTopicId).reduce((a, t) => ({ c: a.c + t.correct, n: a.n + t.total }), { c: 0, n: 0 });
      if (sum.c !== r.correct || sum.n !== r.total) fail(`${subject}: per-topic-id totals ${sum.c}/${sum.n} do not add up to the score ${r.correct}/${r.total}`);
      for (const [id, t] of Object.entries(r.byTopicId)) if (!ids.has(id) || !t.name) fail(`${subject}: graded topic id "${id}" is not a template topic_id`);
    }
  }

  // ---- Reset KPIs keeps the mistakes ----
  const store = createStore(mem());
  store.saveResult(history[0], [{ templateId: 'A', item: 1, seed: 7 }]);
  store.saveResult(history[2]);
  store.addSeen(['k1']);
  const backup = JSON.parse(JSON.stringify(store.exportData(0)));
  if (backup.app !== 'ramboo-cele' || backup.exported_at !== '1970-01-01T00:00:00.000Z' || backup.history.length !== 2) fail('backup: export is missing its marker, date or history');
  store.clearHistory();
  if (store.getHistory().length !== 0 || store.getMistakes().length !== 1 || store.getSeen().size !== 1) fail('reset: Reset KPIs must clear the history and keep mistakes and seen problems');

  // ---- Backup round trip ----
  const other = createStore(mem());
  other.saveResult(history[1]);
  const res = other.importData(backup);
  if (!res.ok || !res.saved || res.sets !== 2 || res.mistakes !== 1) fail(`backup: restore reported ${JSON.stringify(res)}`);
  if (JSON.stringify(other.getHistory()) !== JSON.stringify(backup.history) || other.getMistakes()[0].templateId !== 'A' || !other.getSeen().has('k1')) fail('backup: restored data differs from the export');
  if (JSON.stringify(computeKpis(other.getHistory())) !== JSON.stringify(computeKpis(backup.history))) fail('backup: KPIs differ after a restore');

  // ---- Bad backups are refused and change nothing ----
  const clone = (edit) => { const c = JSON.parse(JSON.stringify(backup)); edit(c); return c; };
  const bad = [
    ['null', null], ['a string', 'x'], ['an array', []],
    ['another app', clone((c) => { c.app = 'other'; })],
    ['another version', clone((c) => { c.version = 2; })],
    ['no history', clone((c) => { delete c.history; })],
    ['unknown subject', clone((c) => { c.history[0].subject = 'TERMS'; })],
    ['correct above total', clone((c) => { c.history[0].correct = 99; })],
    ['zero-item set', clone((c) => { c.history[0].total = 0; c.history[0].correct = 0; })],
    ['negative time', clone((c) => { c.history[0].seconds = -1; })],
    ['markup in a topic id', clone((c) => { c.history[0].topics = { '<img src=x>': { name: 'x', correct: 0, total: 1 } }; })],
    ['topic without a name', clone((c) => { c.history[0].topics['psad.a'].name = ''; })],
    ['mistake without an item', clone((c) => { delete c.mistakes[0].item; })],
    ['non-text seen key', clone((c) => { c.seen = [5]; })],
  ];
  const before = JSON.stringify(other.exportData(0));
  for (const [label, obj] of bad) {
    if (!backupProblem(obj)) fail(`backup: accepted a file with ${label}`);
    if (other.importData(obj).ok) fail(`backup: restored a file with ${label}`);
  }
  if (JSON.stringify(other.exportData(0)) !== before) fail('backup: a refused file changed the stored data');
  if (backupProblem(backup) !== null) fail('backup: a sound file was refused');
  const legacy = clone((c) => { delete c.seen; c.history.forEach((h) => delete h.topics); });
  if (!createStore(mem()).importData(legacy).ok) fail('backup: a backup without topics or seen problems must still restore');

  return failures;
}
