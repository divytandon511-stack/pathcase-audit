import test from 'node:test';
import assert from 'node:assert/strict';
import { checkPaths } from 'pathcase-audit';

test('package entry point exposes a complete collision report', () => {
  const result = checkPaths(['Docs/Guide.md', 'docs/Guide.md']);
  assert.equal(result.hasCollisions, true);
  assert.equal(result.collisions.length, 1);
  assert.equal(result.collisions[0].key, 'docs');
  assert.equal(result.collisions[0].componentIndex, 0);
  assert.deepEqual(result.collisions[0].paths, ['Docs/Guide.md', 'docs/Guide.md']);
});

test('empty and clean manifests have an explicit clean result', () => {
  for (const paths of [[], ['one/file', 'two/FILE'], ['Ä', 'ä']]) {
    assert.deepEqual(checkPaths(paths), { hasCollisions: false, collisions: [] });
  }
});

test('invalid manifests throw synchronously instead of returning partial results', () => {
  assert.throws(() => checkPaths('a'), TypeError);
  assert.throws(() => checkPaths(['A', 'a', '../invalid']), /index 2/);
});

test('results and input are independent across calls', () => {
  const input = Object.freeze(['A', 'a']);
  const first = checkPaths(input);
  first.collisions[0].paths.push('other');
  first.collisions[0].variants.length = 0;
  const second = checkPaths(input);
  assert.deepEqual(second.collisions[0].paths, ['A', 'a']);
  assert.deepEqual(second.collisions[0].variants, ['A', 'a']);
  assert.deepEqual(input, ['A', 'a']);
});

test('keeps separator aliases as evidence without counting them as new variants', () => {
  const paths = ['Docs/a', 'Docs\\a', 'docs/b', 'Docs/a'];
  const result = checkPaths(paths);
  assert.equal(result.collisions.length, 1);
  assert.deepEqual(result.collisions[0].variants, ['Docs', 'docs']);
  assert.deepEqual(result.collisions[0].paths, ['Docs/a', 'Docs\\a', 'docs/b']);
});

test('three spellings produce one group rather than three pairwise reports', () => {
  const result = checkPaths(['lib/README', 'lib/Readme', 'lib/readme']);
  assert.equal(result.collisions.length, 1);
  assert.deepEqual(result.collisions[0].variants, ['README', 'Readme', 'readme']);
  assert.equal(result.collisions[0].componentIndex, 1);
});

test('explicit directory inputs and descendants share the parent report', () => {
  const result = checkPaths(['Docs', 'Docs/a', 'docs/b', 'other/Docs/c']);
  assert.equal(result.collisions.length, 1);
  assert.deepEqual(result.collisions[0].paths, ['Docs', 'Docs/a', 'docs/b']);
});

test('prototype-like names remain ordinary path components', () => {
  const result = checkPaths(['__proto__/A', '__proto__/a', 'constructor/B', 'constructor/b']);
  assert.deepEqual(result.collisions.map((c) => c.key), ['__proto__/a', 'constructor/b']);
});

test('non-ASCII parent names stay separate even when their ASCII children match', () => {
  assert.deepEqual(checkPaths(['Ä/A', 'ä/a', 'é/X', 'e\u0301/x']), {
    hasCollisions: false, collisions: [],
  });
});
