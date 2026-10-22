// Pure story engine: given the saved state and the current time, advance the script.
// No React, no timers — the runner calls tick() a few times per second and on resume,
// which also makes "catch-up while the app was closed" free.
import { CHAPTERS, PUZZLES, CHARACTERS, THREAD_META } from '../content';
import type {
  AppId, ChatMsg, Cond, EndingId, FlagValue, Node, Notif, ThreadId,
} from './types';

export interface Settings {
  speed: 'normal' | 'fast' | 'instant';
  sound: boolean;
  haptics: boolean;
  notifications: boolean;
}

export interface CoreState {
  cursor: { ch: number; i: number } | null;
  awaitingChapter: number | null;
  messages: Partial<Record<ThreadId, ChatMsg[]>>;
  unread: Partial<Record<ThreadId, number>>;
  threads: ThreadId[];
  flags: Record<string, FlagValue>;
  clues: string[];
  photos: string[];
  notes: string[];
  articles: string[];
  apps: AppId[];
  ivyThreads: string[];
  solved: Record<string, boolean>;
  hints: Record<string, number>;
  posted: Record<string, boolean>;
  objective: string | null;
  notifs: Notif[];
  /** when the current timed node completes */
  waitUntil: number | null;
  /** completion time of the previous timed node (chains timing across background gaps) */
  anchor: number | null;
  currentEnding: EndingId | null;
  endings: EndingId[];
  completed: number[];
  seq: number;
}

export type EngineEvent =
  | { type: 'message'; thread: ThreadId; msg: ChatMsg; background: boolean }
  | { type: 'toast'; text: string }
  | { type: 'chapter'; n: number }
  | { type: 'ending'; id: EndingId }
  | { type: 'puzzle'; id: string };

export const initialCore = (): CoreState => ({
  cursor: null,
  awaitingChapter: 1,
  messages: {},
  unread: {},
  threads: [],
  flags: {},
  clues: [],
  photos: [],
  notes: [],
  articles: [],
  apps: ['messages', 'gallery', 'board', 'chapters', 'settings'],
  ivyThreads: [],
  solved: {},
  hints: {},
  posted: {},
  objective: null,
  notifs: [],
  waitUntil: null,
  anchor: null,
  currentEnding: null,
  endings: [],
  completed: [],
  seq: 0,
});

const SPEED: Record<Settings['speed'], number> = { normal: 1, fast: 0.45, instant: 0.04 };

// ---------- label index ----------
const labelIndex: Record<number, Record<string, number>> = {};
for (const c of CHAPTERS) {
  const map: Record<string, number> = {};
  c.nodes.forEach((n, i) => {
    if (n.k === 'label') {
      if (map[n.id] !== undefined) console.warn(`Duplicate label ${n.id} in chapter ${c.n}`);
      map[n.id] = i;
    }
  });
  labelIndex[c.n] = map;
}

export const nodeAt = (cur: CoreState['cursor']): Node | undefined => {
  if (!cur) return undefined;
  return CHAPTERS.find((c) => c.n === cur.ch)?.nodes[cur.i];
};

export function evalCond(c: Cond, s: Pick<CoreState, 'flags' | 'clues' | 'solved'>): boolean {
  if ('all' in c) return c.all.every((x) => evalCond(x, s));
  if ('any' in c) return c.any.some((x) => evalCond(x, s));
  if ('not' in c) return !evalCond(c.not, s);
  if ('clue' in c) return s.clues.includes(c.clue);
  if ('solved' in c) return !!s.solved[c.solved];
  const v = s.flags[c.flag];
  if (c.eq !== undefined) return v === c.eq || (c.eq === false && v === undefined);
  if (c.gte !== undefined) return Number(v ?? 0) >= c.gte;
  if (c.lte !== undefined) return Number(v ?? 0) <= c.lte;
  return !!v;
}

/** Duration (ms) a timed node takes, and how much of the tail is "typing…". */
export function nodeDuration(n: Node, speed: Settings['speed']): { total: number; typing: number } {
  const k = SPEED[speed];
  if (n.k === 'wait') return { total: n.ms * k, typing: 0 };
  if (n.k !== 'msg') return { total: 0, typing: 0 };
  if (n.from === 'system') return { total: 350 * k, typing: 0 };
  if (n.from === 'me') return { total: 450 * k, typing: 0 };
  const len = (n.text ?? '').length;
  const typing = n.typing ?? (n.photo ? 2200 : Math.min(4500, Math.max(900, 600 + len * 40)));
  const delay = n.delay ?? 700;
  return { total: (delay + typing) * k, typing: typing * k };
}

const isTimed = (n: Node) => n.k === 'msg' || n.k === 'wait';

