import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, X, Trash2, FileText } from 'lucide-react';
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
};

export default function AdminEditFormPage() {
  const navigate = useNavigate();
  const { formId } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    targetAudience: 'all',
    allowMultipleResponses: false,
    questions: [],
  });

  useEffect(() => {
    fetchForm();
  }, [formId]);

  const fetchForm = async () => {
    try {
      setFetching(true);
      const data = await formService.getFormById(formId);
      
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      
      const formatDateForInput = (date) => {
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        const hours = String(date.getUTCHours()).padStart(2, '0');
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };

      setFormData({
        title: data.title,
        description: data.description || '',
        startDate: formatDateForInput(startDate),
        endDate: formatDateForInput(endDate),
        targetAudience: data.targetAudience,
        allowMultipleResponses: data.allowMultipleResponses,
        questions: data.questions.map((q) => ({
          ...q,
          options: q.options.map((o) => o.optionText),
        })),
      });
      setError('');
    } catch (err) {
      setError('Impossible de charger le formulaire');
      console.error('Erreur:', err);
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
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
          id: null,
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

      const payload = {
        title: formData.title,
        description: formData.description,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        targetAudience: formData.targetAudience,
        allowMultipleResponses: formData.allowMultipleResponses,
      };

      await formService.updateForm(formId, payload);
      navigate(`/admin/forms/${formId}`);
    } catch (err) {
      setError(err.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <AdminLayout pageTitle="Chargement...">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-teal-200 border-t-teal-600 animate-spin"></div>
            <p className="text-gray-600 font-medium">Chargement du formulaire...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="Éditer le Formulaire">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(`/admin/forms/${formId}`)}
            className="p-2 hover:bg-teal-50/40 rounded-lg transition"
          >
            <ArrowLeft size={24} className="text-teal-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Éditer le Formulaire</h1>
            <p className="text-gray-600 text-sm mt-1">{formData.title}</p>
          </div>
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
              <label className="block text-sm font-semibold mb-2 text-gray-700">Titre du formulaire *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
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

            <div className="grid grid-cols-2 gap-6">
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

              <div className="flex items-center pt-8">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="allowMultiple"
                    name="allowMultipleResponses"
                    checked={formData.allowMultipleResponses}
                    onChange={handleChange}
                    className="w-5 h-5 rounded-lg border-2 border-teal-200/40 cursor-pointer"
                  />
                  <label htmlFor="allowMultiple" className="text-sm font-semibold text-gray-700 cursor-pointer">
                    Autoriser les réponses multiples
                  </label>
                </div>
              </div>
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

            {formData.questions.length > 0 && (
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
                          readOnly
                        />

                        <textarea
                          placeholder="Description supplémentaire (optionnel)"
                          value={question.description}
                          onChange={(e) => handleQuestionChange(qIndex, 'description', e.target.value)}
                          rows="2"
                          className="w-full bg-white/60 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-xl border border-gray-200/40 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none resize-none transition"
                          readOnly
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
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Type de question</label>
                        <select
                          value={question.type}
                          disabled
                          className="w-full bg-white/60 backdrop-blur-sm text-gray-900 px-3 py-2 rounded-xl border border-gray-200/40 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition opacity-60"
                        >
                          <option>{QUESTION_TYPES[question.type]}</option>
                        </select>
                      </div>

                      <label className="flex items-center gap-2 text-sm pt-7 text-gray-700 font-semibold">
                        <input
                          type="checkbox"
                          checked={question.isRequired}
                          disabled
                          className="w-4 h-4 rounded accent-teal-600 cursor-not-allowed opacity-60"
                        />
                        <span>Question obligatoire</span>
                      </label>
                    </div>

                    {needsOptions(question.type) && (
                      <div className="space-y-3 pt-4 border-t border-teal-200/40">
                        <label className="block text-sm font-semibold text-gray-700">Options</label>
                        {(!question.options || question.options.length === 0) ? (
                          <div className="text-sm text-gray-600 bg-amber-50/60 backdrop-blur-sm rounded-xl p-3 border border-amber-200/40">
                            Aucune option
                          </div>
                        ) : (
                          question.options.map((option, oIndex) => (
                            <div key={oIndex} className="flex gap-2">
                              <span className="text-teal-600 pt-3 min-w-fit font-bold">•</span>
                              <input
                                type="text"
                                value={option}
                                disabled
                                className="flex-1 bg-white/60 backdrop-blur-sm text-gray-900 px-3 py-2 rounded-xl border border-gray-200/40 outline-none transition opacity-60"
                              />
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
              onClick={() => navigate(`/admin/forms/${formId}`)}
              className="px-6 py-3 border-2 border-gray-200/40 text-gray-700 rounded-xl hover:bg-gray-50/40 transition font-semibold backdrop-blur-sm"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 rounded-xl transition disabled:opacity-50 text-white font-semibold shadow-lg backdrop-blur-sm border border-teal-400/30"
            >
              {loading ? 'Mise à jour...' : 'Mettre à jour'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
