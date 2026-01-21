import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { Button } from '../../../components/ui/Button';
import { ArrowLeft, Store, DollarSign, MapPin, Briefcase } from 'lucide-react';
import { Layout } from '../../../components/shared/Layout';
import './DeliveryOpportunities.css';

interface StoreOpportunity {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  daily_rate: number;
  delivery_rate: number;
  hiring_delivery: boolean;
  hasApplied?: boolean;
  applicationStatus?: string;
}

export function DeliveryOpportunities() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState<StoreOpportunity[]>([]);
  const [myApplications, setMyApplications] = useState<StoreOpportunity[]>([]);

  useEffect(() => {
    loadOpportunities();
  }, [user]);

  const loadOpportunities = async () => {
    if (!user) return;

    try {
      const { data: storesData, error: storesError } = await supabase
        .from('stores')
        .select('id, name, description, address, phone, daily_rate, delivery_rate, hiring_delivery')
        .eq('hiring_delivery', true)
        .eq('is_active', true);

      if (storesError) {
        console.error('Error loading stores:', storesError);
        throw storesError;
      }

      const { data: applicationsData, error: applicationsError } = await supabase
        .from('store_deliveries')
        .select('store_id, status')
        .eq('delivery_id', user.id);

      if (applicationsError) {
        console.error('Error loading applications:', applicationsError);
        throw applicationsError;
      }

      const applicationMap = new Map<string, string>();
      if (applicationsData) {
        applicationsData.forEach((app) => {
          applicationMap.set(app.store_id, app.status);
        });
      }

      const availableStores = (storesData || []).map((store) => ({
        ...store,
        hasApplied: applicationMap.has(store.id),
        applicationStatus: applicationMap.get(store.id),
      }));

      const applicationStoreIds = Array.from(applicationMap.keys());
      const { data: myStoresData } = await supabase
        .from('stores')
        .select('id, name, description, address, phone, daily_rate, delivery_rate, hiring_delivery')
        .in('id', applicationStoreIds.length > 0 ? applicationStoreIds : ['00000000-0000-0000-0000-000000000000']);

      const myApps = (myStoresData || []).map((store) => ({
        ...store,
        applicationStatus: applicationMap.get(store.id),
      }));

      setStores(availableStores);
      setMyApplications(myApps);
    } catch (error) {
      console.error('Error loading opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyToStore = async (storeId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('store_deliveries').insert({
        store_id: storeId,
        delivery_id: user.id,
        status: 'pending',
      });

      if (error) throw error;
      alert('Candidatura enviada com sucesso!');
      loadOpportunities();
    } catch (error) {
      console.error('Error applying to store:', error);
      alert('Erro ao enviar candidatura');
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Aguardando Aprovação',
      active: 'Ativo',
      rejected: 'Rejeitado',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'status-pending',
      active: 'status-active',
      rejected: 'status-rejected',
    };
    return colors[status] || '';
  };

  if (loading) {
    return (
      <Layout>
        <div className="opportunities-loading">Carregando...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="opportunities-container">
        <div className="opportunities-header">
          <Button variant="secondary" onClick={() => navigate('/delivery')}>
            <ArrowLeft size={20} />
            Voltar
          </Button>
          <h1>Oportunidades de Trabalho</h1>
        </div>

        {myApplications.length > 0 && (
          <div className="section">
            <h2>
              <Briefcase size={24} />
              Minhas Candidaturas
            </h2>
            <div className="stores-grid">
              {myApplications.map((store) => (
                <div key={store.id} className="store-card">
                  <div className="store-card-header">
                    <div className="store-info">
                      <Store size={24} />
                      <h3>{store.name}</h3>
                    </div>
                    <span className={`status-badge ${getStatusColor(store.applicationStatus || '')}`}>
                      {getStatusLabel(store.applicationStatus || '')}
                    </span>
                  </div>

                  {store.description && (
                    <p className="store-description">{store.description}</p>
                  )}

                  {store.address && (
                    <div className="store-detail">
                      <MapPin size={16} />
                      <span>{store.address}</span>
                    </div>
                  )}

                  <div className="rates-container">
                    <div className="rate-item">
                      <DollarSign size={18} />
                      <div>
                        <span className="rate-label">Diária</span>
                        <span className="rate-value">R$ {store.daily_rate.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="rate-item">
                      <DollarSign size={18} />
                      <div>
                        <span className="rate-label">Por Entrega</span>
                        <span className="rate-value">R$ {store.delivery_rate.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="section">
          <h2>
            <Store size={24} />
            Lojas Disponíveis
          </h2>

          {stores.length === 0 ? (
            <div className="empty-state">
              <p>Nenhuma loja disponível no momento</p>
            </div>
          ) : (
            <div className="stores-grid">
              {stores.map((store) => (
                <div key={store.id} className="store-card">
                  <div className="store-card-header">
                    <div className="store-info">
                      <Store size={24} />
                      <h3>{store.name}</h3>
                    </div>
                  </div>

                  {store.description && (
                    <p className="store-description">{store.description}</p>
                  )}

                  {store.address && (
                    <div className="store-detail">
                      <MapPin size={16} />
                      <span>{store.address}</span>
                    </div>
                  )}

                  <div className="rates-container">
                    <div className="rate-item">
                      <DollarSign size={18} />
                      <div>
                        <span className="rate-label">Diária</span>
                        <span className="rate-value">R$ {store.daily_rate.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="rate-item">
                      <DollarSign size={18} />
                      <div>
                        <span className="rate-label">Por Entrega</span>
                        <span className="rate-value">R$ {store.delivery_rate.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {store.hasApplied ? (
                    <div className={`application-status ${getStatusColor(store.applicationStatus || '')}`}>
                      {getStatusLabel(store.applicationStatus || '')}
                    </div>
                  ) : (
                    <Button onClick={() => applyToStore(store.id)} variant="primary">
                      Candidatar-se
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
