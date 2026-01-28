import { useState, useRef, useEffect } from 'react';
import { X, Search, Users } from 'lucide-react';
import { formService } from '../services/formService';

export default function TeamAutocomplete({ 
  selectedMembers, 
  onMembersChange, 
  maxMembers = 5,
  isRequired = false 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeoutRef = useRef(null);
  const containerRef = useRef(null);

  // Rechercher les utilisateurs
  const handleSearch = async (query) => {
    console.log('🔍 Recherche utilisateurs:', query);
    
    if (query.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    try {
      const results = await formService.searchUsers(query);
      console.log('✅ Résultats reçus:', results);
      
      // Filtrer les utilisateurs déjà sélectionnés
      const filtered = results.filter(
        user => !selectedMembers.some(member => member.id === user.id)
      );
      setSearchResults(filtered);
      setShowDropdown(true);
    } catch (error) {
      console.error('❌ Erreur lors de la recherche:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounce la recherche
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    console.log('📝 Saisie utilisateur:', query);
    clearTimeout(searchTimeoutRef.current);
    
    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(query);
    }, 300);
  };

  // Ajouter un membre de l'équipe
  const addMember = (user) => {
    console.log('➕ Ajout d\'un membre:', user);
    if (selectedMembers.length < maxMembers) {
      onMembersChange([...selectedMembers, user]);
      setSearchQuery('');
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  // Supprimer un membre de l'équipe
  const removeMember = (userId) => {
    console.log('➖ Suppression d\'un membre:', userId);
    onMembersChange(selectedMembers.filter(member => member.id !== userId));
  };

  // Fermer le dropdown au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const canAddMore = selectedMembers.length < maxMembers;

  return (
    <div className="w-full" ref={containerRef}>
      {/* Champ de recherche */}
      <div className="relative mb-4">
        <div className="flex items-center gap-3 w-full bg-white text-gray-800 px-4 py-3 rounded-lg border-2 border-gray-300 focus-within:border-[#2E7379] focus-within:ring-2 focus-within:ring-[#2E7379]/30 transition-all">
          <Search size={20} className="text-gray-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => searchQuery.length >= 2 && setShowDropdown(true)}
            placeholder={canAddMore ? "🔍 Tapez le nom ou l'email..." : "✓ Équipe complète (5/5)"}
            disabled={!canAddMore}
            className="flex-1 outline-none bg-transparent text-gray-800 placeholder:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            autoComplete="off"
          />
          {isSearching && (
            <div className="animate-spin shrink-0">
              <Users size={20} className="text-[#2E7379]" />
            </div>
          )}
        </div>

        {/* Dropdown de résultats */}
        {showDropdown && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-300 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
            {searchResults.length > 0 ? (
              searchResults.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => addMember(user)}
                  className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition flex items-center gap-3"
                >
                  {user.profileImageUrl && (
                    <img
                      src={user.profileImageUrl}
                      alt={user.firstName}
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-800 truncate">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {user.email} • {user.matriculeNumber}
                    </div>
                  </div>
                </button>
              ))
            ) : searchQuery.length >= 2 && !isSearching ? (
              <div className="px-4 py-4 text-center text-gray-500">
                ❌ Aucun utilisateur trouvé pour "{searchQuery}"
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Membres sélectionnés */}
      <div className="mt-4">
        {selectedMembers.length > 0 && (
          <div className="text-sm text-gray-600 font-semibold mb-3">
            👥 Équipe sélectionnée ({selectedMembers.length}/{maxMembers})
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {selectedMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-2 bg-[#2E7379] text-white px-4 py-2 rounded-full text-sm font-medium shadow-md"
            >
              {member.profileImageUrl && (
                <img
                  src={member.profileImageUrl}
                  alt={member.firstName}
                  className="w-6 h-6 rounded-full object-cover"
                />
              )}
              <span>
                {member.firstName} {member.lastName}
              </span>
              <button
                type="button"
                onClick={() => removeMember(member.id)}
                className="hover:opacity-80 transition ml-1"
                title="Retirer du groupe"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Validation */}
      {isRequired && selectedMembers.length === 0 && (
        <div className="mt-3 text-sm text-red-600 font-medium flex items-center gap-2">
          <span>⚠️</span>
          Veuillez sélectionner au moins un coéquipier
        </div>
      )}
    </div>
  );
}
