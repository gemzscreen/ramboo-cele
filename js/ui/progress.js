// Progress: KPI dashboard from the stored set history, study recommendations,
// Reset KPIs, and backup export / restore. All figures come from
// js/engine/kpi.js; this file only draws them.
import { computeKpis, MIN_ITEMS_FOR_ADVICE } from '../engine/kpi.js';
import { outstandingMistakes, SUBJECTS } from '../engine/exam.js';

// Names saved in a restored backup come from outside the app.
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
const hours = (sec) => {
  const m = Math.round(sec / 60);
  if (sec > 0 && m < 1) return 'under 1 min';
  return m >= 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m} min`;
};
const pace = (sec) => (sec / 60).toFixed(1);

export function mountProgress(root, { templates, store, win, onChange = () => {} }) {
  const topicNames = new Map(templates.map((t) => [t.topic_id, t.topic]));
  let confirming = null; // 'reset' | 'restore'
  let pending = null; // parsed backup waiting for confirmation
  let message = ''; // result of the last backup action

  const on = (role, fn) => { for (const el of root.querySelectorAll(`[data-role="${role}"]`)) el.addEventListener('click', fn); };
  const focusRole = (role) => { const el = root.querySelector(`[data-role="${role}"]`); if (el) el.focus(); };
  const backupText = () => JSON.stringify(store.exportData(win.Date.now()), null, 2);

  function render() {
    const history = store.getHistory();
    const k = computeKpis(history, topicNames);
    const mistakes = store.getMistakes();
    const untagged = history.filter((h) => !h.topics).length;

    const body = history.length === 0
      ? '<p class="practice-info progress-empty">No finished sets on this device yet. Finish a practice or exam set and your scores appear here.</p>'
      : `
        <dl class="stat-row">
          <div class="stat"><dt>Sets done</dt><dd>${k.overall.sets}</dd></div>
          <div class="stat"><dt>Items correct</dt><dd>${k.overall.correct} / ${k.overall.total}</dd></div>
          <div class="stat"><dt>Average</dt><dd>${k.overall.percent}%</dd></div>
          <div class="stat"><dt>Time spent</dt><dd>${hours(k.overall.seconds)}</dd></div>
        </dl>
        <table class="topic-table" data-role="subject-table">
          <caption>By subject</caption>
          <thead><tr><th scope="col">Subject</th><th scope="col">Sets</th><th scope="col">Correct</th><th scope="col">Min per item (board)</th><th scope="col">To fix</th></tr></thead>
          <tbody>${SUBJECTS.map((s) => {
            const b = k.bySubject[s];
            const toFix = outstandingMistakes(s, templates, mistakes);
            return `<tr><th scope="row">${s}</th><td>${b.sets}</td><td>${b.sets ? `${b.correct} / ${b.total} (${b.percent}%)` : '—'}</td><td>${b.sets ? `${pace(b.secondsPerItem)} (${pace(b.boardSecondsPerItem)})` : `— (${pace(b.boardSecondsPerItem)})`}</td><td>${toFix}</td></tr>`;
          }).join('')}</tbody>
        </table>
        ${k.byTopic.length ? `
        <table class="topic-table" data-role="topic-table">
          <caption>By topic, weakest first</caption>
          <thead><tr><th scope="col">Topic</th><th scope="col">Subject</th><th scope="col">Correct</th></tr></thead>
          <tbody>${k.byTopic.map((t) => `<tr><th scope="row">${esc(t.name)}</th><td>${t.subject}</td><td>${t.correct} / ${t.total} (${t.percent}%)</td></tr>`).join('')}</tbody>
        </table>` : ''}
        ${untagged ? `<p class="practice-info practice-later">${plural(untagged, 'earlier set')} saved before topics were recorded ${untagged === 1 ? 'is' : 'are'} counted in the totals but not in the topic table.</p>` : ''}
        <div class="progress-advice">
          <h3>What to study next</h3>
          ${k.recommendations.length
            ? `<ul data-role="advice">${k.recommendations.map((r) => `<li>${esc(r.text)}</li>`).join('')}</ul>`
            : `<p>Nothing flagged yet. A topic is judged after ${MIN_ITEMS_FOR_ADVICE} answered items.</p>`}
        </div>`;

    const confirm = confirming === 'reset' ? `
        <div class="practice-confirm" role="alertdialog" aria-label="Reset KPIs?">
          <p>Reset KPIs? This forgets the ${plural(history.length, 'finished set')} on this device. Your mistakes list is kept. This cannot be undone, so export a backup first if you may want them back.</p>
          <div class="live-actions">
            <button type="button" class="btn btn-danger" data-role="reset-yes">Reset KPIs</button>
            <button type="button" class="btn" data-role="confirm-no">Cancel</button>
          </div>
        </div>` : confirming === 'restore' ? `
        <div class="practice-confirm" role="alertdialog" aria-label="Restore backup?">
          <p>Restore this backup? It holds ${plural(pending.history.length, 'set')} and ${plural(pending.mistakes.length, 'mistake')}, and replaces the ${plural(history.length, 'set')} and ${plural(mistakes.length, 'mistake')} now on this device.</p>
          <div class="live-actions">
            <button type="button" class="btn btn-danger" data-role="restore-yes">Replace with backup</button>
            <button type="button" class="btn" data-role="confirm-no">Cancel</button>
          </div>
        </div>` : `
        <div class="live-actions">
          <button type="button" class="btn" data-role="export">Export backup</button>
          <button type="button" class="btn" data-role="import">Restore backup</button>
          <button type="button" class="btn btn-quiet" data-role="reset"${history.length ? '' : ' disabled'}>Reset KPIs</button>
          <input type="file" accept=".json,application/json" class="visually-hidden" data-role="file" aria-label="Backup file to restore" tabindex="-1">
        </div>`;

    root.innerHTML = `
      <div class="progress">
        ${body}
        <p class="practice-info practice-later" data-role="backup-message" role="status">${esc(message)}</p>
        ${confirm}
      </div>`;

    on('export', exportBackup);
    on('import', () => root.querySelector('[data-role="file"]').click());
    on('reset', () => { confirming = 'reset'; message = ''; render(); focusRole('confirm-no'); });
    on('confirm-no', () => { const back = confirming === 'reset' ? 'reset' : 'import'; confirming = null; pending = null; render(); focusRole(back); });
    on('reset-yes', () => { store.clearHistory(); confirming = null; message = 'KPIs reset.'; render(); onChange(); focusRole('export'); });
    on('restore-yes', () => {
      const out = store.importData(pending);
      confirming = null; pending = null;
      message = out.ok ? `Backup restored: ${plural(out.sets, 'set')}, ${plural(out.mistakes, 'mistake')}.${out.saved ? '' : ' This browser is not allowing the app to save, so it will be gone when you close the page.'}` : out.reason;
      render(); onChange(); focusRole('import');
    });
    const file = root.querySelector('[data-role="file"]');
    if (file) file.addEventListener('change', async () => {
      const chosen = file.files && file.files[0];
      if (chosen) offerRestore(await chosen.text());
    });
  }

  function exportBackup() {
    const name = `ramboo-cele-backup-${new Date(win.Date.now()).toISOString().slice(0, 10)}.json`;
    try {
      const url = win.URL.createObjectURL(new win.Blob([backupText()], { type: 'application/json' }));
      const a = root.ownerDocument.createElement('a');
      a.href = url; a.download = name;
      a.click();
      win.URL.revokeObjectURL(url);
      message = `Backup saved as ${name}.`;
    } catch {
      message = 'This browser could not save the backup file.';
    }
    render(); focusRole('export');
  }

  // Checks a backup file's text and, if it is sound, asks before replacing.
  function offerRestore(text) {
    let obj = null;
    try { obj = JSON.parse(text); } catch { /* reported below */ }
    const out = store.checkBackup(obj);
    if (out) { message = out; confirming = null; pending = null; render(); focusRole('import'); return false; }
    pending = obj; confirming = 'restore'; message = '';
    render(); focusRole('confirm-no');
    return true;
  }

  render();
  return { refresh: render, backupText, offerRestore };
}
