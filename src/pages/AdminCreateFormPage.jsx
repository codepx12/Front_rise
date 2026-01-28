import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Trash2, FileText } from 'lucide-react';
import { formService } from '../services/formService';
import AdminLayout from '../components/AdminLayout';

const QUESTION_TYPES = {
  ShortText: 'Texte court',
  LongText: 'Texte long',
  Email: 'Email',
  Number: 'Nombre',
  MultipleChoice: 'Choix unique',
  Checkboxes: 'Plusieurs choix',
  Scale: 'Échelle 1-5',
  Dropdown: 'Liste déroulante',
  Team: 'Équipe (max 5)',
};

export default function AdminCreateFormPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    targetAudience: 'all',
    questions: [],
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
        {
          title: '',
          description: '',
          type: 'ShortText',
          isRequired: false,
          order: prev.questions.length,
          options: [],
        },
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
    if (!newQuestions[qIndex].options) {
      newQuestions[qIndex].options = [];
    }
    newQuestions[qIndex].options.push('');
    setFormData((prev) => ({ ...prev, questions: newQuestions }));
  };

  const removeOption = (qIndex, oIndex) => {
    const newQuestions = [...formData.questions];
    newQuestions[qIndex].options = newQuestions[qIndex].options.filter((_, i) => i !== oIndex);
    setFormData((prev) => ({ ...prev, questions: newQuestions }));
  };

  const needsOptions = (type) => {
    return ['MultipleChoice', 'Checkboxes', 'Scale', 'Dropdown'].includes(type);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.title.trim()) {
        throw new Error('Le titre du formulaire est requis');
      }
      if (formData.questions.length === 0) {
        throw new Error('Ajoutez au moins une question');
      }

      const invalidQuestion = formData.questions.find((q) => !q.title.trim());
      if (invalidQuestion) {
        throw new Error('Toutes les questions doivent avoir un titre');
      }

      const questionWithoutOptions = formData.questions.find(
        (q) => needsOptions(q.type) && (!q.options || q.options.filter((o) => o.trim()).length < 2)
      );
      if (questionWithoutOptions) {
        throw new Error('Les questions avec options doivent avoir au moins 2 options');
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        targetAudience: formData.targetAudience,
        questions: formData.questions.map((q) => ({
          title: q.title,
          description: q.description,
          type: q.type,
          isRequired: q.isRequired,
          order: q.order,
          options: needsOptions(q.type)
            ? q.options.filter((o) => o.trim())
            : [],
        })),
      };

      const result = await formService.createForm(payload);
      navigate(`/admin/forms/${result.id}`);
    } catch (err) {
      setError(err.message || 'Erreur lors de la création du formulaire');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout pageTitle="Créer un Formulaire">
      <div className="max-w-5xl mx-auto">
        {/* Header iOS 26 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="relative">
              <div className="absolute inset-0 bg-teal-500/20 blur-2xl rounded-lg opacity-30"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg border border-teal-400/30 backdrop-blur-xl">
                <FileText size={24} className="text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Nouveau Formulaire</h2>
          </div>
          <p className="text-gray-600 ml-15">Créez un formulaire pour collecter les réponses de votre audience</p>
        </div>

        {error && (
          <div className="bg-red-50/60 backdrop-blur-lg border border-red-200/40 border-l-4 border-l-red-600 text-red-700 px-6 py-4 rounded-2xl mb-8 shadow-sm">
            <p className="font-semibold">Erreur</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white/40 backdrop-blur-xl rounded-3xl p-8 shadow-sm border border-gray-200/40 space-y-8">
          {/* Informations générales */}
          <div className="space-y-5">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-teal-600 to-teal-400 rounded"></div>
              Informations générales
            </h3>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Titre du formulaire *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="ex: Inscription Hackathon Data Day"
                className="w-full bg-white/60 backdrop-blur-sm text-gray-900 px-4 py-3 rounded-xl border border-gray-200/40 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
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
                placeholder="Décrivez le but de ce formulaire..."
                className="w-full bg-white/60 backdrop-blur-sm text-gray-900 px-4 py-3 rounded-xl border border-gray-200/40 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition resize-none"
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
                  className="w-full bg-white/60 backdrop-blur-sm text-gray-900 px-4 py-3 rounded-xl border border-gray-200/40 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
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
                  className="w-full bg-white/60 backdrop-blur-sm text-gray-900 px-4 py-3 rounded-xl border border-gray-200/40 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
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
                className="w-full bg-white/60 backdrop-blur-sm text-gray-900 px-4 py-3 rounded-xl border border-gray-200/40 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
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
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
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

            {formData.questions.length === 0 ? (
              <div className="text-center py-12 bg-gradient-to-br from-teal-50/40 to-white/30 backdrop-blur-xl rounded-3xl border border-teal-200/40">
                <p className="text-gray-600 font-medium">Aucune question ajoutée. Commencez par ajouter une question.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {formData.questions.map((question, qIndex) => (
                  <div key={qIndex} className="bg-gradient-to-br from-teal-50/40 to-white/30 backdrop-blur-xl rounded-3xl p-6 border border-teal-200/40 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-teal-100/60 to-teal-50/40 text-teal-700 rounded-full text-sm font-bold border border-teal-200/40">
                            {qIndex + 1}
                          </span>
                          <span className="text-sm bg-gradient-to-r from-teal-100/60 to-teal-50/40 backdrop-blur-sm px-3 py-1 rounded-full text-teal-700 font-semibold border border-teal-200/40">
                            {QUESTION_TYPES[question.type]}
                          </span>
                        </div>

                        <input
                          type="text"
                          placeholder="Titre de la question"
                          value={question.title}
                          onChange={(e) => handleQuestionChange(qIndex, 'title', e.target.value)}
                          className="w-full bg-white/60 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-xl border border-gray-200/40 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none font-semibold mb-2 transition"
                          required
                        />

                        <textarea
                          placeholder="Description supplémentaire (optionnel)"
                          value={question.description}
                          onChange={(e) => handleQuestionChange(qIndex, 'description', e.target.value)}
                          rows="2"
                          className="w-full bg-white/60 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-xl border border-gray-200/40 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none resize-none transition"
                        />
                      </div>

                      {formData.questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestion(qIndex)}
                          className="ml-4 p-2 text-red-600 hover:text-red-700 hover:bg-red-50/60 rounded-xl transition flex-shrink-0 backdrop-blur-sm border border-red-200/40"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-teal-200/40">
                      <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Type de question *</label>
                        <select
                          value={question.type}
                          onChange={(e) => handleQuestionChange(qIndex, 'type', e.target.value)}
                          className="w-full bg-white/60 backdrop-blur-sm text-gray-900 px-3 py-2 rounded-xl border border-gray-200/40 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                        >
                          {Object.entries(QUESTION_TYPES).map(([key, value]) => (
                            <option key={key} value={key}>
                              {value}
                            </option>
                          ))}
                        </select>
                      </div>

                      <label className="flex items-center gap-2 text-sm pt-7 text-gray-700 font-semibold">
                        <input
                          type="checkbox"
                          checked={question.isRequired}
                          onChange={(e) => handleQuestionChange(qIndex, 'isRequired', e.target.checked)}
                          className="w-4 h-4 rounded accent-teal-600 cursor-pointer"
                        />
                        <span>Question obligatoire</span>
                      </label>
                    </div>

                    {/* Options pour les questions qui les nécessitent */}
                    {needsOptions(question.type) && (
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

                        {(!question.options || question.options.length === 0) ? (
                          <div className="text-sm text-gray-600 bg-amber-50/60 backdrop-blur-sm rounded-xl p-3 border border-amber-200/40">
                            Ajoutez au moins 2 options
                          </div>
                        ) : (
                          question.options.map((option, oIndex) => (
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
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-4 justify-end pt-6 border-t border-gray-200/40">
            <button
              type="button"
              onClick={() => navigate('/admin/forms')}
              className="px-6 py-3 border-2 border-gray-200/40 text-gray-700 rounded-xl hover:bg-gray-50/40 transition font-semibold backdrop-blur-sm"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || formData.questions.length === 0}
              className="px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 rounded-xl transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-lg backdrop-blur-sm border border-teal-400/30"
            >
              {loading ? 'Création...' : 'Créer Formulaire'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
