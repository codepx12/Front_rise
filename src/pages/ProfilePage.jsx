import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  Camera, Save, X, Plus, Edit2, MapPin, Briefcase, GraduationCap, Award, 
  Mail, Phone, BookOpen, Users, Target, Globe, Linkedin, Instagram, Twitter, Github, QrCode, Bell, Eye
} from 'lucide-react';
import apiClient, { getImageUrl } from '../services/api';
import MainLayout from '../components/MainLayout';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { user: currentUser, setUser } = useAuthStore();
  const [profileUser, setProfileUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [previewProfileImage, setPreviewProfileImage] = useState(null);
  const [previewCoverImage, setPreviewCoverImage] = useState(null);

  const eventCategories = ['Sport', 'Culture', 'Tech', 'Associatif', 'Académique', 'Networking'];
  const languageOptions = ['Français', 'Anglais', 'Espagnol', 'Allemand', 'Chinois', 'Arabe'];

  const parseJsonField = (field) => {
    try {
      return field ? JSON.parse(field) : [];
    } catch {
      return [];
    }
  };

  // Déterminer quel utilisateur afficher (profil actuel ou autre utilisateur)
  const displayUser = userId ? profileUser : currentUser;
  const isOwnProfile = !userId || userId === currentUser?.id;

  const [formData, setFormData] = useState({
    firstName: displayUser?.firstName || '',
    lastName: displayUser?.lastName || '',
    email: displayUser?.email || '',
    phone: displayUser?.phone || '',
    classe: displayUser?.classe || '',
    filiere: displayUser?.filiere || '',
    specialization: displayUser?.specialization || '',
    jobTitle: displayUser?.jobTitle || '',
    company: displayUser?.company || '',
    location: displayUser?.location || '',
    bio: displayUser?.bio || '',
    interestCategories: parseJsonField(displayUser?.interestCategories),
    associations: parseJsonField(displayUser?.associations),
    sharedExpertise: parseJsonField(displayUser?.sharedExpertise),
    languages: parseJsonField(displayUser?.languages),
    linkedinUrl: displayUser?.linkedinUrl || '',
    instagramUrl: displayUser?.instagramUrl || '',
    twitterUrl: displayUser?.twitterUrl || '',
    githubUrl: displayUser?.githubUrl || '',
    notificationPreferences: parseJsonField(displayUser?.notificationPreferences),
    profileVisibility: displayUser?.profileVisibility || 'public',
  });

  const [newItems, setNewItems] = useState({
    interest: '',
    association: '',
    expertise: '',
    language: '',
  });

  // Charger le profil de l'utilisateur si userId est fourni
  useEffect(() => {
    if (userId) {
      loadUserProfile(userId);
    }
  }, [userId]);

  const loadUserProfile = async (id) => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/users/${id}`);
      setProfileUser(response.data);
      setFormData({
        firstName: response.data.firstName || '',
        lastName: response.data.lastName || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        classe: response.data.classe || '',
        filiere: response.data.filiere || '',
        specialization: response.data.specialization || '',
        jobTitle: response.data.jobTitle || '',
        company: response.data.company || '',
        location: response.data.location || '',
        bio: response.data.bio || '',
        interestCategories: parseJsonField(response.data.interestCategories),
        associations: parseJsonField(response.data.associations),
        sharedExpertise: parseJsonField(response.data.sharedExpertise),
        languages: parseJsonField(response.data.languages),
        linkedinUrl: response.data.linkedinUrl || '',
        instagramUrl: response.data.instagramUrl || '',
        twitterUrl: response.data.twitterUrl || '',
        githubUrl: response.data.githubUrl || '',
        notificationPreferences: parseJsonField(response.data.notificationPreferences),
        profileVisibility: response.data.profileVisibility || 'public',
      });
    } catch (err) {
      console.error('Erreur lors du chargement du profil:', err);
      setError('Profil utilisateur non trouvé');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUser && !userId) navigate('/login');
  }, [currentUser, userId, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewProfileImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewCoverImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAddItem = (listName, newValue) => {
    if (newValue?.trim()) {
      setFormData(prev => ({
        ...prev,
        [listName]: [...prev[listName], newValue]
      }));
      setNewItems(prev => ({ ...prev, [listName.split('_')[0]]: '' }));
    }
  };

  const handleRemoveItem = (listName, index) => {
    setFormData(prev => ({
      ...prev,
      [listName]: prev[listName].filter((_, i) => i !== index)
    }));
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formDataToSend = new FormData();
      
      formDataToSend.append('firstName', formData.firstName);
      formDataToSend.append('lastName', formData.lastName);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('specialization', formData.specialization);
      formDataToSend.append('jobTitle', formData.jobTitle);
      formDataToSend.append('company', formData.company);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('bio', formData.bio);
      formDataToSend.append('interestCategories', JSON.stringify(formData.interestCategories));
      formDataToSend.append('associations', JSON.stringify(formData.associations));
      formDataToSend.append('sharedExpertise', JSON.stringify(formData.sharedExpertise));
      formDataToSend.append('languages', JSON.stringify(formData.languages));
      formDataToSend.append('linkedinUrl', formData.linkedinUrl);
      formDataToSend.append('instagramUrl', formData.instagramUrl);
      formDataToSend.append('twitterUrl', formData.twitterUrl);
      formDataToSend.append('githubUrl', formData.githubUrl);
      formDataToSend.append('notificationPreferences', JSON.stringify(formData.notificationPreferences));
      formDataToSend.append('profileVisibility', formData.profileVisibility);

      if (profileImage) formDataToSend.append('profileImage', profileImage);
      if (coverImage) formDataToSend.append('coverImage', coverImage);

      const response = await apiClient.put('/users/profile', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Mettre à jour l'utilisateur dans le store
      setUser(response.data);
      
      // Mettre à jour le formData local avec les données de réponse
      setFormData({
        firstName: response.data.firstName || '',
        lastName: response.data.lastName || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        classe: response.data.classe || '',
        filiere: response.data.filiere || '',
        specialization: response.data.specialization || '',
        jobTitle: response.data.jobTitle || '',
        company: response.data.company || '',
        location: response.data.location || '',
        bio: response.data.bio || '',
        interestCategories: parseJsonField(response.data.interestCategories),
        associations: parseJsonField(response.data.associations),
        sharedExpertise: parseJsonField(response.data.sharedExpertise),
        languages: parseJsonField(response.data.languages),
        linkedinUrl: response.data.linkedinUrl || '',
        instagramUrl: response.data.instagramUrl || '',
        twitterUrl: response.data.twitterUrl || '',
        githubUrl: response.data.githubUrl || '',
        notificationPreferences: parseJsonField(response.data.notificationPreferences),
        profileVisibility: response.data.profileVisibility || 'public',
      });

      setSuccess('Profil mis à jour avec succès!');
      setIsEditing(false);
      setProfileImage(null);
      setCoverImage(null);
      setPreviewProfileImage(null);
      setPreviewCoverImage(null);
      setNewItems({ interest: '', association: '', expertise: '', language: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      firstName: displayUser?.firstName || '',
      lastName: displayUser?.lastName || '',
      email: displayUser?.email || '',
      phone: displayUser?.phone || '',
      classe: displayUser?.classe || '',
      filiere: displayUser?.filiere || '',
      specialization: displayUser?.specialization || '',
      jobTitle: displayUser?.jobTitle || '',
      company: displayUser?.company || '',
      location: displayUser?.location || '',
      bio: displayUser?.bio || '',
      interestCategories: parseJsonField(displayUser?.interestCategories),
      associations: parseJsonField(displayUser?.associations),
      sharedExpertise: parseJsonField(displayUser?.sharedExpertise),
      languages: parseJsonField(displayUser?.languages),
      linkedinUrl: displayUser?.linkedinUrl || '',
      instagramUrl: displayUser?.instagramUrl || '',
      twitterUrl: displayUser?.twitterUrl || '',
      githubUrl: displayUser?.githubUrl || '',
      notificationPreferences: parseJsonField(displayUser?.notificationPreferences),
      profileVisibility: displayUser?.profileVisibility || 'public',
    });
    setNewItems({ interest: '', association: '', expertise: '', language: '' });
    setProfileImage(null);
    setCoverImage(null);
    setPreviewProfileImage(null);
    setPreviewCoverImage(null);
  };

  const coverImageUrl = previewCoverImage || getImageUrl(displayUser?.coverImageUrl) || 'https://images.unsplash.com/photo-1557672172-298e090d0f80?w=1200&h=300&fit=crop';

  return (
    <MainLayout showSidebars={true}>
      <div className="max-w-6xl mx-auto pb-10">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError('')}><X size={20} /></button>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex justify-between items-center">
            <span>{success}</span>
            <button onClick={() => setSuccess('')}><X size={20} /></button>
          </div>
        )}

        {/* Photo de couverture et profil */}
        <div className="relative mb-8">
          {/* Photo de couverture */}
          <div className="rounded-b-2xl overflow-hidden shadow-lg group">
            <img src={coverImageUrl} alt="Couverture" className="w-full h-72 object-cover" />
            {isEditing && (
              <label className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center cursor-pointer transition opacity-0 group-hover:opacity-100">
                <div className="flex flex-col items-center gap-2 text-white">
                  <Camera size={32} />
                  <span className="text-sm font-semibold">Changer la couverture</span>
                </div>
                <input type="file" accept="image/*" onChange={handleCoverImageChange} className="hidden" />
              </label>
            )}
          </div>

          {/* Photo de profil - SORTIE du conteneur */}
          <div className="flex justify-start px-8 md:px-12 -mt-24 relative z-10">
            <div className="relative w-48 h-48 rounded-full bg-linear-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white text-6xl font-bold overflow-hidden border-8 border-white shadow-2xl group">
              {previewProfileImage ? (
                <img src={previewProfileImage} alt="Profil" className="w-full h-full object-cover" />
              ) : displayUser?.profileImageUrl ? (
                <img src={getImageUrl(displayUser.profileImageUrl)} alt={`${displayUser.firstName} ${displayUser.lastName}`} className="w-full h-full object-cover" />
              ) : (
                `${displayUser?.firstName?.charAt(0)}${displayUser?.lastName?.charAt(0)}`
              )}
              {isEditing && (
                <label className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center cursor-pointer transition opacity-0 group-hover:opacity-100">
                  <Camera size={32} className="text-white" />
                  <input type="file" accept="image/*" onChange={handleProfileImageChange} className="hidden" />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Infos principales */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Informations Personnelles</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                        <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full border rounded-lg px-4 py-2 outline-none focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                        <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full border rounded-lg px-4 py-2 outline-none focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full border rounded-lg px-4 py-2 outline-none focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="(optionnel)" className="w-full border rounded-lg px-4 py-2 outline-none focus:border-blue-500" />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Informations Académiques</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Classe</label>
                        <select name="classe" value={formData.classe} onChange={handleInputChange} className="w-full border rounded-lg px-4 py-2 outline-none focus:border-blue-500">
                          <option value="">Sélectionner</option>
                          {['L1', 'L2', 'L3', 'M1', 'M2'].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Filière</label>
                        <input type="text" name="filiere" value={formData.filiere} onChange={handleInputChange} placeholder="ex: Génie Logiciel" className="w-full border rounded-lg px-4 py-2 outline-none focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Spécialisation</label>
                        <input type="text" name="specialization" value={formData.specialization} onChange={handleInputChange} placeholder="(optionnel)" className="w-full border rounded-lg px-4 py-2 outline-none focus:border-blue-500" />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Informations Professionnelles</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Titre professionnel</label>
                        <input type="text" name="jobTitle" value={formData.jobTitle} onChange={handleInputChange} placeholder="Développeur Full Stack" className="w-full border rounded-lg px-4 py-2 outline-none focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Entreprise</label>
                        <input type="text" name="company" value={formData.company} onChange={handleInputChange} className="w-full border rounded-lg px-4 py-2 outline-none focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Localisation</label>
                        <input type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="Paris, France" className="w-full border rounded-lg px-4 py-2 outline-none focus:border-blue-500" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bio / Description</label>
                      <textarea name="bio" value={formData.bio} onChange={handleInputChange} placeholder="Parlez un peu de vous..." rows={3} className="w-full border rounded-lg px-4 py-2 outline-none focus:border-blue-500" />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Globe size={20} />Langues</h3>
                    <div className="flex gap-2 mb-3">
                      <select value={newItems.language} onChange={(e) => setNewItems({...newItems, language: e.target.value})} className="flex-1 border rounded-lg px-4 py-2 outline-none focus:border-blue-500">
                        <option value="">Sélectionner une langue</option>
                        {languageOptions.filter(l => !formData.languages.includes(l)).map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                      <button onClick={() => handleAddItem('languages', newItems.language)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"><Plus size={18} /></button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.languages.map((lang, i) => (
                        <span key={i} className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full flex items-center gap-2">
                          {lang}<button onClick={() => handleRemoveItem('languages', i)}><X size={16} /></button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Target size={20} />Centres d'Intérêt</h3>
                    <div className="flex gap-2 mb-3">
                      <select value={newItems.interest} onChange={(e) => setNewItems({...newItems, interest: e.target.value})} className="flex-1 border rounded-lg px-4 py-2 outline-none focus:border-blue-500">
                        <option value="">Sélectionner une catégorie</option>
                        {eventCategories.filter(c => !formData.interestCategories.includes(c)).map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <button onClick={() => handleAddItem('interestCategories', newItems.interest)} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"><Plus size={18} /></button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.interestCategories.map((interest, i) => (
                        <span key={i} className="bg-green-100 text-green-800 px-4 py-2 rounded-full flex items-center gap-2">
                          {interest}<button onClick={() => handleRemoveItem('interestCategories', i)}><X size={16} /></button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Users size={20} />Associations</h3>
                    <div className="flex gap-2 mb-3">
                      <input type="text" value={newItems.association} onChange={(e) => setNewItems({...newItems, association: e.target.value})} placeholder="Nom de l'association" className="flex-1 border rounded-lg px-4 py-2 outline-none focus:border-blue-500" onKeyPress={(e) => e.key === 'Enter' && handleAddItem('associations', newItems.association)} />
                      <button onClick={() => handleAddItem('associations', newItems.association)} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"><Plus size={18} /></button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.associations.map((assoc, i) => (
                        <span key={i} className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full flex items-center gap-2">
                          {assoc}<button onClick={() => handleRemoveItem('associations', i)}><X size={16} /></button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Award size={20} />Compétences à Partager</h3>
                    <div className="flex gap-2 mb-3">
                      <input type="text" value={newItems.expertise} onChange={(e) => setNewItems({...newItems, expertise: e.target.value})} placeholder="ex: Python, Design" className="flex-1 border rounded-lg px-4 py-2 outline-none focus:border-blue-500" onKeyPress={(e) => e.key === 'Enter' && handleAddItem('sharedExpertise', newItems.expertise)} />
                      <button onClick={() => handleAddItem('sharedExpertise', newItems.expertise)} className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center gap-2"><Plus size={18} /></button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.sharedExpertise.map((exp, i) => (
                        <span key={i} className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full flex items-center gap-2">
                          {exp}<button onClick={() => handleRemoveItem('sharedExpertise', i)}><X size={16} /></button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Réseaux Sociaux</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2"><Linkedin size={16} /> LinkedIn</label>
                        <input type="url" name="linkedinUrl" value={formData.linkedinUrl} onChange={handleInputChange} placeholder="https://linkedin.com/in/..." className="w-full border rounded-lg px-4 py-2 outline-none focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2"><Github size={16} /> GitHub</label>
                        <input type="url" name="githubUrl" value={formData.githubUrl} onChange={handleInputChange} placeholder="https://github.com/..." className="w-full border rounded-lg px-4 py-2 outline-none focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2"><Instagram size={16} /> Instagram</label>
                        <input type="url" name="instagramUrl" value={formData.instagramUrl} onChange={handleInputChange} placeholder="https://instagram.com/..." className="w-full border rounded-lg px-4 py-2 outline-none focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2"><Twitter size={16} /> Twitter/X</label>
                        <input type="url" name="twitterUrl" value={formData.twitterUrl} onChange={handleInputChange} placeholder="https://twitter.com/..." className="w-full border rounded-lg px-4 py-2 outline-none focus:border-blue-500" />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Eye size={20} />Préférences</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"><Eye size={16} /> Visibilité du profil</label>
                        <select name="profileVisibility" value={formData.profileVisibility} onChange={handleInputChange} className="w-full border rounded-lg px-4 py-2 outline-none focus:border-blue-500">
                          <option value="public">Public (visible pour tous)</option>
                          <option value="friends">Amis seulement</option>
                          <option value="private">Privé</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"><Bell size={16} /> Types d'événements intéressants</label>
                        <div className="space-y-2">
                          {eventCategories.map(cat => (
                            <label key={cat} className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={formData.notificationPreferences.includes(cat)} onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData(prev => ({...prev, notificationPreferences: [...prev.notificationPreferences, cat]}));
                                } else {
                                  setFormData(prev => ({...prev, notificationPreferences: prev.notificationPreferences.filter(c => c !== cat)}));
                                }
                              }} className="w-4 h-4 rounded" />
                              <span className="text-gray-700">{cat}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">{displayUser?.firstName} {displayUser?.lastName}</h1>
                  {displayUser?.classe && (
                    <p className="text-lg text-blue-600 font-semibold mt-1">{displayUser.classe} {displayUser.filiere ? `- ${displayUser.filiere}` : ''}</p>
                  )}
                  {(displayUser?.jobTitle || displayUser?.company) && (
                    <p className="text-lg text-green-600 font-semibold mt-1">{displayUser.jobTitle} {displayUser.company && `@ ${displayUser.company}`}</p>
                  )}
                  <div className="flex flex-wrap gap-4 mt-4 text-gray-600">
                    {displayUser?.location && <div className="flex items-center gap-2"><MapPin size={18} className="text-blue-600" /><span>{displayUser.location}</span></div>}
                    {displayUser?.email && <div className="flex items-center gap-2"><Mail size={18} className="text-blue-600" /><span>{displayUser.email}</span></div>}
                    {displayUser?.phone && <div className="flex items-center gap-2"><Phone size={18} className="text-blue-600" /><span>{displayUser.phone}</span></div>}
                  </div>
                  {displayUser?.bio && <p className="mt-6 text-gray-700 leading-relaxed max-w-3xl">{displayUser.bio}</p>}
                  <div className="mt-6 flex gap-3">
                    {displayUser?.linkedinUrl && <a href={displayUser.linkedinUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200"><Linkedin size={20} /></a>}
                    {displayUser?.githubUrl && <a href={displayUser.githubUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 text-gray-800 rounded-full hover:bg-gray-200"><Github size={20} /></a>}
                    {displayUser?.instagramUrl && <a href={displayUser.instagramUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-pink-100 text-pink-600 rounded-full hover:bg-pink-200"><Instagram size={20} /></a>}
                    {displayUser?.twitterUrl && <a href={displayUser.twitterUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-sky-100 text-sky-600 rounded-full hover:bg-sky-200"><Twitter size={20} /></a>}
                  </div>
                  {isOwnProfile && (
                    <div className="mt-6">
                      <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                        <Edit2 size={18} /> Modifier le profil
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {isEditing && (
              <div className="flex flex-col gap-3 sticky top-4">
                <button onClick={handleSaveProfile} disabled={loading} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold">
                  <Save size={18} /> {loading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
                <button onClick={handleCancel} disabled={loading} className="flex items-center gap-2 bg-gray-300 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-400 disabled:opacity-50 font-semibold">
                  <X size={18} /> Annuler
                </button>
              </div>
            )}
          </div>
        </div>

        {!isEditing && (
          <>
            {formData.languages?.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2"><Globe size={28} className="text-blue-600" />Langues</h2>
                <div className="flex flex-wrap gap-3">{formData.languages.map((lang, i) => <span key={i} className="bg-blue-100 text-blue-800 px-5 py-2 rounded-full font-medium">{lang}</span>)}</div>
              </div>
            )}

            {formData.interestCategories?.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2"><Target size={28} className="text-green-600" />Centres d'Intérêt</h2>
                <div className="flex flex-wrap gap-3">{formData.interestCategories.map((interest, i) => <span key={i} className="bg-green-100 text-green-800 px-5 py-2 rounded-full font-medium">{interest}</span>)}</div>
              </div>
            )}

            {formData.associations?.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2"><Users size={28} className="text-purple-600" />Associations</h2>
                <div className="flex flex-wrap gap-3">{formData.associations.map((assoc, i) => <span key={i} className="bg-purple-100 text-purple-800 px-5 py-2 rounded-full font-medium">{assoc}</span>)}</div>
              </div>
            )}

            {formData.sharedExpertise?.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2"><Award size={28} className="text-orange-600" />Compétences à Partager</h2>
                <div className="flex flex-wrap gap-3">{formData.sharedExpertise.map((exp, i) => <span key={i} className="bg-orange-100 text-orange-800 px-5 py-2 rounded-full font-medium">{exp}</span>)}</div>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Activité & Statistiques</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
                  <p className="text-gray-600 text-sm font-semibold">Classe</p>
                  <p className="text-gray-900 font-bold text-2xl mt-2">{displayUser?.classe || 'N/A'}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
                  <p className="text-gray-600 text-sm font-semibold">Événements Rejoints</p>
                  <p className="text-gray-900 font-bold text-2xl mt-2">{displayUser?.eventsJoined || 0}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
                  <p className="text-gray-600 text-sm font-semibold">Événements Participés</p>
                  <p className="text-gray-900 font-bold text-2xl mt-2">{displayUser?.eventsAttended || 0}</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg">
                  <p className="text-gray-600 text-sm font-semibold">Rôle</p>
                  <p className="text-gray-900 font-bold text-xl mt-2">{displayUser?.role}</p>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Informations du Compte</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
              <p className="text-gray-600 text-sm font-semibold">Matricule</p>
              <p className="text-gray-900 font-bold text-lg mt-1">{displayUser?.matriculeNumber}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
              <p className="text-gray-600 text-sm font-semibold">Compte Créé</p>
              <p className="text-gray-900 font-bold text-lg mt-1">{displayUser?.createdAt ? new Date(displayUser.createdAt).toLocaleDateString('fr-FR') : 'N/A'}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
              <p className="text-gray-600 text-sm font-semibold">Visibilité</p>
              <p className="text-gray-900 font-bold text-lg mt-1 capitalize">{displayUser?.profileVisibility || 'Public'}</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
