import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Vote } from 'lucide-react';
import apiClient from '../services/api';
import AdminLayout from '../components/AdminLayout';

export default function AdminCreateVotePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    positions: [{ title: '', description: '' }],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePositionChange = (index, field, value) => {
    const newPositions = [...formData.positions];
    newPositions[index][field] = value;
    setFormData((prev) => ({ ...prev, positions: newPositions }));
  };

  const addPosition = () => {
    setFormData((prev) => ({
      ...prev,
      positions: [...prev.positions, { title: '', description: '' }],
    }));
  };

  const removePosition = (index) => {
    setFormData((prev) => ({
      ...prev,
      positions: prev.positions.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await apiClient.post('/votes', formData);
      navigate('/admin/votes');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création du vote');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout pageTitle="Créer un Vote/Élection">
      <div className="max-w-5xl mx-auto">
        {/* Header iOS 26 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="relative">
              <div className="absolute inset-0 bg-teal-500/20 blur-2xl rounded-lg opacity-30"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg border border-teal-400/30 backdrop-blur-xl">
                <Vote size={24} className="text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Nouveau Vote/Élection</h2>
          </div>
          <p className="text-gray-600 ml-15">Organisez des élections et des votes transparents</p>
        </div>

        {error && (
          <div className="bg-red-50/60 backdrop-blur-lg border border-red-200/40 border-l-4 border-l-red-600 text-red-700 px-6 py-4 rounded-2xl mb-8 shadow-sm">
            <p className="font-semibold">Erreur</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white/40 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/40 shadow-sm space-y-8">
          {/* Informations générales */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-teal-600 to-teal-400 rounded"></div>
              Informations générales
            </h3>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Titre du vote *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="ex: Élection du président étudiant 2026"
                className="w-full bg-white/40 backdrop-blur-sm text-gray-900 px-4 py-3 rounded-xl border border-gray-200/40 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200/30 transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                placeholder="Donnez plus de contexte sur ce vote..."
                className="w-full bg-white/40 backdrop-blur-sm text-gray-900 px-4 py-3 rounded-xl border border-gray-200/40 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200/30 transition resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Date de début *</label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full bg-white/40 backdrop-blur-sm text-gray-900 px-4 py-3 rounded-xl border border-gray-200/40 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200/30 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Date de fin *</label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full bg-white/40 backdrop-blur-sm text-gray-900 px-4 py-3 rounded-xl border border-gray-200/40 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200/30 transition"
                  required
                />
              </div>
            </div>
          </div>

          {/* Postes */}
          <div className="border-t border-gray-200/40 pt-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-teal-600 to-teal-400 rounded"></div>
                Postes à pourvoir <span className="ml-2 px-3 py-1 bg-teal-100/60 text-teal-700 text-sm font-bold rounded-full border border-teal-200/40">({formData.positions.length})</span>
              </h3>
              <button
                type="button"
                onClick={addPosition}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 rounded-xl transition font-semibold text-white shadow-md backdrop-blur-sm border border-teal-400/30"
              >
                <Plus size={18} /> Ajouter Poste
              </button>
            </div>

            <div className="space-y-4">
              {formData.positions.map((position, index) => (
                <div key={index} className="bg-gradient-to-br from-teal-50/40 to-white/30 backdrop-blur-xl rounded-3xl p-6 border border-teal-200/40 space-y-4">
                  <div className="flex items-start justify-between mb-3">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-teal-100/60 to-teal-50/40 text-teal-700 rounded-full text-sm font-bold border border-teal-200/40">
                      {index + 1}
                    </span>
                    {formData.positions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePosition(index)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50/60 rounded-xl transition flex-shrink-0 backdrop-blur-sm border border-red-200/40"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    placeholder="Titre du poste (ex: Président)"
                    value={position.title}
                    onChange={(e) => handlePositionChange(index, 'title', e.target.value)}
                    className="w-full bg-white/60 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-xl border border-gray-200/40 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none font-semibold transition"
                    required
                  />

                  <textarea
                    placeholder="Description du poste et responsabilités"
                    value={position.description}
                    onChange={(e) => handlePositionChange(index, 'description', e.target.value)}
                    rows="3"
                    className="w-full bg-white/60 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-xl border border-gray-200/40 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none resize-none transition"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Processus de vote */}
          <div className="bg-teal-50/60 backdrop-blur-lg border-2 border-teal-200/40 rounded-2xl p-6">
            <h4 className="font-bold mb-3 text-gray-900 flex items-center gap-2">
              <div className="w-1 h-4 bg-gradient-to-b from-teal-600 to-teal-400 rounded"></div>
              Processus de vote :
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 font-medium">
              <li>Les candidats pourront s'inscrire après la création</li>
              <li>L'admin validera les candidatures</li>
              <li>L'admin lancera le vote</li>
              <li>Les utilisateurs voteront anonymement</li>
              <li>L'admin publiera les résultats</li>
            </ol>
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-4 justify-end pt-6 border-t border-gray-200/40">
            <button
              type="button"
              onClick={() => navigate('/admin/votes')}
              className="px-6 py-3 border-2 border-gray-200/40 text-gray-700 rounded-xl hover:bg-gray-50/40 transition font-semibold backdrop-blur-sm"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 rounded-xl transition disabled:opacity-50 text-white font-semibold shadow-lg backdrop-blur-sm border border-teal-400/30"
            >
              {loading ? 'Création...' : 'Créer Vote'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
