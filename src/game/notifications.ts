// Local notifications: story messages keep "arriving" while the app is backgrounded.
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { peekUpcoming } from './engine';
import { useGame } from './store';

const supported = Platform.OS !== 'web';

export async function initNotifications() {
  if (!supported) return;
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: false,
        shouldShowList: false,
      }),
    });
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('story', {
        name: 'Story messages',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 120, 80, 120],
        lightColor: '#f2a541',
      });
    }
    const perm = await Notifications.getPermissionsAsync();
    if (!perm.granted && perm.canAskAgain) await Notifications.requestPermissionsAsync();
  } catch (e) {
    console.warn('notifications init failed', e);
  }
}

/** Called when the app goes to background: schedule OS notifications for messages due soon. */
export async function scheduleUpcoming() {
  if (!supported) return;
  const s = useGame.getState();
  if (!s.settings.notifications || !s.cursor) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    const now = Date.now();
    const list = peekUpcoming(s as any, now, s.settings, 6);
    // Group into at most 3 notifications so we don't spam.
    const picks = list.length <= 3 ? list : [list[0], list[Math.floor(list.length / 2)], list[list.length - 1]];
    for (const m of picks) {
      const seconds = Math.max(2, Math.round((m.at - now) / 1000));
      await Notifications.scheduleNotificationAsync({
        content: { title: m.title, body: m.body, sound: true, data: { thread: m.thread } },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds,
          channelId: 'story',
        },
      });
    }
  } catch (e) {
    console.warn('schedule failed', e);
  }
}

export async function cancelScheduled() {
  if (!supported) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.dismissAllNotificationsAsync();
  } catch {}
}
