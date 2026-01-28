import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useWebSocket } from './hooks/useWebSocket';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import VotesPage from './pages/VotesPage';
import MessagesPage from './pages/MessagesPage';
import FormsPage from './pages/FormsPage';
import FormResponsePage from './pages/FormResponsePage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminEventsPage from './pages/AdminEventsPage';
import AdminCreateEventPage from './pages/AdminCreateEventPage';
import AdminEditEventPage from './pages/AdminEditEventPage';
import AdminEventRegistrationsPage from './pages/AdminEventRegistrationsPage';
import AdminPollsPage from './pages/AdminPollsPage';
import AdminCreatePollPage from './pages/AdminCreatePollPage';
import AdminVotesPage from './pages/AdminVotesPage';
import AdminCreateVotePage from './pages/AdminCreateVotePage';
import AdminPostsPage from './pages/AdminPostsPage';
import AdminCreatePostPage from './pages/AdminCreatePostPage';
import AdminEditPostPage from './pages/AdminEditPostPage';
import AdminFormsPage from './pages/AdminFormsPage';
import AdminCreateFormPage from './pages/AdminCreateFormPage';
import AdminFormDetailPage from './pages/AdminFormDetailPage';
import AdminEditFormPage from './pages/AdminEditFormPage';
import AdminFormAnalyticsPage from './pages/AdminFormAnalyticsPage';
import './App.css';

// Composant pour protéger les routes
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

// Composant pour protéger les routes admin
function AdminRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore();
  return isAuthenticated && user?.role === 'Admin' ? children : <Navigate to="/dashboard" />;
}

function App() {
  // Initialiser la connexion WebSocket
  const { isConnected, error } = useWebSocket();

  useEffect(() => {
    if (isConnected) {
      console.log('✅ WebSocket connecté avec succès');
    }
    if (error) {
      console.warn('⚠️ Erreur WebSocket:', error);
    }
  }, [isConnected, error]);

  return (
    <Router>
      {/* Afficher le statut de connexion WebSocket (optionnel) */}
      {!isConnected && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-100 border-b border-yellow-400 text-yellow-800 px-4 py-2 text-sm z-50">
          ⚠️ Connexion WebSocket en cours... Les mises à jour en temps réel peuvent être retardées.
        </div>
      )}

      <Routes>
        {/* Routes publiques */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Routes utilisateur protégées */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <EventsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events/:eventId"
          element={
            <ProtectedRoute>
              <EventDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/votes"
          element={
            <ProtectedRoute>
              <VotesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <MessagesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/forms"
          element={
            <ProtectedRoute>
              <FormsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/forms/:formId"
          element={
            <ProtectedRoute>
              <FormResponsePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:userId"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Routes admin protégées */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminUsersPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/events"
          element={
            <AdminRoute>
              <AdminEventsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/events/create"
          element={
            <AdminRoute>
              <AdminCreateEventPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/events/edit/:eventId"
          element={
            <AdminRoute>
              <AdminEditEventPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/events/:eventId/registrations"
          element={
            <AdminRoute>
              <AdminEventRegistrationsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/polls"
          element={
            <AdminRoute>
              <AdminPollsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/polls/create"
          element={
            <AdminRoute>
              <AdminCreatePollPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/votes"
          element={
            <AdminRoute>
              <AdminVotesPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/votes/create"
          element={
            <AdminRoute>
              <AdminCreateVotePage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/posts"
          element={
            <AdminRoute>
              <AdminPostsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/posts/create"
          element={
            <AdminRoute>
              <AdminCreatePostPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/posts/edit/:postId"
          element={
            <AdminRoute>
              <AdminEditPostPage />
            </AdminRoute>
          }
        />

        {/* Routes Rise-Form */}
        <Route
          path="/admin/forms"
          element={
            <AdminRoute>
              <AdminFormsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/forms/create"
          element={
            <AdminRoute>
              <AdminCreateFormPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/forms/:formId"
          element={
            <AdminRoute>
              <AdminFormDetailPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/forms/:formId/edit"
          element={
            <AdminRoute>
              <AdminEditFormPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/forms/:formId/analytics"
          element={
            <AdminRoute>
              <AdminFormAnalyticsPage />
            </AdminRoute>
          }
        />

        {/* Redirection par défaut */}
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
