import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { useGame } from './store';

const SOURCES = {
  receive: require('../../assets/sounds/receive.wav'),
  send: require('../../assets/sounds/send.wav'),
  notify: require('../../assets/sounds/notify.wav'),
  clue: require('../../assets/sounds/clue.wav'),
  wrong: require('../../assets/sounds/wrong.wav'),
  ambient: require('../../assets/sounds/ambient.mp3'),
};
export type Sfx = Exclude<keyof typeof SOURCES, 'ambient'>;

const players: Partial<Record<keyof typeof SOURCES, AudioPlayer>> = {};
let ready = false;

export async function initAudio() {
  if (ready) return;
  ready = true;
  try {
    await setAudioModeAsync({ playsInSilentMode: false, interruptionMode: 'mixWithOthers' });
  } catch {}
}

function get(name: keyof typeof SOURCES) {
  if (!players[name]) {
    try {
      players[name] = createAudioPlayer(SOURCES[name]);
    } catch {
      return undefined;
    }
  }
  return players[name];
}

export function play(name: Sfx) {
  const { settings } = useGame.getState();
  if (settings.sound) {
    const p = get(name);
    if (p) {
      try {
        p.seekTo(0);
        p.play();
      } catch {}
    }
  }
  if (settings.haptics && Platform.OS !== 'web') {
    const style =
      name === 'wrong'
        ? Haptics.NotificationFeedbackType.Error
        : name === 'clue'
          ? Haptics.NotificationFeedbackType.Success
          : null;
    if (style) Haptics.notificationAsync(style).catch(() => {});
    else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }
}

export function setAmbient(on: boolean) {
  const p = get('ambient');
  if (!p) return;
  try {
    p.loop = true;
    p.volume = 0.35;
    if (on) p.play();
    else p.pause();
  } catch {}
}
