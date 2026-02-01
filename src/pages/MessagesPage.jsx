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
  Circle,
  ChevronDown,
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
      <div className="w-full h-[calc(100vh-100px)] bg-white flex flex-col lg:flex-row overflow-hidden">
        {/* Sidebar - Conversations List */}
        <div className={`${selectedConversation ? 'hidden' : 'flex'} lg:flex flex-col w-full lg:w-80 bg-white border-r border-gray-200 overflow-hidden`}>
          {/* Sidebar Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-black text-gray-900">Discussions</h1>
              <button className="p-2 hover:bg-gray-100 rounded-full transition">
                <MoreVertical size={20} className="text-gray-600" />
              </button>
            </div>
            
            {/* Search Bar */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher dans Messenger"
                value={searchText}
                onChange={(e) => handleSearchStudents(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-[#255D5F]/30 text-sm text-gray-900 placeholder-gray-500"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 px-4 py-3 border-b border-gray-200 overflow-x-auto flex-shrink-0">
            <button className="px-4 py-1.5 bg-[#255D5F] text-white text-sm font-semibold rounded-full whitespace-nowrap hover:opacity-90">
              Tout
            </button>
            <button className="px-4 py-1.5 text-gray-600 text-sm font-semibold rounded-full hover:bg-gray-100 whitespace-nowrap">
              Non lu
            </button>
            <button className="px-4 py-1.5 text-gray-600 text-sm font-semibold rounded-full hover:bg-gray-100 whitespace-nowrap">
              Groupes
            </button>
          </div>

          {/* Search Results or Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {searchResults.length > 0 && searchText.trim().length > 0 ? (
              <>
                <p className="text-xs font-semibold text-gray-500 px-4 py-3">RÉSULTATS DE RECHERCHE</p>
                {searchResults.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => handleStartConversation(student)}
                    className="w-full px-4 py-3 hover:bg-gray-50 transition flex items-center gap-3 border-b border-gray-100"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-[#255D5F] to-cyan-500 rounded-full shrink-0 flex items-center justify-center text-white font-bold text-sm">
                      {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{student.email}</p>
                    </div>
                  </button>
                ))}
              </>
            ) : (
              <>
                {filteredConversations.length > 0 ? (
                  filteredConversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv)}
                      className={`w-full px-4 py-3 hover:bg-gray-50 transition flex items-center gap-3 border-b border-gray-100 ${
                        selectedConversation?.id === conv.id ? 'bg-gray-50' : ''
                      }`}
                    >
                      <div className="relative shrink-0">
                        <img
                          src={getImageUrl(conv.senderProfileImageUrl) || '/profile_none.jpg'}
                          alt={conv.sender}
                          className="w-12 h-12 rounded-full object-cover"
                          onError={(e) => {
                            e.target.src = '/profile_none.jpg';
                          }}
                        />
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline gap-2 mb-1">
                          <p className={`${conv.unread > 0 ? 'font-bold' : 'font-semibold'} text-gray-900 truncate text-sm`}>
                            {conv.sender}
                          </p>
                          <p className="text-xs text-gray-500 shrink-0">{formatTime(conv.time)}</p>
                        </div>
                        <p className={`text-xs ${conv.unread > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'} truncate`}>
                          {conv.lastMessage || 'Pas de message'}
                        </p>
                      </div>
                      {conv.unread > 0 && (
                        <div className="w-5 h-5 bg-[#255D5F] rounded-full shrink-0 flex items-center justify-center">
                          <span className="text-xs text-white font-bold">{conv.unread}</span>
                        </div>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 p-4">
                    <p className="text-sm">{searchText ? 'Aucune conversation trouvée' : 'Aucune conversation'}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Chat Area */}
        {selectedConversation && (
          <div className="flex-1 flex flex-col bg-white lg:border-l border-gray-200 overflow-hidden">
            {/* Chat Header */}
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-white flex-shrink-0">
              <div className="flex items-center gap-3 flex-1">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="lg:hidden text-gray-600 hover:bg-gray-100 p-2 rounded-full transition"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="relative">
                  <img
                    src={getImageUrl(selectedConversation.senderProfileImageUrl) || '/profile_none.jpg'}
                    alt={selectedConversation.sender}
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => {
                      e.target.src = '/profile_none.jpg';
                    }}
                  />
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-white"></div>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">{selectedConversation.sender}</h3>
                  <p className="text-xs text-gray-500">
                    {usersTyping.length > 0 ? `${usersTyping.join(', ')} en train d'écrire...` : 'En ligne'}
                  </p>
                </div>
              </div>

              {/* Header Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleStartCall('audio')}
                  disabled={onCall}
                  className="p-2 hover:bg-gray-100 rounded-full transition text-[#255D5F] disabled:opacity-50"
                  title="Appel audio"
                >
                  <Phone size={18} />
                </button>
                <button
                  onClick={() => handleStartCall('video')}
                  disabled={onCall}
                  className="p-2 hover:bg-gray-100 rounded-full transition text-[#255D5F] disabled:opacity-50"
                  title="Appel vidéo"
                >
                  <Video size={18} />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full transition text-gray-600">
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div 
              className="flex-1 overflow-y-auto p-4 space-y-3 bg-white"
              onClick={() => {
                if (showReactionMenu) {
                  setShowReactionMenu(null);
                }
              }}
            >
              {messagesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="inline-block animate-spin">
                      <Circle size={24} className="text-[#255D5F] animate-spin" />
                    </div>
                    <p className="text-gray-500 text-sm mt-3">Chargement...</p>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                      <MessageCircle size={32} className="text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm">Aucun message pour le moment</p>
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'} gap-2 group`}
                  >
                    {!msg.isOwn && (
                      <img
                        src={getImageUrl(msg.senderProfileImageUrl) || '/profile_none.jpg'}
                        alt={msg.senderName}
                        className="w-6 h-6 rounded-full object-cover shrink-0 mt-1 cursor-pointer hover:opacity-80 transition"
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
                    <div className="relative max-w-xs lg:max-w-md">
                      {/* Message Bubble */}
                      <div
                        className={`px-4 py-2.5 rounded-2xl ${
                          msg.isOwn
                            ? 'bg-[#255D5F] text-white rounded-br-none'
                            : 'bg-gray-100 text-gray-900 rounded-bl-none'
                        }`}
                      >
                        {/* Reply to */}
                        {msg.replyTo && (
                          <div className={`text-xs mb-2 py-1.5 px-2 rounded-lg border-l-2 ${
                            msg.isOwn 
                              ? 'bg-white/20 border-l-white' 
                              : 'bg-gray-200/50 border-l-gray-400'
                          }`}>
                            <p className={msg.isOwn ? 'text-white/90' : 'text-gray-700'}>
                              Réponse à {msg.replyTo.sender}
                            </p>
                            <p className={`text-xs italic truncate ${msg.isOwn ? 'text-white/70' : 'text-gray-600'}`}>
                              {msg.replyTo.content}
                            </p>
                          </div>
                        )}
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                      </div>

                      {/* Reactions */}
                      {msg.reactions && msg.reactions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1 ml-1">
                          {msg.reactions.map((reaction, idx) => (
                            <span
                              key={idx}
                              className="bg-gray-100 border border-gray-200 rounded-full px-2 py-1 text-xs hover:bg-gray-200 transition cursor-pointer"
                              title={reaction.user}
                            >
                              {reaction.emoji}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Message Time */}
                      <p className={`text-xs mt-1 ${msg.isOwn ? 'text-right text-gray-400' : 'text-gray-500'}`}>
                        {formatTime(msg.sentAt)}
                      </p>

                      {/* Message Actions (hover desktop) */}
                      <div className="hidden lg:group-hover:flex gap-1 absolute -top-8 right-0 bg-white border border-gray-200 rounded-full p-1 shadow-lg z-10">
                        <button
                          onClick={() => setReplyingTo(msg)}
                          className="p-1.5 hover:bg-gray-100 rounded-full transition text-gray-600"
                          title="Répondre"
                        >
                          <Reply size={14} />
                        </button>
                        <button
                          onClick={() => setShowReactionMenu(showReactionMenu === msg.id ? null : msg.id)}
                          className="p-1.5 hover:bg-gray-100 rounded-full transition text-gray-600"
                          title="Ajouter une réaction"
                        >
                          <Smile size={14} />
                        </button>
                      </div>

                      {/* Emoji Picker */}
                      {showReactionMenu === msg.id && (
                        <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-2xl shadow-xl p-2 flex gap-1.5 z-20">
                          {EMOJI_REACTIONS.map((reaction) => {
                            const Icon = reaction.icon;
                            return (
                              <button
                                key={reaction.name}
                                onClick={() => handleAddReaction(msg.id, reaction.name)}
                                className="hover:scale-125 transition p-1.5 hover:bg-gray-100 rounded-lg"
                                title={reaction.label}
                              >
                                <Icon size={16} className="text-gray-700" />
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    {msg.isOwn && (
                      <img
                        src={getImageUrl(msg.senderProfileImageUrl) || '/profile_none.jpg'}
                        alt={msg.senderName}
                        className="w-6 h-6 rounded-full object-cover shrink-0 mt-1"
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
              <div className="border-t border-gray-200 px-4 py-2 bg-gray-50 flex items-center gap-3 flex-shrink-0">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#255D5F]">Répondre à {replyingTo.sender}</p>
                  <p className="text-sm text-gray-700 truncate">{replyingTo.content}</p>
                </div>
                <button
                  onClick={() => setReplyingTo(null)}
                  className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Input Area - Always at bottom */}
            <div className="border-t border-gray-200 p-3 bg-white flex-shrink-0">
              <div className="flex gap-2 items-end">
                <button className="p-2 hover:bg-gray-100 rounded-full transition text-[#255D5F] flex-shrink-0">
                  <Plus size={20} />
                </button>
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => handleTyping(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Aa"
                  className="flex-1 px-4 py-2.5 bg-gray-100 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-[#255D5F]/30 text-sm text-gray-900 placeholder-gray-600"
                />
                <button
                  onClick={() => setShowEmojiPicker(showEmojiPicker ? null : 'input')}
                  className="p-2 hover:bg-gray-100 rounded-full transition text-[#255D5F] flex-shrink-0"
                >
                  <Smile size={20} />
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() || loading}
                  className="p-2 hover:bg-gray-100 rounded-full transition text-[#255D5F] disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Right Sidebar - User Info (visible when chat is selected) */}
        {selectedConversation && (
          <div className="hidden xl:flex flex-col w-80 bg-white border-l border-gray-200 overflow-hidden">
            {/* User Profile Section */}
            <div className="p-4 border-b border-gray-200 text-center">
              <div className="relative inline-block mb-3">
                <img
                  src={getImageUrl(selectedConversation.senderProfileImageUrl) || '/profile_none.jpg'}
                  alt={selectedConversation.sender}
                  className="w-24 h-24 rounded-full object-cover"
                  onError={(e) => {
                    e.target.src = '/profile_none.jpg';
                  }}
                />
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <h3 className="font-bold text-gray-900 text-lg">{selectedConversation.sender}</h3>
              <p className="text-xs text-gray-500 mt-1">En ligne</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 px-4 py-3 border-b border-gray-200 justify-center flex-shrink-0">
              <button
                onClick={() => handleStartCall('audio')}
                disabled={onCall}
                className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition text-[#255D5F] disabled:opacity-50"
                title="Appel audio"
              >
                <Phone size={20} />
              </button>
              <button
                onClick={() => handleStartCall('video')}
                disabled={onCall}
                className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition text-[#255D5F] disabled:opacity-50"
                title="Appel vidéo"
              >
                <Video size={20} />
              </button>
              <button className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition text-[#255D5F]">
                <Search size={20} />
              </button>
            </div>

            {/* Info Sections */}
            <div className="flex-1 overflow-y-auto">
              {/* Personaliser la discussion */}
              <div className="border-b border-gray-200">
                <button className="w-full px-4 py-3 hover:bg-gray-50 transition flex items-center justify-between text-gray-900 text-sm font-semibold">
                  <span>Personnaliser la discussion</span>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>
              </div>

              {/* Fichiers et contenus multimédias */}
              <div className="border-b border-gray-200">
                <button className="w-full px-4 py-3 hover:bg-gray-50 transition flex items-center justify-between text-gray-900 text-sm font-semibold">
                  <span>Fichiers et contenus multimédias</span>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>
              </div>

              {/* Confidentialité et assistance */}
              <div>
                <button className="w-full px-4 py-3 hover:bg-gray-50 transition flex items-center justify-between text-gray-900 text-sm font-semibold">
                  <span>Confidentialité et assistance</span>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!selectedConversation && !showNewMessage && (
          <div className="hidden lg:flex flex-1 flex-col items-center justify-center bg-white">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <MessageCircle size={40} className="text-gray-400" />
            </div>
            <p className="text-lg font-semibold text-gray-900 mb-2">Sélectionnez une conversation</p>
            <p className="text-sm text-gray-600">Choisissez une conversation pour commencer à discuter</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}