# Clubline 99 v1.62.2 — music update only

Apply this update to the complete v1.62.1 game folder. This ZIP is not a complete game release. No deployment has been performed.

## Where to put the files

1. Extract `Clubline-1.62.2-Music-Update.zip` into a separate temporary folder.
2. Copy all its loose files (JavaScript, HTML, manifest and version files) into the root of your existing game folder — beside `index.html`. Replace matching files. These include cache-version updates so new and offline clients use the new music menu.
3. Open the update's `assets/audio` folder and copy the **files inside** into your existing game's `assets/audio` folder. Do not replace the entire `assets` folder. Do not create `assets/assets`.
4. Delete the seven old generated music files listed below from your local game and GitHub repository. Uploading the new files alone does not delete them.
5. Upload the changed root files and new `assets/audio` files to the matching locations in your existing GitHub Pages repository. Export your career backup beforehand. Use Check for Updates/Load update afterwards and check the title screen says v1.62.2.

All other game folders, club data, stadium assets and menus stay in place. No old release ZIPs are needed if v1.62.1 is already installed.

## New audio files

| File, inside `assets/audio/` | Menu title | Creator |
|---|---|---|
| `clubline-1994-techno-ballroom.mp3` | 1994 Techno Ballroom | melodyayresgriffiths |
| `clubline-90s-synthwave.mp3` | 90s Synthwave | lofidreams |
| `clubline-synth-wave.mp3` | Synth Wave | Marvrix |
| `clubline-90s-game-music.mp3` | 90s Game Music | PoorArtistt |
| `clubline-back-to-90s.mp3` | Back to 90s | berrydeep |

`music-sources.json` also goes inside `assets/audio/`; it records supplied filenames, creators, source references, durations and hashes. MP3s were renamed/copied without re-encoding.

The new default track is **1994 Techno Ballroom**. Repeat, playlist, shuffle, change-track and Music off controls remain. On the first upgrade, enabled old playlists become all five new tracks and the selected track becomes the first. Existing Music off, FX off and playback-mode preferences are retained. Subsequent selections in the new catalogue persist normally. Music credits are under Options.

## Delete these old files from `assets/audio/`

- `menu-hip-hop.mp3`
- `menu-french-electro.mp3`
- `menu-fuzzy-rock.mp3`
- `menu-arcade.mp3`
- `menu-big-beat.mp3`
- `menu-indie.mp3`
- `menu-synth-pop.mp3`

Boos and cheers remain removed. The existing `advance-tick.mp3` is still used by the FX setting; do not delete it as part of this music update. Old `crowd-cheer.mp3` and `crowd-boo.mp3` files, if left over from an earlier upload, are unused and may also be deleted.

## Verified and remaining checks

- All five supplied MP3s fully decoded with FFmpeg; copied asset hashes equal their original upload hashes.
- Audio-module checks passed for five track paths, repeat, playlist wrap, reload, valid/invalid saved selections, legacy muted/enabled migrations, credits and FX mute.
- The existing actual-application module-link/save/load/season-review/rollover checks passed in Node VM with DOM stubs.
- JavaScript syntax and offline cache references passed. Existing stadium/kit asset checks passed.
- The update ZIP was compared against the original v1.62.1 ZIP contents; it includes only changed runtime files and the new music/credits files. Club/player data is unchanged.

Real browser/phone listening, relative track loudness and perceived loop joins remain untested. No claim of seamless musical looping is made; the existing repeat function plays each supplied file again.

## Source and licence notes

The user supplied all five tracks as Pixabay downloads. The live Pixabay pages for lofidreams, Marvrix and PoorArtistt were checked and described these tracks as available under the Pixabay Content License. The MelodyAyresGriffiths and berrydeep pages were not accessible during this verification; their names/IDs come from the supplied files. No download certificates were supplied and track-specific Content ID status was not independently verified. Keep any download records/certificates you have.

The licence is https://pixabay.com/service/terms/ . Music is included as assets for the Clubline game update, not offered as a standalone soundtrack. Credits do not claim ownership of the music or imply creator endorsement.
