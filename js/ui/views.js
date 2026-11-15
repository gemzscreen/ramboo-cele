// Tabs: one view on screen at a time. Each tab is a plain link to its view's
// id, so the address bar, Back button and a reload all keep the place, and
// with scripts off the page is simply one long document.
export function mountViews(doc) {
  const win = doc.defaultView;
  const views = [...doc.querySelectorAll('[data-view]')];
  const links = [...doc.querySelectorAll('[data-view-link]')];
  const names = views.map((v) => v.dataset.view);
  let current = null;

  function show(name) {
    if (!names.includes(name)) name = names[0];
    current = name;
    for (const v of views) v.hidden = v.dataset.view !== name;
    for (const a of links) {
      if (a.dataset.viewLink === name) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    }
  }
  const fromHash = () => (win.location.hash.match(/^#view-(.+)$/) || [])[1];

  // Show on click (before the browser follows the link, so the target exists
  // to scroll to); the hash listener covers Back, Forward and typed addresses.
  for (const a of links) a.addEventListener('click', () => show(a.dataset.viewLink));
  win.addEventListener('hashchange', () => show(fromHash()));
  show(fromHash());
  return { show, get current() { return current; }, names };
}
