/**
 * Exemple de composant Post avec likes et commentaires en temps réel
 * Ce composant montre comment utiliser les nouveaux hooks pour gérer
 * les likes et commentaires avec mises à jour en temps réel via WebSocket
 */

import React, { useState } from 'react';
import { usePostLikes } from '../hooks/usePostLikes';
import { usePostComments } from '../hooks/usePostComments';
import { useAuth } from '../hooks/useAuth'; // À implémenter si absent
import { Heart, MessageCircle, Share2 } from 'lucide-react';

export const PostWithLikesExample = ({ post }) => {
  const { user } = useAuth(); // Utilisateur courant
  
  // Utiliser le hook pour les likes
  const { isLiked, likeCount, handleLike, isLoading: likeLoading } = usePostLikes(
    post,
    user?.id
  );

  // Utiliser le hook pour les commentaires
  const { comments, addComment, isLoading: commentLoading } = usePostComments(post.id);

  const [commentText, setCommentText] = useState('');

  // Gérer l'ajout d'un commentaire
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      await addComment({
        content: commentText,
        taggedUsernames: [],
      });
      setCommentText(''); // Réinitialiser le champ
    } catch (error) {
      console.error('Erreur lors de l\'ajout du commentaire:', error);
      alert('Erreur lors de l\'ajout du commentaire');
    }
  };

  return (
    <div className="post-card border rounded-lg p-4 mb-4 bg-white shadow">
      {/* En-tête du post */}
      <div className="post-header mb-4">
        <div className="flex items-center gap-3">
          <img
            src={post.createdByProfileImage || '/default-avatar.png'}
            alt={post.createdByName}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <p className="font-semibold">{post.createdByName}</p>
            <p className="text-sm text-gray-500">
              {new Date(post.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Contenu du post */}
      <div className="post-content mb-4">
        <p className="text-gray-800">{post.content}</p>
        {post.images && post.images.length > 0 && (
          <div className="images-grid mt-3 gap-2 grid grid-cols-2">
            {post.images.map((image) => (
              <img
                key={image.id}
                src={image.imageUrl}
                alt="Post"
                className="w-full h-40 object-cover rounded"
              />
            ))}
          </div>
        )}
      </div>

      {/* Actions (Like, Comment, Share) */}
      <div className="post-actions border-t border-b py-2 flex gap-8 mb-4">
        {/* Bouton Like */}
        <button
          onClick={handleLike}
          disabled={likeLoading}
          className={`flex items-center gap-2 transition ${
            isLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
          }`}
        >
          <Heart
            size={20}
            className={isLiked ? 'fill-current' : ''}
          />
          <span>{likeCount}</span>
        </button>

        {/* Bouton Commentaire */}
        <div className="flex items-center gap-2 text-gray-600">
          <MessageCircle size={20} />
          <span>{post.commentCount}</span>
        </div>

        {/* Bouton Partage */}
        <button className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition">
          <Share2 size={20} />
          <span>Partager</span>
        </button>
      </div>

      {/* Statistiques des likes */}
      {likeCount > 0 && (
        <div className="like-stats text-sm text-gray-600 mb-4">
          <p>
            Aimé par <strong>{likeCount}</strong> personne{likeCount > 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Section des commentaires */}
      <div className="comments-section">
        {/* Formulaire d'ajout de commentaire */}
        <form onSubmit={handleSubmitComment} className="mb-4">
          <div className="flex gap-2">
            <img
              src={user?.profileImage || '/default-avatar.png'}
              alt="Your avatar"
              className="w-8 h-8 rounded-full"
            />
            <div className="flex-1">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Ajouter un commentaire..."
                className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
                rows="2"
              />
              <button
                type="submit"
                disabled={commentLoading || !commentText.trim()}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {commentLoading ? 'Envoi...' : 'Commenter'}
              </button>
            </div>
          </div>
        </form>

        {/* Liste des commentaires */}
        <div className="comments-list space-y-3">
          {comments.length === 0 ? (
            <p className="text-gray-500 text-sm">Aucun commentaire pour le moment</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="comment bg-gray-50 p-3 rounded">
                <div className="flex gap-2">
                  <img
                    src={comment.userProfileImageUrl || '/default-avatar.png'}
                    alt={comment.userName}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{comment.userName}</p>
                    <p className="text-gray-800 text-sm">{comment.content}</p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      <button className="hover:text-blue-500">Aimer</button>
                      <button className="hover:text-blue-500">Répondre</button>
                      <span>
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PostWithLikesExample;
