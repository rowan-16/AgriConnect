import { Notification } from '../types';
import { INITIAL_NOTIFICATIONS } from './mockData';
import { loadStorage, saveStorage } from './storageUtils';

const NOTIFICATIONS_KEY = 'notifications';

export const notificationService = {
  getAllNotifications(): Notification[] {
    return loadStorage<Notification[]>(NOTIFICATIONS_KEY, INITIAL_NOTIFICATIONS);
  },

  getUserNotifications(userId: string, role?: string): Notification[] {
    return this.getAllNotifications().filter(n =>
      n.recipientId === userId ||
      n.recipientId === 'all' ||
      (role === 'farmer' && n.recipientId === 'farmers') ||
      (role === 'buyer' && n.recipientId === 'buyers')
    );
  },

  markAsRead(notificationId: string): void {
    const list = this.getAllNotifications();
    const item = list.find(n => n.id === notificationId);
    if (item) {
      item.read = true;
      saveStorage(NOTIFICATIONS_KEY, list);
    }
  },

  markAllAsRead(userId: string): void {
    const list = this.getAllNotifications();
    list.forEach(n => {
      if (n.recipientId === userId || n.recipientId === 'all') {
        n.read = true;
      }
    });
    saveStorage(NOTIFICATIONS_KEY, list);
  },

  sendNotification(params: Omit<Notification, 'id' | 'read' | 'createdAt'>): Notification {
    const list = this.getAllNotifications();
    const newNotification: Notification = {
      ...params,
      id: `notif_${Date.now()}`,
      read: false,
      createdAt: new Date().toISOString(),
    };

    const updated = [newNotification, ...list];
    saveStorage(NOTIFICATIONS_KEY, updated);
    return newNotification;
  }
};
