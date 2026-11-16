# CLUBLINE 99 v1.115.0 - connected planning and report navigation

## Changes
- Streamlined news links now show the requested squad-cover and training reports. Player conversations, profiles, statistics, form and other squad routes share the established In-depth content renderer, preventing silent fallbacks to the XI.
- Finance alerts now show finances and funding rather than the generic club workspace. Season-expectations links and the welcome briefing can reach the actual objectives and confidence panels.
- Team has a compact, optional Team reports & advice menu for planning, squad cover, training, conversations, profiles and statistics.
- Club planning is directly accessible from the Streamlined club screen, with finance/contracts, expectations, stadium planning and existing season tools together.
- The Season screen picker includes the match-week planner, newsroom, club history and season review archive in both modes, and stays available while browsing those screens.

## Verification
Desktop Chrome, actual application controls, Streamlined Arsenal career: create career; save/reload; open team reports, cover, training and conversations; browse the Season planner and newsroom; follow a season-expectations news link; open club planning and finances; save a stadium blueprint for N4 exterior red brick to grey metal; review and pay £16,000; advance through loan/scouting decisions and a club story; observe reopening on 10 August and a completed-project count of one; answer the pre-match press question with No comment; simulate Arsenal v Wimbledon on 15 August (3-0); complete results/table screens; open the generated weekly training report; return to the planner. Browser layout inspected at the supplied desktop viewport.

Both-mode handler tests cover news destinations, conversation/report routes, season-menu availability, unchanged date/cash/selection/player/training state when opening reports, compressed reload and portable backup. The two-phase calendar integration is repeated in both modes through 20 August, with one managed match and two completed project records each. Source integrity checks all five playable divisions, module syntax, assets and 219 exact cache/import URLs.

This release does not repeat the full multi-season tests. In-depth full browser journeys, a second paid phase in the browser, physical Android and production offline upgrades remain outstanding. No game-data, match-engine, media-effect or save-schema change. Existing stable save key retained.

Export a backup before updating. The cumulative ZIP supports v1.94 through v1.114; the complete ZIP includes all game data and assets. No fresh career required. Nothing published.
