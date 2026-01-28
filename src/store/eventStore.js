import { create } from 'zustand';
import { eventService } from '../services/eventService';

export const useEventStore = create((set) => ({
  events: [],
  myRegistrations: [],
  selectedEvent: null,
  loading: false,
  error: null,

  fetchAllEvents: async () => {
    set({ loading: true, error: null });
    try {
      const events = await eventService.getAllEvents();
      set({ events, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  fetchEventById: async (eventId) => {
    set({ loading: true, error: null });
    try {
      const event = await eventService.getEventById(eventId);
      set({ selectedEvent: event, loading: false });
      return event;
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  createEvent: async (eventData) => {
    set({ loading: true, error: null });
    try {
      const newEvent = await eventService.createEvent(eventData);
      set((state) => ({
        events: [...state.events, newEvent],
        loading: false,
      }));
      return newEvent;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateEvent: async (eventId, eventData) => {
    set({ loading: true, error: null });
    try {
      const updatedEvent = await eventService.updateEvent(eventId, eventData);
      set((state) => ({
        events: state.events.map((e) => (e.id === eventId ? updatedEvent : e)),
        selectedEvent: updatedEvent,
        loading: false,
      }));
      return updatedEvent;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteEvent: async (eventId) => {
    set({ loading: true, error: null });
    try {
      await eventService.deleteEvent(eventId);
      set((state) => ({
        events: state.events.filter((e) => e.id !== eventId),
        loading: false,
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  publishEvent: async (eventId) => {
    set({ loading: true, error: null });
    try {
      const result = await eventService.publishEvent(eventId);
      await set((state) => {
        const event = state.events.find((e) => e.id === eventId);
        if (event) event.isPublished = true;
        return { loading: false };
      });
      return result;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  registerToEvent: async (eventId) => {
    set({ loading: true, error: null });
    try {
      const result = await eventService.registerToEvent(eventId);
      await set((state) => {
        const event = state.events.find((e) => e.id === eventId);
        if (event) event.isUserRegistered = true;
        return { loading: false };
      });
      return result;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  unregisterFromEvent: async (eventId) => {
    set({ loading: true, error: null });
    try {
      const result = await eventService.unregisterFromEvent(eventId);
      await set((state) => {
        const event = state.events.find((e) => e.id === eventId);
        if (event) event.isUserRegistered = false;
        return { loading: false };
      });
      return result;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchMyRegistrations: async () => {
    set({ loading: true, error: null });
    try {
      const registrations = await eventService.getMyRegistrations();
      set({ myRegistrations: registrations, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
