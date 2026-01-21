import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import { Order } from '../../../types';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Package, DollarSign, TrendingUp, Briefcase } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';


export const DeliveryDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({ totalEarnings: 0, completedToday: 0, activeDeliveries: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    if (!user) return;

    try {
      const { data: availableData, error: availableError } = await supabase
        .from('orders')
        .select('*')
        .is('delivery_id', null)
        .in('status', ['confirmed', 'ready'])
        .order('created_at', { ascending: true });

      if (availableError) throw availableError;
      setAvailableOrders(availableData || []);

      const { data: myOrdersData, error: myOrdersError } = await supabase
        .from('orders')
        .select('*')
        .eq('delivery_id', user.id)
        .order('created_at', { ascending: false });

      if (myOrdersError) throw myOrdersError;
      setMyOrders(myOrdersData || []);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const completedToday = myOrdersData?.filter(
        (o) => o.status === 'completed' && new Date(o.created_at) >= today
      ).length || 0;

      const totalEarnings = myOrdersData?.filter((o) => o.status === 'completed')
        .reduce((sum, o) => sum + Number(o.delivery_fee), 0) || 0;

      const activeDeliveries = myOrdersData?.filter((o) => o.status === 'delivering').length || 0;

      setStats({ totalEarnings, completedToday, activeDeliveries });
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const acceptOrder = async (orderId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('orders')
        .update({
          delivery_id: user.id,
          status: 'delivering'
        })
        .eq('id', orderId);

      if (error) throw error;
      loadOrders();
    } catch (error) {
      console.error('Error accepting order:', error);
      alert('Erro ao aceitar pedido');
    }
  };

  const completeDelivery = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'completed' })
        .eq('id', orderId);

      if (error) throw error;
      loadOrders();
    } catch (error) {
      console.error('Error completing delivery:', error);
      alert('Erro ao finalizar entrega');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Painel do Entregador</h1>
        <Button onClick={() => navigate('/delivery/opportunities')}>
          <Briefcase className="w-4 h-4 mr-2" />
          Ver Oportunidades
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Ganho</p>
              <p className="text-2xl font-bold text-gray-900">
                R$ {stats.totalEarnings.toFixed(2)}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Entregas Ativas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeDeliveries}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Entregas Hoje</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedToday}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Pedidos Disponíveis
          </h2>
          {availableOrders.length === 0 ? (
            <Card>
              <p className="text-center text-gray-600">
                Nenhum pedido disponível no momento
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {availableOrders.map((order) => (
                <Card key={order.id}>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900">
                        Pedido #{order.id.slice(0, 8)}
                      </span>
                      <span className="text-green-600 font-bold">
                        + R$ {order.delivery_fee.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Endereço: {order.delivery_address}
                    </p>
                    <p className="text-sm text-gray-500">
                      Total: R$ {order.total_amount.toFixed(2)}
                    </p>
                    <Button
                      onClick={() => acceptOrder(order.id)}
                      className="w-full"
                      size="sm"
                    >
                      Aceitar Entrega
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Minhas Entregas
          </h2>
          {myOrders.length === 0 ? (
            <Card>
              <p className="text-center text-gray-600">
                Você ainda não aceitou nenhuma entrega
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {myOrders.slice(0, 10).map((order) => (
                <Card key={order.id}>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900">
                        Pedido #{order.id.slice(0, 8)}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        order.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {order.status === 'completed' ? 'Concluída' : 'Em andamento'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {order.delivery_address}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {format(new Date(order.created_at), 'dd/MM/yyyy HH:mm')}
                      </span>
                      <span className="text-green-600 font-bold">
                        R$ {order.delivery_fee.toFixed(2)}
                      </span>
                    </div>
                    {order.status === 'delivering' && (
                      <Button
                        onClick={() => completeDelivery(order.id)}
                        variant="secondary"
                        className="w-full"
                        size="sm"
                      >
                        Marcar como Entregue
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
