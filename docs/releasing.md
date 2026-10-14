# Release guide

This is a maintainer checklist, not evidence of publication. The current development version is `0.1.0-dev.0` with `private: true`. The proposed first registry release is **0.1.0**: a usable initial API with a deliberately limited ASCII comparison scope. Pre-1.0 consumers should pin versions when depending on exact behavior. Record compatibility changes in release notes and never reuse a published version.

## Before changing release metadata

1. Review the working tree and ensure all intended changes are committed. Review the public API, README, package entry points, bin, files allowlist, engine requirement and license.
2. Run syntax, source, runtime, consumer-type, package-content and fresh-install checks from the contributing guide. Confirm the current commit's Node 22/24 Linux/macOS/Windows CI results. Record capability skips honestly.
3. Check npm name availability/ownership and authenticate through npm's normal local login flow. Never put passwords or tokens in chat, source, scripts or documentation. Stop if the account cannot publish this name; do not silently rename the package.
4. Review the assignment checklist and any remaining blockers. Ensure the documentation states what is actually available.

## Prepare and publish

1. Change to the intended release version and remove `private: true` only when publication is ready. Keep package-lock metadata synchronized. Update release notes and installation instructions for the exact version being published.
2. Rerun packaging and consumer checks after metadata changes. Inspect `npm pack --dry-run --json`, then create the final tarball with `npm pack`. Verify its file list, version and contents before publishing that tarball.
3. Publish through authorized npm credentials. If npm requests interactive authentication or access is missing, report the blocker; never claim publication from a successful pack alone.
4. Verify the live registry version, integrity metadata and package listing. Install the published exact version in a fresh consumer and exercise the documented API and CLI again. Local tarball installation does not substitute for this registry check.
5. Push the final release commit, create the matching version tag only after the release is verified, and record the verified GitHub/npm links and remaining limitations.

No CI workflow currently publishes automatically. Any future automated publishing setup needs a separately reviewed credential and permissions plan.

## If publication fails

Keep the tested source and tarball. Record which check or registry operation failed and what access or action is needed. A package remains unpublished until registry and consumer verification succeed. Never overwrite an existing registry release or backdate commits to make the schedule appear complete.
