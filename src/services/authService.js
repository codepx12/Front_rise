import apiClient from './api';

export const authService = {
  register: async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      const { token, ...user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Inscription échouée. Vérifiez vos données.';
      throw new Error(message);
    }
  },

  login: async (credentials) => {
    try {
      console.log('Tentative de connexion avec:', credentials.email);
      const response = await apiClient.post('/auth/login', credentials);
      console.log('Réponse du serveur:', response.data);
      
      const { token, ...user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return response.data;
    } catch (error) {
      console.error('Erreur de login:', error.response?.data || error.message);
      const message = error.response?.data?.message || 'Email ou mot de passe incorrect';
      throw new Error(message);
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete apiClient.defaults.headers.common['Authorization'];
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getToken: () => localStorage.getItem('token'),

  isAuthenticated: () => !!localStorage.getItem('token'),
};
