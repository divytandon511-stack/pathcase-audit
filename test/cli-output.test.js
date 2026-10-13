import test from 'node:test';
import assert from 'node:assert/strict';
import { Writable } from 'node:stream';
import { runCli } from '../src/cli.js';

function sink(write) { return new Writable({ write }); }

test('CLI waits for delayed output before returning success', async () => {
  let complete;
  let output = '';
  const stdout = sink((chunk, encoding, callback) => { output += chunk; complete = callback; });
  const stderr = sink((chunk, encoding, callback) => callback());
  let returned = false;
  const pending = runCli(['--help'], { stdout, stderr }).then((code) => { returned = true; return code; });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(returned, false);
  assert.match(output, /^Usage:/);
  complete();
  assert.equal(await pending, 0);
  assert.equal(stdout.listenerCount('error'), 0);
});

test('CLI returns 2 and a concise diagnostic when stdout fails asynchronously', async () => {
  const stdout = sink((chunk, encoding, callback) => setImmediate(() => callback(new Error('EPIPE: broken pipe'))));
  let diagnostic = '';
  const stderr = sink((chunk, encoding, callback) => { diagnostic += chunk; callback(); });
  assert.equal(await runCli(['--help'], { stdout, stderr }), 2);
  assert.equal(diagnostic, 'pathcase-audit: "EPIPE: broken pipe"\n');
});

test('CLI returns 2 even when the diagnostic stream also fails', async () => {
  const broken = () => sink((chunk, encoding, callback) => setImmediate(() => callback(new Error('closed'))));
  assert.equal(await runCli(['--help'], { stdout: broken(), stderr: broken() }), 2);
  assert.equal(await runCli(['--unknown'], { stdout: broken(), stderr: broken() }), 2);
});
