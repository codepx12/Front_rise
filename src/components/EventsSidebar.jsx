import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, AlertCircle, ChevronRight } from 'lucide-react';

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
    <div className="hidden lg:block w-72 shrink-0">
      <aside className="fixed right-0 top-20 w-72 h-[calc(100vh-80px)] overflow-y-auto pr-1" aria-label="Barre latérale des événements">
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

        {/* Conteneur principal - fond clair (EDF0FC) */}
        <div className="p-3 bg-[#EDF0FC] rounded-3xl h-full scrollbar-hide">

          {/* Événements Récents */}
          <section className="mb-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#C4DBDD] rounded-md flex items-center justify-center">
                  <Calendar size={18} className="text-[#2E7379]" />
                </div>
                <h3 className="font-semibold text-black text-lg leading-tight">Événements</h3>
              </div>

              <button
                onClick={() => navigate('/events')}
                className="text-sm text-black hover:text-[#2E7379] focus:outline-none focus:underline"
                aria-label="Voir tous les événements"
              >
                Voir tout
              </button>
            </div>

            <div className="space-y-3">
              {events && events.length > 0 ? (
                events.slice(0, 5).map((event) => (
                  <div
                    key={event.id}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate(`/events/${event.id}`); }}
                    onClick={() => navigate(`/events/${event.id}`)}
                    className="flex flex-col bg-white rounded-md border border-[#C4DBDD] p-3 hover:shadow-md transition-all duration-200 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-[#C4DBDD] focus:ring-offset-2 focus:ring-offset-[#EDF0FC]"
                  >
                    {/* Image du poster */}
                    {event.posterUrl && (
                      <img
                        src={event.posterUrl}
                        alt={event.name}
                        className="w-full h-20 object-cover rounded-md mb-3 transition-shadow"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    )}

                    <h4 className="font-semibold text-sm text-black line-clamp-2 mb-1">
                      {event.name}
                    </h4>

                    <div className="flex flex-wrap gap-3 items-center text-xs text-black">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} className="text-[#2E7379]" />
                        <span className="text-xs text-black">{formatDate(event.startDate)}</span>
                      </div>

                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin size={12} className="text-[#2E7379]" />
                          <span className="text-xs text-black truncate">{event.location}</span>
                        </div>
                      )}

                      {event.registeredCount !== undefined && (
                        <div className="flex items-center gap-1">
                          <Users size={12} className="text-[#2E7379]" />
                          <span className="text-xs font-semibold text-black">{event.registeredCount} inscrit{event.registeredCount > 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/events/${event.id}`); }}
                      aria-label={`Voir détails ${event.name}`}
                      className="mt-3 w-full bg-[#2E7379] hover:opacity-95 text-white text-xs font-semibold py-2 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-[#2E7379] focus:ring-offset-2 focus:ring-offset-[#EDF0FC]"
                    >
                      Voir détails
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-center text-black opacity-70 py-4">Aucun événement</p>
              )}
            </div>
          </section>

          {/* À découvrir */}
          <section>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-[#C4DBDD] rounded-md flex items-center justify-center">
                <AlertCircle size={18} className="text-[#2E7379]" />
              </div>
              <h3 className="font-semibold text-black text-lg leading-tight">À découvrir</h3>
            </div>

            <div className="space-y-2">
              {events && events.length > 0 ? (
                events.slice(0, 4).map((event) => (
                  <div
                    key={event.id}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate(`/events/${event.id}`); }}
                    onClick={() => navigate(`/events/${event.id}`)}
                    className="flex items-center justify-between bg-white rounded-md border border-[#C4DBDD] p-3 hover:shadow-sm transition duration-200 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2E7379] focus:ring-offset-2 focus:ring-offset-[#EDF0FC]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-md bg-[#C4DBDD] flex items-center justify-center text-[#2E7379] font-semibold text-sm overflow-hidden">
                        {event.posterUrl ? (
                          <img src={event.posterUrl} alt={event.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                        ) : (
                          <span className="text-sm text-black">{event.name?.charAt(0)}</span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm text-black font-medium truncate">{event.name}</p>
                        {event.location && <p className="text-xs text-black opacity-80 truncate">{event.location}</p>}
                      </div>
                    </div>

                    <ChevronRight size={16} className="text-[#2E7379] opacity-70" />
                  </div>
                ))
              ) : (
                <p className="text-center text-black opacity-70 py-4">Aucun événement</p>
              )}
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}