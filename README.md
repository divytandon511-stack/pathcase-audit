# pathcase-audit

Detect ASCII case collisions in proposed paths and existing directory trees, with a small Node.js API and CLI. No runtime dependencies.

`Docs/a.txt` and `docs/b.txt` can coexist on a case-sensitive disk but conflict at their parent directory when copied to a case-insensitive destination. Checking only filenames misses this. pathcase-audit checks every component and reports the original paths so you can resolve conflicts before copying files or importing a batch.

Filename portability is an existing problem. This package focuses on ASCII case collisions; it does not certify full Windows, macOS or Unicode compatibility.

## Installation

Requires **Node.js 22 or newer**. Version **0.1.0** is the first release of this focused ASCII-case API.

```sh
npm install pathcase-audit@0.1.0
npx --offline pathcase-audit --help
```

To use the development checkout:

```sh
git clone https://github.com/divytandon511-stack/pathcase-audit.git
cd pathcase-audit
npm ci
node bin/pathcase-audit.js --help
```

To install this version into another project, run `npm pack` in the checkout, then install the resulting local tarball from your consumer project:

```sh
npm install /absolute/path/to/pathcase-audit-0.1.0.tgz
npx --offline pathcase-audit --help
```

Replace the absolute path with the actual tarball location. This alternative installs your locally built package. The examples below use ESM (`.mjs`, or `"type": "module"` in your package.json). TypeScript declarations are included.

## Check proposed paths

```js
import { checkPaths } from 'pathcase-audit';

const report = checkPaths(['Docs/Guide.md', 'docs/Guide.md']);
console.log(report.hasCollisions); // true
console.log(report.collisions[0].variants); // ['Docs', 'docs']
```

`checkPaths(paths: readonly string[]): CheckResult` is synchronous, does not mutate inputs and never accesses disk. Use it before writing an import manifest, even if your current filesystem cannot store the proposed names together. An empty list returns `{ hasCollisions: false, collisions: [] }`.

| Result field | Meaning |
| --- | --- |
| `hasCollisions` | Whether any component has conflicting spellings |
| `collisions` | Groups sorted by folded prefix |
| `key` | ASCII-folded prefix through the conflicting component |
| `componentIndex` | Zero-based component position |
| `variants` | Sorted original spellings of that component |
| `paths` | Sorted original inputs contributing to the group |
| `reason` | Explanation of the comparison rule |

Both slash styles separate components. Exact duplicates are removed; separator aliases alone do not collide. Rejects absolute paths, drive prefixes, empty components, `.`/`..`, NUL, nonstrings and sparse arrays with `TypeError`. Invalid entries identify their zero-based index. Only A–Z are folded; sorting uses locale-independent JavaScript code-unit order.

See the [API guide](docs/api.md) for nested reports, parameters, return fields, TypeScript and error handling, and the [comparison contract](docs/path-contract.md) for the complete grammar.

## Scan existing entries

```js
import { scanDirectory } from 'pathcase-audit';

const report = await scanDirectory('./src', {
  ignore: ['.git', 'node_modules', 'build'],
});
console.log(report.hasCollisions);
```

`scanDirectory(directory = '.', options = {}): Promise<CheckResult>` accepts an absolute or relative root and returns the same report shape. Paths in reports are relative to the root and use `/`. Files, directories (including empty directories), hidden entries and symlink names are included. Symlinks are not intentionally followed; a symlink root is rejected.

By default, `.git` and `node_modules` directories are skipped at every depth. `options.ignore` replaces those defaults; use `[]` to include all directories. Names are exact, case-sensitive basenames, without globs or `.gitignore` processing. Files and symlinks matching an ignore name are still checked. Invalid options reject with `TypeError`; filesystem errors retain their Node `code` and `path`. Unreadable subtrees fail the entire scan, never a partial clean result.

## CLI

After local tarball installation:

```sh
npx --offline pathcase-audit ./src
npx --offline pathcase-audit ./src --json
npx --offline pathcase-audit . --ignore .git --ignore node_modules --ignore dist
npx --offline pathcase-audit . --no-ignore
npx --offline pathcase-audit -- -folder
```

In the repository, replace `npx --offline pathcase-audit` with `node bin/pathcase-audit.js`.

| Argument | Behavior |
| --- | --- |
| `[directory]` | One optional root, default `.` |
| `-h`, `--help` | Print usage without scanning |
| `--json` | Print one JSON API result and a newline |
| `--ignore NAME` | Replace default ignores; repeat for multiple names |
| `--no-ignore` | Include all directories; cannot combine with `--ignore` |
| `--` | End options, allowing a dash-prefixed root |

