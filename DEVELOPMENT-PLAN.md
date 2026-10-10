# Incremental rebuild of pathcase-audit

Deadline: 18 November 2026 (Asia/Kolkata).
Sessions: 10:00 AM, 3:00 PM and 8:00 PM India time, 9–15 October 2026 inclusive, via heartbeat build-pathcase-audit-daily. Target 6–7 substantive commits per day, normally two per session; no empty or artificial commits. Assignment deadline remains 18 November.

## Current state — 10 October

The proposed-path API, component grouping, validation, examples and cross-platform CI are implemented. Thirty tests include an independent generated-case comparison. Scanner, CLI, declarations and publication remain pending. No completed prototype implementation has been copied into this repository.
The previous completed prototype is retained in ../pathcase-audit as a backup/reference.
GitHub reset status: RESET COMPLETE. On 9 October the credential was verified to have delete_repo and workflow scopes. The old repository was deleted successfully and its absence verified with GitHub API HTTP 404. The fresh public repository was created and its planning history verified; do not delete it again on scheduled runs.

## Purpose and acceptance criteria

Build a small reusable Node.js package that detects ASCII case collisions in every relative path component. Provide a proposed-path API and existing-directory CLI. Report original paths, conflicting component and reason deterministically. Document input validation, separators, duplicates, ignores, symlinks, errors and filesystem limits. Do not claim full Unicode or operating-system compatibility.

Assignment: purpose, project structure, public GitHub repository, package.json, source, tests, README, examples, installation instructions and verified npm publication. README must cover purpose, usefulness, installation, usage, methods, parameters, return values, examples, limitations and contributions.

## Milestones

- 9 October: comparison contract and project foundation.
- 10 October: proposed-path API and component grouping.
- 11 October: validation, deterministic reports and TypeScript declarations.
- 12 October: scanner, symlinks, ignored directories and errors.
- 13 October: CLI arguments, readable/JSON reports and exit codes.
- 14 October: integration tests, documentation and fresh consumer installation.
- 15 October: release verification, exact rubric audit and publication if credentials permit.

Adapt tasks to actual progress. Spread substantive work over seven days; each date is a target rather than a claim of completion. Stop scheduled development after 15 October and report remaining blockers; do not automatically extend to November.

## Session rules

Use short, plain-English commit messages that describe the actual change, for example "Add path validation" or "Fix directory scanning". Avoid inflated wording and boilerplate. Preserve accurate authorship and timestamps.

Read current code, Git status and this log before changes. Aim for two useful bounded improvements per session, each with relevant checks and a commit with the real date. A seventh daily commit is appropriate only for additional substantive work. Do not manufacture history, backdate commits, add empty commits or split completed prototype code across days to simulate work. Do not rebuild the whole package in a single session. If no meaningful change is needed, skip the commit. Preserve user changes. Record actual results and blockers. Do not post to LinkedIn.

GitHub commits/pushes and eventual publication are authorized. Remote operations still depend on credentials. npm authentication was unavailable during the prototype. GitHub workflow permission is now available. Final release must be verified rather than assumed. Stop scheduled work after 15 October.

## Progress

- 9 October: established fresh development plan and local repository; daily schedule created. Remote deletion blocked on permission. No package functionality is claimed for the rebuild yet.

- Schedule revised at user request: three daily sessions for seven days, targeting 6–7 meaningful commits daily. No implementation added during this scheduling change.

- 9 October: deletion permission verified, old public repository deleted and absence verified. Fresh planning history prepared for publication; implementation remains scheduled.

- 9 October, manual catch-up for the missed 3 PM session: wrote the comparison/input contract, collision acceptance table, planned scan semantics and honest project overview. Reviewed the cases against the assignment; no executable functionality is claimed by this documentation commit. Scheduler timezone corrected separately; next nominal session remains 8 PM IST.

- 9 October, manual afternoon session: added Node ESM package foundation, MIT license, lockfile, internal ASCII folding and relative-path parser. Eight tests passed, zero skips; syntax check passed on Node v25.6.0. Public API/scanner/CLI remain unimplemented. Two substantive catch-up commits completed; next work is reserved for the 8 PM IST session.

- 9 October, 8 PM scheduled session: added internal manifest validation with input-index errors, exact duplicate removal and sparse-array rejection. Twelve tests and syntax checks passed locally. This prepares the input boundary for tomorrow's collision API; no collision detection is claimed yet. Included the user's saved preference for short, factual commit messages.

- 9 October, 8 PM scheduled session: added GitHub Actions checks for Node 22/24 on Linux, macOS and Windows, with read-only permissions and a ten-minute job limit. Local checks pass; remote matrix results will be verified after pushing. Tomorrow: implement collision grouping and the proposed-path API using the validated manifest boundary.

- CI follow-up: the first remote run flagged deprecated Node 20 action runtimes. Verified the latest official checkout/setup-node releases through GitHub and updated the workflow to v7.0.1/v7.1.0. This additional commit fixes an observed CI warning; it does not add package scope.

- 10 October, morning: implemented internal component grouping using complete folded prefixes. Added parent, leaf, nested, unrelated-directory, duplicate and stable-order regression cases. All 18 tests and syntax checks passed locally. Previous evening CI passed all six Node/OS jobs. The public entry point follows as the second task of this session.

- 10 October, morning: exposed checkPaths through the package entry point, added a runnable proposed-path example and API usage/error documentation. All 22 tests and syntax checks passed; example returned the expected parent collision. Public API now works without disk access. Scanner, CLI and declarations remain for later milestones. Next session: review mixed-separator provenance and multi-variant cases against the contract.

- 10 October, afternoon: reviewed original-path provenance and multi-spelling groups through the public API. Added regression cases for separator aliases, three-way conflicts, explicit directories, prototype-like names and distinct Unicode parents. All 27 tests passed. No implementation changes were needed: these cases confirmed the current grouping contract.

- 10 October, afternoon: added a JSON import-manifest example that checks destinations before any writes and exits 1 for the sample parent collision. Added process-level tests proving both examples work outside the repository working directory. All 29 tests and syntax checks passed locally. Morning CI also passed all six Node/OS jobs. Scanner and CLI remain scheduled for later days.

- 10 October, evening: added an independent pairwise reference checker and 300 reproducible generated manifests, checking both collision keys and full-report invariance under reversal. All 30 tests passed. No production bug was found. DevRelay tools were unavailable; a direct DEV search was used for developer experience context, not as the correctness oracle.

- 10 October, evening: added an API reference explaining every result field, nested reports, safe manual resolution, synchronous errors and clean-result limits. Executed both guide examples against the current API. All 30 tests pass; afternoon CI had passed all six jobs. Two commits completed this session; six substantive commits total on 10 October. Tomorrow: stronger validation/report guarantees and TypeScript declarations.
