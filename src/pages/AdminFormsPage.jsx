import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit2, Trash2, BarChart3, Download, Loader, FileText, Users, Calendar, CheckCircle, Clock } from 'lucide-react';
import { formService } from '../services/formService';
import AdminLayout from '../components/AdminLayout';
import FormAnalyticsSidebar from '../components/FormAnalyticsSidebar';

export default function AdminFormsPage() {
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  // ✅ PAGINATION: Charger seulement 20 formulaires à la fois
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [allForms, setAllForms] = useState([]);
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await formService.getAllForms();
      setAllForms(data || []);
      
      // ✅ Charger seulement la 1ère page
      const firstPage = (data || []).slice(0, ITEMS_PER_PAGE);
      setForms(firstPage);
      setPage(0);
      setHasMore((data || []).length > ITEMS_PER_PAGE);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des formulaires');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Charger plus de formulaires
  const loadMore = () => {
    const nextPage = page + 1;
    const start = nextPage * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const nextBatch = allForms.slice(start, end);
    
    setForms([...forms, ...nextBatch]);
    setPage(nextPage);
    setHasMore(allForms.length > end);
  };

  const handleDelete = async (formId) => {
    try {
      await formService.deleteForm(formId);
      setForms(forms.filter((f) => f.id !== formId));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err.message || 'Erreur lors de la suppression');
    }
  };

  const handlePublish = async (formId) => {
    try {
      await formService.publishForm(formId);
      loadForms();
    } catch (err) {
      setError(err.message || 'Erreur lors de la publication');
    }
  };

  const handleExportCSV = async (formId) => {
    try {
      await formService.exportAsCSV(formId);
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'export CSV');
    }
  };

  const handleExportExcel = async (formId) => {
    try {
      await formService.exportAsExcel(formId);
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'export Excel');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (form) => {
    if (form.isPublished) return 'bg-gray-200/60 text-gray-900 border-gray-300/40';
    return 'bg-gray-300/60 text-gray-800 border-gray-400/40';
  };

  const getStatusBadge = (form) => {
    if (form.isPublished) return { text: ' Publié', icon: '🟢' };
    return { text: '⚠ Brouillon', icon: '⏸️' };
  };

  return (
    <AdminLayout pageTitle="Formulaires Rise">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Main Content - Left Side */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4 mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Gestion des Formulaires</h2>
            <button
              onClick={() => navigate('/admin/forms/create')}
              className="flex items-center gap-2 px-3 md:px-6 py-2 md:py-3 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-800 hover:to-gray-700 rounded-xl transition font-semibold text-white shadow-lg backdrop-blur-sm border border-gray-600/30 text-sm md:text-base whitespace-nowrap"
            >
              <Plus size={18} className="md:size-5" /> <span className="hidden sm:inline">Créer Formulaire</span><span className="sm:hidden">+</span>
            </button>
          </div>

          {error && (
            <div className="bg-red-50/60 backdrop-blur-lg border border-red-200/40 border-l-4 border-l-red-600 text-red-700 px-4 md:px-6 py-3 md:py-4 rounded-2xl mb-6 md:mb-8 shadow-sm text-sm">
              <p className="font-semibold">Erreur</p>
              <p className="text-xs md:text-sm mt-1">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-teal-200 border-t-teal-600 animate-spin"></div>
                <p className="text-gray-600 font-medium">Chargement des formulaires...</p>
              </div>
            </div>
          ) : forms.length === 0 ? (
            <div className="text-center py-12 md:py-16 bg-gradient-to-br from-gray-50/40 to-white/30 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-gray-200/40 shadow-sm">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">Aucun formulaire créé</h2>
              <p className="text-sm md:text-base text-gray-600 mb-6">Commencez par créer votre premier formulaire</p>
              <button
                onClick={() => navigate('/admin/forms/create')}
                className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-800 hover:to-gray-700 rounded-xl transition text-white font-semibold shadow-lg backdrop-blur-sm border border-gray-600/30 text-sm md:text-base"
              >
                Créer un formulaire
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {forms.map((form) => {
                const status = getStatusBadge(form);
                return (
                  <div
                    key={form.id}
                    className="group bg-white/20 backdrop-blur-3xl rounded-2xl md:rounded-3xl overflow-hidden border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:bg-white/25"
                  >
                    {/* Header avec gradient et icône */}
                    <div className="relative bg-gradient-to-r from-gray-/30 to-gray-/20 backdrop-blur-lg border-b border-white/20 px-4 md:px-6 py-4 md:py-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg border border-white/30 flex-shrink-0">
                            <FileText size={20} className="md:size-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h2 className="text-lg md:text-xl font-bold text-gray-950 break-words">{form.title}</h2>
                            {form.description && (
                              <p className="text-gray-700 text-xs md:text-sm line-clamp-1 mt-1">{form.description}</p>
                            )}
                          </div>
                        </div>
                        <span className={`px-3 md:px-4 py-1.5 rounded-full text-xs font-bold backdrop-blur-2xl border flex-shrink-0 whitespace-nowrap ${getStatusColor(form)}`}>
                          {status.icon} <span className="hidden sm:inline">{status.text}</span>
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 md:p-6">
                      {/* Stats Grid avec icônes */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mb-6">
                        <div className="bg-gradient-to-br from-teal-50/40 to-white/20 backdrop-blur-2xl rounded-xl md:rounded-2xl p-3 md:p-4 border border-teal-200/40 hover:bg-teal-50/60 transition">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText size={16} className="text-teal-600" />
                            <p className="text-gray-700 font-semibold uppercase text-xs">Questions</p>
                          </div>
                          <p className="text-2xl md:text-3xl font-bold text-teal-700">{form.questions?.length || 0}</p>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-50/40 to-white/20 backdrop-blur-2xl rounded-xl md:rounded-2xl p-3 md:p-4 border border-emerald-200/40 hover:bg-emerald-50/60 transition">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle size={16} className="text-emerald-600" />
                            <p className="text-gray-700 font-semibold uppercase text-xs">Réponses</p>
                          </div>
                          <p className="text-2xl md:text-3xl font-bold text-emerald-700">{form.submissions?.length || 0}</p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50/40 to-white/20 backdrop-blur-2xl rounded-xl md:rounded-2xl p-3 md:p-4 border border-blue-200/40 hover:bg-blue-50/60 transition">
                          <div className="flex items-center gap-2 mb-2">
                            <Users size={16} className="text-blue-600" />
                            <p className="text-gray-700 font-semibold uppercase text-xs">Public</p>
                          </div>
                          <p className="text-lg md:text-2xl font-bold text-blue-700">
                            {form.targetAudience === 'all' ? '👥' : form.targetAudience === 'students' ? '🎓' : '👨‍🏫'}
                          </p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50/40 to-white/20 backdrop-blur-2xl rounded-xl md:rounded-2xl p-3 md:p-4 border border-purple-200/40 hover:bg-purple-50/60 transition">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar size={16} className="text-purple-600" />
                            <p className="text-gray-700 font-semibold uppercase text-xs">Créée</p>
                          </div>
                          <p className="text-xs md:text-sm font-bold text-purple-700">{formatDate(form.createdAt).split(' ')[0]}</p>
                        </div>
                      </div>

                      {/* Date Range with Clock icon */}
                      <div className="mb-6 p-3 md:p-4 bg-gradient-to-r from-amber-50/40 to-orange-50/30 backdrop-blur-2xl rounded-xl md:rounded-2xl border border-amber-200/40">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock size={16} className="text-amber-600" />
                          <p className="text-xs md:text-sm font-semibold text-gray-700 uppercase">Période active</p>
                        </div>
                        <p className="text-xs md:text-sm text-gray-700">
                          <span className="text-gray-950 font-bold">{new Date(form.startDate).toLocaleDateString('fr-FR')}</span>
                          <span className="text-gray-700"> → </span>
                          <span className="text-gray-950 font-bold">{new Date(form.endDate).toLocaleDateString('fr-FR')}</span>
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-3">
                        {/* Primary Actions */}
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          <button
                            onClick={() => navigate(`/admin/forms/${form.id}`)}
                            className="flex items-center justify-center gap-1 px-3 py-2.5 bg-gradient-to-r from-white/30 to-white/20 backdrop-blur-2xl hover:from-white/40 hover:to-white/30 rounded-lg md:rounded-xl transition text-xs md:text-sm font-semibold text-gray-950 border border-white/40 shadow-md hover:shadow-lg"
                          >
                            <Eye size={16} className="hidden sm:block" />
                            <span>Voir</span>
                          </button>

                          <button
                            onClick={() => navigate(`/admin/forms/${form.id}/edit`)}
                            className="flex items-center justify-center gap-1 px-3 py-2.5 bg-gradient-to-r from-white/30 to-white/20 backdrop-blur-2xl hover:from-white/40 hover:to-white/30 rounded-lg md:rounded-xl transition text-xs md:text-sm font-semibold text-gray-950 border border-white/40 shadow-md hover:shadow-lg"
                          >
                            <Edit2 size={16} className="hidden sm:block" />
                            <span>Éditer</span>
                          </button>

                          <button
                            onClick={() => navigate(`/admin/forms/${form.id}/analytics`)}
                            className="flex items-center justify-center gap-1 px-3 py-2.5 bg-gradient-to-r from-white/30 to-white/20 backdrop-blur-2xl hover:from-white/40 hover:to-white/30 rounded-lg md:rounded-xl transition text-xs md:text-sm font-semibold text-gray-950 border border-white/40 shadow-md hover:shadow-lg"
                          >
                            <BarChart3 size={16} className="hidden sm:block" />
                            <span>Stats</span>
                          </button>

                          {!form.isPublished && (
                            <button
                              onClick={() => handlePublish(form.id)}
                              className="flex items-center justify-center gap-1 px-3 py-2.5 bg-gradient-to-r from-emerald-500/30 to-emerald-400/20 backdrop-blur-2xl hover:from-emerald-500/40 hover:to-emerald-400/30 rounded-lg md:rounded-xl transition text-xs md:text-sm font-bold text-emerald-700 border border-emerald-400/40 shadow-md hover:shadow-lg"
                            >
                              <CheckCircle size={16} />
                              <span className="hidden sm:inline">Publier</span>
                            </button>
                          )}
                        </div>

                        {/* Secondary Actions */}
                        <div className="grid grid-cols-2 sm:flex sm:gap-2 gap-2">
                          <button
                            onClick={() => handleExportCSV(form.id)}
                            className="flex items-center justify-center gap-1 px-3 py-2 bg-white/15 backdrop-blur-2xl hover:bg-white/25 rounded-lg md:rounded-xl transition text-xs font-semibold text-gray-800 border border-white/20 hover:border-white/40"
                            title="Exporter en CSV"
                          >
                            <Download size={14} />
                            <span>CSV</span>
                          </button>

                          <button
                            onClick={() => handleExportExcel(form.id)}
                            className="flex items-center justify-center gap-1 px-3 py-2 bg-white/15 backdrop-blur-2xl hover:bg-white/25 rounded-lg md:rounded-xl transition text-xs font-semibold text-gray-800 border border-white/20 hover:border-white/40"
                            title="Exporter en Excel"
                          >
                            <Download size={14} />
                            <span>XL</span>
                          </button>

                          <button
                            onClick={() => setDeleteConfirm(form.id)}
                            className="sm:ml-auto flex items-center justify-center gap-1 px-3 py-2 bg-white/10 backdrop-blur-2xl hover:bg-red-500/30 rounded-lg md:rounded-xl transition text-xs font-semibold text-gray-800 hover:text-red-700 border border-white/20 hover:border-red-400/40"
                          >
                            <Trash2 size={14} />
                            <span className="hidden sm:inline">Suppr</span>
                          </button>
                        </div>
                      </div>

                      {/* Delete Confirmation */}
                      {deleteConfirm === form.id && (
                        <div className="mt-4 p-3 md:p-4 bg-red-500/20 backdrop-blur-2xl border border-red-500/40 border-l-4 border-l-red-600 rounded-lg md:rounded-2xl">
                          <p className="text-red-900 font-semibold mb-3 text-sm">
                            Êtes-vous sûr de vouloir supprimer ce formulaire?
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDelete(form.id)}
                              className="flex-1 px-3 md:px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg md:rounded-xl transition font-semibold text-white shadow-md text-xs md:text-sm"
                            >
                              Supprimer
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="flex-1 px-3 md:px-4 py-2 bg-white/40 hover:bg-white/50 rounded-lg md:rounded-xl transition text-gray-900 font-semibold border border-white/30 text-xs md:text-sm"
                            >
                              Annuler
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {hasMore && (
                <div className="text-center mt-6">
                  <button
                    onClick={loadMore}
                    className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-800 hover:to-gray-700 rounded-xl transition text-white font-semibold shadow-lg backdrop-blur-sm border border-gray-600/30 text-sm md:text-base"
                  >
                    Charger plus
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar - Right Side - Analytics */}
        <div className="w-full lg:w-auto lg:flex-shrink-0">
          <div className="sticky top-6 lg:top-8">
            <FormAnalyticsSidebar forms={forms} />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
