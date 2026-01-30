import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  BarChart3, Users, Calendar, FileText, Vote, MessageSquare, LogOut, Menu, X, 
  ClipboardList, ChevronDown, Settings, Home 
} from 'lucide-react';

export default function AdminLayout({ children, pageTitle }) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: BarChart3, path: '/admin' },
    { id: 'users', label: 'Utilisateurs', icon: Users, path: '/admin/users' },
    { id: 'events', label: 'Événements', icon: Calendar, path: '/admin/events' },
    { id: 'polls', label: 'Sondages', icon: FileText, path: '/admin/polls' },
    { id: 'forms', label: 'Formulaires', icon: ClipboardList, path: '/admin/forms' },
    { id: 'votes', label: 'Votes', icon: Vote, path: '/admin/votes' },
    { id: 'posts', label: 'Publications', icon: MessageSquare, path: '/admin/posts' },
  ];

  return (
    <div className="max-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100 ">
      {/* Header - Fixed, Full Width */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-gray-200/40 shadow-sm h-16 md:h-20">
        <div className="flex items-center justify-between px-3 md:px-6 h-full">
          {/* Menu Toggle Button for Mobile */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100/50 rounded-lg transition-all duration-200 text-gray-700 md:hidden"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Page Title */}
          <div className="flex-1 mx-3 md:mx-0">
            <h2 className="text-xl md:text-3xl font-bold text-gray-900 truncate">{pageTitle || 'Administration'}</h2>
            <p className="text-xs md:text-sm text-gray-500 mt-0 md:mt-0.5 hidden md:block"><span className="font-semibold">{user?.firstName}</span></p>
          </div>

          {/* User Menu */}
          <div className="relative ml-2 md:ml-4">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 md:gap-3 px-2 md:px-4 py-2 hover:bg-gray-100/50 rounded-xl transition-all duration-200 group"
            >
              <div className="w-8 md:w-10 h-8 md:h-10 bg-gradient-to-br from-[#2E7379] to-teal-500 rounded-full flex items-center justify-center font-bold text-white shadow-md text-xs md:text-sm flex-shrink-0">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm font-semibold text-gray-900 line-clamp-1">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-gray-500 font-medium">{user?.role}</p>
              </div>
              <ChevronDown size={18} className={`text-gray-700 transition-transform duration-300 hidden md:block ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 md:mt-3 w-48 md:w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl z-50 border border-gray-200/60 overflow-hidden">
                <button
                  onClick={() => {
                    navigate('/dashboard');
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-3 md:px-4 py-2 md:py-3 hover:bg-gray-50 text-gray-800 transition-colors font-medium text-xs md:text-sm flex items-center gap-2 md:gap-3"
                >
                  <Home size={16} className="text-gray-600" />
                  <span className="truncate">Retour à l'accueil</span>
                </button>
                <button
                  onClick={() => {
                    navigate('/profile');
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-3 md:px-4 py-2 md:py-3 hover:bg-gray-50 text-gray-800 transition-colors font-medium text-xs md:text-sm flex items-center gap-2 md:gap-3"
                >
                  <Settings size={16} className="text-gray-600" />
                  <span className="truncate">Mon Profil</span>
                </button>
                <hr className="border-gray-200/40" />
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 md:px-4 py-2 md:py-3 hover:bg-red-50 text-red-600 transition-colors font-medium text-xs md:text-sm flex items-center gap-2 md:gap-3"
                >
                  <LogOut size={16} />
                  <span className="truncate">Déconnexion</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Sidebar - Fixed positioning on desktop, mobile overlay */}
      <aside
        className={`fixed left-0 top-16 md:top-20 bottom-0 bg-white/50 backdrop-blur-xl border-r border-gray-200/40 z-40 transition-all duration-300 ease-out w-64 flex flex-col overflow-hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        {/* Logo Section */}
        <div className="p-3 md:p-4 flex items-center justify-between border-b border-gray-200/40 flex-shrink-0">
          <h1 className="font-bold text-lg md:text-xl text-[#2E7379] whitespace-nowrap">
            RISE
          </h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 hover:bg-gray-100/50 rounded-lg transition-all duration-200 text-gray-700 md:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="mt-3 md:mt-4 space-y-1 px-2 overflow-hidden flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = window.location.pathname === item.path;
            return (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl transition-all duration-200 font-medium text-sm group ${
                  isActive
                    ? 'bg-[#2E7379]/15 text-[#2E7379] border-l-2 border-l-[#2E7379]'
                    : 'text-gray-700 hover:bg-gray-100/50 hover:text-[#2E7379]'
                }`}
              >
                <Icon size={20} className="flex-shrink-0 transition-transform group-hover:scale-110" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout Button - Bottom */}
        <div className="p-3 md:p-4 bg-white/30 backdrop-blur-lg border-t border-gray-200/40 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 md:px-4 py-2 md:py-3 bg-red-600/10 hover:bg-red-600/20 rounded-xl transition-all duration-200 text-red-600 font-semibold group"
          >
            <LogOut size={20} className="flex-shrink-0 transition-transform group-hover:scale-110" />
            <span className="truncate">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden top-16"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Container */}
      <div className="pt-16 md:pt-20 md:ml-64">
        {/* Page Content - Takes full width on mobile, remaining space on desktop */}
        <main className="px-3 md:px-6 lg:px-8 py-4 md:py-8 min-h-[calc(100vh-80px)]">
          {children}
        </main>
      </div>
    </div>
  );
}
