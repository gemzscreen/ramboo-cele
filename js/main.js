import { APP_VERSION } from './version.js';

// Wires the shell to a document. Takes the document as an argument so the
// harness (tests/stage2-dom.js) can boot the app against jsdom.
export function boot(doc) {
  const version = doc.getElementById('app-version');
  if (version) version.textContent = `v${APP_VERSION}`;

  const year = doc.getElementById('copyright-year');
  if (year) year.textContent = String(new Date().getFullYear());

  doc.documentElement.dataset.ready = 'true';
}

if (typeof document !== 'undefined') boot(document);
