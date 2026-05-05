---
description: Initialize feature development with full repo context and compact structured planning
---

Use caveman skill only when deep reasoning is required.

Before coding:

## 1. Context discovery
- Analyze only relevant codebase areas.
- Identify relevant services, components, patterns, tests.
- Review:
  - `.github/copilot-instructions.md`
  - `.opencode/skills/andean-reviewer/SKILL.md`
  - relevant `.md` files only

## 2. Pattern alignment
Output max 3 bullets:
- current pattern
- where this change fits
- critical risks/constraints

## 3. Plan mandatory before coding
Output max 5 bullets covering:
- implementation steps
- affected files
- data flow changes
- i18n impact
- test impact

## 4. Implementation
- minimal safe diff
- no unrelated refactors
- prefer existing patterns over new abstractions

## 5. Validation
Output only:
- commands to run
- manual checks
- remaining risks, if any

Rules:
- compact output
- no long explanations
- no repeated architecture summaries
- no fake mock data
- no hardcoded user-facing copy
- no `any`
- preserve service pattern
- preserve i18n
- preserve architecture
- stop once task is complete