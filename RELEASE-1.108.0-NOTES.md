# CLUBLINE 99 v1.108.0 - follow your stadium project

Active construction now shows the start and expected reopening dates, days remaining and a calendar progress bar. This is elapsed calendar time, not separate simulated construction milestones. Closed section names, current usable seats and total capacity after reopening are shown together.

A details panel lists remaining unplayed home-ground fixtures before reopening and the available seats during works. It is recalculated from the live schedule rather than the original quote, so played/rescheduled fixtures drop out as appropriate. Neutral and away fixtures are excluded; home-ground friendlies remain included. The opening date itself is outside the closure period.

The view explicitly shows the amount already paid. It never spends money, advances time or completes the project. Existing daily/load completion handling opens the sections without a second payment. Older projects without a recorded start date retain dates and fixture information, with a progress-unavailable notice rather than an invented percentage.

The existing Facilities/designer status is expanded. The same status is also shown in the Streamlined Club workspace. The one-active-project rule remains; no construction queue or new save fields are introduced.

Verification: pure cases cover year boundaries, progress bounds, remaining fixture exclusions, proposed capacity, older project fallback, read-only rendering and completion without another payment. Quote regressions pass. Both management modes pass status/quote rendering, unchanged state while viewing, confirmation once, active blockers, compressed save/reload and portable backup. Source checks pass with 204 exact cache/import URLs; data files are unchanged. No fresh browser layout, full-season, physical Android or production offline update run was performed for this release.

Export a career backup first. Cumulative ZIP supports v1.94 through v1.107; complete build includes all assets. No fresh career required. Nothing published.
