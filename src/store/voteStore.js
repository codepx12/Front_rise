import { create } from 'zustand';
import { voteService } from '../services/voteService';

export const useVoteStore = create((set) => ({
  votes: [],
  selectedVote: null,
  loading: false,
  error: null,

  fetchAllVotes: async () => {
    set({ loading: true, error: null });
    try {
      const votes = await voteService.getAllVotes();
      set({ votes, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  fetchVoteById: async (voteId) => {
    set({ loading: true, error: null });
    try {
      const vote = await voteService.getVoteById(voteId);
      set({ selectedVote: vote, loading: false });
      return vote;
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  createVote: async (voteData) => {
    set({ loading: true, error: null });
    try {
      const newVote = await voteService.createVote(voteData);
      set((state) => ({
        votes: [...state.votes, newVote],
        loading: false,
      }));
      return newVote;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteVote: async (voteId) => {
    set({ loading: true, error: null });
    try {
      await voteService.deleteVote(voteId);
      set((state) => ({
        votes: state.votes.filter((v) => v.id !== voteId),
        loading: false,
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  startVote: async (voteId) => {
    set({ loading: true, error: null });
    try {
      const result = await voteService.startVote(voteId);
      await set((state) => {
        const vote = state.votes.find((v) => v.id === voteId);
        if (vote) vote.isActive = true;
        return { loading: false };
      });
      return result;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  endVote: async (voteId) => {
    set({ loading: true, error: null });
    try {
      const result = await voteService.endVote(voteId);
      await set((state) => {
        const vote = state.votes.find((v) => v.id === voteId);
        if (vote) vote.isActive = false;
        return { loading: false };
      });
      return result;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  publishResults: async (voteId) => {
    set({ loading: true, error: null });
    try {
      const result = await voteService.publishResults(voteId);
      await set((state) => {
        const vote = state.votes.find((v) => v.id === voteId);
        if (vote) vote.resultsPublished = true;
        return { loading: false };
      });
      return result;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  submitCandidacy: async (voteId, candidacyData) => {
    set({ loading: true, error: null });
    try {
      const result = await voteService.submitCandidacy(voteId, candidacyData);
      set({ loading: false });
      return result;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  castVote: async (voteData) => {
    set({ loading: true, error: null });
    try {
      const result = await voteService.castVote(voteData);
      set({ loading: false });
      return result;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
