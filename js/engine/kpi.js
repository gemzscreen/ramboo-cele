// KPIs from the stored set history. Pure: history in, numbers out, so the
// harness can check every figure. Per-topic figures use the taxonomy topic id
// saved with each set (sets saved before v0.0.10 carry none and are skipped there).
import { SUBJECTS, secondsPerItem } from './exam.js';

export const MIN_ITEMS_FOR_ADVICE = 3; // fewer attempts than this say little about a topic
export const WEAK_BELOW = 50; // percent
export const PASSING = 75; // percent; under this a topic still needs practice

const pct = (correct, total) => (total ? Math.round((100 * correct) / total) : 0);
const tally = () => ({ sets: 0, correct: 0, total: 0, seconds: 0 });
const finish = (t) => ({ ...t, percent: pct(t.correct, t.total), secondsPerItem: t.total ? t.seconds / t.total : 0 });

// `topicNames`: Map of topic id -> current name (from the bank); the name
// saved with the set is used when the bank no longer has the topic.
export function computeKpis(history, topicNames = new Map()) {
  const overall = tally();
  const subjects = Object.fromEntries(SUBJECTS.map((s) => [s, tally()]));
  const topics = new Map();

  for (const h of history) {
    for (const t of [overall, subjects[h.subject]]) {
      if (!t) continue;
      t.sets++; t.correct += h.correct; t.total += h.total; t.seconds += h.seconds;
    }
    for (const [id, r] of Object.entries(h.topics || {})) {
      const row = topics.get(id) || { id, subject: h.subject, name: r.name, correct: 0, total: 0 };
      row.correct += r.correct; row.total += r.total; row.name = topicNames.get(id) || r.name;
      topics.set(id, row);
    }
  }

  const bySubject = Object.fromEntries(SUBJECTS.map((s) => [s, { ...finish(subjects[s]), boardSecondsPerItem: secondsPerItem(s) }]));
  // Weakest first; ties go to the topic with more attempts.
  const byTopic = [...topics.values()].map((t) => ({ ...t, percent: pct(t.correct, t.total) }))
    .sort((a, b) => a.percent - b.percent || b.total - a.total || a.id.localeCompare(b.id));

  return { overall: finish(overall), bySubject, byTopic, recommendations: recommend(bySubject, byTopic) };
}

// Plain rules, in priority order: weak topics, topics still under the passing
// mark, pace slower than the board's, subjects not yet tried.
function recommend(bySubject, byTopic) {
  const out = [];
  const judged = byTopic.filter((t) => t.total >= MIN_ITEMS_FOR_ADVICE);
  for (const t of judged.filter((x) => x.percent < WEAK_BELOW).slice(0, 3)) {
    out.push({ kind: 'weak', topicId: t.id, text: `Review ${t.name} (${t.subject}): ${t.correct} of ${t.total} correct. Go back to the method before the next set.` });
  }
  for (const t of judged.filter((x) => x.percent >= WEAK_BELOW && x.percent < PASSING).slice(0, 3)) {
    out.push({ kind: 'practice', topicId: t.id, text: `Keep practising ${t.name} (${t.subject}): ${t.percent}% so far, under the ${PASSING}% mark.` });
  }
  for (const s of SUBJECTS) {
    const k = bySubject[s];
    if (k.sets && k.secondsPerItem > k.boardSecondsPerItem) {
      out.push({ kind: 'pace', subject: s, text: `${s} pace: ${(k.secondsPerItem / 60).toFixed(1)} min per item against the board's ${(k.boardSecondsPerItem / 60).toFixed(1)}. Try a timed Exam set.` });
    }
  }
  const tried = SUBJECTS.filter((s) => bySubject[s].sets);
  if (tried.length) for (const s of SUBJECTS.filter((x) => !bySubject[x].sets)) out.push({ kind: 'untried', subject: s, text: `No ${s} sets yet.` });
  return out;
}
