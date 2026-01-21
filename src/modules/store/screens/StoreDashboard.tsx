import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import { Store, Order } from '../../../types';
import { Package, DollarSign, Link as LinkIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../StoreModule.css';

export const StoreDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [store, setStore] = useState<Store | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, today: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadStoreData();
    }
  }, [user]);

  const loadStoreData = async () => {
    if (!user) return;

    try {
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (storeError) throw storeError;

      if (!storeData) {
        setLoading(false);
        return;
      }

      setStore(storeData);

      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('store_id', storeData.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (ordersError) throw ordersError;
      setOrders(ordersData || []);

      const pending = ordersData?.filter((o) => o.status === 'pending').length || 0;
      const total = ordersData?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTotal = ordersData?.filter((o) => new Date(o.created_at) >= today)
        .reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;

      setStats({ total, pending, today: todayTotal });
    } catch (error) {
      console.error('Error loading store data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyMenuLink = () => {
    if (store?.menu_link_token) {
      const link = `${window.location.origin}/customer/menu/${store.menu_link_token}`;
      navigator.clipboard.writeText(link);
      alert('Link copiado!');
    }
  };

  if (loading) {
    return (
      <div className="store-page">
        <div className="store-loading">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="store-page">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="store-card">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Configure sua Loja
            </h2>
            <p className="text-gray-600 mb-6">
              Você ainda não tem uma loja cadastrada. Configure agora para começar a receber pedidos.
            </p>
            <button onClick={() => navigate('/store/setup')} className="store-btn">
              Configurar Loja
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="store-page">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="store-header">
          <div className="flex items-center justify-between">
            <h1 className="store-title">{store.name}</h1>
            <button onClick={copyMenuLink} className="link-button">
              <LinkIcon className="w-4 h-4" />
              Copiar Link do Cardápio
            </button>
          </div>
        </div>

        <div className="store-stats">
          <div className="stat-card">
            <div className="flex items-center space-x-4">
              <div className="stat-icon blue">
                <Package />
              </div>
              <div>
                <p className="stat-label">Pedidos Pendentes</p>
                <p className="stat-value">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center space-x-4">
              <div className="stat-icon green">
                <DollarSign />
              </div>
              <div>
                <p className="stat-label">Vendas Hoje</p>
                <p className="stat-value">R$ {stats.today.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center space-x-4">
              <div className="stat-icon purple">
                <DollarSign />
              </div>
              <div>
                <p className="stat-label">Total de Vendas</p>
                <p className="stat-value">R$ {stats.total.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-4 mb-8">
          <button onClick={() => navigate('/store/products')} className="store-btn">
            Gerenciar Produtos
          </button>
          <button onClick={() => navigate('/store/orders')} className="store-btn secondary">
            Ver Todos os Pedidos
          </button>
        </div>

        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Pedidos Recentes
        </h2>
        {orders.length === 0 ? (
          <div className="store-card">
            <p className="text-center text-gray-600">Nenhum pedido ainda</p>
          </div>
        ) : (
          <div className="orders-list">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="order-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">
                      Pedido #{order.id.slice(0, 8)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.delivery_address}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      R$ {order.total_amount.toFixed(2)}
                    </p>
                    <span className={`order-status ${order.status}`}>{order.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
