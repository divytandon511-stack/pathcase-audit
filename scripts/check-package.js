import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { posix, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const npm = process.env.npm_execpath;
assert.ok(npm, 'Run this check through npm run check:package');
const packed = JSON.parse(execFileSync(process.execPath, [npm, 'pack', '--dry-run', '--json', '--ignore-scripts'], {
  cwd: root, encoding: 'utf8',
}))[0];
const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const names = new Set(packed.files.map((file) => file.path));
for (const required of [manifest.main, manifest.types, ...Object.values(manifest.bin),
  'README.md', 'LICENSE', 'package.json', 'docs/api.md', 'docs/path-contract.md',
  'examples/proposed-paths.js', 'examples/check-import.js', 'examples/import-manifest.json']) {
  assert.ok(names.has(required.replace(/^\.\//, '')), `Missing packed file: ${required}`);
}
for (const name of names) {
  assert.match(name, /^(src\/|bin\/|docs\/|examples\/|README\.md$|LICENSE$|package\.json$)/, `Unexpected packed file: ${name}`);
}
// Links must work inside the tarball too, not only in the repository.
for (const name of names) {
  if (!name.endsWith('.md')) continue;
  const markdown = readFileSync(join(root, name), 'utf8');
  for (const match of markdown.matchAll(/\]\(([^)]+)\)/g)) {
    const target = match[1];
    if (/^[a-z][a-z0-9+.-]*:/i.test(target) || target.startsWith('#')) continue;
    const path = decodeURIComponent(target.split('#')[0]);
    const resolved = posix.normalize(posix.join(posix.dirname(name), path));
    assert.ok(names.has(resolved), `Broken packed documentation link: ${name} -> ${target}`);
  }
}
const executable = packed.files.find((file) => file.path === 'bin/pathcase-audit.js');
if (process.platform !== 'win32') assert.ok(executable.mode & 0o111, 'CLI must be executable');
assert.equal(packed.name, manifest.name);
assert.equal(packed.version, manifest.version);
console.log(`Package contents verified: ${names.size} files, ${packed.unpackedSize} unpacked bytes.`);
