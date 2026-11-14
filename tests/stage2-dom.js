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
      main.boot(doc);
      if (doc.documentElement.dataset.ready !== 'true') failures.push('boot() did not mark the document ready');
      // Mounted components add markup; IDs must still be unique and labels resolve.
      const after = new Map();
      for (const el of doc.querySelectorAll('[id]')) after.set(el.id, (after.get(el.id) || 0) + 1);
      for (const [id, n] of after) { checked++; if (n > 1) failures.push(`after boot: duplicate id "${id}" (${n} elements)`); }
      for (const el of doc.querySelectorAll('label[for], output[for]')) {
        checked++;
        if (!after.has(el.getAttribute('for'))) failures.push(`after boot: for="${el.getAttribute('for')}" points at a missing id`);
      }
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
