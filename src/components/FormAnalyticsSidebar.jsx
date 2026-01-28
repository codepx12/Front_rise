import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, FileText, CheckCircle2 } from 'lucide-react';

export default function FormAnalyticsSidebar({ forms = [] }) {
  const [stats, setStats] = useState({
    totalForms: 0,
    totalSubmissions: 0,
    publishedForms: 0,
    draftForms: 0,
    averageSubmissionsPerForm: 0,
    submissionsTrend: [],
    formStatus: [],
    responsiveData: []
  });

  useEffect(() => {
    calculateStats();
  }, [forms]);

  const calculateStats = () => {
    if (!forms || forms.length === 0) {
      setStats({
        totalForms: 0,
        totalSubmissions: 0,
        publishedForms: 0,
        draftForms: 0,
        averageSubmissionsPerForm: 0,
        submissionsTrend: [],
        formStatus: [],
        responsiveData: []
      });
      return;
    }

    // Calculs basiques
    const totalForms = forms.length;
    const totalSubmissions = forms.reduce((sum, f) => sum + (f.submissions?.length || 0), 0);
    const publishedForms = forms.filter(f => f.isPublished).length;
    const draftForms = totalForms - publishedForms;
    const averageSubmissionsPerForm = totalForms > 0 ? Math.round(totalSubmissions / totalForms) : 0;

    // Données de tendance (par jour de création)
    const submissionsTrend = forms
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map((f, i) => ({
        name: f.title.substring(0, 8),
        submissions: f.submissions?.length || 0,
        questions: f.questions?.length || 0
      }))
      .slice(-7);

    // Statut des formulaires
    const formStatus = [
      { name: 'Publié', value: publishedForms, fill: '#1f2937' },
      { name: 'Brouillon', value: draftForms, fill: '#9ca3af' }
    ];

    // Données réactives (réponses par formulaire)
    const responsiveData = forms.map(f => ({
      name: f.title.substring(0, 12),
      taux: f.submissions?.length > 0 ? Math.round((f.submissions.length / (f.questions?.length || 1)) * 100) : 0
    }));

    setStats({
      totalForms,
      totalSubmissions,
      publishedForms,
      draftForms,
      averageSubmissionsPerForm,
      submissionsTrend,
      formStatus,
      responsiveData
    });
  };

  return (
    <div className="w-full lg:w-96 h-screen lg:h-auto flex flex-col lg:space-y-4">
      {/* Header - iOS 26 Style */}
      <div className="bg-white/20 backdrop-blur-3xl rounded-3xl p-5 border border-white/30 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl lg:text-2xl font-bold text-gray-950">Analyse</h2>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/30 backdrop-blur-2xl rounded-full border border-white/50 shadow-lg">
            <div className="w-2 h-2 bg-gray-700 rounded-full animate-pulse"></div>
            <p className="text-xs font-semibold text-gray-800">En direct</p>
          </div>
        </div>
        <p className="text-sm text-gray-700">Statistiques des formulaires</p>
      </div>

      {/* Scrollable Content Container - Fixed scroll styling */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden lg:overflow-y-auto lg:overflow-x-hidden space-y-4 pb-4 lg:pb-6 pr-2 lg:pr-3 scrollbar-hide">
        <style>{`
          .scrollbar-hide::-webkit-scrollbar {
            width: 6px;
          }
          .scrollbar-hide::-webkit-scrollbar-track {
            background: transparent;
          }
          .scrollbar-hide::-webkit-scrollbar-thumb {
            background: rgba(0, 0, 0, 0.15);
            border-radius: 10px;
          }
          .scrollbar-hide::-webkit-scrollbar-thumb:hover {
            background: rgba(0, 0, 0, 0.25);
          }
        `}</style>

        {/* Stats Cards - Grille 2x2 */}
        <div className="grid grid-cols-2 gap-3">
          {/* Card 1: Total Formulaires */}
          <div className="bg-white/15 backdrop-blur-3xl rounded-2xl p-3 lg:p-4 border border-white/30 shadow-lg hover:bg-white/20 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-white/20 backdrop-blur-2xl rounded-lg group-hover:bg-white/30 transition-colors">
                <FileText size={16} className="text-gray-700" />
              </div>
            </div>
            <p className="text-xs text-gray-700 font-medium mb-1">Total</p>
            <p className="text-2xl font-bold text-gray-950">{stats.totalForms}</p>
            <p className="text-xs text-gray-600 mt-1">
              <span className="font-semibold text-gray-800">formulaires</span>
            </p>
          </div>

          {/* Card 2: Formulaires Publiés */}
          <div className="bg-white/15 backdrop-blur-3xl rounded-2xl p-3 lg:p-4 border border-white/30 shadow-lg hover:bg-white/20 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-white/20 backdrop-blur-2xl rounded-lg group-hover:bg-white/30 transition-colors">
                <CheckCircle2 size={16} className="text-gray-700" />
              </div>
            </div>
            <p className="text-xs text-gray-700 font-medium mb-1">Publiés</p>
            <p className="text-2xl font-bold text-gray-950">{stats.publishedForms}</p>
            <p className="text-xs text-gray-600 mt-1">
              <span className="font-semibold text-gray-800">{Math.round((stats.publishedForms / (stats.totalForms || 1)) * 100)}%</span>
            </p>
          </div>

          {/* Card 3: Total Réponses */}
          <div className="bg-white/15 backdrop-blur-3xl rounded-2xl p-3 lg:p-4 border border-white/30 shadow-lg hover:bg-white/20 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-white/20 backdrop-blur-2xl rounded-lg group-hover:bg-white/30 transition-colors">
                <TrendingUp size={16} className="text-gray-700" />
              </div>
            </div>
            <p className="text-xs text-gray-700 font-medium mb-1">Réponses</p>
            <p className="text-2xl font-bold text-gray-950">{stats.totalSubmissions}</p>
            <p className="text-xs text-gray-600 mt-1">
              <span className="font-semibold text-gray-800">au total</span>
            </p>
          </div>

          {/* Card 4: Moyenne par Formulaire */}
          <div className="bg-white/15 backdrop-blur-3xl rounded-2xl p-3 lg:p-4 border border-white/30 shadow-lg hover:bg-white/20 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-white/20 backdrop-blur-2xl rounded-lg group-hover:bg-white/30 transition-colors">
                <Users size={16} className="text-gray-700" />
              </div>
            </div>
            <p className="text-xs text-gray-700 font-medium mb-1">Moyenne</p>
            <p className="text-2xl font-bold text-gray-950">{stats.averageSubmissionsPerForm}</p>
            <p className="text-xs text-gray-600 mt-1">
              <span className="font-semibold text-gray-800">par formulaire</span>
            </p>
          </div>
        </div>

        {/* Graphique Pie Chart - Statut */}
        {stats.totalForms > 0 && (
          <div className="bg-white/15 backdrop-blur-3xl rounded-2xl p-3 lg:p-4 border border-white/30 shadow-lg">
            <h3 className="text-sm font-bold text-gray-950 mb-3">Statut</h3>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.formStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={45}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stats.formStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      backdropFilter: 'blur(20px)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Graphique Bar Chart - Tendance */}
        {stats.submissionsTrend.length > 0 && (
          <div className="bg-white/15 backdrop-blur-3xl rounded-2xl p-3 lg:p-4 border border-white/30 shadow-lg">
            <h3 className="text-sm font-bold text-gray-950 mb-3">Soumissions</h3>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.submissionsTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 0, 0, 0.05)" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10 }}
                    stroke="rgba(0, 0, 0, 0.3)"
                  />
                  <YAxis 
                    tick={{ fontSize: 10 }}
                    stroke="rgba(0, 0, 0, 0.3)"
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      backdropFilter: 'blur(20px)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="submissions" fill="#4b5563" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Empty State */}
        {stats.totalForms === 0 && (
          <div className="bg-white/15 backdrop-blur-3xl rounded-2xl p-4 lg:p-6 border border-white/30 text-center shadow-lg">
            <div className="flex justify-center mb-2">
              <p className="text-3xl"></p>
            </div>
            <h3 className="text-sm font-bold text-gray-950 mb-1">Aucune donnée</h3>
            <p className="text-xs text-gray-700">Créez des formulaires pour voir les stats</p>
          </div>
        )}
      </div>
    </div>
  );
}
