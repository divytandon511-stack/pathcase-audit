import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCliOptions } from '../src/cli-options.js';

test('CLI defaults to current directory and preserves explicit paths', () => {
  assert.deepEqual(parseCliOptions([]), { directory: '.', json: false, help: false, scanOptions: { ignore: undefined } });
  assert.equal(parseCliOptions(['folder with spaces']).directory, 'folder with spaces');
  assert.equal(parseCliOptions(['--', '-folder']).directory, '-folder');
  assert.equal(parseCliOptions(['-h']).help, true);
});

test('CLI accepts repeated exact ignores or disables defaults', () => {
  assert.deepEqual(parseCliOptions(['--ignore', 'build', 'tree', '--ignore=cache']).scanOptions, { ignore: ['build', 'cache'] });
  assert.deepEqual(parseCliOptions(['--no-ignore']).scanOptions, { ignore: [] });
});

test('CLI rejects ambiguous, unknown and malformed arguments', () => {
  for (const args of [
    ['a', 'b'], ['--unknown'], ['--ignore'], ['--ignore='], ['--ignore', '../cache'],
    ['--ignore', 'cache', '--no-ignore'], ['--help=false'], [''], ['a\0b'], ['--help', '--typo'],
  ]) assert.throws(() => parseCliOptions(args), undefined, JSON.stringify(args));
});
