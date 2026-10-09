import test from 'node:test';
import assert from 'node:assert/strict';
import { foldAscii, parseRelativePath, parsePathList } from '../src/path.js';

test('folds the entire ASCII alphabet while preserving digits and punctuation', () => {
  assert.equal(foldAscii('ABCDEFGHIJKLMNOPQRSTUVWXYZ-09_.'), 'abcdefghijklmnopqrstuvwxyz-09_.');
  assert.equal(foldAscii('already-lower'), 'already-lower');
});

test('does not fold or normalize Unicode', () => {
  assert.equal(foldAscii('ÄäİıΣσßé e\u0301'), 'ÄäİıΣσßé e\u0301');
});

test('retains original strings and parses mixed separators independently of host OS', () => {
  assert.deepEqual(parseRelativePath('Docs\\API/Guide.MD'), {
    original: 'Docs\\API/Guide.MD',
    components: ['Docs', 'API', 'Guide.MD'],
    foldedComponents: ['docs', 'api', 'guide.md'],
  });
});

test('allows literal whitespace, dotfiles and non-ASCII component names', () => {
  assert.deepEqual(parseRelativePath(' .config /Ä/file.name').components, [' .config ', 'Ä', 'file.name']);
});

test('rejects absolute, UNC and drive-prefixed paths', () => {
  for (const value of ['/etc/file', '\\root', '\\\\server\\share', 'C:relative', 'z:\\file', 'D:/file']) {
    assert.throws(() => parseRelativePath(value), TypeError, value);
  }
});

test('rejects ambiguous separators and dot traversal instead of normalizing them', () => {
  for (const value of ['a/', 'a\\', 'a//b', 'a\\\\b', 'a/\\b', '.', '..', './a', 'a/../b', 'a/./b']) {
    assert.throws(() => parseRelativePath(value), TypeError, value);
  }
});

test('rejects nonstrings, empty input and NUL', () => {
  for (const value of [undefined, null, 0, [], {}, new String('a'), '', 'a\0b']) {
    assert.throws(() => parseRelativePath(value), TypeError);
  }
});

test('separator aliases preserve distinct originals but produce identical components', () => {
  const slash = parseRelativePath('a/B');
  const backslash = parseRelativePath('a\\B');
  assert.notEqual(slash.original, backslash.original);
  assert.deepEqual(slash.components, backslash.components);
  assert.deepEqual(slash.foldedComponents, backslash.foldedComponents);
});


test('accepts an empty proposed manifest and rejects non-array containers', () => {
  assert.deepEqual(parsePathList([]), []);
  for (const value of [null, undefined, 'file', {}, new Set(['file'])]) {
    assert.throws(() => parsePathList(value), TypeError);
  }
});

test('deduplicates exact inputs without losing separator aliases or changing input', () => {
  const paths = Object.freeze(['Docs/a', 'Docs/a', 'Docs\\a', 'docs/a']);
  assert.deepEqual(parsePathList(paths).map((p) => p.original), ['Docs/a', 'Docs\\a', 'docs/a']);
  assert.deepEqual(paths, ['Docs/a', 'Docs/a', 'Docs\\a', 'docs/a']);
});

test('identifies the invalid manifest position and preserves the underlying error', () => {
  assert.throws(() => parsePathList(['ok', 'also/ok', '../bad']), (error) => {
    assert.ok(error instanceof TypeError);
    assert.match(error.message, /index 2/);
    assert.ok(error.cause instanceof TypeError);
    return true;
  });
});

test('rejects sparse manifests instead of silently skipping missing paths', () => {
  const paths = new Array(2);
  paths[0] = 'valid';
  assert.throws(() => parsePathList(paths), /index 1/);
});
