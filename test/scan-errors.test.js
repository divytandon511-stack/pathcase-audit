import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, chmod, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { scanDirectory } from 'pathcase-audit';
import { collectPaths } from '../src/walk.js';

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'pathcase-errors-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}

function needsPermissions(t) {
  if (process.platform === 'win32' || process.getuid?.() === 0) {
    t.skip('Requires an unprivileged POSIX account');
    return false;
  }
  return true;
}

test('unreadable subtree rejects the entire scan with its filesystem error', async (t) => {
  if (!needsPermissions(t)) return;
  const root = await fixture(t);
  const locked = join(root, 'locked');
  await mkdir(locked);
  await writeFile(join(root, 'readable.txt'), '');
  await chmod(locked, 0);
  try {
    await assert.rejects(scanDirectory(root), (error) => {
      assert.equal(error.code, 'EACCES');
      assert.equal(error.path, locked);
      return true;
    });
  } finally { await chmod(locked, 0o700); }
});

test('an explicitly ignored unreadable directory is not opened', async (t) => {
  if (!needsPermissions(t)) return;
  const root = await fixture(t);
  const locked = join(root, 'locked');
  await mkdir(locked);
  await chmod(locked, 0);
  try {
    assert.deepEqual(await scanDirectory(root, { ignore: ['locked'] }), {
      hasCollisions: false, collisions: [],
    });
  } finally { await chmod(locked, 0o700); }
});

test('a directory symlink is kept by name even when its basename is ignored', async (t) => {
  const root = await fixture(t);
  const external = await fixture(t);
  await writeFile(join(external, 'outside.txt'), '');
  try { await symlink(external, join(root, 'build'), 'dir'); }
  catch (error) {
    if (error.code === 'EPERM') { t.skip('Symlink privilege unavailable'); return; }
    throw error;
  }
  assert.deepEqual(await collectPaths(root, { ignore: ['build'] }), ['build']);
});
