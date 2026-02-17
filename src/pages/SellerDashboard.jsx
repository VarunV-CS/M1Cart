import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { isAuthenticated, getUser } from '../services/api';

function SellerDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication and authorization
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    const user = getUser();
    
    // Only allow seller users
    if (user?.role !== 'seller') {
      // Redirect to appropriate dashboard based on role
      if (user?.role === 'admin') {
        navigate('/admin-dashboard');
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
      <div className="seller-dashboard-container">
        <div className="loading-container">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="seller-dashboard-container">
      <div className="dashboard-header">
        <h1>Seller Dashboard</h1>
        <p>Welcome to the seller dashboard</p>
      </div>
    </div>
  );
}

export default SellerDashboard;