Unknown options and extra directories fail, including with help. JSON uses zero-based component indices; readable output uses one-based numbers. Both describe the same groups. For a tree containing empty `Docs` and `docs` directories, readable output is:

```text
Found 1 ASCII case collision group(s).

Component 1 at "docs"
  Variants: "Docs", "docs"
  Reason: Distinct component spellings are equal under ASCII case-insensitive comparison.
  Paths:
    "Docs"
    "docs"
```

A clean scan prints `No ASCII case collisions found.` Names are quoted and control characters escaped.

| Exit code | Meaning |
| --- | --- |
| 0 | Clean scan or help |
| 1 | Collisions found; a complete report is available |
| 2 | Invalid arguments, scan failure or output-write failure |

Reports/help go to stdout; diagnostics go to stderr. Help remains readable with `--json`. Failed scans emit no partial JSON. A failed output write can leave truncated stdout, so discard it on exit 2. The CLI waits for writes to finish; broken pipes also return 2, even when stderr cannot accept a diagnostic. Error wording can vary by platform; depend on exit codes rather than full prose.

## CI and import pipelines

Once the local tarball is installed as a development dependency, add this script to your consumer package.json:

```json
{
  "scripts": {
    "check:paths": "pathcase-audit ."
  }
}
```

Run `npm run check:paths` as a CI step. Any collision or scan failure fails the step. Prefer a case-sensitive CI filesystem: a scan cannot recover names already overwritten or rejected by a case-insensitive disk. Use `checkPaths` for proposed destinations regardless of host filesystem.

In an importer, check `manifest.map(entry => entry.destination)` before any writes, and stop when `hasCollisions` is true. The runnable `npm run example:import` demonstrates this using [a sample manifest](examples/import-manifest.json); it intentionally exits 1 and creates no files. `npm run example` shows the basic API. Importers must separately validate duplicate destinations and other destination restrictions.

## Limitations

- ASCII case only: no Unicode case folding or normalization, reserved-name checks, path-length checks or complete operating-system compatibility.
- Exact duplicate destinations and structural conflicts such as `file` versus `file/child` are outside scope.
- The scanner reports only existing entries. It does not check JavaScript import statement casing or rename files.
- On-disk names must be representable by the path grammar. Invalid UTF-8 bytes and literal POSIX backslashes reject the scan.
- Scans require a stable tree. Concurrent replacement can affect traversal; this is not an atomic snapshot or a security boundary.
- Paths and reports are held in memory. There is no streaming or fixed-memory guarantee.

## Development and verification

```sh
npm ci
npm run check
npm run check:source
npm test
npm run test:types
npm run check:package
npm run check:install
```

`npm run verify` runs all six checks above after installation. Publishing from the source checkout also runs them through `prepublishOnly`; publishing a prebuilt tarball still requires explicit verification of that artifact.

The 76 runtime tests cover comparison, validation, generated reference cases, scanner behavior, errors, CLI output and exit codes. Filesystem-dependent tests explicitly skip unsupported capabilities. Source checks use JSDoc; consumer type checks use NodeNext and Bundler resolution.

`check:package` checks `npm pack --dry-run` contents and local documentation link targets inside the tarball. `check:install` creates a real tarball, installs it offline in a temporary project, verifies API/scanner/export boundaries, installed CLI (including collisions on capable filesystems), bundled examples and declarations, then removes the temporary project. Neither publishes. The tarball contains runtime source, CLI, docs, examples, README, license and metadata; development files remain in GitHub.

[GitHub Actions](https://github.com/divytandon511-stack/pathcase-audit/actions) runs these checks on Node 22/24 across Linux, macOS and Windows. The workflow has read-only permissions and does not publish packages.

## Contributing and license

Read the [contribution guide](docs/contributing.md) and comparison contract, add a focused regression test for behavior changes, and run the checks above before opening a pull request. Keep implemented behavior distinct from future plans. The [development log](https://github.com/divytandon511-stack/pathcase-audit/blob/main/DEVELOPMENT-PLAN.md) records actual progress. Licensed under [MIT](LICENSE).

Maintainers: see the [release guide](docs/releasing.md) and [unreleased notes](docs/release-notes.md) for versioning and publication verification.

See the [assignment audit](docs/assignment-audit.md) for requirement-by-requirement evidence and outstanding publication work.
