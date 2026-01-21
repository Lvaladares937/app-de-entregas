import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { Product, Store } from '../../../types';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useCart } from '../../../contexts/CartContext';
import { useAuth } from '../../../contexts/AuthContext';
import { ShoppingCart, Plus, Gift, MapPin, Star, UserPlus } from 'lucide-react';
import './MenuScreen.css';

export const MenuScreen = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, cart } = useCart();

  useEffect(() => {
    loadMenu();
  }, [token]);

  const loadMenu = async () => {
    try {
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('*')
        .eq('menu_link_token', token)
        .maybeSingle();

      if (storeError) throw storeError;
      if (!storeData) {
        console.error('Store not found');
        setLoading(false);
        return;
      }

      setStore(storeData);

      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', storeData.id)
        .eq('is_available', true)
        .order('category', { ascending: true });

      if (productsError) throw productsError;
      setProducts(productsData || []);
    } catch (error) {
      console.error('Error loading menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupedProducts = products.reduce((acc, product) => {
    const category = product.category || 'Outros';
    if (!acc[category]) acc[category] = [];
    acc[category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Carregando cardápio...</p>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loja não encontrada</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      <div className="menu-container">
        {!user && (
          <div className="promo-banner">
            <div className="promo-content">
              <h2 className="promo-title">
                Crie sua conta e ganhe <span className="highlight">benefícios exclusivos!</span>
              </h2>

              <div className="promo-benefits">
                <div className="benefit-item">
                  <div className="benefit-icon">
                    <Gift className="w-6 h-6" />
                  </div>
                  <span className="benefit-text">Acumule pontos a cada pedido</span>
                </div>

                <div className="benefit-item">
                  <div className="benefit-icon">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <span className="benefit-text">Rastreie entregas em tempo real</span>
                </div>

                <div className="benefit-item">
                  <div className="benefit-icon">
                    <Star className="w-6 h-6" />
                  </div>
                  <span className="benefit-text">Ofertas exclusivas para você</span>
                </div>
              </div>

              <div className="promo-cta">
                <button
                  onClick={() => navigate('/auth')}
                  className="cta-button"
                >
                  <UserPlus className="w-5 h-5" />
                  Criar Conta Grátis
                </button>
                <span className="cta-text">Leva menos de 1 minuto!</span>
              </div>
            </div>
          </div>
        )}

        <div className="store-header">
          <h1 className="store-name">{store.name}</h1>
          {store.description && (
            <p className="store-description">{store.description}</p>
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-button-fixed">
            <Button
              onClick={() => navigate('/customer/cart')}
              className="flex items-center space-x-2"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Carrinho ({cart.length})</span>
            </Button>
          </div>
        )}

        {Object.keys(groupedProducts).length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Nenhum produto disponível</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedProducts).map(([category, products], index) => (
              <div key={category} className="category-section" style={{ animationDelay: `${0.3 + index * 0.1}s` }}>
                <h2 className="category-title">
                  {category}
                </h2>
                <div className="products-grid">
                  {products.map((product) => (
                    <Card key={product.id}>
                      {product.image_url && (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-48 object-cover rounded-lg mb-4"
                        />
                      )}
                      <h3 className="text-lg font-semibold text-gray-900">
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {product.description}
                        </p>
                      )}
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xl font-bold text-green-600">
                          R$ {product.price.toFixed(2)}
                        </span>
                        <Button
                          size="sm"
                          onClick={() => addToCart(product)}
                          className="flex items-center space-x-1"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Adicionar</span>
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
