// Stage 2 — DOM: load the app shell in jsdom, check IDs are unique, every
// local reference resolves to a file in the repo, nothing is pulled from a
// third-party host, and the app boots without console errors.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { JSDOM } from 'jsdom';

const REF_ATTRS = [
  ['link[href]', 'href'],
  ['script[src]', 'src'],
  ['img[src]', 'src'],
  ['source[src]', 'src'],
  ['a[href]', 'href'],
];

// Plays practice sets through the real UI: every subject to the end, plus the
// pause and end-early paths.
function practiceFlow(doc, handle) {
  const problems = [];
  const root = doc.getElementById('practice');
  if (!root) return ['#practice is missing'];
  const $ = (sel) => root.querySelector(sel);
  const click = (sel) => { const el = $(sel); if (!el) throw new Error(`nothing matches ${sel}`); el.click(); };
  const expectItems = { PSAD: 3, MSTE: 5, HGE: 3 };

  try {
    for (const subject of Object.keys(expectItems)) {
      click(`input[name="practice-subject"][value="${subject}"]`);
      click('[data-role="start"]');
      let answered = 0;
      while ($('[data-role="check"]')) {
        if (!$('[data-role="check"]').disabled) problems.push(`${subject}: Check is enabled before a choice is made`);
        if (!$('.stem') || /NaN|undefined/.test(root.textContent)) problems.push(`${subject}: question did not render cleanly`);
        const options = root.querySelectorAll('input[name="practice-choice"]');
        if (options.length !== 4) problems.push(`${subject}: ${options.length} choices shown`);
        options[answered % 4].click();
        click('[data-role="check"]');
        if (root.querySelectorAll('.choice.is-correct').length !== 1) problems.push(`${subject}: checked item does not mark exactly one correct choice`);
        if (!$('.practice-feedback').textContent.trim()) problems.push(`${subject}: no feedback after checking`);
        if ([...root.querySelectorAll('input[name="practice-choice"]')].some((i) => !i.disabled)) problems.push(`${subject}: choices stay editable after checking`);
        answered++;
        if (answered > 50) throw new Error('set never ended');
        click('[data-role="next"]');
      }
      if (answered !== expectItems[subject]) problems.push(`${subject}: quick drill had ${answered} items, expected ${expectItems[subject]}`);
      if (!$('.practice-results')) { problems.push(`${subject}: no results screen`); continue; }
      const score = $('.stat dd').textContent;
      const right = root.querySelectorAll('.review li.is-correct').length;
      if (score !== `${right} / ${answered}`) problems.push(`${subject}: score "${score}" disagrees with the review list (${right} of ${answered})`);
      click('[data-role="again"]');
    }
    if (!/3 sets done/.test(root.textContent)) problems.push('history line does not show the 3 saved sets');

    // Pause hides the problem; ending early needs confirmation and scores blanks as wrong.
    click('[data-role="start"]');
    click('[data-role="pause"]');
    if ($('.stem')) problems.push('the problem stays visible while paused');
    click('[data-role="pause"]');
    if (!$('.stem')) problems.push('resume did not bring the problem back');
    root.querySelector('input[name="practice-choice"]').click(); // selected but never checked
    click('[data-role="end"]');
    if (!$('.practice-confirm') || $('.practice-results')) problems.push('End set must ask for confirmation first');
    click('[data-role="end-no"]');
    if ($('.practice-confirm')) problems.push('"Keep going" did not dismiss the confirmation');
    click('[data-role="end"]');
    click('[data-role="end-yes"]');
    if (!$('.practice-results') || !/^0 \/ /.test($('.stat dd').textContent)) problems.push('ending early should score unchecked items as wrong');
    click('[data-role="again"]');

    // ---- Exam mode: free navigation, nothing revealed before submitting ----
    const setsBefore = Number((root.textContent.match(/(\d+) sets? done/) || [])[1]);
    click('input[name="practice-subject"][value="PSAD"]');
    click('input[name="practice-mode"][value="exam"]');
    click('[data-role="start"]');
    if (doc.activeElement?.name !== 'practice-choice') problems.push('after Start, keyboard focus should be on the first choice');
    const revealed = () => $('.choice.is-correct') || $('.choice.is-wrong') || $('.solution') || $('.practice-feedback');
    if ($('[data-role="check"]')) problems.push('exam: there must be no Check button');
    if (root.querySelectorAll('[data-goto]').length !== 3) problems.push('exam: item navigator should list 3 items');
    root.querySelectorAll('input[name="practice-choice"]')[2].click();
    if (revealed()) problems.push('exam: answering revealed the key');
    click('[data-role="next"]');
    click('[data-role="prev"]');
    if (!root.querySelectorAll('input[name="practice-choice"]')[2].checked) problems.push('exam: the answer was lost when moving between items');
    root.querySelectorAll('input[name="practice-choice"]')[1].click(); // change the answer
    click('[data-goto="2"]');
    if (!/Item 3 of 3/.test($('.practice-progress').textContent)) problems.push('exam: the navigator did not jump to item 3');
    if (root.querySelectorAll('.item-nav-btn.is-answered').length !== 1) problems.push('exam: navigator should show exactly 1 answered item');
    click('[data-role="end"]');
    if (!/2 items are not answered/.test($('.practice-confirm').textContent)) problems.push('exam: submit confirmation should say 2 items are not answered');
    if (revealed()) problems.push('exam: the key is visible before submitting');
    click('[data-role="end-yes"]');
    if (!$('.practice-results')) problems.push('exam: no results after submitting');
    else {
      if (!/ \/ 3$/.test($('.stat dd').textContent)) problems.push('exam: score should be out of 3');
      if (root.querySelectorAll('.review li').length !== 3) problems.push('exam: review should list 3 items');
      if (root.querySelectorAll('.solution-fold .solution li').length === 0) problems.push('exam: results should include the worked solution');
      if (!/not answered/.test($('.review').textContent)) problems.push('exam: unanswered items should be labelled in the review');
    }
    click('[data-role="again"]');
    if (!new RegExp(`${setsBefore + 1} sets done`).test(root.textContent)) problems.push('exam: the submitted set was not saved to history');

    // Discarding saves nothing.
    click('[data-role="start"]');
    root.querySelector('input[name="practice-choice"]').click();
    click('[data-role="end"]');
    click('[data-role="discard"]');
    if (!$('[data-role="start"]') || !new RegExp(`${setsBefore + 1} sets done`).test(root.textContent)) problems.push('discard should return to setup without saving');

    // ---- My mistakes: draws only missed problem types; correct answers clear them ----
    if (!handle) throw new Error('boot() did not return the practice handle');
    const source = (v) => $(`input[name="practice-source"][value="${v}"]`);
    const toFix = () => Number(($('input[name="practice-source"][value="mistakes"] + span small').textContent.match(/\d+/) || [0])[0]);
    const before = toFix();
    if (before === 0 || source('mistakes').disabled) problems.push('mistakes: PSAD should have items to fix after the blank exam');
    const missedTypes = new Set(handle.store.getMistakes().map((m) => m.templateId));
    click('input[name="practice-drill"][value="full"]');
    source('mistakes').click();
    click('[data-role="start"]');
    const live = handle.getState().set;
    if (live.units.some((u) => !missedTypes.has(u.templateId))) problems.push('mistakes: the set drew a problem type that was not missed');
    // Answer every item with the keyed choice, then submit.
    live.questions.forEach(({ unit, item }, i) => {
      if (i > 0) click('[data-role="next"]');
      root.querySelectorAll('input[name="practice-choice"]')[live.units[unit].instance.items[item].answerIndex].click();
    });
    click('[data-role="end"]');
    click('[data-role="end-yes"]');
    if (!/^9 \/ 9$/.test($('.stat dd').textContent)) problems.push(`mistakes: keyed answers scored ${$('.stat dd').textContent}, expected 9 / 9`);
    if (!/cleared from your mistakes/.test($('[data-role="mistake-note"]').textContent)) problems.push('mistakes: results should say items were cleared');
    click('[data-role="again"]');
    const psadTypes = new Set(live.units.map((u) => u.templateId));
    const stillPsad = handle.store.getMistakes().filter((m) => psadTypes.has(m.templateId)).length;
    if (stillPsad !== 0) problems.push(`mistakes: ${stillPsad} PSAD items remain after answering every one correctly`);
    if (toFix() !== 0 || !source('mistakes').disabled || !source('all').checked) problems.push('mistakes: with nothing left to fix, the option should be disabled and "All" selected');

    // Avoid-repeat: every problem shown so far was recorded as seen.
    if (handle.store.getSeen().size < 8) problems.push(`avoid-repeat: only ${handle.store.getSeen().size} problems recorded as seen`);

    click('input[name="practice-drill"][value="quick"]');
    click('input[name="practice-mode"][value="practice"]');
  } catch (err) {
    problems.push(`practice flow broke: ${err.message}`);
  }
  return problems;
}

