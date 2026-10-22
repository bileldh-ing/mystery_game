import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { PUZZLES } from '../content';
import { choose, CoreState, initialCore, Settings, tick, EngineEvent } from './engine';
import type { Notif, ThreadId } from './types';

interface UIState {
  activeThread: ThreadId | null;
  typing: { thread: ThreadId; who: string } | null;
  banner: Notif | null;
  toast: string | null;
}

interface Actions {
  runTick: (background?: boolean) => EngineEvent[];
  pick: (idx: number) => void;
  startChapter: (n: number) => void;
  replayChapter: (n: number) => void;
  solve: (id: string, correct: boolean) => void;
  useHint: (id: string) => void;
  markRead: (t: ThreadId) => void;
  setActiveThread: (t: ThreadId | null) => void;
  clearNotifs: () => void;
  setBanner: (n: Notif | null) => void;
  setToast: (t: string | null) => void;
  setSetting: <K extends keyof Settings>(k: K, v: Settings[K]) => void;
  resetAll: () => void;
  clearEnding: () => void;
}

export type GameStore = CoreState &
  UIState &
  Actions & {
    settings: Settings;
    snapshots: Record<number, CoreState>;
    hydrated: boolean;
    unlockedPhone: boolean;
    setUnlockedPhone: (v: boolean) => void;
  };

const defaultSettings: Settings = { speed: 'normal', sound: true, haptics: true, notifications: true };

const coreOf = (s: GameStore): CoreState => ({
  cursor: s.cursor,
  awaitingChapter: s.awaitingChapter,
  messages: s.messages,
  unread: s.unread,
  threads: s.threads,
  flags: s.flags,
  clues: s.clues,
  photos: s.photos,
  notes: s.notes,
  articles: s.articles,
  apps: s.apps,
  ivyThreads: s.ivyThreads,
  solved: s.solved,
  hints: s.hints,
  posted: s.posted,
  objective: s.objective,
  notifs: s.notifs,
  waitUntil: s.waitUntil,
  anchor: s.anchor,
  currentEnding: s.currentEnding,
  endings: s.endings,
  completed: s.completed,
  seq: s.seq,
});

export const useGame = create<GameStore>()(
  persist(
    (set, get) => ({
      ...initialCore(),
      settings: defaultSettings,
      snapshots: {},
      hydrated: false,
      unlockedPhone: false,
      activeThread: null,
      typing: null,
      banner: null,
      toast: null,

      setUnlockedPhone: (v) => set({ unlockedPhone: v }),

      runTick: (background = false) => {
        const s = get();
        if (!s.cursor) {
          if (s.typing) set({ typing: null });
          return [];
        }
        const { state, events, typing } = tick(coreOf(s), Date.now(), s.settings, s.activeThread, background);
        const changed = events.length > 0 || state.cursor !== s.cursor || state.waitUntil !== s.waitUntil;
        const typingChanged = JSON.stringify(typing) !== JSON.stringify(s.typing);
        if (changed || typingChanged) set({ ...state, typing });
        return events;
      },

      pick: (idx) => {
        const s = get();
        const next = choose(coreOf(s), idx, Date.now());
        if (next) set(next);
      },

      startChapter: (n) => {
        const s = get();
        const core = coreOf(s);
        const snap = { ...core, cursor: { ch: n, i: 0 }, awaitingChapter: null, waitUntil: null, anchor: null };
        set({
          cursor: { ch: n, i: 0 },
          awaitingChapter: null,
          waitUntil: null,
          anchor: null,
          currentEnding: null,
          snapshots: { ...s.snapshots, [n]: snap },
        });
      },

      replayChapter: (n) => {
        const s = get();
        const snap = s.snapshots[n];
        if (!snap) return;
        // keep meta-progress (endings seen, completed chapters) across replays
        set({
          ...snap,
          endings: s.endings,
          completed: s.completed.filter((c) => c < n),
          cursor: null,
          awaitingChapter: n,
          currentEnding: null,
          waitUntil: null,
          anchor: null,
        });
      },

      solve: (id, correct) => {
        const s = get();
        const p = PUZZLES[id];
        if (!p || s.solved[id]) return;
        const flags = { ...s.flags };
        let clues = s.clues;
        if (p.kind.type === 'choice' && p.kind.oneShot) flags[p.kind.oneShot.flag] = correct;
        if (correct || (p.kind.type === 'choice' && p.kind.oneShot)) {
          if (correct && p.onSolve?.set) Object.assign(flags, p.onSolve.set);
          if (correct && p.onSolve?.clue && !clues.includes(p.onSolve.clue)) clues = [...clues, p.onSolve.clue];
          set({ solved: { ...s.solved, [id]: true }, flags, clues, anchor: Date.now(), waitUntil: null });
        }
      },

      useHint: (id) => set((s) => ({ hints: { ...s.hints, [id]: Math.min(3, (s.hints[id] ?? 0) + 1) } })),

      markRead: (t) => set((s) => ({ unread: { ...s.unread, [t]: 0 } })),
      setActiveThread: (t) => set({ activeThread: t }),
      clearNotifs: () => set({ notifs: [] }),
      setBanner: (b) => set({ banner: b }),
      setToast: (t) => set({ toast: t }),
      setSetting: (k, v) => set((s) => ({ settings: { ...s.settings, [k]: v } })),
      clearEnding: () => set({ currentEnding: null }),

      resetAll: () =>
        set({
          ...initialCore(),
          snapshots: {},
          unlockedPhone: false,
          typing: null,
          banner: null,
          toast: null,
          activeThread: null,
        }),
    }),
    {
      name: 'read214-save-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ ...coreOf(s), settings: s.settings, snapshots: s.snapshots }),
      onRehydrateStorage: () => () => {
        useGame.setState({ hydrated: true });
      },
    },
  ),
);
