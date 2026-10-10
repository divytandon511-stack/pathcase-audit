import { readFile } from 'node:fs/promises';
import { checkPaths } from 'pathcase-audit';

// Check destination names before an importer creates files or directories.
// The example only reads this manifest; it never writes the proposed paths.
const manifest = JSON.parse(await readFile(new URL('./import-manifest.json', import.meta.url), 'utf8'));
const result = checkPaths(manifest.map((entry) => entry.destination));
console.log(JSON.stringify(result, null, 2));

// A calling script can stop the import when this process returns nonzero.
process.exitCode = result.hasCollisions ? 1 : 0;
