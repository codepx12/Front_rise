import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Trash2, Edit2, Plus, Eye, Users, Calendar, Clock, BarChart3, CheckCircle, MapPin } from 'lucide-react';
import apiClient, { getImageUrl } from '../services/api';
import AdminLayout from '../components/AdminLayout';

export default function AdminEventsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    if (user?.role !== 'Admin') {
      navigate('/dashboard');
    }
    fetchEvents();
  }, [user, navigate]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/events/admin/all');
      setEvents(response.data);
      setError(null);
    } catch (error) {
      console.error('Erreur:', error);
      setError('Impossible de charger les événements');
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishEvent = async (eventId) => {
    try {
      await apiClient.post(`/events/${eventId}/publish`);
      setEvents(events.map(e => e.id === eventId ? { ...e, isPublished: true } : e));
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors de la publication de l\'événement');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await apiClient.delete(`/events/${eventId}`);
      setEvents(events.filter(e => e.id !== eventId));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors de la suppression de l\'événement');
    }
  };

  const getAnalytics = () => {
    const total = events.length;
    const published = events.filter(e => e.isPublished).length;
    const drafts = total - published;
    const totalParticipants = events.reduce((sum, e) => sum + (e.registeredCount || 0), 0);
    const avgParticipants = total > 0 ? Math.round(totalParticipants / total) : 0;

    const byType = {};
    events.forEach(e => {
      byType[e.type] = (byType[e.type] || 0) + 1;
    });

    const now = new Date();
    const upcoming = events.filter(e => new Date(e.startDate) > now).length;
    const past = events.filter(e => new Date(e.startDate) <= now).length;

    return {
      total,
      published,
      drafts,
      totalParticipants,
      avgParticipants,
      byType,
      upcoming,
      past
    };
  };

  if (loading) {
    return (
      <AdminLayout pageTitle="Gestion des Événements">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-slate-300 border-t-slate-600 animate-spin"></div>
            <p className="text-gray-600 font-medium">Chargement des événements...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const analytics = getAnalytics();

  return (
    <AdminLayout pageTitle="Gestion des Événements">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Gestion des Événements</h2>
            <p className="text-gray-600 text-sm mt-1">Créez et gérez vos événements</p>
          </div>
          <button
            onClick={() => navigate('/admin/events/create')}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-800 hover:to-slate-700 rounded-xl transition font-semibold text-white shadow-lg backdrop-blur-sm border border-slate-600/30 text-sm md:text-base whitespace-nowrap"
          >
            <Plus size={18} /> <span className="hidden sm:inline">Créer Événement</span><span className="sm:hidden">+</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-50/60 backdrop-blur-lg border border-red-200/40 border-l-4 border-l-red-600 text-red-700 px-6 py-4 rounded-2xl mb-8 shadow-sm">
            <p className="font-semibold">Erreur</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {events.length === 0 ? (
          <div className="text-center py-20 bg-gradient-to-br from-slate-50/40 to-white/30 backdrop-blur-xl rounded-3xl border border-slate-200/40 shadow-sm">
            <Calendar className="mx-auto mb-4 text-slate-400" size={48} />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Aucun événement créé</h2>
            <p className="text-gray-600 mb-8">Commencez par créer votre premier événement</p>
            <button
              onClick={() => navigate('/admin/events/create')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-800 hover:to-slate-700 rounded-xl transition text-white font-semibold shadow-lg backdrop-blur-sm border border-slate-600/30"
            >
              <Plus size={18} /> Créer un événement
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Liste des événements */}
            <div className="lg:col-span-2 space-y-4">
              {events.map((e) => (
                <div
                  key={e.id}
                  className="group bg-white/30 backdrop-blur-xl rounded-2xl overflow-hidden border border-slate-200/40 shadow-sm hover:shadow-lg hover:bg-white/40 transition-all duration-300"
                >
                  {/* Header avec gradient subtil */}
                  <div className="bg-gradient-to-r from-slate-100/40 to-slate-50/30 backdrop-blur-sm border-b border-slate-200/30 px-6 py-4">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <h3 className="text-lg md:text-xl font-bold text-gray-900">{e.name}</h3>
                      </div>
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex-shrink-0 ${
                        e.isPublished 
                          ? 'bg-emerald-100/60 text-emerald-700 border border-emerald-200/40' 
                          : 'bg-amber-100/60 text-amber-700 border border-amber-200/40'
                      }`}>
                        {e.isPublished ? '🟢 Publié' : '⏸️ Brouillon'}
                      </span>
                    </div>
                    {e.description && (
                      <p className="text-sm text-gray-600 line-clamp-1">{e.description}</p>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-5">
                    {/* Info Grid - Plus épuré */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Calendar size={16} />
                          <p className="text-xs font-semibold uppercase">Date</p>
                        </div>
                        <p className="font-semibold text-gray-900 text-sm">
                          {new Date(e.startDate).toLocaleDateString('fr-FR', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Users size={16} />
                          <p className="text-xs font-semibold uppercase">Inscrits</p>
                        </div>
                        <p className="font-semibold text-gray-900 text-sm">
                          {e.registeredCount}/{e.maxParticipants || '∞'}
                        </p>
                      </div>
                      {e.location && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-slate-600">
                            <MapPin size={16} />
                            <p className="text-xs font-semibold uppercase">Lieu</p>
                          </div>
                          <p className="font-semibold text-gray-900 text-sm truncate">
                            {e.location}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons - Mieux organisés */}
                    <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-200/30">
                      {e.registeredCount > 0 && (
                        <button
                          onClick={() => navigate(`/admin/events/${e.id}/registrations`)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-50/60 backdrop-blur-sm hover:bg-blue-100/60 rounded-lg transition text-sm font-semibold text-blue-700 border border-blue-200/40"
                        >
                          <Users size={16} />
                          <span>{e.registeredCount} inscrit{e.registeredCount > 1 ? 's' : ''}</span>
                        </button>
                      )}
                      {!e.isPublished && (
                        <button
                          onClick={() => handlePublishEvent(e.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-emerald-50/60 backdrop-blur-sm hover:bg-emerald-100/60 rounded-lg transition text-sm font-semibold text-emerald-700 border border-emerald-200/40"
                        >
                          <CheckCircle size={16} />
                          <span>Publier</span>
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/admin/events/edit/${e.id}`)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100/60 backdrop-blur-sm hover:bg-slate-200/60 rounded-lg transition text-sm font-semibold text-slate-700 border border-slate-200/40"
                      >
                        <Edit2 size={16} />
                        <span>Éditer</span>
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(e.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50/60 backdrop-blur-sm hover:bg-red-100/60 rounded-lg transition text-sm font-semibold text-red-700 border border-red-200/40 ml-auto"
                      >
                        <Trash2 size={16} />
                        <span>Supprimer</span>
                      </button>
                    </div>

                    {/* Delete Confirmation */}
                    {deleteConfirm === e.id && (
                      <div className="p-4 bg-red-50/60 backdrop-blur-sm border border-red-200/40 border-l-4 border-l-red-600 rounded-xl">
                        <p className="text-red-900 font-semibold mb-3 text-sm">
                          Êtes-vous sûr de vouloir supprimer cet événement?
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDeleteEvent(e.id)}
                            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition font-semibold text-white text-sm shadow-sm"
                          >
                            Supprimer
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="flex-1 px-4 py-2 bg-slate-200/60 hover:bg-slate-300/60 rounded-lg transition text-gray-900 font-semibold border border-slate-300/40 text-sm"
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Analytics Sidebar - Plus épuré */}
            <div className="lg:col-span-1 space-y-4">
              {/* Total Card */}
              <div className="bg-white/30 backdrop-blur-xl rounded-2xl border border-slate-200/40 p-6 shadow-sm hover:shadow-md transition">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs text-slate-600 font-semibold uppercase tracking-wide">Total</p>
                    <p className="text-4xl font-bold text-gray-900 mt-3">{analytics.total}</p>
                    <p className="text-xs text-slate-600 mt-2">événements créés</p>
                  </div>
                  <div className="w-12 h-12 bg-slate-100/60 backdrop-blur-sm rounded-xl flex items-center justify-center border border-slate-200/40">
                    <Calendar size={24} className="text-slate-600" />
                  </div>
                </div>
              </div>

              {/* Published Card */}
              <div className="bg-white/30 backdrop-blur-xl rounded-2xl border border-slate-200/40 p-6 shadow-sm hover:shadow-md transition">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs text-slate-600 font-semibold uppercase tracking-wide">Publiés</p>
                    <p className="text-4xl font-bold text-gray-900 mt-3">{analytics.published}</p>
                    <p className="text-xs text-slate-600 mt-2">{analytics.drafts} brouillon{analytics.drafts > 1 ? 's' : ''}</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-100/60 backdrop-blur-sm rounded-xl flex items-center justify-center border border-emerald-200/40">
                    <CheckCircle size={24} className="text-emerald-600" />
                  </div>
                </div>
              </div>

              {/* Participants Card */}
              <div className="bg-white/30 backdrop-blur-xl rounded-2xl border border-slate-200/40 p-6 shadow-sm hover:shadow-md transition">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs text-slate-600 font-semibold uppercase tracking-wide">Participants</p>
                    <p className="text-4xl font-bold text-gray-900 mt-3">{analytics.totalParticipants}</p>
                    <p className="text-xs text-slate-600 mt-2">Moy: {analytics.avgParticipants}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100/60 backdrop-blur-sm rounded-xl flex items-center justify-center border border-blue-200/40">
                    <Users size={24} className="text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Timeline Card */}
              <div className="bg-white/30 backdrop-blur-xl rounded-2xl border border-slate-200/40 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-10 h-10 bg-slate-100/60 backdrop-blur-sm rounded-lg flex items-center justify-center border border-slate-200/40">
                    <Clock size={20} className="text-slate-600" />
                  </div>
                  <p className="text-xs text-slate-600 font-semibold uppercase tracking-wide">Timeline</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <p className="text-xs text-slate-600 font-medium">À venir</p>
                      <p className="text-sm font-bold text-gray-900">{analytics.upcoming}</p>
                    </div>
                    <div className="h-2 bg-slate-200/40 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-500" 
                        style={{ width: `${analytics.total > 0 ? (analytics.upcoming / analytics.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <p className="text-xs text-slate-600 font-medium">Passés</p>
                      <p className="text-sm font-bold text-gray-900">{analytics.past}</p>
                    </div>
                    <div className="h-2 bg-slate-200/40 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-slate-400" 
                        style={{ width: `${analytics.total > 0 ? (analytics.past / analytics.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Types Card */}
              <div className="bg-white/30 backdrop-blur-xl rounded-2xl border border-slate-200/40 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-10 h-10 bg-slate-100/60 backdrop-blur-sm rounded-lg flex items-center justify-center border border-slate-200/40">
                    <BarChart3 size={20} className="text-slate-600" />
                  </div>
                  <p className="text-xs text-slate-600 font-semibold uppercase tracking-wide">Par Type</p>
                </div>
                <div className="space-y-2">
                  {Object.entries(analytics.byType).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between py-2 border-b border-slate-200/30 last:border-0">
                      <span className="text-sm text-slate-700">{type}</span>
                      <span className="px-3 py-1 bg-slate-100/60 text-gray-900 text-xs font-bold rounded-lg border border-slate-200/40">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
