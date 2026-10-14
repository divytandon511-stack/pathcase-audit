# Release notes

## Unreleased — planned 0.1.0

No npm release is claimed here. Current development version: `0.1.0-dev.0`.

- `checkPaths` checks proposed relative paths without disk access, grouping ASCII case collisions at every component.
- `scanDirectory` checks existing files, directories and symlink names with exact configurable directory ignores and explicit read failures.
- `pathcase-audit` provides readable/JSON reports, help and exit codes 0 (clean/help), 1 (collisions) and 2 (failure).
- TypeScript declarations accompany the JavaScript ESM API. Requires Node.js 22 or newer, with no runtime dependencies.
- Tests cover deterministic reports, validation, filesystem capabilities, CLI errors, output writes and fresh tarball consumers across the CI matrix.

Known scope: ASCII case only; no Unicode normalization, reserved filename validation, import-statement analysis, automatic renaming or atomic filesystem snapshot. Large inputs and reports are held in memory. See the README for full limitations.
