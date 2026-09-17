import { NativeModules, Platform } from 'react-native';
import { ScheduleBlock } from '@/types/domain';
import { subMinutes, set, format } from 'date-fns';

let isHandlerSet = false;

// Defensive module retrieval
const getNotificationsModule = () => {
  if (Platform.OS === 'web') return null;

  try {
    return require('expo-notifications');
  } catch (e) {
    return null;
  }
};

const ensureHandler = (Notifications: any) => {
  if (isHandlerSet || !Notifications) return;
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    isHandlerSet = true;
  } catch (e) {
    console.warn('[NotificationService] Failed to set handler:', e);
  }
};

export const notificationService = {
  async isAvailable() {
    const Notifications = getNotificationsModule();
    return !!Notifications && !!Notifications.getPermissionsAsync;
  },

  async requestPermissions() {
    const Notifications = getNotificationsModule();
    if (!Notifications) return false;

    ensureHandler(Notifications);

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      return finalStatus === 'granted';
    } catch (e) {
      console.warn('[NotificationService] Failed to get permissions:', e);
      return false;
    }
  },

  async scheduleReminder(block: ScheduleBlock): Promise<string | null> {
    const Notifications = getNotificationsModule();
    if (!Notifications) return null;

    ensureHandler(Notifications);

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return null;

    try {
      const [hours, minutes] = block.startTime.split(':').map(Number);
      let triggerDate = set(new Date(), { hours, minutes, seconds: 0, milliseconds: 0 });
      triggerDate = subMinutes(triggerDate, 5);

      if (triggerDate.getTime() <= Date.now()) {
        console.warn('[NotificationService] Reminder time already passed for:', block.title);
        return null;
      }

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: `Upcoming: ${block.title}`,
          body: `Starting in 5 minutes at ${block.startTime}`,
          data: { blockId: block.id },
        },
        trigger: triggerDate,
      });

      console.log(`[NotificationService] Scheduled notification ${id} for ${block.title} at ${format(triggerDate, 'HH:mm')}`);
      return id;
    } catch (e) {
      console.error('[NotificationService] Failed to schedule:', e);
      return null;
    }
  },

  async cancelReminder(reminderId: string) {
    const Notifications = getNotificationsModule();
    if (!Notifications) return;

    try {
      await Notifications.cancelScheduledNotificationAsync(reminderId);
      console.log(`[NotificationService] Cancelled notification: ${reminderId}`);
    } catch (e) {
      console.error('[NotificationService] Failed to cancel:', e);
    }
  }
};
