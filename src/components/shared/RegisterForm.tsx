import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { User, Mail, Phone, Lock, Briefcase } from 'lucide-react';

export const RegisterForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [userType, setUserType] = useState<'customer' | 'store' | 'delivery'>('customer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signUp(email, password, {
        full_name: fullName,
        phone,
        user_type: userType,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="relative">
          <div className="absolute left-3 top-10 text-purple-500">
            <User className="w-5 h-5" />
          </div>
          <Input
            type="text"
            label="Nome Completo"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            placeholder="João Silva"
            className="pl-11"
          />
        </div>

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
            <Phone className="w-5 h-5" />
          </div>
          <Input
            type="tel"
            label="Telefone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            placeholder="(11) 99999-9999"
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
            placeholder="Mínimo 6 caracteres"
            minLength={6}
            className="pl-11"
          />
        </div>

        <div>
          <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
            <Briefcase className="w-4 h-4 text-purple-600 mr-2" />
            Tipo de Conta
          </label>
          <div className="grid grid-cols-1 gap-3">
            {[
              { value: 'customer', label: 'Cliente', desc: 'Faça pedidos' },
              { value: 'store', label: 'Loja/Restaurante', desc: 'Venda produtos' },
              { value: 'delivery', label: 'Entregador', desc: 'Faça entregas' },
            ].map((type) => (
              <label
                key={type.value}
                className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  userType === type.value
                    ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-purple-100 shadow-md'
                    : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-sm'
                }`}
              >
                <input
                  type="radio"
                  name="userType"
                  value={type.value}
                  checked={userType === type.value}
                  onChange={(e) => setUserType(e.target.value as 'customer' | 'store' | 'delivery')}
                  className="sr-only"
                />
                <div className="flex items-center flex-1">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${
                    userType === type.value
                      ? 'border-purple-600 bg-purple-600'
                      : 'border-gray-300 bg-white'
                  }`}>
                    {userType === type.value && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <div className={`font-semibold ${
                      userType === type.value ? 'text-purple-700' : 'text-gray-700'
                    }`}>
                      {type.label}
                    </div>
                    <div className="text-xs text-gray-500">{type.desc}</div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 p-4 rounded-xl shadow-sm">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-red-700 text-sm font-semibold">{error}</p>
          </div>
        </div>
      )}

      <Button
        type="submit"
        className="w-full text-lg py-4 shadow-xl"
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Criando conta...
          </span>
        ) : (
          <span className="flex items-center justify-center">
            Criar Minha Conta
            <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </span>
        )}
      </Button>
    </form>
  );
};
