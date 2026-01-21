import { ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';
import { LogOut, Store, Truck, User } from 'lucide-react';
import './Layout.css';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const getDashboardLink = () => {
    if (!profile) return '/';

    switch (profile.user_type) {
      case 'customer':
        return '/customer';
      case 'store':
        return '/store';
      case 'delivery':
        return '/delivery';
      default:
        return '/';
    }
  };

  const getIcon = () => {
    if (!profile) return <User className="w-5 h-5" />;

    switch (profile.user_type) {
      case 'customer':
        return <User className="w-5 h-5" />;
      case 'store':
        return <Store className="w-5 h-5" />;
      case 'delivery':
        return <Truck className="w-5 h-5" />;
      default:
        return <User className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      <nav className="navbar-container">
        <div className="navbar-content">
          <div className="navbar-inner">
            <button
              onClick={() => navigate(getDashboardLink())}
              className="logo-button"
            >
              Rumbrov_Delivery
            </button>

            {user && profile && (
              <div className="user-section">
                <div className="user-info-card">
                  <div className="user-icon-wrapper">
                    {getIcon()}
                  </div>
                  <span className="user-name">{profile.full_name}</span>
                </div>
                <Button
                  onClick={handleSignOut}
                  variant="secondary"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sair</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="min-h-[calc(100vh-5rem)]">{children}</main>
    </div>
  );
};
