import { ignoredDirectories } from './scan-options.js';
import { lstat, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { parseRelativePath } from './path.js';

/** Collect actual relative entries without intentionally following symlinks.
 * @param {string} directory
 * @param {import('./index.d.ts').ScanOptions} [options]
 * @returns {Promise<string[]>}
 */
export async function collectPaths(directory, options = {}) {
  const ignore = ignoredDirectories(options);
  if (typeof directory !== 'string' || !directory || directory.includes('\0')) {
    throw new TypeError('Directory must be a nonempty string without NUL.');
  }
  const root = resolve(directory);
  const rootInfo = await lstat(root);
  if (!rootInfo.isDirectory()) throw new TypeError('Scan root must be a real directory, not a file or symlink.');
  const pending = [{ absolute: root, relative: '' }];
  const paths = [];
  while (pending.length) {
    const current = pending.pop();
    if (!current) break;
    const entries = await readdir(current.absolute, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && ignore.has(entry.name)) continue;
      if (entry.name.includes('\\')) {
        throw new TypeError('Cannot represent a filename containing a literal backslash.');
      }
      const relative = current.relative ? `${current.relative}/${entry.name}` : entry.name;
      parseRelativePath(relative);
      paths.push(relative);
      if (entry.isDirectory()) pending.push({ absolute: join(current.absolute, entry.name), relative });
    }
  }
  return paths.sort();
}
