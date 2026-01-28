import apiClient from './api';

export const pollService = {
  getAllPolls: async () => {
    try {
      const response = await apiClient.get('/polls');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getPollById: async (pollId) => {
    try {
      const response = await apiClient.get(`/polls/${pollId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  createPoll: async (pollData) => {
    try {
      const response = await apiClient.post('/polls', pollData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deletePoll: async (pollId) => {
    try {
      await apiClient.delete(`/polls/${pollId}`);
      return true;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  submitPollResponse: async (pollId, responses) => {
    try {
      const response = await apiClient.post(`/polls/${pollId}/respond`, responses);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};
