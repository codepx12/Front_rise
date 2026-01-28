import { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Trash2, ThumbsUp, Laugh, AlertCircle, Frown, Zap } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { getImageUrl, getProfileImageUrl } from '../services/api';

const REACTIONS = [
  { icon: ThumbsUp, name: 'thumbsup', label: 'Pouce levé' },
  { icon: Heart, name: 'heart', label: 'Cœur' },
  { icon: Laugh, name: 'laugh', label: 'Rire' },
  { icon: AlertCircle, name: 'wow', label: 'Wow' },
  { icon: Frown, name: 'sad', label: 'Triste' },
  { icon: Zap, name: 'angry', label: 'Fâché' },
];

export default function CommentSection({ postId, comments = [], onAddComment, onDeleteComment, onReact }) {
  const { user } = useAuthStore();
  const [commentText, setCommentText] = useState('');
  const [taggedUsers, setTaggedUsers] = useState([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const textareaRef = useRef(null);
  const [expandedReplies, setExpandedReplies] = useState({});
  const [replyText, setReplyText] = useState({});

  const handleAddComment = async () => {
    if (commentText.trim()) {
      try {
        await onAddComment(postId, {
          content: commentText,
          taggedUserIds: taggedUsers.map((u) => u.id),
        });
        setCommentText('');
        setTaggedUsers([]);
      } catch (error) {
        console.error('Erreur lors de l\'ajout du commentaire:', error);
      }
    }
  };

  const handleMention = (e) => {
    const text = e.target.value;
    setCommentText(text);

    // Détecter les mentions avec @
    const atIndex = text.lastIndexOf('@');
    if (atIndex !== -1) {
      const searchText = text.substring(atIndex + 1);
      if (searchText && !searchText.includes(' ')) {
        setMentionSearch(searchText);
        setShowMentions(true);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const addTaggedUser = (user) => {
    if (!taggedUsers.find((u) => u.id === user.id)) {
      setTaggedUsers([...taggedUsers, user]);
      // Remplacer la mention par le nom de l'utilisateur
      const atIndex = commentText.lastIndexOf('@');
      const beforeMention = commentText.substring(0, atIndex);
      setCommentText(beforeMention + '@' + user.firstName + ' ');
    }
    setShowMentions(false);
    setMentionSearch('');
  };

  return (
    <div className="mt-4 border-t pt-4">
      <h3 className="font-bold text-lg mb-4">Commentaires ({comments.length})</h3>

      {/* Ajouter un commentaire */}
      <div className="mb-6 p-3 bg-white/60 backdrop-blur-lg rounded-2xl border border-gray-200/40">
        <div className="flex gap-3 items-start">
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold text-sm overflow-hidden flex-shrink-0">
            <img
              src={getProfileImageUrl(user?.profileImageUrl)}
              alt={user?.firstName}
              onError={(e) => {
                e.target.src = '/profile_none.jpg';
              }}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={commentText}
                onChange={handleMention}
                placeholder="Écrivez un commentaire... (tapez @ pour mentionner quelqu'un)"
                className="w-full p-3 border border-gray-200/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white/50 backdrop-blur-sm"
                rows="3"
              />
              {showMentions && (
                <div className="absolute top-full mt-1 left-0 right-0 bg-white/90 backdrop-blur-lg border border-gray-200/40 rounded-xl shadow-lg z-10 max-h-40 overflow-y-auto">
                  <div className="p-2 text-sm text-gray-600">
                    Suggestions de mention (mises en place - intégrer avec API)
                  </div>
                </div>
              )}
            </div>

            {/* Utilisateurs mentionnés */}
            {taggedUsers.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {taggedUsers.map((u) => (
                  <span
                    key={u.id}
                    className="inline-flex items-center gap-1 bg-blue-100/80 text-blue-700 px-2 py-1 rounded-full text-sm backdrop-blur-sm"
                  >
                    @{u.firstName}
                    <button
                      onClick={() =>
                        setTaggedUsers(taggedUsers.filter((tagged) => tagged.id !== u.id))
                      }
                      className="ml-1 text-blue-700 hover:text-blue-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            <button
              onClick={handleAddComment}
              disabled={!commentText.trim()}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-400 transition font-semibold shadow-md hover:shadow-lg"
            >
              Commenter
            </button>
          </div>
        </div>
      </div>

      {/* Liste des commentaires */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Aucun commentaire pour le moment</p>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onDelete={() => onDeleteComment(postId, comment.id)}
              onReact={onReact}
              user={user}
              postId={postId}
            />
          ))
        )}
      </div>
    </div>
  );
}

function CommentItem({ comment, onDelete, onReact, user, postId }) {
  const [showReactions, setShowReactions] = useState(false);
  const [reactions, setReactions] = useState(comment.reactions || []);

  const handleReact = (reactionType) => {
    onReact(postId, comment.id, reactionType);
    setShowReactions(false);
  };

  const userReaction = reactions.find((r) => r.userId === user?.id);

  return (
    <div className="flex gap-3 p-4 bg-white/60 backdrop-blur-lg rounded-2xl border border-gray-200/40 hover:shadow-md transition-shadow">
      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold text-sm overflow-hidden flex-shrink-0">
        {comment.userProfileImageUrl ? (
          <img
            src={getImageUrl(comment.userProfileImageUrl)}
            alt={comment.userName}
            className="w-full h-full object-cover"
          />
        ) : (
          `${comment.userName?.charAt(0) || 'U'}`
        )}
      </div>
      <div className="flex-1">
        <div className="bg-gray-100/50 backdrop-blur-sm rounded-xl p-3 border border-gray-200/40">
          <div className="font-semibold text-sm text-gray-900">
            {comment.userName}
          </div>
          <p className="text-sm mt-1 text-gray-800">{comment.content}</p>

          {/* Tags mentionnés */}
          {comment.taggedUsers && comment.taggedUsers.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {comment.taggedUsers.map((u) => (
                <span key={u.id} className="text-blue-600 text-sm font-medium">
                  @{u.username}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions de commentaire */}
        <div className="mt-2 flex gap-4 items-center text-sm">
          <div className="relative">
            <button
              onClick={() => setShowReactions(!showReactions)}
              className="text-gray-600 hover:text-blue-600 flex items-center gap-1 transition-colors duration-200 font-medium"
            >
              <Heart size={16} />
              Réagir
            </button>
            {showReactions && (
              <div className="absolute left-0 top-full mt-1 bg-white/90 backdrop-blur-lg border border-gray-200/40 rounded-xl shadow-lg p-3 flex gap-2 z-10">
                {REACTIONS.map((reaction) => {
                  const Icon = reaction.icon;
                  return (
                    <button
                      key={reaction.name}
                      onClick={() => handleReact(reaction.name)}
                      className="p-2 hover:bg-gray-100/50 rounded-lg transition-all duration-200 hover:scale-110"
                      title={reaction.label}
                    >
                      <Icon size={18} className="text-gray-700" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {user?.id === comment.userId && (
            <button
              onClick={onDelete}
              className="text-gray-600 hover:text-red-600 flex items-center gap-1 transition-colors duration-200 font-medium"
            >
              <Trash2 size={16} />
              Supprimer
            </button>
          )}
        </div>

        {/* Réactions affichées */}
        {reactions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {reactions.map((reaction, idx) => {
              const reactionObj = REACTIONS.find(r => r.name === reaction.type);
              const Icon = reactionObj?.icon;
              return (
                <span key={idx} className="bg-gray-200/50 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1 border border-gray-200/40">
                  {Icon ? <Icon size={16} className="text-gray-700" /> : reaction.type}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
