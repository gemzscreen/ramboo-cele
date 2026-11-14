// Stage 1 — Syntax: `node --check` on every script/module, plus a parse of
// every JSON file.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { walk } from './util.js';

export async function run(root) {
  const failures = [];
  const scripts = walk(root, '.', /\.(js|mjs)$/);
  const json = walk(root, '.', /\.json$/).filter((f) => f !== 'package-lock.json');

  for (const file of scripts) {
    const res = spawnSync(process.execPath, ['--check', file], { cwd: root, encoding: 'utf8' });
    if (res.status !== 0) failures.push(`${file}: ${res.stderr.trim().split('\n').slice(0, 4).join(' | ')}`);
  }
  for (const file of json) {
    try {
      JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
    } catch (err) {
      failures.push(`${file}: ${err.message}`);
    }
  }
  return { checked: scripts.length + json.length, failures };
}
