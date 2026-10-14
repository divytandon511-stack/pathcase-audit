import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const npm = process.env.npm_execpath;
assert.ok(npm, 'Run through npm run check:install');
const temp = mkdtempSync(join(tmpdir(), 'pathcase-consumer-'));
try {
  const packed = JSON.parse(execFileSync(process.execPath, [npm, 'pack', '--json', '--ignore-scripts', '--pack-destination', temp], {
    cwd: root, encoding: 'utf8',
  }))[0];
  const consumer = join(temp, 'consumer');
  mkdirSync(consumer);
  writeFileSync(join(consumer, 'package.json'), JSON.stringify({ private: true, type: 'module' }));
  execFileSync(process.execPath, [npm, 'install', '--offline', '--ignore-scripts', '--no-audit', '--no-fund', join(temp, packed.filename)], {
    cwd: consumer, encoding: 'utf8',
  });
  const installed = JSON.parse(readFileSync(join(consumer, 'node_modules/pathcase-audit/package.json'), 'utf8'));
  assert.equal(installed.version, packed.version);
  writeFileSync(join(consumer, 'verify.mjs'), `
    import assert from 'node:assert/strict';
    import { checkPaths, scanDirectory } from 'pathcase-audit';
    const result = checkPaths(['Docs/a', 'docs/b']);
    assert.equal(result.hasCollisions, true);
    assert.deepEqual(result.collisions[0].paths, ['Docs/a', 'docs/b']);
    assert.deepEqual(await scanDirectory('empty'), { hasCollisions: false, collisions: [] });
    await assert.rejects(import('pathcase-audit/src/path.js'), { code: 'ERR_PACKAGE_PATH_NOT_EXPORTED' });
  `);
  mkdirSync(join(consumer, 'empty'));
  execFileSync(process.execPath, ['verify.mjs'], { cwd: consumer, encoding: 'utf8' });
  for (const [args, status, pattern] of [
    [['--help'], 0, /^Usage: pathcase-audit/],
    [['empty', '--json'], 0, /"hasCollisions":false/],
    [['missing'], 2, /pathcase-audit:/],
  ]) {
    const result = spawnSync(process.execPath, [npm, 'exec', '--offline', '--', 'pathcase-audit', ...args], {
      cwd: consumer, encoding: 'utf8', timeout: 15000,
    });
    assert.equal(result.error, undefined);
    assert.equal(result.status, status, result.stderr);
    assert.match(status === 2 ? result.stderr : result.stdout, pattern);
  }
  // Exercise collisions through the installed npm command, not the checkout bin.
  const tree = join(consumer, 'tree');
  mkdirSync(tree);
  mkdirSync(join(tree, 'Docs'));
  mkdirSync(join(tree, 'docs'), { recursive: true });
  if (readdirSync(tree).length === 2) {
    writeFileSync(join(tree, 'Docs', 'Guide'), '');
    writeFileSync(join(tree, 'docs', 'guide'), '');
    const result = spawnSync(process.execPath, [npm, 'exec', '--offline', '--', 'pathcase-audit', 'tree', '--json'], {
      cwd: consumer, encoding: 'utf8', timeout: 15000,
    });
    assert.equal(result.error, undefined);
    assert.equal(result.status, 1, result.stderr);
    assert.equal(result.stderr, '');
    const report = JSON.parse(result.stdout);
    assert.equal(report.hasCollisions, true);
    assert.deepEqual(report.collisions.map(({ key }) => key), ['docs', 'docs/guide']);
    assert.deepEqual(report.collisions[1].paths, ['Docs/Guide', 'docs/guide']);
  } else {
    console.log('Installed CLI collision fixture skipped: filesystem cannot store case variants.');
  }
  for (const [example, status] of [['proposed-paths.js', 0], ['check-import.js', 1]]) {
    const result = spawnSync(process.execPath, [join(consumer, 'node_modules/pathcase-audit/examples', example)], {
      cwd: consumer, encoding: 'utf8', timeout: 15000,
    });
    assert.equal(result.error, undefined);
    assert.equal(result.status, status, result.stderr);
    assert.equal(result.stderr, '');
    assert.equal(JSON.parse(result.stdout).hasCollisions, true);
  }
  writeFileSync(join(consumer, 'verify.ts'), `
    import { checkPaths, scanDirectory, type CheckResult } from 'pathcase-audit';
    const report: CheckResult = checkPaths(['Docs/a', 'docs/b'] as const);
    const scan: Promise<CheckResult> = scanDirectory('.', { ignore: ['build'] });
    // @ts-expect-error Path entries must be strings.
    checkPaths([123]);
  `);
  const tsc = join(root, 'node_modules/typescript/bin/tsc');
  execFileSync(process.execPath, [tsc, '--noEmit', '--strict', '--target', 'ES2022', '--module', 'NodeNext', 'verify.ts'], {
    cwd: consumer, encoding: 'utf8',
  });
  console.log(`Fresh tarball installation verified: ${packed.name}@${packed.version}; API, scanner, exports, CLI and types passed.`);
} finally { rmSync(temp, { recursive: true, force: true }); }
