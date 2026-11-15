# CLUBLINE 99 v1.114.0 - integrated planning reliability batch

## Fixes
- News date filters now cover exactly the selected number of calendar dates including today, rather than including an extra oldest date.
- The match-week planner no longer shows a pending pre-match question after its fixture has already been played. Existing post-match response windows still work separately.
- News entries referring to a match report no longer retained in either current reports or archives show an unavailable notice instead of an unusable report button. Existing retained report links continue to use the established report handler.

## Integrated verification
A seeded Arsenal career in each management mode saves a two-stand target, starts the first phase, follows actual calendar advancement and required decisions, restores the target after completion, starts the remaining phase, plays the first scheduled match and reaches 20 August with two completed project records. The planner, newsroom and construction status are rendered repeatedly without changing career state. Each run makes two compressed save/reload and portable-backup checkpoints; blueprint and historical project records remain present. Streamlined: 33 steps, one match. In-depth: 32 steps, one match. This is code-level integration using real handlers with DOM/timer stubs, not browser execution.

Focused newsroom/date/press-reminder tests and existing blueprint workflows pass in both modes. Source integrity passes with 219 exact cache/import URLs. Data files are unchanged. No new full-season, physical Android or production offline-upgrade test this release.

A full live-browser playtest was attempted but the browser action did not execute: automatic approval review could not complete because a usage limit was reached. Browser interaction was not retried or replaced with another browser-control method. Prior rendered-layout checks remain historical.

Export a backup before updating. Cumulative ZIP supports v1.94 through v1.113. Complete build includes all assets. No fresh career required. Nothing published.
