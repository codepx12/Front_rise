import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Trash2, Heart, MessageSquare, Plus, X, Calendar, MapPin, Users } from 'lucide-react';
import apiClient from '../services/api';
import AdminLayout from '../components/AdminLayout';

export default function AdminPostsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [posts, setPosts] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedImagePost, setExpandedImagePost] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (user?.role !== 'Admin') {
      navigate('/dashboard');
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Récupérer les posts
      const postsResponse = await apiClient.get('/posts/admin');
      setPosts(postsResponse.data);

      // Récupérer les événements publiés
      const eventsResponse = await apiClient.get('/events/admin/all');
      const publishedEvents = eventsResponse.data.filter(e => e.isPublished);
      setEvents(publishedEvents);

      setError(null);
    } catch (error) {
      console.error('Erreur:', error);
      setError('Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette publication ?')) {
      try {
        await apiClient.delete(`/posts/${postId}`);
        setPosts(posts.filter(p => p.id !== postId));
      } catch (error) {
        console.error('Erreur:', error);
        setError('Erreur lors de la suppression');
      }
    }
  };

  if (loading) {
    return (
      <AdminLayout pageTitle="Flux d'actualité">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-teal-200 border-t-teal-600 animate-spin"></div>
            <p className="text-gray-600 font-medium">Chargement des publications...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const allItems = getAllItems();

  return (
    <AdminLayout pageTitle="Flux d'actualité">
      <div className="w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4 mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Publications et Événements</h2>
          <button
            onClick={() => navigate('/admin/posts/create')}
            className="flex items-center gap-2 px-3 md:px-6 py-2 md:py-3 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 rounded-xl transition font-semibold text-white shadow-lg backdrop-blur-sm border border-teal-400/30 text-sm md:text-base whitespace-nowrap"
          >
            <Plus size={18} className="md:size-5" /> <span className="hidden sm:inline">Créer Post</span><span className="sm:hidden">+</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-50/60 backdrop-blur-lg border border-red-200/40 border-l-4 border-l-red-600 text-red-700 px-4 md:px-6 py-3 md:py-4 rounded-2xl mb-6 md:mb-8 shadow-sm text-sm">
            <p className="font-semibold">Erreur</p>
            <p className="text-xs md:text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Tabs iOS 26 */}
        <div className="flex gap-2 md:gap-4 mb-6 md:mb-8 bg-white/40 backdrop-blur-xl p-1 rounded-2xl border border-gray-200/40 shadow-sm overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-2 md:py-3 px-2 md:px-4 font-semibold rounded-xl transition-all duration-300 text-xs md:text-base whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-md'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            Tous <span className="hidden sm:inline">({posts.length + events.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-2 md:py-3 px-2 md:px-4 font-semibold rounded-xl transition-all duration-300 text-xs md:text-base whitespace-nowrap ${
              activeTab === 'posts'
                ? 'bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-md'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            Posts <span className="hidden sm:inline">({posts.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`flex-1 py-2 md:py-3 px-2 md:px-4 font-semibold rounded-xl transition-all duration-300 text-xs md:text-base whitespace-nowrap ${
              activeTab === 'events'
                ? 'bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-md'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            Événements <span className="hidden sm:inline">({events.length})</span>
          </button>
        </div>

        {/* Feed */}
        <div className="space-y-4 md:space-y-6">
          {loading ? (
            <div className="text-center text-gray-600 py-12">Chargement...</div>
          ) : allItems.length === 0 ? (
            <div className="text-center py-8 md:py-12 bg-gradient-to-br from-teal-50/40 to-white/30 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-teal-200/40 shadow-sm">
              <p className="text-gray-600 font-medium text-sm md:text-base">Aucune publication</p>
            </div>
          ) : (
            allItems
              .filter(item => {
                if (activeTab === 'posts') return item.type === 'post';
                if (activeTab === 'events') return item.type === 'event';
                return true;
              })
              .map((item) => (
                <div key={`${item.type}-${item.data.id}`}>
                  {item.type === 'post' ? (
                    <PostCard post={item.data} onDelete={handleDeletePost} />
                  ) : (
                    <EventCard event={item.data} />
                  )}
                </div>
              ))
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {expandedImagePost && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-2xl z-50 flex items-center justify-center p-3 md:p-4"
          onClick={() => setExpandedImagePost(null)}
        >
          <div className="max-w-4xl w-full" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setExpandedImagePost(null)}
              className="mb-2 md:mb-4 text-gray-600 hover:text-gray-900 p-2 hover:bg-white/40 rounded-xl transition backdrop-blur-sm border border-gray-200/40"
            >
              <X size={24} className="md:size-8" />
            </button>
            <div className="bg-white/40 backdrop-blur-xl rounded-2xl md:rounded-3xl p-3 md:p-4 border border-gray-200/40 shadow-lg">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 md:gap-2">
                {posts
                  .find(p => p.id === expandedImagePost)
                  ?.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img.imageUrl}
                      alt={`Image ${idx}`}
                      className="w-full h-32 md:h-48 object-cover rounded-lg cursor-pointer hover:opacity-80 transition"
                    />
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );

  function getAllItems() {
    const allItems = [
      ...posts.map(p => ({ type: 'post', data: p, date: new Date(p.createdAt) })),
      ...events.map(e => ({ type: 'event', data: e, date: new Date(e.startDate) }))
    ];
    return allItems.sort((a, b) => b.date - a.date);
  }

  function PostCard({ post, onDelete }) {
    return (
      <div className="bg-white/40 backdrop-blur-xl rounded-2xl md:rounded-3xl shadow-sm overflow-hidden border border-gray-200/40 hover:shadow-lg hover:border-teal-200/60 transition-all duration-300">
        {/* Post Header */}
        <div className="p-4 md:p-6 border-b border-gray-200/40 flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{post.createdByName}</h3>
            <p className="text-gray-600 text-xs md:text-sm mt-1">
              {new Date(post.createdAt).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => navigate(`/admin/posts/edit/${post.id}`)}
              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50/40 rounded-lg transition backdrop-blur-sm border border-blue-200/40"
              title="Modifier"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button
              onClick={() => onDelete(post.id)}
              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50/40 rounded-lg transition backdrop-blur-sm border border-red-200/40"
              title="Supprimer"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {/* Post Content */}
        <div className="p-4 md:p-6">
          <p className="text-gray-700 text-sm md:text-base whitespace-pre-wrap mb-4 line-clamp-3 md:line-clamp-none">{post.content}</p>

          {/* Image Mosaic */}
          {post.images && post.images.length > 0 && renderImageMosaic(post.images, post.id)}
        </div>

        {/* Post Stats */}
        <div className="border-t border-gray-200/40 px-4 md:px-6 py-3 md:py-4 bg-gradient-to-r from-teal-50/40 to-white/30">
          <div className="flex gap-4 md:gap-6 text-gray-600 text-xs md:text-sm">
            <div className="flex items-center gap-2">
              <Heart size={16} className="text-red-500" />
              <span className="font-semibold">{post.reactionCount} j'aime</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare size={16} className="text-teal-600" />
              <span className="font-semibold">{post.commentCount} commentaires</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function EventCard({ event }) {
    return (
      <div className="bg-white/40 backdrop-blur-xl rounded-2xl md:rounded-3xl shadow-sm overflow-hidden border border-gray-200/40 hover:shadow-lg hover:border-teal-200/60 transition-all duration-300">
        {/* Event Poster */}
        {event.posterUrl && (
          <div className="relative h-40 md:h-64 bg-gray-200 overflow-hidden">
            <img
              src={event.posterUrl}
              alt={event.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          </div>
        )}

        {/* Event Content */}
        <div className="p-4 md:p-6">
          <h3 className="font-bold text-base md:text-lg text-gray-900 mb-2">{event.name}</h3>
          
          <p className="text-gray-600 text-xs md:text-sm mb-4 line-clamp-2 md:line-clamp-3">{event.description}</p>

          {/* Event Details */}
          <div className="space-y-2 md:space-y-3 mb-4 md:mb-6 p-3 md:p-4 bg-gradient-to-br from-teal-50/60 to-teal-100/30 backdrop-blur-sm rounded-lg md:rounded-2xl border border-teal-200/40">
            <div className="flex items-center gap-2 text-xs md:text-sm">
              <Calendar size={14} className="text-teal-600 flex-shrink-0" />
              <span className="text-gray-700 font-medium">{new Date(event.startDate).toLocaleDateString('fr-FR')}</span>
            </div>
            <div className="flex items-center gap-2 text-xs md:text-sm">
              <MapPin size={14} className="text-teal-600 flex-shrink-0" />
              <span className="text-gray-700 font-medium truncate">{event.location}</span>
            </div>
            <div className="flex items-center gap-2 text-xs md:text-sm">
              <Users size={14} className="text-teal-600 flex-shrink-0" />
              <span className="text-gray-700 font-medium">{event.registeredCount || 0} / {event.maxParticipants || '∞'}</span>
            </div>
          </div>

          {/* Event Type Badge */}
          <div className="mb-4">
            <span className="inline-flex items-center px-3 md:px-4 py-1 md:py-2 bg-gradient-to-r from-teal-100/60 to-teal-50/40 text-teal-700 text-xs md:text-sm font-bold rounded-full border border-teal-200/40 backdrop-blur-sm">
              {event.type}
            </span>
          </div>

          {/* Action Button */}
          <button
            onClick={() => navigate(`/admin/events`)}
            className="w-full py-2 md:py-3 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white rounded-xl transition font-semibold shadow-md backdrop-blur-sm border border-teal-400/30 text-xs md:text-base"
          >
            Voir les détails
          </button>
        </div>
      </div>
    );
  }

  function renderImageMosaic(images, postId) {
    if (!images || images.length === 0) return null;

    const displayCount = Math.min(images.length, 4);
    const remainingCount = images.length - displayCount;
    const showRemaining = images.length > 4;

    return (
      <div
        className="mt-3 md:mt-4 grid gap-0.5 md:gap-1 cursor-pointer relative rounded-lg md:rounded-2xl overflow-hidden bg-gray-200"
        style={{
          gridTemplateColumns:
            displayCount === 1
              ? '1fr'
              : displayCount === 2
              ? '1fr 1fr'
              : displayCount === 3
              ? '1fr 1fr 1fr'
              : '2fr 1fr 1fr 1fr',
          gridTemplateRows:
            displayCount === 1
              ? 'auto'
              : displayCount === 2
              ? 'auto'
              : displayCount === 3
              ? 'auto'
              : 'auto auto',
        }}
        onClick={() => setExpandedImagePost(postId)}
      >
        {images.slice(0, displayCount).map((img, idx) => (
          <div
            key={idx}
            className={`relative bg-gray-300 overflow-hidden ${
              displayCount === 1
                ? 'h-64 md:h-96'
                : displayCount === 2
                ? 'h-32 md:h-48'
                : displayCount === 3
                ? 'h-32 md:h-40'
                : idx === 0
                ? 'row-span-2 col-span-2 h-64 md:h-96'
                : 'h-32 md:h-48'
            }`}
          >
            <img
              src={img.imageUrl}
              alt={`Post image ${idx}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}

        {showRemaining && displayCount === 4 && (
          <div className="relative bg-gray-300 h-32 md:h-48 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-xl md:text-2xl font-bold">+{remainingCount}</span>
            </div>
            <img
              src={images[3].imageUrl}
              alt="Remaining"
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
    );
  }
}
