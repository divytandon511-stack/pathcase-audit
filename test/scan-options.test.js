import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { collectPaths } from '../src/walk.js';
import { scanDirectory } from 'pathcase-audit';

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'pathcase-options-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}

test('explicit ignores replace defaults and empty ignores include all directories', async (t) => {
  const root = await fixture(t);
  for (const name of ['.git', 'node_modules', 'build']) await mkdir(join(root, name));
  assert.deepEqual(await collectPaths(root, { ignore: ['build'] }), ['.git', 'node_modules']);
  assert.deepEqual(await collectPaths(root, { ignore: [] }), ['.git', 'build', 'node_modules']);
});

test('ignore names apply at every depth and only to directories', async (t) => {
  const root = await fixture(t);
  await mkdir(join(root, 'parent', 'build'), { recursive: true });
  await mkdir(join(root, 'Build'));
  await writeFile(join(root, 'build-file'), '');
  assert.deepEqual(await collectPaths(root, { ignore: ['build', 'build-file'] }), ['Build', 'build-file', 'parent']);
});

test('invalid options reject before filesystem access', async () => {
  for (const options of [null, [], false, { ignored: [] }, { ignore: null }, { ignore: 'build' }, { ignore: new Array(1) }, { ignore: ['a/b'] }, { ignore: ['..'] }, { ignore: [''] }, { ignore: ['a\0b'] }]) {
    await assert.rejects(scanDirectory('does-not-exist', options), TypeError);
  }
});

test('scan captures ignore values before the caller changes the array', async (t) => {
  const root = await fixture(t);
  await mkdir(join(root, 'build'));
  const ignore = ['build'];
  const pending = collectPaths(root, { ignore });
  ignore.length = 0;
  assert.deepEqual(await pending, []);
});
