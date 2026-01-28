import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Trash2, Edit2, Plus, Play, CheckCircle, BarChart3, Vote } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';

export default function AdminVotesPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'Admin') {
      navigate('/dashboard');
    }
    fetchVotes();
  }, [user, navigate]);

  const fetchVotes = async () => {
    try {
      setLoading(true);
      // Appel API à implémenter
      setLoading(false);
    } catch (error) {
      console.error('Erreur:', error);
      setLoading(false);
    }
  };

  const handleStartVote = async (voteId) => {
    try {
      // await apiClient.post(`/votes/${voteId}/start`);
      setVotes(votes.map(v => v.id === voteId ? { ...v, isActive: true } : v));
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handlePublishResults = async (voteId) => {
    try {
      // await apiClient.post(`/votes/${voteId}/publish-results`);
      setVotes(votes.map(v => v.id === voteId ? { ...v, resultsPublished: true } : v));
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleDeleteVote = async (voteId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce vote ?')) {
      try {
        // await apiClient.delete(`/votes/${voteId}`);
        setVotes(votes.filter(v => v.id !== voteId));
      } catch (error) {
        console.error('Erreur:', error);
      }
    }
  };

  if (loading) {
    return (
      <AdminLayout pageTitle="Gestion des Votes/Élections">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-teal-200 border-t-teal-600 animate-spin"></div>
            <p className="text-gray-600 font-medium">Chargement des votes...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="Gestion des Votes/Élections">
      <div className="w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4 mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Liste des Votes</h2>
          <button
            onClick={() => navigate('/admin/votes/create')}
            className="flex items-center gap-2 px-3 md:px-6 py-2 md:py-3 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-700 hover:to-cyan-600 rounded-xl transition font-semibold text-white shadow-lg backdrop-blur-sm border border-cyan-400/30 text-sm md:text-base whitespace-nowrap"
          >
            <Plus size={18} className="md:size-5" /> <span className="hidden sm:inline">Créer Vote</span><span className="sm:hidden">+</span>
          </button>
        </div>

        {votes.length === 0 ? (
          <div className="text-center py-12 md:py-16 bg-gradient-to-br from-cyan-50/40 to-white/30 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-cyan-200/40 shadow-sm">
            <Vote className="mx-auto mb-4 text-cyan-600" size={40} />
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">Aucun vote créé</h2>
            <p className="text-sm md:text-base text-gray-600 mb-6">Commencez par créer votre premier vote</p>
            <button
              onClick={() => navigate('/admin/votes/create')}
              className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-700 hover:to-cyan-600 rounded-xl transition text-white font-semibold shadow-lg backdrop-blur-sm border border-cyan-400/30 text-sm md:text-base"
            >
              Créer un vote
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden sm:block bg-white/40 backdrop-blur-xl rounded-2xl md:rounded-3xl overflow-hidden border border-gray-200/40 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-cyan-50/60 to-white/30 border-b border-gray-200/40">
                    <tr>
                      <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-gray-700">Titre</th>
                      <th className="hidden md:table-cell px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-gray-700">Postes</th>
                      <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-gray-700">Votes</th>
                      <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-gray-700">Statut</th>
                      <th className="hidden lg:table-cell px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-gray-700">Résultats</th>
                      <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {votes.map((v) => (
                      <tr key={v.id} className="border-b border-gray-200/40 hover:bg-cyan-50/40 transition">
                        <td className="px-3 md:px-6 py-3 md:py-4 font-semibold text-gray-900 text-sm md:text-base">{v.title}</td>
                        <td className="hidden md:table-cell px-3 md:px-6 py-3 md:py-4 text-gray-600 text-xs md:text-sm">{v.positions?.length || 0}</td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-gray-600 text-xs md:text-sm">{v.totalVotes || 0}</td>
                        <td className="px-3 md:px-6 py-3 md:py-4">
                          <span className={`inline-flex items-center px-2 md:px-3 py-1 text-xs font-bold rounded-full border backdrop-blur-sm ${
                            v.isActive 
                              ? 'bg-emerald-100/60 text-emerald-700 border-emerald-200/40' 
                              : 'bg-gray-100/60 text-gray-700 border-gray-200/40'
                          }`}>
                            {v.isActive ? '🟢' : '🔘'} <span className="hidden md:inline ml-1">{v.isActive ? 'En cours' : 'Clos'}</span>
                          </span>
                        </td>
                        <td className="hidden lg:table-cell px-3 md:px-6 py-3 md:py-4">
                          <span className={`inline-flex items-center px-2 md:px-3 py-1 text-xs font-bold rounded-full border backdrop-blur-sm ${
                            v.resultsPublished 
                              ? 'bg-emerald-100/60 text-emerald-700 border-emerald-200/40' 
                              : 'bg-amber-100/60 text-amber-700 border-amber-200/40'
                          }`}>
                            {v.resultsPublished ? ' Publiés' : '⏳ Cachés'}
                          </span>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4">
                          <div className="flex gap-1 md:gap-2">
                            {!v.isActive && (
                              <button
                                onClick={() => handleStartVote(v.id)}
                                className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50/40 rounded-lg transition backdrop-blur-sm border border-emerald-200/40"
                                title="Lancer le vote"
                              >
                                <Play size={16} className="md:size-5" />
                              </button>
                            )}
                            {v.isActive && !v.resultsPublished && (
                              <button
                                onClick={() => handlePublishResults(v.id)}
                                className="p-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50/40 rounded-lg transition backdrop-blur-sm border border-orange-200/40"
                                title="Publier les résultats"
                              >
                                <CheckCircle size={16} className="md:size-5" />
                              </button>
                            )}
                            <button
                              onClick={() => navigate(`/admin/votes/results/${v.id}`)}
                              className="p-2 text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50/40 rounded-lg transition backdrop-blur-sm border border-cyan-200/40"
                              title="Voir résultats"
                            >
                              <BarChart3 size={16} className="md:size-5" />
                            </button>
                            <button
                              onClick={() => navigate(`/admin/votes/edit/${v.id}`)}
                              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50/40 rounded-lg transition backdrop-blur-sm border border-blue-200/40"
                              title="Éditer"
                            >
                              <Edit2 size={16} className="md:size-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteVote(v.id)}
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
              {votes.map((v) => (
                <div key={v.id} className="bg-white/40 backdrop-blur-xl rounded-xl border border-gray-200/40 p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{v.title}</h3>
                      <div className="flex gap-2 mt-2">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-bold rounded-full border backdrop-blur-sm ${
                          v.isActive 
                            ? 'bg-emerald-100/60 text-emerald-700 border-emerald-200/40' 
                            : 'bg-gray-100/60 text-gray-700 border-gray-200/40'
                        }`}>
                          {v.isActive ? '🟢 En cours' : '🔘 Clos'}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-bold rounded-full border backdrop-blur-sm ${
                          v.resultsPublished 
                            ? 'bg-emerald-100/60 text-emerald-700 border-emerald-200/40' 
                            : 'bg-amber-100/60 text-amber-700 border-amber-200/40'
                        }`}>
                          {v.resultsPublished ? ' Pub.' : '⏳ Cachés'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 text-xs text-gray-600 mb-3">
                    <span>📋 {v.positions?.length || 0} poste(s)</span>
                    <span>🗳️ {v.totalVotes || 0} vote(s)</span>
                  </div>
                  <div className="flex gap-2">
                    {!v.isActive && (
                      <button
                        onClick={() => handleStartVote(v.id)}
                        className="flex-1 p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50/40 rounded-lg transition backdrop-blur-sm border border-emerald-200/40 flex items-center justify-center gap-1 text-xs font-medium"
                      >
                        <Play size={14} /> Lancer
                      </button>
                    )}
                    {v.isActive && !v.resultsPublished && (
                      <button
                        onClick={() => handlePublishResults(v.id)}
                        className="flex-1 p-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50/40 rounded-lg transition backdrop-blur-sm border border-orange-200/40 flex items-center justify-center gap-1 text-xs font-medium"
                      >
                        <CheckCircle size={14} /> Publier
                      </button>
                    )}
                    <button
                      onClick={() => navigate(`/admin/votes/results/${v.id}`)}
                      className="flex-1 p-2 text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50/40 rounded-lg transition backdrop-blur-sm border border-cyan-200/40 flex items-center justify-center gap-1 text-xs font-medium"
                    >
                      <BarChart3 size={14} /> Résultats
                    </button>
                    <button
                      onClick={() => navigate(`/admin/votes/edit/${v.id}`)}
                      className="flex-1 p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50/40 rounded-lg transition backdrop-blur-sm border border-blue-200/40 flex items-center justify-center gap-1 text-xs font-medium"
                    >
                      <Edit2 size={14} /> Éditer
                    </button>
                    <button
                      onClick={() => handleDeleteVote(v.id)}
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
