// Tiny authoring DSL so chapter scripts read like a screenplay.
import type { ChoiceOption, Cond, EndingId, FlagValue, Node, Speaker, ThreadId, AppId } from '../game/types';

type MsgOpts = { delay?: number; typing?: number; photo?: string };

/** Message in thread `t` from speaker `from`. */
export const msg = (t: ThreadId, from: Speaker, text: string, o: MsgOpts = {}): Node => ({
  k: 'msg',
  t,
  from,
  text: text || undefined,
  ...o,
});

/** Returns a speaker function bound to a thread: say('hello'), or say(['a','b']) for a burst. */
export const speaker =
  (t: ThreadId, from: Speaker) =>
  (text: string | string[], o: MsgOpts = {}): Node[] =>
    (Array.isArray(text) ? text : [text]).map((x) => msg(t, from, x, o));

export const photo = (t: ThreadId, from: Speaker, id: string, caption?: string): Node => ({
  k: 'msg',
  t,
  from,
  photo: id,
  text: caption,
});

export const sys = (t: ThreadId, text: string): Node => ({ k: 'msg', t, from: 'system', text, typing: 0 });

export const choice = (t: ThreadId, options: ChoiceOption[]): Node => ({ k: 'choice', t, options });
export const label = (id: string): Node => ({ k: 'label', id });
export const goto = (to: string): Node => ({ k: 'goto', to });
export const when = (cond: Cond, then: string, otherwise?: string): Node => ({ k: 'if', cond, then, else: otherwise });
export const set = (flags: Record<string, FlagValue>): Node => ({ k: 'set', flags });
export const add = (a: Record<string, number>): Node => ({ k: 'set', add: a });
export const clue = (id: string): Node => ({ k: 'unlock', clue: id });
export const pic = (id: string): Node => ({ k: 'unlock', photo: id });
export const note = (id: string): Node => ({ k: 'unlock', note: id });
export const article = (id: string): Node => ({ k: 'unlock', article: id });
export const app = (id: AppId): Node => ({ k: 'unlock', app: id });
export const thread = (id: ThreadId): Node => ({ k: 'unlock', thread: id });
export const ivyThread = (id: string): Node => ({ k: 'unlock', ivyThread: id });
export const puzzle = (id: string, t: ThreadId): Node => ({ k: 'puzzle', id, t });
export const wait = (ms: number, reason?: string): Node => ({ k: 'wait', ms, reason });
export const objective = (text: string): Node => ({ k: 'objective', text });
export const chapterEnd = (next: number | null): Node => ({ k: 'chapterEnd', next });
export const ending = (id: EndingId): Node => ({ k: 'ending', id });

/** Flatten nested arrays of nodes. */
export const script = (...parts: (Node | Node[])[]): Node[] => parts.flat();
