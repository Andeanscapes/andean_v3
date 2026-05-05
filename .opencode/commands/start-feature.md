---
description: Initialize feature development with full repo context and compact structured planning
---

Use caveman skill only when deep reasoning is required.

Before coding:

## 1. Context discovery
- Analyze only relevant codebase areas.
- Identify services, components, patterns, tests.
- Review:
  - `.github/copilot-instructions.md`
  - `.opencode/skills/andean-reviewer/SKILL.md`
  - relevant `.md` files in repo AND IDE (personalized instructions)
  - `/docs` (architecture decisions, future plans, constraints)
- Check `package.json` for available commands (lint, test, build, typecheck).
- Check @Codebase and undertand patterns and architecture

## 2. Pattern alignment
Output max 3 bullets:
- current pattern
- where change fits
- critical risks/constraints (including future plan alignment)

## 3. Plan (mandatory before coding)
Output max 5 bullets:
- steps
- affected files
- data flow changes
- i18n impact
- test impact

## 4. Implementation
- minimal safe diff
- reuse existing helpers/utils/components
- prefer existing patterns over new abstractions
- do NOT touch unrelated code
- apply changes only in targeted locations (avoid global side effects)
- ensure compatibility with `/docs` future architecture

## 5. Validation
Output only:
- commands to run (from package.json)
- manual checks
- edge risks (only if critical)

Rules:
- compact output only
- no assumptions, verify before acting
- no fake/mock data
- no hardcoded user-facing copy
- no `any`
- preserve service pattern, i18n, architecture
- avoid regressions (especially edge cases)
- align with `/docs` future plans (no blocking or conflicting changes)
- apply accessibility best practices (ARIA, labels, keyboard, focus states)
- ensure performance optimization (lazy loading, code splitting, minimal JS)
- follow Lighthouse best practices (performance, accessibility, SEO)
- ensure SEO fundamentals (semantic HTML, metadata, alt text, structure)
- stop when task is complete