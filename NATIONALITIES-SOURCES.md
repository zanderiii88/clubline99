# Nationality data and flags

Player nationality mappings are in nationality-records.js. Each entry records the source roster URL, reference player and source birth date used for matching. Sources were accessed 13 October 2026.

Sources:
- National Football Teams, 1998/99 club rosters: https://www.national-football-teams.com/
- Transfermarkt, 1998/99 detailed club squads: https://www.transfermarkt.co.uk/
- Existing project reference-player mappings in review/cl-player-references.json and data/aberdeen-player-references.json.

Mappings represent a single football nationality, not a claim about exclusive citizenship or birthplace. Existing source mismatches in birth dates were not silently corrected in the game's historical rosters. Ambiguous matches remain unconfirmed. Generated nationality distributions, names and manager identities are design choices, not researched historical squads.

Flags: flag-icons v7.2.3 (MIT), https://github.com/lipis/flag-icons. Licence bundled in assets/flags/LICENSE.txt. Yugoslavia and the pre-2004 Georgia icon are simple period-specific vector replacements. Bosnia's current design was introduced during 1998. These images are packaged locally; the running game makes no flag-service requests.
