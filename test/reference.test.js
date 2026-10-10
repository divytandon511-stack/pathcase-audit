import test from 'node:test';
import assert from 'node:assert/strict';
import { checkPaths } from 'pathcase-audit';

// Deliberately slow pairwise oracle: no production parser, folding or grouping helpers.
function referenceKeys(paths) {
  const parts = paths.map((path) => path.split(/[\\/]/));
  const lower = (value) => [...value].map((char) => {
    const code = char.charCodeAt(0);
    return code >= 65 && code <= 90 ? String.fromCharCode(code + 32) : char;
  }).join('');
  const keys = new Set();
  for (let a = 0; a < parts.length; a++) {
    for (let b = a + 1; b < parts.length; b++) {
      for (let index = 0; index < Math.min(parts[a].length, parts[b].length); index++) {
        if (lower(parts[a][index]) !== lower(parts[b][index])) break;
        if (parts[a][index] !== parts[b][index]) {
          keys.add(parts[a].slice(0, index + 1).map(lower).join('/'));
        }
      }
    }
  }
  return [...keys].sort();
}

test('grouping agrees with an independent pairwise oracle on generated manifests', () => {
  let seed = 0x51a7;
  const next = (limit) => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed % limit;
  };
  const names = ['a', 'A', 'b', 'B', 'Docs', 'docs', 'Ä', 'ä', '__proto__'];
  for (let sample = 0; sample < 300; sample++) {
    const paths = Array.from({ length: 2 + next(20) }, () => {
      const components = Array.from({ length: 1 + next(4) }, () => names[next(names.length)]);
      return components.join(next(2) ? '/' : '\\');
    });
    const result = checkPaths(paths);
    assert.deepEqual(result.collisions.map((c) => c.key), referenceKeys(paths), `sample ${sample}: ${JSON.stringify(paths)}`);
    assert.equal(result.hasCollisions, result.collisions.length > 0);
    assert.deepEqual(checkPaths([...paths].reverse()), result, `reversed sample ${sample}`);
  }
});
