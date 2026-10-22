import type { Puzzle } from '../game/types';
import { AV } from './characters';

export const PUZZLES: Record<string, Puzzle> = {
  p_passcode: {
    id: 'p_passcode',
    title: 'Ivy’s Passcode',
    prompt:
      'Ivy’s cloud phone is locked with a 4-digit code. Maya says Ivy always uses the day her mum’s boat went down — day first, then month.',
    kind: {
      type: 'code',
      fields: [{ label: 'Passcode', placeholder: '• • • •', answers: ['1703'], keyboard: 'numeric' }],
    },
    hints: [
      'Her mum died on the ferry Merrow. Is there anything that gives the date?',
      'Look closely at the memorial plaque TIDE sent you (Gallery). The date is in Roman numerals.',
      '17 · III · 2020 → day 17, month 3 → 17 03.',
    ],
    success: 'Unlocked. Ivy’s phone is open.',
    onSolve: { set: { ivyUnlocked: true } },
  },
  p_voice: {
    id: 'p_voice',
    title: 'Not Her Voice',
    prompt:
      'Read the 02:14 message in Ivy’s family chat. Which TWO facts prove Ivy didn’t write it herself?',
    kind: {
      type: 'evidence',
      pick: 2,
      options: [
        { id: 'late', label: 'It was sent in the middle of the night' },
        { id: 'caps', label: 'It uses capital letters — Ivy always types in lowercase' },
        { id: 'car', label: 'Her car was found at the ferry lot' },
        { id: 'sign', label: 'It’s signed “— Ivy” — she never signs messages' },
        { id: 'off', label: 'Her phone was switched off afterwards' },
        { id: 'sorry', label: 'She apologised' },
      ],
      correct: ['caps', 'sign'],
    },
    hints: [
      'Compare it with every other message Ivy wrote, in any chat.',
      'Think about HOW it’s written, not what it says or when.',
      'Look at the first letter of each sentence, and at the very end of the message.',
    ],
    success: 'Ivy didn’t write that message. Someone else had her phone at 02:14.',
    onSolve: { clue: 'not_her_voice' },
  },
  p_maya: {
    id: 'p_maya',
    title: 'Maya’s Alibi',
    prompt: 'Maya told police she was home alone all night. Show her the photo that proves she wasn’t.',
    kind: { type: 'photo', options: ['plaque', 'bonfire', 'cctv', 'rockpool', 'timecard'], correct: 'bonfire' },
    hints: [
      'One of the photos from Ivy’s cloud was taken that same night.',
      'Check the timestamp and who’s in the frame.',
      'IMG_4471, 23:47: mustard-yellow raincoat, sunflower phone case.',
    ],
    success: 'Busted. Maya was at the bonfire.',
    onSolve: { clue: 'maya_lied' },
  },
  p_timeline: {
    id: 'p_timeline',
    title: 'The Night of 2–3 October',
    prompt: 'Put the events of that night in order, earliest first. Use the timestamps on your clues and photos.',
    kind: {
      type: 'order',
      items: [
        { id: 'msg', label: 'Goodbye message sent from Ivy’s phone' },
        { id: 'photo', label: 'Bonfire photo taken on Ivy’s phone' },
        { id: 'pls', label: 'Ivy texts “pls come now”' },
        { id: 'car', label: 'Ivy’s car parks at the ferry lot' },
        { id: 'leaves', label: 'Ivy storms off from the bonfire' },
        { id: 'skiff', label: 'Jonah sees a dark skiff head out' },
      ],
      correct: ['photo', 'leaves', 'pls', 'skiff', 'msg', 'car'],
    },
    hints: [
      'Every event has a time somewhere: a photo date, a message time, a confession, a CCTV stamp.',
      '23:47 photo · ~00:50 leaves · 01:21 text · ~01:30 skiff · 02:14 message · 03:05 CCTV.',
      'Order: photo → leaves → “pls come now” → skiff → goodbye message → car.',
    ],
    success:
      'Her car arrived at the ferry lot 51 minutes AFTER “she” said goodbye — 3½ hours before the first ferry. Someone else drove it.',
    onSolve: { clue: 'car_moved' },
  },
  p_locker: {
    id: 'p_locker',
    title: 'Locker 27',
    prompt:
      'Ivy’s note: “put it where mum last waved from. 27. her boat’s numbers.” Locker 27 at the ferry terminal has a 4-digit combination lock.',
    kind: {
      type: 'code',
      fields: [{ label: 'Combination', placeholder: '• • • •', answers: ['4127'], keyboard: 'numeric' }],
    },
    hints: [
      '“Her boat” is the Merrow. Boats carry numbers painted on them.',
      'There’s an archive photo of the Merrow (in the Herald article and your Gallery). Look at the bow.',
      'Registration SM-4127 → 4127.',
    ],
    success: 'Click. The lock gives.',
    onSolve: { set: { lockerOpened: true } },
  },
  p_location: {
    id: 'p_location',
    title: 'Where Is Ivy?',
    prompt:
      'Ivy’s band last synced through relay HA-R7. Where is that — and when can a rescue team cross to it on foot tonight? (24h time, e.g. 0915)',
    kind: {
      type: 'code',
      fields: [
        { label: 'Place', placeholder: 'location name', answers: ['gullrock', 'gullrockfogstation', 'fogstation', 'gullrockfogsignalstation'] },
        { label: 'Low water', placeholder: 'HHMM', answers: ['0340', '340'], keyboard: 'numeric' },
      ],
    },
    hints: [
      'The Herald piece on the harbour’s “smart” tide sensors has a relay map. The tide table is in your Gallery.',
      'R7 sits on the old fog station. The causeway only opens below 1.0 m.',
      'Gull Rock. Tonight’s only low under 1.0 m is Tue 03:40 (0.4 m) → 0340.',
    ],
    success: 'Gull Rock fog station. The causeway opens around 03:40.',
    onSolve: { clue: 'location' },
  },
  p_tide: {
    id: 'p_tide',
    title: 'Who Is TIDE?',
    prompt: 'You get one guess. Who has been texting you as TIDE?',
    kind: {
      type: 'choice',
      options: [
        { id: 'maya', label: 'Maya Okafor', avatar: AV.maya },
        { id: 'jonah', label: 'Jonah Price', avatar: AV.jonah },
        { id: 'theo', label: 'Theo Calder', avatar: AV.theo },
        { id: 'brennan', label: 'Sgt. Brennan', avatar: AV.brennan },
        { id: 'ivy', label: 'Ivy herself', avatar: AV.ivy },
      ],
      correct: 'theo',
      oneShot: { flag: 'tideIdentified' },
    },
    hints: [
      'TIDE knew Ivy’s cloud password and calls her by a nickname. Who uses it?',
      'Look at Ivy’s family chat and the old rock-pool photo.',
      '“ives” is Theo’s name for her. “my little tide-pool goblin” = TIDE.',
    ],
    success: 'You made your guess.',
  },
};
