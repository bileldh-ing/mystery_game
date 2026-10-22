# Design analysis — what makes "An Elmwood Trail" work, and what Read 2:14 takes from it

*Reference game:* **An Elmwood Trail – Crime Story** (Techyonic, Android/iOS, 2023; episodes 1–3 out, ep. 4 announced). Read 2:14 is an original IP — no names, characters, plot, art or text are reused.

## How the reference plays (research summary)
Sources: Google Play / App Store listings, Techyonic site, itch.io page, PlaynForge review (2025/2026), TapTap player reviews, AppGamer walkthroughs.

- **The whole game is a fake phone.** Messenger, photos, notes, social media and call logs; reviewers say the UI "made it seem I was really scrolling through Zoey's lost phone".
- **Hook by an anonymous texter.** A blackmailing unknown number pulls a disgraced detective into a cold missing-girl case (ruled a runaway after 3 weeks).
- **Two phones + a desk.** Your phone, the victim's recovered phone, and a detective desk/suspect board where you pin clues and connect dots.
- **Messenger interrogation with reply choices.** You question friends, family and suspects; messages arrive with typing beats; hidden clues give you leverage in conversations.
- **Puzzles gate progress.** Phone-recovery codes from diary hints, clocks in photos, social-media details; "zoom in, look at backgrounds — nothing is there by accident".
- **Hints, not answers.** Every objective has 3 hints. Optional ads unlock hints; no energy system, no paywall on the main story (paid "Sidetrails" are optional side cases).
- **Episodic, cliffhanger endings** ("What has happened to Kevin… the house with no windows").
- **Weaknesses players mention:** clunky/awkward writing, characters ignoring what you said, long waits between episodes.

## Design pillars for Read 2:14
1. **Phone realism** — lock screen with stacking notifications, home screen with badges, messenger with typing dots, timestamps, "Delivered/Read" receipts, in-app banners, real OS notifications when the app is closed.
2. **Every answer is in the evidence** — 6 core puzzles + 1 optional, each solvable from things on screen (photo details via an *Inspect* lens, notes, articles, chats). 3 hints each, the third reveals the answer. No ads, no energy, no paywall.
3. **Distinct voices** — each suspect types differently (punctuation, emoji, capitalisation). The writing itself becomes a clue (Puzzle 2 and Walt's slip).
4. **Choices that matter** — trust/approach branches change dialogue, one timed decision (locker now vs. daylight) changes the evidence you end with, and the final accusation + "who do you trust" decide between 3 endings.
5. **Fix the reference's weak spots** — tight, deliberate writing; replies acknowledge your choice; a complete 3-chapter arc with real endings instead of a cliffhanger.

## Pacing model
- Messages arrive with *delay + typing time* scaled by length (~1–5 s), so a chat feels like a person typing. Settings offer Real-time / Fast / Instant.
- Short "real-time pauses" (5–7 s) push the player to go read a note or article — the message then arrives as a banner.
- Leaving the app schedules up to 3 OS notifications for the messages that would have arrived; on return, the engine fast-forwards (timing is chained, not reset), like a real conversation that went on without you.
- Each chapter ends on a hook and a title card; checkpoints at every chapter start allow replays for other endings.
- Estimated first playthrough: ~35–50 min (≈290 messages, 6–7 puzzles, ~3,000 words of notes/articles/archived chats). Replays for the other endings take 10–20 min each.

## Engine
Data-driven node script per chapter (`msg`, `choice`, `label/goto/if`, `set`, `unlock`, `puzzle`, `wait`, `objective`, `chapterEnd`, `ending`), a pure `tick()` function, and a Zustand store persisted to AsyncStorage. `scripts/validate-story.js` checks references and plays 3,000 random playthroughs to prove every ending is reachable with no dead ends.
