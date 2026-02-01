import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BarChart3, PieChart, TrendingUp, Users, Loader, ArrowLeft, Download, FileText } from 'lucide-react';
import { formService } from '../services/formService';
import AdminLayout from '../components/AdminLayout';

export default function AdminFormAnalyticsPage() {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingCSV, setDownloadingCSV] = useState(false);
  const [downloadingExcel, setDownloadingExcel] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState({}); // État pour les questions expandues

  useEffect(() => {
    loadData();
  }, [formId]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [formData, submissionsData] = await Promise.all([
        formService.getFormById(formId),
        formService.getSubmissions(formId),
      ]);
      setForm(formData);
      setSubmissions(submissionsData || []);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    setDownloadingCSV(true);
    try {
      // En-têtes du CSV - inclure une colonne par question
      const headers = ['#', 'Utilisateur', 'Email', 'Date'];
      
      // Ajouter les titres des questions
      if (form.questions && form.questions.length > 0) {
        form.questions.forEach((q) => {
          headers.push(q.title);
        });
      }

      // Données
      const rows = submissions.map((submission, idx) => {
        const row = [
          idx + 1,
          submission.userName || 'Anonyme',
          submission.userEmail || 'N/A',
          new Date(submission.submittedAt).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
        ];

        // Ajouter les réponses pour chaque question
        if (form.questions && form.questions.length > 0) {
          form.questions.forEach((question) => {
            // Récupérer TOUTES les réponses pour cette question
            const answers = submission.answers?.filter(a => a.questionId === question.id) || [];
            
            let answerText = '';
            if (answers.length > 0) {
              const answerTexts = answers.map(answer => {
                // Si c'est une équipe, afficher les noms des membres
                if (question.type === 'Team' && answer.teamMembers && answer.teamMembers.length > 0) {
                  return answer.teamMembers
                    .map(tm => `${tm.firstName} ${tm.lastName}`)
                    .join('; ');
                }
                // Sinon afficher l'option ou la valeur
                return answer.optionText || answer.responseValue || '';
              }).filter(text => text); // Filtrer les vides
              
              answerText = answerTexts.join('\n'); // Saut de ligne pour multi-réponses
            }
            row.push(answerText);
          });
        }

        return row;
      });

      // Créer le contenu CSV
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')),
      ].join('\n');

      // Créer un blob et télécharger
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `${form.title || 'formulaire'}_reponses.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Erreur lors du téléchargement CSV:', err);
      alert('Erreur lors du téléchargement du fichier CSV');
    } finally {
      setDownloadingCSV(false);
    }
  };

  const downloadExcel = () => {
    setDownloadingExcel(true);
    try {
      // Créer le contenu HTML pour Excel avec toutes les colonnes de questions
      let tableHeaders = '<th>#</th><th>Utilisateur</th><th>Email</th><th>Date</th>';
      
      // Ajouter les colonnes pour chaque question
      if (form.questions && form.questions.length > 0) {
        form.questions.forEach((q) => {
          tableHeaders += `<th>${q.title}</th>`;
        });
      }

      const tableRows = submissions.map((submission, idx) => {
        let row = `<td>${idx + 1}</td><td>${submission.userName || 'Anonyme'}</td><td>${submission.userEmail || 'N/A'}</td><td>${new Date(submission.submittedAt).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}</td>`;

        // Ajouter les réponses pour chaque question
        if (form.questions && form.questions.length > 0) {
          form.questions.forEach((question) => {
            // Récupérer TOUTES les réponses pour cette question
            const answers = submission.answers?.filter(a => a.questionId === question.id) || [];
            
            let answerText = '';
            if (answers.length > 0) {
              const answerTexts = answers.map(answer => {
                // Si c'est une équipe, afficher les noms des membres
                if (question.type === 'Team' && answer.teamMembers && answer.teamMembers.length > 0) {
                  return answer.teamMembers
                    .map(tm => `${tm.firstName} ${tm.lastName}`)
                    .join('; ');
                }
                // Sinon afficher l'option ou la valeur
                return answer.optionText || answer.responseValue || '';
              }).filter(text => text); // Filtrer les vides
              
              answerText = answerTexts.join('<br/>'); // Saut de ligne HTML pour multi-réponses
            }
            row += `<td>${answerText}</td>`;
          });
        }

        return `<tr>${row}</tr>`;
      }).join('');

      const htmlContent = `
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; }
              h2 { color: #333; }
              p { color: #666; margin-bottom: 20px; }
              table { border-collapse: collapse; width: 100%; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 12px; text-align: left; vertical-align: top; white-space: pre-wrap; word-break: break-word; }
              th { background-color: #4a5568; color: white; font-weight: bold; }
              tr:nth-child(even) { background-color: #f9f9f9; }
              tr:hover { background-color: #f0f0f0; }
            </style>
          </head>
          <body>
            <h2>${form.title || 'Formulaire'} - Réponses Détaillées</h2>
            <p><strong>Date d'export:</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
            <p><strong>Nombre de réponses:</strong> ${submissions.length}</p>
            <table>
              <thead>
                <tr>
                  ${tableHeaders}
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
          </body>
        </html>
      `;

      // Créer un blob et télécharger
      const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `${form.title || 'formulaire'}_reponses_detaillees.xls`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Erreur lors du téléchargement Excel:', err);
      alert('Erreur lors du téléchargement du fichier Excel');
    } finally {
      setDownloadingExcel(false);
    }
  };

  const calculateStats = () => {
    const stats = {
      totalResponses: submissions.length,
      participationRate: form ? Math.round((submissions.length / 100) * 100) : 0,
      averageResponseTime: calculateAverageResponseTime(),
      responsesByDay: calculateResponsesByDay(),
    };
    return stats;
  };

  const calculateAverageResponseTime = () => {
    if (submissions.length === 0) return 0;
    // Calcul simplifié - vous pouvez améliorer cela avec les timestamps
    return 'N/A';
  };

  const calculateResponsesByDay = () => {
    const groupedByDay = {};
    submissions.forEach((sub) => {
      const date = new Date(sub.submittedAt).toLocaleDateString('fr-FR');
      groupedByDay[date] = (groupedByDay[date] || 0) + 1;
    });
    return Object.entries(groupedByDay).map(([date, count]) => ({
      date,
      count,
    }));
  };

  const getQuestionStats = (question) => {
    const answers = submissions.flatMap((s) => s.answers || []).filter((a) => a.questionId === question.id);

    if (question.type === 'MultipleChoice' || question.type === 'Checkboxes' || question.type === 'Dropdown') {
      const optionCounts = {};
      answers.forEach((a) => {
        optionCounts[a.responseValue] = (optionCounts[a.responseValue] || 0) + 1;
      });
      return optionCounts;
    }

    return answers.map((a) => a.responseValue);
  };

  // Fonction pour basculer l'expansion d'une question
  const toggleQuestionExpanded = (questionId) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  // Fonction pour calculer des stats intéressantes par question
  const getDetailedQuestionStats = (question) => {
    const answers = submissions.flatMap((s) => s.answers || []).filter((a) => a.questionId === question.id);
    
    // ✅ Compter les SOUMISSIONS avec réponse (pas le nombre de réponses)
    const submissionsWithAnswer = new Set(
      submissions
        .filter(s => s.answers?.some(a => a.questionId === question.id))
        .map(s => s.id)
    ).size;
    
    const answerCount = submissionsWithAnswer; // Nombre de soumissions qui ont répondu
    const nonAnswerCount = submissions.length - answerCount;

    if (question.type === 'MultipleChoice' || question.type === 'Checkboxes' || question.type === 'Dropdown') {
      const optionCounts = {};
      answers.forEach((a) => {
        // Utiliser optionText si disponible, sinon responseValue
        const optionText = a.optionText || a.responseValue || 'Sans label';
        optionCounts[optionText] = (optionCounts[optionText] || 0) + 1;
      });
      
      const totalOptions = Object.keys(optionCounts).length;
      const mostPopular = Object.entries(optionCounts).reduce((a, b) => a[1] > b[1] ? a : b, ['', 0]);
      const responseRate = submissions.length > 0 ? Math.round((answerCount / submissions.length) * 100) : 0;
      
      return {
        type: 'choice',
        answerCount,
        nonAnswerCount,
        responseRate,
        totalOptions,
        mostPopularOption: mostPopular[0],
        mostPopularCount: mostPopular[1],
        optionCounts
      };
    }

    if (question.type === 'Scale') {
      const values = answers.map(a => parseInt(a.responseValue)).filter(v => !isNaN(v));
      if (values.length === 0) return { type: 'scale', answerCount: 0, nonAnswerCount: submissions.length, responseRate: 0, average: 0, median: 0 };
      
      values.sort((a, b) => a - b);
      const sum = values.reduce((a, b) => a + b, 0);
      const average = Math.round(sum / values.length * 10) / 10;
      const median = values[Math.floor(values.length / 2)];
      const responseRate = Math.round((answerCount / submissions.length) * 100);
      
      return {
        type: 'scale',
        answerCount,
        nonAnswerCount,
        responseRate,
        average,
        median,
        min: Math.min(...values),
        max: Math.max(...values)
      };
    }

    if (question.type === 'Team') {
      const teams = [];
      answers.forEach(a => {
        if (a.teamMembers && a.teamMembers.length > 0) {
          a.teamMembers.forEach(member => {
            teams.push(`${member.firstName} ${member.lastName}`);
          });
        }
      });
      
      const responseRate = Math.round((answerCount / submissions.length) * 100);
      const totalMembers = teams.length;
      const avgMembersPerTeam = answerCount > 0 ? Math.round(totalMembers / answerCount * 10) / 10 : 0;
      
      return {
        type: 'team',
        answerCount,
        nonAnswerCount,
        responseRate,
        totalMembers,
        avgMembersPerTeam
      };
    }

    // Pour les textes
    const responseRate = Math.round((answerCount / submissions.length) * 100);
    const avgLength = answerCount > 0 ? Math.round(answers.reduce((sum, a) => sum + (a.responseValue || '').length, 0) / answerCount) : 0;
    
    return {
      type: 'text',
      answerCount,
      nonAnswerCount,
      responseRate,
      avgLength
    };
  };

  if (loading) {
    return (
      <AdminLayout pageTitle="Analytics du Formulaire">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-teal-200 border-t-teal-600 animate-spin"></div>
            <p className="text-gray-600 font-medium">Chargement des données...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!form) {
    return (
      <AdminLayout pageTitle="Analytics du Formulaire">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50/60 backdrop-blur-lg border border-red-200/40 border-l-4 border-l-red-600 text-red-700 px-6 py-4 rounded-2xl shadow-sm">
            {error || 'Formulaire non trouvé'}
          </div>
        </div>
      </AdminLayout>
    );
  }

  const stats = calculateStats();

  return (
    <AdminLayout pageTitle={`${form.title} - Analytics`}>
      <div className="max-w-7xl mx-auto">
        {/* Header avec boutons */}
        <div className="mb-8 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/admin/forms`)}
                className="flex items-center gap-2 px-4 py-2 bg-white/40 backdrop-blur-xl hover:bg-white/50 text-gray-900 rounded-xl transition font-semibold border border-gray-200/40 shadow-sm"
              >
                <ArrowLeft size={20} />
                <span>Retour</span>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{form.title}</h1>
                <p className="text-gray-600">Analytics et Réponses</p>
              </div>
            </div>
            
            {/* Boutons de téléchargement */}
            <div className="flex gap-3">
              <button
                onClick={downloadCSV}
                disabled={downloadingCSV || submissions.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-xl transition font-semibold shadow-md backdrop-blur-sm border border-emerald-400/30"
              >
                <Download size={20} />
                <span>CSV</span>
              </button>
              <button
                onClick={downloadExcel}
                disabled={downloadingExcel || submissions.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-xl transition font-semibold shadow-md backdrop-blur-sm border border-blue-400/30"
              >
                <FileText size={20} />
                <span>Excel</span>
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50/60 backdrop-blur-lg border border-red-200/40 border-l-4 border-l-red-600 text-red-700 px-6 py-4 rounded-2xl mb-8 shadow-sm">
            {error}
          </div>
        )}

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Réponses"
            value={stats.totalResponses}
            icon={Users}
            gradient="from-teal-100/60 to-teal-50/40"
            textColor="text-teal-700"
            borderColor="border-teal-200/40"
          />
          <StatCard
            title="Taux de Participation"
            value={`${stats.participationRate}%`}
            icon={TrendingUp}
            gradient="from-emerald-100/60 to-emerald-50/40"
            textColor="text-emerald-700"
            borderColor="border-emerald-200/40"
          />
          <StatCard
            title="Taux de Complétion"
            value={submissions.length > 0 ? '100%' : '0%'}
            icon={BarChart3}
            gradient="from-purple-100/60 to-purple-50/40"
            textColor="text-purple-700"
            borderColor="border-purple-200/40"
          />
          <StatCard
            title="Questions"
            value={form.questions?.length || 0}
            icon={PieChart}
            gradient="from-orange-100/60 to-orange-50/40"
            textColor="text-orange-700"
            borderColor="border-orange-200/40"
          />
        </div>

        {/* Réponses par jour */}
        {stats.responsesByDay.length > 0 && (
          <div className="bg-white/40 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/40 shadow-sm mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-teal-600 to-teal-400 rounded"></div>
              Réponses par Jour
            </h2>
            <div className="space-y-4">
              {stats.responsesByDay.map((day) => (
                <div key={day.date} className="flex items-center gap-4">
                  <span className="w-28 text-sm font-semibold text-gray-700">{day.date}</span>
                  <div className="flex-1 h-10 bg-white/40 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-200/40">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 to-teal-600 flex items-center justify-end pr-4 transition-all duration-300"
                      style={{ width: `${Math.min((day.count / Math.max(...stats.responsesByDay.map((d) => d.count)) || 1) * 100, 100)}%` }}
                    >
                      <span className="text-white text-sm font-bold">{day.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analyse par question */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Analyse des Questions</h2>

          {form.questions?.map((question, qIndex) => {
            const questionStats = getQuestionStats(question);
            const detailedStats = getDetailedQuestionStats(question);
            const isExpanded = expandedQuestions[question.id] || false;

            return (
              <div key={question.id} className="bg-white/40 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/40 shadow-sm">
                {/* En-tête avec stats résumées */}
                <div className="mb-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-teal-100/60 to-teal-50/40 text-teal-700 rounded-full text-sm font-bold border border-teal-200/40">
                          {qIndex + 1}
                        </span>
                        <h3 className="text-lg font-semibold text-gray-900">{question.title}</h3>
                      </div>
                      {question.description && (
                        <p className="text-gray-600 text-sm ml-11">{question.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => toggleQuestionExpanded(question.id)}
                      className="ml-4 px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white rounded-lg transition font-semibold text-sm shadow-md border border-teal-400/30 whitespace-nowrap"
                    >
                      {isExpanded ? '▼ Masquer détails' : '▶ Voir détails'}
                    </button>
                  </div>

                  {/* Stats résumées toujours visibles */}
                  <div className="ml-11 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {detailedStats.type === 'choice' && (
                      <>
                        <div className="bg-gradient-to-br from-blue-50/80 to-cyan-50/80 rounded-lg p-3 border border-blue-200/60">
                          <p className="text-xs font-semibold text-gray-600">Taux réponse</p>
                          <p className="text-xl font-bold text-blue-700">{detailedStats.responseRate}%</p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50/80 to-pink-50/80 rounded-lg p-3 border border-purple-200/60">
                          <p className="text-xs font-semibold text-gray-600">Total options</p>
                          <p className="text-xl font-bold text-purple-700">{detailedStats.totalOptions}</p>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/80 rounded-lg p-3 border border-emerald-200/60 md:col-span-2">
                          <p className="text-xs font-semibold text-gray-600">Option populaire</p>
                          <p className="text-sm font-bold text-emerald-700 truncate">{detailedStats.mostPopularOption} ({detailedStats.mostPopularCount})</p>
                        </div>
                      </>
                    )}
                    
                    {detailedStats.type === 'scale' && (
                      <>
                        <div className="bg-gradient-to-br from-blue-50/80 to-cyan-50/80 rounded-lg p-3 border border-blue-200/60">
                          <p className="text-xs font-semibold text-gray-600">Taux réponse</p>
                          <p className="text-xl font-bold text-blue-700">{detailedStats.responseRate}%</p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50/80 to-pink-50/80 rounded-lg p-3 border border-purple-200/60">
                          <p className="text-xs font-semibold text-gray-600">Moyenne</p>
                          <p className="text-xl font-bold text-purple-700">{detailedStats.average}/5</p>
                        </div>
                        <div className="bg-gradient-to-br from-orange-50/80 to-yellow-50/80 rounded-lg p-3 border border-orange-200/60">
                          <p className="text-xs font-semibold text-gray-600">Médiane</p>
                          <p className="text-xl font-bold text-orange-700">{detailedStats.median}</p>
                        </div>
                        <div className="bg-gradient-to-br from-red-50/80 to-rose-50/80 rounded-lg p-3 border border-red-200/60">
                          <p className="text-xs font-semibold text-gray-600">Étendue</p>
                          <p className="text-xl font-bold text-red-700">{detailedStats.min}-{detailedStats.max}</p>
                        </div>
                      </>
                    )}

                    {detailedStats.type === 'team' && (
                      <>
                        <div className="bg-gradient-to-br from-blue-50/80 to-cyan-50/80 rounded-lg p-3 border border-blue-200/60">
                          <p className="text-xs font-semibold text-gray-600">Taux réponse</p>
                          <p className="text-xl font-bold text-blue-700">{detailedStats.responseRate}%</p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50/80 to-pink-50/80 rounded-lg p-3 border border-purple-200/60">
                          <p className="text-xs font-semibold text-gray-600">Total membres</p>
                          <p className="text-xl font-bold text-purple-700">{detailedStats.totalMembers}</p>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/80 rounded-lg p-3 border border-emerald-200/60 md:col-span-2">
                          <p className="text-xs font-semibold text-gray-600">Moyenne par équipe</p>
                          <p className="text-xl font-bold text-emerald-700">{detailedStats.avgMembersPerTeam} pers.</p>
                        </div>
                      </>
                    )}

                    {detailedStats.type === 'text' && (
                      <>
                        <div className="bg-gradient-to-br from-blue-50/80 to-cyan-50/80 rounded-lg p-3 border border-blue-200/60">
                          <p className="text-xs font-semibold text-gray-600">Taux réponse</p>
                          <p className="text-xl font-bold text-blue-700">{detailedStats.responseRate}%</p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50/80 to-pink-50/80 rounded-lg p-3 border border-purple-200/60 md:col-span-3">
                          <p className="text-xs font-semibold text-gray-600">Moyenne caractères</p>
                          <p className="text-xl font-bold text-purple-700">{detailedStats.avgLength} chars</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Détails expandus */}
                {isExpanded && (
                  <div className="border-t border-gray-200/40 pt-6">
                    {/* Affichage des réponses */}
                    {typeof questionStats === 'object' && !Array.isArray(questionStats) ? (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900 mb-4">Distribution des réponses</h4>
                        {Object.entries(questionStats).map(([option, count]) => {
                          const percentage = detailedStats.answerCount > 0 ? Math.round((count / detailedStats.answerCount) * 100) : 0;
                          return (
                            <div key={option} className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-700 font-medium">{option}</span>
                                <span className="text-gray-600">{count} ({percentage}%)</span>
                              </div>
                              <div className="w-full h-8 bg-white/40 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-200/40">
                                <div
                                  className="h-full bg-gradient-to-r from-teal-500 to-teal-600 flex items-center pl-3 transition-all duration-300"
                                  style={{ width: `${percentage}%` }}
                                >
                                  {percentage > 15 && (
                                    <span className="text-white text-xs font-bold">{percentage}%</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        <h4 className="font-semibold text-gray-900 mb-4">Réponses textuelles</h4>
                        {Array.isArray(questionStats) && questionStats.length > 0 ? (
                          questionStats.map((response, idx) => (
                            <div key={idx} className="p-3 bg-gradient-to-br from-teal-50/60 to-white/30 rounded-xl text-sm text-gray-700 border border-teal-200/40">
                              {response || '(aucune réponse)'}
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-600 text-sm">Aucune réponse pour cette question</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Tableau des réponses */}
        {submissions.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Tableau Détaillé des Réponses</h2>
            <div className="bg-white/40 backdrop-blur-xl rounded-3xl overflow-x-auto border border-gray-200/40 shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-teal-50/60 to-white/30 border-b border-gray-200/40 sticky top-0">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700 min-w-12">#</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700 min-w-48">Utilisateur</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700 min-w-40">Date</th>
                    {form.questions?.map((question) => (
                      <th key={question.id} className="px-6 py-4 text-left font-semibold text-gray-700 min-w-64">
                        {question.title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((submission, idx) => (
                    <tr key={submission.id} className="border-b border-gray-200/40 hover:bg-teal-50/40 transition">
                      <td className="px-6 py-4 text-gray-900 font-semibold">{idx + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-teal-700 font-semibold">{submission.userName || 'Anonyme'}</span>
                          <span className="text-gray-600 text-xs">{submission.userEmail || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-xs">
                        {new Date(submission.submittedAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      {form.questions?.map((question) => {
                        // Récupérer TOUTES les réponses pour cette question
                        const answers = submission.answers?.filter(a => a.questionId === question.id) || [];
                        
                        return (
                          <td key={`${submission.id}-${question.id}`} className="px-6 py-4 text-gray-700">
                            {answers.length > 0 ? (
                              <div className="flex flex-col gap-2">
                                {answers.map((answer, aIdx) => (
                                  <div key={aIdx} className="bg-gradient-to-r from-teal-50/80 to-emerald-50/80 border border-teal-200/60 rounded-lg p-2 text-sm">
                                    {question.type === 'Team' && answer.teamMembers && answer.teamMembers.length > 0 ? (
                                      <div className="flex flex-col gap-1">
                                        {answer.teamMembers.map((member, mIdx) => (
                                          <div key={mIdx} className="flex items-center gap-2">
                                            {member.profileImageUrl && (
                                              <img 
                                                src={member.profileImageUrl} 
                                                alt={member.firstName}
                                                className="w-6 h-6 rounded-full object-cover"
                                              />
                                            )}
                                            <span className="font-medium text-teal-700">
                                              {member.firstName} {member.lastName}
                                            </span>
                                            {member.matriculeNumber && (
                                              <span className="text-xs text-gray-500">({member.matriculeNumber})</span>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-teal-700 font-medium">
                                        {answer.optionText || answer.responseValue || '—'}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400 italic">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );

  function StatCard({ title, value, icon: Icon, gradient, textColor, borderColor }) {
    return (
      <div className={`bg-gradient-to-br ${gradient} backdrop-blur-xl rounded-3xl p-6 border ${borderColor} shadow-sm hover:shadow-lg transition-all duration-300`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">{title}</p>
            <p className={`text-3xl font-black mt-3 ${textColor}`}>{value}</p>
          </div>
          <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center border ${borderColor}`}>
            <Icon size={28} className={textColor} />
          </div>
        </div>
      </div>
    );
  }
}
