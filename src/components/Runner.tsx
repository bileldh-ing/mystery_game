// Drives the story engine: ticks while the app is open, fast-forwards on resume,
// shows in-app banners, plays sounds, and hands off to OS notifications in background.
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { cancelScheduled, initNotifications, scheduleUpcoming } from '../game/notifications';
import { initAudio, play, setAmbient } from '../game/sound';
import { useGame } from '../game/store';
import type { Notif } from '../game/types';
import { THREAD_META } from '../content';

export function Runner() {
  const router = useRouter();
  const hydrated = useGame((s) => s.hydrated);
  const routerRef = useRef(router);
  routerRef.current = router;

  useEffect(() => {
    initAudio();
    initNotifications();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    let active = AppState.currentState !== 'background';
    const loop = () => {
      if (!active) return;
      const events = useGame.getState().runTick(false);
      let notified = false;
      for (const e of events) {
        if (e.type === 'message') {
          if (e.background) {
            if (!notified && e.msg.from !== 'system') {
              const st = useGame.getState();
              const meta = THREAD_META[e.thread];
              const b: Notif = {
                id: e.msg.id,
                thread: e.thread,
                title: e.thread === 'tide' && st.flags.tideIdentified ? 'Theo (TIDE)' : meta.name,
                body: e.msg.photo ? '📷 Photo' : (e.msg.text ?? ''),
                at: e.msg.at,
              };
              st.setBanner(b);
              play('notify');
              notified = true;
            } else if (!notified && e.msg.puzzle) {
              play('notify');
              notified = true;
            }
          } else if (e.msg.from !== 'system') play('receive');
        } else if (e.type === 'toast') {
          useGame.getState().setToast(e.text);
          play('clue');
        } else if (e.type === 'chapter') {
          setTimeout(() => routerRef.current.push({ pathname: '/chapter/[n]', params: { n: String(e.n) } }), 1600);
        } else if (e.type === 'ending') {
          setTimeout(() => routerRef.current.replace({ pathname: '/ending/[id]', params: { id: e.id } }), 1800);
        }
      }
    };
    const id = setInterval(loop, 250);
    const sub = AppState.addEventListener('change', (st) => {
      if (st === 'active') {
        active = true;
        cancelScheduled();
        loop();
        setAmbient(useGame.getState().settings.sound);
      } else if (st === 'background') {
        active = false;
        scheduleUpcoming();
        setAmbient(false);
      }
    });
    setAmbient(useGame.getState().settings.sound);
    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, [hydrated]);

  return null;
}
