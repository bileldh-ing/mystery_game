// Core data model for the story engine.
// Chapters are plain arrays of nodes, so adding content never touches engine code.

export type CharId =
  | 'tide'
  | 'maya'
  | 'jonah'
  | 'walt'
  | 'brennan'
  | 'ivy'
  | 'theo'
  | 'rahman'
  | 'dad';

/** Threads that live on the player's phone (Messages app). */
export type ThreadId = 'tide' | 'maya' | 'jonah' | 'walt' | 'brennan' | 'rahman' | 'ivy';

export type Speaker = CharId | 'me' | 'system';

export type FlagValue = boolean | number | string;

export type Cond =
  | { flag: string; eq?: FlagValue; gte?: number; lte?: number }
  | { clue: string }
  | { solved: string }
  | { all: Cond[] }
  | { any: Cond[] }
  | { not: Cond };

export interface ChoiceOption {
  /** Text on the reply button. */
  text: string;
  /** What actually gets sent (defaults to text). */
  say?: string;
  /** Label to jump to after choosing (defaults to the next node). */
  goto?: string;
  /** Flags to set; numbers are ADDED when `add` is true. */
  set?: Record<string, FlagValue>;
  add?: Record<string, number>;
  /** Only shown when the condition holds. */
  requires?: Cond;
}

export type Node =
  | {
      k: 'msg';
      t: ThreadId;
      from: Speaker;
      text?: string;
      photo?: string;
      /** extra pause before typing starts (ms) */
      delay?: number;
      /** override typing duration (ms) */
      typing?: number;
    }
  | { k: 'choice'; t: ThreadId; options: ChoiceOption[] }
  | { k: 'label'; id: string }
  | { k: 'goto'; to: string }
  | { k: 'if'; cond: Cond; then: string; else?: string }
  | { k: 'set'; flags?: Record<string, FlagValue>; add?: Record<string, number> }
  | {
      k: 'unlock';
      clue?: string;
      photo?: string;
      note?: string;
      article?: string;
      app?: AppId;
      thread?: ThreadId;
      ivyThread?: string;
    }
  | { k: 'puzzle'; id: string; t: ThreadId }
  | { k: 'wait'; ms: number; reason?: string }
  | { k: 'objective'; text: string }
  | { k: 'chapterEnd'; next: number | null }
  | { k: 'ending'; id: EndingId };

export type AppId = 'messages' | 'gallery' | 'board' | 'ivy' | 'news' | 'chapters' | 'settings';

export type EndingId = 'bad' | 'good' | 'true';

export interface Chapter {
  n: number;
  title: string;
  subtitle: string;
  art: number; // require() id
  nodes: Node[];
}

export interface Character {
  id: CharId;
  name: string;
  short: string;
  avatar: number;
  role: string;
  /** Line shown on the evidence board */
  bio: string;
  suspect?: boolean;
}

export interface Photo {
  id: string;
  title: string;
  src: number;
  date: string;
  album: 'Received' | "Ivy's Cloud" | 'Archive';
  /** Things you notice when you inspect it (revealed in the viewer) */
  details: string[];
}

export interface Clue {
  id: string;
  title: string;
  text: string;
  about?: CharId[];
  photo?: string;
}

export interface IvyNote {
  id: string;
  title: string;
  date: string;
  body: string;
}

export interface Article {
  id: string;
  title: string;
  date: string;
  source: string;
  photo?: string;
  body: string;
}

export interface ArchiveMsg {
  from: CharId | 'ivy' | 'system';
  text?: string;
  photo?: string;
  time: string;
  read?: string;
}

export interface IvyThread {
  id: string;
  name: string;
  avatar?: number;
  emoji?: string;
  messages: ArchiveMsg[];
}

export type PuzzleKind =
  | {
      type: 'code';
      fields: { label: string; placeholder: string; answers: string[]; keyboard?: 'numeric' | 'default' }[];
    }
  | { type: 'evidence'; pick: number; options: { id: string; label: string }[]; correct: string[] }
  | { type: 'photo'; options: string[]; correct: string }
  | { type: 'order'; items: { id: string; label: string }[]; correct: string[] }
  | {
      type: 'choice';
      options: { id: string; label: string; avatar?: number }[];
      correct: string;
      /** one attempt only; outcome stored in flag */
      oneShot?: { flag: string };
    };

export interface Puzzle {
  id: string;
  title: string;
  prompt: string;
  kind: PuzzleKind;
  hints: [string, string, string];
  success: string;
  onSolve?: { clue?: string; set?: Record<string, FlagValue> };
}

export interface Ending {
  id: EndingId;
  title: string;
  tagline: string;
  art: number;
  /** Paragraph variants picked by flags at runtime */
  body: (flags: Record<string, FlagValue>) => string[];
}

export interface ChatMsg {
  id: string;
  from: Speaker;
  text?: string;
  photo?: string;
  puzzle?: string;
  at: number;
}

export interface Notif {
  id: string;
  thread: ThreadId;
  title: string;
  body: string;
  at: number;
}
