# Historical note: this sound palette was rejected and withdrawn in v1.122.0.

# CLUBLINE 99 v1.121.0

## Quiet, changing club ambience
A new ambience player uses separate short clips with varied timing rather than a constantly busy four- or five-minute track. Ordinary days have no continuous bed: birds, ball kicks, indistinct call-like sounds and an occasional whistle are separated by quiet gaps. Sundays use birds alone. The first clip waits 15–32 seconds after entering the setting; later ordinary-day clips wait 22–65 seconds after the previous clip ends. Immediate repeats are avoided and only one occasional clip can play at a time.

On a fixture day or during match preparation/live play, a low crowd murmur fades in. Occasional wordless crowd swells, applause, distant calls and whistles sit above it, with 18–42-second gaps. The crowd fades out over about six seconds when the result is shown or the game returns to an ordinary day. Ambient audio is silent on title/setup screens.

The new set contains 14 original synthesized assets, about 3.5 MB in total. They are a first procedural sound palette, not live stadium or speech recordings. The 32-second crowd WAV is periodic for looping; short one-shots are MP3. They can be replaced or tuned independently of the timing system after listening feedback. The generator and source manifest are included; no external audio libraries or new third-party samples were added.

## Controls and music
Options & Help now has separate ambience, music and FX volume controls, plus an ambience mute. The new ambience defaults to a quiet 25% setting, with further attenuation inside the mixer. Music remains available for the intro/title/setup screens; gameplay music is off by default so it does not compete with the atmosphere. Enable “Also play music during the game” to restore it. Pressing Play music inside a career also enables that option. Existing playlist choices and Music/FX mute preferences are preserved.

Sound starts only after interaction. Hiding/leaving the page pauses the players and cancels ambience timers; returning resumes the appropriate atmosphere. Repeated navigation does not add players or reset the same sound schedule. Settings belong to the installation and survive career changes, reloads and updates. Music, FX and ambience can be muted independently.

All new audio is included in the offline cache. Offline media requests now receive proper byte-range responses from saved files.

## Verification
- Virtual-time player checks covered ten ordinary-day minutes and ten matchday minutes (14 ordinary clips and 19 matchday accents in the seeded run), plus quiet Sundays, no autoplay, varied gaps, immediate-repeat avoidance, one-shot isolation, navigation/timer stability, crowd fades, zero volume, muting, visibility, missing clips and old settings migration.
- Audio preference checks covered menu/game music transitions, explicit Play music, independent settings, persistence and cross-tab changes.
- All 14 files decoded successfully with finite samples and bounded peaks. Precache references and nine offline byte-range cases passed, including the registered service-worker fetch handler in an offline VM test.
- Desktop browser checked the new controls, changed ambience volume and mute, reloaded to confirm persistence, restored default ambience settings, and entered an In-depth Aberdeen career with access to the sound options.
- Source integrity passed: syntax, asset paths, database checks and 234 exact module/cache URLs. Both-mode stadium comparison/save/backup regression checks passed with the new audio module loaded.
- Both ZIPs checked for integrity and exact member bytes; game data, stadium assets and existing music files remain unchanged from v1.120.0.

Limits: automated playback scheduling/codec tests and browser UI checks do not constitute subjective listening approval. Physical Android/iOS speakers, long-session listening, production offline updates and the audible loop seam on each browser remain to be checked. No full-season balance or promotion/relegation work was included in this audio batch.

## Install
Existing careers can continue. Use the cumulative ZIP over v1.94-v1.120 or the complete ZIP, extracting into the existing game root. The menu should show v1.121.0 after loading the update. Nothing has been published.

The public-release names, branding and asset-permission checkpoint remains pending in RELEASE-PLANNING.md. Existing music credit questions are not resolved by this audio change.
