# Tiny Learners

Offline educational Android app for kids aged 3 to 5. React Native (Expo SDK 58), TypeScript. Owner: Oluwasola (akintewe).

## Hard rules
- No ads, no analytics, no accounts, no network calls. INTERNET permission is blocked in app.json. Do not add any SDK that phones home.
- Target audience on Play: Ages 5 and under (Families Policy). Keep content child safe.
- Everything must work offline. Voice uses expo-speech (device TTS).
- Wrong answers: one retry, then say the answer and move on (teach, do not let kids guess forever). Star only for a first-try correct answer.
- Tap targets 56px or bigger, answer buttons 116px. No text under 16px.

## Structure
- App.tsx: StoreProvider + state-based router (no nav lib). Shows Sleepy when the daily limit is hit.
- src/store.tsx: one context for everything saved (AsyncStorage key tiny-learners:v2, migrates v1): stars, lifetime stars, voice/sfx/music, daily limit + usage, per-skill progress, unlocked letters, Pip look
- src/learning.ts: adaptive path. Skill keys `L:A`, `N:5`, `S:circle`, `C:red`. Known = 2 first-try answers in a row. Letters unlock 4 at a time in PHONICS_ORDER (s a t p i n first). `pickWeighted` favours weak items.
- src/levels.ts: 8 games x 12 levels, 3 candy worlds (4 levels each, own music + decorations), cartoon list for level rewards
- src/screens/LevelMap.tsx: candy map; the child's character walks to the next stop after a level. LevelComplete plays a Lottie cartoon. Shop sells Twemoji hats/glasses/clothes for stars. ChooseAvatar picks boy or girl.
- src/components/Avatar.tsx: Lottie kid + worn items overlaid (ANCHORS per character). Candy.tsx draws Kenney candy sprites.
- src/credits.ts: EVERY outside asset with author, license, source. Shown in Grown ups. Update it whenever assets change.
- src/assets/candy.ts, wear.ts: generated from downloaded SVGs; do not edit by hand.
- src/sound.ts: expo-audio sfx + per-world music (assets/audio, CC0 downloads); speak.ts ducks music while talking. metro.config.js adds .ogg.
- src/strokes.ts: tracing paths for A-Z and 0-9 on a 100x100 grid
- src/screens: Home, Letters, Numbers, LevelMap, LevelComplete, Shop, ChooseAvatar, the 8 games (take LevelProps), Parent (math gate, progress, settings, credits), Sleepy
- src/components: Screen, Quiz (shared engine + Celebrate), KeyGrid, ItemArt, ui (Sticker etc.), art (Pip, icons, shapes)
- src/data.ts: letters with phonics `sound`, PHONICS_ORDER, shapes, colors

## Design (source of truth)
Canvas with all screens and a style guide: https://claude.ai/artifact/MsiFMhVrapLNYUKm5owAJL
Look is "sticker book": 3px ink outline (#2B2B3A), flat bright fills, hard shadow `0 4-6px 0 ink` (no blur), radius 20 keys / 28 buttons / 32 cards, Fredoka font, mascot Pip (star). Dark text on colored fills only.
Colors: cream #FFF6DD, sun #FFC93C, sky #6CC3F0, grass #7ED58B, berry #FF7A93, grape #B196FF, tangerine #FF9F45.
Pressed state: translateY(6) and no shadow. Selected: ink background with the tile color as text. Wrong answer: opacity 0.3.

## Next steps
1. DONE: sticker book look, celebration + try-again states
2. DONE: sound effects, music, phonics voice lines, tracing, adaptive path + progress view, 5 new games, Pip dress-up, blinking/bobbing Pip, daily time limit
3. Recorded phonics clips: device TTS says sounds like "buh" approximately. Record 26 short clips (pure sounds) and play them in place of speak() for `sound`. Same for an ABC song if wanted.
4. Replace emoji with drawn SVG art, full A to Z set. Add each drawing to the `DRAWN` map in src/components/ItemArt.tsx (Apple and Ball exist). 100x100 viewBox, 4px ink stroke.
5. Custom icon and splash, then EAS build and Play Store listing (see README checklist)

## Assets policy
Use downloaded assets, not hand-drawn ones (owner's request). Only licenses that allow a commercial kids app: CC0, CC-BY (credit it), Lottie Simple License. Bundle files in the app (no runtime network). Avoid known characters/brands, text layers in Lottie (need fonts), and assets with no listed author. LottieFiles public GraphQL (graphql.lottiefiles.com/2022-08, searchPublicAnimations) and opengameart.org allow downloads; kenney.nl and pixabay block scripts.

## Notes
- AsyncStorage must stay at the SDK version (2.2.0); 3.x silently failed to save in Expo Go.
- Fonts: set `fontFamily: font.bold | font.semibold | font.medium` from theme.ts. Never set `fontWeight` with Fredoka (Android falls back to the system font).
- Shadows use the RN `boxShadow` style via `hard(y)` in theme.ts. Pressed state is built into `Sticker`.
- Needs Node >= 22.13 (`nvm use 22`). Expo SDK 58 crashes on Node 20.
- Tracing uses `measure()` page coords; `measureInWindow` is offset by the status bar on edge-to-edge Android.
- `npx expo install` fails in the cloud sandbox (host blocked). On a normal machine use it for version matching.
- Run: `npm install && npx expo start`
