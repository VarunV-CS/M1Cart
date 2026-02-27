import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { isAuthenticated, getUser, sendVerificationOTP } from '../services/api';
import VerificationModal from '../components/VerificationModal';
import SellerProducts from '../components/SellerProducts';
import SellerOrders from '../components/SellerOrders';
import './SellerDashboard.css';

function SellerDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('products'); // 'products' or 'orders'

  // Handle Verify Account button click
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  useEffect(() => {
    // Check authentication and authorization
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    const userData = getUser();
    setUser(userData);
    
    // Only allow seller users
    if (userData?.role !== 'seller') {
      // Redirect to appropriate dashboard based on role
      if (userData?.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/dashboard');
      }
      return;
    }

    setIsAuthorized(true);
    setIsLoading(false);
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
    setUser(prev => prev ? { ...prev, isVerified: true } : null);
  };
  
  if (isLoading) {
    return (
      <div className={`seller-dashboard-container ${isDark ? 'dark' : ''}`}>
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
    <div className={`seller-dashboard-container ${isDark ? 'dark' : ''}`}>
      <div className="dashboard-header">
        <div className="dashboard-header-left">
          <h1>Seller Dashboard</h1>
        </div>
        <div className="dashboard-header-right">
          <div className="account-info">
            <div className="name-badge-container">
              <span className="account-name">{user?.name || user?.businessName}</span>
              <span className="role-badge">{user?.role || 'seller'}</span>
            </div>
            <span className="account-email">{user?.email}</span>
            <span className="business-name">{user?.businessName}</span>
          </div>
          {!user?.isVerified && (
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

      {activeTab === 'products' && <SellerProducts />}

      {activeTab === 'orders' && <SellerOrders />}

      {/* Verification Modal */}
      <VerificationModal 
        isOpen={showVerificationModal} 
        onClose={() => setShowVerificationModal(false)}
        onVerificationComplete={handleVerificationComplete}
      />
    </div>
  );
}

export default SellerDashboard;
