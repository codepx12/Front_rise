import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Trash2, Edit2, Plus, BarChart3, FileText } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';

export default function AdminPollsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'Admin') {
      navigate('/dashboard');
    }
    fetchPolls();
  }, [user, navigate]);

  const fetchPolls = async () => {
    try {
      setLoading(true);
      // Appel API à implémenter
      setLoading(false);
    } catch (error) {
      console.error('Erreur:', error);
      setLoading(false);
    }
  };

  const handleDeletePoll = async (pollId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce sondage ?')) {
      try {
        // await apiClient.delete(`/polls/${pollId}`);
        setPolls(polls.filter(p => p.id !== pollId));
      } catch (error) {
        console.error('Erreur:', error);
      }
    }
  };

  if (loading) {
    return (
      <AdminLayout pageTitle="Gestion des Sondages">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-teal-200 border-t-teal-600 animate-spin"></div>
            <p className="text-gray-600 font-medium">Chargement des sondages...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="Gestion des Sondages">
      <div className="w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4 mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Liste des Sondages</h2>
          <button
            onClick={() => navigate('/admin/polls/create')}
            className="flex items-center gap-2 px-3 md:px-6 py-2 md:py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 rounded-xl transition font-semibold text-white shadow-lg backdrop-blur-sm border border-purple-400/30 text-sm md:text-base whitespace-nowrap"
          >
            <Plus size={18} className="md:size-5" /> <span className="hidden sm:inline">Créer Sondage</span><span className="sm:hidden">+</span>
          </button>
        </div>

        {polls.length === 0 ? (
          <div className="text-center py-12 md:py-16 bg-gradient-to-br from-purple-50/40 to-white/30 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-purple-200/40 shadow-sm">
            <FileText className="mx-auto mb-4 text-purple-600" size={40} />
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">Aucun sondage créé</h2>
            <p className="text-sm md:text-base text-gray-600 mb-6">Commencez par créer votre premier sondage</p>
            <button
              onClick={() => navigate('/admin/polls/create')}
              className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 rounded-xl transition text-white font-semibold shadow-lg backdrop-blur-sm border border-purple-400/30 text-sm md:text-base"
            >
              Créer un sondage
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden sm:block bg-white/40 backdrop-blur-xl rounded-2xl md:rounded-3xl overflow-hidden border border-gray-200/40 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-purple-50/60 to-white/30 border-b border-gray-200/40">
                    <tr>
                      <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-gray-700">Titre</th>
                      <th className="hidden md:table-cell px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-gray-700">Public Ciblé</th>
                      <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-gray-700">Questions</th>
                      <th className="hidden lg:table-cell px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-gray-700">Réponses</th>
                      <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-gray-700">Statut</th>
                      <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {polls.map((p) => (
                      <tr key={p.id} className="border-b border-gray-200/40 hover:bg-purple-50/40 transition">
                        <td className="px-3 md:px-6 py-3 md:py-4 font-semibold text-gray-900 text-sm md:text-base">{p.title}</td>
                        <td className="hidden md:table-cell px-3 md:px-6 py-3 md:py-4">
                          <span className="inline-flex items-center px-2 md:px-3 py-1 bg-gradient-to-r from-blue-100/60 to-blue-50/40 text-blue-700 text-xs font-bold rounded-full border border-blue-200/40 backdrop-blur-sm">
                            {p.targetAudience === 'all' ? 'Tous' : 
                             p.targetAudience === 'students' ? 'Étud.' : 'Prof.'}
                          </span>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-gray-600 text-xs md:text-sm">{p.questions?.length || 0}</td>
                        <td className="hidden lg:table-cell px-3 md:px-6 py-3 md:py-4 text-gray-600 text-xs md:text-sm">{p.responseCount || 0}</td>
                        <td className="px-3 md:px-6 py-3 md:py-4">
                          <span className={`inline-flex items-center px-2 md:px-3 py-1 text-xs font-bold rounded-full border backdrop-blur-sm ${
                            p.isActive 
                              ? 'bg-emerald-100/60 text-emerald-700 border-emerald-200/40' 
                              : 'bg-red-100/60 text-red-700 border-red-200/40'
                          }`}>
                            {p.isActive ? '🟢' : '🔴'} <span className="hidden md:inline ml-1">{p.isActive ? 'Actif' : 'Fermé'}</span>
                          </span>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4">
                          <div className="flex gap-1 md:gap-2">
                            <button
                              onClick={() => navigate(`/admin/polls/results/${p.id}`)}
                              className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50/40 rounded-lg transition backdrop-blur-sm border border-purple-200/40"
                              title="Voir résultats"
                            >
                              <BarChart3 size={16} className="md:size-5" />
                            </button>
                            <button
                              onClick={() => navigate(`/admin/polls/edit/${p.id}`)}
                              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50/40 rounded-lg transition backdrop-blur-sm border border-blue-200/40"
                              title="Éditer"
                            >
                              <Edit2 size={16} className="md:size-5" />
                            </button>
                            <button
                              onClick={() => handleDeletePoll(p.id)}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50/40 rounded-lg transition backdrop-blur-sm border border-red-200/40"
                              title="Supprimer"
                            >
                              <Trash2 size={16} className="md:size-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="sm:hidden space-y-3">
              {polls.map((p) => (
                <div key={p.id} className="bg-white/40 backdrop-blur-xl rounded-xl border border-gray-200/40 p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{p.title}</h3>
                      <span className="inline-flex items-center px-2 py-1 mt-2 bg-gradient-to-r from-blue-100/60 to-blue-50/40 text-blue-700 text-xs font-bold rounded-full border border-blue-200/40 backdrop-blur-sm">
                        {p.targetAudience === 'all' ? 'Tous' : 
                         p.targetAudience === 'students' ? 'Étudiants' : 'Professeurs'}
                      </span>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-bold rounded-full border backdrop-blur-sm flex-shrink-0 ml-2 ${
                      p.isActive 
                        ? 'bg-emerald-100/60 text-emerald-700 border-emerald-200/40' 
                        : 'bg-red-100/60 text-red-700 border-red-200/40'
                    }`}>
                      {p.isActive ? '🟢' : '🔴'}
                    </span>
                  </div>
                  <div className="flex gap-2 text-xs text-gray-600 mb-3">
                    <span>❓ {p.questions?.length || 0} question(s)</span>
                    <span>💬 {p.responseCount || 0} réponse(s)</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/admin/polls/results/${p.id}`)}
                      className="flex-1 p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50/40 rounded-lg transition backdrop-blur-sm border border-purple-200/40 flex items-center justify-center gap-1 text-xs font-medium"
                    >
                      <BarChart3 size={14} /> Résultats
                    </button>
                    <button
                      onClick={() => navigate(`/admin/polls/edit/${p.id}`)}
                      className="flex-1 p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50/40 rounded-lg transition backdrop-blur-sm border border-blue-200/40 flex items-center justify-center gap-1 text-xs font-medium"
                    >
                      <Edit2 size={14} /> Éditer
                    </button>
                    <button
                      onClick={() => handleDeletePoll(p.id)}
                      className="flex-1 p-2 text-red-600 hover:text-red-700 hover:bg-red-50/40 rounded-lg transition backdrop-blur-sm border border-red-200/40 flex items-center justify-center gap-1 text-xs font-medium"
                    >
                      <Trash2 size={14} /> Suppr.
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
