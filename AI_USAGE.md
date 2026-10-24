# AI usage record

If maintaining this record, briefly document the actual contributions of whichever AI tools you use at Devin Hack Kochi. Add a row after each meaningful task or milestone. Keep summaries concise and omit secrets, private data, and full chat transcripts.

## Event build log

No participant AI usage has been recorded yet. Replace the placeholder row as you build. Mark human review as pending until someone has reviewed the contribution.

| Date and time with timezone | Tool / model, if known | Task | Assistance and affected files | Human review / corrections | Validation and result |
| --- | --- | --- | --- | --- | --- |
| 2026-10-24T22:55:00+05:30 | Devin (Cognition AI) | Repository assessment, rebuild plan, and bootstrap | Planned the rebuild (approved by @adhentom). Copied event docs from junk-arena and created the Next.js/Phaser scaffold (`package.json`, configs, `src/app`, `src/ui`, `src/game/phaser`) | Plan approved by @adhentom. I pushed this commit straight to `main` on my reading of "approve plan"; @adhentom later confirmed keeping it there. Code review pending | typecheck, lint and build passed; `npm test` exited 1 (no test files) |
| 2026-10-24T23:10:59+05:30 | Devin (Cognition AI) | M0 fix: client-boundary test and favicon | Added `src/ui/clientBoundary.test.ts` and `src/app/icon.svg` | Fix approach chosen by @adhentom; review pending | lint, typecheck, build passed; `npm test` 1 file / 3 tests passed; test fails when a Phaser import is added to `page.tsx` |

## Template preparation

This historical preparation note refers to the older template. It does not define Devin Hack Kochi's event rules or AI tool requirements.

On 10 October 2026, Codex prepared this documentation template from the organizer's supplied rules and checked the linked Luma page for the event name and dates. This covered `README.md`, `RULES.md`, `AGENTS.md`, `CHANGELOG.md`, `AI_USAGE.md`, `SUBMISSION.md`, `.gitignore`, and the pull request checklist. Agent validation covered local links, event consistency, required documents, and diff whitespace; organizer review is pending.

This preparation is separate from participant project implementation and participant AI usage during the event.

## Event documentation correction — 2026-10-24T21:53:05+05:30

- Tool: Codex.
- Task: correct the organizer-shared template to Devin Hack Kochi and clarify
  that the event has no major AI usage constraints.
- Affected files: `.github/pull_request_template.md`, `AGENTS.md`, `AI_USAGE.md`, `CHANGELOG.md`, `README.md`, `RULES.md`, `SUBMISSION.md`.
- Human review: pending maintainer review of this pull request.
- Validation: documentation diff, whitespace, and local Markdown link checks;
  no application code changed and no runtime checks were needed.
