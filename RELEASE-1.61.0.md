# Clubline 99 v1.61.0 — UEFA Cup

## Implemented

- UEFA Cup first-round fields of 64 clubs in 1998–99 and 96 from 1999–2000. Six and seven knockout rounds respectively; two legs until a single neutral final. Aggregate scores, period away goals before extra time, extra-time away goals, and penalties are resolved.
- From 1999, the 24 second-round winners await eight Champions League first-group-stage third-place clubs. Those clubs join the third round using their existing shared rosters. No simultaneous CL/UC opening entries or duplicate teams.
- Draw notifications for participating managers: watch/pause, skip a selection, skip to the end, review and revisit. A knockout tournament has no group-skip button. Reveal progress survives saving; playback pauses on reload.
- Competition page, every round's fixtures/results, matchday fixture/result events, organiser/calendar links, UC statistics and competition-specific cup-tying records.
- English qualification: one league place, FA Cup winner and League Cup winner, excluding CL entrants. A CL-qualified FA winner passes its place to the non-CL finalist; duplicate/unavailable cup places pass down the Premier table. A lower-division cup winner can qualify. An English UEFA holder outside these routes gets a holder place, unless qualified for CL. Qualification is calculated before division rollover.
- CL/UC selection badges for opening 1998–99 qualifiers. Premier table blue projects next-season CL places; orange projects UC places filled through the league. Cup routes can qualify elsewhere in the table and can alter those projections. Red relegation zones remain.
- 1999 UEFA format-change notification. The UEFA Cup stays on that knockout format thereafter, including careers reaching 2004 or later. Existing CL changes in 1999 and 2003 remain; its 2003 format is retained thereafter. No later expansions are added.
- Loading a pre-UEFA career past 28 August defers the new competition until next season, preserving existing dates and results. Missing foreign player states are added. Backups validate the new bracket and states.

## Data

The release has **194 clubs and 4,074 starting players**: 68 English clubs/1,428 players, 50 previously added CL foreign clubs/1,050 players, and **76 newly integrated foreign clubs/1,596 players**. The 76 comprise 64 saved UEFA pool clubs plus twelve minor period participants to fill a 96-club field without artificial byes or surplus English places.

The twelve are Wisla Krakow, Legia Warsaw, CSKA Sofia, Levski Sofia, Red Star Belgrade, Partizan Belgrade, Viking Stavanger, Stromsgodset, Aalborg, Silkeborg, Hapoel Tel Aviv and Kosice, all represented by fictional clubs and fictional squads. Current country names identify the pool (Serbian clubs were Yugoslav entries in the period). The names and draft references are in data/europe-uc-club-mapping.json.

The eight previously researched UEFA squads are reused with their original IDs and player records: Atletico Madrid, Celta Vigo, Parma, Roma, Bologna, Udinese, Schalke and Werder Bremen. Other previously accepted minor squads remain fictional. English league.json and europe-cl.json are unchanged from the inspected v1.60 source.

**Aberdon Granite/Aberdeen now has 21 researched 1998–99 parodies**, replacing only its not-yet-integrated random draft players with the same player IDs. Examples: Jim Leighton → Jim Layton, Eoin Jess → Ewan Joss, Billy Dodds → Billy Dodd, Russell Anderson → Russell Anders. Ages use 3 August 1998. Later arrivals such as Robbie Winters, Jim Hamilton and Tony Warner are omitted; the fixed 21-player selection also omits Hignett and Newell rather than altering existing English records. Derek Whyte's invalid source-table date is corrected to 31 August 1968 using the independent nationality/player archive. Michael Hart's RB role and all precise game positions are editorial estimates, not claimed exact archival designations.

Aberdeen averages **70.38** overall versus **68.00** for Kilmarnock and **66.95** for St Johnstone; attack/defence are **75/74**, above both. Ratings, potential, wages, contracts, condition and injury risk are game design values. Player sources/parodies are recorded in data/aberdeen-player-references.json. Wages retain the existing draft's editorial rating-based curve, and original squad-slot numbers are not historical shirt-number claims.

## Historical boundary and adaptations

