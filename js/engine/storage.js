// Local progress: set history and the mistake bank. Everything stays in the
// user's browser (docs/privacy-notice.md). The backend is injected so the
// harness can test this without a browser; the app passes window.localStorage.
const KEY = 'ramboo-cele.v1';
const MAX_HISTORY = 200;
const MAX_MISTAKES = 500;

const empty = () => ({ version: 1, history: [], mistakes: [] });

export function createStore(backend) {
  let memory = null; // used when the backend is missing or refuses writes

  function read() {
    if (memory) return memory;
    try {
      const raw = backend && backend.getItem(KEY);
      if (!raw) return empty();
      const data = JSON.parse(raw);
      if (!data || data.version !== 1 || !Array.isArray(data.history) || !Array.isArray(data.mistakes)) return empty();
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
    // `summary`: { at, subject, drill, correct, total, seconds }
    // `wrong`:   [{ templateId, seed, item }] — enough to rebuild each missed item
    saveResult(summary, wrong = []) {
      const data = read();
      data.history.push(summary);
      for (const w of wrong) {
        const same = (x) => x.templateId === w.templateId && x.seed === w.seed && x.item === w.item;
        if (!data.mistakes.some(same)) data.mistakes.push({ ...w, at: summary.at });
      }
      data.history = data.history.slice(-MAX_HISTORY);
      data.mistakes = data.mistakes.slice(-MAX_MISTAKES);
      return write(data);
    },
    getHistory: () => read().history.slice(),
    getMistakes: () => read().mistakes.slice(),
    clear: () => write(empty()),
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
