import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readdir, writeFile, rm, symlink } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { checkPaths, scanDirectory } from 'pathcase-audit';

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'pathcase-scan-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}

test('scanner returns the API clean shape for an existing tree', async (t) => {
  const root = await fixture(t);
  await mkdir(join(root, 'empty'));
  await writeFile(join(root, 'Readme'), '');
  assert.deepEqual(await scanDirectory(root), { hasCollisions: false, collisions: [] });
});

test('scanner rejects failures rather than returning a partial clean report', async (t) => {
  const root = await fixture(t);
  await assert.rejects(scanDirectory(join(root, 'missing')), { code: 'ENOENT' });
  await assert.rejects(scanDirectory(''), TypeError);
});

test('real parent and child collisions match proposed entries exactly', async (t) => {
  const root = await fixture(t);
  await mkdir(join(root, 'Docs'));
  await mkdir(join(root, 'docs'), { recursive: true });
  if ((await readdir(root)).length !== 2) {
    t.skip('Filesystem cannot represent sibling case variants'); return;
  }
  await writeFile(join(root, 'Docs', 'Guide'), '');
  await writeFile(join(root, 'docs', 'guide'), '');
  const expected = checkPaths(['Docs', 'docs', 'Docs/Guide', 'docs/guide']);
  assert.equal(expected.collisions.length, 2);
  assert.deepEqual(await scanDirectory(root), expected);
});

async function requireCaseSensitive(t, root) {
  await mkdir(join(root, 'Probe'));
  await mkdir(join(root, 'probe'), { recursive: true });
  const supported = (await readdir(root)).length === 2;
  await rm(join(root, 'Probe'), { recursive: true });
  await rm(join(root, 'probe'), { recursive: true, force: true });
  if (!supported) t.skip('Filesystem cannot represent sibling case variants');
  return supported;
}

test('scanner reports file-directory and empty-directory collisions', async (t) => {
  const root = await fixture(t);
  if (!await requireCaseSensitive(t, root)) return;
  await writeFile(join(root, 'Asset'), '');
  for (const name of ['asset', 'Empty', 'empty']) await mkdir(join(root, name));
  await writeFile(join(root, 'asset', 'child'), '');
  const expected = checkPaths(['Asset', 'asset', 'asset/child', 'Empty', 'empty']);
  assert.equal(expected.collisions.length, 2);
  assert.deepEqual(await scanDirectory(root), expected);
});

test('scanner reports symlink case collisions without reading their targets', async (t) => {
  const root = await fixture(t);
  if (!await requireCaseSensitive(t, root)) return;
  await writeFile(join(root, 'Link'), '');
  try {
    await symlink(join(root, 'missing'), join(root, 'link'), 'file');
    await symlink(root, join(root, 'LINK'), 'dir');
  } catch (error) {
    if (error.code === 'EPERM') { t.skip('Symlink privilege unavailable'); return; }
    throw error;
  }
  const expected = checkPaths(['Link', 'link', 'LINK']);
  assert.equal(expected.collisions.length, 1);
  assert.deepEqual(await scanDirectory(root), expected);
});

test('default ignores remove only exact directory spellings from collisions', async (t) => {
  const root = await fixture(t);
  if (!await requireCaseSensitive(t, root)) return;
  for (const name of ['node_modules', 'Node_modules']) {
    await mkdir(join(root, name));
    await writeFile(join(root, name, 'entry'), '');
  }
  assert.deepEqual(await scanDirectory(root), checkPaths(['Node_modules', 'Node_modules/entry']));
  const expected = checkPaths(['node_modules', 'node_modules/entry', 'Node_modules', 'Node_modules/entry']);
  assert.equal(expected.hasCollisions, true);
  assert.deepEqual(await scanDirectory(root, { ignore: [] }), expected);
});
