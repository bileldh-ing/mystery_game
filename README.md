# Read 2:14

[![CI](https://github.com/bileldh-ing/mystery_game/actions/workflows/ci.yml/badge.svg)](https://github.com/bileldh-ing/mystery_game/actions/workflows/ci.yml) [![Deploy web](https://github.com/bileldh-ing/mystery_game/actions/workflows/deploy-web.yml/badge.svg)](https://github.com/bileldh-ing/mystery_game/actions/workflows/deploy-web.yml) [![Android APK](https://github.com/bileldh-ing/mystery_game/actions/workflows/android-release.yml/badge.svg)](https://github.com/bileldh-ing/mystery_game/actions/workflows/android-release.yml)

An original interactive detective game told entirely through a phone. Messenger chats with reply choices, notifications that keep arriving while the app is closed, a missing girl's cloned phone, photo clues you can zoom into, a case board, deduction puzzles, and three endings.

> A 19-year-old vanished from a fog-bound harbour town after a goodbye text at 2:14 am. The police say she ran away. An anonymous contact has cloned her phone — and the message wasn't written by her.

- **Story bible (spoilers):** `docs/STORY_BIBLE.md`
- **Design analysis:** `docs/DESIGN_ANALYSIS.md`

## Stack
- **Expo SDK 58** + React Native 0.88 + TypeScript (strict)
- **expo-router** (file-based routes in `src/app/`)
- **Zustand** + `persist` → AsyncStorage (autosave + chapter checkpoints)
- **expo-notifications** (local notifications for story messages while backgrounded)
- **react-native-reanimated 4** (typing dots, banners, transitions) + **gesture-handler 3** (pinch/pan/double-tap zoom)
- **expo-audio** (message, notification, clue, error sounds + ambient drone), **expo-haptics**
- expo-image, expo-linear-gradient, expo-splash-screen

## Run it
```bash
npm install
npx expo start
```
- **Android phone:** install **Expo Go** from the Play Store, scan the QR code. Everything used here ships in Expo Go (local notifications included).
- **Web:** press `w`, or `npx expo start --web`.
- Type-check: `npx tsc --noEmit`
- Validate the story + simulate 3,000 playthroughs: `npm run validate-story`

### Build a web version
```bash
npx expo export --platform web      # outputs dist/
npx serve dist                       # any static host works (single-page app)
```

### Build an Android APK (EAS)
```bash
npm install -g eas-cli      # or use: npx eas-cli@latest
eas login
eas build:configure         # first time only — links the project to your Expo account
eas build -p android --profile preview
```
The `preview` profile in `eas.json` produces an installable **.apk** (internal distribution). Download it from the link EAS prints and install it on the phone (allow "install unknown apps"). Use `--profile production` for a Play Store `.aab`.

## Project layout
```
src/
  app/                 screens (expo-router)
    index.tsx          lock screen + notifications + title
    home.tsx           phone home screen (app grid, objective)
    messages/          thread list + chat ([thread].tsx)
    gallery/           photo grid + zoom viewer with "Inspect"
    board.tsx          case board (people + evidence)
    ivy/               the missing girl's cloned phone (messages, notes, Pulse)
    news/              "Saltmere Herald" browser
    puzzle/[id].tsx    puzzle screen (code / evidence / photo / order / choice)
    chapter/[n].tsx    chapter title cards
    ending/[id].tsx    endings
    chapters.tsx, settings.tsx
  game/
    engine.ts          pure story engine (tick, choose, conditions, notification preview)
    store.ts           Zustand store, persistence, checkpoints
    notifications.ts   local notification scheduling
    sound.ts           sfx + ambience + haptics
    types.ts           data model
  content/
    chapters/ch1.ts …  chapter scripts (data)
    dsl.ts             authoring helpers
    characters.ts photos.ts clues.ts notes.ts news.ts ivyArchive.ts puzzles.ts endings.ts
assets/
  images/{avatars,photos,art}, sounds/, icon/splash
scripts/validate-story.js
```

## How the engine works
Each chapter is an array of **nodes**. The engine walks them in order:

| Node | Helper | What it does |
|---|---|---|
| `msg` | `speaker('maya','maya')('hi')`, `photo(t, from, id)`, `sys(t, text)` | message with delay + typing indicator |
| `choice` | `choice(t, [{ text, say?, goto?, set?, add?, requires? }])` | reply buttons in that chat; blocks |
| `label` / `goto` / `if` | `label('x')`, `goto('x')`, `when(cond, 'a', 'b')` | branching |
| `set` | `set({flag: true})`, `add({trust: 1})` | flags & counters |
| `unlock` | `clue()`, `pic()`, `note()`, `article()`, `app()`, `thread()`, `ivyThread()` | adds evidence / apps / contacts |
| `puzzle` | `puzzle('p_id', thread)` | posts a puzzle card; blocks until solved |
| `wait` | `wait(ms)` | real-time pause (good moment for a notification) |
| `objective` | `objective('...')` | updates the objective card |
| `chapterEnd` / `ending` | `chapterEnd(4)`, `ending('good')` | flow control |

Conditions: `{flag, eq|gte|lte}`, `{clue}`, `{solved}`, `{all:[…]}`, `{any:[…]}`, `{not:…}`.

Timing is chained from the previous message's scheduled time, so when the player returns after a break, `tick()` fast-forwards through everything that "arrived" meanwhile. When the app goes to background, `peekUpcoming()` schedules OS notifications for the next messages.

## Add a chapter
1. Create `src/content/chapters/ch4.ts`:
   ```ts
   import type { Chapter } from '../../game/types';
   import { script, speaker, choice, label, goto, chapterEnd, objective } from '../dsl';
   const T = speaker('tide', 'tide');
   export const ch4: Chapter = {
     n: 4, title: 'Undertow', subtitle: 'Three months later',
     art: require('../../../assets/images/art/ch3.jpg'),
     nodes: script(
       objective('Answer Ivy'),
       T('hey. it’s happening again.'),
       choice('tide', [{ text: 'What is?', goto: 'a' }, { text: 'Not again.', goto: 'a' }]),
       label('a'),
       T('…'),
       chapterEnd(null),
     ),
   };
   ```
2. Register it in `src/content/index.ts` (`CHAPTERS = [ch1, ch2, ch3, ch4]`).
3. Change the last node of chapter 3's path you want to continue from `ending(...)` to `chapterEnd(4)` (or add a new branch).
4. New clues/photos/puzzles go in their files in `src/content/`. New contacts: add a `ThreadId` in `types.ts` and an entry in `THREAD_META`.
5. Run `npm run validate-story` — it flags missing labels/references and proves every ending is still reachable.

## Assets
All images were generated for this project (dark, cinematic, teal/amber grade); puzzle-critical text (plaque date, registration, logbook, timestamps, tide table, relay map) was overlaid with ImageMagick so it's always legible. Sounds were synthesized with ffmpeg. Regenerate overlays with `work/make_art.sh` (kept outside the game folder).

## Credits / IP
Original story, characters and art. Inspired by the *genre* of phone-based mystery games such as An Elmwood Trail; no names, characters, plot, text or art from that game are used.

## CI/CD (GitHub Actions)
| Workflow | Trigger | What it does |
|---|---|---|
| `ci.yml` | every push to `main` and every PR | `npm ci`, typecheck, story validation (3,000 simulated runs), expo-doctor, web export (artifact) |
| `deploy-web.yml` | push to `main` | builds the web version and deploys it to GitHub Pages: https://bileldh-ing.github.io/mystery_game/ |
| `android-release.yml` | tag `v*` or manual | builds a release APK on GitHub runners (no Expo account) and attaches it to a GitHub Release |
| `eas-build.yml` | manual | optional EAS cloud build; needs the `EXPO_TOKEN` secret |

Ship a new version:
```bash
# bump "version" in app.json, then
git tag v1.0.1 && git push origin v1.0.1
```
The APK appears under Releases. The release APK is signed with the default debug key, fine for sideloading; use EAS `production` (or your own keystore) for the Play Store.
