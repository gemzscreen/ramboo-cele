// Local progress: set history and the mistake bank. Everything stays in the
// user's browser (docs/privacy-notice.md). The backend is injected so the
// harness can test this without a browser; the app passes window.localStorage.
const KEY = 'ramboo-cele.v1';
const MAX_HISTORY = 200;
const MAX_MISTAKES = 500;
const MAX_SEEN = 400;

const empty = () => ({ version: 1, history: [], mistakes: [], seen: [] });

const APP_ID = 'ramboo-cele';
const SUBJECTS = ['PSAD', 'MSTE', 'HGE'];
const count = (n) => Number.isInteger(n) && n >= 0;
const text = (v, max) => typeof v === 'string' && v.length > 0 && v.length <= max;

// Why a backup cannot be restored, or null when it is well formed. A backup
// file comes from outside the app, so every field that is used is checked.
export function backupProblem(obj) {
  if (!obj || typeof obj !== 'object' || obj.app !== APP_ID) return 'This is not a Ramboo CELE backup file.';
  if (obj.version !== 1) return 'This backup was made by a different version of the app.';
  if (!Array.isArray(obj.history) || !Array.isArray(obj.mistakes) || (obj.seen !== undefined && !Array.isArray(obj.seen))) return 'The backup file is incomplete.';
  for (const h of obj.history) {
    const ok = h && SUBJECTS.includes(h.subject) && Number.isFinite(h.at) && count(h.correct) && count(h.total) && h.total > 0
      && h.correct <= h.total && Number.isFinite(h.seconds) && h.seconds >= 0
      && (h.topics === undefined || (h.topics && typeof h.topics === 'object' && Object.entries(h.topics).every(([id, t]) =>
        /^[a-z0-9.-]{1,120}$/.test(id) && t && text(t.name, 120) && count(t.correct) && count(t.total) && t.correct <= t.total)));
    if (!ok) return 'The backup file has a damaged set record.';
  }
  for (const m of obj.mistakes) {
    if (!(m && text(m.templateId, 60) && count(m.item) && Number.isFinite(m.seed))) return 'The backup file has a damaged mistake record.';
  }
  if ((obj.seen || []).some((k) => !text(k, 400))) return 'The backup file has a damaged problem record.';
  return null;
}

export function createStore(backend) {
  let memory = null; // used when the backend is missing or refuses writes

  function read() {
    if (memory) return memory;
    try {
      const raw = backend && backend.getItem(KEY);
      if (!raw) return empty();
      const data = JSON.parse(raw);
      if (!data || data.version !== 1 || !Array.isArray(data.history) || !Array.isArray(data.mistakes)) return empty();
      if (!Array.isArray(data.seen)) data.seen = []; // saved before avoid-repeat existed
      return data;
    } catch {
      return empty(); // unreadable or corrupt: start clean rather than crash
    }
  }

  function write(data) {
    try {
      if (!backend) throw new Error('no storage');
      backend.setItem(KEY, JSON.stringify(data));
      memory = null;
      return true;
    } catch {
      memory = data; // private mode or quota full: keep it for this visit
      return false;
    }
  }

  return {
    // `summary`: { at, subject, drill, mode, correct, total, seconds }
    // `wrong`, `right`: [{ templateId, seed, item }] for the items missed and the
    // items answered correctly. A mistake is one (problem type, item) pair: it is
    // stored once, and answering that item correctly in any later set clears it.
    saveResult(summary, wrong = [], right = []) {
      const data = read();
      const same = (a) => (b) => a.templateId === b.templateId && a.item === b.item;
      // When a problem type appears twice in a set, an item can be both right and
      // wrong; it then stays outstanding and is not reported as cleared.
      const fixed = right.filter((r) => !wrong.some(same(r)));
      const before = data.mistakes.length;
      data.mistakes = data.mistakes.filter((m) => !fixed.some(same(m)));
      const cleared = before - data.mistakes.length;
      let added = 0;
      for (const w of wrong) {
        const entry = { templateId: w.templateId, item: w.item, seed: w.seed, at: summary.at };
        const index = data.mistakes.findIndex(same(w));
        if (index === -1) { data.mistakes.push(entry); added++; } else data.mistakes[index] = entry;
      }
      data.history.push(summary);
      data.history = data.history.slice(-MAX_HISTORY);
      data.mistakes = data.mistakes.slice(-MAX_MISTAKES);
      return { saved: write(data), added, cleared };
    },
    // Avoid-repeat: remembers the exact problems shown (type + values).
    addSeen(keys) {
      const data = read();
      data.seen = [...data.seen.filter((k) => !keys.includes(k)), ...keys].slice(-MAX_SEEN);
      return write(data);
    },
    getSeen: () => new Set(read().seen),
    getHistory: () => read().history.slice(),
    getMistakes: () => read().mistakes.slice(),
    clear: () => write(empty()),
    // Reset KPIs: forgets the finished sets; mistakes and seen problems stay.
    clearHistory() { const data = read(); data.history = []; return write(data); },
    // Backup: everything the app keeps on this device, as one plain object.
    exportData: (at = Date.now()) => ({ app: APP_ID, exported_at: new Date(at).toISOString(), ...read() }),
    checkBackup: (obj) => backupProblem(obj),
    // Restore: replaces what is stored. Nothing is written unless the whole
    // backup is well formed.
    importData(obj) {
      const reason = backupProblem(obj);
      if (reason) return { ok: false, reason };
      const data = {
        version: 1,
        history: obj.history.slice(-MAX_HISTORY),
        mistakes: obj.mistakes.slice(-MAX_MISTAKES),
        seen: (obj.seen || []).slice(-MAX_SEEN),
      };
      return { ok: true, saved: write(data), sets: data.history.length, mistakes: data.mistakes.length };
    },
    get persistent() { return memory === null && !!backend; },
  };
}

// window.localStorage can throw on access in some privacy modes.
export function browserStorage(win) {
  try {
    const s = win.localStorage;
    s.getItem(KEY);
    return s;
  } catch {
    return null;
  }
}
