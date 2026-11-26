# Tiny Learners

An offline learning app for kids aged 3 to 5, built with React Native and Expo (SDK 58).

No ads, no accounts, no analytics, and no internet permission. Everything, including voice, music and animations, runs on the device.

## What's inside

- **Letters and Numbers**: tap A to Z or 0 to 20. The app says the letter's phonics sound and a word ("A is for Apple").
- **8 games, 12 levels each**: Trace it, First sound, Find it, Match it, Count it, Pop!, Which is more?, Shapes. Questions get harder at higher levels.
- **Candy level map**: three worlds (Cupcake Meadow, Chocolate Hills, Lollipop Lane), each with its own music. The child's character walks to the next stop after each level.
- **Rewards**: a short Lottie cartoon after each level and stars for first-try answers. Stars buy hats, glasses and clothes in the shop.
- **Adaptive learning**: letters unlock in phonics order, and weak items come up more often.
- **Gentle rules**: one retry, then the app says the answer and moves on.
- **Grown ups area** (behind a math gate): progress, sound settings, daily time limit, resets, and asset credits.

## Getting started

Requires Node 22.13 or newer.

```bash
npm install
npx expo start
```

Open Expo Go on an Android phone or emulator and scan the QR code.

### Checks

```bash
npm run typecheck
npm run lint
```

## Project layout

```
App.tsx              state-based router (no navigation library)
src/store.tsx        saved state (AsyncStorage): stars, settings, progress, levels, shop
src/learning.ts      adaptive path and skill tracking
src/levels.ts        games, levels, worlds, cartoons
src/sound.ts         sound effects and per-world music
src/speak.ts         device text-to-speech
src/screens/         one file per screen and game
src/components/      shared UI (Sticker, Quiz engine, Avatar, Candy, art)
src/assets/          generated SVG data for candy and wearables (do not edit by hand)
src/credits.ts       every third-party asset with author, license and source
assets/audio, lottie bundled sounds, music and animations
```

## Third-party assets

All outside assets are bundled in the app and listed with their author, license and source in [src/credits.ts](src/credits.ts). They are also shown in the app under Grown ups. Licenses used: CC0 (Kenney, OpenGameArt), CC-BY 4.0 (Twemoji), and the Lottie Simple License (LottieFiles).

## Build

- Test APK: `npx eas-cli build -p android --profile preview`
- Play Store bundle: `npx eas-cli build -p android --profile production`

## Play Store checklist

- Target audience: Ages 5 and under (Families Policy)
- No ads or analytics SDKs
- Privacy policy URL stating that no data is collected
- Data safety form: no data collected, no data shared
- Content rating questionnaire
- Custom icon and splash in `/assets`
