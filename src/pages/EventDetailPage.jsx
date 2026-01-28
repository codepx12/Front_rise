import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import MainLayout from '../components/MainLayout';
import EventRegistrationFormModal from '../components/EventRegistrationFormModal';
import {
  Calendar,
  MapPin,
  Users,
  FileText,
  Download,
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Clock,
  Share2,
  Heart,
  Eye,
  Zap,
} from 'lucide-react';
import apiClient from '../services/api';

export default function EventDetailPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/events/${eventId}`);
        setEvent(response.data);
        setIsRegistered(response.data.isUserRegistered || false);
      } catch (err) {
        setError('Erreur lors du chargement de l\'événement');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const handleRegister = async () => {
    // Si le formulaire est requis et existe, afficher le modal
    if (event?.requireFormSubmission && event?.form) {
      setShowFormModal(true);
      return;
    }

    // Si un formulaire existe mais n'est pas requis, on peut aussi afficher le modal pour que l'utilisateur puisse le remplir volontairement
    if (event?.form && !event?.requireFormSubmission) {
      setShowFormModal(true);
      return;
    }

    // Sinon, inscription directe
    try {
      setRegistering(true);
      await apiClient.post(`/events/${eventId}/register`, { eventId });
      setIsRegistered(true);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription');
      console.error('Erreur:', err);
    } finally {
      setRegistering(false);
    }
  };

  const handleUnregister = async () => {
    try {
      setRegistering(true);
      await apiClient.post(`/events/${eventId}/unregister`, { eventId });
      setIsRegistered(false);
      setError('');
    } catch (err) {
      setError('Erreur lors de la désinscription');
      console.error('Erreur:', err);
    } finally {
      setRegistering(false);
    }
  };

  const handleFormSuccess = () => {
    setShowFormModal(false);
    setIsRegistered(true);
    setError('');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateShort = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getRegistrationPercentage = () => {
    if (!event.maxParticipants || event.maxParticipants === 0) return 0;
    return Math.round((event.registeredCount / event.maxParticipants) * 100);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-200 border-t-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Chargement de l'événement...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!event) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto mt-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-4 font-medium transition"
          >
            <ArrowLeft size={20} />
            Retour
          </button>
          <div className="bg-red-50/60 backdrop-blur-lg border-l-4 border-red-600 rounded-2xl p-6 text-red-700">
            <p className="font-semibold">Événement non trouvé</p>
            <p className="text-sm mt-1">L'événement que vous recherchez n'existe pas ou a été supprimé.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const isFull = event.maxParticipants && event.registeredCount >= event.maxParticipants;

  return (
    <MainLayout>
      <div className="w-full px-3 sm:px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb - Responsive */}
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6 overflow-x-auto">
            <button onClick={() => navigate('/events')} className="hover:text-teal-600 transition whitespace-nowrap">Événements</button>
            <span>/</span>
            <span className="text-gray-900 font-medium truncate">{event.name}</span>
          </div>

          {error && (
            <div className="bg-red-50/60 backdrop-blur-lg border-l-4 border-red-600 rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6 text-red-700 text-sm sm:text-base">
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* Hero Section - Responsive iOS 26 */}
          <div className="relative rounded-3xl sm:rounded-3xl overflow-hidden shadow-lg sm:shadow-2xl mb-6 sm:mb-8 border border-gray-200/40">
            {event.imageUrls && event.imageUrls.length > 0 ? (
              <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[500px] overflow-hidden group">
                {event.imageUrls.length === 1 ? (
                  <img
                    src={event.imageUrls[0]}
                    alt={event.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="grid grid-cols-2 gap-px h-full w-full">
                    {event.imageUrls.slice(0, 4).map((imgUrl, idx) => (
                      <img
                        key={idx}
                        src={imgUrl}
                        alt={`Image ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ))}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              </div>
            ) : event.posterUrl ? (
              <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[500px] overflow-hidden group">
                <img
                  src={event.posterUrl}
                  alt={event.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              </div>
            ) : (
              <div className="w-full h-64 sm:h-80 md:h-96 lg:h-[500px] bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center">
                <Zap size={48} sm:size={64} className="text-white opacity-20" />
              </div>
            )}

            {/* Header Info Overlay - Responsive iOS 26 */}
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 text-white">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 sm:gap-4">
                <div className="flex-1 min-w-0 w-full sm:w-auto">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 flex-wrap">
                    <span className="inline-block bg-gradient-to-r from-teal-600 to-teal-500 text-white px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold shadow-lg backdrop-blur-sm border border-teal-400/30">
                      {event.type}
                    </span>
                    {event.isPublished && (
                      <span className="inline-block bg-emerald-600 text-white px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-lg backdrop-blur-sm border border-emerald-400/30">
                        <CheckCircle size={14} sm:size={16} />
                        <span className="hidden xs:inline">Publié</span>
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-1 sm:mb-2 drop-shadow-lg line-clamp-2 sm:line-clamp-3">{event.name}</h1>
                  <p className="text-teal-100 text-sm sm:text-base md:text-lg drop-shadow line-clamp-1">{event.location}</p>
                </div>

                {/* Bouton Inscription - Responsive iOS 26 */}
                <button
                  onClick={isRegistered ? handleUnregister : handleRegister}
                  disabled={registering || (isFull && !isRegistered)}
                  className={`w-full sm:w-auto px-4 sm:px-8 py-2.5 sm:py-3 rounded-xl sm:rounded-xl font-bold text-sm sm:text-lg transition transform hover:scale-105 active:scale-95 shadow-lg sm:shadow-xl whitespace-nowrap backdrop-blur-sm border ${
                    isRegistered
                      ? 'bg-red-600 text-white hover:bg-red-700 border-red-400/30'
                      : isFull
                      ? 'bg-gray-500/60 text-white cursor-not-allowed border-gray-400/30'
                      : 'bg-gradient-to-r from-teal-600 to-teal-500 text-white hover:shadow-2xl border-teal-400/30'
                  } disabled:opacity-60`}
                >
                  {registering ? 'Traitement...' : isRegistered ? 'Désinscrire' : isFull ? 'Complet' : event?.form ? 'Remplir le formulaire' : 'S\'inscrire'}
                </button>
              </div>
            </div>
          </div>

          {/* Deux colonnes: Contenu principal + Sidebar - Responsive */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {/* Colonne principale (2/3) */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6 md:space-y-8">
              {/* Infos clés - Responsive iOS 26 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* Date/Heure */}
                <div className="bg-white/40 backdrop-blur-xl rounded-2xl sm:rounded-2xl shadow-sm p-4 sm:p-6 border border-teal-200/40 border-l-4 border-l-teal-600">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="bg-gradient-to-br from-teal-100/60 to-teal-50/40 backdrop-blur-sm p-2 sm:p-3 rounded-lg flex-shrink-0 border border-teal-200/40">
                      <Calendar size={20} sm:size={24} className="text-teal-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-xs sm:text-sm uppercase tracking-wide text-gray-600">Date</h3>
                      <p className="text-gray-900 font-semibold mt-2 text-sm sm:text-base break-words">{formatDate(event.startDate)}</p>
                      <p className="text-gray-600 text-xs sm:text-sm mt-1">Fin: {formatDateShort(event.endDate)}</p>
                    </div>
                  </div>
                </div>

                {/* Lieu */}
                <div className="bg-white/40 backdrop-blur-xl rounded-2xl sm:rounded-2xl shadow-sm p-4 sm:p-6 border border-emerald-200/40 border-l-4 border-l-emerald-600">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="bg-gradient-to-br from-emerald-100/60 to-emerald-50/40 backdrop-blur-sm p-2 sm:p-3 rounded-lg flex-shrink-0 border border-emerald-200/40">
                      <MapPin size={20} sm:size={24} className="text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-xs sm:text-sm uppercase tracking-wide text-gray-600">Lieu</h3>
                      <p className="text-gray-900 font-semibold mt-2 text-sm sm:text-base break-words">{event.location}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description - Responsive iOS 26 */}
              <div className="bg-white/40 backdrop-blur-xl rounded-2xl sm:rounded-2xl shadow-sm p-4 sm:p-8 border border-gray-200/40">
                <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">À propos</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm sm:text-base md:text-lg">
                  {event.description}
                </p>
              </div>

              {/* Thème - Responsive iOS 26 */}
              {event.theme && (
                <div className="bg-gradient-to-br from-purple-50/60 to-purple-100/30 backdrop-blur-sm rounded-2xl sm:rounded-2xl shadow-sm p-4 sm:p-8 border border-purple-200/40 border-l-4 border-l-purple-600">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="bg-gradient-to-br from-purple-100/60 to-purple-50/40 backdrop-blur-sm p-2 sm:p-3 rounded-lg flex-shrink-0 border border-purple-200/40">
                      <Zap size={20} sm:size={24} className="text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-2">Thème</h3>
                      <p className="text-gray-800 text-sm sm:text-lg font-semibold break-words">{event.theme}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Règles - Responsive iOS 26 */}
              {event.rules && (
                <div className="bg-orange-50/60 backdrop-blur-sm rounded-2xl sm:rounded-2xl shadow-sm p-4 sm:p-8 border border-orange-200/40 border-l-4 border-l-orange-600">
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                    <div className="bg-gradient-to-br from-orange-100/60 to-orange-50/40 backdrop-blur-sm p-2 rounded-lg flex-shrink-0 border border-orange-200/40">
                      <AlertCircle size={20} sm:size={24} className="text-orange-600" />
                    </div>
                    <span className="break-words">Règles</span>
                  </h2>
                  <div className="text-gray-800 leading-relaxed whitespace-pre-wrap bg-white/60 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-orange-200/40 text-sm sm:text-base">
                    {event.rules}
                  </div>
                </div>
              )}

              {/* Documents - Responsive iOS 26 */}
              {event.documentUrl && (
                <div className="bg-amber-50/60 backdrop-blur-sm rounded-2xl sm:rounded-2xl shadow-sm p-4 sm:p-8 border border-amber-200/40 border-l-4 border-l-amber-600">
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                    <div className="bg-gradient-to-br from-amber-100/60 to-amber-50/40 backdrop-blur-sm p-2 rounded-lg flex-shrink-0 border border-amber-200/40">
                      <FileText size={20} sm:size={24} className="text-amber-600" />
                    </div>
                    <span>Documents</span>
                  </h2>
                  <a
                    href={event.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-4 sm:p-6 bg-white/60 backdrop-blur-sm border border-amber-200/40 rounded-xl hover:border-amber-600 hover:shadow-lg transition group"
                  >
                    <div className="bg-gradient-to-br from-amber-100/60 to-amber-50/40 backdrop-blur-sm p-3 sm:p-4 rounded-lg group-hover:from-amber-200/60 group-hover:to-amber-100/40 transition flex-shrink-0 border border-amber-200/40">
                      <Download size={24} sm:size={28} className="text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm sm:text-lg">Télécharger</p>
                      <p className="text-gray-600 text-xs sm:text-sm">Cliquez pour accéder aux ressources</p>
                    </div>
                    <span className="text-amber-600 font-bold hidden sm:inline">→</span>
                  </a>
                </div>
              )}
            </div>

            {/* Sidebar (1/3) - Non sticky sur mobile iOS 26 */}
            <div className="space-y-4 sm:space-y-6">
              {/* Carte Résumé iOS 26 */}
              <div className="bg-white/40 backdrop-blur-xl rounded-2xl sm:rounded-2xl shadow-sm p-4 sm:p-8 border border-gray-200/40 lg:sticky lg:top-24">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Résumé</h3>
                
                {/* Statut d'inscription iOS 26 */}
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl bg-gradient-to-r from-teal-50/60 to-teal-100/30 backdrop-blur-sm border border-teal-200/40">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    {isRegistered ? (
                      <>
                        <CheckCircle size={20} sm:size={24} className="text-emerald-600 flex-shrink-0" />
                        <span className="font-bold text-emerald-700 text-sm sm:text-base">Inscrit</span>
                      </>
                    ) : (
                      <>
                        <Heart size={20} sm:size={24} className="text-teal-600 flex-shrink-0" />
                        <span className="font-bold text-teal-700 text-sm sm:text-base">Non inscrit</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600">{isRegistered ? 'Vous participerez à cet événement' : 'Inscrivez-vous pour participer'}</p>
                </div>

                {/* Participants iOS 26 */}
                <div className="space-y-2 sm:space-y-3 pb-4 sm:pb-6 border-b border-gray-200/40">
                  <h4 className="font-semibold text-gray-900 text-xs sm:text-sm uppercase tracking-wide text-gray-600">Participants</h4>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl sm:text-3xl font-bold text-teal-600">{event.registeredCount || 0}</p>
                    {event.maxParticipants && (
                      <p className="text-gray-600 text-sm sm:text-base">/ {event.maxParticipants}</p>
                    )}
                  </div>
                  
                  {event.maxParticipants && (
                    <>
                      <div className="w-full bg-gray-200/40 backdrop-blur-sm rounded-full h-2 overflow-hidden border border-gray-200/60">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            getRegistrationPercentage() >= 90 ? 'bg-red-600' :
                            getRegistrationPercentage() >= 70 ? 'bg-orange-600' :
                            'bg-emerald-600'
                          }`}
                          style={{ width: `${Math.min(getRegistrationPercentage(), 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-600">{getRegistrationPercentage()}% rempli</p>
                    </>
                  )}
                </div>

                {/* Autres infos iOS 26 */}
                <div className="space-y-2 sm:space-y-4 mt-4 sm:mt-6">
                  <div className="flex justify-between items-center py-2 sm:py-3 border-b border-gray-200/40">
                    <span className="text-gray-600 text-xs sm:text-sm">Créé le</span>
                    <span className="font-semibold text-gray-900 text-xs sm:text-sm">{formatDateShort(event.createdAt)}</span>
                  </div>
                  {event.theme && (
                    <div className="flex justify-between items-center py-2 sm:py-3 border-b border-gray-200/40">
                      <span className="text-gray-600 text-xs sm:text-sm">Thème</span>
                      <span className="font-semibold text-gray-900 text-right text-xs sm:text-sm max-w-[180px] break-words">{event.theme}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-2 sm:py-3">
                    <span className="text-gray-600 text-xs sm:text-sm">Type</span>
                    <span className="bg-teal-100/60 backdrop-blur-sm text-teal-800 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold border border-teal-200/40">{event.type}</span>
                  </div>
                </div>

                {/* Actions iOS 26 */}
                <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200/40">
                  <button className="flex-1 flex items-center justify-center gap-1 sm:gap-2 p-2 sm:p-3 rounded-lg bg-white/60 backdrop-blur-sm hover:bg-white/80 transition text-gray-700 font-medium text-xs sm:text-sm border border-gray-200/40">
                    <Share2 size={16} sm:size={18} />
                    <span className="hidden sm:inline">Partager</span>
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1 sm:gap-2 p-2 sm:p-3 rounded-lg bg-white/60 backdrop-blur-sm hover:bg-white/80 transition text-gray-700 font-medium text-xs sm:text-sm border border-gray-200/40">
                    <Heart size={16} sm:size={18} />
                    <span className="hidden sm:inline">J'aime</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showFormModal && (
        <EventRegistrationFormModal
          event={event}
          form={event.form}
          onClose={() => setShowFormModal(false)}
          onSuccess={handleFormSuccess}
        />
      )}
    </MainLayout>
  );
}
