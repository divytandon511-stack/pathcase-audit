import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const run = (name) => spawnSync(process.execPath, [fileURLToPath(new URL(`../examples/${name}`, import.meta.url))], {
  cwd: tmpdir(), encoding: 'utf8', timeout: 10_000,
});

test('quick-start example works from outside the repository', () => {
  const execution = run('proposed-paths.js');
  assert.ifError(execution.error);
  assert.equal(execution.status, 0);
  assert.equal(execution.stderr, '');
  const report = JSON.parse(execution.stdout);
  assert.equal(report.hasCollisions, true);
  assert.deepEqual(report.collisions[0].variants, ['Docs', 'docs']);
});

test('import example reads its own manifest and blocks colliding destinations', () => {
  const execution = run('check-import.js');
  assert.ifError(execution.error);
  assert.equal(execution.status, 1);
  assert.equal(execution.stderr, '');
  const report = JSON.parse(execution.stdout);
  assert.equal(report.hasCollisions, true);
  assert.equal(report.collisions.length, 1);
  assert.deepEqual(report.collisions[0].paths, ['Docs/Guide.md', 'docs/Setup.md']);
});
