# Andean Scapes — Repo-Level AI Instructions (OpenCode)

## Efficiency Rules for This Repo
- Do not inspect unrelated packages.
- For frontend changes, focus on the target component, its imports, and nearby tests.
- For backend changes, focus on the target service, route/controller, and related tests.
- Prefer `rg` over broad file reads.
- Prefer one small patch over multiple exploratory edits.

---

## General Coding Behavior
- Make minimal diffs.
- Preserve existing style.
- Do not add new dependencies unless needed.
- Ask before large refactors.
- Ask before destructive commands.
- Run only targeted tests/lint.
- Stop once the task is complete.

---

> Full architecture, design-system, security, and i18n rules live in `.github/copilot-instructions.md`.
> That file is the single source of truth for this repo. These rules are additive.
