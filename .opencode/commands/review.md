---
description: Review current changes against Andean Scapes architecture rules
---

Use the `andean-reviewer` skill.

Review the current git changes as a strict senior code reviewer.

Check against:
- `.github/copilot-instructions.md`
- `.opencode/skills/andean-reviewer/SKILL.md`

Focus on:
- service-layer pattern: fetch → validate → translate → return
- Next.js App Router boundaries
- provider topology
- next-intl i18n for en/es/fr
- wrapper-first UI system
- no fake mock data outside approved registries
- no hardcoded user-facing copy
- no `any`
- security risks
- minimal safe diff
- Cloudflare/D1/Lambda future compatibility

Output:

## Summary
## Blocking Issues
## Improvements
## Suggested Tests
## Final Decision

Final decision must be one of:
- APPROVE
- REQUEST CHANGES
- REJECT
