import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import '../StoreModule.css';

export const StoreSetup = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('stores').insert({
        user_id: user.id,
        name: formData.name,
        description: formData.description,
        address: formData.address,
        phone: formData.phone,
        is_active: true,
      });

      if (error) throw error;

      navigate('/store');
    } catch (error) {
      console.error('Error creating store:', error);
      alert('Erro ao criar loja. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="store-page">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="store-card">
          <h1 className="store-title mb-6">
            Configure sua Loja
          </h1>
          <form onSubmit={handleSubmit} className="store-form space-y-4">
            <div>
              <label>Nome da Loja</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Exemplo: Pizzaria do João"
              />
            </div>
            <div>
              <label>Descrição</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Descreva sua loja..."
              />
            </div>
            <div>
              <label>Endereço</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
                placeholder="Rua, número, bairro, cidade"
              />
            </div>
            <div>
              <label>Telefone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(11) 99999-9999"
              />
            </div>
            <button type="submit" className="store-btn w-full" disabled={loading}>
              {loading ? 'Criando...' : 'Criar Loja'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
