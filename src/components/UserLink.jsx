import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../services/api';

/**
 * Composant réutilisable pour afficher un nom/avatar cliquable qui redirige vers le profil
 * @param {Object} user - L'objet utilisateur (doit avoir id, firstName, lastName, profileImageUrl)
 * @param {string} className - Classes CSS additionnelles
 * @param {boolean} showAvatar - Afficher l'avatar (défaut: true)
 * @param {string} avatarSize - Taille de l'avatar: 'sm', 'md', 'lg' (défaut: 'md')
 */
export default function UserLink({ 
  user, 
  className = '', 
  showAvatar = true,
  avatarSize = 'md',
  nameClassName = ''
}) {
  const navigate = useNavigate();

  if (!user || !user.id) return null;

  const avatarSizes = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/profile/${user.id}`);
  };

  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
  const initials = `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`;

  return (
    <div 
      className={`flex items-center gap-2 cursor-pointer hover:opacity-80 transition ${className}`}
      onClick={handleClick}
    >
      {showAvatar && (
        <div className={`${avatarSizes[avatarSize]} bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shrink-0 shadow-md overflow-hidden`}>
          {user.profileImageUrl ? (
            <img
              src={getImageUrl(user.profileImageUrl)}
              alt={fullName}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            initials
          )}
        </div>
      )}
      <span className={`font-semibold text-gray-900 hover:text-blue-600 transition ${nameClassName}`}>
        {fullName}
      </span>
    </div>
  );
}
