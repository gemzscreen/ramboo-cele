// Practice mode: pick a subject and size, answer one item at a time, check each
// answer, see the solution, then a results summary. Board pacing sets the timer.
import { assembleSet, gradeSet, poolFor, secondsPerItem, DRILLS, SUBJECTS, UNIT_FORMAT } from '../engine/exam.js';
import { createTimer, formatClock } from '../engine/timer.js';
import { randomSeed } from '../engine/rng.js';
import { templateById } from '../engine/bank.js';

const LETTERS = ['A', 'B', 'C', 'D'];

const duration = (sec) => {
  const s = Math.round(sec);
  const m = Math.floor(s / 60);
  return m >= 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : m > 0 ? `${m} min ${s % 60} s` : `${s} s`;
};

export function mountPractice(root, { templates, store, win }) {
  const state = { view: 'setup', subject: 'PSAD', drill: 'quick' };
  let set; let answers; let checked; let q; let selected; let timer; let tick; let paused; let confirmingEnd; let timeUp;

  const sizeLabel = (subject, drill) => {
    const n = DRILLS[drill].units[subject];
    return UNIT_FORMAT[subject] === 'situation'
      ? `${n} situation${n > 1 ? 's' : ''} (${n * 3} items)`
      : `${n} items`;
  };
  const itemCount = (subject, drill) => DRILLS[drill].units[subject] * (UNIT_FORMAT[subject] === 'situation' ? 3 : 1);

  // ---------- Setup ----------
  function renderSetup() {
    const pool = poolFor(state.subject, templates);
    const history = store.getHistory();
    const last = history.at(-1);
    const n = itemCount(state.subject, state.drill);
    root.innerHTML = `
      <div class="practice-setup">
        <fieldset class="segmented">
          <legend>Subject</legend>
          ${SUBJECTS.map((s) => `<label><input type="radio" name="practice-subject" value="${s}"${s === state.subject ? ' checked' : ''}><span>${s}</span></label>`).join('')}
        </fieldset>
        <fieldset class="segmented">
          <legend>Size</legend>
          ${Object.keys(DRILLS).map((d) => `<label><input type="radio" name="practice-drill" value="${d}"${d === state.drill ? ' checked' : ''}><span>${DRILLS[d].label}<small>${sizeLabel(state.subject, d)}</small></span></label>`).join('')}
        </fieldset>
        <p class="practice-info">Board pace for ${state.subject}: ${(secondsPerItem(state.subject) / 60).toFixed(1)} min per item, so this set allows <strong>${duration(n * secondsPerItem(state.subject))}</strong>. Each answer is checked as you go.</p>
        ${pool.length < DRILLS[state.drill].units[state.subject] ? `<p class="practice-info">The ${state.subject} bank has ${pool.length} problem type${pool.length === 1 ? '' : 's'} so far, so this set repeats ${pool.length === 1 ? 'it' : 'them'} with new values.</p>` : ''}
        <div class="live-actions practice-start">
          <button type="button" class="btn btn-primary" data-role="start"${pool.length ? '' : ' disabled'}>Start practice</button>
          ${history.length ? `<span class="practice-history">${history.length} set${history.length === 1 ? '' : 's'} done on this device. Last: ${last.subject} ${last.correct}/${last.total}.</span>` : ''}
        </div>
      </div>`;
    for (const input of root.querySelectorAll('input[type="radio"]')) {
      input.addEventListener('change', () => {
        if (input.name === 'practice-subject') state.subject = input.value; else state.drill = input.value;
        renderSetup();
        root.querySelector(`input[name="${input.name}"]:checked`).focus();
      });
    }
    root.querySelector('[data-role="start"]').addEventListener('click', start);
  }

  // ---------- Running a set ----------
  function start() {
    set = assembleSet({ subject: state.subject, drill: state.drill, seed: randomSeed(), templates });
    answers = set.questions.map(() => null);
    checked = set.questions.map(() => false);
    q = 0; selected = null; paused = false; confirmingEnd = false; timeUp = false;
    timer = createTimer({ limitSec: set.timeLimitSec, now: () => win.Date.now() });
    timer.start();
    tick = win.setInterval(onTick, 250);
    state.view = 'question';
    renderQuestion();
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

  function renderQuestion() {
    const { unit, item } = set.questions[q];
    const u = set.units[unit];
    const it = u.instance.items[item];
    const template = templateById(u.templateId);
    const isSituation = u.instance.items.length > 1;
    const isChecked = checked[q];
    const chosen = isChecked ? answers[q] : selected;
    const unitDone = set.questions.every((x, i) => x.unit !== unit || checked[i]);
    const last = q === set.questions.length - 1;

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

    root.innerHTML = `
      <div class="practice-bar">
        <span class="practice-progress">${set.subject} · Item ${q + 1} of ${set.questions.length}</span>
        <span class="practice-clock"><span class="visually-hidden">Time left </span><span data-role="clock"></span></span>
        <button type="button" class="btn btn-small" data-role="pause">${paused ? 'Resume' : 'Pause'}</button>
      </div>
      <p class="practice-clock-note" data-role="clock-note" aria-live="polite"></p>
      ${paused ? `
        <div class="practice-paused">
          <p>Paused. The timer has stopped and the problem is hidden.</p>
          <div class="live-actions"><button type="button" class="btn btn-primary" data-role="pause">Resume</button></div>
        </div>` : `
        ${isSituation ? `<p class="practice-unit">Situation ${unit + 1} · item ${item + 1} of ${u.instance.items.length}</p>` : ''}
        <p class="stem">${u.instance.stem}</p>
        ${template.figure ? `<div class="sample-figure paper">${template.figure(u.instance.vars)}</div>` : ''}
        <fieldset class="practice-item">
          <legend class="item-ask">${q + 1}. ${it.ask}</legend>
          <div class="choices">${choices}</div>
        </fieldset>
        <p class="practice-feedback${isChecked ? (answers[q] === it.answerIndex ? ' is-correct' : ' is-wrong') : ''}" role="status">${feedback}</p>
        ${isChecked && unitDone ? `<div class="solution"><h3>Solution</h3><ol>${u.instance.solution.map((s) => `<li>${s}</li>`).join('')}</ol></div>` : ''}
        ${isChecked && !unitDone ? '<p class="practice-info practice-later">The full solution appears after the last item of this situation.</p>' : ''}
        ${confirmingEnd ? `
          <div class="practice-confirm" role="alertdialog" aria-label="End this set?">
            <p>End this set now? Unanswered items count as wrong.</p>
            <div class="live-actions">
              <button type="button" class="btn btn-danger" data-role="end-yes">End set</button>
              <button type="button" class="btn" data-role="end-no">Keep going</button>
            </div>
          </div>` : `
          <div class="live-actions">
            ${isChecked
              ? `<button type="button" class="btn btn-primary" data-role="next">${last ? 'See results' : 'Next item'}</button>`
              : `<button type="button" class="btn btn-primary" data-role="check"${selected === null ? ' disabled' : ''}>Check answer</button>`}
            <button type="button" class="btn btn-quiet" data-role="end">End set</button>
          </div>`}
      `}`;

    paintClock(root.querySelector('[data-role="clock"]'));
    const on = (role, fn) => { for (const el of root.querySelectorAll(`[data-role="${role}"]`)) el.addEventListener('click', fn); };
    on('pause', () => { paused = !paused; if (paused) timer.pause(); else timer.start(); renderQuestion(); focusRole('pause'); });
    on('check', () => { answers[q] = selected; checked[q] = true; renderQuestion(); focusRole('next'); });
    on('next', () => { if (last) finish(); else { q++; selected = null; renderQuestion(); focusFirstChoice(); } });
    on('end', () => { confirmingEnd = true; renderQuestion(); focusRole('end-no'); });
    on('end-no', () => { confirmingEnd = false; renderQuestion(); focusRole('end'); });
    on('end-yes', finish);
    for (const input of root.querySelectorAll('input[name="practice-choice"]')) {
      input.addEventListener('change', () => { selected = Number(input.value); renderQuestion(); root.querySelector('input[name="practice-choice"]:checked').focus(); });
    }
  }

  const focusRole = (role) => { const el = root.querySelector(`[data-role="${role}"]`); if (el) el.focus(); };
  const focusFirstChoice = () => { const el = root.querySelector('input[name="practice-choice"]'); if (el) el.focus(); };

  // ---------- Results ----------
  function finish() {
    win.clearInterval(tick);
    timer.pause();
    // Only checked answers count: a choice selected but never checked was not submitted.
    const result = gradeSet(set, answers.map((a, i) => (checked[i] ? a : null)));
    const seconds = Math.round(timer.elapsedSec());
    const saved = store.saveResult(
      { at: win.Date.now(), subject: set.subject, drill: set.drill, correct: result.correct, total: result.total, seconds },
      result.perItem.filter((p) => !p.isCorrect).map((p) => ({ templateId: p.templateId, seed: p.seed, item: p.item })),
    );
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

    root.innerHTML = `
      <div class="practice-results">
        <p class="practice-unit">${set.subject} · ${DRILLS[set.drill].label}${timeUp ? ' · time ran out' : ''}</p>
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
        ${saved ? '' : '<p class="practice-info">This browser is not allowing the app to save, so this result will be gone when you close the page.</p>'}
        <div class="live-actions">
          <button type="button" class="btn btn-primary" data-role="again">New set</button>
        </div>
      </div>`;
    root.querySelector('[data-role="again"]').addEventListener('click', () => { state.view = 'setup'; renderSetup(); focusRole('start'); });
    focusRole('again');
  }

  renderSetup();
  return { getState: () => ({ ...state, set, q }) };
}
