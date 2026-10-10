import test from 'node:test';
import assert from 'node:assert/strict';
import { parsePathList } from '../src/path.js';
import { findCollisions } from '../src/collisions.js';
const detect = (paths) => findCollisions(parsePathList(paths));

test('reports original spellings and paths for a leaf collision', () => {
  assert.deepEqual(detect(['Readme.md', 'README.md']), [{
    key: 'readme.md', componentIndex: 0,
    variants: ['README.md', 'Readme.md'], paths: ['README.md', 'Readme.md'],
    reason: 'Distinct component spellings are equal under ASCII case-insensitive comparison.',
  }]);
});

test('finds parent conflicts even when children have different names', () => {
  const [collision] = detect(['Docs/a', 'docs/b']);
  assert.equal(collision.key, 'docs');
  assert.deepEqual(collision.paths, ['Docs/a', 'docs/b']);
  assert.deepEqual(collision.variants, ['Docs', 'docs']);
});

test('checks every level in the folded parent namespace', () => {
  assert.deepEqual(detect(['Docs/Sub/Guide', 'docs/sub/GUIDE']).map((c) => [c.key, c.componentIndex]), [
    ['docs', 0], ['docs/sub', 1], ['docs/sub/guide', 2],
  ]);
});

test('identical children under conflicting parents do not create extra groups', () => {
  assert.deepEqual(detect(['Docs/Guide', 'docs/Guide']).map((c) => c.key), ['docs']);
});

test('keeps unrelated parents separate and ignores exact spelling duplicates', () => {
  for (const paths of [[], ['one/readme', 'two/README'], ['same', 'same'], ['a/b', 'a\\b'], ['file', 'file/child']]) {
    assert.deepEqual(detect(paths), []);
  }
});

test('groups multiple spellings once and sorts independently of input order', () => {
  const paths = ['Z/x', 'z/X', 'a', 'A', 'Z/x', 'z/x'];
  const result = detect(paths);
  assert.deepEqual(result, detect([...paths].reverse()));
  assert.deepEqual(result.map((c) => c.key), ['a', 'z', 'z/x']);
  assert.deepEqual(result[1].paths, ['Z/x', 'z/X', 'z/x']);
});
