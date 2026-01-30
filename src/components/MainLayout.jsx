import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { messageService } from '../services/messageService';
import { notificationService } from '../services/notificationService';
import { getImageUrl, getProfileImageUrl } from '../services/api';
import MessageModal from './MessageModal';
import {
  Calendar,
  BarChart3,
  Vote,
  LogOut,
  Bell,
  MessageCircle,
  Search,
  Home,
  Users,
  Settings,
  ChevronDown,
  X,
  Send,
  ClipboardList,
  Menu,
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function MainLayout({ children, showSidebars = true }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // État pour les vraies données
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Charger les conversations/messages au montage et périodiquement
  useEffect(() => {
    const loadMessages = async () => {
      setLoadingMessages(true);
      try {
        const conversations = await messageService.getConversations();
        setMessages(conversations);
      } catch (error) {
        console.error('Erreur lors du chargement des messages:', error);
      } finally {
        setLoadingMessages(false);
      }
    };

    loadMessages();
    // Rafraîchir les messages toutes les 30 secondes
    const messageInterval = setInterval(loadMessages, 30000);
    return () => clearInterval(messageInterval);
  }, []);

  // Charger les notifications seulement pour les admins
  useEffect(() => {
    const loadNotifications = async () => {
      if (user?.role !== 'Admin') {
        return;
      }
      
      setLoadingNotifications(true);
      try {
        const notifs = await notificationService.getNotifications();
        setNotifications(notifs);
      } catch (error) {
        console.error('Erreur lors du chargement des notifications:', error);
      } finally {
        setLoadingNotifications(false);
      }
    };

    loadNotifications();
    // Rafraîchir les notifications toutes les 30 secondes
    const notificationInterval = setInterval(loadNotifications, 30000);
    return () => clearInterval(notificationInterval);
  }, [user?.role]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const unreadCount = messages.reduce((acc, msg) => acc + (msg.unread || 0), 0);

  const navItems = [
    { icon: Home, label: 'Accueil', color: 'text-[#2E7379]', onClick: () => { navigate('/dashboard'); setShowMobileMenu(false); } },
    { icon: Calendar, label: 'Événements', color: 'text-[#2E7379]', onClick: () => { navigate('/events'); setShowMobileMenu(false); } },
    { icon: ClipboardList, label: 'Formulaires', color: 'text-green-600', onClick: () => { navigate('/dashboard/forms'); setShowMobileMenu(false); } },

    { icon: MessageCircle, label: 'Messages', color: 'text-[#2E7379]', onClick: () => { navigate('/messages'); setShowMobileMenu(false); } },
  ];

  const adminItems = user?.role === 'Admin' ? [
    { icon: Users, label: 'Administration', color: 'text-red-600', onClick: () => { navigate('/admin'); setShowMobileMenu(false); } },
  ] : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - iOS 26 Style with Blur and Luminous Effects */}
      <header className="bg-gradient-to-b from-white/60 to-white/40 backdrop-blur-3xl fixed top-0 left-0 right-0 z-50 border-b border-gray-200/40 shadow-sm">
        <div className="max-w-full px-4 py-3 flex justify-between items-center">
          {/* Logo et Search */}
          <div className="flex items-center gap-4 md:gap-8 flex-1">
            <button onClick={() => navigate('/dashboard')} className="text-2xl md:text-3xl font-bold text-[#2E7379] whitespace-nowrap hover:opacity-80 transition duration-200">
              RISE
            </button>
            <div className="hidden md:flex items-center bg-gradient-to-r from-gray-100/40 to-gray-50/30 backdrop-blur-2xl rounded-full px-4 py-2 w-96 border border-gray-200/50 hover:border-gray-300/50 hover:bg-gradient-to-r hover:from-gray-100/60 hover:to-gray-50/50 focus-within:bg-gradient-to-r focus-within:from-gray-100/70 focus-within:to-gray-50/60 focus-within:border-gray-300/60 transition-all duration-300 shadow-sm">
              <Search size={18} className="text-gray-500" />
              <input
                type="text"
                placeholder="Rechercher événements, sondages..."
                className="bg-transparent ml-2 w-full outline-none text-sm text-gray-700 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Icons et User */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 hover:bg-gray-200/30 rounded-lg transition duration-200"
            >
              <Menu size={24} className="text-gray-700" />
            </button>

            {/* Notifications - Affichées uniquement pour les admins */}
            {user?.role === 'Admin' && (
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowMessages(false);
                  }}
                  className="relative p-2 hover:bg-gray-200/30 rounded-lg transition duration-200"
                  disabled={loadingNotifications}
                >
                  <Bell size={24} className="text-gray-700" />
                  {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold shadow-lg">
                      {notifications.length}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-gradient-to-b from-white/80 to-white/70 backdrop-blur-3xl rounded-2xl shadow-lg z-50 max-h-96 overflow-y-auto border border-gray-200/40">
                    <div className="sticky top-0 bg-gradient-to-b from-white/90 to-white/80 backdrop-blur-3xl border-b border-gray-200/40 p-4 font-semibold text-gray-900">
                      Notifications {loadingNotifications && <span className="text-xs text-gray-500">(Chargement...)</span>}
                    </div>
                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <div key={notif.id} className="border-b border-gray-100/40 p-4 hover:bg-gray-50/60 transition duration-200 cursor-pointer flex justify-between items-start group">
                          <div className="flex-1">
                            <p className="text-sm text-gray-800">{notif.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{notif.createdAt ? new Date(notif.createdAt).toLocaleDateString('fr-FR') : 'Date inconnue'}</p>
                          </div>
                          <button className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition duration-200">
                            <X size={16} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500 text-sm">Aucune notification</div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Messages */}
            {location.pathname !== '/messages' && (
              <div className="relative">
                <button
                  onClick={() => {
                    setShowMessages(!showMessages);
                    setShowNotifications(false);
                  }}
                  className="relative p-2 hover:bg-gray-200/30 rounded-lg transition duration-200"
                  disabled={loadingMessages}
                >
                  <MessageCircle size={24} className="text-gray-700" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold shadow-lg">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showMessages && (
                  <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-gradient-to-b from-white/80 to-white/70 backdrop-blur-3xl rounded-2xl shadow-lg z-50 max-h-96 overflow-y-auto border border-gray-200/40 left-auto sm:left-auto -right-4 sm:right-0">
                    <div className="sticky top-0 bg-gradient-to-b from-white/90 to-white/80 backdrop-blur-3xl border-b border-gray-200/40 p-4 flex justify-between items-center">
                      <span className="font-semibold text-gray-900">Messages {loadingMessages && <span className="text-xs text-gray-500">(Chargement...)</span>}</span>
                      <button
                        onClick={() => navigate('/messages')}
                        className="text-[#2E7379] hover:bg-[#2E7379]/10 p-2 rounded-lg transition duration-200"
                      >
                        <Send size={18} />
                      </button>
                    </div>
                    {messages.length > 0 ? (
                      messages.map((msg) => (
                        <div
                          key={msg.id}
                          onClick={() => {
                            navigate(`/messages?conversation=${msg.id}`);
                            setShowMessages(false);
                          }}
                          className={`border-b border-gray-100/40 p-4 hover:bg-gray-50/60 transition duration-200 cursor-pointer ${
                            msg.unread > 0 ? 'bg-[#2E7379]/10' : ''
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <p className="font-semibold text-gray-800 text-sm flex-1">{msg.sender || 'Utilisateur inconnu'}</p>
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {msg.time ? new Date(msg.time).toLocaleDateString('fr-FR') : 'Date inconnue'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 truncate mt-1">{msg.lastMessage || 'Pas de message'}</p>
                          {msg.unread > 0 && (
                            <span className="inline-block mt-2 bg-[#2E7379] text-white text-xs rounded-full px-2 py-0.5 font-medium">
                              {msg.unread} nouveau
                            </span>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500 text-sm">Aucune conversation</div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-2 hover:bg-gray-200/30 rounded-lg transition duration-200"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-[#2E7379] to-[#1f4f4d] rounded-full flex items-center justify-center text-white font-bold text-sm overflow-hidden shadow-md border border-gray-200/30">
                  {user?.profileImageUrl ? (
                    <img
                      src={getImageUrl(user.profileImageUrl)}
                      alt={`${user?.firstName} ${user?.lastName}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    `${user?.firstName?.charAt(0)}${user?.lastName?.charAt(0)}`
                  )}
                </div>
                <ChevronDown size={18} className="text-gray-700 hidden md:block transition-transform duration-300 group-hover:rotate-180" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-gradient-to-b from-white/80 to-white/70 backdrop-blur-3xl rounded-2xl shadow-lg z-50 border border-gray-200/40 overflow-hidden">
                  <div className="p-4 border-b border-gray-200/40">
                    <p className="font-semibold text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
                  </div>
                  <button 
                    onClick={() => {
                      navigate('/profile');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50/60 transition duration-200 text-gray-800 text-sm font-medium"
                  >
                    Profil
                  </button>
                  <button className="w-full text-left px-4 py-3 hover:bg-gray-50/60 transition duration-200 text-gray-800 text-sm font-medium">
                    Paramètres
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 hover:bg-red-50/60 transition duration-200 text-red-600 border-t border-gray-200/40 text-sm font-medium flex items-center gap-2"
                  >
                    <LogOut size={16} />
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-200/40 bg-gradient-to-b from-white/60 to-white/40 backdrop-blur-2xl shadow-lg animate-in fade-in slide-in-from-top-2">
            <div className="p-2 space-y-1 max-h-96 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={item.onClick}
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-200/30 rounded-xl transition duration-200 text-gray-800 group"
                  >
                    <Icon size={20} className={`${item.color} group-hover:scale-110 transition duration-200`} />
                    <span className="font-medium text-sm">{item.label}</span>
                  </button>
                );
              })}

              {adminItems.length > 0 && (
                <>
                  <div className="border-t border-gray-200/40 my-2"></div>
                  {adminItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.label}
                        onClick={item.onClick}
                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-200/30 rounded-xl transition duration-200 text-gray-800 group"
                      >
                        <Icon size={20} className={`${item.color} group-hover:scale-110 transition duration-200`} />
                        <span className="font-medium text-sm">{item.label}</span>
                      </button>
                    );
                  })}
                </>
              )}

              <div className="border-t border-gray-200/40 my-2"></div>
              <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-200/30 rounded-xl transition duration-200 text-gray-800 group">
                <Settings size={20} className="text-gray-600 group-hover:scale-110 transition duration-200" />
                <span className="font-medium text-sm">Paramètres</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="flex pt-16 relative">
        {/* Sidebar Gauche - Fixed (non scrollable) with Hover Expansion */}
        {showSidebars && (
          <aside 
            className="hidden lg:block bg-white/40 backdrop-blur-xl absolute left-0 top-20 h-[calc(100vh-80px)] overflow-hidden z-40 border-r border-gray-200/40 transition-all duration-300 ease-out group"
            style={{ width: sidebarOpen ? '256px' : '80px' }}
            onMouseEnter={() => setSidebarOpen(true)}
            onMouseLeave={() => setSidebarOpen(false)}
          >
            <div className="p-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={item.onClick}
                    className="w-full flex items-center gap-4 px-4 py-3 hover:bg-[#2E7379]/20 rounded-xl transition-all duration-200 text-gray-800 group hover:text-[#2E7379]"
                  >
                    <Icon size={24} className="flex-shrink-0 group-hover:scale-110 transition duration-200" />
                    <span className={`font-semibold text-sm whitespace-nowrap transition-opacity duration-200 ${
                      sidebarOpen ? 'opacity-100' : 'opacity-0 hidden'
                    }`}>
                      {item.label}
                    </span>
                  </button>
                );
              })}

              {adminItems.length > 0 && (
                <>
                  <div className="border-t border-gray-200/40 my-4"></div>
                  {adminItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.label}
                        onClick={item.onClick}
                        className="w-full flex items-center gap-4 px-4 py-3 hover:bg-red-600/20 rounded-xl transition-all duration-200 text-gray-800 group hover:text-red-600"
                      >
                        <Icon size={24} className="flex-shrink-0 group-hover:scale-110 transition duration-200" />
                        <span className={`font-semibold text-sm whitespace-nowrap transition-opacity duration-200 ${
                          sidebarOpen ? 'opacity-100' : 'opacity-0 hidden'
                        }`}>
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </>
              )}

              <div className="border-t border-gray-200/40 my-4"></div>
              <button className="w-full flex items-center gap-4 px-4 py-3 hover:bg-gray-100/50 rounded-xl transition-all duration-200 text-gray-800 group hover:text-gray-600">
                <Settings size={24} className="flex-shrink-0 group-hover:scale-110 transition duration-200" />
                <span className={`font-semibold text-sm whitespace-nowrap transition-opacity duration-200 ${
                  sidebarOpen ? 'opacity-100' : 'opacity-0 hidden'
                }`}>
                  Paramètres
                </span>
              </button>
            </div>
          </aside>
        )}

        {/* Main Content - Adjust margin only on lg screens */}
        <main 
          className="flex-1 w-full px-4 py-8 lg:px-2 lg:py-2 lg:ml-20 overflow-y-auto"
          style={{ height: 'calc(100vh - 80px)' }}
        >
          {children}
        </main>
      </div>

      {/* Message Modal Component */}
      {selectedConversation && (
        <MessageModal 
          conversation={selectedConversation} 
          onClose={() => setSelectedConversation(null)}
        />
      )}
    </div>
  );
}