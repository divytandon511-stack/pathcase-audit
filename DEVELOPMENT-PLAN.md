# Incremental rebuild of pathcase-audit

Deadline: 18 November 2026 (Asia/Kolkata).
Daily session: 10:00 AM India time, via the chat heartbeat build-pathcase-audit-daily.

## Current state — 9 October

Planning only. No implementation copied into this fresh repository.
The previous completed prototype is retained in ../pathcase-audit as a backup/reference.
GitHub reset status: BLOCKED, NOT DELETED. `gh repo delete divytandon511-stack/pathcase-audit --yes` returned HTTP 403 because the credential lacks delete_repo scope. Do not push this new history to the existing repository or repeatedly retry without an access change.
User can authorize locally with `gh auth refresh -h github.com -s delete_repo`; never request tokens in chat. Once deletion succeeds, record RESET COMPLETE here, recreate the public repository, and push the new history. Never delete it again on later runs.

## Purpose and acceptance criteria

Build a small reusable Node.js package that detects ASCII case collisions in every relative path component. Provide a proposed-path API and existing-directory CLI. Report original paths, conflicting component and reason deterministically. Document input validation, separators, duplicates, ignores, symlinks, errors and filesystem limits. Do not claim full Unicode or operating-system compatibility.

Assignment: purpose, project structure, public GitHub repository, package.json, source, tests, README, examples, installation instructions and verified npm publication. README must cover purpose, usefulness, installation, usage, methods, parameters, return values, examples, limitations and contributions.

## Milestones

- 9–18 October: write the comparison/input contract, build minimal package structure, implement proposed-path API incrementally with meaningful tests.
- 19–28 October: directory traversal, symlinks/ignores/errors, CLI arguments, readable and JSON output, exit codes.
- 29 October–7 November: edge-case review, case-sensitive filesystem tests, TypeScript declarations, installation examples and documentation.
- 8–15 November: package contents, fresh consumer install, supported Node/platform checks, release candidate, npm authentication/publication when available.
- 16–18 November: fix remaining defects, verify public repository and npm installation, final rubric audit and accurate LinkedIn draft.

## Session rules

Read current code, Git status and this log before changes. Complete one useful bounded improvement, run relevant checks and commit with the real date. Do not manufacture history, backdate commits, add empty commits or split completed prototype code across days to simulate work. Do not rebuild the whole package in a single session. If no meaningful change is needed, skip the commit. Preserve user changes. Record actual results and blockers. Do not post to LinkedIn.

GitHub commits/pushes and eventual publication are authorized. Remote operations still depend on credentials. npm authentication and GitHub workflow scope were unavailable during the prototype. Final release must be verified rather than assumed. Stop after 18 November.

## Progress

- 9 October: established fresh development plan and local repository; daily schedule created. Remote deletion blocked on permission. No package functionality is claimed for the rebuild yet.
