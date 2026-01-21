import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Store } from '../../../types';
import { Card } from '../../../components/ui/Card';
import { useNavigate } from 'react-router-dom';
import { Store as StoreIcon, MapPin } from 'lucide-react';

export const CustomerHome = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStores(data || []);
    } catch (error) {
      console.error('Error loading stores:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Carregando lojas...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-3">
          Lojas Disponíveis
        </h1>
        <p className="text-gray-600 text-lg">Escolha uma loja e faça seu pedido</p>
      </div>

      {stores.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-block p-6 bg-gradient-to-br from-purple-100 to-purple-50 rounded-3xl mb-6">
            <StoreIcon className="h-16 w-16 text-purple-600" />
          </div>
          <p className="text-gray-600 text-lg">Nenhuma loja disponível no momento</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stores.map((store) => (
            <Card
              key={store.id}
              onClick={() => navigate(`/customer/menu/${store.menu_link_token}`)}
              className="group"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {store.logo_url ? (
                    <img
                      src={store.logo_url}
                      alt={store.name}
                      className="w-20 h-20 rounded-2xl object-cover shadow-lg ring-2 ring-purple-100 group-hover:ring-purple-300 transition-all"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg">
                      <StoreIcon className="w-10 h-10 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-gray-900 truncate group-hover:text-purple-700 transition-colors">
                    {store.name}
                  </h3>
                  {store.description && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2 leading-relaxed">
                      {store.description}
                    </p>
                  )}
                  <div className="flex items-center mt-3 text-sm text-gray-500">
                    <div className="p-1.5 bg-purple-50 rounded-lg mr-2">
                      <MapPin className="w-3.5 h-3.5 text-purple-600" />
                    </div>
                    <span className="truncate">{store.address}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
