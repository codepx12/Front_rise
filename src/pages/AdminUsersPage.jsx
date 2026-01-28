import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Trash2, Edit2, Plus, Search, Users } from 'lucide-react';
import apiClient, { getProfileImageUrl } from '../services/api';
import AdminLayout from '../components/AdminLayout';

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    if (user?.role !== 'Admin') {
      navigate('/dashboard');
    }
    fetchUsers();
  }, [user, navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/admin/users');
      setUsers(response.data);
      setError(null);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      setError('Impossible de charger les utilisateurs. Veuillez vérifier votre connexion.');
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await apiClient.delete(`/admin/users/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setError('Impossible de supprimer l\'utilisateur');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role) => {
    if (role === 'Admin') return 'bg-red-100/60 text-red-700 border-red-200/40';
    if (role === 'Professor') return 'bg-blue-100/60 text-blue-700 border-blue-200/40';
    return 'bg-gray-100/60 text-gray-700 border-gray-200/40';
  };

  const getRoleLabel = (role) => {
    if (role === 'Admin') return 'Admin';
    if (role === 'Professor') return 'Prof';
    return 'Étud.';
  };

  const getProfileImage = (user) => {
    return getProfileImageUrl(user.profileImageUrl);
  };

  if (loading) {
    return (
      <AdminLayout pageTitle="Gestion des Utilisateurs">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-gray-400 border-t-gray-700 animate-spin"></div>
            <p className="text-gray-600 font-medium">Chargement des utilisateurs...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="Gestion des Utilisateurs">
      <div className="w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4 mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Gestion des Utilisateurs</h2>
          <button
            onClick={() => navigate('/admin/users/create')}
            className="flex items-center gap-2 px-3 md:px-6 py-2 md:py-3 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-800 hover:to-gray-700 rounded-xl transition font-semibold text-white shadow-lg backdrop-blur-sm border border-gray-600/30 text-sm md:text-base whitespace-nowrap"
          >
            <Plus size={18} className="md:size-5" /> <span className="hidden sm:inline">Ajouter Utilisateur</span><span className="sm:hidden">+</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-50/60 backdrop-blur-lg border border-red-200/40 border-l-4 border-l-red-600 text-red-700 px-4 md:px-6 py-3 md:py-4 rounded-2xl mb-6 md:mb-8 shadow-sm text-sm">
            <p className="font-semibold">Erreur</p>
            <p className="text-xs md:text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Search and Filter */}
        <div className="flex flex-col gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 md:left-4 top-2.5 md:top-3.5 text-gray-600" size={18} />
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/20 backdrop-blur-3xl text-gray-900 pl-10 md:pl-12 pr-3 md:pr-4 py-2 md:py-3 rounded-xl border border-white/30 focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none transition text-sm md:text-base"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 md:px-6 py-2 md:py-3 bg-white/20 backdrop-blur-3xl text-gray-900 rounded-xl border border-white/30 focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none transition font-semibold text-sm md:text-base"
          >
            <option value="all">Tous les rôles</option>
            <option value="Admin">Admin</option>
            <option value="Professor">Professeur</option>
            <option value="Student">Étudiant</option>
          </select>
        </div>

        {/* Users Grid */}
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12 md:py-16 bg-white/20 backdrop-blur-3xl rounded-2xl md:rounded-3xl border border-white/30 shadow-xl">
            <Users className="mx-auto mb-4 text-gray-600" size={40} />
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">Aucun utilisateur trouvé</h2>
            <p className="text-sm md:text-base text-gray-700">Ajustez vos filtres de recherche</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filteredUsers.map((u) => (
              <div
                key={u.id}
                className="group bg-white/20 backdrop-blur-3xl rounded-2xl overflow-hidden border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:bg-white/25 flex flex-col"
              >
                {/* Header with Badge */}
                <div className="relative">
                  {/* Background */}
                  <div className="h-24 bg-gradient-to-r from-gray-300/40 to-gray-200/40 backdrop-blur-2xl"></div>
                  
                  {/* Role Badge - Top Right */}
                  <div className="absolute top-3 right-3">
                    <span className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-full border backdrop-blur-sm ${getRoleColor(u.role)}`}>
                      {getRoleLabel(u.role)}
                    </span>
                  </div>
                </div>

                {/* Profile Image - Centered */}
                <div className="flex justify-center -mt-12 mb-3 relative z-10">
                  <img
                    src={getProfileImage(u)}
                    alt={`${u.firstName} ${u.lastName}`}
                    className="w-24 h-24 rounded-full border-4 border-white/40 shadow-lg object-cover"
                  />
                </div>

                {/* User Info */}
                <div className="px-4 md:px-5 flex-1 flex flex-col">
                  <h3 className="text-center font-bold text-gray-950 text-lg mb-1">
                    {u.firstName} {u.lastName}
                  </h3>
                  <p className="text-center text-xs text-gray-700 mb-3 truncate">
                    {u.email}
                  </p>

                  {/* Details */}
                  <div className="space-y-2 text-xs text-gray-700 mb-4">
                    {u.classe && (
                      <div className="flex items-center justify-center gap-2">
                        <span>📚</span>
                        <span className="truncate">{u.classe}</span>
                      </div>
                    )}
                    {u.filiere && (
                      <div className="flex items-center justify-center gap-2">
                        <span>🎓</span>
                        <span className="truncate">{u.filiere}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-auto pb-4">
                    <button
                      onClick={() => navigate(`/admin/users/edit/${u.id}`)}
                      className="flex-1 px-3 py-2 bg-white/25 backdrop-blur-2xl hover:bg-white/35 rounded-lg md:rounded-xl transition text-xs md:text-sm font-semibold text-gray-950 border border-white/30 shadow-md flex items-center justify-center gap-1"
                    >
                      <Edit2 size={14} />
                      <span className="hidden sm:inline">Éditer</span>
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(u.id)}
                      className="flex-1 px-3 py-2 bg-white/15 backdrop-blur-2xl hover:bg-red-500/30 rounded-lg md:rounded-xl transition text-xs md:text-sm font-semibold text-gray-950 hover:text-red-700 border border-white/30 shadow-md flex items-center justify-center gap-1"
                    >
                      <Trash2 size={14} />
                      <span className="hidden sm:inline">Suppr</span>
                    </button>
                  </div>

                  {/* Delete Confirmation */}
                  {deleteConfirm === u.id && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-2xl flex items-center justify-center p-3 z-50">
                      <div className="bg-white/95 backdrop-blur-xl rounded-xl p-4 text-center max-w-xs">
                        <p className="text-sm font-semibold text-gray-900 mb-3">
                          Supprimer {u.firstName} ?
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition font-semibold text-white text-xs"
                          >
                            Supprimer
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="flex-1 px-3 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg transition font-semibold text-gray-900 text-xs"
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Summary */}
        {users.length > 0 && (
          <div className="mt-6 p-3 md:p-4 bg-white/20 backdrop-blur-3xl rounded-xl md:rounded-2xl border border-white/30 text-gray-900 text-xs md:text-sm font-semibold">
            Affichage de <span className="text-gray-950 font-bold">{filteredUsers.length}</span> utilisateur(s) sur <span className="text-gray-950 font-bold">{users.length}</span>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
