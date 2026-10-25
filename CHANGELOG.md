# Changelog

## 2026-10-25 — Replace repository scaffold

- Removed the previous hackathon scaffold and added both supplied project directories. Kept each source tree intact to preserve its overlapping root filenames, manifests, and project notices.
- Added this root index and changelog.
- Compared copied file contents against both supplied folders by SHA-256; all 466 source files matched. No project tests were run.

## 2026-10-25 06:44 IST — Document the live game

- Replaced the root project index with a game README based on the live page, including its modes, controls, local play instructions, and source folder map.
- Clarified that the live page identifies as V17 while the included source snapshots are V10 and V11.1.
- Files: `README.md`, `CHANGELOG.md`.
- Validation: inspected the rendered live page and ran `git diff --check`; no project tests were run for this documentation change.
- Limitation: the repository does not establish that either included source snapshot is the exact source of the live V17 deployment.
