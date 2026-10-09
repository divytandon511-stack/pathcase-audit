# pathcase-audit

A Node.js utility in development for detecting ASCII case collisions in proposed paths and directory trees.

`Docs/a.txt` and `docs/b.txt` can coexist on a case-sensitive disk but conflict at the directory component when copied elsewhere. This project aims to expose that risk through a small JavaScript API and CLI. Filename portability is an existing problem; the focus here is precise behavior and clear reports.

## Current status

This repository is being rebuilt incrementally. The comparison contract is defined; the public collision API, scanner and CLI are not ready. There is no published npm release. Do not use the earlier prototype's installation claims for this rebuild.

- [Path comparison contract](docs/path-contract.md): grammar, comparison rule, proposed result and acceptance cases.
- [Development plan](DEVELOPMENT-PLAN.md): milestones and actual progress.

The initial release will check ASCII case only, not full Unicode or operating-system filename compatibility.
