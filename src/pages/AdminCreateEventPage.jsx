import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ArrowLeft, X, Upload, File, CheckCircle } from 'lucide-react';
import apiClient from '../services/api';
import AdminLayout from '../components/AdminLayout';

export default function AdminCreateEventPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [forms, setForms] = useState([]);
  const [loadingForms, setLoadingForms] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'Hackathon',
    startDate: '',
    endDate: '',
    location: '',
    theme: '',
    maxParticipants: '',
    posterUrl: '',
    documentUrls: [],
    imageUrls: [],
    rules: '',
    formId: '',
    requireFormSubmission: false,
  });
  const [documents, setDocuments] = useState([]);
  const [images, setImages] = useState([]);

  const eventTypes = [
    'Hackathon interne',
    'Excursion / Sortie pédagogique',
    'Événements d\'intégration',
    'Échanges étudiants',
    'Votes (président, représentants, autres postes)',
    'Sondages',
    'Autres événements personnalisables',
  ];

  // Charger les formulaires disponibles
  useEffect(() => {
    const fetchForms = async () => {
      try {
        setLoadingForms(true);
        const response = await apiClient.get('/forms');
        const publishedForms = response.data.filter(f => f.isPublished && f.isActive);
        setForms(publishedForms);
      } catch (err) {
        console.error('Erreur lors du chargement des formulaires:', err);
      } finally {
        setLoadingForms(false);
      }
    };

    fetchForms();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFiles = (files) => {
    const fileArray = Array.from(files);
    
    const supportedDocExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.zip'];
    const supportedImageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
    
    const validDocuments = [];
    const validImages = [];

    fileArray.forEach(file => {
      const extension = '.' + file.name.split('.').pop().toLowerCase();
      
      if (supportedImageExtensions.includes(extension)) {
        validImages.push(file);
      } else if (supportedDocExtensions.includes(extension)) {
        validDocuments.push(file);
      }
    });

    if (validImages.length + images.length > 20) {
      setError('Maximum 20 images autorisées');
      return;
    }

    if (validDocuments.length + documents.length > 10) {
      setError('Maximum 10 documents autorisés');
      return;
    }

    // Traiter les images
    validImages.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result;
        const newImage = {
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          url: base64,
          type: file.type
        };
        setImages(prev => [...prev, newImage]);
        setFormData(prev => ({
          ...prev,
          imageUrls: [...prev.imageUrls, base64]
        }));
      };
      reader.readAsDataURL(file);
    });

    // Traiter les documents
    validDocuments.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result;
        const newDoc = {
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          url: base64,
          type: file.type
        };
        setDocuments(prev => [...prev, newDoc]);
        setFormData(prev => ({
          ...prev,
          documentUrls: [...prev.documentUrls, base64]
        }));
      };
      reader.readAsDataURL(file);
    });

    if (validImages.length > 0 || validDocuments.length > 0) {
      setError('');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFiles(e.target.files);
    }
  };

  const removeDocument = (index) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      documentUrls: prev.documentUrls.filter((_, i) => i !== index)
    }));
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index)
    }));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);

      const payload = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        location: formData.location,
        theme: formData.theme,
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
        posterUrl: formData.posterUrl,
        documentUrl: formData.documentUrls.length > 0 ? formData.documentUrls[0] : '',
        rules: formData.rules,
        formId: formData.formId,
        requireFormSubmission: formData.requireFormSubmission,
      };

      const response = await apiClient.post('/events', payload);
      
      // Si des images ont été ajoutées, créer un post pour l'événement
      if (formData.imageUrls.length > 0) {
        const postPayload = {
          eventId: response.data.id,
          content: `Publication pour l'événement: ${formData.name}`,
          imageUrls: formData.imageUrls,
        };
        await apiClient.post('/posts', postPayload);
      }

      navigate('/admin/events');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création de l\'événement');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout pageTitle="Créer un Événement">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/admin/events')}
            className="p-2 hover:bg-teal-50/40 rounded-lg transition"
          >
            <ArrowLeft size={24} className="text-teal-600" />
          </button>
          <h2 className="text-3xl font-bold text-gray-900">Nouvel Événement</h2>
        </div>

        {error && (
          <div className="bg-red-50/60 backdrop-blur-lg border border-red-200/40 border-l-4 border-l-red-600 text-red-700 px-6 py-4 rounded-2xl mb-8 shadow-sm">
            <p className="font-semibold">Erreur</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white/40 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/40 shadow-sm space-y-8">
          {/* Section Informations de base */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-teal-600 to-teal-400 rounded"></div>
              Informations de base
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Nom de l'événement *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-white/40 backdrop-blur-sm text-gray-900 px-4 py-3 rounded-xl border border-gray-200/40 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200/30 transition"
                  required
                  placeholder="Ex: Hackathon 2026"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Type d'événement *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full bg-white/40 backdrop-blur-sm text-gray-900 px-4 py-3 rounded-xl border border-gray-200/40 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200/30 transition"
                >
                  {eventTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section Description */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-teal-600 to-teal-400 rounded"></div>
              Description
            </h3>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Description détaillée *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full bg-white/40 backdrop-blur-sm text-gray-900 px-4 py-3 rounded-xl border border-gray-200/40 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200/30 transition"
              required
              placeholder="Décrivez votre événement en détail..."
            />
          </div>

          {/* Section Dates et Lieu */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-teal-600 to-teal-400 rounded"></div>
              Dates et Localisation
            </h3>
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Date de début *</label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full bg-white/40 backdrop-blur-sm text-gray-900 px-4 py-3 rounded-xl border border-gray-200/40 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200/30 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Date de fin *</label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full bg-white/40 backdrop-blur-sm text-gray-900 px-4 py-3 rounded-xl border border-gray-200/40 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200/30 transition"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Lieu *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full bg-white/40 backdrop-blur-sm text-gray-900 px-4 py-3 rounded-xl border border-gray-200/40 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200/30 transition"
                  required
                  placeholder="Ex: Amphithéâtre A"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Thème</label>
                <input
                  type="text"
                  name="theme"
                  value={formData.theme}
                  onChange={handleChange}
                  className="w-full bg-white/40 backdrop-blur-sm text-gray-900 px-4 py-3 rounded-xl border border-gray-200/40 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200/30 transition"
                  placeholder="Ex: Intelligence Artificielle"
                />
              </div>
            </div>
          </div>

          {/* Section Détails */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-teal-600 to-teal-400 rounded"></div>
              Détails de l'événement
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Participants maximum</label>
                <input
                  type="number"
                  name="maxParticipants"
                  value={formData.maxParticipants}
                  onChange={handleChange}
                  className="w-full bg-white/40 backdrop-blur-sm text-gray-900 px-4 py-3 rounded-xl border border-gray-200/40 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200/30 transition"
                  placeholder="Ex: 100"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">URL de l'affiche</label>
                <input
                  type="url"
                  name="posterUrl"
                  value={formData.posterUrl}
                  onChange={handleChange}
                  className="w-full bg-white/40 backdrop-blur-sm text-gray-900 px-4 py-3 rounded-xl border border-gray-200/40 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200/30 transition"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          {/* Section Fichiers */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-teal-600 to-teal-400 rounded"></div>
              Fichiers (Images et Documents)
            </h3>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition ${
                dragActive
                  ? 'border-teal-500 bg-teal-500/10'
                  : 'border-teal-200/40 hover:border-teal-200/60 bg-teal-50/20'
              }`}
            >
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.jpg,.jpeg,.png,.gif,.webp,.bmp"
                onChange={handleFileInput}
                className="hidden"
                id="file-input"
              />
              <label htmlFor="file-input" className="cursor-pointer block">
                <Upload size={32} className="mx-auto mb-3 text-teal-600" />
                <p className="text-gray-900 font-semibold mb-1">Glissez vos fichiers ici ou cliquez</p>
                <p className="text-gray-600 text-sm">
                  Images: JPG, PNG, GIF, WebP, BMP | Documents: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, ZIP
                </p>
                <p className="text-gray-700 text-sm font-medium mt-3">
                  Images: {images.length}/20 | Documents: {documents.length}/10
                </p>
              </label>
            </div>
          </div>

          {images.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-4">Images ({images.length})</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((img, index) => (
                  <div key={img.id} className="relative group">
                    <img
                      src={img.url}
                      alt={`Image ${index}`}
                      className="w-full h-32 object-cover rounded-2xl border border-gray-200/40"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 rounded-full p-2 opacity-0 group-hover:opacity-100 transition shadow-lg"
                    >
                      <X size={16} className="text-white" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {documents.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-4">Documents ({documents.length})</h4>
              <div className="space-y-2">
                {documents.map((doc, index) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-teal-50/60 to-white/30 backdrop-blur-sm rounded-2xl border border-teal-200/40"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <File size={20} className="text-teal-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 text-sm font-semibold truncate">{doc.name}</p>
                        <p className="text-gray-600 text-xs">{formatFileSize(doc.size)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDocument(index)}
                      className="ml-2 p-2 text-red-600 hover:text-red-700 hover:bg-red-50/40 rounded-lg transition flex-shrink-0"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section Règles */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-teal-600 to-teal-400 rounded"></div>
              Règles et Formulaire
            </h3>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Règles de participation</label>
            <textarea
              name="rules"
              value={formData.rules}
              onChange={handleChange}
              rows="3"
              className="w-full bg-white/40 backdrop-blur-sm text-gray-900 px-4 py-3 rounded-xl border border-gray-200/40 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200/30 transition mb-6"
              placeholder="Décrivez les règles à respecter..."
            />

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Formulaire d'inscription</label>
                <select
                  name="formId"
                  value={formData.formId}
                  onChange={handleChange}
                  className="w-full bg-white/40 backdrop-blur-sm text-gray-900 px-4 py-3 rounded-xl border border-gray-200/40 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200/30 transition"
                  disabled={loadingForms}
                >
                  <option value="">Aucun</option>
                  {forms.map((form) => (
                    <option key={form.id} value={form.id}>{form.title}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center pt-8">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="requireForm"
                    name="requireFormSubmission"
                    checked={formData.requireFormSubmission}
                    onChange={handleChange}
                    className="w-5 h-5 rounded-lg border-2 border-teal-200/40 cursor-pointer"
                  />
                  <label htmlFor="requireForm" className="text-sm font-semibold text-gray-700 ml-3 cursor-pointer">
                    Exiger la soumission du formulaire
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-4 justify-end pt-6 border-t border-gray-200/40">
            <button
              type="button"
              onClick={() => navigate('/admin/events')}
              className="px-6 py-3 border-2 border-gray-200/40 text-gray-700 rounded-xl hover:bg-gray-50/40 transition font-semibold backdrop-blur-sm"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 rounded-xl transition disabled:opacity-50 text-white font-semibold shadow-lg backdrop-blur-sm border border-teal-400/30 flex items-center gap-2"
            >
              <CheckCircle size={20} />
              {loading ? 'Création...' : 'Créer Événement'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
