import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Users, Calendar, FileText, Vote, ClipboardList, TrendingUp, ArrowUpRight, ArrowDownRight, Bell } from 'lucide-react';
import apiClient from '../services/api';
import AdminLayout from '../components/AdminLayout';

function MetricCard({ label, value, icon: Icon, trend }) {
  const isPositive = trend >= 0;
  
  return (
    <div className="bg-white/30 backdrop-blur-xl rounded-2xl border border-slate-200/40 p-6 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-slate-600 font-semibold uppercase tracking-wide">{label}</p>
          <p className="text-3xl md:text-4xl font-bold text-gray-900 mt-3">{value}</p>
        </div>
        <div className="w-12 h-12 bg-slate-100/60 backdrop-blur-sm rounded-xl flex items-center justify-center border border-slate-200/40">
          <Icon size={24} className="text-slate-600" />
        </div>
      </div>
      <div className="flex items-center gap-1 text-xs">
        {isPositive ? (
          <ArrowUpRight size={16} className="text-emerald-600" />
        ) : (
          <ArrowDownRight size={16} className="text-slate-400" />
        )}
        <span className={isPositive ? 'text-emerald-600 font-semibold' : 'text-slate-600'}>
          {Math.abs(trend)}% vs mois dernier
        </span>
      </div>
    </div>
  );
}

function NotificationBar({ label, value, max }) {
  const percentage = max > 0 ? (value / max) * 100 : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-900">{label}</span>
        <span className="text-sm font-semibold text-slate-700">{value}</span>
      </div>
      <div className="w-full h-2 bg-slate-200/40 rounded-full overflow-hidden">
        <div
          className="h-full bg-slate-600 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

function ContentItem({ label, value }) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-100/40 rounded-lg border border-slate-200/30">
      <span className="text-sm font-medium text-gray-900">{label}</span>
      <span className="text-lg font-bold text-slate-700">{value}</span>
    </div>
  );
}

