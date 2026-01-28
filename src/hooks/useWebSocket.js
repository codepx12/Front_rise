import { useEffect, useState } from 'react';
import { websocketService } from '../services/websocketService';

/**
 * Hook pour initialiser et gérer la connexion WebSocket
 * À utiliser dans le composant App pour établir la connexion au démarrage
 */
export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeWebSocket = async () => {
      try {
        await websocketService.connect();
        setIsConnected(true);
        setError(null);
      } catch (err) {
        console.error('Erreur de connexion WebSocket:', err);
        setError('Erreur de connexion au serveur');
        setIsConnected(false);
      }
    };

    // Écouter les événements de connexion
    const unsubscribeConnected = websocketService.on('connected', () => {
      setIsConnected(true);
      setError(null);
    });

    const unsubscribeDisconnected = websocketService.on('disconnected', (err) => {
      setIsConnected(false);
      setError('Déconnecté du serveur');
    });

    const unsubscribeReconnecting = websocketService.on('reconnecting', (err) => {
      console.log('Tentative de reconnexion...');
    });

    const unsubscribeReconnected = websocketService.on('reconnected', () => {
      setIsConnected(true);
      setError(null);
      console.log('Reconnecté au serveur');
    });

    // Initialiser la connexion
    initializeWebSocket();

    // Cleanup
    return () => {
      unsubscribeConnected();
      unsubscribeDisconnected();
      unsubscribeReconnecting();
      unsubscribeReconnected();
    };
  }, []);

  return { isConnected, error };
};
