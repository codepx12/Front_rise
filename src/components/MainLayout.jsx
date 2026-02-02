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
  ChevronRight,
  ChevronLeft,
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
  
  // Initialiser sidebarOpen à partir du localStorage
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    return saved !== null ? JSON.parse(saved) : false;
  });

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

  // Sauvegarder l'état du sidebar dans le localStorage quand il change
  useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const unreadCount = messages.reduce((acc, msg) => acc + (msg.unread || 0), 0);

  const navItems = [
    { icon: Home, label: 'Accueil', onClick: () => { navigate('/dashboard'); setShowMobileMenu(false); } },
    { icon: Calendar, label: 'Événements', onClick: () => { navigate('/events'); setShowMobileMenu(false); } },
    { icon: ClipboardList, label: 'Formulaires', onClick: () => { navigate('/dashboard/forms'); setShowMobileMenu(false); } },
    { icon: MessageCircle, label: 'Messages', onClick: () => { navigate('/messages'); setShowMobileMenu(false); } },
  ];

  const adminItems = user?.role === 'Admin' ? [
    { icon: Users, label: 'Administration', onClick: () => { navigate('/admin'); setShowMobileMenu(false); } },
  ] : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - iOS 26 Style with Blur and Luminous Effects */}
      <header className="bg-gradient-to-b from-white/60 to-white/40 backdrop-blur-3xl fixed top-0 left-0 right-0 z-50 border-b border-gray-200/40 shadow-sm">
        <div className="max-w-full px-4 py-3 flex justify-between items-center">
          {/* Logo et Search */}
          <div className="flex items-center gap-4 md:gap-8 flex-1">
            <button onClick={() => navigate('/dashboard')} className="hover:opacity-80 transition duration-200 flex items-center">
              <img src="/logoblack.png" alt="RISE Logo" className="h-[40px] md:h-[40px] w-auto" />
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
              className="md:hidden p-2 hover:bg-white/20 rounded-lg transition duration-200"
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
                  className="relative p-2 hover:bg-white/20 rounded-lg transition duration-200"
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
                  <div className="absolute right-0 mt-2 w-80 bg-gradient-to-b from-white/90 to-white/80 backdrop-blur-3xl rounded-2xl shadow-lg z-50 max-h-96 overflow-y-auto border border-white/40">
                    <div className="sticky top-0 bg-gradient-to-b from-white/95 to-white/85 backdrop-blur-3xl border-b border-white/40 p-4 font-semibold text-gray-900">
                      Notifications {loadingNotifications && <span className="text-xs text-gray-500">(Chargement...)</span>}
                    </div>
                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <div key={notif.id} className="border-b border-gray-100/40 p-4 hover:bg-gray-50/80 transition duration-200 cursor-pointer flex justify-between items-start group">
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
                  className="relative p-2 hover:bg-white/20 rounded-lg transition duration-200"
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
                  <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-gradient-to-b from-white/90 to-white/80 backdrop-blur-3xl rounded-2xl shadow-lg z-50 max-h-96 overflow-y-auto border border-white/40 left-auto sm:left-auto -right-4 sm:right-0">
                    <div className="sticky top-0 bg-gradient-to-b from-white/95 to-white/85 backdrop-blur-3xl border-b border-white/40 p-4 flex justify-between items-center">
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
                          className={`border-b border-gray-100/40 p-4 hover:bg-gray-50/80 transition duration-200 cursor-pointer ${
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
                className="flex items-center gap-2 p-2 hover:bg-white/20 rounded-lg transition duration-200"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-[#2E7379] to-[#1f4f4d] rounded-full flex items-center justify-center text-white font-bold text-sm overflow-hidden shadow-md border border-white/30">
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
                <div className="absolute right-0 mt-2 w-56 bg-gradient-to-b from-white/90 to-white/80 backdrop-blur-3xl rounded-2xl shadow-lg z-50 border border-white/40 overflow-hidden">
                  <div className="p-4 border-b border-white/40">
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
                    className="w-full text-left px-4 py-3 hover:bg-gray-50/80 transition duration-200 text-gray-800 text-sm font-medium"
                  >
                    Profil
                  </button>
                  <button className="w-full text-left px-4 py-3 hover:bg-gray-50/80 transition duration-200 text-gray-800 text-sm font-medium">
                    Paramètres
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 hover:bg-red-50/80 transition duration-200 text-red-600 border-t border-white/40 text-sm font-medium flex items-center gap-2"
                  >
                    <LogOut size={16} />
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with Sidebar */}
      <div className="flex pt-16 relative">
        {/* Mobile Menu - Dropdown pour les petits écrans */}
        {showMobileMenu && showSidebars && (
          <div className="fixed inset-0 top-16 z-40 md:hidden bg-black/20 backdrop-blur-sm" onClick={() => setShowMobileMenu(false)}>
            <div 
              className="absolute top-0 left-0 right-0 bg-gradient-to-b from-white/95 to-white/90 backdrop-blur-3xl border-b border-white/40 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <nav className="max-h-[calc(100vh-80px)] overflow-y-auto py-4 px-4 space-y-2">
                {/* User Profile Section */}
                <div className="pb-4 border-b border-gray-200/40">
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#2E7379] to-[#1f4f4d] rounded-full flex items-center justify-center text-white font-bold text-sm overflow-hidden">
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
                    <div>
                      <p className="font-semibold text-sm text-gray-900">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Navigation Items */}
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      onClick={item.onClick}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-gray-100/80 text-gray-800 font-medium"
                    >
                      <Icon size={20} className="text-[#2E7379]" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}

                {/* Admin Section */}
                {adminItems.length > 0 && (
                  <>
                    <div className="my-2 border-t border-gray-200/40"></div>
                    {adminItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.label}
                          onClick={item.onClick}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-red-50/80 text-red-600 font-medium"
                        >
                          <Icon size={20} />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </>
                )}

                {/* Settings and Logout */}
                <div className="my-2 border-t border-gray-200/40"></div>
                <button 
                  onClick={() => {
                    navigate('/profile');
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-gray-100/80 text-gray-800 font-medium"
                >
                  <Settings size={20} className="text-gray-600" />
                  <span>Profil</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-red-50/80 text-red-600 font-medium"
                >
                  <LogOut size={20} />
                  <span>Déconnexion</span>
                </button>
              </nav>
            </div>
          </div>
        )}

        {/* Sidebar Style Pixbling - Fixed + Absolute Overlay */}
        {showSidebars && (
          <aside 
            className="hidden lg:flex lg:flex-col fixed left-0 top-16 h-[calc(100vh-64px)] z-40 transition-all duration-300 ease-out group"
            style={{ 
              width: sidebarOpen ? '280px' : '80px',
            }}
          >
            {/* Background with gradient - absolute position */}
            <div 
              className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-transparent backdrop-blur-2xl border-r border-white/20 rounded-r-3xl"
              style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(147, 51, 234, 0.04))',
              }}
            />

            {/* Content */}
            <div className="relative z-10 flex flex-col h-full">
              {/* Top Section - Toggle Button + Profile Photo */}
              <div className="flex flex-col items-center justify-center pt-4 pb-6 border-b border-white/10">
                {/* Toggle Button */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="mb-4 p-2 hover:bg-white/20 rounded-lg transition-all duration-200 transform"
                  title={sidebarOpen ? "Réduire" : "Élargir"}
                >
                  {sidebarOpen ? (
                    <ChevronLeft size={24} className="text-[#2E7379]" />
                  ) : (
                    <ChevronRight size={24} className="text-[#2E7379]" />
                  )}
                </button>

                {/* Profile Photo */}
                <div className="mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl overflow-hidden shadow-lg border-2 border-white/30 transition-transform duration-300 hover:scale-105">
                    {user?.profileImageUrl ? (
                      <img
                        src={getImageUrl(user.profileImageUrl)}
                        alt={`${user?.firstName} ${user?.lastName}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}</span>
                    )}
                  </div>
                </div>
                
                {/* User Info - Show only when expanded */}
                {sidebarOpen && (
                  <div className="text-center animate-fadeIn">
                    <p className="font-semibold text-sm text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Mon Compte</p>
                  </div>
                )}
              </div>

              {/* Menu Items - Center Section (flex-grow to push Settings down) */}
              <nav className="flex-1 py-6 px-3 space-y-3 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      onClick={item.onClick}
                      className="group relative w-full flex items-center justify-center lg:justify-start gap-4 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-white/10"
                      title={item.label}
                    >
                      <Icon size={24} className="text-[#2E7379] flex-shrink-0 group-hover:scale-110 transition duration-200" />
                      <span className={`font-semibold text-sm text-gray-800 whitespace-nowrap transition-all duration-200 ${
                        sidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 hidden'
                      }`}>
                        {item.label}
                      </span>
                    </button>
                  );
                })}

                {/* Admin Section */}
                {adminItems.length > 0 && (
                  <>
                    <div className="my-2 border-t border-white/10"></div>
                    {adminItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.label}
                          onClick={item.onClick}
                          className="group relative w-full flex items-center justify-center lg:justify-start gap-4 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-red-500/10"
                          title={item.label}
                        >
                          <Icon size={24} className="text-red-600 flex-shrink-0 group-hover:scale-110 transition duration-200" />
                          <span className={`font-semibold text-sm text-gray-800 whitespace-nowrap transition-all duration-200 ${
                            sidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 hidden'
                          }`}>
                            {item.label}
                          </span>
                        </button>
                      );
                    })}
                  </>
                )}
              </nav>

              {/* Bottom Section - Settings and Logout */}
              <div className="border-t border-white/10 p-3 space-y-3">
                <button className="group relative w-full flex items-center justify-center lg:justify-start gap-4 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-white/10" title="Paramètres">
                  <Settings size={24} className="text-gray-600 flex-shrink-0 group-hover:scale-110 group-hover:rotate-90 transition duration-200" />
                  <span className={`font-semibold text-sm text-gray-800 whitespace-nowrap transition-all duration-200 ${
                    sidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 hidden'
                  }`}>
                    Paramètres
                  </span>
                </button>

                <button 
                  onClick={handleLogout}
                  className="group relative w-full flex items-center justify-center lg:justify-start gap-4 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-red-500/10" 
                  title="Déconnexion"
                >
                  <LogOut size={24} className="text-red-500 flex-shrink-0 group-hover:scale-110 transition duration-200" />
                  <span className={`font-semibold text-sm text-red-600 whitespace-nowrap transition-all duration-200 ${
                    sidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 hidden'
                  }`}>
                    Déconnexion
                  </span>
                </button>
              </div>
            </div>
          </aside>
        )}

        {/* Main Content - Adjust margin based on sidebar state */}
        <main 
          className="flex-1 w-full px-2 py-4 lg:px-1 lg:py-1 overflow-y-auto transition-all duration-300"
          style={{ 
            marginLeft: showSidebars && window.innerWidth >= 1024 ? (sidebarOpen ? '280px' : '80px') : '0',
            height: 'calc(100vh - 64px)',
            width: showSidebars && window.innerWidth >= 1024 ? `calc(100% - ${sidebarOpen ? '280px' : '80px'})` : '100%'
          }}
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