import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePollStore } from '../store/pollStore';
import { useAuthStore } from '../store/authStore';
import { BarChart3 } from 'lucide-react';
import MainLayout from '../components/MainLayout';

export default function PollsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { polls, fetchAllPolls, loading } = usePollStore();

  useEffect(() => {
    fetchAllPolls();
  }, []);

  return (
    <MainLayout>
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Sondages</h1>
        <p className="text-gray-600">Participez à nos sondages et partagez votre avis</p>
      </div>

      {loading ? (
        <div className="text-center text-gray-600">Chargement des sondages...</div>
      ) : polls.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          <p className="mb-2">Aucun sondage pour le moment</p>
          <p className="text-sm">Les sondages apparaîtront ici</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {polls.map((poll) => (
            <div
              key={poll.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{poll.title}</h3>
                  <p className="text-sm text-gray-600">{poll.description}</p>
                </div>
                <BarChart3 className="text-green-600" size={24} />
              </div>

              <div className="space-y-3 mb-4">
                {poll.questions.slice(0, 2).map((question) => (
                  <div key={question.id}>
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      {question.questionText}
                    </p>
                    <div className="space-y-1">
                      {question.options.slice(0, 2).map((option) => (
                        <div
                          key={option.id}
                          className="flex justify-between items-center text-sm"
                        >
                          <span className="text-gray-600">{option.optionText}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition"
                                style={{ width: `${option.percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500 w-8">
                              {Math.round(option.percentage)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/polls/${poll.id}`)}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  {poll.hasUserResponded ? 'Voir résultats' : 'Répondre'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </MainLayout>
  );
}
