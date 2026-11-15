import { APP_VERSION } from './version.js';
import { mountBeamLive } from './live/beamSimplePointLive.js';
import { mountSampleProblem } from './ui/sampleProblem.js';
import { mountPractice } from './ui/practice.js';
import { mountProgress } from './ui/progress.js';
import { TEMPLATES } from './engine/bank.js';
import { createStore, browserStorage } from './engine/storage.js';

// Wires the shell to a document. Takes the document as an argument so the
// harness (tests/stage2-dom.js) can boot the app against jsdom.
export function boot(doc) {
  const version = doc.getElementById('app-version');
  if (version) version.textContent = `v${APP_VERSION}`;

  const year = doc.getElementById('copyright-year');
  if (year) year.textContent = String(new Date().getFullYear());

  const handles = {};
  const win = doc.defaultView;
  const store = createStore(browserStorage(win)); // one store, shared by every screen
  const practice = doc.getElementById('practice');
  if (practice) {
    handles.practice = mountPractice(practice, { templates: TEMPLATES, store, win, onSaved: () => handles.progress?.refresh() });
  }
  const progress = doc.getElementById('progress');
  if (progress) {
    handles.progress = mountProgress(progress, { templates: TEMPLATES, store, win, onChange: () => handles.practice?.refresh() });
  }

  const live = doc.getElementById('live-beam');
  if (live) mountBeamLive(live);

  const sample = doc.getElementById('sample-problem');
  if (sample) mountSampleProblem(sample, TEMPLATES);

  doc.documentElement.dataset.ready = 'true';
  return handles;
}

if (typeof document !== 'undefined') boot(document);
