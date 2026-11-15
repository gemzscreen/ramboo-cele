// Theme switch: Auto follows the OS; Day and Night set data-theme on <html>
// (css/tokens.css). The choice is kept on the device.
export const THEME_KEY = 'ramboo-cele.theme'; // same key in js/theme-init.js
export const THEMES = ['auto', 'day', 'night'];
const PAGE = { day: '#e6e9e4', night: '#0f1318' }; // --page, for the browser's own chrome

export function mountTheme(doc, storage) {
  const read = () => {
    try { const t = storage && storage.getItem(THEME_KEY); return THEMES.includes(t) ? t : 'auto'; } catch { return 'auto'; }
  };
  const inputs = [...doc.querySelectorAll('input[name="theme"]')];
  const metas = [...doc.querySelectorAll('meta[name="theme-color"]')];
  const defaults = metas.map((m) => m.getAttribute('content'));

  function apply(theme) {
    if (theme === 'auto') delete doc.documentElement.dataset.theme;
    else doc.documentElement.dataset.theme = theme;
    metas.forEach((m, i) => m.setAttribute('content', theme === 'auto' ? defaults[i] : PAGE[theme]));
    for (const input of inputs) input.checked = input.value === theme;
  }

  function set(theme) {
    if (!THEMES.includes(theme)) return;
    try { if (storage) storage.setItem(THEME_KEY, theme); } catch { /* not saved: lasts for this visit */ }
    apply(theme);
  }

  for (const input of inputs) input.addEventListener('change', () => set(input.value));
  apply(read());
  return { get: () => doc.documentElement.dataset.theme || 'auto', set };
}
