import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, FileText, Loader, CheckCircle, BarChart3 } from 'lucide-react';
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

export default function AdminFormDetailPage() {
  const navigate = useNavigate();
  const { formId } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchForm();
  }, [formId]);

  const fetchForm = async () => {
    try {
      setLoading(true);
      const data = await formService.getFormById(formId);
      setForm(data);
    } catch (err) {
      setError('Impossible de charger le formulaire');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    try {
      setPublishing(true);
      setError('');
      setSuccess('');
      await formService.publishForm(formId);
      setSuccess('Formulaire publié avec succès ! Les étudiants peuvent maintenant y répondre.');
      // Recharger les données
      await fetchForm();
    } catch (err) {
      setError(err.message || 'Erreur lors de la publication du formulaire');
    } finally {
      setPublishing(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <AdminLayout pageTitle="Détail du Formulaire">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-teal-200 border-t-teal-600 animate-spin"></div>
            <p className="text-gray-600 font-medium">Chargement du formulaire...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!form) {
    return (
      <AdminLayout pageTitle="Détail du Formulaire">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/admin/forms')}
            className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition mb-6"
          >
            <ArrowLeft size={24} className="text-gray-600" />
            Retour
          </button>
          <div className="bg-red-50/60 backdrop-blur-lg border border-red-200/40 border-l-4 border-l-red-600 text-red-700 px-6 py-4 rounded-2xl shadow-sm">
            {error || 'Formulaire non trouvé'}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="Détail du Formulaire">
      <div className="max-w-4xl mx-auto">
        {/* En-tête iOS 26 */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/admin/forms')}
            className="p-2 hover:bg-teal-50/40 rounded-lg transition"
          >
            <ArrowLeft size={24} className="text-teal-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{form.title}</h1>
            <div className="flex items-center gap-3 mt-3">
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm border ${
                form.isPublished 
                  ? 'bg-emerald-100/60 text-emerald-700 border-emerald-200/40' 
                  : 'bg-amber-100/60 text-amber-700 border-amber-200/40'
              }`}>
                {form.isPublished ? ' Publié' : '⏸️ Brouillon'}
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate(`/admin/forms/${formId}/edit`)}
            className="px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 rounded-xl transition font-semibold text-white shadow-lg backdrop-blur-sm border border-teal-400/30"
          >
            Éditer
          </button>
        </div>

        {error && (
          <div className="bg-red-50/60 backdrop-blur-lg border border-red-200/40 border-l-4 border-l-red-600 text-red-700 px-6 py-4 rounded-2xl mb-8 shadow-sm">
            <p className="font-semibold">Erreur</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-emerald-50/60 backdrop-blur-lg border border-emerald-200/40 border-l-4 border-l-emerald-600 text-emerald-700 px-6 py-4 rounded-2xl mb-8 shadow-sm flex items-center gap-2">
            <CheckCircle size={20} />
            <p className="font-semibold">{success}</p>
          </div>
        )}

        {/* Alerte si formulaire en brouillon */}
        {!form.isPublished && (
          <div className="bg-gradient-to-br from-amber-50/60 to-orange-50/30 backdrop-blur-xl border border-amber-200/40 text-amber-700 px-6 py-4 rounded-2xl mb-8 flex items-start justify-between shadow-sm">
            <div>
              <p className="font-semibold mb-1">⚠️ Ce formulaire est encore en brouillon</p>
              <p className="text-sm">Les étudiants ne peuvent pas le voir. Publiez-le pour le rendre accessible.</p>
            </div>
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="ml-4 px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 rounded-xl transition font-semibold text-white whitespace-nowrap disabled:opacity-50 shadow-md backdrop-blur-sm border border-emerald-400/30"
            >
              {publishing ? 'Publication...' : ' Publier maintenant'}
            </button>
          </div>
        )}

        {/* Informations générales */}
        <div className="bg-white/40 backdrop-blur-xl rounded-3xl p-8 mb-8 border border-gray-200/40 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-teal-600 to-teal-400 rounded"></div>
            Informations
          </h2>
          
          {form.description && (
            <div className="mb-6 pb-6 border-b border-gray-200/40">
              <p className="text-gray-600 text-sm font-semibold mb-2">Description</p>
              <p className="text-gray-900">{form.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-teal-100/60 to-teal-50/40 backdrop-blur-sm rounded-2xl p-4 border border-teal-200/40">
              <p className="text-gray-600 text-sm font-semibold mb-1">Public ciblé</p>
              <p className="text-teal-700 font-bold">
                {form.targetAudience === 'all'
                  ? 'Tous'
                  : form.targetAudience === 'students'
                  ? 'Étudiants'
                  : 'Professeurs'}
              </p>
            </div>
            <div className="bg-gradient-to-br from-emerald-100/60 to-emerald-50/40 backdrop-blur-sm rounded-2xl p-4 border border-emerald-200/40">
              <p className="text-gray-600 text-sm font-semibold mb-1">Questions</p>
              <p className="text-emerald-700 font-bold text-lg">{form.questions?.length || 0}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-100/60 to-purple-50/40 backdrop-blur-sm rounded-2xl p-4 border border-purple-200/40">
              <p className="text-gray-600 text-sm font-semibold mb-1">Réponses reçues</p>
              <p className="text-purple-700 font-bold text-lg">{form.totalResponses || 0}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-100/60 to-orange-50/40 backdrop-blur-sm rounded-2xl p-4 border border-orange-200/40">
              <p className="text-gray-600 text-sm font-semibold mb-1">Réponses multiples</p>
              <p className="text-orange-700 font-bold">{form.allowMultipleResponses ? 'Oui' : 'Non'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gradient-to-r from-teal-50/40 to-white/30 backdrop-blur-sm rounded-2xl border border-teal-200/40">
            <div>
              <p className="text-gray-600 text-sm font-semibold mb-1">Date de début</p>
              <p className="text-gray-900 text-sm">{formatDate(form.startDate)}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-semibold mb-1">Date de fin</p>
              <p className="text-gray-900 text-sm">{formatDate(form.endDate)}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-semibold mb-1">Créé le</p>
              <p className="text-gray-900 text-sm">{formatDate(form.createdAt)}</p>
            </div>
            {form.updatedAt && (
              <div>
                <p className="text-gray-600 text-sm font-semibold mb-1">Modifié le</p>
                <p className="text-gray-900 text-sm">{formatDate(form.updatedAt)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Questions */}
        <div className="bg-white/40 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/40 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-teal-600 to-teal-400 rounded"></div>
            Questions ({form.questions?.length || 0})
          </h2>

          {!form.questions || form.questions.length === 0 ? (
            <p className="text-gray-600 text-center py-8">Aucune question dans ce formulaire</p>
          ) : (
            <div className="space-y-6">
              {form.questions.map((question, index) => (
                <div key={question.id} className="bg-gradient-to-br from-teal-50/40 to-white/30 backdrop-blur-xl rounded-3xl p-6 border border-teal-200/40">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-teal-100/60 to-teal-50/40 text-teal-700 rounded-full text-sm font-bold border border-teal-200/40">
                          {index + 1}
                        </span>
                        <span className="px-3 py-1 bg-gradient-to-r from-teal-100/60 to-teal-50/40 backdrop-blur-sm text-teal-700 text-xs font-bold rounded-full border border-teal-200/40">
                          {QUESTION_TYPES[question.type] || question.type}
                        </span>
                        {question.isRequired && (
                          <span className="px-3 py-1 bg-red-100/60 text-red-700 text-xs font-bold rounded-full border border-red-200/40">
                            Obligatoire
                          </span>
                        )}
                      </div>
                      <h3 className="text-gray-900 font-semibold">{question.title}</h3>
                    </div>
                  </div>

                  {question.description && (
                    <p className="text-gray-600 text-sm mb-4">{question.description}</p>
                  )}

                  {question.options && question.options.length > 0 && (
                    <div className="mt-4 pl-4 border-l-2 border-teal-200/40">
                      <p className="text-gray-700 text-sm font-semibold mb-3">Options:</p>
                      <ul className="space-y-2">
                        {question.options.map((option, oIndex) => (
                          <li key={option.id} className="text-gray-700 text-sm flex items-center gap-2">
                            <span className="text-teal-600 font-bold">•</span>
                            {option.optionText}
                            {option.responseCount > 0 && (
                              <span className="text-gray-500 text-xs ml-2">({option.responseCount} réponses)</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-end mt-8">
          <button
            onClick={() => navigate('/admin/forms')}
            className="px-6 py-3 border-2 border-gray-200/40 text-gray-700 rounded-xl hover:bg-gray-50/40 transition font-semibold backdrop-blur-sm"
          >
            Retour
          </button>
          <button
            onClick={() => navigate(`/admin/forms/${formId}/analytics`)}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 rounded-xl transition font-semibold text-white shadow-lg backdrop-blur-sm border border-purple-400/30"
          >
            <BarChart3 className="inline mr-2" size={18} />
            Analytics
          </button>
          <button
            onClick={() => navigate(`/admin/forms/${formId}/edit`)}
            className="px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 rounded-xl transition font-semibold text-white shadow-lg backdrop-blur-sm border border-teal-400/30"
          >
            Éditer
          </button>
          {!form.isPublished && (
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 rounded-xl transition font-semibold text-white disabled:opacity-50 shadow-lg backdrop-blur-sm border border-emerald-400/30 flex items-center gap-2"
            >
              <CheckCircle size={18} />
              {publishing ? 'Publication...' : 'Publier'}
            </button>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