// Progress: the dashboard agrees with the stored history; Reset KPIs and
// backup restore need confirmation and keep both screens in step.
function progressFlow(doc, handles) {
  const problems = [];
  const root = doc.getElementById('progress');
  if (!root) return ['#progress is missing'];
  const practice = doc.getElementById('practice');
  const { store } = handles.practice;
  const $ = (sel) => root.querySelector(sel);
  const click = (sel) => { const el = $(sel); if (!el) throw new Error(`nothing matches ${sel}`); el.click(); };
  const stat = (n) => root.querySelectorAll('.stat dd')[n]?.textContent;
  try {
    const history = store.getHistory();
    const correct = history.reduce((a, h) => a + h.correct, 0);
    const total = history.reduce((a, h) => a + h.total, 0);
    if (history.length < 5) problems.push(`progress: expected the practice run to leave at least 5 sets, found ${history.length}`);
    if (stat(0) !== String(history.length)) problems.push(`progress: shows ${stat(0)} sets, history has ${history.length} (dashboard did not refresh after a set)`);
    if (stat(1) !== `${correct} / ${total}`) problems.push(`progress: shows "${stat(1)}" correct, history says ${correct} / ${total}`);
    if (/NaN|undefined|Infinity/.test(root.textContent)) problems.push('progress: dashboard did not render cleanly');
    if (root.querySelectorAll('[data-role="subject-table"] tbody tr').length !== 3) problems.push('progress: subject table should have 3 rows');
    const topicRows = [...root.querySelectorAll('[data-role="topic-table"] tbody tr')];
    const topicSum = topicRows.reduce((a, tr) => a + Number(tr.lastElementChild.textContent.match(/\/ (\d+)/)[1]), 0);
    const topicsDone = new Set(history.flatMap((h) => Object.keys(h.topics || {}))).size; // one row per topic practised
    if (topicRows.length !== topicsDone || topicsDone < 3 || topicSum !== total) problems.push(`progress: topic table has ${topicRows.length} rows covering ${topicSum} items, expected ${topicsDone} rows (at least 3) and ${total} items`);
    if (!$('[data-role="advice"] li')) problems.push('progress: no study recommendations after sets with wrong answers');

    const backup = handles.progress.backupText();

    // A file that is not a backup is refused, with a reason, and changes nothing.
    for (const text of ['{not json', '{"app":"other"}']) {
      if (handles.progress.offerRestore(text) || $('.practice-confirm')) problems.push('progress: a bad backup file was offered for restore');
      if (!$('[data-role="backup-message"]').textContent.trim()) problems.push('progress: no reason shown for a refused backup file');
    }
    if (store.getHistory().length !== history.length) problems.push('progress: a refused backup changed the history');

    // Reset KPIs asks first; cancel keeps everything.
    const mistakesBefore = store.getMistakes().length;
    click('[data-role="reset"]');
    if (!$('.practice-confirm') || store.getHistory().length !== history.length) problems.push('progress: Reset KPIs must ask for confirmation first');
    click('[data-role="confirm-no"]');
    if ($('.practice-confirm') || store.getHistory().length !== history.length) problems.push('progress: Cancel should leave the history alone');
    click('[data-role="reset"]');
    click('[data-role="reset-yes"]');
    if (store.getHistory().length !== 0 || !$('.progress-empty')) problems.push('progress: Reset KPIs did not clear the dashboard');
    if (store.getMistakes().length !== mistakesBefore) problems.push('progress: Reset KPIs must keep the mistakes list');
    if (!$('[data-role="reset"]').disabled) problems.push('progress: Reset KPIs should be disabled with no sets');
    if (/sets? done/.test(practice.textContent)) problems.push('progress: the practice screen still shows the old history after a reset');

    // Restore asks first, then brings everything back on both screens.
    if (!handles.progress.offerRestore(backup) || !$('.practice-confirm')) problems.push('progress: a sound backup should ask before replacing');
    if (store.getHistory().length !== 0) problems.push('progress: restore must not write before it is confirmed');
    click('[data-role="restore-yes"]');
    if (JSON.stringify(store.getHistory()) !== JSON.stringify(history)) problems.push('progress: restored history differs from the backup');
    if (stat(0) !== String(history.length) || stat(1) !== `${correct} / ${total}`) problems.push('progress: dashboard does not match the restored backup');
    if (!new RegExp(`${history.length} sets done`).test(practice.textContent)) problems.push('progress: the practice screen did not pick up the restored history');
  } catch (err) {
    problems.push(`progress flow broke: ${err.message}`);
  }
  return problems;
}

