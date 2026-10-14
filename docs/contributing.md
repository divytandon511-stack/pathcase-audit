# Contributing

Start with the [comparison contract](path-contract.md) and [API reference](api.md). This package checks ASCII case collisions at every component. Keep new behavior focused on that rule; do not silently add Unicode normalization or unrelated filesystem checks.

## Local setup

Use Node.js 22 or newer, clone the repository and run `npm ci`. The source is JavaScript ESM with JSDoc checks and published TypeScript declarations; no build step is required. Runtime dependencies are intentionally absent.

```sh
npm run check
npm run check:source
npm test
npm run test:types
npm run check:package
npm run check:install
```

Run these commands before submitting a pull request. The last two check the actual npm payload and an isolated consumer installation, not just imports from the checkout. npm pack/install checks require the development dependencies from `npm ci`, but do not publish or require npm login.

## Tests and changes

- Reproduce bugs with a focused regression case. Use `checkPaths` for logical comparison cases so they run on every filesystem.
- For filesystem tests, use temporary directories and register cleanup. Detect missing capabilities explicitly; never silently pass a case your host cannot represent. A case-insensitive Mac can skip collision fixtures while Linux CI exercises them.
- Test CLI changes at the process boundary: exit code, stdout and stderr. Exit 1 is a completed collision report; exit 2 means failure. Check readable and JSON output together.
- Keep public declarations and documentation aligned with runtime behavior. Internal modules are not supported public imports.
- Preserve deterministic code-unit sorting and original path evidence. Avoid locale-sensitive ordering.
- Do not depend on exact filesystem error text. Test stable codes where appropriate and restore permissions in cleanup.

Use short commit messages describing the actual change. A pull request should explain the problem, resulting behavior and checks run. Include host-dependent skips rather than calling them passes. Do not include credentials, generated tarballs or node_modules.

## Reporting a bug

Include the package and Node versions, operating system, whether the filesystem is case-sensitive, a minimal proposed-path list or directory layout, the expected result and the actual result. For CLI problems, include the command, exit code and relevant output. Replace private path names while preserving the casing and component relationship needed to reproduce the issue.

See the [release guide](releasing.md) for versioning and publication checks. Contributions use the repository's MIT license.
