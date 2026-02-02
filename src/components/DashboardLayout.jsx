import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
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
  Calendar,
  BarChart3,
  Vote,
  LogOut,
} from 'lucide-react';

export default function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  const notifications = [
    { id: 1, type: 'event', message: 'Nouveau événement: Hackathon 2026', time: 'Il y a 2h' },
    { id: 2, type: 'poll', message: 'Un nouveau sondage vous attend', time: 'Il y a 4h' },
    { id: 3, type: 'vote', message: 'Élection en cours: Président', time: 'Il y a 1j' },
  ];

  const messages = [
    { id: 1, sender: 'Admin', lastMessage: 'Bienvenue sur RISE!', time: 'Il y a 1h', unread: 2 },
    { id: 2, sender: 'Support', lastMessage: 'Comment puis-je vous aider?', time: 'Il y a 3h', unread: 0 },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSendMessage = () => {
    if (messageText.trim()) {
      console.log('Message envoyé:', messageText);
      setMessageText('');
    }
  };

  const markNotificationAsRead = (id) => {
    // Handle notification removal
  };

  const unreadCount = messages.reduce((acc, msg) => acc + msg.unread, 0);

  const navItems = [
    { icon: Home, label: 'Accueil', color: 'blue', onClick: () => { navigate('/dashboard'); setShowMobileMenu(false); } },
    { icon: Calendar, label: 'Événements', color: 'indigo', onClick: () => { navigate('/events'); setShowMobileMenu(false); } },
    { icon: ClipboardList, label: 'Formulaires', color: 'green', onClick: () => { navigate('/dashboard/forms'); setShowMobileMenu(false); } },
    { icon: Vote, label: 'Élections', color: 'purple', onClick: () => { navigate('/votes'); setShowMobileMenu(false); } },
    { icon: MessageCircle, label: 'Messages', color: 'cyan', onClick: () => { navigate('/messages'); setShowMobileMenu(false); } },
  ];

  const adminItems = user?.role === 'Admin' ? [
    { icon: Users, label: 'Administration', color: 'red', onClick: () => { navigate('/admin'); setShowMobileMenu(false); } },
  ] : [];

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      {/* Header - Style iOS 26 */}
      <header className="bg-white/70 backdrop-blur-2xl shadow-sm sticky top-0 z-50 border-b border-gray-200/60">
        <div className="max-w-full px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4 md:gap-8 flex-1">
            <button onClick={() => navigate('/dashboard')} className="hover:opacity-80 transition duration-200 flex items-center">
              <img src="/logoblack.png" alt="RISE Logo" className="h-8 md:h-10 w-auto" />
            </button>
            <div className="hidden md:flex items-center bg-gray-100/60 backdrop-blur-xl rounded-2xl px-5 py-3 w-96 border border-gray-300/40 hover:border-blue-400/60 focus-within:border-blue-500/60 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all duration-300 shadow-sm">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="bg-transparent ml-3 w-full outline-none text-sm text-gray-700 placeholder-gray-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2.5 hover:bg-gray-100/80 rounded-xl transition-all duration-200 active:scale-95"
            >
              <Menu size={22} className="text-gray-700" />
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowMessages(false);
                }}
                className="relative p-2.5 hover:bg-gray-100/80 rounded-xl transition-all duration-200 active:scale-95"
              >
                <Bell size={22} className="text-gray-700" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 bg-gradient-to-br from-red-500 to-rose-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold shadow-lg shadow-red-500/50 animate-pulse">
                    {notifications.length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-gray-200/60 z-50 overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-50 to-white p-5 font-semibold text-gray-900 border-b border-gray-200/60">
                    Notifications
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <div key={notif.id} className="border-b border-gray-100/60 last:border-0 p-4 hover:bg-gray-50/80 transition-all duration-200 cursor-pointer flex justify-between items-start group">
                          <div className="flex-1">
                            <p className="text-sm text-gray-800 font-medium">{notif.message}</p>
                            <p className="text-xs text-gray-500 mt-1.5">{notif.time}</p>
                          </div>
                          <button
                            onClick={() => markNotificationAsRead(notif.id)}
                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg p-1.5 transition-all duration-200"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="p-12 text-center text-gray-400 text-sm">
                        Aucune notification
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="relative">
              <button
                onClick={() => navigate('/messages')}
                className="relative p-2.5 hover:bg-gray-100/80 rounded-xl transition-all duration-200 active:scale-95"
              >
                <MessageCircle size={22} className="text-gray-700" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-gradient-to-br from-red-500 to-rose-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold shadow-lg shadow-red-500/50">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* User Menu */}
            <div className="relative group">
              <button className="flex items-center gap-2.5 p-2 hover:bg-gray-100/80 rounded-xl transition-all duration-200 active:scale-95">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-blue-500/40">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </div>
                <ChevronDown size={16} className="text-gray-600 hidden md:block transition-transform duration-200 group-hover:rotate-180" />
              </button>

              <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-gray-200/60 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 overflow-hidden">
                <div className="p-5 border-b border-gray-200/60 bg-gradient-to-br from-gray-50 to-white">
                  <p className="font-semibold text-gray-900 text-base">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
                </div>
                <div className="py-2">
                  <button className="w-full text-left px-5 py-3 hover:bg-gray-50/80 transition-all duration-200 text-gray-800 text-sm font-medium">
                    Profil
                  </button>
                  <button className="w-full text-left px-5 py-3 hover:bg-gray-50/80 transition-all duration-200 text-gray-800 text-sm font-medium">
                    Paramètres
                  </button>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-5 py-3 hover:bg-red-50/80 transition-all duration-200 text-red-600 border-t border-gray-200/60 text-sm font-medium flex items-center gap-2.5"
                >
                  <LogOut size={16} />
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-200/60 bg-white/95 backdrop-blur-2xl shadow-xl">
            <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={item.onClick}
                    className="w-full flex items-center gap-4 p-3.5 hover:bg-gray-50/80 rounded-2xl transition-all duration-200 text-gray-800 group active:scale-98"
                  >
                    <div className={`p-2.5 rounded-xl bg-${item.color}-100 group-hover:scale-110 transition-transform duration-200 shadow-sm`}>
                      <Icon size={20} className={`text-${item.color}-600`} />
                    </div>
                    <span className="font-medium text-sm">{item.label}</span>
                  </button>
                );
              })}

              {adminItems.length > 0 && (
                <>
                  <div className="border-t border-gray-200/60 my-3"></div>
                  {adminItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.label}
                        onClick={item.onClick}
                        className="w-full flex items-center gap-4 p-3.5 hover:bg-red-50/80 rounded-2xl transition-all duration-200 text-gray-800 group active:scale-98"
                      >
                        <div className={`p-2.5 rounded-xl bg-${item.color}-100 group-hover:scale-110 transition-transform duration-200 shadow-sm`}>
                          <Icon size={20} className={`text-${item.color}-600`} />
                        </div>
                        <span className="font-medium text-sm">{item.label}</span>
                      </button>
                    );
                  })}
                </>
              )}

              <div className="border-t border-gray-200/60 my-3"></div>
              <button className="w-full flex items-center gap-4 p-3.5 hover:bg-gray-50/80 rounded-2xl transition-all duration-200 text-gray-800 group active:scale-98">
                <div className="p-2.5 rounded-xl bg-gray-100 group-hover:scale-110 group-hover:rotate-90 transition-all duration-200 shadow-sm">
                  <Settings size={20} className="text-gray-600" />
                </div>
                <span className="font-medium text-sm">Paramètres</span>
              </button>
            </div>
          </div>
        )}
      </header>

      <div className="flex">
        {/* Sidebar - Style iOS 26 Premium - Réduit */}
        <aside className="hidden lg:flex lg:flex-col w-72 bg-white/50 via-white/30 to-white/20 backdrop-blur-3xl border-r border-white/40 sticky top-20 h-screen overflow-y-auto shadow-2xl shadow-black/5" style={{background: 'linear-gradient(to bottom, rgba(255,255,255,0.5), rgba(255,255,255,0.3), rgba(255,255,255,0.2)'}}>
          {/* Top Gradient Accent */}
          <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none" style={{background: 'linear-gradient(to bottom, rgba(59,130,246,0.04), transparent)'}}></div>
          
          <div className="relative p-5 space-y-2">
            {/* Section principale */}
            <div className="mb-2">
              <p className="text-xs font-black text-gray-400 uppercase tracking-[0.15em] px-3 mb-4 select-none opacity-80">
                Navigation
              </p>
              <div className="space-y-1">
                {navItems.map((item, idx) => {
                  const Icon = item.icon;
                  const isHovered = hoveredItem === item.label;
                  
                  const colorConfig = {
                    blue: { bgLight: 'rgba(191, 219, 254, 0.6)', bgDark: 'rgba(219, 234, 254, 0.4)', icon: 'text-blue-600', accentGradient: 'linear-gradient(to bottom, rgb(59, 130, 246), rgb(37, 99, 235))', shadowColor: 'rgba(59, 130, 246, 0.1)' },
                    indigo: { bgLight: 'rgba(199, 210, 254, 0.6)', bgDark: 'rgba(224, 231, 255, 0.4)', icon: 'text-indigo-600', accentGradient: 'linear-gradient(to bottom, rgb(79, 70, 229), rgb(67, 56, 202))', shadowColor: 'rgba(79, 70, 229, 0.1)' },
                    green: { bgLight: 'rgba(187, 247, 208, 0.6)', bgDark: 'rgba(220, 252, 231, 0.4)', icon: 'text-green-600', accentGradient: 'linear-gradient(to bottom, rgb(22, 163, 74), rgb(20, 148, 68))', shadowColor: 'rgba(22, 163, 74, 0.1)' },
                    purple: { bgLight: 'rgba(216, 180, 254, 0.6)', bgDark: 'rgba(243, 232, 255, 0.4)', icon: 'text-purple-600', accentGradient: 'linear-gradient(to bottom, rgb(147, 51, 234), rgb(126, 34, 206))', shadowColor: 'rgba(147, 51, 234, 0.1)' },
                    cyan: { bgLight: 'rgba(165, 243, 252, 0.6)', bgDark: 'rgba(207, 250, 254, 0.4)', icon: 'text-cyan-600', accentGradient: 'linear-gradient(to bottom, rgb(6, 182, 212), rgb(14, 165, 233))', shadowColor: 'rgba(6, 182, 212, 0.1)' },
                  };
                  const config = colorConfig[item.color] || colorConfig.blue;
                  
                  return (
                    <button
                      key={item.label}
                      onClick={item.onClick}
                      onMouseEnter={() => setHoveredItem(item.label)}
                      onMouseLeave={() => setHoveredItem(null)}
                      className="w-full group relative transition-all duration-300 ease-out"
                    >
                      {/* Animated background */}
                      <div 
                        className={`absolute inset-0 rounded-xl transition-all duration-300 ${
                          isHovered ? 'scale-100 shadow-lg' : 'scale-95 opacity-0'
                        }`}
                        style={{
                          background: isHovered ? `linear-gradient(135deg, ${config.bgLight}, ${config.bgDark})` : 'transparent',
                          boxShadow: isHovered ? `0 10px 15px -3px ${config.shadowColor}` : 'none'
                        }}
                      ></div>

                      {/* Shine effect */}
                      {isHovered && (
                        <div className="absolute inset-0 rounded-xl overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                        </div>
                      )}

                      <div className="relative flex items-center gap-2.5 p-2.5 rounded-xl">
                        {/* Icon Container */}
                        <div 
                          className={`p-2.5 rounded-lg backdrop-blur-xl transition-all duration-300 ease-out shrink-0 shadow-sm border border-white/40 ${
                            isHovered ? 'scale-110 shadow-lg' : 'scale-100'
                          }`}
                          style={{
                            background: `linear-gradient(135deg, ${config.bgLight}, ${config.bgDark})`
                          }}
                        >
                          <Icon size={18} className={`${config.icon} transition-all duration-300 ${isHovered ? 'scale-110' : 'scale-100'}`} />
                        </div>

                        {/* Label */}
                        <span className={`font-semibold text-xs flex-1 text-left transition-all duration-300 ${
                          isHovered ? 'text-gray-900 translate-x-1' : 'text-gray-700'
                        }`}>
                          {item.label}
                        </span>

                        {/* Right accent indicator */}
                        {isHovered && (
                          <div 
                            className="w-1.5 h-6 rounded-full shadow-lg transition-all duration-300 scale-y-100 origin-center"
                            style={{
                              background: config.accentGradient,
                              boxShadow: `0 10px 15px -3px ${config.shadowColor}`
                            }}
                          ></div>
                        )}

                        {/* Floating badge for new items */}
                        {idx === 0 && (
                          <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full shadow-lg shadow-blue-500/50 animate-pulse border border-white"></div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px my-4 bg-gradient-to-r from-transparent via-gray-300/40 to-transparent"></div>

            {/* Section Admin */}
            {adminItems.length > 0 && (
              <div className="mb-2">
                <div className="flex items-center gap-2 px-3 mb-3">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-[0.15em] select-none opacity-80">
                    Admin
                  </p>
                  <div className="h-px flex-1 bg-gradient-to-r from-red-300/30 to-transparent"></div>
                </div>
                <div className="space-y-1">
                  {adminItems.map((item) => {
                    const Icon = item.icon;
                    const isHovered = hoveredItem === item.label;
                    
                    return (
                      <button
                        key={item.label}
                        onClick={item.onClick}
                        onMouseEnter={() => setHoveredItem(item.label)}
                        onMouseLeave={() => setHoveredItem(null)}
                        className="w-full group relative transition-all duration-300 ease-out"
                      >
                        {/* Animated background */}
                        <div 
                          className={`absolute inset-0 rounded-xl transition-all duration-300 ${
                            isHovered ? 'scale-100 shadow-lg' : 'scale-95 opacity-0'
                          }`}
                          style={{
                            background: isHovered ? 'linear-gradient(135deg, rgba(254, 205, 211, 0.6), rgba(255, 228, 230, 0.4))' : 'transparent',
                            boxShadow: isHovered ? '0 10px 15px -3px rgba(244, 63, 94, 0.1)' : 'none'
                          }}
                        ></div>

                        {/* Shine effect */}
                        {isHovered && (
                          <div className="absolute inset-0 rounded-xl overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                          </div>
                        )}

                        <div className="relative flex items-center gap-2.5 p-2.5 rounded-xl">
                          {/* Icon Container */}
                          <div 
                            className={`p-2.5 rounded-lg backdrop-blur-xl transition-all duration-300 ease-out shrink-0 shadow-sm border border-white/40 ${
                              isHovered ? 'scale-110 shadow-lg' : 'scale-100'
                            }`}
                            style={{
                              background: 'linear-gradient(135deg, rgba(254, 205, 211, 0.6), rgba(255, 228, 230, 0.4))'
                            }}
                          >
                            <Icon size={18} className={`text-red-600 transition-all duration-300 ${isHovered ? 'scale-110' : 'scale-100'}`} />
                          </div>

                          {/* Label */}
                          <span className={`font-semibold text-xs flex-1 text-left transition-all duration-300 ${
                            isHovered ? 'text-gray-900 translate-x-1' : 'text-gray-700'
                          }`}>
                            {item.label}
                          </span>

                          {/* Right accent indicator */}
                          {isHovered && (
                            <div 
                              className="w-1.5 h-6 rounded-full shadow-lg transition-all duration-300 scale-y-100 origin-center"
                              style={{
                                background: 'linear-gradient(to bottom, rgb(239, 68, 68), rgb(244, 63, 94))',
                                boxShadow: '0 10px 15px -3px rgba(244, 63, 94, 0.1)'
                              }}
                            ></div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="h-px my-4 bg-gradient-to-r from-transparent via-gray-300/40 to-transparent"></div>

            {/* Settings Section */}
            <div>
              <button 
                onMouseEnter={() => setHoveredItem('settings')}
                onMouseLeave={() => setHoveredItem(null)}
                className="w-full group relative transition-all duration-300 ease-out"
              >
                {/* Animated background */}
                <div 
                  className={`absolute inset-0 rounded-xl transition-all duration-300 ${
                    hoveredItem === 'settings' ? 'scale-100 shadow-lg' : 'scale-95 opacity-0'
                  }`}
                  style={{
                    background: hoveredItem === 'settings' ? 'linear-gradient(135deg, rgba(243, 244, 246, 0.6), rgba(249, 250, 251, 0.4))' : 'transparent',
                    boxShadow: hoveredItem === 'settings' ? '0 10px 15px -3px rgba(107, 114, 128, 0.1)' : 'none'
                  }}
                ></div>

                {/* Shine effect */}
                {hoveredItem === 'settings' && (
                  <div className="absolute inset-0 rounded-xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                  </div>
                )}

                <div className="relative flex items-center gap-2.5 p-2.5 rounded-xl">
                  {/* Icon Container */}
                  <div 
                    className={`p-2.5 rounded-lg backdrop-blur-xl transition-all duration-300 ease-out shrink-0 shadow-sm border border-white/40 ${
                      hoveredItem === 'settings' ? 'scale-110 shadow-lg rotate-90' : 'scale-100'
                    }`}
                    style={{
                      background: 'linear-gradient(135deg, rgba(243, 244, 246, 0.6), rgba(249, 250, 251, 0.4))'
                    }}
                  >
                    <Settings size={18} className="text-gray-600 transition-all duration-300" />
                  </div>

                  {/* Label */}
                  <span className={`font-semibold text-xs flex-1 text-left transition-all duration-300 ${
                    hoveredItem === 'settings' ? 'text-gray-900 translate-x-1' : 'text-gray-700'
                  }`}>
                    Paramètres
                  </span>

                  {/* Right accent indicator */}
                  {hoveredItem === 'settings' && (
                    <div 
                      className="w-1.5 h-6 rounded-full shadow-lg transition-all duration-300 scale-y-100 origin-center"
                      style={{
                        background: 'linear-gradient(to bottom, rgb(107, 114, 128), rgb(75, 85, 99))',
                        boxShadow: '0 10px 15px -3px rgba(107, 114, 128, 0.1)'
                      }}
                    ></div>
                  )}
                </div>
              </button>
            </div>

            {/* Bottom Accent */}
            <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none rounded-bl-3xl" style={{background: 'linear-gradient(to top, rgba(107,114,128,0.08), transparent)'}}></div>
          </div>
        </aside>

        <main className="flex-1 w-full">
          {children}
        </main>
      </div>

      {/* Message Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-end z-50 animate-in fade-in duration-300">
          <div className="bg-white/95 backdrop-blur-2xl w-full md:w-96 h-96 rounded-t-3xl flex flex-col shadow-2xl border-t border-gray-200/60 animate-in slide-in-from-bottom duration-300">
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 text-white p-5 flex justify-between items-center rounded-t-3xl shadow-xl">
              <p className="font-semibold text-lg">{selectedMessage.sender}</p>
              <button
                onClick={() => setSelectedMessage(null)}
                className="hover:bg-white/20 p-2 rounded-xl transition-all duration-200 active:scale-95"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-50/50 to-white">
              <p className="text-sm text-gray-500 text-center">
                Conversation avec {selectedMessage.sender}
              </p>
            </div>
            <div className="border-t border-gray-200/60 p-4 flex gap-3 bg-white/80 backdrop-blur-xl">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Votre message..."
                className="flex-1 border border-gray-300/60 rounded-2xl px-5 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 bg-gray-50/60 text-sm"
              />
              <button
                onClick={handleSendMessage}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-2xl hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-200 active:scale-95"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}