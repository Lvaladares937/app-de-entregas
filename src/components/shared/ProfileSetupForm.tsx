// components/shared/ProfileSetupForm.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const ProfileSetupForm = () => {
  const [userType, setUserType] = useState<'customer' | 'store' | 'delivery'>('customer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setupProfile } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const success = await setupProfile(userType);
      if (success) {
        // Redireciona para a página inicial do tipo de usuário
        switch (userType) {
          case 'customer':
            navigate('/customer');
            break;
          case 'store':
            navigate('/store');
            break;
          case 'delivery':
            navigate('/delivery');
            break;
        }
      } else {
        setError('Falha ao configurar perfil. Tente novamente.');
      }
    } catch (err) {
      setError('Erro ao processar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="profile-setup-form">
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Como você quer usar a plataforma?
        </h2>
        
        <div className="space-y-4">
          {/* Opção Cliente */}
          <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
            <input
              type="radio"
              name="userType"
              value="customer"
              checked={userType === 'customer'}
              onChange={(e) => setUserType(e.target.value as 'customer')}
              className="mr-3 h-5 w-5 text-blue-600"
            />
            <div className="flex-1">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Cliente</h3>
                  <p className="text-sm text-gray-600">Quero fazer pedidos de restaurantes</p>
                </div>
              </div>
            </div>
          </label>

          {/* Opção Loja */}
          <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-green-500 transition-colors">
            <input
              type="radio"
              name="userType"
              value="store"
              checked={userType === 'store'}
              onChange={(e) => setUserType(e.target.value as 'store')}
              className="mr-3 h-5 w-5 text-green-600"
            />
            <div className="flex-1">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg mr-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Restaurante/Loja</h3>
                  <p className="text-sm text-gray-600">Quero vender meus produtos e receber pedidos</p>
                </div>
              </div>
            </div>
          </label>

          {/* Opção Entregador */}
          <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-purple-500 transition-colors">
            <input
              type="radio"
              name="userType"
              value="delivery"
              checked={userType === 'delivery'}
              onChange={(e) => setUserType(e.target.value as 'delivery')}
              className="mr-3 h-5 w-5 text-purple-600"
            />
            <div className="flex-1">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg mr-3">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Entregador</h3>
                  <p className="text-sm text-gray-600">Quero realizar entregas e ganhar dinheiro</p>
                </div>
              </div>
            </div>
          </label>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 mr-2 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Configurando...
          </span>
        ) : (
          'Continuar'
        )}
      </button>
    </form>
  );
};