// App shell: one view at a time, the theme switch, the manifest, the About page.
function shellFlow(doc, handles, root) {
  const problems = [];
  const win = doc.defaultView;
  try {
    const views = [...doc.querySelectorAll('[data-view]')];
    const shown = () => views.filter((v) => !v.hidden).map((v) => v.dataset.view).join(',');
    const link = (name) => doc.querySelector(`[data-view-link="${name}"]`);
    if (views.length !== 4) problems.push(`shell: ${views.length} views, expected 4`);
    if (shown() !== 'practice' || link('practice').getAttribute('aria-current') !== 'page') problems.push(`shell: should open on Practice, shows "${shown()}"`);
    for (const v of views) {
      const a = link(v.dataset.view);
      if (!a) { problems.push(`shell: no tab for the ${v.dataset.view} view`); continue; }
      if (a.getAttribute('href') !== `#${v.id}`) problems.push(`shell: the ${v.dataset.view} tab does not link to its view`);
      a.click();
      if (shown() !== v.dataset.view) problems.push(`shell: the ${v.dataset.view} tab shows "${shown()}"`);
      if (doc.querySelectorAll('.tabs [aria-current="page"]').length !== 1 || a.getAttribute('aria-current') !== 'page') problems.push(`shell: exactly the ${v.dataset.view} tab should be marked current`);
      if (!v.querySelector('h1')) problems.push(`shell: the ${v.dataset.view} view has no h1`);
    }
    handles.views.show('nonsense');
    if (shown() !== 'practice') problems.push('shell: an unknown view name should fall back to Practice');

    // Theme: Auto has no attribute; Day and Night set it, are remembered, and move the browser colour.
    const html = doc.documentElement;
    const radio = (v) => doc.querySelector(`input[name="theme"][value="${v}"]`);
    const colours = () => [...doc.querySelectorAll('meta[name="theme-color"]')].map((m) => m.getAttribute('content')).join(',');
    if (html.dataset.theme || !radio('auto').checked) problems.push('theme: should start on Auto');
    const auto = colours();
    radio('night').click();
    if (html.dataset.theme !== 'night' || win.localStorage.getItem('ramboo-cele.theme') !== 'night' || colours() !== '#0f1318,#0f1318') problems.push('theme: Night was not applied, saved, or sent to the browser colour');
    radio('day').click();
    if (html.dataset.theme !== 'day' || colours() !== '#e6e9e4,#e6e9e4') problems.push('theme: Day was not applied');
    radio('auto').click();
    if (html.dataset.theme || colours() !== auto || win.localStorage.getItem('ramboo-cele.theme') !== 'auto') problems.push('theme: Auto should remove the forced theme');
    const init = fs.readFileSync(path.join(root, 'js/theme-init.js'), 'utf8');
    if (!init.includes("'ramboo-cele.theme'")) problems.push('theme: js/theme-init.js must read the same storage key as js/ui/theme.js');
    const tokens = fs.readFileSync(path.join(root, 'css/tokens.css'), 'utf8');
    const vars = (block) => [...block.matchAll(/(--[a-z-]+):\s*([^;]+);/g)].map((m) => `${m[1]}=${m[2].trim()}`).sort().join('|');
    const media = tokens.match(/:root:not\(\[data-theme="day"\]\) \{([^}]*)\}/);
    const forced = tokens.match(/:root\[data-theme="night"\] \{([^}]*)\}/);
    if (!media || !forced || vars(media[1]) !== vars(forced[1])) problems.push('theme: the two Night blocks in css/tokens.css differ');

    // A backup holds progress only; the theme is a per-device setting.
    if (/theme/.test(handles.progress.backupText())) problems.push('theme: the backup should hold progress only');

    // About: same disclaimer as the footer; version shown.
    const text = (id) => doc.getElementById(id)?.textContent.replace(/\s+/g, ' ').trim();
    if (!text('disclaimer') || text('about-disclaimer') !== text('disclaimer')) problems.push('about: the disclaimer must match the footer disclaimer word for word');
    if (text('about-version') !== text('app-version')) problems.push('about: version differs from the app bar');
    if (/actual board question|official prc key/i.test(doc.body.textContent.replace(/not an official PRC key|not past board questions/gi, ''))) problems.push('about: must not claim actual board questions or an official key');

    // Fonts: every face points at a file in the repo, and every weight the CSS asks for has a face.
    const fontCss = fs.readFileSync(path.join(root, 'css/fonts.css'), 'utf8');
    const faces = [...fontCss.matchAll(/@font-face \{([^}]*)\}/g)].map((m) => ({
      family: (m[1].match(/font-family:\s*"([^"]+)"/) || [])[1],
      weight: (m[1].match(/font-weight:\s*(\d+)/) || [])[1],
      url: (m[1].match(/url\("([^"]+)"\)/) || [])[1],
    }));
    if (faces.length === 0) problems.push('fonts: css/fonts.css declares no faces');
    for (const face of faces) {
      if (!face.url || /^([a-z]+:)?\/\//i.test(face.url) || !fs.existsSync(path.join(root, 'css', face.url))) problems.push(`fonts: ${face.family} ${face.weight} points at "${face.url}", which is not a file in the repo`);
    }
    if (!fs.existsSync(path.join(root, 'fonts/OFL.txt'))) problems.push('fonts: the licence file fonts/OFL.txt is missing');
    const have = (family, weight) => faces.some((x) => x.family === family && x.weight === weight);
    for (const w of ['400', '600', '700']) if (!have('Barlow', w)) problems.push(`fonts: no Barlow ${w} face`);
    for (const w of ['600', '700']) if (!have('Barlow Condensed', w)) problems.push(`fonts: no Barlow Condensed ${w} face`);
    const used = new Set();
    for (const file of ['base.css', 'components.css', 'figures.css']) for (const m of fs.readFileSync(path.join(root, 'css', file), 'utf8').matchAll(/font-weight:\s*(\d+)/g)) used.add(m[1]);
    for (const w of used) if (!['400', '600', '700'].includes(w)) problems.push(`fonts: the CSS uses weight ${w}, which has no self-hosted face`);

    // TERMS is listed but cannot be picked yet.
    const terms = doc.querySelector('#practice input[name="practice-subject"][value="TERMS"]');
    if (!terms || !terms.disabled) problems.push('shell: TERMS should be listed in Practice and disabled');

    // Manifest: relative start and scope (GitHub Pages sub-path), icons exist at their stated size.
    const href = doc.querySelector('link[rel="manifest"]')?.getAttribute('href');
    const manifest = JSON.parse(fs.readFileSync(path.join(root, href), 'utf8'));
    if (manifest.start_url !== './' || manifest.scope !== './') problems.push('manifest: start_url and scope must be "./"');
    if (manifest.display !== 'standalone' || !manifest.name || !manifest.short_name || manifest.short_name.length > 12) problems.push('manifest: needs name, a short_name of at most 12 characters, and display standalone');
    const sizes = new Set();
    for (const icon of manifest.icons || []) {
      const file = path.join(root, icon.src);
      if (!fs.existsSync(file)) { problems.push(`manifest: icon ${icon.src} does not exist`); continue; }
      if (icon.type === 'image/png') {
        const png = fs.readFileSync(file);
        const size = `${png.readUInt32BE(16)}x${png.readUInt32BE(20)}`;
        if (size !== icon.sizes) problems.push(`manifest: ${icon.src} is ${size}, stated ${icon.sizes}`);
        sizes.add(`${icon.sizes}/${icon.purpose}`);
      }
    }
    for (const need of ['192x192/any', '512x512/any', '512x512/maskable']) if (!sizes.has(need)) problems.push(`manifest: no ${need} PNG icon`);
  } catch (err) {
    problems.push(`shell flow broke: ${err.message}`);
  }
  return problems;
}

