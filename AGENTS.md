# AGENTS.md

## Verification

A code change is done when `pnpm lint` passes and `pnpm build` has regenerated `dist/`. Whether a page actually behaves is checked by hand, so report runtime effects as unverified rather than building browser automation or live-site smoke tests.

## Agent skills

### Issue tracker

Issues live in GitHub Issues (`IronKinoko/agefans-enhance`), driven by the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles map to their default label strings. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` plus `docs/adr/` at the repo root. See `docs/agents/domain.md`.