function jump(s: CoreState, label: string) {
  const idx = labelIndex[s.cursor!.ch]?.[label];
  if (idx === undefined) {
    console.warn('Missing label', label);
    s.cursor = { ...s.cursor!, i: s.cursor!.i + 1 };
  } else s.cursor = { ...s.cursor!, i: idx };
}

const advance = (s: CoreState) => {
  s.cursor = { ...s.cursor!, i: s.cursor!.i + 1 };
};

function applyFlags(s: CoreState, setF?: Record<string, FlagValue>, addF?: Record<string, number>) {
  if (setF || addF) s.flags = { ...s.flags };
  if (setF) Object.assign(s.flags, setF);
  if (addF) for (const [k, v] of Object.entries(addF)) s.flags[k] = Number(s.flags[k] ?? 0) + v;
}

const uniqPush = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr : [...arr, v]);

export function pushMessage(
  s: CoreState,
  thread: ThreadId,
  m: Omit<ChatMsg, 'id'>,
  activeThread: ThreadId | null,
  events: EngineEvent[],
  background: boolean,
) {
  s.seq += 1;
  const msg: ChatMsg = { ...m, id: `m${s.seq}` };
  s.messages = { ...s.messages, [thread]: [...(s.messages[thread] ?? []), msg] };
  s.threads = uniqPush(s.threads, thread);
  if (m.from !== 'me') {
    const viewing = activeThread === thread && !background;
    if (!viewing) {
      s.unread = { ...s.unread, [thread]: (s.unread[thread] ?? 0) + 1 };
      if (m.from !== 'system' || m.puzzle) {
        const meta = THREAD_META[thread];
        const n: Notif = {
          id: msg.id,
          thread,
          title: thread === 'tide' && s.flags.tideIdentified ? 'Theo (TIDE)' : meta.name,
          body: m.photo ? '📷 Photo' : m.puzzle ? '🧩 New puzzle' : (m.text ?? ''),
          at: m.at,
        };
        s.notifs = [...s.notifs.slice(-30), n];
      }
    }
    events.push({ type: 'message', thread, msg, background: !viewing });
  }
}

function applyUnlock(s: CoreState, n: Extract<Node, { k: 'unlock' }>, events: EngineEvent[]) {
  if (n.clue && !s.clues.includes(n.clue)) {
    s.clues = [...s.clues, n.clue];
    events.push({ type: 'toast', text: '🔎 New clue added to Case Board' });
  }
  if (n.photo && !s.photos.includes(n.photo)) {
    s.photos = [...s.photos, n.photo];
  }
  if (n.note && !s.notes.includes(n.note)) s.notes = [...s.notes, n.note];
  if (n.article) {
    s.articles = uniqPush(s.articles, n.article);
    s.apps = uniqPush(s.apps, 'news');
  }
  if (n.app) s.apps = uniqPush(s.apps, n.app);
  if (n.thread) s.threads = uniqPush(s.threads, n.thread);
  if (n.ivyThread) s.ivyThreads = uniqPush(s.ivyThreads, n.ivyThread);
}

/**
 * Advance the story as far as `now` allows. Returns a NEW state object and side-effect events.
 */
