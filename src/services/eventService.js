import apiClient from './api';

export const eventService = {
  getAllEvents: async () => {
    try {
      const response = await apiClient.get('/events');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getEventById: async (eventId) => {
    try {
      const response = await apiClient.get(`/events/${eventId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  createEvent: async (eventData) => {
    try {
      const response = await apiClient.post('/events', eventData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateEvent: async (eventId, eventData) => {
    try {
      const response = await apiClient.put(`/events/${eventId}`, eventData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteEvent: async (eventId) => {
    try {
      await apiClient.delete(`/events/${eventId}`);
      return true;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  publishEvent: async (eventId) => {
    try {
      const response = await apiClient.post(`/events/${eventId}/publish`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  registerToEvent: async (eventId) => {
    try {
      const response = await apiClient.post(`/events/${eventId}/register`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  unregisterFromEvent: async (eventId) => {
    try {
      const response = await apiClient.post(`/events/${eventId}/unregister`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getMyRegistrations: async () => {
    try {
      const response = await apiClient.get('/events/my-registrations');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};
