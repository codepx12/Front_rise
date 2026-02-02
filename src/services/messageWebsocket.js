import * as signalR from '@microsoft/signalr';

class MessageWebsocket {
  constructor() {
    this.connection = null;
    this.isConnected = false;
    this.listeners = {};
  }

  async connect(token) {
    try {
      // Si déjà connecté, retourner
      if (this.isConnected && this.connection?.state === signalR.HubConnectionState.Connected) {
        return;
      }

      // Déterminer l'URL du serveur - utiliser la même que l'API mais sans le /api
      const apiUrl = import.meta.env.VITE_API_URL || 'http://rise-back.onrender.com/api';
      // Remove /api suffix if present and use the base URL for SignalR hubs
      const baseUrl = apiUrl.replace(/\/api$/, '');
      const messageHubUrl = `${baseUrl}/messageHub`;

      console.log('🔗 Connexion au MessageHub:', messageHubUrl);

      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(messageHubUrl, {
          accessTokenFactory: () => token,
          skipNegotiation: false,
          // Essayer WebSocket d'abord, puis fallback à LongPolling
          transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
        })
        .withAutomaticReconnect([0, 0, 0, 1000, 3000, 5000])
        .withHubProtocol(new signalR.JsonHubProtocol())
        .configureLogging(signalR.LogLevel.Information)
        .build();

      // Set up event listeners for message hub
      // Important: SignalR est case-sensitive sur le nom des méthodes
      
      this.connection.on('MessageReceived', (message) => {
        console.log('Message reçu:', message);
        this.emit('messageReceived', message);
      });

      this.connection.on('ReactionAdded', (data) => {
        console.log('Réaction ajoutée:', data);
        this.emit('reactionAdded', data);
      });

      this.connection.on('MessageDeleted', (messageId) => {
        console.log('Message supprimé:', messageId);
        this.emit('messageDeleted', messageId);
      });

      this.connection.on('UserTyping', (data) => {
        console.log('Utilisateur en train d\'écrire:', data);
        this.emit('userTyping', data);
      });

      this.connection.on('UserStoppedTyping', (data) => {
        console.log('Utilisateur a arrêté d\'écrire:', data);
        this.emit('userStoppedTyping', data);
      });

      // IMPORTANT: Le serveur envoie "UserOnline" avec ce nom exact
      this.connection.on('UserOnline', (userId) => {
        console.log('Utilisateur en ligne:', userId);
        this.emit('userOnline', userId);
      });

      // IMPORTANT: Le serveur envoie "UserOffline" avec ce nom exact
      this.connection.on('UserOffline', (userId) => {
        console.log('Utilisateur hors ligne:', userId);
        this.emit('userOffline', userId);
      });

      this.connection.on('OnlineUsers', (users) => {
        console.log('Utilisateurs en ligne:', users);
        this.emit('onlineUsers', users);
      });

      this.connection.on('UserStatus', (data) => {
        console.log('Statut utilisateur:', data);
        this.emit('userStatus', data);
      });

      this.connection.on('Error', (error) => {
        console.error('Erreur WebSocket:', error);
        this.emit('error', error);
      });

      // Connexion événements
      this.connection.onreconnecting((error) => {
        console.log(`Tentative de reconnexion au serveur de messages: ${error}`);
        this.isConnected = false;
        this.emit('reconnecting');
      });

      this.connection.onreconnected((connectionId) => {
        console.log(`Reconnecté au serveur de messages avec ID ${connectionId}`);
        this.isConnected = true;
        this.emit('reconnected');
      });

      this.connection.onclose(async (error) => {
        console.log('Connexion au serveur de messages fermée:', error);
        this.isConnected = false;
        this.emit('disconnected');
      });

      await this.connection.start();
      this.isConnected = true;
      this.emit('connected');
      console.log('✅ Connecté au serveur de messages');
    } catch (error) {
      console.error('Erreur de connexion au serveur de messages:', error);
      this.isConnected = false;
      throw error;
    }
  }

