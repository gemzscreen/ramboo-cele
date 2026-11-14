import { APP_VERSION } from './version.js';
import { mountBeamLive } from './live/beamSimplePointLive.js';
import { mountSampleProblem } from './ui/sampleProblem.js';
import { TEMPLATES } from './engine/bank.js';

// Wires the shell to a document. Takes the document as an argument so the
// harness (tests/stage2-dom.js) can boot the app against jsdom.
export function boot(doc) {
  const version = doc.getElementById('app-version');
  if (version) version.textContent = `v${APP_VERSION}`;

  const year = doc.getElementById('copyright-year');
  if (year) year.textContent = String(new Date().getFullYear());

  const live = doc.getElementById('live-beam');
  if (live) mountBeamLive(live);

  const sample = doc.getElementById('sample-problem');
  if (sample) mountSampleProblem(sample, TEMPLATES);

  doc.documentElement.dataset.ready = 'true';
}

if (typeof document !== 'undefined') boot(document);