function QuickActionCard({ label, icon: Icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-white/30 backdrop-blur-xl rounded-2xl border border-slate-200/40 p-6 shadow-sm hover:shadow-md hover:bg-white/40 transition-all duration-300 flex flex-col items-center justify-center gap-3 group"
    >
      <div className="w-12 h-12 bg-slate-100/60 backdrop-blur-sm rounded-xl flex items-center justify-center border border-slate-200/40 group-hover:bg-slate-200/60 transition">
        <Icon size={24} className="text-slate-600" />
      </div>
      <span className="text-sm font-semibold text-gray-900 text-center">{label}</span>
    </button>
  );
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    totalPolls: 0,
    totalVotes: 0,
    totalForms: 0,
    studentCount: 0,
    professorCount: 0,
    adminCount: 0,
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.role !== 'Admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsResponse, usersResponse] = await Promise.all([
          apiClient.get('/admin/statistics'),
          apiClient.get('/admin/users'),
        ]);
        setStats(statsResponse.data);
        setUsers(usersResponse.data);
        setError(null);
      } catch (err) {
        console.error('Erreur:', err);
        setError('Impossible de charger les données');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <AdminLayout pageTitle="Tableau de Bord">
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-slate-300 border-t-slate-600 animate-spin"></div>
            <p className="text-gray-600 font-medium">Chargement des données...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const totalContent = (stats.totalEvents || 0) + (stats.totalPolls || 0) + (stats.totalForms || 0) + (stats.totalVotes || 0);

  return (
    <AdminLayout pageTitle="Tableau de Bord">
      <div className="w-full max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Tableau de Bord</h1>
          <p className="text-gray-600 text-sm mt-2">Bienvenue, {user?.firstName}</p>
        </div>

        {error && (
          <div className="bg-red-50/60 backdrop-blur-lg border border-red-200/40 border-l-4 border-l-red-600 text-red-700 px-6 py-4 rounded-2xl mb-8 shadow-sm">
            <p className="font-semibold text-sm">{error}</p>
          </div>
        )}

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            label="Utilisateurs"
            value={stats.totalUsers}
            icon={Users}
            trend={5}
          />
          <MetricCard
            label="Événements"
            value={stats.totalEvents}
            icon={Calendar}
            trend={2}
          />
          <MetricCard
            label="Formulaires"
            value={stats.totalForms || 0}
            icon={ClipboardList}
            trend={-1}
          />
          <MetricCard
            label="Contenu Total"
            value={totalContent}
            icon={TrendingUp}
            trend={8}
          />
        </div>

        {/* Charts and Analytics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          {/* Notifications Analysis Chart */}
          <div className="lg:col-span-2 bg-white/30 backdrop-blur-xl rounded-2xl border border-slate-200/40 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Bell size={20} className="text-slate-600" />
              <h3 className="text-lg font-bold text-gray-900">Analyse des Notifications</h3>
            </div>
            <div className="space-y-5">
              <NotificationBar 
                label="Événements" 
                value={stats.totalEvents || 0}
                max={Math.max(stats.totalEvents || 0, stats.totalForms || 0, stats.totalPolls || 0, stats.totalVotes || 0) || 10}
              />
              <NotificationBar 
                label="Formulaires" 
                value={stats.totalForms || 0}
                max={Math.max(stats.totalEvents || 0, stats.totalForms || 0, stats.totalPolls || 0, stats.totalVotes || 0) || 10}
              />
              <NotificationBar 
                label="Sondages" 
                value={stats.totalPolls || 0}
                max={Math.max(stats.totalEvents || 0, stats.totalForms || 0, stats.totalPolls || 0, stats.totalVotes || 0) || 10}
              />
              <NotificationBar 
                label="Votes" 
                value={stats.totalVotes || 0}
                max={Math.max(stats.totalEvents || 0, stats.totalForms || 0, stats.totalPolls || 0, stats.totalVotes || 0) || 10}
              />
            </div>
          </div>

          {/* Content Overview */}
          <div className="bg-white/30 backdrop-blur-xl rounded-2xl border border-slate-200/40 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Contenu</h3>
            <div className="space-y-3">
              <ContentItem label="Événements" value={stats.totalEvents} />
              <ContentItem label="Formulaires" value={stats.totalForms || 0} />
              <ContentItem label="Sondages" value={stats.totalPolls} />
              <ContentItem label="Votes" value={stats.totalVotes} />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <QuickActionCard
            label="Créer Événement"
            icon={Calendar}
            onClick={() => navigate('/admin/events/create')}
          />
          <QuickActionCard
            label="Créer Formulaire"
            icon={ClipboardList}
            onClick={() => navigate('/admin/forms/create')}
          />
          <QuickActionCard
            label="Créer Sondage"
            icon={FileText}
            onClick={() => navigate('/admin/polls/create')}
          />
          <QuickActionCard
            label="Créer Vote"
            icon={Vote}
            onClick={() => navigate('/admin/votes/create')}
          />
        </div>

        {/* Users Table */}
        <div className="bg-white/30 backdrop-blur-xl rounded-2xl border border-slate-200/40 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-200/30">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Utilisateurs Récents</h3>
              <button
                onClick={() => navigate('/admin/users')}
                className="text-slate-600 hover:text-slate-900 text-sm font-semibold transition"
              >
                Voir tous →
              </button>
            </div>
          </div>
          
          {users.length === 0 ? (
            <div className="p-12 text-center text-gray-600">Aucun utilisateur trouvé</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-100/40 border-b border-slate-200/30">
                  <tr>
                    <th className="text-left py-3 px-6 font-semibold text-slate-700">Nom</th>
                    <th className="hidden sm:table-cell text-left py-3 px-6 font-semibold text-slate-700">Email</th>
                    <th className="text-left py-3 px-6 font-semibold text-slate-700">Rôle</th>
                    <th className="hidden md:table-cell text-left py-3 px-6 font-semibold text-slate-700">Classe</th>
                    <th className="hidden lg:table-cell text-left py-3 px-6 font-semibold text-slate-700">Inscription</th>
                  </tr>
                </thead>
                <tbody>
                  {users.slice(0, 5).map((u) => (
                    <tr key={u.id} className="border-b border-slate-200/20 hover:bg-slate-100/30 transition">
                      <td className="py-3 px-6 font-medium text-gray-900">{u.firstName} {u.lastName}</td>
                      <td className="hidden sm:table-cell py-3 px-6 text-slate-600 text-xs">{u.email}</td>
                      <td className="py-3 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${
                          u.role === 'Admin' ? 'bg-slate-200/60 text-slate-900' :
                          u.role === 'Professor' ? 'bg-slate-300/60 text-slate-900' :
                          'bg-slate-100/60 text-slate-700'
                        }`}>
                          {u.role === 'Admin' ? 'Admin' :
                           u.role === 'Professor' ? 'Prof' : 'Étud.'}
                        </span>
                      </td>
                      <td className="hidden md:table-cell py-3 px-6 text-slate-600 text-xs">{u.classe || '-'}</td>
                      <td className="hidden lg:table-cell py-3 px-6 text-slate-600 text-xs">
                        {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
