import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { isAuthenticated, getUser } from '../services/api';
import './AdminDashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('analysis'); // 'analysis', 'users', 'products', 'orders'

  useEffect(() => {
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

    setIsAuthorized(true);
    setIsLoading(false);
  }, [navigate, location]);

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
        <div className="content-section">
          <div className="section-card">
            <h2>Analysis</h2>
            <p>Analysis dashboard content will be displayed here.</p>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="content-section">
          <div className="section-card">
            <h2>Users</h2>
            <p>User management content will be displayed here.</p>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="content-section">
          <div className="section-card">
            <h2>Products</h2>
            <p>Product management content will be displayed here.</p>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="content-section">
          <div className="section-card">
            <h2>Orders</h2>
            <p>Order management content will be displayed here.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;

