import type { IvyThread } from '../game/types';
import { AV } from './characters';

// Read-only conversations recovered from Ivy's cloud backup.
export const IVY_THREADS: Record<string, IvyThread> = {
  family: {
    id: 'family',
    name: 'home 🏠',
    emoji: '🏠',
    messages: [
      { from: 'dad', text: 'Fish pie tonight. Whoever is home by 7 gets the crispy bit.', time: 'Thu 18:02' },
      { from: 'ivy', text: 'save me the crispy bit pls i’m on till 8', time: 'Thu 18:05' },
      { from: 'theo', text: 'no', time: 'Thu 18:05' },
      { from: 'ivy', text: 'goblin', time: 'Thu 18:06' },
      { from: 'dad', text: 'Going out on the boat early tomorrow. Back Sat lunch. Be good both of you.', time: 'Fri 16:40' },
      { from: 'ivy', text: 'we are always good. theo is the problem', time: 'Fri 16:44' },
      {
        from: 'ivy',
        text: "I can't do this anymore. Don't look for me. I'm sorry.\n— Ivy",
        time: 'Sat 02:14',
        read: 'Read 02:14',
      },
      { from: 'dad', text: 'Ivy?? What does that mean. Call me.', time: 'Sat 06:12' },
      { from: 'dad', text: 'Ivy please. Just tell us you are safe.', time: 'Sat 06:40' },
      { from: 'theo', text: 'ives', time: 'Sat 07:03' },
      { from: 'theo', text: 'ives pls', time: 'Sat 07:03' },
      { from: 'system', text: 'Message not delivered', time: 'Sat 07:04' },
    ],
  },
  maya: {
    id: 'maya',
    name: 'maya 🌻',
    avatar: AV.maya,
    messages: [
      { from: 'maya', text: 'IVY. IVY. the new guy put oat milk in the regular jug AGAIN', time: 'Tue 10:12' },
      { from: 'ivy', text: 'let him live, he is a baby deer', time: 'Tue 10:15' },
      { from: 'maya', text: 'r u coming to jonahs thing fri?? 🔥🔥', time: 'Wed 21:30' },
      { from: 'ivy', text: 'idk. it’s weird with him', time: 'Wed 21:41' },
      { from: 'ivy', text: 'also i have a thing after. important thing. can’t say yet', time: 'Wed 21:41' },
      { from: 'maya', text: 'ooooh mysterious 👀 is it a BOY', time: 'Wed 21:42' },
      { from: 'ivy', text: 'it’s about mum', time: 'Wed 21:50' },
      { from: 'maya', text: 'oh babe. ok. i’m here ok? always 💛', time: 'Wed 21:51' },
      { from: 'ivy', text: 'i know', time: 'Wed 21:52' },
    ],
  },
  jonah: {
    id: 'jonah',
    name: 'jonah',
    avatar: AV.jonah,
    messages: [
      { from: 'jonah', text: 'so thats it then', time: '4 Sep 23:10' },
      { from: 'ivy', text: 'i’m sorry. i just can’t right now. it’s not you', time: '4 Sep 23:14' },
      { from: 'jonah', text: 'its always not me', time: '4 Sep 23:15' },
      { from: 'jonah', text: 'u coming fri or wat', time: 'Thu 22:30' },
      { from: 'ivy', text: 'maybe. for maya', time: 'Thu 22:47' },
      { from: 'jonah', text: 'cool so u can ignore me in person', time: 'Thu 22:48' },
      { from: 'jonah', text: 'ur gonna regret this', time: 'Thu 22:48' },
      { from: 'jonah', text: 'not like that. i mean ur gonna regret not giving it another go. forget it', time: 'Thu 22:52' },
    ],
  },
  goblin: {
    id: 'goblin',
    name: 'goblin 🦀',
    emoji: '🦀',
    messages: [
      { from: 'theo', text: 'did u eat my crisps', time: 'Thu 23:01' },
      { from: 'ivy', text: 'they were calling to me', time: 'Thu 23:02' },
      { from: 'ivy', text: 'can u get me from the cannery at 1:40? dont tell dad. pls. ives owes u forever', time: 'Sat 01:02' },
      { from: 'ivy', text: 'pls come now', time: 'Sat 01:21' },
      { from: 'system', text: 'Unread', time: '' },
    ],
  },
};

export const DELETED_NOTICE = '1 conversation deleted · Sat 3 Oct, 02:11';
