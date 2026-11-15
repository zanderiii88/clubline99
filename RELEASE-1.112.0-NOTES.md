# CLUBLINE 99 v1.112.0 - league newsroom batch

League newsroom replaces the old last-30-items news view and adds entry cards from the Club workspace in both management modes. It gathers existing recorded news into results/rivalries, transfers (including free-agent bulletins), managers/press, youth/development, finance and club-life categories. Emerging-player coverage uses existing youth, development and milestone records; this round does not invent additional player achievements.

Filter all clubs, the managed club or clubs in its current division; choose 7/30 days or all retained news; search story text, identified clubs and known player names. Display starts at 40 items with further 40-item pages, up to 1,000 per filtered view. Filtering never removes source news. View settings reset when opening a saved/new career. Global summaries without a club remain under All clubs; division scope uses current membership, not a reconstructed historical division.

Selected rivalry results and wins by four or more goals are derived from retained completed schedules. Future, unplayed and friendly fixtures are excluded. The feed labels derived result headlines and links both clubs. Existing actions connect transfers, club/manager changes, player records, match reports, development and retained press exchanges. An exchange removed by the existing log limit shows a notice instead of a dead link.

Stories are newest-date first, with newer recorded items first on equal dates. Repeated identical records are collapsed for display. The newsroom is read-only: no new persistent story log, automatic morale change, time advance or simulation change. Previous seasons can have incomplete retained data; result summaries use retained schedule rows.

Verification: pure filtering/date/deduplication, category/scope/search, pagination, completed derby/big results, friendly/unplayed/future exclusions and no mutation. Both-mode application checks cover route access, filtering/search/empty states, escaped text, safe old press entries, club links, unchanged career while browsing, compressed reload and backups. Source checks pass with 216 exact cache/import URLs. Browser renderer fixtures were inspected at 390px and 850px for controls, search and card readability. This is layout fixture QA, not a full live browser workflow or physical Android test. No fresh full-season or production offline upgrade test this round. Data files unchanged.

Export a backup first. Cumulative ZIP supports v1.94 through v1.111; complete ZIP includes all assets. No fresh career required. Nothing published.
