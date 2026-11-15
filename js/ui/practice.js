// Runs a set in one of two modes on the same engine:
//   Practice — one item at a time, each answer checked on the spot, the worked
//              solution shown once a situation is finished.
//   Exam     — move freely between items and change answers; nothing is checked
//              until the set is submitted; key and solutions at the end.
// Board pacing sets the timer in both.
import { assembleSet, gradeSet, poolFor, mistakeTemplates, outstandingMistakes, unitKey, secondsPerItem, DRILLS, SUBJECTS, UNIT_FORMAT } from '../engine/exam.js';
import { createTimer, formatClock } from '../engine/timer.js';
import { randomSeed } from '../engine/rng.js';
import { templateById } from '../engine/bank.js';

const LETTERS = ['A', 'B', 'C', 'D'];
const MODES = {
  practice: { label: 'Practice', hint: 'check each answer' },
  exam: { label: 'Exam', hint: 'answers at the end' },
};

const duration = (sec) => {
  const s = Math.round(sec);
  const m = Math.floor(s / 60);
  return m >= 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : m > 0 ? `${m} min ${s % 60} s` : `${s} s`;
};

export function mountPractice(root, { templates, store, win, onSaved = () => {} }) {
  const state = { view: 'setup', subject: 'PSAD', drill: 'quick', mode: 'practice', source: 'all' };
  let set; let answers; let checked; let q; let selected; let timer; let tick; let paused; let confirming; let timeUp;

  const sizeLabel = (subject, drill) => {
    const n = DRILLS[drill].units[subject];
    return UNIT_FORMAT[subject] === 'situation'
      ? `${n} situation${n > 1 ? 's' : ''} (${n * 3} items)`
      : `${n} items`;
  };
  const itemCount = (subject, drill) => DRILLS[drill].units[subject] * (UNIT_FORMAT[subject] === 'situation' ? 3 : 1);
  const isExam = () => state.mode === 'exam';
  const on = (role, fn) => { for (const el of root.querySelectorAll(`[data-role="${role}"]`)) el.addEventListener('click', fn); };
  const focusRole = (role) => { const el = root.querySelector(`[data-role="${role}"]`); if (el) el.focus(); };
  const focusChoice = () => {
    const el = root.querySelector('input[name="practice-choice"]:checked') || root.querySelector('input[name="practice-choice"]');
    if (el) el.focus();
  };

  // The templates a set draws from: the whole subject, or only the problem
  // types with outstanding mistakes.
  const currentPool = () => (state.source === 'mistakes'
    ? mistakeTemplates(state.subject, templates, store.getMistakes())
    : poolFor(state.subject, templates));

  // ---------- Setup ----------
  function renderSetup() {
    const toFix = outstandingMistakes(state.subject, templates, store.getMistakes());
    if (toFix === 0) state.source = 'all';
    const pool = currentPool();
    const history = store.getHistory();
    const last = history.at(-1);
    const n = itemCount(state.subject, state.drill);
    const radios = (name, options, current) => options.map(([value, label, hint, disabled]) =>
      `<label${disabled ? ' class="is-disabled"' : ''}><input type="radio" name="${name}" value="${value}"${value === current ? ' checked' : ''}${disabled ? ' disabled' : ''}><span>${label}${hint ? `<small>${hint}</small>` : ''}</span></label>`).join('');

    root.innerHTML = `
      <div class="practice-setup">
        <fieldset class="segmented">
          <legend>Subject</legend>
          ${radios('practice-subject', [...SUBJECTS.map((s) => [s, s]), ['TERMS', 'TERMS', 'later', true]], state.subject)}
        </fieldset>
        <fieldset class="segmented">
          <legend>Size</legend>
          ${radios('practice-drill', Object.keys(DRILLS).map((d) => [d, DRILLS[d].label, sizeLabel(state.subject, d)]), state.drill)}
        </fieldset>
        <fieldset class="segmented">
          <legend>Mode</legend>
          ${radios('practice-mode', Object.keys(MODES).map((m) => [m, MODES[m].label, MODES[m].hint]), state.mode)}
        </fieldset>
        <fieldset class="segmented">
          <legend>Problems</legend>
          ${radios('practice-source', [
            ['all', 'All', `${poolFor(state.subject, templates).length} problem type${poolFor(state.subject, templates).length === 1 ? '' : 's'}`],
            ['mistakes', 'My mistakes', toFix ? `${toFix} item${toFix === 1 ? '' : 's'} to fix` : 'none to fix', toFix === 0],
          ], state.source)}
        </fieldset>
        <p class="practice-info">Board pace for ${state.subject}: ${(secondsPerItem(state.subject) / 60).toFixed(1)} min per item, so this set allows <strong>${duration(n * secondsPerItem(state.subject))}</strong>. ${isExam()
          ? 'You can move between items and change answers; the key and solutions appear after you submit.'
          : 'Each answer is checked as you go.'}</p>
        ${state.source === 'mistakes'
          ? '<p class="practice-info">Draws the problem types you missed, with new values. An item leaves your mistakes once you answer it correctly.</p>'
          : (pool.length < DRILLS[state.drill].units[state.subject] ? `<p class="practice-info">The ${state.subject} bank has ${pool.length} problem type${pool.length === 1 ? '' : 's'} so far, so this set repeats ${pool.length === 1 ? 'it' : 'them'} with new values.</p>` : '')}
        <div class="live-actions practice-start">
          <button type="button" class="btn btn-primary" data-role="start"${pool.length ? '' : ' disabled'}>Start ${MODES[state.mode].label.toLowerCase()}</button>
          ${history.length ? `<span class="practice-history">${history.length} set${history.length === 1 ? '' : 's'} done on this device. Last: ${last.subject} ${last.correct}/${last.total}.</span>` : ''}
        </div>
      </div>`;
    const fields = { 'practice-subject': 'subject', 'practice-drill': 'drill', 'practice-mode': 'mode', 'practice-source': 'source' };
    for (const input of root.querySelectorAll('input[type="radio"]')) {
      input.addEventListener('change', () => {
        state[fields[input.name]] = input.value;
        renderSetup();
        root.querySelector(`input[name="${input.name}"]:checked`).focus();
      });
    }
    on('start', start);
  }

  // ---------- Running a set ----------
  function start() {
    set = assembleSet({ subject: state.subject, drill: state.drill, seed: randomSeed(), templates: currentPool(), avoid: store.getSeen() });
    set.source = state.source;
    store.addSeen(set.units.map(unitKey));
    answers = set.questions.map(() => null);
    checked = set.questions.map(() => false);
    q = 0; selected = null; paused = false; confirming = false; timeUp = false;
    timer = createTimer({ limitSec: set.timeLimitSec, now: () => win.Date.now() });
    timer.start();
    tick = win.setInterval(onTick, 250);
    state.view = 'question';
    renderQuestion();
    focusChoice(); // the Start button is gone; put keyboard focus on the first choice
  }

  function onTick() {
    if (state.view !== 'question') return;
    if (timer.expired()) { timeUp = true; finish(); return; }
    const clock = root.querySelector('[data-role="clock"]');
    if (clock) paintClock(clock);
  }

  function paintClock(clock) {
    const left = timer.remainingSec();
    const share = left / timer.limitSec;
    clock.textContent = formatClock(left);
    clock.classList.toggle('is-low', share <= 0.1 && share > 0.02);
    clock.classList.toggle('is-critical', share <= 0.02);
    const note = root.querySelector('[data-role="clock-note"]');
    if (note) note.textContent = share <= 0.02 ? 'Time almost up' : share <= 0.1 ? 'Under 10% of the time left' : '';
  }

  function goTo(index) {
    q = index;
    selected = null;
    confirming = false;
    renderQuestion();
    focusChoice();
  }

  function renderQuestion() {
    const exam = isExam();
    const { unit, item } = set.questions[q];
    const u = set.units[unit];
    const it = u.instance.items[item];
    const template = templateById(u.templateId);
    const isSituation = u.instance.items.length > 1;
    const isChecked = checked[q]; // always false in Exam mode until submitted
    const chosen = exam || isChecked ? answers[q] : selected;
    const unitDone = set.questions.every((x, i) => x.unit !== unit || checked[i]);
    const last = q === set.questions.length - 1;
    const unanswered = answers.filter((a) => a === null).length;

    const choices = it.choices.map((c, j) => {
      const cls = ['choice'];
      let mark = '';
      if (isChecked && c.correct) { cls.push('is-correct'); mark = '<span class="choice-mark">✓ Correct</span>'; }
      else if (isChecked && j === chosen) { cls.push('is-wrong'); mark = '<span class="choice-mark">✗ Your answer</span>'; }
      else if (!isChecked && j === chosen) cls.push('is-selected');
      return `<label class="${cls.join(' ')}">
          <input type="radio" name="practice-choice" value="${j}"${j === chosen ? ' checked' : ''}${isChecked ? ' disabled' : ''}>
          <span class="choice-letter">${LETTERS[j]}</span><span class="choice-text">${c.text} ${it.unit}</span>${mark}
        </label>`;
    }).join('');

    let feedback = '';
    if (isChecked) {
      const key = `${LETTERS[it.answerIndex]}, ${it.answerText} ${it.unit}`;
      feedback = answers[q] === it.answerIndex ? 'Correct.' : `Not quite. The answer is ${key}.`;
    }

    const navigator = exam ? `
        <nav class="item-nav" aria-label="Items">
          ${set.questions.map((_, i) => `<button type="button" class="item-nav-btn${i === q ? ' is-current' : ''}${answers[i] !== null ? ' is-answered' : ''}" data-goto="${i}" aria-label="Item ${i + 1}, ${answers[i] !== null ? 'answered' : 'not answered'}"${i === q ? ' aria-current="true"' : ''}>${i + 1}</button>`).join('')}
        </nav>` : '';

    const endWord = exam ? 'Submit' : 'End set';
    const actions = exam ? `
            <button type="button" class="btn" data-role="prev"${q === 0 ? ' disabled' : ''}>Previous</button>
            <button type="button" class="btn${last ? '' : ' btn-primary'}" data-role="next"${last ? ' disabled' : ''}>Next</button>
            <button type="button" class="btn${last ? ' btn-primary' : ''} btn-end" data-role="end">Submit exam</button>` : `
            ${isChecked
              ? `<button type="button" class="btn btn-primary" data-role="next">${last ? 'See results' : 'Next item'}</button>`
              : `<button type="button" class="btn btn-primary" data-role="check"${selected === null ? ' disabled' : ''}>Check answer</button>`}
            <button type="button" class="btn btn-quiet" data-role="end">End set</button>`;

    root.innerHTML = `
      <div class="practice-bar">
        <span class="practice-progress">${set.subject} ${MODES[state.mode].label.toLowerCase()} · Item ${q + 1} of ${set.questions.length}</span>
        <span class="practice-clock"><span class="visually-hidden">Time left </span><span data-role="clock"></span></span>
        <button type="button" class="btn btn-small" data-role="pause">${paused ? 'Resume' : 'Pause'}</button>
      </div>
      <p class="practice-clock-note" data-role="clock-note" aria-live="polite"></p>
      ${paused ? `
        <div class="practice-paused">
          <p>Paused. The timer has stopped and the problem is hidden.</p>
          <div class="live-actions"><button type="button" class="btn btn-primary" data-role="pause">Resume</button></div>
        </div>` : `
        ${navigator}
        ${isSituation ? `<p class="practice-unit">Situation ${unit + 1} · item ${item + 1} of ${u.instance.items.length}</p>` : ''}
        <p class="stem">${u.instance.stem}</p>
        ${template.figure ? `<div class="sample-figure paper">${template.figure(u.instance.vars)}</div>` : ''}
        <fieldset class="practice-item">
          <legend class="item-ask">${q + 1}. ${it.ask}</legend>
          <div class="choices">${choices}</div>
        </fieldset>
        ${exam ? '' : `<p class="practice-feedback${isChecked ? (answers[q] === it.answerIndex ? ' is-correct' : ' is-wrong') : ''}" role="status">${feedback}</p>`}
        ${isChecked && unitDone ? `<div class="solution"><h3>Solution</h3><ol>${u.instance.solution.map((s) => `<li>${s}</li>`).join('')}</ol></div>` : ''}
        ${isChecked && !unitDone ? '<p class="practice-info practice-later">The full solution appears after the last item of this situation.</p>' : ''}
        ${confirming ? `
          <div class="practice-confirm" role="alertdialog" aria-label="${endWord}?">
            <p>${exam
              ? (unanswered ? `Submit now? ${unanswered} item${unanswered === 1 ? ' is' : 's are'} not answered and will count as wrong.` : 'Submit now? All items are answered.')
              : 'End this set now? Unanswered items count as wrong.'}</p>
            <div class="live-actions">
              <button type="button" class="btn btn-danger" data-role="end-yes">${endWord}</button>
              <button type="button" class="btn" data-role="end-no">Keep going</button>
              <button type="button" class="btn btn-quiet" data-role="discard">Discard without saving</button>
            </div>
          </div>` : `<div class="live-actions">${actions}</div>`}
      `}`;

    paintClock(root.querySelector('[data-role="clock"]'));
    on('pause', () => { paused = !paused; if (paused) timer.pause(); else timer.start(); renderQuestion(); focusRole('pause'); });
    on('check', () => { answers[q] = selected; checked[q] = true; renderQuestion(); focusRole('next'); });
    on('next', () => { if (last) finish(); else goTo(q + 1); });
    on('prev', () => goTo(q - 1));
    on('end', () => { confirming = true; renderQuestion(); focusRole('end-no'); });
    on('end-no', () => { confirming = false; renderQuestion(); focusRole('end'); });
    on('end-yes', finish);
    on('discard', discard);
    for (const btn of root.querySelectorAll('[data-goto]')) btn.addEventListener('click', () => goTo(Number(btn.dataset.goto)));
    for (const input of root.querySelectorAll('input[name="practice-choice"]')) {
      input.addEventListener('change', () => {
        if (exam) answers[q] = Number(input.value); else selected = Number(input.value);
        renderQuestion();
        focusChoice();
      });
    }
  }

  function discard() {
    win.clearInterval(tick);
    state.view = 'setup';
    renderSetup();
    focusRole('start');
  }

  // ---------- Results ----------
  function finish() {
    win.clearInterval(tick);
    timer.pause();
    // Practice: only checked answers were submitted. Exam: every selection counts.
    const submitted = isExam() ? answers : answers.map((a, i) => (checked[i] ? a : null));
    const result = gradeSet(set, submitted);
    const seconds = Math.round(timer.elapsedSec());
    const ref = (p) => ({ templateId: p.templateId, seed: p.seed, item: p.item });
    const outcome = store.saveResult(
      { at: win.Date.now(), subject: set.subject, drill: set.drill, mode: state.mode, source: set.source, correct: result.correct, total: result.total, seconds, topics: result.byTopicId },
      result.perItem.filter((p) => !p.isCorrect).map(ref),
      result.perItem.filter((p) => p.isCorrect).map(ref),
    );
    onSaved();
    const left = outstandingMistakes(set.subject, templates, store.getMistakes());
    const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
    const mistakeNote = [
      outcome.added ? `${plural(outcome.added, 'item')} added to your mistakes` : '',
      outcome.cleared ? `${plural(outcome.cleared, 'item')} cleared from your mistakes` : '',
    ].filter(Boolean).join('; ');
    state.view = 'results';
    const pct = Math.round((100 * result.correct) / result.total);

    const review = result.perItem.map((p, i) => {
      const it = set.units[p.unit].instance.items[p.item];
      const yours = p.chosen === null ? 'not answered' : `${LETTERS[p.chosen]}, ${it.choices[p.chosen].text} ${it.unit}`;
      return `<li class="${p.isCorrect ? 'is-correct' : 'is-wrong'}">
          <span class="review-mark">${p.isCorrect ? '✓' : '✗'}</span>
          <span class="review-ask">${i + 1}. ${it.ask}</span>
          <span class="review-ans">${p.isCorrect ? `${it.answerText} ${it.unit}` : `Yours: ${yours}. Answer: ${LETTERS[p.answerIndex]}, ${it.answerText} ${it.unit}`}</span>
        </li>`;
    }).join('');

    let first = 1;
    const solutions = set.units.map((u, k) => {
      const count = u.instance.items.length;
      const range = count > 1 ? `Situation ${k + 1} (items ${first}–${first + count - 1})` : `Item ${first}`;
      first += count;
      const template = templateById(u.templateId);
      return `<details class="solution-fold">
          <summary>${range}: problem and solution</summary>
          <p class="stem">${u.instance.stem}</p>
          ${template.figure ? `<div class="sample-figure paper">${template.figure(u.instance.vars)}</div>` : ''}
          <div class="solution"><ol>${u.instance.solution.map((s) => `<li>${s}</li>`).join('')}</ol></div>
        </details>`;
    }).join('');

    root.innerHTML = `
      <div class="practice-results">
        <p class="practice-unit">${set.subject} · ${DRILLS[set.drill].label} · ${MODES[state.mode].label}${set.source === 'mistakes' ? ' · my mistakes' : ''}${timeUp ? ' · time ran out' : ''}</p>
        <dl class="stat-row stat-row-3">
          <div class="stat"><dt>Score</dt><dd>${result.correct} / ${result.total}</dd></div>
          <div class="stat"><dt>Percent</dt><dd>${pct}%</dd></div>
          <div class="stat"><dt>Time used</dt><dd>${formatClock(seconds)}</dd></div>
        </dl>
        <table class="topic-table">
          <caption>By topic</caption>
          <thead><tr><th scope="col">Topic</th><th scope="col">Correct</th></tr></thead>
          <tbody>${Object.entries(result.byTopic).map(([topic, t]) => `<tr><th scope="row">${topic}</th><td>${t.correct} / ${t.total}</td></tr>`).join('')}</tbody>
        </table>
        <ol class="review">${review}</ol>
        <div class="solution-folds">${solutions}</div>
        <p class="practice-info practice-later" data-role="mistake-note">${mistakeNote ? `${mistakeNote[0].toUpperCase()}${mistakeNote.slice(1)}. ` : ''}${left ? `${plural(left, 'item')} left to fix in ${set.subject}.` : `No mistakes left to fix in ${set.subject}.`}</p>
        ${outcome.saved ? '' : '<p class="practice-info practice-later">This browser is not allowing the app to save, so this result will be gone when you close the page.</p>'}
        <div class="live-actions">
          <button type="button" class="btn btn-primary" data-role="again">New set</button>
        </div>
      </div>`;
    on('again', () => { state.view = 'setup'; renderSetup(); focusRole('start'); });
    focusRole('again');
  }

  renderSetup();
  return {
    getState: () => ({ ...state, set, q }),
    store,
    // Stored progress changed elsewhere (reset or restore): redraw the setup screen.
    refresh() { if (state.view === 'setup') renderSetup(); },
  };
}
