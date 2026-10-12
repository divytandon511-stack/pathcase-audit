import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm, symlink } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { collectPaths } from '../src/walk.js';

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'pathcase-walk-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}

test('walk includes empty directories, nested files and hidden names', async (t) => {
  const root = await fixture(t);
  await mkdir(join(root, 'docs'));
  await mkdir(join(root, 'empty'));
  await writeFile(join(root, 'docs', 'Guide.md'), '');
  await writeFile(join(root, '.hidden'), '');
  assert.deepEqual(await collectPaths(root), ['.hidden', 'docs', 'docs/Guide.md', 'empty']);
});

test('walk skips default ignored directories and their contents', async (t) => {
  const root = await fixture(t);
  for (const name of ['.git', 'node_modules']) {
    await mkdir(join(root, name));
    await writeFile(join(root, name, 'file'), '');
  }
  assert.deepEqual(await collectPaths(root), []);
});

test('walk rejects invalid roots, files and missing directories', async (t) => {
  const root = await fixture(t);
  await writeFile(join(root, 'file'), '');
  for (const value of ['', null, 12, 'a\0b']) await assert.rejects(collectPaths(value), TypeError);
  await assert.rejects(collectPaths(join(root, 'file')), /real directory/);
  await assert.rejects(collectPaths(join(root, 'missing')), { code: 'ENOENT' });
});

test('walk lists loop and broken symlinks without following them', async (t) => {
  const root = await fixture(t);
  try {
    await symlink(root, join(root, 'loop'), 'dir');
    await symlink(join(root, 'missing'), join(root, 'broken'), 'file');
  } catch (error) {
    if (error.code === 'EPERM') { t.skip('Symlink privilege unavailable'); return; }
    throw error;
  }
  assert.deepEqual(await collectPaths(root), ['broken', 'loop']);
  await assert.rejects(collectPaths(join(root, 'loop')), /real directory/);
});

test('walk fails explicitly on POSIX literal backslash names', async (t) => {
  if (process.platform === 'win32') { t.skip('Backslash is a Windows separator'); return; }
  const root = await fixture(t);
  await writeFile(join(root, 'literal\\name'), '');
  await assert.rejects(collectPaths(root), /literal backslash/);
});
