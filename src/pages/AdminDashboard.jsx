import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { isAuthenticated, getUser, getProfile, setUser as setStoredUser, sendVerificationOTP } from '../services/api';
import Analysis from '../components/Analysis';
import VerificationModal from '../components/VerificationModal';
import Users from '../components/Users';
import Products from '../components/Products';
import AdminOrders from '../components/AdminOrders';
import './AdminDashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('analysis'); // 'analysis', 'users', 'products', 'orders'

  // Handle Verify Account button click
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      // Check authentication and authorization
      if (!isAuthenticated()) {
        navigate('/login');
        return;
      }

      const userData = getUser();
      setUser(userData);
      
      // Only allow admin users
      if (userData?.role !== 'admin') {
        // Redirect to appropriate dashboard based on role
        if (userData?.role === 'seller') {
          navigate('/seller-dashboard');
        } else {
          navigate('/dashboard');
        }
        return;
      }

      try {
        const profileResponse = await getProfile();
        const profileUser = profileResponse?.user;

        if (isMounted && profileUser) {
          const mergedUser = { ...userData, ...profileUser };
          setUser(mergedUser);
          setStoredUser(mergedUser);
        }
      } catch (error) {
        console.error('Error loading latest profile:', error);
      } finally {
        if (isMounted) {
          setIsAuthorized(true);
          setIsLoading(false);
        }
      }
    };

    loadUser();

    return () => {
      isMounted = false;
    };
  }, [navigate, location]);

  // Handle Verify Account button click
  const handleVerifyClick = async () => {
    try {
      await sendVerificationOTP();
      setShowVerificationModal(true);
    } catch (error) {
      console.error('Error sending verification OTP:', error);
      alert(error.message || 'Failed to send verification code. Please try again.');
    }
  };

  const handleVerificationComplete = () => {
    // Update local user state to reflect verification status
    setUser(prev => {
      if (!prev) return null;
      const updatedUser = { ...prev, isVerified: true };
      setStoredUser(updatedUser);
      return updatedUser;
    });
  };

  if (isLoading) {
    return (
      <div className={`admin-dashboard-container ${isDark ? 'dark' : ''}`}>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className={`admin-dashboard-container ${isDark ? 'dark' : ''}`}>
      <div className="dashboard-header">
        <div className="dashboard-header-left">
          <h1>Admin Dashboard</h1>
        </div>
        <div className="dashboard-header-right">
          <div className="account-info">
            <div className="name-badge-container">
              <span className="account-name">{user?.name || user?.businessName}</span>
              <span className="role-badge">{user?.role || 'admin'}</span>
            </div>
            <span className="account-email">{user?.email}</span>
          </div>
          {user?.isVerified === false && (
              <div className="info-item verify-btn-item">
                <button 
                  className="verify-account-btn"
                  onClick={handleVerifyClick}
                >
                  Verify Account
                </button>
              </div>
            )}
        </div>
      </div>

      {/* Category Filters */}
      <div className="category-filters">
        <button
          className={`category-filter-btn ${activeTab === 'analysis' ? 'active' : ''}`}
          onClick={() => setActiveTab('analysis')}
        >
          Analysis
        </button>
        <button
          className={`category-filter-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button
          className={`category-filter-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Products
        </button>
        <button
          className={`category-filter-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Orders
        </button>
      </div>

      {activeTab === 'analysis' && (
        <Analysis />
      )}

      {activeTab === 'users' && (
        <Users />
      )}

      {activeTab === 'products' && (
        <Products />
      )}

      {activeTab === 'orders' && (
        <AdminOrders />
      )}

      <VerificationModal 
        isOpen={showVerificationModal} 
        onClose={() => setShowVerificationModal(false)}
        onVerificationComplete={handleVerificationComplete}
      />
    </div>
  );
}

export default AdminDashboard;
