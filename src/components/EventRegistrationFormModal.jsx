import { useState, useEffect } from 'react';
import { X, Send, Loader } from 'lucide-react';
import apiClient from '../services/api';
import { formService } from '../services/formService';
import TeamAutocomplete from './TeamAutocomplete';

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

export default function EventRegistrationFormModal({ event, form, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState(form);
  const [answers, setAnswers] = useState(() => {
    // Initialiser les réponses basées sur le TYPE EXACT de la question
    const initialAnswers = {};
    form.questions?.forEach((q) => {
      // Pour les Checkboxes, initialiser avec un tableau vide
      if (q.type === 'Checkboxes') {
        initialAnswers[q.id] = [];
      } 
      // Pour les équipes, initialiser avec un tableau vide
      else if (q.type === 'Team') {
        initialAnswers[q.id] = [];
      }
      else {
        // Pour tous les autres types, initialiser avec une chaîne vide
        initialAnswers[q.id] = '';
      }
    });
    return initialAnswers;
  });

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
      for (const question of formData.questions) {
        if (question.isRequired) {
          const answer = answers[question.id];
          if (!answer || (Array.isArray(answer) && answer.length === 0)) {
            throw new Error(`La question "${question.title}" est obligatoire`);
          }
        }
      }

      // Construire le payload exactement comme dans FormResponsePage
      const submitAnswers = [];
      for (const question of formData.questions) {
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
      console.log('[Debug Submit] Payload complet:', { answers: submitAnswers });

      // Utiliser formService.submitForm comme dans FormResponsePage
      const submissionResponse = await formService.submitForm(formData.id, { answers: submitAnswers });
      const formSubmissionId = submissionResponse.id;

      // Inscrire l'utilisateur à l'événement avec la soumission du formulaire
      const registrationPayload = {
        eventId: event.id,
        formSubmissionId
      };

      await apiClient.post(`/events/${event.id}/register`, registrationPayload);

      onSuccess();
    } catch (err) {
      const errorMessage = err.message || err.response?.data?.message || 'Erreur lors de la soumission du formulaire';
      setError(errorMessage);
      console.error('Erreur:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] border border-white/40 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 bg-white/70 backdrop-blur-xl text-gray-900 p-6 flex justify-between items-center border-b border-gray-200/40">
          <div>
            <h2 className="text-2xl font-bold mb-1">Formulaire d'inscription</h2>
            <p className="text-gray-500 text-sm">{event.name}</p>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-2 hover:bg-gray-100/50 rounded-xl transition duration-200 disabled:opacity-50 flex-shrink-0"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Content - SCROLLABLE */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {formData.description && (
            <div className="bg-blue-50/60 backdrop-blur-sm border border-blue-200/40 rounded-2xl p-4">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Description:</span> {formData.description}
              </p>
            </div>
          )}

          {/* Questions */}
          {formData.questions?.map((question, index) => (
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
        </form>

        {/* Footer */}
        <div className="flex-shrink-0 bg-white/70 backdrop-blur-xl border-t border-gray-200/40 p-6 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-semibold disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={submitting}
            onClick={handleSubmit}
            className="flex items-center gap-2 px-6 py-2 bg-[#2E7379] text-white rounded-lg hover:bg-[#1f5759] transition font-semibold disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader size={18} className="animate-spin" />
                Envoi...
              </>
            ) : (
              <>
                <Send size={18} />
                Soumettre et S'inscrire
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
