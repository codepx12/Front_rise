import apiClient from './api';

export const notificationService = {
  // Get all notifications for the current user (admin only)
  getNotifications: async () => {
    try {
      const response = await apiClient.get('/posts/notifications');
      return response.data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
      return [];
    }
  },

  // Mark a notification as read
  markAsRead: async (notificationId) => {
    try {
      await apiClient.put(`/posts/notifications/${notificationId}/read`);
    } catch (error) {
      console.error('Erreur lors du marquage de la notification comme lue:', error);
      throw error;
    }
  },
};
