import { notificationService } from '../notification-service';
import * as Notifications from 'expo-notifications';

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.NativeModules.ExpoPushTokenManager = {};
  return RN;
});

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
}), { virtual: true });

describe('NotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('checks if notifications are available', async () => {
    const available = await notificationService.isAvailable();
    expect(available).toBe(true);
  });

  it('schedules a reminder correctly', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue('notif-id');

    const mockBlock = {
      id: 'b1',
      title: 'Test Task',
      startTime: '20:00', // 8 PM
      endTime: '21:00',
      type: 'TASK'
    } as any;

    const id = await notificationService.scheduleReminder(mockBlock);

    expect(id).toBe('notif-id');
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({ title: 'Upcoming: Test Task' }),
      })
    );
  });

  it('cancels a reminder correctly', async () => {
    await notificationService.cancelReminder('rem-1');
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('rem-1');
  });
});
