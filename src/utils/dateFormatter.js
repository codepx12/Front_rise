/**
 * Formate une date de manière relative (style Facebook)
 * - Moins de 3 jours: "il y a 2min", "il y a 1h", etc.
 * - 3 jours ou plus: affiche la date complète
 */
export function formatRelativeDate(dateString) {
  if (!dateString) return 'Date inconnue';

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Moins d'une minute
  if (diffMinutes < 1) {
    return 'à l\'instant';
  }

  // Moins d'une heure
  if (diffMinutes < 60) {
    return diffMinutes === 1 ? 'il y a 1 min' : `il y a ${diffMinutes} min`;
  }

  // Moins d'un jour
  if (diffHours < 24) {
    return diffHours === 1 ? 'il y a 1 heure' : `il y a ${diffHours} heures`;
  }

  // Moins de 3 jours
  if (diffDays < 3) {
    return diffDays === 1 ? 'il y a 1 jour' : `il y a ${diffDays} jours`;
  }

  // 3 jours ou plus: afficher la date complète
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
