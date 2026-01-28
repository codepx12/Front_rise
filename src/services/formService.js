import apiClient from './api';

export const formService = {
  // Récupérer tous les formulaires
  getAllForms: async () => {
    try {
      const response = await apiClient.get('/forms');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Récupérer un formulaire par ID
  getFormById: async (formId) => {
    try {
      const response = await apiClient.get(`/forms/${formId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Créer un formulaire
  createForm: async (formData) => {
    try {
      const response = await apiClient.post('/forms', formData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Mettre à jour un formulaire
  updateForm: async (formId, formData) => {
    try {
      const response = await apiClient.put(`/forms/${formId}`, formData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Supprimer un formulaire
  deleteForm: async (formId) => {
    try {
      await apiClient.delete(`/forms/${formId}`);
      return true;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Publier un formulaire
  publishForm: async (formId) => {
    try {
      const response = await apiClient.post(`/forms/${formId}/publish`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Ajouter une question
  addQuestion: async (formId, questionData) => {
    try {
      const response = await apiClient.post(`/forms/${formId}/questions`, questionData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Mettre à jour une question
  updateQuestion: async (formId, questionId, questionData) => {
    try {
      const response = await apiClient.put(`/forms/${formId}/questions/${questionId}`, questionData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Supprimer une question
  deleteQuestion: async (formId, questionId) => {
    try {
      await apiClient.delete(`/forms/${formId}/questions/${questionId}`);
      return true;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Soumettre un formulaire
  submitForm: async (formId, answers) => {
    try {
      const response = await apiClient.post(`/forms/${formId}/submit`, answers);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Récupérer toutes les soumissions
  getSubmissions: async (formId) => {
    try {
      const response = await apiClient.get(`/forms/${formId}/submissions`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Exporter en CSV
  exportAsCSV: async (formId) => {
    try {
      const response = await apiClient.get(`/forms/${formId}/export/csv`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `form-${formId}-responses.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Exporter en Excel
  exportAsExcel: async (formId) => {
    try {
      const response = await apiClient.get(`/forms/${formId}/export/excel`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `form-${formId}-responses.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Récupérer les analytics
  getFormAnalytics: async (formId) => {
    try {
      const response = await apiClient.get(`/forms/${formId}/analytics`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Récupérer les statistiques d'une question
  getQuestionAnalytics: async (questionId) => {
    try {
      const response = await apiClient.get(`/questions/${questionId}/analytics`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Rechercher les utilisateurs pour l'autocomplétion des équipes
  searchUsers: async (query) => {
    try {
      const response = await apiClient.get('/forms/users/search', {
        params: { query }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};
