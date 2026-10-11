// Use code-unit ordering so reports do not depend on the host locale.
const compare = (left, right) => left < right ? -1 : left > right ? 1 : 0;

/** Group validated paths by their complete folded prefix, including parents. */
export function findCollisions(paths) {
  const prefixes = new Map();
  for (const path of paths) {
    let key = '';
    for (let index = 0; index < path.components.length; index++) {
      key += `${index === 0 ? '' : '/'}${path.foldedComponents[index]}`;
      let group = prefixes.get(key);
      if (!group) {
        group = { componentIndex: index, variants: new Set() };
        prefixes.set(key, group);
      }
      group.variants.add(path.components[index]);
    }
  }
  // Clean prefixes need no original-path sets. Collect evidence only for conflicts.
  for (const [key, group] of prefixes) {
    if (group.variants.size < 2) prefixes.delete(key);
    else group.paths = new Set();
  }
  if (prefixes.size === 0) return [];
  for (const path of paths) {
    let key = '';
    for (let index = 0; index < path.components.length; index++) {
      key += `${index === 0 ? '' : '/'}${path.foldedComponents[index]}`;
      prefixes.get(key)?.paths.add(path.original);
    }
  }
  return [...prefixes]
    .sort(([left], [right]) => compare(left, right))
    .map(([key, group]) => ({
      key,
      componentIndex: group.componentIndex,
      variants: [...group.variants].sort(compare),
      paths: [...group.paths].sort(compare),
      reason: 'Distinct component spellings are equal under ASCII case-insensitive comparison.',
    }));
}
