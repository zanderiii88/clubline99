# CLUBLINE 99 v1.93.0 — reversible real names

Install this update over v1.92.0. Every file in the update ZIP goes in the repository root. No deployment has been performed.

## Using it

Options → Names → **Use real player, club & stadium names**. It starts enabled on devices without an existing names preference. Untick to return to parodies. Available from the title screen and both management modes; remembered on this device independently of careers and backups. A club name explicitly entered by the user remains their chosen name.

Coverage: all 420 existing English Premier League players and all 214 existing Scottish Premier League players; 586 additional European player identities already referenced in the game. Total: 1,220 players. All 246 club identities and their home ground labels, plus Wembley and Hampden national venues, have real-name mappings. Generated players and fictional managers remain fictional.

This changes displayed identities, not the existing season squads, joining dates, ages, positions, ratings, finances, competition pools or game IDs. Existing later-season arrivals remain in their existing squads. It is not a newly researched exact opening-day database. Switching names does not replace careers or replay fixtures. Transfers and comparisons accept both naming styles.

Parody identity fields are retained alongside the real references. Older narrative text is translated for display where it contains complete, unambiguous mapped names; original save strings stay intact. Ambiguous historical text (for example a generic ground name shared by multiple clubs) is left as recorded. Current fixtures, tables, profiles and ground labels use their explicit IDs. Names in any pre-rendered artwork are not redrawn.

## References and conventions

EPL player correspondences were checked against FootballSquads' 1998/99 club lists, including each existing player's date of birth (420/420 matched a record). Familiar spellings and common football names are used where the archive has a typo, transliteration or longer formal name. The game IDs, rather than names or squad numbers, identify players.

- https://www.footballsquads.co.uk/eng/1998-1999/faprem.htm
- Club pages: arsenal.htm, avilla.htm, blackbrn.htm, charlton.htm, chelsea.htm, coventry.htm, derby.htm, everton.htm, leeds.htm, leicester.htm, liverpool.htm, manutd.htm, middles.htm, newcas.htm, nottmf.htm, sheffwed.htm, southam.htm, tottenha.htm, westham.htm, wimbled.htm, beneath https://www.footballsquads.co.uk/eng/1998-1999/faprem/
- SPL references: the existing researched `data/scotland.json` realName records, with Celtic and Aberdeen references also retained in the earlier European player-reference files.
- European club identities: the existing `review/europe-cl-mapping.json` and `data/europe-uc-club-mapping.json` ID mappings.

Ground names use period/common names rather than today's sponsors: Highbury, The Dell, Filbert Street, Maine Road, Reebok Stadium, McAlpine Stadium, Britannia Stadium, Parc Lescure, Westfalenstadion, Parkstadion, Kaalheide and others. Models, capacities and surroundings have not been rebuilt by this naming update.

Historical exceptions checked:

- Hamilton: Cliftonhill groundshare in 1998/99; Clydebank: Boghead Park. https://en.wikipedia.org/wiki/1998%E2%80%9399_Scottish_First_Division
- Queen's Park: Lesser Hampden during the main stadium redevelopment. https://queensparkfc.co.uk/history/
- Peterhead: Balmoor, opened September 1997. https://www.peterheadfc.co.uk/club-history/
- East Fife: Bayview Park at career start; the real move later in 1998 is not newly simulated. https://spfl.co.uk/news/past-grounds-bayview
- Reading: Madejski Stadium, the 1998/99 season ground. https://www.stadiumguide.com/madejski/
- Roda: Kaalheide, before the 2000 move. https://www.rodajckerkrade.nl/club/over-roda-jc/
- Genk: Thyl Gheyselinckstadion, before the Fenix name. https://stadiumdb.com/stadiums/bel/fenix_stadion
- Wisła: Stadion Wisły, before the 2008 Henryk Reyman naming. https://archiwum.wisla.krakow.pl/pl/aktualnosci/Otwarto_pawilon_multimedialny
- HJK: Helsinki Olympic Stadium (European venue). https://www.stadion.fi/en/info/stadium-info/olympic-stadium
- Sturm and Grazer AK: Arnold Schwarzenegger Stadion. https://sksturm.at/en/c/geschichte
- Košice: Lokomotíva Stadium in the 1998/99 period. https://fclokomotiva.com/en/lokomotiva-kosice-stadium/ and https://sclib.svkk.sk/sck01/Record/000567215

## Validation

Reversible identity/data checks; real/parody search aliases; default-on and remembered preference; title and career options; both modes; EPL and SPL squad, contract and match/report flows; cached narrative translation; neutral venues; portrait and landscape browser emulation. 34 existing targeted regression scenarios also passed, with no browser errors. Production service-worker offline loading and the names preference were verified. No physical-phone testing claimed.
