import { collectPaths } from './walk.js';
import { parsePathList } from './path.js';
import { findCollisions } from './collisions.js';

/** Check proposed relative paths without reading or writing the filesystem.
 * @param {readonly string[]} paths
 * @returns {import('./index.d.ts').CheckResult}
 */
export function checkPaths(paths) {
  const collisions = findCollisions(parsePathList(paths));
  return { hasCollisions: collisions.length > 0, collisions };
}

/** Scan existing directory entries using the proposed-path comparison rule.
 * @param {string} [directory]
 * @param {import('./index.d.ts').ScanOptions} [options]
 * @returns {Promise<import('./index.d.ts').CheckResult>}
 */
export async function scanDirectory(directory = '.', options = {}) {
  return checkPaths(await collectPaths(directory, options));
}
