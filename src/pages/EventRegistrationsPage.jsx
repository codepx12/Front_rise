import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, ArrowLeft, Loader, FileText, Users, MapPin, Clock, Form } from 'lucide-react';
import apiClient from '../services/api';
import AdminLayout from '../components/AdminLayout';

export default function EventRegistrationsPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEventAndRegistrations();
  }, [eventId]);

  const fetchEventAndRegistrations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Récupérer les détails de l'événement
      const eventResponse = await apiClient.get(`/events/${eventId}`);
      setEvent(eventResponse.data);
      
      // Les inscriptions sont incluses dans la réponse de l'événement
      // ou on peut les récupérer via un endpoint dédié
      // Pour maintenant, on affiche juste le nombre d'inscrits
    } catch (err) {
      console.error('Erreur:', err);
      setError('Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      setDownloading(true);
      const response = await apiClient.get(
        `/events/${eventId}/export-registrations?format=excel`,
        { responseType: 'blob' }
      );

      // Créer un blob et télécharger
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `inscriptions-${event?.name || 'event'}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors du téléchargement');
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadCSV = async () => {
    try {
      setDownloading(true);
      const response = await apiClient.get(
        `/events/${eventId}/export-registrations?format=csv`,
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `inscriptions-${event?.name || 'event'}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors du téléchargement');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout pageTitle="Inscriptions aux événements">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader className="animate-spin mx-auto mb-4 text-[#2E7379]" size={32} />
            <p className="text-gray-500">Chargement...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="Inscriptions aux événements">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/events')}
            className="flex items-center gap-2 text-[#2E7379] hover:text-[#F0F1F5] mb-4 transition-colors duration-200 font-medium"
          >
            <ArrowLeft size={20} />
            Retour aux événements
          </button>

          <div className="bg-gradient-to-r from-[#2E7379]/10 to-purple-600/10 rounded-2xl p-6 border border-[#2E7379]/40 backdrop-blur-lg">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {event?.name}
            </h2>
            <p className="text-gray-600 mb-4 flex items-center gap-2">
              <Users size={18} className="text-[#2E7379]" />
              {event?.registeredCount || 0} participant{event?.registeredCount !== 1 ? 's' : ''} inscrit{event?.registeredCount !== 1 ? 's' : ''}
            </p>
            
            {error && (
              <div className="bg-red-50/80 border border-red-200/40 text-red-700 p-4 rounded-xl mb-4 backdrop-blur-sm flex items-center gap-2">
                <FileText size={18} />
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 flex-wrap">
              <button
                onClick={handleDownloadExcel}
                disabled={downloading || (event?.registeredCount || 0) === 0}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:shadow-none"
              >
                <Download size={20} />
                {downloading ? 'Téléchargement...' : 'Excel (.xlsx)'}
              </button>
              
              <button
                onClick={handleDownloadCSV}
                disabled={downloading || (event?.registeredCount || 0) === 0}
                className="flex items-center gap-2 bg-[#2E7379] hover:bg-[#F0F1F5] disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:shadow-none"
              >
                <Download size={20} />
                {downloading ? 'Téléchargement...' : 'CSV (.csv)'}
              </button>
            </div>

            {(event?.registeredCount || 0) === 0 && (
              <p className="text-gray-500 mt-4 text-sm flex items-center gap-2">
                <Users size={16} />
                Aucune inscription pour le moment
              </p>
            )}
          </div>
        </div>

        {/* Event Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/40 shadow-sm hover:shadow-md transition-shadow duration-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText size={20} className="text-[#2E7379]" />
              Informations
            </h3>
            <div className="space-y-4 text-gray-700">
              <div>
                <p className="text-sm text-gray-500 mb-1">Type</p>
                <p className="font-semibold">{event?.type}</p>
              </div>
              <div className="flex items-start gap-2">
                <MapPin size={16} className="text-gray-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500 mb-1">Lieu</p>
                  <p className="font-semibold">{event?.location}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock size={16} className="text-gray-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500 mb-1">Date de début</p>
                  <p className="font-semibold">
                    {new Date(event?.startDate).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/40 shadow-sm hover:shadow-md transition-shadow duration-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Form size={20} className="text-purple-600" />
              Formulaire
            </h3>
            {event?.form ? (
              <div className="space-y-4 text-gray-700">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Titre</p>
                  <p className="font-semibold">{event.form.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Questions</p>
                  <p className="font-semibold">{event.form.questions?.length || 0} question{(event.form.questions?.length || 0) !== 1 ? 's' : ''}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Réponses collectées</p>
                  <p className="font-semibold">{event.form.totalResponses || 0}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic flex items-center gap-2">
                <FileText size={16} />
                Pas de formulaire associé
              </p>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
