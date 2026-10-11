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
