# CLUBLINE 99 v1.119.0

## Scottish stadium surroundings
Rebuilt the five shared Scottish surroundings presets: city, town, industrial, harbour and edge-of-town. Roads, pavements, plots and buildings now use the same world coordinates as the stadium. Building footprints include the roof overhang and stay inside their plots, away from roads, water and the reserved stadium area. The harbour preset used by Aberdeen has coherent quayside plots and water edges.

The new front/back SVG layers benefit all 56 Scottish club mappings and the Scottish national-ground preset. These remain schematic district styles, not surveyed recreations of the real streets around each ground. Club-specific historical geography remains a later art task.

Scottish asset URLs and the service-worker cache revision have been updated so the new artwork is requested on upgrade. English surroundings retain their existing asset URLs.

## Compatibility
Existing careers can continue. No changes to game data, budgets, stadium capacity rules, site calibration, section plans or save keys. Music direction and the public-release readiness checkpoint remain in RELEASE-PLANNING.md and ROADMAP.md.

## Verification
- Deterministic regeneration and independent geometry checks: 2,025 building footprints across five presets; no overlap with another building, road corridor, water or stadium reserve.
- All 56 Scottish club mappings checked against the same projection, reserve and new asset URLs; English asset URL preserved.
- Rendered the actual sceneSvg output with default stadium layouts for Aberdeen, Celtic, Dunfermline, Motherwell and St Johnstone; visually inspected all five assembled scenes, including a full-size Aberdeen scene. External surroundings SVG layers were embedded for the offline raster renderer. This is source-render QA, not a new browser career journey.
- Source integrity passed: module syntax, 230 exact cache/import URLs, five playable divisions, database counts and existing English stadium/kit checks.
- Stadium comparison regression checks passed in both management modes: preview/built/target states, closures, two separately paid phases and save/backup.
- ZIP integrity and package bytes checked; data files unchanged against v1.118.0.

Not tested in this batch: physical Android, production offline upgrades, every Scottish club layout, extreme stadium customisations or a full season. Nothing has been published.

## Install
Use the cumulative update over v1.94-v1.118, or the complete ZIP for the full game. Extract into the game's existing root folder, keeping your usual backup. The menu should show v1.119.0 after loading the update.
