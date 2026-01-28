import { useState, useEffect, useCallback } from 'react';
import { websocketService } from '../services/websocketService';
import { postService } from '../services/postService';

/**
 * Hook personnalisé pour gérer les likes et commentaires en temps réel
 * @param {Object} post - Les données du post
 * @param {string} userId - L'ID de l'utilisateur courant
 * @returns {Object} - État et fonctions pour gérer les likes
 */
export const usePostLikes = (post, userId) => {
  const [postData, setPostData] = useState(post);
  const [isLiked, setIsLiked] = useState(
    post?.likedByUserIds?.includes(userId) || false
  );
  const [likeCount, setLikeCount] = useState(post?.reactionCount || 0);
  const [isLoading, setIsLoading] = useState(false);

  // Écouter les mises à jour en temps réel du like
  useEffect(() => {
    const unsubscribeLike = websocketService.on('PostLikeUpdated', (data) => {
      if (data.postId === post?.id) {
        setPostData(data.post);
        setLikeCount(data.reactionCount);
        setIsLiked(data.post?.likedByUserIds?.includes(userId) || false);
      }
    });

    const unsubscribeLikeToggle = websocketService.on('PostLikeToggled', (data) => {
      if (data.postId === post?.id) {
        setPostData(data.post);
        setLikeCount(data.reactionCount);
        setIsLiked(data.isLiked);
      }
    });

    const unsubscribeComment = websocketService.on('CommentAdded', (data) => {
      if (data.postId === post?.id) {
        setPostData(prevPost => ({
          ...prevPost,
          commentCount: data.commentCount,
        }));
      }
    });

    return () => {
      unsubscribeLike();
      unsubscribeLikeToggle();
      unsubscribeComment();
    };
  }, [post?.id, userId]);

  // Gérer le like/unlike
  const handleLike = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      await postService.addReaction({
        postId: post.id,
        emojiType: 'like',
      });

      // Optimistic update
      const newIsLiked = !isLiked;
      setIsLiked(newIsLiked);
      setLikeCount(newIsLiked ? likeCount + 1 : Math.max(0, likeCount - 1));

      // Notifier les autres clients via WebSocket
      await websocketService.notifyPostLikeUpdated(post.id);
    } catch (error) {
      console.error('Erreur lors du like:', error);
      // Restaurer l'état en cas d'erreur
      setIsLiked(!isLiked);
      setLikeCount(isLiked ? likeCount + 1 : Math.max(0, likeCount - 1));
    } finally {
      setIsLoading(false);
    }
  }, [post.id, isLiked, likeCount, isLoading]);

  return {
    postData,
    isLiked,
    likeCount,
    isLoading,
    handleLike,
    likedByUserIds: postData?.likedByUserIds || [],
  };
};
