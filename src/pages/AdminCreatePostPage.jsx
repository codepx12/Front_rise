import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { X, Upload, Plus } from 'lucide-react';
import apiClient from '../services/api';
import AdminLayout from '../components/AdminLayout';

export default function AdminCreatePostPage() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [formData, setFormData] = useState({
    content: '',
    imageUrls: [],
  });
  const [previews, setPreviews] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    const supportedImageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
    
    const validImages = fileArray.filter(file => {
      const extension = '.' + file.name.split('.').pop().toLowerCase();
      return supportedImageExtensions.includes(extension);
    });

    if (validImages.length + formData.imageUrls.length > 20) {
      setError('Maximum 20 images autorisées');
      return;
    }

    validImages.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result;
        setPreviews(prev => [...prev, { id: Date.now() + Math.random(), url: base64, name: file.name }]);
        setFormData(prev => ({
          ...prev,
          imageUrls: [...prev.imageUrls, base64]
        }));
      };
      reader.readAsDataURL(file);
    });
    setError('');
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

  const removeImage = (index) => {
    setPreviews(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.content.trim()) {
      setError('Le contenu est obligatoire');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        eventId: eventId || '00000000-0000-0000-0000-000000000000',
        content: formData.content,
        imageUrls: formData.imageUrls,
      };

      await apiClient.post('/posts', payload);
      navigate('/admin/posts');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création du post');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout pageTitle="Créer une Publication">
      <div className="max-w-5xl mx-auto">
        {/* Header iOS 26 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="relative">
              <div className="absolute inset-0 bg-teal-500/20 blur-2xl rounded-lg opacity-30"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg border border-teal-400/30 backdrop-blur-xl">
                <Plus size={24} className="text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Nouvelle Publication</h2>
          </div>
          <p className="text-gray-600 ml-15">Créez et partagez une nouvelle publication</p>
        </div>

        {error && (
          <div className="bg-red-50/60 backdrop-blur-lg border border-red-200/40 border-l-4 border-l-red-600 text-red-700 px-6 py-4 rounded-2xl mb-8 shadow-sm">
            <p className="font-semibold">Erreur</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white/40 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/40 shadow-sm space-y-8">
          {/* Contenu */}
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-teal-600 to-teal-400 rounded"></div>
              Contenu de la publication
            </h3>
            <label className="block text-sm font-semibold text-gray-700 mt-4">Contenu *</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows="5"
              placeholder="Partagez votre publication..."
              className="w-full bg-white/40 backdrop-blur-sm text-gray-900 px-4 py-3 rounded-xl border border-gray-200/40 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200/30 transition resize-none"
              required
            />
          </div>

          {/* Drag and Drop Zone */}
          <div className="border-t border-gray-200/40 pt-8">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
              <div className="w-1 h-6 bg-gradient-to-b from-teal-600 to-teal-400 rounded"></div>
              Photos et médias
            </h3>

            <div>
              <label className="block text-sm font-semibold mb-4 text-gray-700">Ajouter des Photos</label>
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition backdrop-blur-sm ${
                  dragActive
                    ? 'border-teal-500 bg-teal-50/60'
                    : 'border-gray-200/40 hover:border-teal-400/60 hover:bg-teal-50/30'
                }`}
              >
                <input
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.gif,.webp,.bmp"
                  onChange={handleFileInput}
                  className="hidden"
                  id="file-input"
                />
                <label htmlFor="file-input" className="cursor-pointer block">
                  <div className="mb-4 flex justify-center">
                    <div className="p-4 bg-teal-100/60 rounded-2xl border border-teal-200/40">
                      <Upload size={32} className="text-teal-600" />
                    </div>
                  </div>
                  <p className="text-gray-900 mb-1 font-semibold">Glissez vos photos ici ou cliquez</p>
                  <p className="text-gray-600 text-sm">
                    JPG, PNG, GIF, WebP — {formData.imageUrls.length}/20 images
                  </p>
                </label>
              </div>
            </div>
          </div>

          {/* Image Preview Grid */}
          {previews.length > 0 && (
            <div className="border-t border-gray-200/40 pt-8">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-gradient-to-b from-teal-600 to-teal-400 rounded"></div>
                Aperçu des photos <span className="ml-2 px-3 py-1 bg-teal-100/60 text-teal-700 text-sm font-bold rounded-full border border-teal-200/40">({previews.length})</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {previews.map((preview, index) => (
                  <div key={preview.id} className="relative group">
                    <img
                      src={preview.url}
                      alt={`Preview ${index}`}
                      className="w-full h-32 object-cover rounded-2xl border-2 border-dashed border-teal-300/40 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-gradient-to-br from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 rounded-full p-2 opacity-0 group-hover:opacity-100 transition shadow-lg border border-red-400/30 backdrop-blur-sm"
                    >
                      <X size={16} className="text-white" />
                    </button>
                    <span className="absolute bottom-2 left-2 bg-gray-900/70 backdrop-blur-sm px-2 py-1 rounded-lg text-xs text-white font-semibold border border-gray-700/40">
                      {index + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 justify-end pt-6 border-t border-gray-200/40">
            <button
              type="button"
              onClick={() => navigate('/admin/posts')}
              className="px-6 py-3 border-2 border-gray-200/40 text-gray-700 rounded-xl hover:bg-gray-50/40 transition font-semibold backdrop-blur-sm"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 rounded-xl transition disabled:opacity-50 text-white font-semibold shadow-lg backdrop-blur-sm border border-teal-400/30"
            >
              {loading ? 'Publication...' : 'Publier'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
