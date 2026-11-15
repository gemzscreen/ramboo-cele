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
