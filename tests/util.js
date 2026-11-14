import fs from 'node:fs';
import path from 'node:path';

const SKIP_DIRS = new Set(['node_modules', '.git']);

// All files under `dir` (relative to root) whose name matches `pattern`.
export function walk(root, dir, pattern) {
  const out = [];
  const abs = path.join(root, dir);
  if (!fs.existsSync(abs)) return out;
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) out.push(...walk(root, rel, pattern));
    } else if (pattern.test(entry.name)) {
      out.push(rel);
    }
  }
  return out.sort();
}
