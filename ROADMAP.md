# Clubline 99 development priorities

Updated 16 November 2026, after v1.125.0.

## Current state
v1.125 adds a continuous light recorded traffic floor, UI clicks, three date-simulation policies with recaps, the compact section-first stadium builder, 40 historical starting managers under the existing names toggle, and named passages during matches. Bounded actual-handler journeys and a desktop browser run cover the new flows. Physical-phone listening and narrow-screen interaction still need feedback. Starting-manager research remains to be extended to lower English and European clubs.

v1.124 unifies four-week cash forecasts across the full finance screen, Streamlined budget and transfer previews. It distinguishes the four-payroll allowance from the full operating forecast and shows weeks of regular bills covered. Two additional Scottish careers (83 managed matches, 27 save/backup checkpoints) and 20 controlled five-division transitions extend the reliability evidence; rates remain unchanged. Prepared builds are ahead of the user-confirmed v1.114 live deployment.

v1.123 integrates 31 edited clips from 22 approved recorded sources. Background sounds follow the current screen; goals, saves and match whistles follow newly displayed events. Both-mode real-engine event tests and desktop controls/training navigation are covered. Next audio work is in-game listening on phones and mix refinement, not a return to the rejected synthesized palette.

v1.122 withdraws the rejected v1.121 synthesized sound palette. The approved catalogue is empty; ambience controls are unavailable. Next audio step: audition a couple of real recorded candidates using the FIFA Soccer Manager reference for screen context. See AUDIO-REVIEW.md.

v1.121 adds a first synthesized ambience palette: sparse ordinary-day clips, a soft matchday crowd bed, context changes and fades, independent volume/mute controls, menu-only music by default, and offline media ranges. Timing/codec/cache checks and desktop control persistence are covered; physical-device listening and further palette tuning remain.

v1.120 adds connected Scottish ground approaches, grass outside the current stadium footprint, construction-aware path clearance, clearer scaffolds and low-stand floodlight framing. Coverage now includes all 56 Scottish defaults and active-work variants in source-render checks; a new browser journey remains outstanding.

Scottish surroundings repaired in v1.119.0: five shared SVG districts now place buildings in road-free plots, with the stadium reserve protected. Aberdeen and four other default stadium scenes checked as assembled source renders. Individual real-world neighbourhood recreations and a broader browser/site-layout pass remain future work.

Implemented: manager/media responses and follow-ups, personal rivalry context, history-aware questions, squad succession and youth opportunity reviews, tactical match timelines, buyer/seller safeguards and annual AI funds, saved stadium blueprints and separate paid phases, active works and project history, searchable league news, the 14/30-day match-week planner, consistent wage obligations across financial screens, generated-player identity repair, the read-only Season stories view, and stadium comparison/section-state review.

v1.116 exercises three careers over two seasons each with optional transfers, loans, renewals and youth decisions, alongside fee-ledger and save checks. This is bounded interaction/accounting evidence; extreme spending, all clubs and all promotion/relegation paths remain outside the tested scope. Desktop browser checks confirm loan payroll consistency and repaired fictional identities. v1.115 retains the construction-to-match browser journey; two separately paid stadium phases remain verified in both modes at code level.

## Next larger batches
1. Match presentation and balance: prototype an event-linked top-down shirt-and-ball view; first retain the new named passages. Calibrate managed and background scores across many seeds. The v1.125 background-score diagnostic finds Premier scoring somewhat high; it does not establish full historical realism. See MATCH-VIEW-PLAN.md.
2. Extend browser coverage to the full In-depth journey and more club/site layouts. Two separately paid phases are now covered in the Streamlined browser journey; physical Android and real offline upgrades remain outstanding.
3. Extend career balance coverage to more divisions, aggressive spending and promotion/relegation paths. Preserve the new mixed-choice career checks and avoid changing rates solely to fit one strategy.
4. Expand the new recorded Season stories with further distinct achievements and longer-running manager narratives, retaining explicit source context and optional/no-comment press choices.
5. Further stadium-detail polish and broader visual coverage, retaining site/capacity/booking safeguards and separate confirmation of each paid phase.
6. Audio listening pass: assess the v1.123 recorded excerpts and mix on real phones and through full matches. Tune levels, loop seam, intervals and screen transitions from feedback. Preserve source credits, event-triggered reactions, no replay on reload, no reaction queues in fast simulation, and the withdrawn synthesized-palette block.
7. Pending public-release checkpoint: review names, branding, databases, artwork/music and other asset/code licences using current guidance. See RELEASE-PLANNING.md. This is not yet a release candidate or public-release preparation milestone.

## Release cadence
Group related changes and their verification into coherent larger batches. Avoid one release per small panel or wording change. Preserve existing careers and stable save keys. Do not publish automatically.
