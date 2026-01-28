import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, ArrowLeft, FileText, Mail, Calendar, ChevronDown, ChevronUp, Users } from 'lucide-react';
import apiClient from '../services/api';
import AdminLayout from '../components/AdminLayout';

export default function AdminEventRegistrationsPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [expandedRegistrations, setExpandedRegistrations] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const eventResponse = await apiClient.get(`/events/${eventId}`);
        setEvent(eventResponse.data);
        const registrationsResponse = await apiClient.get(`/events/${eventId}/export-registrations`);
        setRegistrations(registrationsResponse.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [eventId]);

  const handleExport = async (format) => {
    try {
      setExporting(true);
      const response = await apiClient.get(`/events/${eventId}/export-registrations?format=${format}`, {
        responseType: format === 'csv' ? 'text' : 'blob',
      });
      const blob = new Blob([response.data], {
        type: format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inscriptions-${eventId}.${format === 'csv' ? 'csv' : 'xlsx'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Erreur lors de l\'export');
    } finally {
      setExporting(false);
    }
  };

  const toggleExpanded = (registrationId) => {
    setExpandedRegistrations(prev => ({
      ...prev,
      [registrationId]: !prev[registrationId]
    }));
  };

  if (loading) {
    return (
      <AdminLayout pageTitle="Inscriptions">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-teal-200 border-t-teal-600 animate-spin"></div>
            <p className="text-gray-600 font-medium">Chargement des inscriptions...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="Inscriptions">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/events')}
            className="flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-4 font-semibold transition"
          >
            <ArrowLeft size={20} />
            Retour aux événements
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Inscriptions - {event?.name}</h1>
          <p className="text-gray-600">Visualisez et exportez les inscriptions et réponses au formulaire</p>
        </div>

        {error && (
          <div className="bg-red-50/60 backdrop-blur-lg border border-red-200/40 border-l-4 border-l-red-600 text-red-700 px-6 py-4 rounded-2xl mb-8 shadow-sm">
            <p className="font-semibold">Erreur</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        <div className="bg-white/40 backdrop-blur-xl rounded-3xl p-8 mb-8 border border-gray-200/40 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Exporter les données</h3>
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={() => handleExport('csv')}
              disabled={exporting || registrations.length === 0}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-400 rounded-xl transition font-semibold text-white shadow-lg backdrop-blur-sm border border-emerald-400/30"
            >
              <FileText size={20} />
              {exporting ? 'Export...' : 'CSV'}
            </button>
            <button
              onClick={() => handleExport('excel')}
              disabled={exporting || registrations.length === 0}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-400 rounded-xl transition font-semibold text-white shadow-lg backdrop-blur-sm border border-blue-400/30"
            >
              <Download size={20} />
              {exporting ? 'Export...' : 'Excel'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-teal-100/60 to-teal-50/40 backdrop-blur-xl rounded-3xl p-6 border border-teal-200/40 shadow-sm">
            <p className="text-gray-600 text-sm font-semibold">Inscriptions</p>
            <p className="text-3xl font-black text-teal-700 mt-3">{event?.registeredCount || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-100/60 to-blue-50/40 backdrop-blur-xl rounded-3xl p-6 border border-blue-200/40 shadow-sm">
            <p className="text-gray-600 text-sm font-semibold">Réponses formulaire</p>
            <p className="text-3xl font-black text-blue-700 mt-3">{registrations.length}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-100/60 to-emerald-50/40 backdrop-blur-xl rounded-3xl p-6 border border-emerald-200/40 shadow-sm">
            <p className="text-gray-600 text-sm font-semibold">Taux de réponse</p>
            <p className="text-3xl font-black text-emerald-700 mt-3">
              {event?.registeredCount > 0 ? Math.round((registrations.length / event.registeredCount) * 100) : 0}%
            </p>
          </div>
        </div>

        {registrations.length === 0 ? (
          <div className="text-center py-16 bg-gradient-to-br from-teal-50/40 to-white/30 backdrop-blur-xl rounded-3xl border border-teal-200/40 shadow-sm">
            <Users className="mx-auto mb-4 text-teal-600" size={40} />
            <p className="text-gray-600 text-lg">Aucune réponse pour le moment</p>
          </div>
        ) : (
          <div className="space-y-4">
            {registrations.map((registration, idx) => (
              <div key={idx} className="bg-white/40 backdrop-blur-xl rounded-3xl border border-gray-200/40 overflow-hidden hover:shadow-lg transition-all">
                <button
                  onClick={() => toggleExpanded(registration.id)}
                  className="w-full p-6 flex items-center justify-between hover:bg-teal-50/30 transition"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="bg-gradient-to-br from-teal-600 to-teal-500 rounded-full w-12 h-12 flex items-center justify-center text-white font-bold">
                      {(idx + 1).toString().padStart(2, '0')}
                    </div>
                    <div className="text-left flex-1">
                      <h3 className="text-gray-900 font-semibold">{registration.userName}</h3>
                      <div className="flex items-center gap-4 text-gray-600 text-sm mt-2">
                        <div className="flex items-center gap-1">
                          <Mail size={16} className="text-teal-600" />
                          {registration.userEmail}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={16} className="text-teal-600" />
                          {new Date(registration.submittedAt).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-teal-600 ml-4">
                    {expandedRegistrations[registration.id] ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                  </div>
                </button>

                {expandedRegistrations[registration.id] && (
                  <div className="border-t border-gray-200/40 p-6 bg-gradient-to-br from-teal-50/30 to-white/20 space-y-4">
                    {registration.answers.map((answer, answerIdx) => (
                      <div key={answerIdx} className="bg-white/40 backdrop-blur-sm border-l-4 border-l-teal-600 rounded-xl p-4 border border-gray-200/40">
                        <h4 className="text-gray-900 font-semibold">{answer.questionTitle}</h4>
                        <p className="text-gray-500 text-xs mt-1">{answer.questionType}</p>
                        <div className="bg-gradient-to-br from-teal-50/60 to-white/30 rounded-lg p-3 mt-3 border border-teal-200/40">
                          <p className="text-gray-800 text-sm font-medium">
                            {answer.optionText || answer.responseValue || <span className="italic text-gray-500">Non répondu</span>}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
