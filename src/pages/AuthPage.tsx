import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoginForm } from '../components/shared/LoginForm';
import { RegisterForm } from '../components/shared/RegisterForm';
import './AuthPage.css';



export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && profile) {
      switch (profile.user_type) {
        case "customer":
          navigate("/customer", { replace: true });
          break;
        case "store":
          navigate("/store", { replace: true });
          break;
        case "delivery":
          navigate("/delivery", { replace: true });
          break;
        default:
          navigate("/auth", { replace: true });
      }
    }
  }, [user, profile, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>

        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
          <div className="shape shape-5"></div>
        </div>
      </div>

      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="logo-container">
              <div className="logo-glow"></div>
              <div className="logo-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
            </div>

            <h1 className="auth-title">Rumbrov Delivery</h1>

            <div className="auth-badge">
              <span className="badge-dot"></span>
              <span className="badge-text">
                {isLogin ? "Acesse sua conta" : "Crie sua conta grátis"}
              </span>
            </div>
          </div>

          <div className="auth-form-wrapper">
            {isLogin ? <LoginForm /> : <RegisterForm />}
          </div>

          <div className="auth-footer">
            <p className="footer-text">
              {isLogin ? "Novo por aqui?" : "Já tem acesso?"}
            </p>

            <button
              onClick={() => setIsLogin(!isLogin)}
              className="switch-button"
            >
              <span>
                {isLogin ? "Criar uma conta nova" : "Entrar na minha conta"}
              </span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


