# Path comparison contract

Status: the proposed-path API implements this comparison contract. Directory scanning and CLI behavior below remain planned.

## Problem and scope

A proposed import containing `Docs/a.txt` and `docs/b.txt` can merge two intended directories on a case-insensitive destination. Checking basenames alone misses this. A checker must consider each component together with its full parent prefix.

Version 1 will compare ASCII case only: A–Z becomes a–z; every other character stays unchanged. This is a focused portability check, not a simulation of Windows, macOS or every filesystem. In particular, `Ä` and `ä`, or composed and decomposed Unicode, are not equivalent under this rule.

## Proposed path grammar

- Accept an array of relative path strings. The empty array is valid.
- Both `/` and `\` separate components on every host, including mixed separators.
- Reject nonstrings, empty strings, NUL, leading separators, and a leading drive prefix such as `C:`.
- Reject empty components, repeated or trailing separators, `.` and `..`. Do not silently resolve or normalize them.
- Directory inputs omit the trailing separator. Paths carry no file/directory type information.
- Preserve original input strings in reports. Exact duplicates do not create collisions or duplicate reported strings. Separator aliases alone are not case collisions.
- Whitespace, dots inside names, non-ASCII characters and other characters remain literal; acceptance does not imply destination filesystem validity.

## Collision grouping

Index each component by its ASCII-folded full prefix. Report a group only if it has at least two distinct original component spellings. Descendants identify the paths participating in parent collisions. Use zero-based component indices in the API and one-based numbers in human CLI output.

| Inputs | Expected collision keys |
| --- | --- |
| `Readme.md`, `README.md` | `readme.md` |
| `Docs/a`, `docs/b` | `docs` |
| `Docs/Guide.md`, `docs/Guide.md` | `docs` |
| `Docs/Guide.md`, `docs/guide.md` | `docs`, `docs/guide.md` |
| `one/readme`, `two/README` | none |
| `same`, `same` | none |
| `a/b`, `a\b` | none |
| `file`, `file/child` | none; structural type conflicts are outside scope |

The `checkPaths(paths)` result is `{ hasCollisions, collisions }`. Each collision contains `key`, `componentIndex`, `variants`, `paths`, and `reason`. Sort keys, variants and original paths with locale-independent JavaScript code-unit ordering. A single input may participate in multiple groups. Invalid proposed inputs throw TypeError and never return partial results.

## Existing directory scans (planned)

`scanDirectory` will inspect entries actually present on disk; it cannot reconstruct overwritten or rejected names. Include directories and symlink names, do not follow symlinks, and reject a symlink scan root. Default excluded directory basenames are `.git` and `node_modules`; explicit API ignores replace these defaults. Match ignore names exactly and case-sensitively, without globs. Reject unrepresentable on-disk names, including literal POSIX backslashes. Propagate permission and read failures rather than report an incomplete scan as clean. Scans require a stable tree; they are not atomic or a security boundary.

The planned CLI exit codes are 0 for clean/help, 1 for collisions, and 2 for bad arguments or scan errors. JSON and readable output must describe the same groups.

## Acceptance strategy

Always test proposed-path cases independently of the host filesystem. Run real collision fixtures only on filesystems that can store sibling case variants; report explicit skips otherwise. Include nested collisions, unrelated parents, duplicate inputs, mixed separators, stable ordering, invalid inputs, permission failures, symlinks, ignore behavior and CLI exit codes.
