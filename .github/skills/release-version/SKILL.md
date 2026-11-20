---
name: release-version
description: Prepare a software version release by following the repository's versioning, commit, tag, and release-note conventions. Use when asked to bump a version, commit release changes, publish a tag or GitHub Release, or revise release notes.
---

# Version and release workflow

Follow the current repository's conventions and the user's requested scope. Ask the user to choose `patch`, `minor`, or `major` whenever they request a version bump without specifying the increment. Do not push, deploy, or publish/edit a release unless the user asks for those actions.

## 1. Inspect the repository

- Check the working tree, current branch, upstream/default branch, recent commits, and applicable project instructions. Preserve unrelated work; never stage or revert it.
- Review the code changes and run the relevant checks before preparing a release.
- Locate the authoritative version manifest and inspect package-manager version scripts, hooks, and release automation before running a version command.
- Check the latest release/tag and read a recent release's notes to learn the repository's version and formatting conventions.
- Before creating anything, check whether the target tag or release already exists. If it exists, update it only when requested; do not create duplicate tags/releases.
- If the target branch, existing changes, or automated side effects make the requested scope unclear, stop and ask before publishing.

## 2. Commit code changes

- If release-related code changes are not committed, review the diff, run relevant checks, and commit those changes first using the repository's commit convention.
- Preserve unrelated changes and stage only files in scope. If changes are already committed, do not create a duplicate code commit.

## 3. Bump the version

- Use the user's selected increment with the repository's standard version command (for example, `pnpm version patch`, `pnpm version minor`, or `pnpm version major`).
- Inspect lifecycle scripts first. The command may run validation/build hooks, create a version commit and tag, deploy, or push; do not assume it only edits a manifest.
- Run the command only when its configured side effects are within the user's authorization. If a necessary side effect is unclear or unwanted, explain it and ask before proceeding; do not silently substitute a manual bump.
- Let the version command own version-commit/tag creation when it does so. Do not create duplicate version commits, tags, or pushes.
- Review the resulting version, commit, tag, generated files, and working-tree status. Run any required checks not already performed by the command's hooks.

## 4. Handle an existing tag or release

- Never rewrite commit history or delete a published release/tag as an automatic cleanup step.
- If the user explicitly asks to roll back a version/tag, identify whether they mean the local tag, remote tag, package version, and/or the published GitHub Release. Ask before deleting a published release if that was not explicit.
- If the target version already has a GitHub Release, update its notes with `gh release edit` when requested rather than attempting to create a duplicate. Create a new release only when that tag does not already have one.

## 5. Write and publish Release notes

Match the latest release's language, headings, and level of detail. Use relevant categories (for example, `## 新增`, `## 优化`, or `## 修复`) and concise bullets describing user-visible changes. Include a contributor thank-you only when requested, and link the actual contributor/comment rather than using a fixed example. When the repository uses compare links, finish with the previous-to-current comparison URL.

For multi-line GitHub Release notes, use a PowerShell here-string piped to `gh`. Replace the variables and sample notes with the actual repository, versions, and changes; omit optional sections that do not apply:

```powershell
$owner = "<repository-owner>"
$repository = "<repository-name>"
$tag = "<release-tag>"
$previousTag = "<previous-release-tag>"
$notes = @"
## <category>
- <user-visible change>

**Full commit history:** https://github.com/$owner/$repository/compare/$previousTag...$tag
"@

$notes | gh release create $tag --title $tag --notes-file -
```

If the repository's established notes are in another language or use another format, adapt the sample accordingly. If updating an existing release, use `gh release edit $tag --notes-file -` with the same notes variable.

## 6. Verify publication

- Read the release with `gh release view $tag` and verify its title, tag, notes, requested contributor credit, and comparison link.
- Confirm the remote branch and tag point to the intended release commit and check the final working-tree status.
- Report the commit, version, tag, release URL, validation results, and any requested step that could not be completed.

## Repository-specific automation

This repository's `package.json` currently defines `preversion` (lint), `version` (build), and `postversion` (deploy `dist`, then push Git and tags). Thus, running any `pnpm version <patch|minor|major>` command also performs those actions. Include this behavior in the user's confirmation before executing the command.
