import { useEffect, useRef, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';

export const useSignalR = (onCommentAdded, onPostReactionUpdated, onCommentReactionUpdated) => {
  const connectionRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const connect = useCallback(async () => {
    if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
      return;
    }

    try {
      const token = localStorage.getItem('token') || '';
      const connection = new signalR.HubConnectionBuilder()
        .withUrl(import.meta.env.VITE_SIGNALR_URL || 'http://localhost:5007/postHub', {
          accessTokenFactory: () => token,
          withCredentials: true,
          skipNegotiation: false,
          transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
        })
        .withAutomaticReconnect([0, 0, 0, 1000, 3000, 5000])
        .withHubProtocol(new signalR.JsonHubProtocol())
        .configureLogging(signalR.LogLevel.Information)
        .build();

      // Définir les handlers pour les événements
      connection.on('CommentAdded', (data) => {
        console.log('CommentAdded reçu:', data);
        // ✅ Passer l'objet data complet qui contient: postId, comment, commentCount
        if (onCommentAdded) onCommentAdded(data);
      });

      connection.on('PostLikeUpdated', (data) => {
        console.log('Like mis à jour:', data);
        if (onPostReactionUpdated) onPostReactionUpdated(data.postId, data.reactionCount);
      });

      connection.on('PostReactionUpdated', (postId, reactionCount) => {
        console.log('Réaction mise à jour:', postId, reactionCount);
        if (onPostReactionUpdated) onPostReactionUpdated(postId, reactionCount);
      });

      connection.on('CommentReactionUpdated', (data) => {
        console.log('Réaction au commentaire mise à jour:', data);
        if (onCommentReactionUpdated) onCommentReactionUpdated(data.commentId || data);
      });

      connection.onreconnecting((error) => {
        console.log('Reconnexion à SignalR...', error);
      });

      connection.onreconnected((connectionId) => {
        console.log('Reconnecté à SignalR:', connectionId);
      });

      connection.onclose((error) => {
        console.log('Connexion SignalR fermée:', error);
        // Essayer de se reconnecter après 3 secondes
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      });

      await connection.start();
      console.log('Connecté à SignalR');
      connectionRef.current = connection;
    } catch (err) {
      console.error('Erreur de connexion SignalR:', err);
      // Essayer de se reconnecter après 3 secondes
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 3000);
    }
  }, [onCommentAdded, onPostReactionUpdated, onCommentReactionUpdated]);

  const disconnect = useCallback(async () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
      try {
        await connectionRef.current.stop();
        console.log('Déconnecté de SignalR');
      } catch (err) {
        console.error('Erreur lors de la déconnexion:', err);
      }
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return { connection: connectionRef.current };
};
