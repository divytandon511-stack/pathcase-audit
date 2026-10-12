import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readdir, writeFile, rm } from 'node:fs/promises';
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
