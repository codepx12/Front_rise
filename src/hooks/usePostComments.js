import { useState, useEffect, useCallback } from 'react';
import { websocketService } from '../services/websocketService';
import { postService } from '../services/postService';

/**
 * Hook personnalisé pour gérer les commentaires en temps réel
 * @param {string} postId - L'ID du post
 * @returns {Object} - État et fonctions pour gérer les commentaires
 */
export const usePostComments = (postId) => {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Charger les commentaires initialement
  useEffect(() => {
    const loadComments = async () => {
      setIsLoading(true);
      try {
        const data = await postService.getPostComments(postId);
        setComments(data);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement des commentaires:', err);
        setError('Erreur lors du chargement des commentaires');
      } finally {
        setIsLoading(false);
      }
    };

    loadComments();
  }, [postId]);

  // Écouter les mises à jour en temps réel des commentaires
  useEffect(() => {
    const unsubscribeCommentAdded = websocketService.on('CommentAdded', async (data) => {
      if (data.postId === postId) {
        // Recharger les commentaires
        try {
          const updatedComments = await postService.getPostComments(postId);
          setComments(updatedComments);
        } catch (err) {
          console.error('Erreur lors de la mise à jour des commentaires:', err);
        }
      }
    });

    const unsubscribeCommentReactionUpdated = websocketService.on(
      'CommentReactionUpdated',
      async (data) => {
        if (data.postId === postId) {
          // Recharger les commentaires pour mettre à jour les réactions
          try {
            const updatedComments = await postService.getPostComments(postId);
            setComments(updatedComments);
          } catch (err) {
            console.error('Erreur lors de la mise à jour des réactions:', err);
          }
        }
      }
    );

    return () => {
      unsubscribeCommentAdded();
      unsubscribeCommentReactionUpdated();
    };
  }, [postId]);

  // Ajouter un commentaire
  const addComment = useCallback(
    async (commentData) => {
      try {
        const newComment = await postService.addComment({
          ...commentData,
          postId,
        });

        // Ajouter le commentaire à la liste optimistically
        setComments([newComment, ...comments]);

        // Notifier les autres clients
        await websocketService.notifyCommentAdded(postId);

        return newComment;
      } catch (err) {
        console.error('Erreur lors de l\'ajout du commentaire:', err);
        throw err;
      }
    },
    [postId, comments]
  );

  // Supprimer un commentaire
  const deleteComment = useCallback(
    async (commentId) => {
      try {
        await postService.deleteComment(commentId);
        setComments(comments.filter(c => c.id !== commentId));
      } catch (err) {
        console.error('Erreur lors de la suppression du commentaire:', err);
        throw err;
      }
    },
    [comments]
  );

  return {
    comments,
    isLoading,
    error,
    addComment,
    deleteComment,
    refreshComments: async () => {
      try {
        const data = await postService.getPostComments(postId);
        setComments(data);
      } catch (err) {
        console.error('Erreur lors du rafraîchissement des commentaires:', err);
      }
    },
  };
};
