# pathcase-audit

A Node.js utility in development for detecting ASCII case collisions in proposed paths and directory trees.

`Docs/a.txt` and `docs/b.txt` can coexist on a case-sensitive disk but conflict at the directory component when copied elsewhere. This project aims to expose that risk through a small JavaScript API and CLI. Filename portability is an existing problem; the focus here is precise behavior and clear reports.

## Current status

This repository is being rebuilt incrementally. The comparison contract and internal path parser are implemented and tested; the public collision API, scanner and CLI are not ready. There is no published npm release. Do not use the earlier prototype's installation claims for this rebuild.

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

The current twelve tests cover the internal path grammar, manifest validation and ASCII comparison helper. Invalid manifest entries identify their zero-based input index; exact duplicate strings are removed while separator aliases retain their original spelling. They do not yet verify a complete collision checker. The package is marked private at development version `0.1.0-dev.0` to prevent accidental publication before its public API is ready.

## Contributing

Read the comparison contract before changing behavior. Include a focused regression test with fixes, run the commands above, and distinguish implemented behavior from planned features in documentation. MIT licensed; see LICENSE.