export function tick(
  prev: CoreState,
  now: number,
  settings: Settings,
  activeThread: ThreadId | null,
  background = false,
): { state: CoreState; events: EngineEvent[]; typing: { thread: ThreadId; who: string } | null } {
  const s: CoreState = { ...prev };
  const events: EngineEvent[] = [];
  let typing: { thread: ThreadId; who: string } | null = null;

  for (let guard = 0; guard < 400; guard++) {
    const n = nodeAt(s.cursor);
    if (!s.cursor) break;
    if (!n) {
      s.cursor = null;
      break;
    }

    if (isTimed(n)) {
      const d = nodeDuration(n, settings.speed);
      if (s.waitUntil == null) {
        const base = s.anchor != null ? Math.max(s.anchor, now - 60 * 60 * 1000) : now;
        s.waitUntil = base + d.total;
      }
      if (now < s.waitUntil) {
        if (n.k === 'msg' && n.from !== 'me' && n.from !== 'system' && now >= s.waitUntil - d.typing) {
          typing = { thread: n.t, who: CHARACTERS[n.from as keyof typeof CHARACTERS]?.short ?? '' };
        }
        break;
      }
      // complete
      const doneAt = s.waitUntil;
      s.waitUntil = null;
      s.anchor = doneAt;
      if (n.k === 'msg') {
        pushMessage(
          s,
          n.t,
          { from: n.from, text: n.text, photo: n.photo, at: Math.min(doneAt, now) },
          activeThread,
          events,
          background,
        );
        if (n.photo && !s.photos.includes(n.photo)) s.photos = [...s.photos, n.photo];
      }
      advance(s);
      continue;
    }

    switch (n.k) {
      case 'label':
        advance(s);
        continue;
      case 'goto':
        jump(s, n.to);
        continue;
      case 'if':
        if (evalCond(n.cond, s)) jump(s, n.then);
        else if (n.else) jump(s, n.else);
        else advance(s);
        continue;
      case 'set':
        applyFlags(s, n.flags, n.add);
        advance(s);
        continue;
      case 'unlock':
        applyUnlock(s, n, events);
        advance(s);
        continue;
      case 'objective':
        s.objective = n.text;
        advance(s);
        continue;
      case 'choice':
        s.anchor = null;
        if (activeThread !== n.t && !s.posted[`choice-${s.cursor.ch}-${s.cursor.i}`]) {
          s.posted = { ...s.posted, [`choice-${s.cursor.ch}-${s.cursor.i}`]: true };
          s.unread = { ...s.unread, [n.t]: Math.max(1, s.unread[n.t] ?? 0) };
        }
        return { state: s, events, typing };
      case 'puzzle': {
        s.anchor = null;
        if (!s.posted[n.id]) {
          s.posted = { ...s.posted, [n.id]: true };
          pushMessage(s, n.t, { from: 'system', puzzle: n.id, text: PUZZLES[n.id]?.title, at: now }, activeThread, events, background);
          events.push({ type: 'puzzle', id: n.id });
        }
        if (s.solved[n.id]) {
          advance(s);
          continue;
        }
        return { state: s, events, typing };
      }
      case 'chapterEnd':
        s.completed = uniqPush(s.completed, s.cursor.ch);
        s.cursor = null;
        s.anchor = null;
        s.waitUntil = null;
        s.objective = null;
        if (n.next != null) {
          s.awaitingChapter = n.next;
          events.push({ type: 'chapter', n: n.next });
        }
        return { state: s, events, typing };
      case 'ending':
        s.completed = uniqPush(s.completed, s.cursor.ch);
        s.cursor = null;
        s.anchor = null;
        s.waitUntil = null;
        s.objective = null;
        s.currentEnding = n.id;
        s.endings = uniqPush(s.endings, n.id);
        events.push({ type: 'ending', id: n.id });
        return { state: s, events, typing };
      default:
        advance(s);
    }
  }
  return { state: s, events, typing };
}

/** Player picked option `idx` on the current choice node. */
export function choose(prev: CoreState, idx: number, now: number): CoreState | null {
  const n = nodeAt(prev.cursor);
  if (!n || n.k !== 'choice') return null;
  const visible = n.options.filter((o) => !o.requires || evalCond(o.requires, prev));
  const opt = visible[idx];
  if (!opt) return null;
  const s: CoreState = { ...prev };
  const events: EngineEvent[] = [];
  pushMessage(s, n.t, { from: 'me', text: opt.say ?? opt.text, at: now }, n.t, events, false);
  applyFlags(s, opt.set, opt.add);
  if (opt.goto) jump(s, opt.goto);
  else advance(s);
  s.anchor = now;
  s.waitUntil = null;
  return s;
}

/** Messages that will arrive (with ETA) before the next blocking node — used for OS notifications. */
export function peekUpcoming(prev: CoreState, now: number, settings: Settings, max = 8) {
  const s: CoreState = { ...prev, flags: { ...prev.flags } };
  const out: { at: number; thread: ThreadId; title: string; body: string }[] = [];
  let t = s.waitUntil ?? now;
  let first = s.waitUntil != null;
  for (let guard = 0; guard < 300 && out.length < max; guard++) {
    const n = nodeAt(s.cursor);
    if (!n || !s.cursor) break;
    if (isTimed(n)) {
      if (!first) t += nodeDuration(n, settings.speed).total;
      first = false;
      if (n.k === 'msg' && n.from !== 'me' && n.from !== 'system') {
        out.push({ at: t, thread: n.t, title: THREAD_META[n.t].name, body: n.photo ? '📷 Photo' : (n.text ?? '') });
      }
      advance(s);
      continue;
    }
    if (n.k === 'label' || n.k === 'unlock' || n.k === 'objective') { advance(s); continue; }
    if (n.k === 'set') { applyFlags(s, n.flags, n.add); advance(s); continue; }
    if (n.k === 'goto') { jump(s, n.to); continue; }
    if (n.k === 'if') {
      if (evalCond(n.cond, s)) jump(s, n.then);
      else if (n.else) jump(s, n.else);
      else advance(s);
      continue;
    }
    break;
  }
  return out;
}
