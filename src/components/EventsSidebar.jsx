import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, FileText, AlertCircle, ChevronRight } from 'lucide-react';

export default function EventsSidebar({ events }) {
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="hidden lg:block w-72 flex-shrink-0">
      <div className="fixed right-0 top-20 w-72 h-[calc(100vh-80px)] overflow-y-auto pr-1">
        <style>{`
          .scrollbar-hide::-webkit-scrollbar {
            width: 6px;
          }
          .scrollbar-hide::-webkit-scrollbar-track {
            background: transparent;
          }
          .scrollbar-hide::-webkit-scrollbar-thumb {
            background: rgba(0, 0, 0, 0.15);
            border-radius: 10px;
          }
          .scrollbar-hide::-webkit-scrollbar-thumb:hover {
            background: rgba(0, 0, 0, 0.25);
          }
        `}</style>

        {/* Événements Récents - iOS 26 Mono Style */}
        <div className="bg-white/20 backdrop-blur-3xl rounded-3xl shadow-xl border border-white/30 p-5 mb-6 scrollbar-hide">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 bg-white/20 backdrop-blur-2xl rounded-lg">
              <Calendar size={18} className="text-gray-700" />
            </div>
            <h3 className="font-bold text-gray-950 text-lg">Événements</h3>
          </div>
          <div className="space-y-3">
            {events && events.length > 0 ? (
              events.slice(0, 5).map((event) => (
                <div
                  key={event.id}
                  onClick={() => navigate(`/events/${event.id}`)}
                  className="bg-white/15 backdrop-blur-2xl rounded-xl p-3 hover:bg-white/25 transition-all duration-200 cursor-pointer border border-white/20 group"
                >
                  {/* Event Poster */}
                  {event.posterUrl && (
                    <img
                      src={event.posterUrl}
                      alt={event.name}
                      className="w-full h-20 object-cover rounded-lg mb-2 group-hover:shadow-lg transition opacity-80 group-hover:opacity-100"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}

                  {/* Event Name */}
                  <h4 className="font-semibold text-sm text-gray-950 line-clamp-2 mb-2">
                    {event.name}
                  </h4>

                  {/* Event Details - Minimal */}
                  <div className="space-y-1 text-xs text-gray-700">
                    {/* Date */}
                    <div className="flex items-center gap-2">
                      <Calendar size={12} className="text-gray-600 shrink-0" />
                      <span className="line-clamp-1 text-gray-800">
                        {formatDate(event.startDate)}
                      </span>
                    </div>

                    {/* Location */}
                    {event.location && (
                      <div className="flex items-center gap-2">
                        <MapPin size={12} className="text-gray-600 shrink-0" />
                        <span className="line-clamp-1 text-gray-800">{event.location}</span>
                      </div>
                    )}

                    {/* Registered Count */}
                    {event.registeredCount !== undefined && (
                      <div className="flex items-center gap-2">
                        <Users size={12} className="text-gray-600 shrink-0" />
                        <span className="text-gray-800">{event.registeredCount} inscrit{event.registeredCount > 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>

                  {/* View Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/events/${event.id}`);
                    }}
                    className="mt-3 w-full bg-white/30 hover:bg-white/40 text-gray-950 text-xs font-semibold py-2 rounded-lg transition duration-200 border border-white/30"
                  >
                    Voir détails
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-700 text-sm text-center py-4">Aucun événement</p>
            )}
          </div>
        </div>

        {/* Suggestions pour vous */}
        <div className="bg-white/20 backdrop-blur-3xl rounded-3xl shadow-xl border border-white/30 p-5 scrollbar-hide">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 bg-white/20 backdrop-blur-2xl rounded-lg">
              <AlertCircle size={18} className="text-gray-700" />
            </div>
            <h3 className="font-bold text-gray-950 text-lg">À découvrir</h3>
          </div>
          <div className="space-y-2">
            {events && events.length > 0 ? (
              events.slice(0, 4).map((event) => (
                <div 
                  key={event.id} 
                  onClick={() => navigate(`/events/${event.id}`)}
                  className="p-3 bg-white/15 backdrop-blur-2xl border border-white/20 rounded-lg hover:bg-white/25 transition-all duration-200 group cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-sm text-gray-950 truncate flex-1">
                      {event.name}
                    </p>
                    <ChevronRight size={14} className="text-gray-500 group-hover:text-gray-700 transition shrink-0" />
                  </div>
                  
                  {event.location && (
                    <p className="text-xs text-gray-700 mt-1.5 flex items-center gap-1.5">
                      <MapPin size={11} className="text-gray-600 shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-700 text-sm text-center py-4">Aucun événement</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}