  async disconnect() {
    if (this.connection) {
      try {
        await this.connection.stop();
        this.isConnected = false;
        this.emit('disconnected');
      } catch (error) {
        console.error('Erreur lors de la déconnexion du serveur de messages:', error);
      }
    }
  }

  // Join a conversation room
  async joinConversation(conversationId) {
    if (this.isConnected && this.connection) {
      try {
        await this.connection.invoke('JoinConversation', conversationId.toString());
        console.log(`✅ Rejoint la conversation ${conversationId}`);
      } catch (error) {
        console.error('Erreur lors de la connexion à la conversation:', error);
      }
    }
  }

  // Leave a conversation room
  async leaveConversation(conversationId) {
    if (this.isConnected && this.connection) {
      try {
        await this.connection.invoke('LeaveConversation', conversationId.toString());
        console.log(`✅ Quitté la conversation ${conversationId}`);
      } catch (error) {
        console.error('Erreur lors de la déconnexion de la conversation:', error);
      }
    }
  }

  // Send a message
  async sendMessage(conversationId, content, replyToId = null) {
    if (this.isConnected && this.connection) {
      try {
        await this.connection.invoke('SendMessage', conversationId.toString(), content, replyToId);
        console.log('✅ Message envoyé via WebSocket');
      } catch (error) {
        console.error('Erreur lors de l\'envoi du message:', error);
        throw error;
      }
    } else {
      console.warn('WebSocket non connecté, impossible d\'envoyer le message');
      throw new Error('WebSocket non connecté');
    }
  }

  // Add reaction to message
  async addReaction(messageId, emoji) {
    if (this.isConnected && this.connection) {
      try {
        await this.connection.invoke('AddReaction', messageId.toString(), emoji);
        console.log('✅ Réaction ajoutée');
      } catch (error) {
        console.error('Erreur lors de l\'ajout de la réaction:', error);
        throw error;
      }
    }
  }

  // Delete message
  async deleteMessage(messageId) {
    if (this.isConnected && this.connection) {
      try {
        await this.connection.invoke('DeleteMessage', messageId.toString());
        console.log('✅ Message supprimé');
      } catch (error) {
        console.error('Erreur lors de la suppression du message:', error);
        throw error;
      }
    }
  }

  // Send typing indicator
  async userTyping(conversationId, userName) {
    if (this.isConnected && this.connection) {
      try {
        await this.connection.invoke('UserTyping', conversationId.toString(), userName);
      } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'indicateur de frappe:', error);
      }
    }
  }

  async userStoppedTyping(conversationId, userName) {
    if (this.isConnected && this.connection) {
      try {
        await this.connection.invoke('UserStoppedTyping', conversationId.toString(), userName);
      } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'arrêt de frappe:', error);
      }
    }
  }

  // Get online users
  async getOnlineUsers() {
    if (this.isConnected && this.connection) {
      try {
        await this.connection.invoke('GetOnlineUsers');
      } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs en ligne:', error);
      }
    }
  }

  // Check if a user is online
  async checkUserOnline(userId) {
    if (this.isConnected && this.connection) {
      try {
        await this.connection.invoke('CheckUserOnline', userId.toString());
      } catch (error) {
        console.error('Erreur lors de la vérification du statut utilisateur:', error);
      }
    }
  }

  // Event emitter methods
  on(eventName, callback) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(callback);
  }

  off(eventName, callback) {
    if (this.listeners[eventName]) {
      this.listeners[eventName] = this.listeners[eventName].filter(cb => cb !== callback);
    }
  }

  emit(eventName, data) {
    if (this.listeners[eventName]) {
      this.listeners[eventName].forEach(callback => callback(data));
    }
  }

  once(eventName, callback) {
    const wrapper = (data) => {
      callback(data);
      this.off(eventName, wrapper);
    };
    this.on(eventName, wrapper);
  }
}

// Export singleton instance
export default new MessageWebsocket();
