/** Validate and copy ignore names before any asynchronous scan work.
 * @param {unknown} options
 * @returns {Set<string>}
 */
export function ignoredDirectories(options = {}) {
  if (options === null || typeof options !== 'object' || Array.isArray(options)) {
    throw new TypeError('Scan options must be an object.');
  }
  if (Object.keys(options).some((key) => key !== 'ignore')) {
    throw new TypeError('Unknown scan option.');
  }
  const requested = 'ignore' in options ? options.ignore : undefined;
  const names = requested === undefined ? ['.git', 'node_modules'] : requested;
  if (!Array.isArray(names)) throw new TypeError('ignore must be an array of directory basenames.');
  const result = new Set();
  for (let index = 0; index < names.length; index++) {
    const name = names[index];
    if (!Object.hasOwn(names, index) || typeof name !== 'string' || !name || /[\\/\0]/.test(name) || name === '.' || name === '..') {
      throw new TypeError(`Invalid ignore basename at index ${index}.`);
    }
    result.add(name);
  }
  return result;
}
