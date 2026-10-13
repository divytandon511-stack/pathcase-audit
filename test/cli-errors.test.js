import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { mkdtemp, mkdir, writeFile, chmod, rm, symlink, open } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const bin = fileURLToPath(new URL('../bin/pathcase-audit.js', import.meta.url));
const run = (args, cwd) => spawnSync(process.execPath, [bin, ...args], { cwd, encoding: 'utf8', timeout: 10000 });
async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'pathcase-cli-errors-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}
function assertFailure(result, message) {
  assert.equal(result.status, 2);
  assert.equal(result.stdout, '');
  assert.match(result.stderr, /^pathcase-audit: /);
  assert.match(result.stderr, message);
  assert.equal(result.stderr.trimEnd().split('\n').length, 1);
}

test('CLI rejects files and symlinks as scan roots in both output modes', async (t) => {
  const root = await fixture(t);
  await writeFile(join(root, 'file'), '');
  for (const mode of [[], ['--json']]) assertFailure(run(['file', ...mode], root), /real directory/);
  try { await symlink(root, join(root, 'link'), 'dir'); }
  catch (error) {
    if (error.code === 'EPERM') { t.skip('Symlink privilege unavailable'); return; }
    throw error;
  }
  for (const mode of [[], ['--json']]) assertFailure(run(['link', ...mode], root), /real directory/);
});

test('CLI permission errors never produce partial reports and ignores are respected', async (t) => {
  if (process.platform === 'win32' || process.getuid?.() === 0) {
    t.skip('Requires an unprivileged POSIX account'); return;
  }
  const root = await fixture(t);
  const locked = join(root, 'locked');
  await mkdir(locked);
  await writeFile(join(root, 'readable'), '');
  await chmod(locked, 0);
  try {
    for (const mode of [[], ['--json']]) assertFailure(run(['.', ...mode], root), /EACCES/);
    const ignored = run(['--json', '--ignore', 'locked'], root);
    assert.equal(ignored.status, 0);
    assert.equal(ignored.stderr, '');
    assert.deepEqual(JSON.parse(ignored.stdout), { hasCollisions: false, collisions: [] });
  } finally { await chmod(locked, 0o700); }
});

test('CLI rejects an unrepresentable on-disk name in both modes', async (t) => {
  if (process.platform === 'win32') { t.skip('Backslash is a Windows separator'); return; }
  const root = await fixture(t);
  await writeFile(join(root, 'literal\\name'), '');
  for (const mode of [[], ['--json']]) assertFailure(run(mode, root), /literal backslash/);
});

test('CLI quotes terminal control characters in error messages', async (t) => {
  const root = await fixture(t);
  const result = run(['--unknown\n\u001b[31m', '--json'], root);
  assertFailure(result, /unknown/);
  assert.ok(!result.stderr.includes('\u001b'));
  assert.ok(result.stderr.includes('\\n'));
  assert.ok(result.stderr.includes('\\u001b'));
});


test('CLI handles an actual unwritable stdout descriptor without a stack trace', async (t) => {
  if (process.platform === 'win32') { t.skip('Requires POSIX descriptor access modes'); return; }
  const root = await fixture(t);
  const path = join(root, 'output');
  await writeFile(path, '');
  const file = await open(path, 'r');
  try {
    const result = spawnSync(process.execPath, [bin, '--help'], {
      encoding: 'utf8', timeout: 10000, stdio: ['ignore', file.fd, 'pipe'],
    });
    assert.equal(result.status, 2);
    assert.match(result.stderr, /^pathcase-audit: /);
    assert.doesNotMatch(result.stderr, /Unhandled|\n\s+at /);
  } finally { await file.close(); }
});