- Opening English UC entries are Aston Vale, Roseburn Rovers, Leedham United and Riverpool, representing the historical Aston Villa, Blackburn, Leeds and Liverpool. Foreign fields are changing weighted selections from the shared period pool, not a complete recreation of every historical season's access list.
- Preliminary qualification and Intertoto are abstracted. The Cup Winners' Cup is not implemented; Chelsey's historical 1998–99 participation in that competition is not presented as a UEFA Cup entry. From the 1999 game season, the FA Cup route goes to the UEFA Cup after the period merger.
- Prize money is an explicit game estimate, not historical audited payments. Neutral European hosts use existing foreign presets and rotate fictionally; they are not claims about the exact historical final venue. Foreign clubs remain non-playable league pools.
- Seed strength uses game attack/defence, not exact UEFA coefficients. Country separation is enforced through the third round; from 1999 CL transfers are seeded apart and avoid their old group. Later rounds use open draws. Complete preliminary seeding and association-access regulations are not modelled.
- Initial 1998 dates follow period matchweeks. Later fictional years align UEFA matchweeks mainly to Thursdays, with minimum three-day participant rest and shared-ground booking checks. Domestic collisions and late CL transfers can move ties forward. No existing match is silently moved on migration.
- Numeric extra-time/penalty decisions use the existing match engine; they are not newly animated live extra-time periods. Statistics and tying are stored separately per competition, using the game's existing cup system.
- Foreign stadiums, surroundings and capacities are editorial modular presets, not new Camp Nou, Bernabeu, San Siro, Olympiastadion or Pittodrie replicas.

## Checked

Automated checks passed for eight combined domestic/CL/UC seasons covering 1998, 1999, 2003 and 2012; exact 125/205 UC fixture counts; CL-transfer waiting; all rounds and final winners; minimum rest and shared venues; qualification duplicates/FA finalist/lower-division winners/holder places; away goals and penalties; payment idempotence; save roundtrips and malformed bracket rejection.

Actual application handlers were tested in a Node VM with DOM stubs: five club starts, watch/pause/reload/review draws, both managed UC legs via simulation and watched-match confirmation, venue scenes, reports/results, separate UC statistics, imports and rollover into both European competitions. CL and FA application regression suites and 13 venue application cases also passed. These are **not physical phone or real browser tests**.

Domestic cup engine regressions, all 68 English reserve checks, all 408 English kit/shirt assets, new foreign preset reserves, JavaScript syntax and offline cache references passed. Unique club/player IDs and player names, 21-player squads, age/rating/potential ranges, positional coverage and Aberdeen's relative strength were checked. Release ZIPs are checked for complete file coverage, per-file integrity, CRC and size; saved copies are downloaded for integrity verification before delivery.

## Sources checked 11 October 2026

- RSSSF 1998–99 competition results, rounds/dates and English participants: https://www.rsssf.org/ec/ec199899.html
- RSSSF 1999–2000 rounds/dates, 96-team first round, CL transfers and additional participant identities: https://www.rsssf.org/ec/ec199900.html
- UEFA historical account of 1999 third-place transfers: https://editorial.uefa.com/resources/021f-0f842a4ba426-22bf135e36bc-1000/uefa_60_years_at_the_heart_of_football.pdf
- UEFA format/access archive transcription: https://mail.kassiesa.net/uefa/history/format99.html
- Aberdeen 1998–99 squad archive: https://www.footballsquads.co.uk/scots/1998-1999/scotprm/aberdeen.htm
- Independent Aberdeen player/DOB/role records: https://www.national-football-teams.com/club/2124/1998_1/Aberdeen_Fc.html
- Robbie Winters/Billy Dodds September 1998 exchange: https://arabarchive.co.uk/player.php?id=238 and https://arabarchive.co.uk/player.php?id=142
- Earlier saved roster research retains its own sources in the UEFA period draft; no later squads were silently substituted.

## Phone checks when available

Export a backup, combine all three ZIPs, upload their extracted contents, and confirm v1.61.0. Start Aston Vale or Riverpool for UC entry. Check the UC badge, August draw watch/skip/review, the first away fixture and its ground, both-leg aggregate outcome, results and UC statistics. In a continuing career check its original fixtures/results remain and the UC deferral message appears when applicable. Verify the competition page and projected table colours in portrait and landscape.

Nothing deployed.
