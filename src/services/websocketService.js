import * as signalR from '@microsoft/signalr';

// Construire l'URL WebSocket depuis la même URL API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://rise-back.onrender.com:5007/api';
const SIGNALR_URL = API_BASE_URL.replace('/api', '') + '/messageHub'; // Corrected to use /messageHub

class WebSocketService {
  constructor() {
    this.connection = null;
    this.listeners = {};
  }

  async connect() {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      return;
    }

    try {
      console.log('🔗 Connexion au WebSocket:', SIGNALR_URL);
      
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(SIGNALR_URL, {
          accessTokenFactory: () => localStorage.getItem('token') || '',
          skipNegotiation: false,
          // Essayer WebSocket d'abord, puis fallback à LongPolling
          transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
        })
        .withAutomaticReconnect([0, 0, 0, 1000, 3000, 5000])
        .withHubProtocol(new signalR.JsonHubProtocol())
        .configureLogging(signalR.LogLevel.Information)
        .build();

      // Configurer les listeners pour les mises à jour en temps réel des posts
      this.connection.on('PostLikeUpdated', (data) => {
        this.emit('PostLikeUpdated', data);
      });

      this.connection.on('PostLikeToggled', (data) => {
        this.emit('PostLikeToggled', data);
      });

      this.connection.on('CommentAdded', (data) => {
        this.emit('CommentAdded', data);
      });

      this.connection.on('CommentDeleted', (data) => {
        this.emit('CommentDeleted', data);
      });

      this.connection.on('CommentReactionUpdated', (data) => {
        this.emit('CommentReactionUpdated', data);
      });

      // Les événements d'utilisateurs en ligne ne devraient PAS être sur ce hub
      // Ils devraient être sur le messageHub uniquement
      // Sinon on aura des avertissements "No client method with the name 'useronline' found"

      // Gestion de la reconnexion
      this.connection.onreconnected((connectionId) => {
        console.log('Reconnecté au serveur WebSocket:', connectionId);
        this.emit('reconnected', connectionId);
      });

      this.connection.onreconnecting((error) => {
        console.log('Tentative de reconnexion au serveur WebSocket:', error);
        this.emit('reconnecting', error);
      });

      this.connection.onclose((error) => {
        console.log('Déconnecté du serveur WebSocket:', error);
        this.emit('disconnected', error);
      });

      await this.connection.start();
      console.log('Connecté au serveur WebSocket');
      this.emit('connected', true);
    } catch (error) {
      console.error('Erreur de connexion WebSocket:', error);
      setTimeout(() => this.connect(), 5000); // Réessayer après 5 secondes
    }
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
    }
  }

  on(eventName, callback) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(callback);

    // Retourner une fonction pour se désabonner
    return () => {
      this.listeners[eventName] = this.listeners[eventName].filter(cb => cb !== callback);
    };
  }

  emit(eventName, data) {
    if (this.listeners[eventName]) {
      this.listeners[eventName].forEach(callback => callback(data));
    }
  }

  // Méthodes pour appeler les fonctions du hub
  async notifyPostLikeUpdated(postId) {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      await this.connection.invoke('NotifyPostLikeUpdated', postId);
    }
  }

  async notifyCommentAdded(postId) {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      await this.connection.invoke('NotifyCommentAdded', postId);
    }
  }

  async notifyCommentReactionUpdated(postId, commentId) {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      await this.connection.invoke('NotifyCommentReactionUpdated', postId, commentId);
    }
  }

  async postLikeToggled(postId, userId, isLiked) {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      await this.connection.invoke('PostLikeToggled', postId, userId, isLiked);
    }
  }

  isConnected() {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }
}

export const websocketService = new WebSocketService();
