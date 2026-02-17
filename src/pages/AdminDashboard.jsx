import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { isAuthenticated, getUser } from '../services/api';

function AdminDashboard() {
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
    
    // Only allow admin users
    if (user?.role !== 'admin') {
      // Redirect to appropriate dashboard based on role
      if (user?.role === 'seller') {
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
      <div className="admin-dashboard-container">
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
    <div className="admin-dashboard-container">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome to the admin dashboard</p>
      </div>
    </div>
  );
}

export default AdminDashboard;

