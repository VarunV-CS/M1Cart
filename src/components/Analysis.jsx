/**
 * Analysis Component for Admin Dashboard
 * Displays pie charts for users, products, and orders analytics
 */

import { useEffect, useState } from 'react';
import { getAllUsers, getAllProducts, getAllOrders } from '../services/api';
import PieChart from './PieChart';
import './Analysis.css';

function Analysis() {
  const [analysisData, setAnalysisData] = useState({
    usersByRole: [],
    productsByStatus: [],
    ordersByStatus: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalysisData();
  }, []);

  const fetchAnalysisData = async () => {
    setLoading(true);
    setError('');

    try {
      // Fetch users count by role
      const usersResponse = await getAllUsers(1, 1, 'all');
      const allUsers = usersResponse.users || [];
      const usersByRole = [
        { name: 'Admins', value: allUsers.filter(u => u.role === 'admin').length, color: '#6366f1' },
        { name: 'Sellers', value: allUsers.filter(u => u.role === 'seller').length, color: '#8b5cf6' },
        { name: 'Buyers', value: allUsers.filter(u => u.role === 'buyer').length, color: '#06b6d4' }
      ];

      // Fetch products by status
      const productsResponse = await getAllProducts(1, 1, { status: 'all' });
      const allProducts = productsResponse.products || [];
      const productsByStatus = [
        { name: 'Approved', value: allProducts.filter(p => p.status === 'Approved').length, color: '#22c55e' },
        { name: 'Submitted', value: allProducts.filter(p => p.status === 'Submitted').length, color: '#f59e0b' },
        { name: 'Rejected', value: allProducts.filter(p => p.status === 'Rejected').length, color: '#ef4444' },
        { name: 'Deleted', value: allProducts.filter(p => p.status === 'Deleted').length, color: '#6b7280' }
      ];

      // Fetch orders by status
      const ordersResponse = await getAllOrders(1, 100, 'all');
      const allOrders = ordersResponse.orders || [];
      const ordersByStatus = [
        { name: 'Completed', value: allOrders.filter(o => o.status === 'completed').length, color: '#22c55e' },
        { name: 'Pending', value: allOrders.filter(o => o.status === 'pending').length, color: '#f59e0b' },
        { name: 'Failed', value: allOrders.filter(o => o.status === 'failed').length, color: '#ef4444' },
        { name: 'Cancelled', value: allOrders.filter(o => o.status === 'cancelled').length, color: '#6b7280' },
        { name: 'Dispatched', value: allOrders.filter(o => o.status === 'dispatched').length, color: '#3b82f6' },
        { name: 'Delivered', value: allOrders.filter(o => o.status === 'delivered').length, color: '#10b981' }
      ];

      setAnalysisData({
        usersByRole,
        productsByStatus,
        ordersByStatus
      });
    } catch (err) {
      console.error('Error fetching analysis data:', err);
      setError('Failed to fetch analysis data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="analysis-loading">
        <div className="spinner"></div>
        <p>Loading analysis data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analysis-error">
        <p>{error}</p>
        <button onClick={fetchAnalysisData} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="analysis-container">
      <div className="analysis-header">
        <h2>Analysis Dashboard</h2>
      </div>
      
      <div className="analysis-grid">
        <div className="analysis-card">
          <PieChart 
            data={analysisData.usersByRole} 
            title="Users by Role" 
          />
        </div>
        <div className="analysis-card">
          <PieChart 
            data={analysisData.productsByStatus} 
            title="Products by Status" 
          />
        </div>
        <div className="analysis-card">
          <PieChart 
            data={analysisData.ordersByStatus} 
            title="Orders by Status" 
          />
        </div>
      </div>
    </div>
  );
}

export default Analysis;

