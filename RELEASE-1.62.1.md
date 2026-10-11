# Clubline 99 — v1.62.1: Remove crowd audio

Built from the inspected, verified three v1.62.0 release ZIPs. No deployment.

## Changed

- Removed both match crowd sounds: boos and cheers.
- Removed the goal-event playback call and the crowd-audio export.
- Removed both MP3 files and their offline-cache entries.
- Bumped the application and offline cache to v1.62.1 so updated clients use the changed audio module.

The seven existing music tracks, playlists, playback modes, device preferences and advance-time sound remain. No replacement music has been added. Visual match reactions and all game systems are unchanged.

## Checked

- Audio module exercised in Node VM with audio/DOM stubs: existing selected track/playlist/mode retained, music playback and track change work, advance FX works and respects FX mute. Crowd playback export is absent.
- Source checks confirm no crowd filenames or goal-audio calls in the runtime audio, application or service-worker modules, and no crowd files in the release.
- Existing season-review/application-flow tests passed, including module linking, save/load, archive and rollover.
- JavaScript syntax and all offline cache references passed; 68 fixed English stadium reserves and 408 kit/shirt assets passed existing asset checks.
- Club/player JSON, music MP3s and the advance-time MP3 are byte-for-byte unchanged from v1.62.0.

Physical-phone listening and real-browser testing remain outstanding. Older test evidence retained in the release refers to its respective previous changes. New audio evidence is in `review/audio-removal.json`.

## Install

Export a career backup first. Extract all three v1.62.1 ZIPs (Game, Audio and Menu Assets) into one folder, then upload the combined contents to your existing GitHub Pages folder, replacing matching files. No older release is required. Do not upload ZIPs or an extra enclosing folder. Use Check for Updates/Load update and verify v1.62.1.

Replacing files on GitHub does not delete obsolete files already there: `assets/audio/crowd-cheer.mp3` and `assets/audio/crowd-boo.mp3` may be deleted manually if present. They are no longer requested or cached by this version, so deleting those old copies is optional for the audio fix.

## Free-music sources for later review — none integrated

- Incompetech: https://incompetech.com/music/royalty-free/ — free Creative Commons use with the selected track's required credit; the site's licensing page generates the credit text: https://incompetech.com/music/royalty-free/licenses/
- OpenGameArt music: https://opengameart.org/art-search-advanced?field_art_type_tid%5B%5D=12 — licence varies by track. CC0 and CC BY are straightforward candidates for this game; keep each track's source and required attribution. FAQ: https://opengameart.org/content/faq
- Pixabay: https://pixabay.com/music/ — free use without required attribution under its Content License, subject to its restrictions. Use tracks as part of the game, not as a standalone music download. Some tracks have Content ID registrations that can affect gameplay videos. Licence: https://pixabay.com/service/license-summary/ ; FAQ: https://pixabay.com/service/faq/

Prefer instrumental breakbeat, big beat, house and synth tracks for Clubline's 1990s atmosphere. Verify each chosen track's licence and record title, creator, source and licence before packaging it. Music selection and credits are future work.
