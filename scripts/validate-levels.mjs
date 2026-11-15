// Validates every level JSON in public/assets/levels against the brief's rules.
// Run with `npm run validate:levels`; exits non-zero if any level fails.
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateLevel, formatReport } from '../src/level/validateLevel.js';

const dir = resolve(dirname(fileURLToPath(import.meta.url)), '../public/assets/levels');
let failed = 0;
for (const file of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
  const report = validateLevel(JSON.parse(readFileSync(join(dir, file), 'utf8')));
  console.log(formatReport(file, report));
  if (report.errors.length) failed++;
}
process.exit(failed ? 1 : 0);
