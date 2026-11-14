// Quality harness runner (ROADMAP §6).
//   node tests/run.js        -> stages 1-3
//   node tests/run.js 2      -> a single stage
// Stage 4 (originality) is not wired yet; it needs ../ramboo-private/ and
// will run locally only.
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const STAGES = {
  1: { name: 'Syntax', file: './stage1-syntax.js' },
  2: { name: 'DOM', file: './stage2-dom.js' },
  3: { name: 'Models and templates', file: './stage3-models.js' },
};

const wanted = process.argv.slice(2);
const ids = wanted.length ? wanted : Object.keys(STAGES);
let failed = false;

for (const id of ids) {
  const stage = STAGES[id];
  if (!stage) {
    console.error(`Unknown stage "${id}". Available: ${Object.keys(STAGES).join(', ')}`);
    process.exit(2);
  }
  let result;
  try {
    const { run } = await import(stage.file);
    result = await run(ROOT);
  } catch (err) {
    result = { checked: 0, failures: [`stage crashed: ${err.stack || err}`], notes: [] };
  }
  const ok = result.failures.length === 0;
  failed ||= !ok;
  console.log(`${ok ? 'PASS' : 'FAIL'}  Stage ${id} — ${stage.name} (${result.checked} checked)`);
  for (const note of result.notes || []) console.log(`      note: ${note}`);
  for (const failure of result.failures) console.log(`      ✗ ${failure}`);
}

process.exit(failed ? 1 : 0);
