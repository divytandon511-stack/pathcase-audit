import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { mkdtemp, mkdir, readdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { checkPaths } from 'pathcase-audit';
import { formatReport } from '../src/cli.js';

const bin = fileURLToPath(new URL('../bin/pathcase-audit.js', import.meta.url));
const run = (args, cwd) => spawnSync(process.execPath, [bin, ...args], { cwd, encoding: 'utf8', timeout: 10000 });
async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'pathcase-cli-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}

test('CLI help succeeds without scanning a nonexistent root', () => {
  const result = run(['--help', 'missing-pathcase-directory']);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /Usage: pathcase-audit/);
  assert.match(result.stdout, /Exit codes: 0 clean\/help, 1 collisions, 2/);
  assert.equal(result.stderr, '');
});

test('CLI scans its working directory and accepts a dash-prefixed root', async (t) => {
  const root = await fixture(t);
  await mkdir(join(root, '-tree'));
  for (const args of [[], ['--', '-tree']]) {
    const result = run(args, root);
    assert.equal(result.status, 0);
    assert.equal(result.stdout, 'No ASCII case collisions found.\n');
    assert.equal(result.stderr, '');
  }
});

test('CLI errors use stderr and exit 2 without a clean report', async (t) => {
  const root = await fixture(t);
  for (const args of [['missing'], ['--typo'], ['--ignore'], ['a', 'b']]) {
    const result = run(args, root);
    assert.equal(result.status, 2);
    assert.equal(result.stdout, '');
    assert.match(result.stderr, /^pathcase-audit: /);
    assert.doesNotMatch(result.stderr, /\n\s+at /);
  }
});

test('readable reports show original paths, reasons and escaped controls', () => {
  const report = formatReport(checkPaths(['Docs/a\n', 'docs/b\u001b']));
  assert.match(report, /Component 1 at "docs"/);
  assert.match(report, /Variants: "Docs", "docs"/);
  assert.match(report, /Reason: Distinct component spellings/);
  assert.ok(report.includes('"Docs/a\\n"'));
  assert.ok(report.includes('"docs/b\\u001b"'));
  assert.ok(!report.includes('\u001b'));
  assert.equal(report, formatReport(checkPaths(['docs/b\u001b', 'Docs/a\n'])));
});

test('CLI exits 1 for real collisions and honors replacement ignores', async (t) => {
  const root = await fixture(t);
  await mkdir(join(root, 'Docs'));
  await mkdir(join(root, 'docs'), { recursive: true });
  if ((await readdir(root)).length !== 2) { t.skip('Filesystem cannot store case variants'); return; }
  const result = run([], root);
  assert.equal(result.status, 1);
  assert.equal(result.stdout, formatReport(checkPaths(['Docs', 'docs'])));
  assert.equal(result.stderr, '');
  assert.equal(run(['--ignore', 'Docs'], root).status, 0);
});
