# Assignment audit — 15 October 2026

Package: **pathcase-audit**, development version **0.1.0-dev.0**. Proposed first npm release: **0.1.0**, pending authentication and final registry verification. Deadline: 18 November.

Purpose: detect ASCII case collisions in every component of proposed relative paths or existing directory entries before copying or importing files.

## Minimum requirements

| Requirement | Status | Evidence |
| --- | --- | --- |
| 1. Clearly defined purpose | Complete | README problem statement and scope |
| 2. Proper project structure | Complete | src, bin, test, docs, examples, scripts in the public repository |
| 3. Public GitHub repository | Complete | [pathcase-audit](https://github.com/divytandon511-stack/pathcase-audit) |
| 4. Appropriate package.json | Implemented; release metadata pending | ESM exports, types, bin, files, Node >=22, MIT, repository, scripts; private development version retained |
| 5. Source code | Complete | checkPaths, scanDirectory and CLI implementations |
| 6. Tests | Complete | 76 runtime tests plus source, consumer types, packaging and installed-consumer checks |
| 7. README documentation | Complete | Purpose, API, scanner, CLI, examples, limits and development |
| 8. Usage examples | Complete | README and two executable examples shipped in the tarball |
| 9. Installation instructions | Complete for local package | Clone and tarball installation verified; registry installation pending publication |
| 10. Published npm package | **Not complete** | npm authentication unavailable; no live release verified |

The assignment is **not fully complete** until npm publication and installation of the published version are verified.

## README documentation requirements

| Requirement | Evidence |
| --- | --- |
| What it does | Opening description and proposed/existing path distinction |
| Why useful | Docs/a.txt versus docs/b.txt parent-directory example |
| Installation | Node requirement, clone and local tarball commands |
| Basic usage | ESM checkPaths example and CLI commands |
| API/method documentation | README signatures and [API reference](api.md) |
| Parameters | Paths, root directory and ignore options |
| Return values | CheckResult field table and Promise result description |
| Examples | Proposed paths, scanner, CLI sample output, import manifest and CI script |
| Limitations | ASCII-only scope, duplicates, structural conflicts, filesystem representation, concurrency and memory |
| Contribution instructions | [Contribution guide](contributing.md), commands and bug-report guidance |

## Expected deliverables

| Deliverable | Evidence/status |
| --- | --- |
| GitHub repository | Public repository linked above |
| Published npm package | **Pending**; do not cite an unverified npm listing |
| README | Included in repository and packed artifact |
| Installation instructions | Verified local tarball flow; registry flow awaits release |
| Usage examples | Bundled examples run from an isolated installed consumer |
| Test cases | Repository test directory and CI matrix |
| Package documentation | README, [API](api.md), [contract](path-contract.md), [contributing](contributing.md), [release guide](releasing.md), [release notes](release-notes.md) |

## Behavior and evaluation evidence

- Component grouping detects both parent and leaf conflicts, preserves original paths and keeps unrelated parents separate. A separate pairwise oracle checks generated manifests.
- Results are deterministic, JSON-compatible and use locale-independent ordering. Readable CLI output uses one-based component numbers; API/JSON uses zero-based indices.
- Validation covers relative path grammar, both separators, duplicates, sparse arrays and invalid types. Scans include empty directories and symlink names without intentional traversal, use exact directory ignores and propagate read failures.
- CLI help, clean/collision/failure exits, JSON parity, control-character escaping, output failures and reports over 64 KiB are tested.
- Runtime has no external dependencies. JavaScript source and published declarations are checked; unsupported internal imports are blocked by exports.
- Versioning rationale and release checks are documented. The package is intentionally still private until publication readiness is confirmed.

## Verification actually performed

On 15 October, `npm run verify` passed outside the macOS sandbox: syntax and source checks, 76 runtime tests (68 passed, eight explicit filesystem/platform capability skips), NodeNext/Bundler consumer types, package-content/link checks and fresh offline tarball installation. The sandbox run was blocked on invalid-byte filename creation; it was not counted as a passing run.

Installed-consumer checks cover API collisions, scanner output, export boundaries, CLI help/JSON/failure exits, declarations and both bundled examples. On 14 October the same installation check also passed on a case-sensitive HFSX volume, including installed CLI nested collisions and exit 1. Case-sensitive full runtime tests previously passed 75 with one encoding-capability skip.

The corrected-history commit `5f4d6a3` passed all six Node 22/24 Linux/macOS/Windows jobs: [verified CI run](https://github.com/divytandon511-stack/pathcase-audit/actions/runs/38583595610). Later commits require their own CI results; this audit does not claim they were already checked by that run.

## Remaining release work

1. Authenticate locally with npm using its normal login flow. Never send tokens or passwords in chat. `npm whoami` currently returns ENEEDAUTH.
2. Recheck name ownership/availability. The registry lookup returned E404 on 15 October; that does not guarantee publishing permission.
3. Prepare 0.1.0 metadata and release notes, rerun verification, and inspect the exact final tarball.
4. Publish with authorized credentials, verify registry metadata and install the published exact version in a fresh consumer.
5. Update this audit and README with actual verified release evidence. Scheduled work ends after 15 October; unresolved blockers must remain explicit.
