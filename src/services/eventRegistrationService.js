import apiClient from './api';

export const eventRegistrationService = {
  // Télécharger les inscriptions en Excel
  async downloadEventRegistrationsExcel(eventId, eventName) {
    try {
      const response = await apiClient.get(
        `/events/${eventId}/export-registrations?format=excel`,
        { responseType: 'blob' }
      );

      // Créer un blob et déclencher le téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const fileName = `inscriptions-${eventName || 'event'}-${new Date().toISOString().split('T')[0]}.xlsx`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      console.error('Erreur lors du téléchargement Excel:', error);
      throw error;
    }
  },

  // Télécharger les inscriptions en CSV
  async downloadEventRegistrationsCSV(eventId, eventName) {
    try {
      const response = await apiClient.get(
        `/events/${eventId}/export-registrations?format=csv`,
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const fileName = `inscriptions-${eventName || 'event'}-${new Date().toISOString().split('T')[0]}.csv`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      console.error('Erreur lors du téléchargement CSV:', error);
      throw error;
    }
  }
};
