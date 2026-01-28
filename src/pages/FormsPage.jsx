import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Clock, Users, CheckCircle, Loader, X, Send, ArrowRight } from 'lucide-react';
import { formService } from '../services/formService';
import MainLayout from '../components/MainLayout';
import UserLink from '../components/UserLink';
import TeamAutocomplete from '../components/TeamAutocomplete';

export default function FormsPage() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedForm, setSelectedForm] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await formService.getAllForms();
      const publishedForms = data.filter((form) => form.isPublished && form.isActive);
      setForms(publishedForms);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des formulaires');
    } finally {
      setLoading(false);
    }
  };

  const isFormActive = (form) => {
    const now = new Date();
    const startDate = new Date(form.startDate);
    const endDate = new Date(form.endDate);
    return now >= startDate && now <= endDate;
  };

  const getFormStatus = (form) => {
    const now = new Date();
    const endDate = new Date(form.endDate);
    
    if (!isFormActive(form)) {
      if (now > endDate) {
        return { text: 'Fermé', icon: '⊘' };
      }
      return { text: 'À venir', icon: '⏳' };
    }
    return { text: 'En cours', icon: '●' };
  };

  const handleOpenForm = (form) => {
    setSelectedForm(form);
    setAnswers({});
    setSuccess(false);
    form.questions?.forEach((q) => {
      if (q.type === 'Checkboxes' || q.type === 'Team') {
        setAnswers(prev => ({ ...prev, [q.id]: [] }));
      } else {
        setAnswers(prev => ({ ...prev, [q.id]: '' }));
      }
    });
  };

  const handleAnswerChange = (questionId, value, type) => {
    if (type === 'Checkboxes') {
      setAnswers(prev => ({
        ...prev,
        [questionId]: prev[questionId].includes(value)
          ? prev[questionId].filter(id => id !== value)
          : [...prev[questionId], value]
      }));
    } else if (type === 'Team') {
      setAnswers(prev => ({
        ...prev,
        [questionId]: value
      }));
    } else {
      setAnswers(prev => ({ ...prev, [questionId]: value }));
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const submitAnswers = [];
      for (const question of selectedForm.questions) {
        const answer = answers[question.id];

        if (question.type === 'Team' && Array.isArray(answer) && answer.length > 0) {
          submitAnswers.push({
            questionId: question.id,
            teamMemberIds: answer.map(member => member.id),
          });
        } else if (Array.isArray(answer) && answer.length > 0) {
          answer.forEach((optionId) => {
            submitAnswers.push({
              questionId: question.id,
              optionId: optionId,
            });
          });
        } else if (
          question.type === 'MultipleChoice' ||
          question.type === 'Dropdown'
        ) {
          submitAnswers.push({
            questionId: question.id,
            optionId: answer,
          });
        } else {
          submitAnswers.push({
            questionId: question.id,
            responseValue: answer,
          });
        }
      }

      await formService.submitForm(selectedForm.id, { answers: submitAnswers });
      setSuccess(true);
      setTimeout(() => {
        setSelectedForm(null);
        loadForms();
      }, 2000);
    } catch (err) {
      setError(err.message || 'Erreur lors de la soumission');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredForms = filter === 'all'
    ? forms
    : filter === 'active'
    ? forms.filter(f => isFormActive(f))
    : forms.filter(f => !isFormActive(f));

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-gray-200 animate-spin" style={{ borderTopColor: '#2E7379' }}></div>
            <p className="text-gray-600 font-medium">Chargement des formulaires...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Page Header - Mono #2E7379 */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-end gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg border border-opacity-20" style={{ backgroundColor: '#2E7379' }}>
              <FileText size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-black text-gray-900 tracking-tight">Formulaires</h1>
              <div className="flex items-center gap-2 mt-2">
                <div className="h-1 w-8 rounded-full" style={{ backgroundColor: '#2E7379' }}></div>
                <p className="text-gray-600 font-medium">Participez à nos enquêtes et sondages</p>
              </div>
            </div>
          </div>
          <div className="text-4xl">📋</div>
        </div>
      </div>

      {/* Filters - Mono #2E7379 */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <div className="w-1 h-6 rounded" style={{ backgroundColor: '#2E7379' }}></div>
          Filtrer par statut
        </h2>
        <div className="flex flex-wrap gap-3 bg-white/40 backdrop-blur-xl p-4 rounded-2xl border border-gray-200/40 shadow-sm">
          {['all', 'active', 'inactive'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 transform backdrop-blur-sm border ${
                filter === type
                  ? 'text-white shadow-lg scale-105'
                  : 'bg-white/60 text-gray-700 hover:bg-white/80 border-2 border-gray-200/40 hover:border-gray-400/60'
              }`}
              style={filter === type ? { backgroundColor: '#2E7379', borderColor: '#2E7379' } : {}}
            >
              {type === 'all' ? '🎯 Tous' : type === 'active' ? '🟢 En cours' : '⏸️ Inactifs'}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50/60 backdrop-blur-lg border border-red-200/40 border-l-4 text-red-700 px-6 py-4 rounded-2xl mb-8 shadow-sm" style={{ borderLeftColor: '#2E7379' }}>
          <p className="font-semibold">Erreur</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {filteredForms.length === 0 ? (
        <div className="bg-white/40 backdrop-blur-xl rounded-3xl border border-gray-200/40 p-20 text-center shadow-sm">
          <div className="mb-4 flex justify-center">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center border border-gray-200/40 shadow-md" style={{ backgroundColor: '#2E7379', backgroundOpacity: '0.1' }}>
              <FileText size={40} style={{ color: '#2E7379' }} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Aucun formulaire disponible</h2>
          <p className="text-gray-600">Les formulaires disponibles apparaîtront ici.</p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredForms.map((form) => {
            const status = getFormStatus(form);
            const active = isFormActive(form);

            return (
              <div
                key={form.id}
                className="group relative bg-white/40 backdrop-blur-xl rounded-3xl overflow-hidden border border-gray-200/40 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col"
              >
                {/* Status badge */}
                <div className="absolute top-4 right-4 z-10">
                  <span className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-xs font-bold backdrop-blur-lg border border-gray-200/40 bg-white/80 text-gray-700 shadow-md">
                    <span>{status.icon}</span>
                    {status.text}
                  </span>
                </div>

                {/* Header */}
                <div className="relative px-6 py-5 border-b border-gray-200/40">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md border border-white/20 text-white" style={{ backgroundColor: '#2E7379' }}>
                      <FileText size={20} />
                    </div>
                    <div className="flex-1 pr-20">
                      <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                        {form.title}
                      </h3>
                      {form.description && (
                        <p className="text-xs text-gray-600 line-clamp-1 mt-1">
                          {form.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-3 border border-gray-200/40 shadow-sm">
                      <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-1">Questions</p>
                      <p className="text-2xl font-bold" style={{ color: '#2E7379' }}>{form.questions?.length || 0}</p>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-3 border border-gray-200/40 shadow-sm">
                      <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-1">Réponses</p>
                      <p className="text-2xl font-bold" style={{ color: '#2E7379' }}>{form.totalResponses || 0}</p>
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div className="space-y-2 text-sm text-gray-600 border-t border-gray-200/40 pt-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Clock size={16} style={{ color: '#2E7379' }} />
                      <span>Jusqu'au <span className="font-semibold text-gray-900">{new Date(form.endDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</span></span>
                    </div>
                    {form.createdBy && (
                      <div className="flex items-center gap-2 pt-2">
                        <Users size={16} style={{ color: '#2E7379' }} />
                        <span>Par </span>
                        <UserLink 
                          user={form.createdBy}
                          showAvatar={true}
                          avatarSize="sm"
                          nameClassName="text-xs"
                          className="text-sm"
                        />
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  {form.allowMultipleResponses && (
                    <div className="mb-6 flex gap-2">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/60 backdrop-blur-sm text-sm font-bold rounded-full border border-gray-200/40" style={{ color: '#2E7379' }}>
                        ⚡ Réponses multiples
                      </span>
                    </div>
                  )}

                  {/* Button */}
                  <button
                    onClick={() => handleOpenForm(form)}
                    disabled={!active}
                    className={`mt-auto py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 text-white shadow-md active:scale-95 backdrop-blur-sm border border-opacity-20 ${
                      active
                        ? 'hover:shadow-lg'
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                    style={{ backgroundColor: active ? '#2E7379' : '#999999' }}
                  >
                    {active ? (
                      <>
                        Commencer
                        <ArrowRight size={18} />
                      </>
                    ) : (
                      new Date() > new Date(form.endDate) ? 'Formulaire fermé' : 'À venir'
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal - Mono #2E7379 */}
      {selectedForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-2xl z-50 flex items-center justify-center p-4">
          <div className="bg-white/70 backdrop-blur-3xl rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/40">
            {/* Header */}
            <div className="sticky top-0 text-white p-8 flex items-start justify-between border-b border-white/20" style={{ backgroundColor: '#2E7379' }}>
              <div>
                <h2 className="text-3xl font-bold">{selectedForm.title}</h2>
                <p className="text-white/80 mt-2 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-white rounded-full"></span>
                  {selectedForm.questions?.length} questions
                </p>
              </div>
              <button
                onClick={() => setSelectedForm(null)}
                className="p-3 hover:bg-white/20 rounded-xl transition backdrop-blur-sm border border-white/10"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            {success ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg border border-gray-200/40 bg-white/60">
                  <CheckCircle size={40} style={{ color: '#2E7379' }} />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-3">Merci !</h3>
                <p className="text-gray-600 mb-2">Votre réponse a été enregistrée avec succès.</p>
                <p className="text-sm text-gray-500">Redirection en cours...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitForm} className="p-8 space-y-8">
                {selectedForm.description && (
                  <div className="bg-white/60 backdrop-blur-sm border-l-4 border p-5 rounded-2xl" style={{ borderLeftColor: '#2E7379', borderColor: 'rgba(46, 115, 121, 0.2)' }}>
                    <p className="text-gray-700 font-medium">{selectedForm.description}</p>
                  </div>
                )}

                {selectedForm.questions?.map((question, index) => (
                  <div key={question.id} className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-bold text-gray-900 text-lg flex items-center gap-3">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-white/60 backdrop-blur-sm rounded-full text-sm font-bold border border-gray-200/40 text-white" style={{ backgroundColor: '#2E7379' }}>
                          {index + 1}
                        </span>
                        {question.title}
                        {question.isRequired && <span className="text-red-600 text-xl">*</span>}
                      </h4>
                      {question.description && (
                        <p className="text-sm text-gray-600 ml-11">{question.description}</p>
                      )}
                    </div>

                    {/* ShortText */}
                    {question.type === 'ShortText' && (
                      <input
                        type="text"
                        value={answers[question.id] || ''}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200/40 rounded-xl focus:outline-none bg-white/60 backdrop-blur-sm transition"
                        style={{ focusRingColor: '#2E7379' }}
                        required={question.isRequired}
                      />
                    )}

                    {/* LongText */}
                    {question.type === 'LongText' && (
                      <textarea
                        value={answers[question.id] || ''}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        rows="5"
                        className="w-full px-4 py-3 border border-gray-200/40 rounded-xl focus:outline-none bg-white/60 backdrop-blur-sm resize-none transition"
                        required={question.isRequired}
                      />
                    )}

                    {/* Email */}
                    {question.type === 'Email' && (
                      <input
                        type="email"
                        value={answers[question.id] || ''}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200/40 rounded-xl focus:outline-none bg-white/60 backdrop-blur-sm transition"
                        required={question.isRequired}
                      />
                    )}

                    {/* Number */}
                    {question.type === 'Number' && (
                      <input
                        type="number"
                        value={answers[question.id] || ''}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200/40 rounded-xl focus:outline-none bg-white/60 backdrop-blur-sm transition"
                        required={question.isRequired}
                      />
                    )}

                    {/* MultipleChoice */}
                    {question.type === 'MultipleChoice' && (
                      <div className="space-y-2">
                        {question.options?.map((option) => (
                          <label key={option.id} className="flex items-center p-4 border border-gray-200/40 rounded-2xl hover:bg-white/80 cursor-pointer transition backdrop-blur-sm">
                            <div className="relative flex items-center">
                              <input
                                type="radio"
                                name={question.id}
                                value={option.id}
                                checked={answers[question.id] === option.id}
                                onChange={() => handleAnswerChange(question.id, option.id)}
                                className="w-5 h-5 appearance-none border-2 border-gray-300 rounded-full cursor-pointer transition"
                                style={{ accentColor: '#2E7379' }}
                              />
                              {answers[question.id] === option.id && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#2E7379' }}></div>
                                </div>
                              )}
                            </div>
                            <span className="ml-3 text-gray-700 font-medium">{option.optionText}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {/* Checkboxes */}
                    {question.type === 'Checkboxes' && (
                      <div className="space-y-2">
                        {question.options?.map((option) => (
                          <label key={option.id} className="flex items-center p-4 border border-gray-200/40 rounded-2xl hover:bg-white/80 cursor-pointer transition backdrop-blur-sm">
                            <div className="relative flex items-center">
                              <input
                                type="checkbox"
                                checked={answers[question.id]?.includes(option.id) || false}
                                onChange={() => handleAnswerChange(question.id, option.id, 'Checkboxes')}
                                className="w-5 h-5 appearance-none border-2 border-gray-300 rounded cursor-pointer transition"
                                style={{ accentColor: '#2E7379' }}
                              />
                              {answers[question.id]?.includes(option.id) && (
                                <div className="absolute inset-1 flex items-center justify-center pointer-events-none">
                                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <span className="ml-3 text-gray-700 font-medium">{option.optionText}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {/* Scale */}
                    {question.type === 'Scale' && (
                      <div className="flex gap-3">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => handleAnswerChange(question.id, value.toString())}
                            className={`flex-1 py-3 rounded-xl border-2 font-bold transition backdrop-blur-sm ${
                              answers[question.id] === value.toString()
                                ? 'text-white shadow-lg'
                                : 'border-gray-200/40 text-gray-700 hover:border-gray-400 bg-white/60'
                            }`}
                            style={answers[question.id] === value.toString() ? { backgroundColor: '#2E7379', borderColor: '#2E7379' } : {}}
                          >
                            {value}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Dropdown */}
                    {question.type === 'Dropdown' && (
                      <select
                        value={answers[question.id] || ''}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200/40 rounded-xl focus:outline-none bg-white/60 backdrop-blur-sm transition"
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

                    {/* Team */}
                    {question.type === 'Team' && (
                      <TeamAutocomplete
                        selectedMembers={answers[question.id] || []}
                        onMembersChange={(members) => handleAnswerChange(question.id, members, 'Team')}
                        maxMembers={5}
                        isRequired={question.isRequired}
                      />
                    )}
                  </div>
                ))}

                {/* Buttons */}
                <div className="flex gap-4 pt-8 border-t border-gray-200/40">
                  <button
                    type="button"
                    onClick={() => setSelectedForm(null)}
                    className="flex-1 px-6 py-3 border-2 border-gray-200/40 text-gray-700 rounded-xl hover:bg-gray-50/40 transition font-semibold backdrop-blur-sm"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3 text-white rounded-xl hover:shadow-lg transition flex items-center justify-center gap-2 font-bold shadow-md backdrop-blur-sm disabled:opacity-50"
                    style={{ backgroundColor: '#2E7379' }}
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-white/30 animate-spin" style={{ borderTopColor: 'white' }}></div>
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
            )}
          </div>
        </div>
      )}
    </MainLayout>
  );
}
