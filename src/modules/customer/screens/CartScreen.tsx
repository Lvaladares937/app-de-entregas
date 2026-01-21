import { useState, useCallback, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../contexts/CartContext';
import { useAuth } from '../../../contexts/AuthContext';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { supabase } from '../../../lib/supabase';
import { 
  Trash2, 
  ShoppingBag, 
  CheckCircle, 
  AlertCircle, 
  Star, 
  Gift 
} from 'lucide-react';
import styles from './CartScreen.module.css';

interface OrderFormData {
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  notes: string;
}

interface SupabaseError {
  message: string;
  code: string;
  details?: string;
  hint?: string;
}

interface OrderData {
  store_id: string;
  status: string;
  total_amount: number;
  delivery_fee: number;
  delivery_address: string;
  delivery_latitude: number;
  delivery_longitude: number;
  notes: string;
  customer_id?: string | null;
  customer_name?: string;
  customer_phone?: string;
}

interface OrderItemData {
  order_id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

const DELIVERY_FEE = 5.0;
const REDIRECT_DELAY = 3000;

export const CartScreen = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, getTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<OrderFormData>({
    customerName: '',
    customerPhone: '',
    deliveryAddress: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const subtotal = getTotal();
  const total = subtotal + DELIVERY_FEE;

  const handleInputChange = useCallback((field: keyof OrderFormData) => 
    (e: ChangeEvent<HTMLInputElement>) => {
      setFormData(prev => ({ ...prev, [field]: e.target.value }));
    }, []);

  const validateForm = (): boolean => {
    if (cart.length === 0) {
      alert('Seu carrinho está vazio');
      return false;
    }

    if (!formData.deliveryAddress.trim()) {
      alert('Por favor, informe o endereço de entrega');
      return false;
    }

    if (!user && (!formData.customerName.trim() || !formData.customerPhone.trim())) {
      alert('Para continuar como visitante, preencha seu nome e telefone');
      return false;
    }

    return true;
  };

  const createOrderItems = (orderId: string): OrderItemData[] => {
    return cart.map(item => ({
      order_id: orderId,
      product_id: item.product.id,
      product_name: item.product.name,
      product_price: item.product.price,
      quantity: item.quantity,
      unit_price: item.product.price,
      subtotal: item.product.price * item.quantity
    }));
  };

  const getOrderData = (storeId: string): OrderData => {
    const baseData: OrderData = {
      store_id: storeId,
      status: 'pending',
      total_amount: total,
      delivery_fee: DELIVERY_FEE,
      delivery_address: formData.deliveryAddress.trim(),
      delivery_latitude: 0,
      delivery_longitude: 0,
      notes: formData.notes.trim(),
      customer_id: user?.id || null
    };

    if (!user) {
      return {
        ...baseData,
        customer_name: formData.customerName.trim(),
        customer_phone: formData.customerPhone.trim()
      };
    }

    return baseData;
  };

  const handleCheckout = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const storeId = cart[0].product.store_id;
      const orderData = getOrderData(storeId);

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = createOrderItems(order.id);
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      clearCart();
      setOrderSuccess(true);

      setTimeout(() => {
        navigate(user ? '/customer/orders' : '/');
      }, REDIRECT_DELAY);

    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      console.error('Checkout error:', error);
      alert(`Erro ao processar pedido:\n\n${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
      return error.message;
    }

    if (isSupabaseError(error)) {
      const supabaseError = error as SupabaseError;
      
      switch (supabaseError.code) {
        case '23502':
          return 'Dados obrigatórios não foram preenchidos. Verifique todos os campos.';
        case '23505':
          return 'Erro de duplicação de dados.';
        case '42501':
          return 'Permissão insuficiente para realizar esta ação.';
        default:
          return supabaseError.message;
      }
    }

    return 'Ocorreu um erro inesperado. Tente novamente.';
  };

  const isSupabaseError = (error: unknown): error is SupabaseError => {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      'message' in error
    );
  };

  const handleNavigateBack = () => navigate(-1);
  const handleNavigateToAuth = () => navigate('/auth');

  // Estado: Sucesso
  if (orderSuccess) {
    return (
      <div className={styles.successScreen}>
        <div className={styles.successCard}>
          <div className={styles.successIconWrapper}>
            <CheckCircle size={48} className={styles.successIcon} />
          </div>
          <h2 className={styles.successTitle}>Pedido Realizado!</h2>
          <p className={styles.successText}>
            Seu pedido está sendo preparado. Redirecionando...
          </p>
          <div className={styles.successDetails}>
            <p className={styles.successDetailRow}>
              <span className={styles.successDetailLabel}>Total:</span>
              R$ {total.toFixed(2)}
            </p>
            <p className={styles.successDetailRow}>
              <span className={styles.successDetailLabel}>Entrega:</span>
              {formData.deliveryAddress}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Estado: Carrinho vazio
  if (cart.length === 0) {
    return (
      <div className={styles.emptyCart}>
        <div className={styles.emptyCartContent}>
          <ShoppingBag size={64} className={styles.emptyCartIcon} />
          <h2 className={styles.emptyCartTitle}>Carrinho Vazio</h2>
          <p className={styles.emptyCartText}>
            Adicione produtos deliciosos para continuar
          </p>
          <Button onClick={handleNavigateBack} size="lg" variant="primary">
            Explorar Cardápio
          </Button>
        </div>
      </div>
    );
  }

  // Estado: Carrinho com itens
  return (
    <div className={styles.cartContainer}>
      <div className={styles.cartHeader}>
        <h1 className={styles.cartTitle}>Seu Carrinho</h1>
      </div>

      <div className={styles.cartGrid}>
        {/* Lista de Produtos */}
        <div className={styles.cartItems}>
          {cart.map(item => (
            <div key={item.product.id} className={styles.cartItem}>
              {item.product.image_url && (
                <img
                  src={item.product.image_url}
                  alt={item.product.name}
                  className={styles.cartItemImage}
                />
              )}
              <div className={styles.cartItemInfo}>
                <h3 className={styles.cartItemName}>{item.product.name}</h3>
                <p className={styles.cartItemPrice}>
                  R$ {item.product.price.toFixed(2)}
                </p>
              </div>
              <div className={styles.cartItemActions}>
                <div className={styles.quantityControl}>
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className={styles.quantityBtn}
                    aria-label="Reduzir quantidade"
                  >
                    −
                  </button>
                  <span className={styles.quantityDisplay}>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className={styles.quantityBtn}
                    aria-label="Aumentar quantidade"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className={styles.removeBtn}
                  aria-label="Remover item"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Painel de Checkout */}
        <div className={styles.checkoutPanel}>
          <div className={styles.checkoutCard}>
            <h2 className={styles.checkoutTitle}>Finalizar Pedido</h2>

            {/* Promoção para visitantes */}
            {!user && (
              <>
                <div className={styles.promotionBanner}>
                  <div className={styles.promotionHeader}>
                    <Star size={20} />
                    <h3 className={styles.promotionTitle}>
                      Crie sua conta e ganhe benefícios!
                    </h3>
                  </div>
                  <ul className={styles.promotionList}>
                    <li>Acompanhe seus pedidos em tempo real</li>
                    <li>Acumule pontos e ganhe descontos</li>
                    <li>Salve seus endereços favoritos</li>
                  </ul>
                  <Button
                    onClick={handleNavigateToAuth}
                    size="sm"
                    className={styles.promotionButton}
                  >
                    <Gift size={16} />
                    Criar Conta Grátis
                  </Button>
                </div>

                <div className={styles.guestInfoSection}>
                  <h3 className={styles.guestInfoTitle}>Seus Dados</h3>
                  <div className={styles.formGroup}>
                    <Input
                      label="Nome Completo"
                      value={formData.customerName}
                      onChange={handleInputChange('customerName')}
                      placeholder="Digite seu nome"
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <Input
                      label="Telefone"
                      value={formData.customerPhone}
                      onChange={handleInputChange('customerPhone')}
                      placeholder="(00) 00000-0000"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {/* Formulário de entrega */}
            <div className={styles.formGroup}>
              <Input
                label="Endereço de Entrega"
                value={formData.deliveryAddress}
                onChange={handleInputChange('deliveryAddress')}
                placeholder="Rua, número, bairro"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <Input
                label="Observações (opcional)"
                value={formData.notes}
                onChange={handleInputChange('notes')}
                placeholder="Ex: sem cebola, ponto da carne"
              />
            </div>

            {/* Aviso de modo teste */}
            <div className={styles.testModeAlert}>
              <AlertCircle size={20} className={styles.alertIcon} />
              <div>
                <h4 className={styles.alertTitle}>Modo de Teste</h4>
                <p className={styles.alertText}>
                  Este é um pedido fictício para teste. Nenhum pagamento real será cobrado.
                  O pedido será enviado para a loja e entregadores para simulação do fluxo completo.
                </p>
              </div>
            </div>

            {/* Resumo do pedido */}
            <div className={styles.orderSummary}>
              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <span>R$ {subtotal.toFixed(2)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Taxa de Entrega</span>
                <span>R$ {DELIVERY_FEE.toFixed(2)}</span>
              </div>
              <div className={styles.summaryTotal}>
                <span>Total (Fictício)</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
            </div>

            {/* Botão de confirmação */}
            <button
              className={styles.checkoutButton}
              onClick={handleCheckout}
              disabled={
                loading ||
                !formData.deliveryAddress ||
                (!user && (!formData.customerName || !formData.customerPhone))
              }
              aria-busy={loading}
            >
              {loading ? (
                <>
                  <span className={styles.spinner} />
                  Processando...
                </>
              ) : (
                'Confirmar Pedido de Teste'
              )}
            </button>

            <p className={styles.termsText}>
              Pedido de teste - Nenhuma cobrança será realizada
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};