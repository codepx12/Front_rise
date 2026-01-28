import apiClient from './api';

export const messageService = {
  // Get all conversations for the user
  getConversations: async () => {
    try {
      const response = await apiClient.get('/messages/conversations');
      return response.data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des conversations:', error);
      return [];
    }
  },

  // Get messages from a specific conversation
  getMessages: async (conversationId) => {
    try {
      const response = await apiClient.get(`/messages/conversation/${conversationId}`);
      return response.data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
      return [];
    }
  },

  // Send a message
  sendMessage: async (conversationId, content, replyToId = null) => {
    try {
      const response = await apiClient.post('/messages/send', {
        conversationId,
        content,
        replyToId,
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      throw error;
    }
  },

  // Create a new conversation
  startConversation: async (recipientId) => {
    try {
      const response = await apiClient.post('/messages/conversations', {
        recipientId,
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de la conversation:', error);
      throw error;
    }
  },

  // Search students
  searchStudents: async (query) => {
    try {
      const response = await apiClient.get(`/users/search?q=${query}`);
      return response.data || [];
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      return [];
    }
  },

  // Add reaction to message
  addReaction: async (messageId, emoji) => {
    try {
      const response = await apiClient.post(`/messages/${messageId}/reaction`, {
        emoji,
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la réaction:', error);
      throw error;
    }
  },

  // Delete message
  deleteMessage: async (messageId) => {
    try {
      await apiClient.delete(`/messages/${messageId}`);
    } catch (error) {
      console.error('Erreur lors de la suppression du message:', error);
      throw error;
    }
  },

  // Mark conversation as read
  markAsRead: async (conversationId) => {
    try {
      await apiClient.put(`/messages/conversation/${conversationId}/read`);
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
    }
  },

  // Get call token (for video/audio calls)
  getCallToken: async (conversationId) => {
    try {
      const response = await apiClient.post(`/messages/conversation/${conversationId}/call-token`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la génération du token d\'appel:', error);
      throw error;
    }
  },
};
