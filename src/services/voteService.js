import apiClient from './api';

export const voteService = {
  getAllVotes: async () => {
    try {
      const response = await apiClient.get('/votes');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getVoteById: async (voteId) => {
    try {
      const response = await apiClient.get(`/votes/${voteId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  createVote: async (voteData) => {
    try {
      const response = await apiClient.post('/votes', voteData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteVote: async (voteId) => {
    try {
      await apiClient.delete(`/votes/${voteId}`);
      return true;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  startVote: async (voteId) => {
    try {
      const response = await apiClient.post(`/votes/${voteId}/start`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  endVote: async (voteId) => {
    try {
      const response = await apiClient.post(`/votes/${voteId}/end`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  publishResults: async (voteId) => {
    try {
      const response = await apiClient.post(`/votes/${voteId}/publish-results`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  submitCandidacy: async (voteId, candidacyData) => {
    try {
      const response = await apiClient.post(`/votes/${voteId}/submit-candidacy`, candidacyData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  approveCandidacy: async (optionId) => {
    try {
      const response = await apiClient.post(`/votes/candidacy/${optionId}/approve`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  castVote: async (voteData) => {
    try {
      const response = await apiClient.post('/votes/cast', voteData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};
