import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, BarChart3 } from 'lucide-react';
import apiClient from '../services/api';
import AdminLayout from '../components/AdminLayout';

export default function AdminCreatePollPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    targetAudience: 'all',
    questions: [{ questionText: '', allowMultipleChoice: false, options: ['', ''] }],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[index][field] = value;
    setFormData((prev) => ({ ...prev, questions: newQuestions }));
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[qIndex].options[oIndex] = value;
    setFormData((prev) => ({ ...prev, questions: newQuestions }));
  };

  const addQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        { questionText: '', allowMultipleChoice: false, options: ['', ''] },
      ],
    }));
  };

  const removeQuestion = (index) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const addOption = (qIndex) => {
    const newQuestions = [...formData.questions];
    newQuestions[qIndex].options.push('');
    setFormData((prev) => ({ ...prev, questions: newQuestions }));
  };

  const removeOption = (qIndex, oIndex) => {
    const newQuestions = [...formData.questions];
    newQuestions[qIndex].options = newQuestions[qIndex].options.filter((_, i) => i !== oIndex);
    setFormData((prev) => ({ ...prev, questions: newQuestions }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await apiClient.post('/polls', {
        ...formData,
        questions: formData.questions.map((q) => ({
          questionText: q.questionText,
          allowMultipleChoice: q.allowMultipleChoice,
          options: q.options.filter((o) => o.trim()),
        })),
      });
      navigate('/admin/polls');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création du sondage');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout pageTitle="Créer un Sondage">
      <div className="max-w-5xl mx-auto">
        {/* Header iOS 26 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="relative">
              <div className="absolute inset-0 bg-teal-500/20 blur-2xl rounded-lg opacity-30"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg border border-teal-400/30 backdrop-blur-xl">
                <BarChart3 size={24} className="text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Nouveau Sondage</h2>
          </div>
          <p className="text-gray-600 ml-15">Collectez facilement les opinions de votre audience</p>
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
              <label className="block text-sm font-semibold mb-2 text-gray-700">Titre du sondage *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="ex: Quel est votre sujet préféré ?"
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
                placeholder="Donnez plus de contexte sur ce sondage..."
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

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Public ciblé *</label>
              <select
                name="targetAudience"
                value={formData.targetAudience}
                onChange={handleChange}
                className="w-full bg-white/40 backdrop-blur-sm text-gray-900 px-4 py-3 rounded-xl border border-gray-200/40 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200/30 transition"
              >
                <option value="all">Tous les utilisateurs</option>
                <option value="students">Étudiants seulement</option>
                <option value="professors">Professeurs seulement</option>
              </select>
            </div>
          </div>

          {/* Questions */}
          <div className="border-t border-gray-200/40 pt-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-teal-600 to-teal-400 rounded"></div>
                Questions <span className="ml-2 px-3 py-1 bg-teal-100/60 text-teal-700 text-sm font-bold rounded-full border border-teal-200/40">({formData.questions.length})</span>
              </h3>
              <button
                type="button"
                onClick={addQuestion}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 rounded-xl transition font-semibold text-white shadow-md backdrop-blur-sm border border-teal-400/30"
              >
                <Plus size={18} /> Ajouter Question
              </button>
            </div>

            <div className="space-y-6">
              {formData.questions.map((question, qIndex) => (
                <div key={qIndex} className="bg-gradient-to-br from-teal-50/40 to-white/30 backdrop-blur-xl rounded-3xl p-6 border border-teal-200/40 space-y-4">
                  <div className="flex items-start justify-between mb-3">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-teal-100/60 to-teal-50/40 text-teal-700 rounded-full text-sm font-bold border border-teal-200/40">
                      {qIndex + 1}
                    </span>
                    {formData.questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(qIndex)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50/60 rounded-xl transition flex-shrink-0 backdrop-blur-sm border border-red-200/40"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    placeholder="Votre question"
                    value={question.questionText}
                    onChange={(e) => handleQuestionChange(qIndex, 'questionText', e.target.value)}
                    className="w-full bg-white/60 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-xl border border-gray-200/40 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none font-semibold transition"
                    required
                  />

                  <label className="flex items-center gap-2 text-sm text-gray-700 font-semibold pt-2">
                    <input
                      type="checkbox"
                      checked={question.allowMultipleChoice}
                      onChange={(e) => handleQuestionChange(qIndex, 'allowMultipleChoice', e.target.checked)}
                      className="w-5 h-5 rounded-lg border-2 border-teal-200/40 cursor-pointer"
                    />
                    Autoriser les réponses multiples
                  </label>

                  <div className="space-y-3 pt-4 border-t border-teal-200/40">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-semibold text-gray-700">Options</label>
                      <button
                        type="button"
                        onClick={() => addOption(qIndex)}
                        className="text-sm text-teal-600 hover:text-teal-700 transition font-semibold"
                      >
                        + Ajouter option
                      </button>
                    </div>

                    {question.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex gap-2">
                        <span className="text-teal-600 pt-3 min-w-fit font-bold">•</span>
                        <input
                          type="text"
                          placeholder={`Option ${oIndex + 1}`}
                          value={option}
                          onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                          className="flex-1 bg-white/60 backdrop-blur-sm text-gray-900 px-3 py-2 rounded-xl border border-gray-200/40 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                        />
                        {question.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(qIndex, oIndex)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50/60 rounded-xl transition flex-shrink-0 backdrop-blur-sm border border-red-200/40"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-4 justify-end pt-6 border-t border-gray-200/40">
            <button
              type="button"
              onClick={() => navigate('/admin/polls')}
              className="px-6 py-3 border-2 border-gray-200/40 text-gray-700 rounded-xl hover:bg-gray-50/40 transition font-semibold backdrop-blur-sm"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 rounded-xl transition disabled:opacity-50 text-white font-semibold shadow-lg backdrop-blur-sm border border-teal-400/30"
            >
              {loading ? 'Création...' : 'Créer Sondage'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
