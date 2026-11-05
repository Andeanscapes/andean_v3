---
description: Review current changes against Andean Scapes architecture rules (strict + compact)
agent: build
subtask: false
---

Use the `andean-reviewer` skill.

Review the changes as a strict senior reviewer. Be concise and critical. Read-only: do not edit files, commit, push, or install anything.

Context:
- Branch: !`git branch --show-current`
- Status: !`git status --short | head -50`
- Uncommitted diff: !`git diff --stat HEAD | tail -30`
- Commits not in develop: !`git fetch -q origin develop 2>/dev/null; git log --oneline origin/develop..HEAD | head -20`
- Base argument: `$ARGUMENTS`

Scope:
- PRs target `develop` (the remote default branch), not `main`.
- If a base argument is given, review `git diff <base>...HEAD` plus uncommitted changes.
- Otherwise review uncommitted changes (including untracked files) AND `git diff origin/develop...HEAD`. State in Summary which ranges were reviewed.
- Ignore lockfiles, build output, and vendored skills unless they are the point of the change.

Reviewer mindset:
- Practical: minimum change that reaches the goal; current project style is the standard.
- Easy for a junior dev to read and maintain; simple and explicit over clever and abstract.
- Apply SOLID/patterns/scalability only where they fix a real problem in this diff; no speculative abstractions.
- Every suggestion must make the code simpler or safer; otherwise drop it.

Check against:
- `.github/copilot-instructions.md`
- `.opencode/skills/andean-reviewer/SKILL.md`
- relevant `.md` files in repo AND IDE (personalized rules)
- `/docs` (architecture decisions, future plans, constraints)
- `package.json` (validate commands: lint, test, build, typecheck)

Focus on:
- service-layer pattern: fetch → validate → translate → return
- Next.js App Router boundaries (server/client separation)
- provider topology and scope
- next-intl i18n (en/es/fr sync, no hardcoded copy)
- wrapper-first UI system (reuse primitives)
- no fake/mock data; no local data registries (feed is the only source)
- no invented APIs, fields, or routes
- strict TypeScript (no `any`)
- security (validation, XSS, unsafe URLs, secrets)
- minimal safe diff (no unrelated refactors)
- reuse helpers/utils; avoid duplication
- changes limited to targeted areas (no global side effects)
- regression risk (edge cases, shared components, cross-feature impact)
- performance (lazy loading, code splitting, avoid unnecessary JS)
- accessibility (ARIA, labels, keyboard, focus states)
- SEO (semantic HTML, metadata, alt text, structure)
- Lighthouse impact (performance, accessibility, SEO)
- alignment with `/docs` future architecture (no conflicting patterns)
- Cloudflare/D1/Lambda future compatibility

Design audit (conditional):
- Only if the diff touches UI files (components, styles, layouts, animations): load the `apple-design` skill and audit UI changes against it.
- Repo design system, tokens, and wrappers take priority; flag apple-design deviations only where the repo has no rule.
- Check: interaction states (hover/press/focus), motion (interruptible, `prefers-reduced-motion`), spacing/hierarchy, feedback responsiveness.
- Report under Design, not Blocking, unless it is also an accessibility or design-system violation.
- Exception: a new animation library dependency (e.g. `motion`, `framer-motion`) is always Blocking unless explicitly approved.
- Skip entirely if no UI files changed.

Extra checklists (load only if available and applicable):
- Source code changed → `review-clean-code`.
- Backend/worker/service files changed → `review-backend`.
- Project rules win on conflict.

Output (compact):

## Summary
- what changed + score (1–10)

## Blocking Issues
- only critical violations (include future-architecture conflicts)

## Improvements
- optional, high-impact only

## Clean Code & SOLID (only if code changed)
- high-impact only, `path:line`

## Design (only if UI changed)
- apple-design findings, high-impact only

## Suggested Tests
- targeted commands (from package.json) + key cases

## Final Decision
- APPROVE | REQUEST CHANGES | REJECT

Always end the response with this exact last line, never omit or paraphrase it:
`Final Decision: APPROVE` | `Final Decision: REQUEST CHANGES` | `Final Decision: REJECT`
