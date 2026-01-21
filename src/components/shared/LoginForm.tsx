import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Mail, Lock } from 'lucide-react';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  // 🔥 AGORA USAMOS TUDO DO CONTEXTO
  const { signIn, user, profile, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
    }
  };

  /**
   * 🔁 REDIRECIONAMENTO CORRETO
   */
  useEffect(() => {
    if (loading) return;
    if (!user || !profile) return;

    switch (profile.user_type) {
      case 'store':
        navigate('/store', { replace: true });
        break;
      case 'customer':
        navigate('/customer', { replace: true });
        break;
      case 'delivery':
        navigate('/delivery', { replace: true });
        break;
      default:
        navigate('/auth', { replace: true });
    }
  }, [user, profile, loading, navigate]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-5">
        <div className="relative">
          <div className="absolute left-3 top-10 text-purple-500">
            <Mail className="w-5 h-5" />
          </div>
          <Input
            type="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="seu@email.com"
            className="pl-11"
          />
        </div>

        <div className="relative">
          <div className="absolute left-3 top-10 text-purple-500">
            <Lock className="w-5 h-5" />
          </div>
          <Input
            type="password"
            label="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="pl-11"
          />
        </div>
      </div>

      {error && (
        <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 p-4 rounded-xl shadow-sm">
          <p className="text-red-700 text-sm font-semibold">{error}</p>
        </div>
      )}

      <Button
        type="submit"
        className="w-full text-lg py-4 shadow-xl"
        disabled={loading}
      >
        {loading ? 'Entrando...' : 'Entrar na Conta'}
      </Button>
    </form>
  );
};
