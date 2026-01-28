import { create } from 'zustand';
import { pollService } from '../services/pollService';

export const usePollStore = create((set) => ({
  polls: [],
  selectedPoll: null,
  loading: false,
  error: null,

  fetchAllPolls: async () => {
    set({ loading: true, error: null });
    try {
      const polls = await pollService.getAllPolls();
      set({ polls, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  fetchPollById: async (pollId) => {
    set({ loading: true, error: null });
    try {
      const poll = await pollService.getPollById(pollId);
      set({ selectedPoll: poll, loading: false });
      return poll;
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  createPoll: async (pollData) => {
    set({ loading: true, error: null });
    try {
      const newPoll = await pollService.createPoll(pollData);
      set((state) => ({
        polls: [...state.polls, newPoll],
        loading: false,
      }));
      return newPoll;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deletePoll: async (pollId) => {
    set({ loading: true, error: null });
    try {
      await pollService.deletePoll(pollId);
      set((state) => ({
        polls: state.polls.filter((p) => p.id !== pollId),
        loading: false,
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  submitResponse: async (pollId, responses) => {
    set({ loading: true, error: null });
    try {
      const result = await pollService.submitPollResponse(pollId, responses);
      await set((state) => {
        if (state.selectedPoll?.id === pollId) {
          state.selectedPoll.hasUserResponded = true;
        }
        return { loading: false };
      });
      return result;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
