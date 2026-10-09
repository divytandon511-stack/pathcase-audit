import test from 'node:test';
import assert from 'node:assert/strict';
import { foldAscii, parseRelativePath } from '../src/path.js';

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
