import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5007/api';
const BACKEND_URL = API_BASE_URL.replace('/api', ''); // Extraire l'URL de base du backend

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Fonction utilitaire pour construire les URLs des images
export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  
  // Si l'URL est déjà complète (commence par http)
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  
  // Si l'URL est relative (commence par /)
  if (imageUrl.startsWith('/')) {
    return `${BACKEND_URL}${imageUrl}`;
  }
  
  // Sinon, ajouter le préfixe
  return `${BACKEND_URL}/${imageUrl}`;
};

// Fonction pour obtenir l'image de profil avec fallback
export const getProfileImageUrl = (profileImageUrl) => {
  if (profileImageUrl) {
    return getImageUrl(profileImageUrl);
  }
  // Retourner l'image par défaut si pas d'image de profil
  return '/profile_none.jpg';
};

// Interceptor pour ajouter le token JWT
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor pour gérer les erreurs
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si erreur 401, déconnecter via Zustand
    if (error.response?.status === 401) {
      // Récupérer et appeler la fonction logout du store
      const { logout } = useAuthStore.getState();
      logout();
      // Ne pas rediriger ici, laisser le composant gérer la redirection via ProtectedRoute
    }
    return Promise.reject(error);
  }
);

export default apiClient;
