import { useState, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { messageService } from '../services/messageService';
import { getImageUrl } from '../services/api';

export default function MessageModal({ conversation, onClose }) {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);

  // Charger les messages de la conversation
  useEffect(() => {
    const loadMessages = async () => {
      if (!conversation?.id) return;
      
      setLoading(true);
      try {
        const conversationMessages = await messageService.getMessages(conversation.id);
        console.log('Messages reçus:', conversationMessages);
        setMessages(conversationMessages);
      } catch (error) {
        console.error('Erreur lors du chargement des messages:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [conversation?.id]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !conversation?.id) return;

    try {
      const newMessage = await messageService.sendMessage(conversation.id, messageText);
      setMessages([...messages, newMessage]);
      setMessageText('');
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-end z-50">
      <div className="bg-white w-full md:w-96 h-96 rounded-t-lg md:rounded-lg flex flex-col shadow-xl">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 flex justify-between items-center rounded-t-lg md:rounded-t-lg">
          <p className="font-bold">{conversation?.sender || 'Conversation'}</p>
          <button
            onClick={onClose}
            className="hover:bg-blue-700 p-2 rounded-full transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Chargement des messages...</p>
            </div>
          ) : messages.length > 0 ? (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'} gap-2`}
              >
                {!msg.isOwn && (
                  <img
                    src={getImageUrl(msg.senderProfileImageUrl) || '/profile_none.jpg'}
                    alt={msg.senderName}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    onError={(e) => {
                      e.target.src = '/profile_none.jpg';
                    }}
                  />
                )}
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg ${
                    msg.isOwn
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-gray-300 text-gray-800 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {new Date(msg.sentAt).toLocaleTimeString('fr-FR')}
                  </p>
                </div>
                {msg.isOwn && (
                  <img
                    src={getImageUrl(msg.senderProfileImageUrl) || '/profile_none.jpg'}
                    alt={msg.senderName}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    onError={(e) => {
                      e.target.src = '/profile_none.jpg';
                    }}
                  />
                )}
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-gray-600 text-center">
                Commencez une conversation avec {conversation?.sender || 'cet utilisateur'}
              </p>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t p-3 flex gap-2 bg-white rounded-b-lg md:rounded-b-lg">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Votre message..."
            className="flex-1 border rounded-full px-4 py-2 outline-none focus:border-blue-500 text-sm"
          />
          <button
            onClick={handleSendMessage}
            disabled={!messageText.trim()}
            className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
