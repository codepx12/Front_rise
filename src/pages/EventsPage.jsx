import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventStore } from '../store/eventStore';
import { useAuthStore } from '../store/authStore';
import { Calendar, MapPin, Users, Clock, ArrowRight } from 'lucide-react';
import MainLayout from '../components/MainLayout';
import EventRegistrationFormModal from '../components/EventRegistrationFormModal';

export default function EventsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { events, fetchAllEvents, loading } = useEventStore();
  const [filter, setFilter] = useState('all');
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [registrationModal, setRegistrationModal] = useState({
    isOpen: false,
    event: null
  });

  useEffect(() => {
    fetchAllEvents();
  }, []);

  const filteredEvents = filter === 'all'
    ? events.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    : events
        .filter((e) => e.type.toLowerCase() === filter.toLowerCase())
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const availableEventTypes = Array.from(
    new Set(events.map(event => event.type).filter(Boolean))
  ).sort();
  
  const eventTypes = ['all', ...availableEventTypes];

  const toggleDescription = (eventId) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [eventId]: !prev[eventId]
    }));
  };

  const truncateDescription = (description, isExpanded, eventId, maxLength = 100) => {
    if (!description) return '';
    if (isExpanded || description.length <= maxLength) {
      return description;
    }
    return description.substring(0, maxLength) + '...';
  };

  const getDaysUntil = (eventDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const event = new Date(eventDate);
    event.setHours(0, 0, 0, 0);
    const timeDiff = event - today;
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    return daysDiff;
  };

  const handleRegisterClick = (event) => {
    if (event.form) {
      setRegistrationModal({
        isOpen: true,
        event: event
      });
    } else {
      navigate(`/events/${event.id}/register`);
    }
  };

  const handleRegistrationSuccess = () => {
    setRegistrationModal({ isOpen: false, event: null });
    fetchAllEvents();
  };

  return (
    <MainLayout>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Événements</h1>
        <p className="text-sm text-gray-600 mt-1">Découvrez les événements à venir</p>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {eventTypes.map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                filter === type
                  ? 'text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
              style={filter === type ? { backgroundColor: '#2E7379' } : {}}
            >
              {type === 'all' ? 'Tous' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="text-center text-gray-600 py-16">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200" style={{ borderTopColor: '#2E7379' }}></div>
            <p className="mt-6 text-lg font-medium">Chargement des événements...</p>
          </div>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center text-gray-600 py-16 bg-white/40 backdrop-blur-xl rounded-3xl border border-gray-200/40 shadow-sm">
          <p className="text-xl font-medium">Aucun événement trouvé</p>
          <p className="text-gray-500 mt-2">Essayez de changer de filtre</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEvents.map((event) => {
            const daysUntil = getDaysUntil(event.startDate);
            const isUpcoming = daysUntil >= 0;
            
            return (
              <div
                key={event.id}
                className="group relative bg-white rounded-2xl overflow-hidden flex flex-col shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200"
              >
                {/* Image Container */}
                <div className="relative h-48 overflow-hidden bg-gray-200">
                  {/* Image */}
                  {event.imageUrls && event.imageUrls.length > 0 ? (
                    <img
                      src={event.imageUrls[0]}
                      alt={event.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : event.posterUrl ? (
                    <img
                      src={event.posterUrl}
                      alt={event.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                      <span className="text-5xl">📅</span>
                    </div>
                  )}

                  {/* Type Badge */}
                  <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full text-xs font-bold bg-white/90 text-gray-700 border border-gray-200">
                    {event.type}
                  </div>

                  {/* Days Countdown */}
                  {isUpcoming && (
                    <div className="absolute top-3 right-3 text-white px-3 py-1.5 rounded-lg font-bold shadow-lg flex items-center gap-1.5 text-xs" style={{ backgroundColor: '#2E7379' }}>
                      <Clock size={14} />
                      <span>{daysUntil === 0 ? 'Auj.' : `${daysUntil}j`}</span>
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-4 flex flex-col flex-grow">
                  {/* Title */}
                  <h3 className="font-bold text-base text-gray-900 mb-3 line-clamp-2 h-14">
                    {event.name}
                  </h3>

                  {/* Date and Location */}
                  <div className="space-y-2 mb-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} style={{ color: '#2E7379' }} className="flex-shrink-0" />
                      <span className="truncate">{new Date(event.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={14} style={{ color: '#2E7379' }} className="flex-shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={14} style={{ color: '#2E7379' }} className="flex-shrink-0" />
                      <span>{event.registeredCount || 0} inscrit{event.registeredCount !== 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex gap-2 mt-auto pt-3">
                    <button
                      onClick={() => navigate(`/events/${event.id}`)}
                      className="flex-1 text-white py-2.5 rounded-lg hover:shadow-lg transition-all duration-300 font-semibold text-sm active:scale-95 shadow-sm"
                      style={{ backgroundColor: '#2E7379' }}
                    >
                      Détails
                    </button>
                    {!event.isUserRegistered && (
                      <button
                        onClick={() => handleRegisterClick(event)}
                        className="flex-1 bg-gray-100 text-gray-800 py-2.5 rounded-lg hover:bg-gray-200 transition-all duration-300 font-semibold text-sm active:scale-95 border border-gray-300"
                      >
                        S'inscrire
                      </button>
                    )}
                    {event.isUserRegistered && (
                      <button
                        disabled
                        className="flex-1 bg-gray-50 text-gray-400 py-2.5 rounded-lg cursor-not-allowed font-semibold text-sm border border-gray-200"
                      >
                        Inscrit ✓
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Registration Modal */}
      {registrationModal.isOpen && registrationModal.event && (
        <EventRegistrationFormModal
          event={registrationModal.event}
          form={registrationModal.event.form}
          onClose={() => setRegistrationModal({ isOpen: false, event: null })}
          onSuccess={handleRegistrationSuccess}
        />
      )}
    </MainLayout>
  );
}
