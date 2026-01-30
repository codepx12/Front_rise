import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useEventStore } from '../store/eventStore';
import { usePollStore } from '../store/pollStore';
import { useVoteStore } from '../store/voteStore';
import { useSignalR } from '../hooks/useSignalR';
import { formatRelativeDate } from '../utils/dateFormatter';
import MainLayout from '../components/MainLayout';
import EventsSidebar from '../components/EventsSidebar';
import PostCard from '../components/PostCard';
import {
  Heart,
  MessageSquare,
  Share2,
  X,
} from 'lucide-react';
import apiClient from '../services/api';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { events, fetchAllEvents } = useEventStore();
  const { polls, fetchAllPolls } = usePollStore();
  const { votes, fetchAllVotes } = useVoteStore();

  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [selectedPostForComment, setSelectedPostForComment] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [userReactions, setUserReactions] = useState({});
  const [expandedPosts, setExpandedPosts] = useState(new Set());
  const [commentReactions, setCommentReactions] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Charger les réactions depuis le localStorage au montage
  useEffect(() => {
    const savedReactions = localStorage.getItem('userReactions');
    if (savedReactions) {
      try {
        setUserReactions(JSON.parse(savedReactions));
        console.log('✅ Réactions chargées du localStorage:', JSON.parse(savedReactions));
      } catch (e) {
        console.error('Erreur lors du chargement des réactions:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchAllEvents();
    fetchAllPolls();
    fetchAllVotes();
    fetchPosts();
  }, [user, navigate, fetchAllEvents, fetchAllPolls, fetchAllVotes]);

  const fetchPosts = async () => {
    try {
      setLoadingPosts(true);
      const response = await apiClient.get('/posts');
      setPosts(response.data || []);
      
      // Récupérer les réactions de l'utilisateur depuis le serveur
      try {
        const reactionsResponse = await apiClient.get('/posts/user-reactions');
        const serverReactions = {};
        if (reactionsResponse.data && Array.isArray(reactionsResponse.data)) {
          reactionsResponse.data.forEach(reaction => {
            serverReactions[reaction.postId] = true;
          });
        }
        setUserReactions(serverReactions);
        localStorage.setItem('userReactions', JSON.stringify(serverReactions));
        console.log('✅ Réactions chargées du serveur:', serverReactions);
      } catch (err) {
        console.warn('Impossible de charger les réactions du serveur, utilisation du localStorage');
        // En cas d'erreur, utiliser le localStorage (déjà chargé)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des posts:', error);
      setPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleLikePost = async (postId) => {
    try {
      // Mettre à jour l'état local immédiatement pour une réaction rapide (optimistic update)
      const newReactions = {
        ...userReactions,
        [postId]: !userReactions[postId]
      };
      setUserReactions(newReactions);
      
      // Sauvegarder dans le localStorage
      localStorage.setItem('userReactions', JSON.stringify(newReactions));
      console.log('💾 Réactions sauvegardées dans localStorage:', newReactions);

      // Envoyer la requête au serveur
      const response = await apiClient.post('/posts/reaction', { 
        postId: postId, 
        emojiType: 'like',
        commentId: null
      });

      // Mettre à jour uniquement le post liké avec les données du serveur
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId 
            ? { 
                ...post, 
                reactionCount: response.data.reactionCount || post.reactionCount,
              }
            : post
        )
      );

      // IMPORTANT: Ne pas réinitialiser userReactions depuis le serveur
      // On garde l'optimistic update local (newReactions)
      // La réponse du serveur ne doit mettre à jour que reactionCount
      console.log('✅ Like mis à jour (optimistic):', newReactions);
    } catch (error) {
      console.error('Erreur lors du like:', error);
      // Annuler le changement local en cas d'erreur
      const canceledReactions = {
        ...userReactions,
        [postId]: !userReactions[postId]
      };
      setUserReactions(canceledReactions);
      localStorage.setItem('userReactions', JSON.stringify(canceledReactions));
    }
  };

  const handleCommentPost = (postId) => {
    setSelectedPostForComment(postId);
    setCommentText('');
  };

  const handleSendComment = async () => {
    if (!selectedPostForComment || !commentText.trim()) return;

    try {
      const response = await apiClient.post('/posts/comment', {
        postId: selectedPostForComment,
        content: commentText,
        parentCommentId: null,
        taggedUsernames: []
      });

      setPosts(posts.map(post =>
        post.id === selectedPostForComment
          ? { 
              ...post, 
              commentCount: post.commentCount + 1,
              comments: [...(post.comments || []), response.data]
            }
          : post
      ));

      setCommentText('');
      setSelectedPostForComment(null);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du commentaire:', error);
    }
  };

  const toggleComments = (postId) => {
    const newExpanded = new Set(expandedPosts);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
    }
    setExpandedPosts(newExpanded);
  };

  const handleCommentAdded = useCallback((data) => {
    console.log('Commentaire ajouté au post:', data);
    
    // ✅ Mettre à jour LOCALEMENT au lieu de recharger tous les posts
    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (post.id === data.postId) {
          return {
            ...post,
            commentCount: data.commentCount,
            comments: [...(post.comments || []), data.comment]
          };
        }
        return post;
      })
    );
  }, []);

  const handlePostReactionUpdated = useCallback((postId, reactionCount) => {
    console.log('Réaction mise à jour:', postId, reactionCount);
    setPosts(prevPosts => {
      const updatedPosts = prevPosts.map(post => {
        if (post.id === postId) {
          (async () => {
            try {
              const response = await apiClient.get(`/posts/${postId}`);
              setPosts(prevPosts =>
                prevPosts.map(p =>
                  p.id === postId ? response.data : p
                )
              );
            } catch (error) {
              console.error('Erreur lors du rechargement du post:', error);
            }
          })();
          return post;
        }
        return post;
      });
      return updatedPosts;
    });
  }, []);

  const handleCommentReactionUpdated = useCallback((commentId) => {
    console.log('Réaction au commentaire mise à jour:', commentId);
  }, []);

  useSignalR(handleCommentAdded, handlePostReactionUpdated, handleCommentReactionUpdated);

  return (
    <MainLayout showSidebars={true}>
      <div className="w-full py-1 px-1 sm:px-3 md:px-4 lg:px-5 h-screen  flex flex-col ">
        {/* Container Principal */}
        <div className="flex-1 overflow-y-auto max-w-full mx-auto flex gap-2 sm:gap-3 lg:gap-4 w-full bg-gray-100">
          {/* Fil d'actualité des Posts - Flexible */}
          <div className="flex-1 min-w-0 w-full">
            <section>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-2 sm:mb-3 lg:mb-4 px-1 sm:px-0 ">
               Fil d'actualité
              </h2>
              {loadingPosts ? (
                <div className="space-y-2 sm:space-y-3">
                  {/* Skeleton Loaders - Maintain height during loading */}
                  {[...Array(3)].map((_, idx) => (
                    <div key={idx} className="bg-white/40 backdrop-blur-2xl rounded-2xl shadow-sm border border-gray-200/40 animate-pulse overflow-hidden">
                      {/* Header Skeleton */}
                      <div className="px-2 sm:px-4 py-3 flex justify-between items-center border-b border-gray-200/40">
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                          <div className="w-9 h-9 sm:w-11 sm:h-11 bg-gray-200/40 rounded-full shrink-0"></div>
                          <div className="flex-1 space-y-1.5 sm:space-y-2 min-w-0">
                            <div className="h-3 sm:h-4 bg-gray-200/40 rounded w-20 sm:w-32"></div>
                            <div className="h-2 sm:h-3 bg-gray-100/40 rounded w-16 sm:w-24"></div>
                          </div>
                        </div>
                        <div className="w-5 h-5 sm:w-8 sm:h-8 bg-gray-200/40 rounded-full shrink-0"></div>
                      </div>

                      {/* Content Skeleton */}
                      <div className="px-2 sm:px-4 py-2 sm:py-4 space-y-1.5 sm:space-y-3">
                        <div className="h-2.5 sm:h-4 bg-gray-200/40 rounded w-full"></div>
                        <div className="h-2.5 sm:h-4 bg-gray-200/40 rounded w-5/6"></div>
                        <div className="h-2.5 sm:h-4 bg-gray-200/40 rounded w-4/6"></div>
                      </div>

                      {/* Image Skeleton */}
                      <div className="bg-linear-to-b from-gray-100/40 to-gray-50/40 h-40 sm:h-56 md:h-80"></div>

                      {/* Actions Skeleton */}
                      <div className="px-2 sm:px-4 py-3 border-t border-gray-200/40">
                        <div className="flex gap-2 sm:gap-4 mb-2 sm:mb-3">
                          {[...Array(4)].map((_, i) => (
                            <div key={i} className="w-4 h-4 sm:w-6 sm:h-6 bg-gray-200/40 rounded"></div>
                          ))}
                        </div>
                        <div className="space-y-1 sm:space-y-2">
                          <div className="h-2.5 sm:h-4 bg-gray-200/40 rounded w-24 sm:w-32"></div>
                          <div className="h-2.5 sm:h-4 bg-gray-200/40 rounded w-32 sm:w-40"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : posts && posts.length > 0 ? (
                <div className="space-y-2 sm:space-y-3">
                  {posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onLike={handleLikePost}
                      onComment={handleCommentPost}
                      onCommentSend={handleSendComment}
                      commentText={commentText}
                      setCommentText={setCommentText}
                      expandedPosts={expandedPosts}
                      toggleComments={toggleComments}
                      selectedPostForComment={selectedPostForComment}
                      setSelectedPostForComment={setSelectedPostForComment}
                      userReactions={userReactions}
                      commentReactions={commentReactions}
                      setCommentReactions={setCommentReactions}
                      replyingTo={replyingTo}
                      setReplyingTo={setReplyingTo}
                      replyText={replyText}
                      setReplyText={setReplyText}
                      fetchPosts={fetchPosts}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white/40 backdrop-blur-2xl rounded-2xl shadow-sm p-6 sm:p-8 text-center border border-gray-200/40">
                  <div className="text-4xl sm:text-5xl mb-2 sm:mb-3">📝</div>
                  <p className="text-gray-700 text-base sm:text-lg font-medium mb-1">Aucune publication pour le moment</p>
                  <p className="text-gray-600 text-xs sm:text-sm">Les publications apparaîtront ici</p>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar Droit - Événements et Suggestions - Caché sur mobile, visible sur lg */}
          <div className="hidden lg:flex shrink-0 w-72">
            <EventsSidebar events={events} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
