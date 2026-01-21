import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { ArrowLeft, Users, DollarSign } from 'lucide-react';
import { Layout } from '../../../components/shared/Layout';
import './DeliverySettings.css';

interface StoreDelivery {
  id: string;
  delivery_id: string;
  status: string;
  started_at: string;
  delivery?: {
    email: string;
  };
}

interface DeliverySettings {
  hiring_delivery: boolean;
  daily_rate: number;
  delivery_rate: number;
}

export function DeliverySettings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [settings, setSettings] = useState<DeliverySettings>({
    hiring_delivery: false,
    daily_rate: 0,
    delivery_rate: 0,
  });
  const [deliveries, setDeliveries] = useState<StoreDelivery[]>([]);

  useEffect(() => {
    loadStoreSettings();
  }, [user]);

  const loadStoreSettings = async () => {
    if (!user) return;

    try {
      const { data: store } = await supabase
        .from('stores')
        .select('id, hiring_delivery, daily_rate, delivery_rate')
        .eq('user_id', user.id)
        .maybeSingle();

      if (store) {
        setStoreId(store.id);
        setSettings({
          hiring_delivery: store.hiring_delivery || false,
          daily_rate: store.daily_rate || 0,
          delivery_rate: store.delivery_rate || 0,
        });

        const { data: deliveryData } = await supabase
          .from('store_deliveries')
          .select(`
            id,
            delivery_id,
            status,
            started_at
          `)
          .eq('store_id', store.id)
          .eq('status', 'active')
          .order('started_at', { ascending: false });

        setDeliveries(deliveryData || []);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!storeId) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('stores')
        .update({
          hiring_delivery: settings.hiring_delivery,
          daily_rate: settings.daily_rate,
          delivery_rate: settings.delivery_rate,
          updated_at: new Date().toISOString(),
        })
        .eq('id', storeId);

      if (error) throw error;
      alert('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const handleAcceptDelivery = async (deliveryWorkerId: string) => {
    if (!storeId) return;

    try {
      const { error } = await supabase
        .from('store_deliveries')
        .update({ status: 'active' })
        .eq('store_id', storeId)
        .eq('delivery_id', deliveryWorkerId);

      if (error) throw error;
      loadStoreSettings();
    } catch (error) {
      console.error('Error accepting delivery:', error);
    }
  };

  const handleRejectDelivery = async (deliveryWorkerId: string) => {
    if (!storeId) return;

    try {
      const { error } = await supabase
        .from('store_deliveries')
        .update({
          status: 'rejected',
          ended_at: new Date().toISOString()
        })
        .eq('store_id', storeId)
        .eq('delivery_id', deliveryWorkerId);

      if (error) throw error;
      loadStoreSettings();
    } catch (error) {
      console.error('Error rejecting delivery:', error);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="delivery-settings-loading">Carregando...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="delivery-settings-container">
        <div className="delivery-settings-header">
          <Button variant="secondary" onClick={() => navigate('/store')}>
            <ArrowLeft size={20} />
            Voltar
          </Button>
          <h1>Configurações de Entrega</h1>
        </div>

        <div className="delivery-settings-content">
          <div className="settings-card">
            <div className="settings-card-header">
              <Users size={24} />
              <h2>Contratação de Motoboys</h2>
            </div>

            <div className="settings-form">
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.hiring_delivery}
                    onChange={(e) =>
                      setSettings({ ...settings, hiring_delivery: e.target.checked })
                    }
                  />
                  <span>Contratar motoboys freelancers</span>
                </label>
              </div>

              {settings.hiring_delivery && (
                <>
                  <div className="form-group">
                    <label>
                      <DollarSign size={18} />
                      Taxa Fixa (Diária)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={settings.daily_rate}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setSettings({ ...settings, daily_rate: parseFloat(e.target.value) || 0 })
                      }
                      placeholder="0.00"
                    />
                    <small>Valor que o motoboy recebe por dia de trabalho</small>
                  </div>

                  <div className="form-group">
                    <label>
                      <DollarSign size={18} />
                      Taxa por Entrega
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={settings.delivery_rate}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setSettings({ ...settings, delivery_rate: parseFloat(e.target.value) || 0 })
                      }
                      placeholder="0.00"
                    />
                    <small>Valor adicional por cada entrega realizada</small>
                  </div>
                </>
              )}

              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar Configurações'}
              </Button>
            </div>
          </div>

          {settings.hiring_delivery && deliveries.length > 0 && (
            <div className="settings-card">
              <div className="settings-card-header">
                <Users size={24} />
                <h2>Motoboys Ativos</h2>
              </div>

              <div className="deliveries-list">
                {deliveries.map((delivery) => (
                  <div key={delivery.id} className="delivery-item">
                    <div className="delivery-info">
                      <p><strong>ID:</strong> {delivery.delivery_id.substring(0, 8)}...</p>
                      <p><strong>Status:</strong> {delivery.status}</p>
                      <p><strong>Desde:</strong> {new Date(delivery.started_at).toLocaleDateString()}</p>
                    </div>
                    <div className="delivery-actions">
                      {delivery.status === 'pending' && (
                        <>
                          <Button
                            variant="primary"
                            onClick={() => handleAcceptDelivery(delivery.delivery_id)}
                          >
                            Aceitar
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() => handleRejectDelivery(delivery.delivery_id)}
                          >
                            Rejeitar
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
