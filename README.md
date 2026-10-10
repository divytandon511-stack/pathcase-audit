# pathcase-audit

A Node.js utility in development for detecting ASCII case collisions in proposed paths and directory trees.

`Docs/a.txt` and `docs/b.txt` can coexist on a case-sensitive disk but conflict at the directory component when copied elsewhere. This project aims to expose that risk through a small JavaScript API and CLI. Filename portability is an existing problem; the focus here is precise behavior and clear reports.

## Current status

This repository is being rebuilt incrementally. The proposed-path API is implemented and tested. The directory scanner and CLI are not ready. There is no published npm release. Do not use the earlier prototype's installation claims for this rebuild.

- [Path comparison contract](docs/path-contract.md): grammar, comparison rule, proposed result and acceptance cases.
- [Development plan](DEVELOPMENT-PLAN.md): milestones and actual progress.

The initial release will check ASCII case only, not full Unicode or operating-system filename compatibility.

## Run the current development tests

Requires Node.js 22 or newer.

```sh
git clone https://github.com/divytandon511-stack/pathcase-audit.git
cd pathcase-audit
npm ci
npm run check
npm test
```

The current 29 tests cover path grammar, manifest validation, component grouping and the public API. Invalid manifest entries identify their zero-based input index; exact duplicate strings are removed while separator aliases retain their original spelling. Filesystem scanning and CLI tests will follow when those features are implemented. The package is marked private at development version `0.1.0-dev.0` to prevent accidental publication before release verification is complete.

## Contributing

Read the comparison contract before changing behavior. Include a focused regression test with fixes, run the commands above, and distinguish implemented behavior from planned features in documentation. MIT licensed; see LICENSE.

## Automated checks

GitHub Actions runs the test suite on Node.js 22 and 24 across Linux, macOS and Windows for pushes and pull requests. See the repository's Actions tab for actual run results. This currently checks the proposed-path API and its helpers, not the planned disk scanner or CLI. The workflow has read-only repository permissions and does not publish packages.

## Check proposed paths

From this clone, run `npm run example`, or use the development API:

```js
import { checkPaths } from 'pathcase-audit';

const result = checkPaths(['Docs/Guide.md', 'docs/Guide.md']);
console.log(result.hasCollisions); // true
console.log(result.collisions[0].variants); // ['Docs', 'docs']
```

`checkPaths(paths)` takes an array of relative strings and returns `{ hasCollisions, collisions }` synchronously. It does not access disk. Each collision has a folded prefix `key`, zero-based `componentIndex`, original `variants`, contributing original `paths`, and a `reason`. Groups, variants and paths use locale-independent code-unit ordering. An empty list returns `{ hasCollisions: false, collisions: [] }`.

Invalid inputs throw `TypeError`; an invalid entry's message includes its zero-based index. Both slash styles are separators. Exact duplicates are ignored, while all input strings contributing to a case conflict retain their spelling. See the [contract](docs/path-contract.md) for the complete grammar and comparison limitations. This development API is available from the clone; npm installation by name is not available yet.

## Check an import before writing files

The manifest example reads `examples/import-manifest.json` and checks each entry's `destination`. Source IDs are metadata for the hypothetical importer; the checker only needs destination paths.

```sh
npm run example:import
```

This example intentionally returns **exit code 1** because `Docs/Guide.md` and `docs/Setup.md` conflict at their parent directory. Its JSON report names both paths; `assets/logo.svg` is unrelated and is not included. No proposed files or directories are created, so it works even on a case-insensitive disk.

In your own import pipeline, call `checkPaths(manifest.map(entry => entry.destination))` before any writes and stop if `hasCollisions` is true. A clean report means only that no ASCII case collision was found; your importer must still validate other destination restrictions and its own manifest schema. The example is a small API integration, not the planned directory-scanning CLI.
