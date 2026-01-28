import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventStore } from '../store/eventStore';
import { useAuthStore } from '../store/authStore';
import { Calendar, MapPin, Users, ChevronDown, ChevronUp, Clock, ArrowRight } from 'lucide-react';
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
    ? events
    : events.filter((e) => e.type.toLowerCase() === filter.toLowerCase());

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
      {/* Page Header - Mono #2E7379 */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-end gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg border border-opacity-20" style={{ backgroundColor: '#2E7379' }}>
              <Calendar size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-black text-gray-900 tracking-tight">Événements</h1>
              <div className="flex items-center gap-2 mt-2">
                <div className="h-1 w-8 rounded-full" style={{ backgroundColor: '#2E7379' }}></div>
                <p className="text-gray-600 font-medium">Découvrez nos événements passionnants</p>
              </div>
            </div>
          </div>
          <div className="text-4xl">📅</div>
        </div>
      </div>

      {/* Filters - Mono #2E7379 */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <div className="w-1 h-6 rounded" style={{ backgroundColor: '#2E7379' }}></div>
          Filtrer par type
        </h2>
        <div className="flex flex-wrap gap-3 bg-white/40 backdrop-blur-xl p-4 rounded-2xl border border-gray-200/40 shadow-sm">
          {eventTypes.map((type) => (
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
              {type === 'all' ? '🎯 Tous' : type}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((event) => {
            const daysUntil = getDaysUntil(event.startDate);
            const isUpcoming = daysUntil >= 0;
            
            return (
              <div
                key={event.id}
                className="group relative bg-white/40 backdrop-blur-xl rounded-3xl overflow-hidden flex flex-col h-full shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200/40"
              >
                {/* Image Container */}
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  {/* Type Badge */}
                  <div className="absolute top-4 left-4 px-4 py-2 rounded-full text-xs font-bold border bg-white/80 backdrop-blur-sm text-gray-700 border-gray-200/40">
                    {event.type}
                  </div>

                  {/* Days Countdown */}
                  {isUpcoming && (
                    <div className="absolute top-4 right-4 text-white px-4 py-2 rounded-xl font-bold shadow-lg flex items-center gap-2 backdrop-blur-sm border border-opacity-20" style={{ backgroundColor: '#2E7379' }}>
                      <Clock size={16} />
                      <span className="text-sm">{daysUntil === 0 ? 'Aujourd\'hui' : `${daysUntil}j`}</span>
                    </div>
                  )}

                  {/* Bottom gradient fade */}
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>

                {/* Card Content */}
                <div className="p-6 flex flex-col flex-grow">
                  {/* Title */}
                  <h3 className="font-bold text-lg text-gray-900 mb-3 line-clamp-2">
                    {event.name}
                  </h3>

                  {/* Description */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                      {truncateDescription(
                        event.description,
                        expandedDescriptions[event.id],
                        event.id,
                        80
                      )}
                    </p>
                    {event.description && event.description.length > 80 && (
                      <button
                        onClick={() => toggleDescription(event.id)}
                        className="mt-2 font-semibold text-xs flex items-center gap-1 transition uppercase tracking-wide"
                        style={{ color: '#2E7379' }}
                      >
                        {expandedDescriptions[event.id] ? (
                          <>
                            <ChevronUp size={14} /> Voir moins
                          </>
                        ) : (
                          <>
                            <ChevronDown size={14} /> Voir plus
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Event Details */}
                  <div className="space-y-3 mb-6 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/40">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg border border-opacity-20 text-white" style={{ backgroundColor: '#2E7379' }}>
                        <Calendar size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-600 uppercase font-semibold">Date</p>
                        <p className="text-sm font-bold text-gray-800 truncate">{new Date(event.startDate).toLocaleDateString('fr-FR', { 
                          weekday: 'short', 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg border border-opacity-20 text-white" style={{ backgroundColor: '#2E7379' }}>
                        <MapPin size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-600 uppercase font-semibold">Lieu</p>
                        <p className="text-sm font-bold text-gray-800 truncate">{event.location}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg border border-opacity-20 text-white" style={{ backgroundColor: '#2E7379' }}>
                        <Users size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-600 uppercase font-semibold">Participants</p>
                        <p className="text-sm font-bold text-gray-800">{event.registeredCount || 0}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-auto pt-2">
                    <button
                      onClick={() => navigate(`/events/${event.id}`)}
                      className="flex-1 text-white py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-bold shadow-md active:scale-95 flex items-center justify-center gap-2 backdrop-blur-sm border border-opacity-20"
                      style={{ backgroundColor: '#2E7379' }}
                    >
                      Détails
                      <ArrowRight size={16} />
                    </button>
                    {!event.isUserRegistered && (
                      <button
                        onClick={() => handleRegisterClick(event)}
                        className="flex-1 bg-white/80 backdrop-blur-sm text-gray-800 py-3 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-300 font-bold shadow-sm active:scale-95 border border-gray-300/40"
                      >
                        {event.form ? '📋' : '✓'} {event.form ? 'Formulaire' : 'S\'inscrire'}
                      </button>
                    )}
                    {event.isUserRegistered && (
                      <button
                        disabled
                        className="flex-1 bg-gray-100/60 text-gray-400 py-3 rounded-xl cursor-not-allowed font-bold opacity-60 backdrop-blur-sm border border-gray-200/40"
                      >
                        ✓ Inscrit
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
