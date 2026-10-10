/** Internal path helpers used by the public collision API. */

/** Fold only ASCII uppercase letters; never apply locale or Unicode folding. */
export function foldAscii(value) {
  return value.replace(/[A-Z]/g, (letter) => String.fromCharCode(letter.charCodeAt(0) + 32));
}

/** Parse without normalization, retaining the original string for later reports. */
export function parseRelativePath(value) {
  if (typeof value !== 'string') throw new TypeError('Path must be a string.');
  if (value.length === 0 || value.includes('\0')) {
    throw new TypeError('Path must be nonempty and contain no NUL characters.');
  }
  if (/^[\\/]/.test(value) || /^[A-Za-z]:/.test(value)) {
    throw new TypeError('Path must be relative, without a root or drive prefix.');
  }
  const components = value.split(/[\\/]/);
  if (components.some((part) => part === '' || part === '.' || part === '..')) {
    throw new TypeError('Empty, dot and parent components are not allowed.');
  }
  return {
    original: value,
    components,
    foldedComponents: components.map(foldAscii),
  };
}

/** Validate a whole proposed manifest, reporting which input needs fixing. */
export function parsePathList(paths) {
  if (!Array.isArray(paths)) throw new TypeError('Paths must be an array of relative strings.');
  const parsed = [];
  const seen = new Set();
  for (let index = 0; index < paths.length; index++) {
    let path;
    try {
      path = parseRelativePath(paths[index]);
    } catch (error) {
      throw new TypeError(`Invalid path at index ${index}: ${error.message}`, { cause: error });
    }
    if (!seen.has(path.original)) {
      seen.add(path.original);
      parsed.push(path);
    }
  }
  return parsed;
}
