---
description: Review current changes against Andean Scapes architecture rules (strict + compact)
---

Use the `andean-reviewer` skill.

Review current git changes as a strict senior reviewer. Be concise and critical.

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
- no fake/mock data outside approved registries
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

Output (compact):

## Summary
- what changed + score (1–10)

## Blocking Issues
- only critical violations (include future-architecture conflicts)

## Improvements
- optional, high-impact only

## Suggested Tests
- targeted commands (from package.json) + key cases

## Final Decision
- APPROVE | REQUEST CHANGES | REJECT
