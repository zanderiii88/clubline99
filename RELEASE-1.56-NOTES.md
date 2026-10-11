# Clubline 99 — 1.56.0: Three English divisions

This is a complete application package based on the inspected 1.55.0 Navigation & Checklist release. The saved download has two parts: Game and Audio-Menu-Assets. Extract both ZIPs into one folder, then upload that folder’s contents into the existing GitHub Pages folder, replacing matching files. Both parts are required, including for the offline cache. No deployment has been performed. Previous ZIPs do not need to be uploaded first.

## Implemented

- Choose Premier, First or Second Division when starting a career. Club names remain alphabetically sorted within the chosen division, including renamed clubs; swipe browsing stays within it.
- 68 clubs and 1,428 starting players: the original 20 clubs/420 player records are preserved; the reviewed 48 lower-division clubs/1,008 players are added. Lower squads are mostly invented, with 17 selected period-player parodies.
- Lower clubs include home/away/goalkeeper kits, fixed surroundings, modular stadium layouts and the draft club finances. Three additional generic surroundings settings supplement reused scenes.
- 38 Premier matches per club; 46 in each lower division. Each opponent is played once home and once away. Generated period-inspired dates, not an exact historical fixture reproduction: Premier starts 15 August 1998, lower divisions 8 August 1998. Career starts 3 August.
- Other divisions play as time advances, including after your club's own fixtures end. Results and player appearance statistics settle once.
- Organiser division buttons show every table, fixtures/results and clubs. Your calendar remains your own club's schedule.
- Lower divisions promote the top two automatically; third through sixth enter two-legged semi-finals (third versus sixth, fourth versus fifth), with the higher side at home in the second leg. Winners play a neutral final at fictional Wembley Fields.
- In 1998–99, tied aggregates go to simulated extra time, then away goals if still tied, then penalties. Away goals cease from 1999–2000. Finals use extra time and penalties if required.
- The bottom three Premier clubs move to First; the bottom three First clubs move to Second. The Second Division is the bottom of this playable pyramid and has no relegation into an unbuilt fourth tier. Sizes stay 20/24/24.
- Table bands identify automatic promotion, playoffs and relegation. CL/UC bands are deferred until qualification exists.
- Season rollover archives tables, division membership and playoff outcomes. The managed club, roster ownership and stadium stay with the same club ID.
- League prizes reflect division and position. Expectations reflect the club's current division. Lower-league match strength uses its starting squad as the reference, avoiding a blanket penalty against top-flight ratings.
- Existing top-flight careers and backups are migrated: original fixture dates/scores, current match and club/player IDs remain. New leagues are added without replaying original fixtures.
- Shared Selwood Park: a generated Croydon home league fixture moves to Sunday if Wimbleton are also at home that day.
- Fixed the source's stale version.json; bumped application/cache references consistently. New assets are included in the offline-cache manifest. Smaller starting grounds can retain their actual capacity in the builder while still obeying the fixed-site reserve.

## Validation completed

Automated checks, available in review/three-division-*.json:

- Twelve complete generated seasons covering all starting divisions: every home/away pairing, 38/46 games, complete playoff progression and consistent promotion/relegation totals.
- Application logic in a Node VM with DOM stubs: start five clubs, simulate matches, read organiser tabs for all divisions, export/parse backups, reload careers, migrate an old top-flight backup and roll over two lower-division careers.
- Neutral final accounting: no home gate; managed-side score follows its team regardless of nominal home designation.
- Away-goal and penalty branches, including the 1999–2000 change; shared-ground league scheduling.
- All 68 starting modular layouts fit their fixed reserves. All 204 full kits and 204 shirt assets exist. Every service-worker core asset resolves; all application JS passes syntax checks.
- Original top-flight club/player data compared exactly against the inspected source.

These are not browser or physical-phone tests. There was no available local browser executable, so visual layout, actual browser navigation/audio/service-worker installation and long-career performance still need user testing. Previous review files retained from 1.55 describe that earlier release, not new browser verification.

## Practical limits / deferred work

- FA Cup, League Cup, European tournaments, draws and qualification are not implemented here.
- Extra time is a score simulation after normal time; penalties use a compact result decider. They do not have live extra-time/shootout animations or individually attributed extra-time scorers. The final uses a neutral label and accounting, not a bespoke Wembley stadium asset.
- Division dates and spacing are a playable generated calendar, not exact 1998–99 historical fixtures. Shared-ground handling covers league fixtures; coordinated stadium-event booking/ownership between two careers is not simulated.
- Draft capacities, wages, budgets and ratings remain game-design estimates. Commercial income/ticket prices remain club-specific after promotion; no automatic revenue rebalance is included. Season-long economics has not been calibrated by playtesting.
- Reused raster neighbourhoods retain their earlier scenery. Reserve checks test stadium layouts against those plots; individual source raster objects cannot be re-audited from image assets.
- Existing career storage key and roster edition are retained intentionally for migration. Export a career backup before replacing your site files. Long careers remain subject to the browser's storage capacity.

## Please test on your phone

1. Choose one First and one Second Division club. Check name sorting, swipe browsing, kits, top three players and stadium framing in portrait/landscape.
2. Advance to a fixture, simulate or watch, close the report, then reload/Continue. Check opponents, scores and player appearances.
3. Browse all three Organiser tables and fixtures/results; return to your club calendar.
4. Check an existing 1.55 career still opens with its previous results intact.
5. As practical, finish a lower-league season and confirm playoffs or promotion/relegation, then start the next season. If your fixtures end first, continue advancing while the other divisions/playoffs finish.

## Historical references

- RSSSF, England 1998/99: https://www.rsssf.org/tablese/eng99.html — divisions, match totals, movement and playoff results.
- EFL, About the Play-Offs: https://www.efl.com/competitions/sky-bet-play-offs/about-the-play-offs/ — pairings, higher-ranked second-leg hosts and neutral finals; current rules omit away goals.
- Irish Independent, 20 May 1999: https://www.independent.ie/sport/bolton-on-wembley-way-as-ipswich-fail-again/26150642.html — contemporary report of extra time followed by away-goal progression.
- English Football League play-offs historical rule account: https://en.wikipedia.org/wiki/English_Football_League_play-offs — away goals abolished from 1999–2000. Period differences are explicit in the implementation.
- Lower-club identity/kit/player sources and draft assumptions are retained in LOWER-DIVISION-DATA-SOURCES.md.