export async function run(root) {
  const failures = [];
  let checked = 0;

  const htmlPath = path.join(root, 'index.html');
  if (!fs.existsSync(htmlPath)) return { checked, failures: ['index.html is missing'] };
  const dom = new JSDOM(fs.readFileSync(htmlPath, 'utf8'), { url: 'https://localhost/' });
  const doc = dom.window.document;

  // IDs unique
  const seen = new Map();
  for (const el of doc.querySelectorAll('[id]')) {
    checked++;
    seen.set(el.id, (seen.get(el.id) || 0) + 1);
  }
  for (const [id, n] of seen) if (n > 1) failures.push(`duplicate id "${id}" (${n} elements)`);

  // In-page references resolve
  for (const el of doc.querySelectorAll('[for], [aria-labelledby], [aria-describedby], [aria-controls]')) {
    for (const attr of ['for', 'aria-labelledby', 'aria-describedby', 'aria-controls']) {
      for (const id of (el.getAttribute(attr) || '').split(/\s+/).filter(Boolean)) {
        checked++;
        if (!seen.has(id)) failures.push(`${attr}="${id}" points at a missing id`);
      }
    }
  }

  // File references resolve; scripts/styles/images must be local
  for (const [selector, attr] of REF_ATTRS) {
    for (const el of doc.querySelectorAll(selector)) {
      const ref = el.getAttribute(attr);
      checked++;
      if (ref.startsWith('#')) {
        if (ref.length > 1 && !seen.has(ref.slice(1))) failures.push(`link ${ref} points at a missing id`);
        continue;
      }
      if (/^(mailto:|tel:|data:)/.test(ref)) continue;
      if (/^([a-z]+:)?\/\//i.test(ref)) {
        if (el.tagName !== 'A') failures.push(`<${el.tagName.toLowerCase()}> loads from a remote host: ${ref}`);
        continue;
      }
      if (ref.startsWith('/')) {
        failures.push(`root-absolute path "${ref}" breaks under the GitHub Pages sub-path; use a relative path`);
        continue;
      }
      const file = path.join(root, ref.split(/[?#]/)[0]);
      if (!fs.existsSync(file)) failures.push(`${attr}="${ref}" does not exist`);
    }
  }

  // Boot the app against this document; no console errors or warnings allowed
  const captured = [];
  const original = { error: console.error, warn: console.warn };
  console.error = (...args) => captured.push(`console.error: ${args.join(' ')}`);
  console.warn = (...args) => captured.push(`console.warn: ${args.join(' ')}`);
  try {
    const main = await import(pathToFileURL(path.join(root, 'js/main.js')).href);
    checked++;
    if (typeof main.boot !== 'function') {
      failures.push('js/main.js must export boot(document)');
    } else {
      const handles = main.boot(doc);
      if (doc.documentElement.dataset.ready !== 'true') failures.push('boot() did not mark the document ready');
      // Mounted components add markup; IDs must still be unique and labels resolve.
      const after = new Map();
      for (const el of doc.querySelectorAll('[id]')) after.set(el.id, (after.get(el.id) || 0) + 1);
      for (const [id, n] of after) { checked++; if (n > 1) failures.push(`after boot: duplicate id "${id}" (${n} elements)`); }
      for (const el of doc.querySelectorAll('label[for], output[for]')) {
        checked++;
        if (!after.has(el.getAttribute('for'))) failures.push(`after boot: for="${el.getAttribute('for')}" points at a missing id`);
      }
      failures.push(...practiceFlow(doc, handles && handles.practice));
      checked++;
      failures.push(...progressFlow(doc, handles));
      checked++;
      failures.push(...shellFlow(doc, handles, root));
      checked++;

      const { APP_VERSION } = await import(pathToFileURL(path.join(root, 'js/version.js')).href);
      const shown = doc.getElementById('app-version')?.textContent;
      checked++;
      if (shown !== `v${APP_VERSION}`) failures.push(`version badge shows "${shown}", expected "v${APP_VERSION}"`);
      const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
      checked++;
      if (pkg.version !== APP_VERSION) failures.push(`package.json version ${pkg.version} != APP_VERSION ${APP_VERSION}`);
    }
  } catch (err) {
    failures.push(`app failed to boot: ${err.stack || err}`);
  } finally {
    console.error = original.error;
    console.warn = original.warn;
  }
  failures.push(...captured);

  return { checked, failures };
}
