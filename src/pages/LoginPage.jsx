import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loading, error } = useAuthStore();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [focusedField, setFocusedField] = useState(null);

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
    <div className="min-h-screen flex items-center justify-center bg-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=SF+Pro+Display:wght@400;500;600;700&display=swap');
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', 'Helvetica Neue', sans-serif;
          background: linear-gradient(135deg, #f5f5f7 0%, #ffffff 100%);
        }

        .ios-input {
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
          border: 1px solid #e5e5e7;
          background-color: #f5f5f7;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-size: 16px;
        }

        .ios-input:focus {
          outline: none;
          background-color: #ffffff;
          border-color: #0071e3;
          box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.1);
        }

        .ios-button {
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
          font-weight: 600;
          letter-spacing: -0.5px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .ios-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 113, 227, 0.3);
        }

        .ios-button:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 2px 8px rgba(0, 113, 227, 0.2);
        }

        .ios-button:disabled {
          opacity: 0.6;
        }

        .error-alert {
          background-color: #fff5f5;
          border: 1px solid #fccccb;
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 14px;
          color: #d70015;
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

        .link-apple {
          color: #0071e3;
          text-decoration: none;
          font-weight: 500;
          transition: opacity 0.2s;
        }

        .link-apple:hover {
          opacity: 0.7;
        }

        .ios-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          border: 1px solid rgba(0, 0, 0, 0.08);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
        }
      `}</style>

      <div className="w-full max-w-sm px-6">
        <div className="ios-card p-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img 
              src="/logo.png" 
              alt="RISE Logo" 
              className="h-16 w-auto object-contain"
            />
          </div>

          {/* Title */}
          <h1 className="text-center text-3xl font-bold text-black mb-2">
            Bienvenue
          </h1>
          <p className="text-center text-gray-500 text-sm mb-8">
            Connectez-vous à votre compte RISE
          </p>

          {/* Error Alert */}
          {error && (
            <div className="error-alert mb-6">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                className="ios-input w-full px-4 py-3 rounded-12"
                placeholder="votre@email.com"
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                className="ios-input w-full px-4 py-3 rounded-12"
                placeholder="••••••••"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="ios-button w-full bg-[#3A8B89] hover:bg-[#2F6F6D] text-white/80 font-semibold py-3 rounded-12 mt-8"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
          <div className="text-center mt-8">
            <p className="text-gray-600 text-sm">
              Pas encore inscrit ?{' '}
              <Link to="/register" className="link-apple">
                S'inscrire
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Text */}
        <p className="text-center text-gray-500 text-xs mt-8">
          © 2026 RISE Platform. Tous droits réservés.
        </p>
      </div>
    </div>
  );
}
