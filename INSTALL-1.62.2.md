# Clubline 99 — complete release 1.62.2

This ZIP contains the complete application, including all assets and the five supplied Pixabay music tracks. No earlier release or separate music patch is required.

## Upload
1. Extract this ZIP into a new empty folder. index.html is directly at the top level.
2. Upload the extracted contents to the folder your GitHub Pages site publishes. Replace matching files. Upload the contents, not the ZIP or an extra enclosing release folder.
3. Keep the folder paths intact: assets/audio, assets/menu, data and the other supplied folders.
4. Wait for the GitHub Pages deployment to finish successfully.
5. Open your site's version.json with a fresh query string. It must report 1.62.2. Then use Check for Updates in the game and load the update.

If uploading into an existing repository, delete these obsolete files from assets/audio: menu-hip-hop.mp3, menu-french-electro.mp3, menu-fuzzy-rock.mp3, menu-arcade.mp3, menu-big-beat.mp3, menu-indie.mp3 and menu-synth-pop.mp3. Also delete crowd-boo.mp3 and crowd-cheer.mp3 if present. A ZIP cannot remove existing repository files. The advance-tick effect is retained.

## Included changes
Complete verified 1.62.1 game with the 1.62.2 music update: five renamed Pixabay tracks, Options credits, preference migration and consistent runtime/offline-cache version numbers. Club and player datasets are unchanged. No deployment was performed.

## Validation
JavaScript syntax and offline asset checks passed. Existing career creation/save/reload and season rollover checks passed. Audio preference/playback flow checks passed using a simulated browser environment. All five MP3s decoded successfully and match the supplied files byte for byte. ZIP integrity and packaged file contents checked. Real-device listening and browser installation remain untested.
