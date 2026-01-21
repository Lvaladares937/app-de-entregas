import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import { Product, Store } from '../../../types';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import '../StoreModule.css';

export const ProductsManagement = () => {
  const { user } = useAuth();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image_url: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadStoreAndProducts();
    }
  }, [user]);

  const loadStoreAndProducts = async () => {
    if (!user) return;

    try {
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (storeError) throw storeError;
      if (!storeData) return;

      setStore(storeData);

      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', storeData.id)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;
      setProducts(productsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store) return;

    setLoading(true);
    try {
      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update({
            name: formData.name,
            description: formData.description,
            price: parseFloat(formData.price),
            category: formData.category,
            image_url: formData.image_url || null,
          })
          .eq('id', editingProduct.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert({
          store_id: store.id,
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          category: formData.category,
          image_url: formData.image_url || null,
          is_available: true,
        });

        if (error) throw error;
      }

      setFormData({ name: '', description: '', price: '', category: '', image_url: '' });
      setEditingProduct(null);
      setShowForm(false);
      loadStoreAndProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Erro ao salvar produto');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      category: product.category || '',
      image_url: product.image_url || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      loadStoreAndProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Erro ao excluir produto');
    }
  };

  const toggleAvailability = async (product: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_available: !product.is_available })
        .eq('id', product.id);

      if (error) throw error;
      loadStoreAndProducts();
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  if (!store) {
    return (
      <div className="store-page">
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-600">Configure sua loja primeiro</p>
        </div>
      </div>
    );
  }

  return (
    <div className="store-page">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="store-header">
          <div className="flex items-center justify-between">
            <h1 className="store-title">Gerenciar Produtos</h1>
            <button
              onClick={() => {
                setShowForm(!showForm);
                setEditingProduct(null);
                setFormData({ name: '', description: '', price: '', category: '', image_url: '' });
              }}
              className="store-btn"
            >
              <Plus className="w-4 h-4" />
              Adicionar Produto
            </button>
          </div>
        </div>

      {showForm && (
        <div className="store-card mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {editingProduct ? 'Editar Produto' : 'Novo Produto'}
          </h2>
          <form onSubmit={handleSubmit} className="store-form space-y-4">
            <div>
              <label>Nome</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label>Descrição</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label>Preço</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
              <div>
                <label>Categoria</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Ex: Pizzas, Bebidas"
                />
              </div>
            </div>
            <div>
              <label>URL da Imagem (opcional)</label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="flex space-x-2">
              <button type="submit" disabled={loading} className="store-btn">
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingProduct(null);
                }}
                className="store-btn secondary"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

        <div className="product-grid">
          {products.map((product) => (
            <div key={product.id} className={`product-card ${!product.is_available ? 'opacity-60' : ''}`}>
              {product.image_url && (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="product-image"
                />
              )}
              <h3 className="product-name">{product.name}</h3>
              {product.description && (
                <p className="product-description">{product.description}</p>
              )}
              <div className="flex items-center justify-between mt-4">
                <span className="product-price">
                  R$ {product.price.toFixed(2)}
                </span>
                {product.category && (
                  <span className="product-category">{product.category}</span>
                )}
              </div>
              <div className="product-actions">
                <button onClick={() => handleEdit(product)} className="store-btn small">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="store-btn small danger"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleAvailability(product)}
                  className="store-btn small secondary"
                >
                  {product.is_available ? 'Desativar' : 'Ativar'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && !showForm && (
          <div className="store-card">
            <p className="text-center text-gray-600">
              Nenhum produto cadastrado. Adicione seu primeiro produto!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
