import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loading, error } = useAuthStore();
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await login(formData);
      if (response?.role === 'Admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(/register&login.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=SF+Pro+Display:wght@400;500;600;700&display=swap');
        
        * {
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', 'Helvetica Neue', sans-serif;
        }

        .auth-form {
          width: 90%;
          max-width: 420px;
        }

        .auth-input {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 100%);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 
            inset 0 1px 2px rgba(255, 255, 255, 0.3),
            inset -1px -1px 2px rgba(0, 0, 0, 0.1),
            0 8px 32px 0 rgba(31, 38, 135, 0.15);
          color: white;
          transition: all 0.3s ease;
          font-size: 15px;
          position: relative;
        }

        .auth-input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .auth-input:focus {
          outline: none;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.15) 100%);
          border-color: rgba(255, 255, 255, 0.5);
          box-shadow: 
            inset 0 1px 3px rgba(255, 255, 255, 0.4),
            inset -1px -1px 3px rgba(0, 0, 0, 0.15),
            0 8px 32px 0 rgba(0, 113, 227, 0.25),
            0 0 20px rgba(0, 113, 227, 0.1);
        }

        .auth-label {
          color: rgba(255, 255, 255, 0.85);
          font-size: 13px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.6px;
        }

        .auth-button {
          background: linear-gradient(135deg, #0071e3 0%, #0056b3 100%);
          color: white;
          font-weight: 600;
          letter-spacing: -0.3px;
          transition: all 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 
            0 8px 32px 0 rgba(0, 113, 227, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        .auth-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 
            0 12px 40px 0 rgba(0, 113, 227, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
        }

        .auth-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .auth-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error-alert {
          background: linear-gradient(135deg, rgba(255, 82, 82, 0.2) 0%, rgba(255, 82, 82, 0.1) 100%);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 82, 82, 0.4);
          color: #ff9999;
          font-size: 13px;
          border-radius: 12px;
          box-shadow: 0 8px 32px 0 rgba(255, 82, 82, 0.15);
          animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .link-text {
          color: #64b5f6;
          text-decoration: none;
          font-weight: 600;
          transition: opacity 0.2s;
        }

        .link-text:hover {
          opacity: 0.8;
        }

        .footer-text {
          color: rgba(255, 255, 255, 0.5);
          font-size: 12px;
        }

        .logo-bottom {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 50;
          opacity: 0.7;
          transition: opacity 0.3s ease;
        }

        .logo-bottom:hover {
          opacity: 1;
        }

        .logo-bottom img {
          height: 48px;
          width: auto;
          filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
        }

        @media (max-width: 640px) {
          .auth-form {
            max-width: 95%;
          }

          .logo-bottom {
            bottom: 12px;
            right: 12px;
          }

          .logo-bottom img {
            height: 36px;
          }
        }
      `}</style>

      <div className="auth-form">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Bienvenue
          </h1>
          <p className="text-sm text-gray-300">
            Connectez-vous à votre compte RISE
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="error-alert p-3 mb-6">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div>
            <label className="auth-label block mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="auth-input w-full px-4 py-3 rounded-2xl"
              placeholder="votre@email.com"
              required
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="auth-label block mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="auth-input w-full px-4 py-3 rounded-2xl"
              placeholder="••••••••"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="auth-button w-full px-4 py-3 rounded-2xl mt-6 font-semibold"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connexion en cours...
              </span>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-400">
            Pas encore inscrit ?{' '}
            <Link to="/register" className="link-text">
              S'inscrire
            </Link>
          </p>
        </div>

        {/* Footer Text */}
        <p className="footer-text text-center mt-8">
          © 2026 RISE Platform
        </p>
      </div>

      {/* Logo Bottom Right */}
      <div className="logo-bottom">
        <img 
          src="/logo.png" 
          alt="RISE Logo"
        />
      </div>
    </div>
  );
}
