import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { Layout } from './components/shared/Layout';
import { AuthPage } from './pages/AuthPage';
import { CustomerHome } from './modules/customer/screens/CustomerHome';
import { MenuScreen } from './modules/customer/screens/MenuScreen';
import { CartScreen } from './modules/customer/screens/CartScreen';
import { OrdersScreen } from './modules/customer/screens/OrdersScreen';
import { StoreDashboard } from './modules/store/screens/StoreDashboard';
import { StoreSetup } from './modules/store/screens/StoreSetup';
import { ProductsManagement } from './modules/store/screens/ProductsManagement';
import { DeliverySettings } from './modules/store/screens/DeliverySettings';
import { DeliveryDashboard } from './modules/delivery/screens/DeliveryDashboard';
import { DeliveryOpportunities } from './modules/delivery/screens/DeliveryOpportunities';

// Tipos para melhor tipagem
type UserType = 'customer' | 'store' | 'delivery';

function ProtectedRoute({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode;
  allowedRoles?: UserType[];
}) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  // Verifica se o perfil existe
  if (!profile) {
    return <Navigate to="/auth?setup=true" />;
  }

  // Verifica se o usuário tem a role necessária para acessar a rota
  if (allowedRoles && !allowedRoles.includes(profile.user_type as UserType)) {
    // Redireciona para a rota padrão do tipo de usuário
    switch (profile.user_type) {
      case 'customer':
        return <Navigate to="/customer" />;
      case 'store':
        return <Navigate to="/store" />;
      case 'delivery':
        return <Navigate to="/delivery" />;
      default:
        return <Navigate to="/auth" />;
    }
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Se o usuário já está autenticado, redireciona para a rota padrão
  if (user) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}

// Componente para redirecionamento baseado no tipo de usuário
function RoleBasedRedirect() {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/auth?setup=true" />;
  }

  const getDefaultRoute = (): string => {
    switch (profile.user_type) {
      case 'customer':
        return '/customer';
      case 'store':
        return '/store';
      case 'delivery':
        return '/delivery';
      default:
        return '/auth';
    }
  };

  return <Navigate to={getDefaultRoute()} />;
}

function AppContent() {
  const { user, profile, loading } = useAuth();

  // Loading state centralizado
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Se não tem usuário, mostrar apenas rotas públicas (sem Layout)
  if (!user) {
    return (
      <Routes>
        <Route path="/auth" element={
          <PublicRoute>
            <AuthPage />
          </PublicRoute>
        } />
        <Route path="/customer/menu/:token" element={<MenuScreen />} />
        <Route path="*" element={<Navigate to="/auth" />} />
      </Routes>
    );
  }

  // Usuário logado mas sem perfil - redirecionar para setup
  if (!profile) {
    return (
      <Routes>
        <Route path="/auth" element={
          <PublicRoute>
            <AuthPage />
          </PublicRoute>
        } />
        <Route path="*" element={<Navigate to="/auth?setup=true" />} />
      </Routes>
    );
  }

  // Usuário logado com perfil - mostrar rotas com Layout
  return (
    <Layout>
      <Routes>
        {/* Redirecionamento raiz baseado no role */}
        <Route path="/" element={<RoleBasedRedirect />} />
        
        {/* Redireciona do auth para a página inicial do usuário */}
        <Route path="/auth" element={<RoleBasedRedirect />} />

        {/* Rotas do Cliente */}
        <Route path="/customer" element={
          <ProtectedRoute allowedRoles={['customer']}>
            <CustomerHome />
          </ProtectedRoute>
        } />
        <Route path="/customer/orders" element={
          <ProtectedRoute allowedRoles={['customer']}>
            <OrdersScreen />
          </ProtectedRoute>
        } />
        <Route path="/customer/cart" element={
          <ProtectedRoute allowedRoles={['customer']}>
            <CartScreen />
          </ProtectedRoute>
        } />
        
        {/* Menu pode ser acessado por qualquer um (link compartilhado) */}
        <Route path="/customer/menu/:token" element={<MenuScreen />} />

        {/* Rotas da Loja */}
        <Route path="/store" element={
          <ProtectedRoute allowedRoles={['store']}>
            <StoreDashboard />
          </ProtectedRoute>
        } />
        <Route path="/store/setup" element={
          <ProtectedRoute allowedRoles={['store']}>
            <StoreSetup />
          </ProtectedRoute>
        } />
        <Route path="/store/products" element={
          <ProtectedRoute allowedRoles={['store']}>
            <ProductsManagement />
          </ProtectedRoute>
        } />
        <Route path="/store/delivery-settings" element={
          <ProtectedRoute allowedRoles={['store']}>
            <DeliverySettings />
          </ProtectedRoute>
        } />

        {/* Rotas do Entregador */}
        <Route path="/delivery" element={
          <ProtectedRoute allowedRoles={['delivery']}>
            <DeliveryDashboard />
          </ProtectedRoute>
        } />
        <Route path="/delivery/opportunities" element={
          <ProtectedRoute allowedRoles={['delivery']}>
            <DeliveryOpportunities />
          </ProtectedRoute>
        } />

        {/* Rota para 404 ou acesso não autorizado */}
        <Route path="/unauthorized" element={
          <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Acesso não autorizado</h1>
            <p className="text-gray-600 mb-6">Você não tem permissão para acessar esta página.</p>
            <button 
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Voltar para página inicial
            </button>
          </div>
        } />

        {/* Rota catch-all - redireciona para a página inicial do tipo de usuário */}
        <Route path="*" element={<RoleBasedRedirect />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;