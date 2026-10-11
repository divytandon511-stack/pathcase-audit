import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { checkPaths } from 'pathcase-audit';

// Control characters are valid input except NUL; consumers need lossless reports.
test('JSON reports preserve control characters, quotes and supplementary Unicode', () => {
  const paths = ['Docs/line\n"😀".txt', 'docs/line\n"😀".txt', 'Tabs\t/A', 'Tabs\t/a'];
  const report = checkPaths(paths);
  const json = JSON.stringify(report);
  assert.deepEqual(JSON.parse(json), report);
  assert.equal(json.includes('\n'), false);
  assert.equal(json.includes('\t'), false);
  assert.deepEqual(report.collisions[0].paths, paths.slice(0, 2));
});

test('JSON serialization is identical across input permutations and duplicates', () => {
  const paths = ['Z/A', 'z/a', 'Docs/x', 'docs/y'];
  const expected = JSON.stringify(checkPaths(paths));
  for (let shift = 0; shift < paths.length; shift++) {
    const rotated = [...paths.slice(shift), ...paths.slice(0, shift)];
    assert.equal(JSON.stringify(checkPaths([...rotated, ...rotated])), expected);
  }
});

test('report order does not depend on process locale settings', () => {
  const paths = ['I/a', 'i/A', 'Z/a', 'z/A', 'Ä/a', 'Ä/A'];
  const script = `import {checkPaths} from ${JSON.stringify(new URL('../src/index.js', import.meta.url).href)}; process.stdout.write(JSON.stringify(checkPaths(${JSON.stringify(paths)})));`;
  const expected = JSON.stringify(checkPaths(paths));
  for (const locale of ['C', 'en_US.UTF-8', 'tr_TR.UTF-8']) {
    const run = spawnSync(process.execPath, ['--input-type=module', '-e', script], {
      encoding: 'utf8', timeout: 10000,
      env: { ...process.env, LANG: locale, LC_ALL: locale },
    });
    assert.ifError(run.error);
    assert.equal(run.status, 0, run.stderr);
    assert.equal(run.stdout, expected);
  }
});
