import { useState } from 'react';
import { X, Send, AlertCircle } from 'lucide-react';
import apiClient from '../services/api';

export default function EventRegistrationFormModal({ event, form, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState({});

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Valider que toutes les questions requises sont remplies
      const unansweredRequired = form.questions.filter(q => 
        q.isRequired && !answers[q.id]
      );

      if (unansweredRequired.length > 0) {
        setError('Veuillez remplir toutes les questions obligatoires');
        setLoading(false);
        return;
      }

      // Créer la soumission du formulaire
      const submissionPayload = {
        answers: Object.entries(answers).map(([questionId, value]) => {
          const question = form.questions.find(q => q.id === questionId);
          
          // Pour les questions avec options (MultipleChoice, Checkboxes, Dropdown)
          if (['MultipleChoice', 'Checkboxes', 'Dropdown'].includes(question?.type)) {
            // Si c'est une checkbox avec plusieurs réponses (array)
            if (Array.isArray(value)) {
              return value.map(optionId => ({
                questionId,
                optionId: optionId,
                responseValue: null
              }));
            }
            // Si c'est une option unique (radio ou dropdown)
            return {
              questionId,
              optionId: value,
              responseValue: null
            };
          }
          
          // Pour les autres types (texte, nombre, email, etc.)
          return {
            questionId,
            optionId: null,
            responseValue: value
          };
        }).flat() // Flatten au cas où les checkboxes retournent un array
      };

      const submissionResponse = await apiClient.post(`/forms/${form.id}/submit`, submissionPayload);
      const formSubmissionId = submissionResponse.data.id;

      // Inscrire l'utilisateur à l'événement avec la soumission du formulaire
      const registrationPayload = {
        eventId: event.id,
        formSubmissionId
      };

      await apiClient.post(`/events/${event.id}/register`, registrationPayload);

      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la soumission');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const requiredAnswered = form.questions.filter(q => q.isRequired).length;
  const totalRequired = form.questions.filter(q => q.isRequired).length;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] border border-white/40 flex flex-col overflow-hidden">
        {/* Header - iOS 26 Style - FIXED */}
        <div className="flex-shrink-0 bg-white/70 backdrop-blur-xl text-gray-900 p-6 flex justify-between items-center border-b border-gray-200/40">
          <div>
            <h2 className="text-2xl font-bold mb-1">Formulaire d'inscription</h2>
            <p className="text-gray-500 text-sm">{event.name}</p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100/50 rounded-xl transition duration-200 disabled:opacity-50 flex-shrink-0"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Content - SCROLLABLE */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-2xl p-4 flex gap-3 text-red-700">
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="bg-blue-50/60 backdrop-blur-sm border border-blue-200/40 rounded-2xl p-4">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Description:</span> {form.description}
            </p>
          </div>

          {/* Questions */}
          <div className="space-y-6">
            {form.questions && form.questions.map((question, index) => (
              <div key={question.id} className="bg-white/40 backdrop-blur-sm border border-gray-200/40 rounded-2xl p-5 hover:bg-white/50 transition duration-200">
                <label className="block mb-3">
                  <span className="font-semibold text-gray-900 text-lg">
                    {index + 1}. {question.title}
                  </span>
                  {question.isRequired && (
                    <span className="text-red-500 ml-1 font-bold">*</span>
                  )}
                </label>

                {question.description && (
                  <p className="text-sm text-gray-600 mb-4">{question.description}</p>
                )}

                {question.type === 'ShortText' && (
                  <input
                    type="text"
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    placeholder="Votre réponse"
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200/40 rounded-xl focus:border-blue-500/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition duration-200 text-gray-900 placeholder-gray-400"
                    required={question.isRequired}
                  />
                )}

                {question.type === 'LongText' && (
                  <textarea
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    placeholder="Votre réponse"
                    rows="4"
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200/40 rounded-xl focus:border-blue-500/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition duration-200 text-gray-900 placeholder-gray-400 resize-none"
                    required={question.isRequired}
                  />
                )}

                {question.type === 'MultipleChoice' && (
                  <div className="space-y-3">
                    {question.options && question.options.map((option) => (
                      <label key={option.id} className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-gray-100/50 transition duration-200">
                        <input
                          type="radio"
                          name={question.id}
                          value={option.id}
                          checked={answers[question.id] === option.id}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                          className="w-5 h-5 accent-blue-500 cursor-pointer"
                          required={question.isRequired}
                        />
                        <span className="text-gray-700 font-medium">{option.optionText}</span>
                      </label>
                    ))}
                  </div>
                )}

                {question.type === 'Checkboxes' && (
                  <div className="space-y-3">
                    {question.options && question.options.map((option) => (
                      <label key={option.id} className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-gray-100/50 transition duration-200">
                        <input
                          type="checkbox"
                          value={option.id}
                          checked={(answers[question.id] || []).includes(option.id)}
                          onChange={(e) => {
                            const currentAnswers = answers[question.id] || [];
                            if (e.target.checked) {
                              handleAnswerChange(question.id, [...currentAnswers, option.id]);
                            } else {
                              handleAnswerChange(question.id, currentAnswers.filter(id => id !== option.id));
                            }
                          }}
                          className="w-5 h-5 accent-blue-500 cursor-pointer"
                        />
                        <span className="text-gray-700 font-medium">{option.optionText}</span>
                      </label>
                    ))}
                  </div>
                )}

                {question.type === 'Email' && (
                  <input
                    type="email"
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    placeholder="votre@email.com"
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200/40 rounded-xl focus:border-blue-500/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition duration-200 text-gray-900 placeholder-gray-400"
                    required={question.isRequired}
                  />
                )}

                {question.type === 'Number' && (
                  <input
                    type="number"
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    placeholder="0"
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200/40 rounded-xl focus:border-blue-500/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition duration-200 text-gray-900 placeholder-gray-400"
                    required={question.isRequired}
                  />
                )}

                {question.type === 'Scale' && (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((scale) => (
                        <label key={scale} className="flex-1">
                          <input
                            type="radio"
                            name={`scale-${question.id}`}
                            value={scale}
                            checked={answers[question.id] === scale.toString()}
                            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                            className="hidden"
                            required={question.isRequired}
                          />
                          <div className={`p-3 rounded-xl text-center font-semibold cursor-pointer transition duration-200 border ${
                            answers[question.id] === scale.toString()
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'bg-white/40 border-gray-200/40 text-gray-700 hover:bg-white/60'
                          }`}>
                            {scale}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {question.type === 'Dropdown' && (
                  <select
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200/40 rounded-xl focus:border-blue-500/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition duration-200 text-gray-900"
                    required={question.isRequired}
                  >
                    <option value="">Sélectionnez une option</option>
                    {question.options && question.options.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.optionText}
                      </option>
                    ))}
                  </select>
                )}

                {question.type === 'Date' && (
                  <input
                    type="date"
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200/40 rounded-xl focus:border-blue-500/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition duration-200 text-gray-900"
                    required={question.isRequired}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white/70 backdrop-blur-xl border-t border-gray-200/40 p-6 flex gap-3 justify-end rounded-b-3xl">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2.5 bg-gray-200/60 hover:bg-gray-300/60 text-gray-900 rounded-xl font-semibold transition duration-200 disabled:opacity-50 backdrop-blur-sm"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold flex items-center gap-2 transition duration-200 disabled:opacity-50 shadow-lg shadow-blue-500/20"
            >
              <Send size={18} />
              {loading ? 'Soumission...' : 'Soumettre et S\'inscrire'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
