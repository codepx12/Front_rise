import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send,
  Search,
  Plus,
  X,
  Phone,
  Video,
  MoreVertical,
  Smile,
  Paperclip,
  ArrowLeft,
  Reply,
  ThumbsUp,
  Heart,
  Laugh,
  Frown,
  Zap,
  MessageCircle,
} from 'lucide-react';
import MainLayout from '../components/MainLayout';
import { messageService } from '../services/messageService';
import messageWebsocket from '../services/messageWebsocket';
import { useAuthStore } from '../store/authStore';
import { getImageUrl } from '../services/api';

const EMOJI_REACTIONS = [
  { icon: ThumbsUp, name: 'thumbsup', label: 'Pouce levé' },
  { icon: Heart, name: 'heart', label: 'Cœur' },
  { icon: Laugh, name: 'laugh', label: 'Rire' },
  { icon: Frown, name: 'frown', label: 'Triste' },
  { icon: Zap, name: 'fire', label: 'Feu' },
  { icon: MessageCircle, name: 'love', label: 'Amour' },
];

export default function MessagesPage() {
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const listenersSetupRef = useRef(false);
  const longPressTimerRef = useRef(null);
  const touchStartXRef = useRef(null);
  const touchStartYRef = useRef(null);

  // State
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [searchText, setSearchText] = useState('');
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(null); // messageId
  const [showReactionMenu, setShowReactionMenu] = useState(null); // messageId
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [onCall, setOnCall] = useState(false);
  const [callType, setCallType] = useState(null); // 'audio' or 'video'
  const [isTyping, setIsTyping] = useState(false);
  const [usersTyping, setUsersTyping] = useState([]);
  const [swipedMessageId, setSwipedMessageId] = useState(null);
  const [longPressMessageId, setLongPressMessageId] = useState(null);

  // Initialize WebSocket connection
  useEffect(() => {
    const initializeWebSocket = async () => {
      try {
        if (token && !messageWebsocket.isConnected) {
          await messageWebsocket.connect(token);
        }

        // Only set up listeners once, even in React Strict Mode
        if (token && !listenersSetupRef.current) {
          listenersSetupRef.current = true;
          
          // Clean up old listeners before adding new ones
          messageWebsocket.off('messageReceived', null); // Remove all previous listeners
          
          // Set up event listeners
          messageWebsocket.on('messageReceived', (message) => {
            console.log('📨 messageReceived handler called with:', message.id, 'isOwn:', message.isOwn);
            
            setMessages(prev => {
              // Check if message already exists to prevent duplicates
              const messageExists = prev.some(m => m.id === message.id);
              if (messageExists) {
                console.log('⚠️ Message duplicate detected, ignoring:', message.id);
                return prev;
              }
              console.log('✅ Adding new message:', message.id, 'isOwn:', message.isOwn);
              // Add new message and sort by timestamp to maintain chronological order
              const updatedMessages = [...prev, message];
              return updatedMessages.sort((a, b) => {
                const timeA = new Date(a.sentAt || a.createdAt).getTime();
                const timeB = new Date(b.sentAt || b.createdAt).getTime();
                return timeA - timeB;
              });
            });
            
            // Update conversation in a separate setState call
            setConversations(prev =>
              prev.map(conv =>
                conv.id === message.conversationId
                  ? { ...conv, lastMessage: message.content, time: message.sentAt }
                  : conv
              )
            );
          });

          messageWebsocket.on('reactionAdded', ({ messageId, emoji, userId }) => {
            setMessages(prev =>
              prev.map(msg => {
                if (msg.id === messageId) {
                  const reactions = msg.reactions || [];
                  const existingReactionIndex = reactions.findIndex(r => r.emoji === emoji && r.user === userId);
                  if (existingReactionIndex >= 0) {
                    reactions.splice(existingReactionIndex, 1);
                  } else {
                    reactions.push({ emoji, user: userId });
                  }
                  return { ...msg, reactions };
                }
                return msg;
              })
            );
          });

          messageWebsocket.on('messageDeleted', (messageId) => {
            setMessages(prev => prev.filter(msg => msg.id !== messageId));
          });

          messageWebsocket.on('userTyping', ({ userName }) => {
            setUsersTyping(prev => [...new Set([...prev, userName])]);
          });

          messageWebsocket.on('userStoppedTyping', ({ userName }) => {
            setUsersTyping(prev => prev.filter(u => u !== userName));
          });

          messageWebsocket.on('error', (error) => {
            console.error('WebSocket error:', error);
          });

          messageWebsocket.on('disconnected', () => {
            console.log('Disconnected from message server');
          });
        }
      } catch (error) {
        console.error('Error initializing WebSocket:', error);
      }
    };

    initializeWebSocket();

    return () => {
      // Cleanup on unmount
      if (selectedConversation) {
        messageWebsocket.leaveConversation(selectedConversation.id);
      }
    };
  }, [token, selectedConversation]);

  // Load conversations
  useEffect(() => {
    loadConversations();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Join/Leave conversation when selected
  useEffect(() => {
    if (selectedConversation && messageWebsocket.isConnected) {
      messageWebsocket.joinConversation(selectedConversation.id);
      loadMessages(selectedConversation.id);
      messageService.markAsRead(selectedConversation.id);
    }

    return () => {
      if (selectedConversation && messageWebsocket.isConnected) {
        messageWebsocket.leaveConversation(selectedConversation.id);
      }
    };
  }, [selectedConversation, messageWebsocket.isConnected]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const convs = await messageService.getConversations();
      console.log('Conversations chargées:', convs);
      setConversations(convs);
      if (convs.length > 0 && !selectedConversation) {
        setSelectedConversation(convs[0]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      setMessagesLoading(true);
      const msgs = await messageService.getMessages(conversationId);
      console.log('Messages chargés pour la conversation', conversationId, ':', msgs);
      
      // Le backend retourne déjà isOwn correctement calculé
      // On fait simplement confiance à cette valeur
      setMessages(msgs);
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  };

  // Format time helper
  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now - date) / (1000 * 60 * 60);

      if (diffInHours < 1) {
        return 'À l\'instant';
      } else if (diffInHours < 24) {
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      } else {
        return date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
      }
    } catch {
      return 'Date invalide';
    }
  };

  const handleSearchStudents = useCallback(async (query) => {
    setSearchText(query);
    if (query.trim().length > 0) {
      try {
        const results = await messageService.searchStudents(query);
        setSearchResults(results.filter(s => s.id !== user?.id)); // Exclude self
      } catch (error) {
        console.error('Erreur:', error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  }, [user?.id]);

  const handleStartConversation = async (student) => {
    try {
      setLoading(true);
      const conversation = await messageService.startConversation(student.id);
      setConversations([...conversations, conversation]);
      setSelectedConversation(conversation);
      setShowNewMessage(false);
      setSearchText('');
      setSearchResults([]);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;

    const messageContent = messageText;
    const replyId = replyingTo?.id;

    try {
      // Clear input immediately for better UX
      setMessageText('');
      setReplyingTo(null);
      setIsTyping(false);

      // Send via WebSocket for real-time updates
      if (messageWebsocket.isConnected) {
        await messageWebsocket.sendMessage(
          selectedConversation.id,
          messageContent,
          replyId
        );
      } else {
        // Fallback to REST API if WebSocket is not connected
        const newMessage = await messageService.sendMessage(
          selectedConversation.id,
          messageContent,
          replyId
        );
        // Add isOwn property to the new message
        setMessages(prev => [...prev, { ...newMessage, isOwn: true }]);
      }

      // Update conversation list with the correct message content
      setConversations(conversations.map(conv =>
        conv.id === selectedConversation.id
          ? { ...conv, lastMessage: messageContent, time: new Date().toISOString() }
          : conv
      ));
    } catch (error) {
      console.error('Erreur:', error);
      // Restore message text on error
      setMessageText(messageContent);
      if (replyId) {
        setReplyingTo(messages.find(m => m.id === replyId) || null);
      }
    }
  };

  const handleAddReaction = async (messageId, emoji) => {
    try {
      if (messageWebsocket.isConnected) {
        await messageWebsocket.addReaction(messageId, emoji);
      } else {
        await messageService.addReaction(messageId, emoji);
        await loadMessages(selectedConversation.id);
      }
      setShowReactionMenu(null);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleTyping = (value) => {
    setMessageText(value);

    if (!isTyping) {
      setIsTyping(true);
      if (messageWebsocket.isConnected && selectedConversation) {
        messageWebsocket.userTyping(selectedConversation.id, user?.firstName || 'Utilisateur');
      }
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (messageWebsocket.isConnected && selectedConversation) {
        messageWebsocket.userStoppedTyping(selectedConversation.id, user?.firstName || 'Utilisateur');
      }
    }, 1000);
  };

  const handleStartCall = async (type) => {
    try {
      setOnCall(true);
      setCallType(type);
      const token = await messageService.getCallToken(selectedConversation.id);
      // TODO: Initialize actual video/audio call with token
      console.log(`Appel ${type} initié avec token:`, token);
      // For now, show a placeholder
      alert(`Appel ${type} initié avec ${selectedConversation.sender}`);
      setOnCall(false);
    } catch (error) {
      console.error('Erreur:', error);
      setOnCall(false);
    }
  };

  // Touch handlers for mobile gestures
  const handleTouchStart = (e, msgId) => {
    // Don't reset swipe state - keep it for consecutive swipes
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    
    // Start long press timer (1.5 seconds for reactions)
    longPressTimerRef.current = setTimeout(() => {
      setLongPressMessageId(msgId);
      setShowReactionMenu(msgId);
    }, 1500);
  };

  const handleTouchMove = (e, msgId) => {
    if (!touchStartXRef.current) return;
    
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = touchStartXRef.current - currentX;
    const diffY = Math.abs(touchStartYRef.current - currentY);
    
    // Si mouvement vertical > 10px, c'est un scroll - annuler le long press
    if (diffY > 10) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
      return;
    }
    
    // Si mouvement horizontal > 10px, annuler le long press ET activer le swipe
    if (Math.abs(diffX) > 10) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    
    // Swipe right to left - détection du swipe vers la gauche (< -40px)
    // diffX est négatif quand on swipe vers la droite (à gauche sur l'écran)
    if (diffX < -40) {
      setSwipedMessageId(msgId);
    } 
    // Swipe back to left - revenir en arrière (> 10px)
    else if (diffX > 10) {
      setSwipedMessageId(null);
    }
  };

  const handleTouchEnd = () => {
    clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = null;
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  const filteredConversations = conversations.filter(conv =>
    conv.sender?.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 -mx-4 -my-8">
        <div className="flex h-screen bg-gray-50">
          {/* Sidebar - Liste des conversations */}
          <div className={`${selectedConversation ? 'hidden' : 'w-full'} lg:flex lg:w-96 bg-white border-r border-gray-200 flex-col`}>
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Messages</h2>
              
              {/* Search Bar */}
              <div className="relative mb-4">
                <Search size={18} className="absolute left-3 top-2.5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Rechercher une conversation..."
                  value={searchText}
                  onChange={(e) => handleSearchStudents(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-[#2E7379] text-sm"
                />
              </div>

              {/* New Message Button */}
              <button
                onClick={() => setShowNewMessage(!showNewMessage)}
                className="w-full flex items-center justify-center gap-2 bg-[#2E7379] text-white py-2 rounded-lg hover:bg-[#F0F1F5] transition font-semibold"
              >
                <Plus size={18} />
                Nouveau message
              </button>

              {/* Search Results */}
              {searchResults.length > 0 && showNewMessage && (
                <div className="mt-3 bg-gray-50 rounded-lg border border-gray-300 max-h-64 overflow-y-auto">
                  <p className="text-xs font-semibold text-gray-600 p-3 pb-0">Résultats de recherche</p>
                  {searchResults.map((student) => (
                    <button
                      key={student.id}
                      onClick={() => handleStartConversation(student)}
                      className="w-full p-3 hover:bg-gray-100 flex items-center gap-3 border-t border-gray-200 transition"
                    >
                      <div className="w-10 h-10 bg-[#2E7379] rounded-full shrink-0 flex items-center justify-center text-white font-bold text-sm">
                        {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-gray-900 text-sm">
                          {student.firstName} {student.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{student.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length > 0 ? (
                filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition flex items-center gap-3 ${
                      selectedConversation?.id === conv.id ? 'bg-[#2E7379]/10 border-l-4 border-l-[#2E7379]' : ''
                    }`}
                  >
                    <img
                      src={getImageUrl(conv.senderProfileImageUrl) || '/profile_none.jpg'}
                      alt={conv.sender}
                      className="w-12 h-12 rounded-full object-cover shrink-0 cursor-pointer hover:opacity-80 transition"
                      onError={(e) => {
                        e.target.src = '/profile_none.jpg';
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (conv.senderId) {
                          navigate(`/profile/${conv.senderId}`);
                        }
                      }}
                      title="Voir le profil"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline gap-2">
                        <p className={`font-semibold text-gray-900 truncate ${conv.unread > 0 ? 'font-bold' : ''}`}>
                          {conv.sender}
                        </p>
                        <p className="text-xs text-gray-500 shrink-0">{formatTime(conv.time)}</p>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{conv.lastMessage || 'Pas de message'}</p>
                    </div>
                    {conv.unread > 0 && (
                      <span className="bg-[#2E7379] text-white text-xs rounded-full w-6 h-6 flex items-center justify-center shrink-0">
                        {conv.unread}
                      </span>
                    )}
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  {searchText ? 'Aucune conversation trouvée' : 'Aucune conversation'}
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          {selectedConversation && (
            <div className="w-full lg:flex-1 flex flex-col bg-white">
              {/* Chat Header */}
              <div className="border-b border-gray-200 p-4 flex items-center justify-between bg-white sticky top-0 z-10">
                <div className="flex items-center gap-3 flex-1">
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="lg:hidden text-gray-600 hover:bg-gray-100 p-2 rounded-full transition"
                  >
                    <ArrowLeft size={24} />
                  </button>
                  <img
                    src={getImageUrl(selectedConversation.senderProfileImageUrl) || '/profile_none.jpg'}
                    alt={selectedConversation.sender}
                    className="w-12 h-12 rounded-full object-cover cursor-pointer hover:opacity-80 transition"
                    onClick={() => {
                      if (selectedConversation.senderId) {
                        navigate(`/profile/${selectedConversation.senderId}`);
                      }
                    }}
                    title="Voir le profil"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="hidden w-12 h-12 bg-gradient-to-br from-[#2E7379] to-[#F0F1F5] rounded-full flex items-center justify-center text-white font-bold">
                    {selectedConversation.sender?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{selectedConversation.sender}</h3>
                    <p className="text-sm text-gray-500">
                      {usersTyping.length > 0 ? `${usersTyping.join(', ')} en train d'écrire...` : 'Actif maintenant'}
                    </p>
                  </div>
                </div>

                {/* Call Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStartCall('audio')}
                    disabled={onCall}
                    className="p-2 hover:bg-gray-100 rounded-full transition text-gray-600 hover:text-[#2E7379] disabled:opacity-50"
                    title="Appel audio"
                  >
                    <Phone size={20} />
                  </button>
                  <button
                    onClick={() => handleStartCall('video')}
                    disabled={onCall}
                    className="p-2 hover:bg-gray-100 rounded-full transition text-gray-600 hover:text-[#2E7379] disabled:opacity-50"
                    title="Appel vidéo"
                  >
                    <Video size={20} />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-full transition text-gray-600">
                    <MoreVertical size={20} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div 
                className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50"
                onClick={() => {
                  // Fermer les réactions quand on clique n'importe où
                  if (showReactionMenu) {
                    setShowReactionMenu(null);
                  }
                }}
              >
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-500">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2E7379] mb-3"></div>
                      <p>Chargement des messages...</p>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <p>Aucun message pour le moment</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'} gap-2`}
                    >
                      {!msg.isOwn && (
                        <img
                          src={getImageUrl(msg.senderProfileImageUrl) || '/profile_none.jpg'}
                          alt={msg.senderName}
                          className="w-8 h-8 rounded-full object-cover shrink-0 mt-1 cursor-pointer hover:opacity-80 transition"
                          onError={(e) => {
                            e.target.src = '/profile_none.jpg';
                          }}
                          onClick={() => {
                            if (msg.senderId) {
                              navigate(`/profile/${msg.senderId}`);
                            }
                          }}
                          title="Voir le profil"
                        />
                      )}
                      <div className="relative w-full max-w-xs lg:max-w-md">
                        {/* Swipe Actions Background (appears on swipe) */}
                        <div
                          className={`absolute inset-0 rounded-lg flex items-center ${
                            msg.isOwn ? 'justify-end pr-2' : 'justify-start pl-2'
                          } bg-[#2E7379] transition-opacity duration-300 ${
                            swipedMessageId === msg.id ? 'opacity-100' : 'opacity-0'
                          }`}
                        >
                          {swipedMessageId === msg.id && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setReplyingTo(msg);
                                  setSwipedMessageId(null);
                                }}
                                className="p-2 bg-[#2E7379] rounded-full text-white hover:bg-[#F0F1F5] transition"
                                title="Répondre"
                              >
                                <Reply size={18} />
                              </button>
                              <button
                                onClick={() => {
                                  setShowReactionMenu(msg.id);
                                  setSwipedMessageId(null);
                                }}
                                className="p-2 bg-[#2E7379] rounded-full text-white hover:bg-[#F0F1F5] transition"
                                title="Réactions"
                              >
                                😊
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Message Content */}
                        <div
                          className={`group relative transition-transform duration-300 ${
                            swipedMessageId === msg.id ? (msg.isOwn ? '-translate-x-20' : 'translate-x-20') : ''
                          }`}
                          onTouchStart={(e) => handleTouchStart(e, msg.id)}
                          onTouchMove={(e) => handleTouchMove(e, msg.id)}
                          onTouchEnd={handleTouchEnd}
                        >
                          <div
                            className={`px-4 py-2 rounded-lg ${
                              msg.isOwn
                                ? 'bg-[#2E7379] text-white rounded-br-none'
                                : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
                            }`}
                          >
                            {/* Reply to */}
                            {msg.replyTo && (
                              <div className={`text-xs mb-2 py-1 px-2 rounded ${
                                msg.isOwn ? 'bg-[#F0F1F5] bg-opacity-50' : 'bg-gray-100'
                              }`}>
                                <p className={msg.isOwn ? 'text-[#2E7379]' : 'text-gray-600'}>
                                  Réponse à {msg.replyTo.sender}
                                </p>
                                <p className={`text-xs italic truncate ${msg.isOwn ? 'text-[#2E7379]' : 'text-gray-500'}`}>
                                  {msg.replyTo.content}
                                </p>
                              </div>
                            )}
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            <p className={`text-xs mt-1 ${msg.isOwn ? 'text-[#2E7379]' : 'text-gray-500'}`}>
                              {formatTime(msg.sentAt)}
                            </p>
                          </div>

                          {/* Reactions */}
                          {msg.reactions && msg.reactions.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {msg.reactions.map((reaction, idx) => (
                                <span
                                  key={idx}
                                  className="bg-white border border-gray-200 rounded-full px-1.5 py-0.5 text-xs"
                                  title={reaction.user}
                                >
                                  {reaction.emoji}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Desktop Message Actions (hover) */}
                          <div className="hidden lg:flex group-hover:flex gap-1 mt-1">
                            <button
                              onClick={() => setReplyingTo(msg)}
                              className={`p-2 rounded-full text-xs transition ${
                                msg.isOwn
                                  ? 'bg-[#2E7379] hover:bg-[#F0F1F5] text-white'
                                  : 'bg-white hover:bg-gray-100 text-gray-600 border border-gray-200'
                              }`}
                              title="Répondre"
                            >
                              <Reply size={16} />
                            </button>
                            <button
                              onClick={() => setShowReactionMenu(showReactionMenu === msg.id ? null : msg.id)}
                              className={`p-2 rounded-full text-xs transition ${
                                msg.isOwn
                                  ? 'bg-[#2E7379] hover:bg-[#F0F1F5] text-white'
                                  : 'bg-white hover:bg-gray-100 text-gray-600 border border-gray-200'
                              }`}
                              title="Ajouter une réaction"
                            >
                              <Smile size={16} />
                            </button>
                          </div>

                          {/* Emoji Picker */}
                          {showReactionMenu === msg.id && (
                            <div className="absolute bottom-full right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 flex gap-2 z-20">
                              {EMOJI_REACTIONS.map((reaction) => {
                                const Icon = reaction.icon;
                                return (
                                  <button
                                    key={reaction.name}
                                    onClick={() => handleAddReaction(msg.id, reaction.name)}
                                    className="hover:scale-125 transition cursor-pointer p-2 hover:bg-gray-100 rounded-lg"
                                    title={reaction.label}
                                  >
                                    <Icon size={18} className="text-gray-700" />
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                      {msg.isOwn && (
                        <img
                          src={getImageUrl(msg.senderProfileImageUrl) || '/profile_none.jpg'}
                          alt={msg.senderName}
                          className="w-8 h-8 rounded-full object-cover shrink-0 mt-1"
                          onError={(e) => {
                            e.target.src = '/profile_none.jpg';
                          }}
                        />
                      )}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Preview */}
              {replyingTo && (
                <div className="border-t border-gray-200 px-4 py-2 bg-[#2E7379]/10 flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-[#2E7379]">Répondre à {replyingTo.sender}</p>
                    <p className="text-sm text-gray-700 truncate">{replyingTo.content}</p>
                  </div>
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}

              {/* Input Area */}
              <div className="border-t border-gray-200 p-4 bg-white">
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-full transition text-gray-600">
                    <Paperclip size={20} />
                  </button>
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => handleTyping(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Aa"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-[#2E7379] text-sm"
                  />
                  <button
                    onClick={() => setShowEmojiPicker(showEmojiPicker ? null : 'input')}
                    className="p-2 hover:bg-gray-100 rounded-full transition text-gray-600"
                  >
                    <Smile size={20} />
                  </button>
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim() || loading}
                    className="bg-[#2E7379] text-white p-2 rounded-full hover:bg-[#F0F1F5] transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!selectedConversation && !showNewMessage && (
            <div className="hidden lg:flex flex-1 flex-col items-center justify-center bg-gray-50 text-gray-500">
              <Send size={48} className="mb-4 opacity-50" />
              <p className="text-lg font-semibold mb-2">Sélectionnez une conversation</p>
              <p className="text-sm">Choisissez une conversation pour commencer à discuter</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}