# Proposed-path API

Available in the current development checkout. npm publication, TypeScript declarations, directory scanning and the CLI are still pending.

## checkPaths(paths)

```js
import { checkPaths } from 'pathcase-audit';
const result = checkPaths(['Docs/Guide.md', 'docs/guide.md']);
```

The input is an array of relative path strings. The function is synchronous, does not mutate it and does not read or write disk. An empty array is valid. Only ASCII letters A–Z are folded; non-ASCII characters retain their exact spelling. Full validation details are in [the path contract](path-contract.md).

| Field | Type | Meaning |
| --- | --- | --- |
| hasCollisions | boolean | Whether at least one group has conflicting component spellings |
| collisions | array | Groups sorted by their folded prefix |
| collisions[].key | string | Folded prefix through the conflicting component, using `/` |
| collisions[].componentIndex | number | Zero-based position within the path |
| collisions[].variants | string[] | Distinct original spellings of that component |
| collisions[].paths | string[] | Distinct original inputs contributing to the group |
| collisions[].reason | string | Human-readable explanation of the comparison rule |

Strings are sorted by JavaScript code-unit order, not the system locale. Every call returns fresh arrays and objects; editing a result does not affect later calls. Reports are grouped, not every possible pair: three conflicting spellings make one group.

## Interpreting nested reports

For `Docs/Guide.md` and `docs/guide.md`, there are two groups:

- `docs`, at index 0, with variants `Docs` and `docs`.
- `docs/guide.md`, at index 1, with variants `Guide.md` and `guide.md`.

The same original paths appear in both because both components have conflicting spellings. If both filenames were `Guide.md`, only the parent group would remain. In contrast, `one/Guide.md` and `two/guide.md` do not collide: their parent directories differ under the rule.

An explicit directory path and its descendants may all appear in a parent report. For `Docs`, `Docs/a` and `docs/b`, the report identifies the directory component and includes all three inputs. This is evidence for deciding whether the directories should merge or be renamed; it is not three separate file overwrites.

## Responding to a collision

Review the original paths before changing a manifest. If two parent spellings refer to the same intended directory, standardize that component consistently in all affected destinations. If they represent different directories, choose distinct names rather than merely changing letter case. Recheck the full revised manifest: fixing a parent can reveal a child conflict you still need to resolve.

The checker never renames files or chooses which entry wins. Avoid blindly lowercasing every destination: that can turn two intended files into the same exact destination. Exact duplicates are outside this package's case-collision rule, so an importer should separately reject unintended duplicate destinations.

## Error handling

```js
import { checkPaths } from 'pathcase-audit';

try {
  const report = checkPaths(['valid/file', '../outside']);
  console.log(report);
} catch (error) {
  if (!(error instanceof TypeError)) throw error;
  console.error(error.message); // Invalid path at index 1: ...
}
```

A bad container or path throws TypeError; there is no partial report. Invalid path messages include the zero-based input index and preserve the parser error as `cause`. Do not depend on the full prose as a machine-readable error code. Filesystem errors are not relevant to this function because it never accesses disk.

## What a clean result means

It means there are no ASCII case collisions in the supplied list. It does not certify valid Windows names, Unicode compatibility, absence of duplicate destinations, type consistency (`file` versus `file/child`), or existence of files. It also does not parse imports or check whether an import statement's casing matches a real file.

Check the original proposed manifest before writing it to a case-insensitive filesystem. A list obtained after files have already been overwritten may no longer contain the conflicting names. These are separate concerns from the disk-scanning API planned for later development.
