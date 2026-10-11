# Clubline 99 — v1.59.0: Wembley and matchday venues

Built from the three saved v1.58.0 release ZIPs. This is a complete release, with an additional self-contained Wembley preview. Nothing has been deployed.

## Implemented

**Wembley Fields** is the game's period-inspired old Wembley national venue. It uses the existing modular stadium bowl, joined corners and projection, with a bespoke pale stone twin-tower entrance, domes, flagstaffs, arcade, bridge parapet and entrance steps. The roof is pale; lower seating is red and upper seating is blue. Its capacity is 80,000. The national venue is separate from the 68 club records and is not a selectable club or editable club stadium.

The surroundings have separate districts rather than one repeated housing grid:

- A broad Wembley Way approach, with supporters, lamps, kiosks and direction signs.
- An arena with a curved roof, conference buildings and exhibition halls to one side.
- Marked coach bays and several distinct car parks, with cars and coaches at the correct ground angles.
- Industrial sheds with different heights and sizes, loading doors, trucks, fenced yards and six coloured containers.
- A railway corridor and small station/platform, with irregular tree belts on both sides.
- Outer residential streets: 68 homes, garden boundaries, paths to the road, semis and larger buildings, with shops and garden trees.
- Narrow paved areas around the stadium and its entrance. No maximum-size grey slab is drawn underneath the world.

There are 397 trees, 105 cars, 12 coaches, three trucks and 95 approach supporters in the deterministic surrounding world. These counts are world totals: framing shows only the relevant part. The stadium remains prominent. Portrait and landscape use the same asset layers and world coordinates; rotation changes framing, not the map.

**Matchday venue routing:** the career backdrop, pre-match preview and watched stadium view now use the actual venue. Away games show the home club's ground. League Cup, FA Cup and lower-division playoff finals use Wembley Fields. FA Cup semi-finals use an independent club ground, normally Aston Vale or Mancaster United; other large grounds are available when those clubs are participants. Semi-final replays retain their venue.

Venue identity is independent of the home/away team slots. Finalists retain their own kits, player lists, score positions and supporters' colours. Attendance uses the venue's capacity, including construction closures at your own ground. New national finals use a near-full attendance range; existing saved occupancy is retained. Neutral fixtures do not generate a home gate, food/drink or shop payment for either participant. Existing prizes and away operating charges are retained; historical cup gate-sharing is not modelled. Match reports record venue ID/name/capacity. A neutral report's goal statistics now follow the participant slots correctly.

New cup/playoff fixtures avoid booking the same venue twice on one date, including independent semi-final hosts and the shared Selwood ground. Existing club event booking windows are respected at the managed stadium.

## Saves and installation

Extract all three v1.59.0 ZIPs into the same folder and upload their combined contents to your existing GitHub Pages folder. No previous version is required. Do not upload the ZIP files themselves or add an extra enclosing directory. Export a career backup before replacing files.

The existing save key and roster edition are retained. Existing fixture dates/results remain unchanged. Older neutral fixtures infer a venue; an unfinished neutral match receives the venue ID and has its old participant-ground attendance recalculated once using its saved occupancy. Finished historical reports are not rewritten. Legacy calendars are not retrospectively moved to resolve venue conflicts; the booking rules apply when scheduling new fixtures. Existing beyond-entry-date cup migration rules remain unchanged.

All 68 club and 1,428 player records are byte-for-byte unchanged. Ordinary club stadium layouts and surrounding assets are retained. No European competitions are implemented in this release.

## Validation completed

- 13 targeted application checks using the actual app module and handlers in a simulated DOM: home/away/neutral routing in both team slots; independent semi-final hosts; capacity and accounting; venue reports; save/reload and backup validation; watch → lineup confirmation → paused live reload; legacy migration; return after the report.
- Whole road/pavement widths and registered building/tree/vehicle footprints checked against Wembley's complete fixed stadium/tower reserve. The entrance paving is the explicit access-surface exception. No other collisions.
- All 68 existing stadium layouts still fit their fixed sites; 408 kit/shirt assets exist; offline cache asset paths resolve; JavaScript syntax checked.
- Nine combined FA/League Cup seasons plus six FA prize checks; nine League Cup seasons plus six League Cup prize checks; twelve league/division seasons. Draws, replays, rest gaps, progression and migration checks passed.
- Geometry fits at 360×640, 390×760, 430×900 and 844×390. Actual engine output rendered and visually inspected in portrait, landscape and a wider district view.
- Each release ZIP is checked for integrity, and their union is checked against the complete release directory.

**Not tested:** physical phone/browser interaction, browser image decoding/animation and service-worker installation in this environment. A browser binary could not be installed. The automated app tests and static renders do not substitute for that check. The self-contained preview can be opened without hosting the game.

## Reference basis and design limits

The scene is a compact fictional interpretation of the late-1990s Wembley complex. Roads, plot dimensions and house positions are designed for the game's projection and readability, not a surveyed 1998 street map. Geographic orientation is adapted to make the entrance visible. The modular bowl approximates the old oval; the towers are the bespoke recognisable element. It retains the old venue for subsequent fictional game seasons rather than simulating its real closure and replacement.

- [Brent heritage: Wembley Stadium — Old and New](https://www.brent.gov.uk/-/media/files/resident-documents/libraries-arts-and-heritage-documents/wembley-stadium--old-and-new.pdf): twin towers, old stadium history, 80,000 all-seated capacity after 1990.
- [Brent: History of Wembley and Tokyngton](https://www.brent.gov.uk/libraries-arts-and-heritage/brent-museum-and-archives/your-local-area/history-of-wembley-and-tokyngton): the conference centre opened in 1977 and the wider area's development.
- [Brent Archives: Wembley complex event programmes](https://bma-collections.brent.gov.uk/Details/archive/110004738): stadium, arena, conference centre and exhibition halls as one event estate.
- [Historic England: north view from Wembley Way, 18 August 1996](https://historicengland.org.uk/images-books/photos/item/BB96/07303): period catalogue record; its full image was unavailable during this work.
- [Building: Six stadiums that tell the story of English football](https://www.building.co.uk/architectural-reviews/six-stadiums-that-tell-the-story-of-english-football/5061797.article): an old-stadium aerial used to inspect the pale roof, red/blue seating, tower entrance, paved approach and housing/greenery beyond. The image is not copied into the game.
- [Wembley Stadium: 90 years of Wembley](https://www.wembleystadium.com/news/2013/apr/25/90-years-of-wembley-stadium): original venue and twin-tower history.

Assets are original code-rendered illustrations. The world generator is in wembley-world.js; tools/build-wembley.mjs can reproduce the layers and previews with Node and Sharp. These are developer tools, not runtime requirements.

## Phone checks when convenient

1. Open the standalone preview in portrait, rotate it, and use Wider estate to inspect the arena, coach parks and industrial side.
2. Watch an away fixture: the ground name and scene should be the host club's.
3. At a Wembley final, switch to Stadium view: check the towers, seating, both teams' kits and score order. Save/reload the paused match.
4. Confirm that a semi-final names an independent host, and that closing the report restores your own ground.
