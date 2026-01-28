import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Send, Loader } from 'lucide-react';
import { formService } from '../services/formService';
import MainLayout from '../components/MainLayout';
import TeamAutocomplete from '../components/TeamAutocomplete';

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

export default function FormResponsePage() {
  const navigate = useNavigate();
  const { formId } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    fetchForm();
  }, [formId]);

  const fetchForm = async () => {
    try {
      setLoading(true);
      const data = await formService.getFormById(formId);
      console.log('📋 Formulaire chargé:', data);
      console.log('📋 Questions du formulaire:', data.questions);
      
      setForm(data);
      
      // Initialiser les réponses basées sur le TYPE EXACT de la question
      const initialAnswers = {};
      data.questions?.forEach((q) => {
        console.log(`📝 Question: ${q.title}, Type: ${q.type}`);
        // Pour les Checkboxes, initialiser avec un tableau vide
        if (q.type === 'Checkboxes') {
          initialAnswers[q.id] = [];
        } 
        // Pour les équipes, initialiser avec un tableau vide
        else if (q.type === 'Team') {
          console.log('🎯 QUESTION DE TYPE TEAM DÉTECTÉE!');
          initialAnswers[q.id] = [];
        }
        else {
          // Pour tous les autres types, initialiser avec une chaîne vide
          initialAnswers[q.id] = '';
        }
      });
      setAnswers(initialAnswers);
      console.log('✅ Réponses initialisées:', initialAnswers);
      
      // Debug: log des types de questions reçues
      console.log('Questions reçues du backend:', data.questions?.map(q => ({ 
        id: q.id, 
        title: q.title, 
        type: q.type,
        typeString: String(q.type),
        initialValue: q.type === 'Checkboxes' || q.type === 'Team' ? [] : ''
      })));
    } catch (err) {
      setError('Impossible de charger le formulaire');
      console.error('❌ Erreur lors du chargement:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTextChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSelectChange = (questionId, optionId) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleCheckboxChange = (questionId, optionId) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: prev[questionId].includes(optionId)
        ? prev[questionId].filter((id) => id !== optionId)
        : [...prev[questionId], optionId],
    }));
  };

  const handleTeamChange = (questionId, teamMembers) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: teamMembers,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // Valider les champs obligatoires
      for (const question of form.questions) {
        if (question.isRequired) {
          const answer = answers[question.id];
          if (!answer || (Array.isArray(answer) && answer.length === 0)) {
            throw new Error(`La question "${question.title}" est obligatoire`);
          }
        }
      }

      // Construire le payload
      const submitAnswers = [];
      for (const question of form.questions) {
        const answer = answers[question.id];
        const questionType = String(question.type);

        console.log(`[Debug Submit] Question: ${question.title}, Type: ${questionType}, Answer:`, answer, 'IsArray:', Array.isArray(answer));

        if (questionType === 'Team' && Array.isArray(answer) && answer.length > 0) {
          // Équipe - envoyer les IDs des membres
          submitAnswers.push({
            questionId: question.id,
            teamMemberIds: answer.map(member => member.id),
          });
        } else if (Array.isArray(answer) && answer.length > 0) {
          // Checkboxes - envoyer chaque réponse séparément
          console.log(`[Debug Submit] Envoi ${answer.length} réponses pour checkboxes`);
          answer.forEach((optionId) => {
            submitAnswers.push({
              questionId: question.id,
              optionId: optionId,
            });
          });
        } else if (
          questionType === 'MultipleChoice' ||
          questionType === '4' ||
          questionType === 'Dropdown' ||
          questionType === '7'
        ) {
          // Radio buttons ou dropdown - envoyer une seule option
          if (answer) {
            submitAnswers.push({
              questionId: question.id,
              optionId: answer,
            });
          }
        } else {
          // Texte, email, nombre - envoyer la valeur textuelle
          if (answer) {
            submitAnswers.push({
              questionId: question.id,
              responseValue: answer,
            });
          }
        }
      }

      console.log('[Debug Submit] Total réponses à envoyer:', submitAnswers.length, submitAnswers);

      await formService.submitForm(formId, { answers: submitAnswers });
      setSuccess(true);
      
      // Rediriger après 2 secondes
      setTimeout(() => {
        navigate('/forms');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Erreur lors de la soumission du formulaire');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <Loader size={32} className="animate-spin text-[#2E7379]" />
            <p className="text-gray-600">Chargement du formulaire...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!form) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate('/forms')}
            className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition mb-6 text-gray-700"
          >
            <ArrowLeft size={24} />
            Retour
          </button>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error || 'Formulaire non trouvé'}
          </div>
        </div>
      </MainLayout>
    );
  }

  if (success) {
    return (
      <MainLayout>
        <div className="max-w-md mx-auto">
          <div className="text-center py-16 bg-green-50 rounded-lg border-2 border-green-200">
            <h2 className="text-2xl font-bold text-green-700 mb-4"> Merci !</h2>
            <p className="text-green-600 mb-4">Votre réponse a été enregistrée avec succès.</p>
            <p className="text-gray-600 text-sm">Redirection en cours...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        {/* En-tête */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/forms')}
            className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-700"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800">{form.title}</h1>
            {form.description && (
              <p className="text-gray-600 mt-2">{form.description}</p>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {form.questions?.map((question, index) => (
            <div
              key={question.id}
              className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm"
            >
              <div className="flex items-start gap-3 mb-4">
                <span className="text-lg font-semibold text-[#2E7379] min-w-fit">
                  Q{index + 1}
                </span>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {question.title}
                    {question.isRequired && (
                      <span className="text-red-600 ml-2">*</span>
                    )}
                  </h3>
                  {question.description && (
                    <p className="text-gray-600 text-sm mt-1">{question.description}</p>
                  )}
                </div>
              </div>

              {/* Texte court */}
              {question.type === 'ShortText' && (
                <input
                  type="text"
                  value={answers[question.id] || ''}
                  onChange={(e) => handleTextChange(question.id, e.target.value)}
                  className="w-full bg-white text-gray-800 px-4 py-2 rounded-lg border border-gray-300 focus:border-[#2E7379] focus:outline-none"
                  required={question.isRequired}
                />
              )}

              {/* Texte long */}
              {question.type === 'LongText' && (
                <textarea
                  value={answers[question.id] || ''}
                  onChange={(e) => handleTextChange(question.id, e.target.value)}
                  rows="5"
                  className="w-full bg-white text-gray-800 px-4 py-2 rounded-lg border border-gray-300 focus:border-[#2E7379] focus:outline-none"
                  required={question.isRequired}
                />
              )}

              {/* Email */}
              {question.type === 'Email' && (
                <input
                  type="email"
                  value={answers[question.id] || ''}
                  onChange={(e) => handleTextChange(question.id, e.target.value)}
                  className="w-full bg-white text-gray-800 px-4 py-2 rounded-lg border border-gray-300 focus:border-[#2E7379] focus:outline-none"
                  required={question.isRequired}
                />
              )}

              {/* Nombre */}
              {question.type === 'Number' && (
                <input
                  type="number"
                  value={answers[question.id] || ''}
                  onChange={(e) => handleTextChange(question.id, e.target.value)}
                  className="w-full bg-white text-gray-800 px-4 py-2 rounded-lg border border-gray-300 focus:border-[#2E7379] focus:outline-none"
                  required={question.isRequired}
                />
              )}

              {/* Choix unique (Radio) */}
              {question.type === 'MultipleChoice' && (
                <div className="space-y-3">
                  {question.options?.map((option) => (
                    <label
                      key={option.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition"
                    >
                      <input
                        type="radio"
                        name={question.id}
                        value={option.id}
                        checked={answers[question.id] === option.id}
                        onChange={() => handleSelectChange(question.id, option.id)}
                        required={question.isRequired}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-gray-800">{option.optionText}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* Plusieurs choix (Checkboxes) */}
              {question.type === 'Checkboxes' && (
                <div className="space-y-3">
                  {question.options?.map((option) => (
                    <label
                      key={option.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition"
                    >
                      <input
                        type="checkbox"
                        checked={answers[question.id]?.includes(option.id) || false}
                        onChange={() => handleCheckboxChange(question.id, option.id)}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-gray-800">{option.optionText}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* Échelle 1-5 */}
              {question.type === 'Scale' && (
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleSelectChange(question.id, value.toString())}
                      className={`flex-1 py-3 rounded-lg border-2 font-semibold transition ${
                        answers[question.id] === value.toString()
                          ? 'bg-[#2E7379] border-[#2E7379] text-white'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-[#2E7379]'
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              )}

              {/* Liste déroulante */}
              {question.type === 'Dropdown' && (
                <select
                  value={answers[question.id] || ''}
                  onChange={(e) => handleSelectChange(question.id, e.target.value)}
                  className="w-full bg-white text-gray-800 px-4 py-2 rounded-lg border border-gray-300 focus:border-[#2E7379] focus:outline-none"
                  required={question.isRequired}
                >
                  <option value="">-- Sélectionnez une option --</option>
                  {question.options?.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.optionText}
                    </option>
                  ))}
                </select>
              )}

              {/* Équipe */}
              {question.type === 'Team' && (
                <TeamAutocomplete
                  selectedMembers={answers[question.id] || []}
                  onMembersChange={(members) => handleTeamChange(question.id, members)}
                  maxMembers={5}
                  isRequired={question.isRequired}
                />
              )}
            </div>
          ))}

          {/* Boutons */}
          <div className="flex gap-4 justify-end pt-6">
            <button
              type="button"
              onClick={() => navigate('/forms')}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-semibold"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2 bg-[#2E7379] text-white rounded-lg hover:bg-[#F0F1F5] transition font-semibold disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Soumettre
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
