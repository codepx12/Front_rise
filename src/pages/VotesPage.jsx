import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVoteStore } from '../store/voteStore';
import { useAuthStore } from '../store/authStore';
import { Vote } from 'lucide-react';
import MainLayout from '../components/MainLayout';

export default function VotesPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { votes, fetchAllVotes, loading } = useVoteStore();

  useEffect(() => {
    fetchAllVotes();
  }, []);

  const activeVotes = votes.filter((v) => v.isActive);
  const completedVotes = votes.filter((v) => !v.isActive && v.resultsPublished);
  const upcomingVotes = votes.filter((v) => !v.isActive && !v.resultsPublished);

  return (
    <MainLayout>
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Élections</h1>
        <p className="text-gray-600">Participez aux élections et consultez les résultats</p>
      </div>

      {loading ? (
        <div className="text-center text-gray-600">Chargement des élections...</div>
      ) : (
        <>
          {/* Active Votes */}
          {activeVotes.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Élections en cours</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeVotes.map((vote) => (
                  <div
                    key={vote.id}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6 border-l-4 border-blue-600"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">{vote.title}</h3>
                        <p className="text-sm text-gray-600">{vote.description}</p>
                      </div>
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                        En cours
                      </span>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-700">
                        {vote.positions.length} poste(s) à pourvoir
                      </p>
                    </div>

                    <button
                      onClick={() => navigate(`/votes/${vote.id}`)}
                      className="w-full bg-[#3A8B89] text-white/80 py-2 rounded-lg hover:bg-[#2F6F6D] transition"
                    >
                      Participer au vote
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Completed Votes */}
          {completedVotes.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Résultats publiés</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {completedVotes.map((vote) => (
                  <div
                    key={vote.id}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6 border-l-4 border-green-600"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">{vote.title}</h3>
                        <p className="text-sm text-gray-600">{vote.description}</p>
                      </div>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                        Complété
                      </span>
                    </div>

                    <button
                      onClick={() => navigate(`/votes/${vote.id}`)}
                      className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
                    >
                      Voir résultats
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Upcoming Votes */}
          {upcomingVotes.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Élections à venir</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {upcomingVotes.map((vote) => (
                  <div
                    key={vote.id}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6 border-l-4 border-gray-400"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">{vote.title}</h3>
                        <p className="text-sm text-gray-600">{vote.description}</p>
                      </div>
                      <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-semibold">
                        À venir
                      </span>
                    </div>

                    <p className="text-sm text-gray-700 mb-4">
                      Commençant le {new Date(vote.startDate).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {votes.length === 0 && (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              <p className="mb-2">🗳️ Aucune élection trouvée</p>
              <p className="text-sm">Les élections apparaîtront ici</p>
            </div>
          )}
        </>
      )}
    </MainLayout>
  );
}
