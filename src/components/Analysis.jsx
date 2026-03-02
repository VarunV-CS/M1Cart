/**
 * Analysis Component for Admin Dashboard
 * Displays pie charts for users, products, and orders analytics
 */

import { useEffect, useState } from 'react';
import { getAllUsers, getAllProducts, getAllOrders } from '../services/api';
import PieChart from './PieChart';
import './Analysis.css';

function Analysis({ onNavigateTab = () => {} }) {
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

  const safeTotal = (response) => response?.pagination?.total ?? 0;
  const handleCardKeyDown = (event, tabName) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onNavigateTab(tabName);
    }
  };

  const fetchAnalysisData = async () => {
    setLoading(true);
    setError('');

    try {
      // Fetch totals by user role
      const [adminsRes, sellersRes, buyersRes] = await Promise.all([
        getAllUsers(1, 1, 'admin'),
        getAllUsers(1, 1, 'seller'),
        getAllUsers(1, 1, 'buyer')
      ]);

      const usersByRole = [
        { name: 'Admins', value: safeTotal(adminsRes), color: '#6366f1' },
        { name: 'Sellers', value: safeTotal(sellersRes), color: '#8b5cf6' },
        { name: 'Buyers', value: safeTotal(buyersRes), color: '#06b6d4' }
      ];

      // Fetch totals by product status
      const [approvedRes, submittedRes, rejectedRes, deletedRes] = await Promise.all([
        getAllProducts(1, 1, { status: 'Approved' }),
        getAllProducts(1, 1, { status: 'Submitted' }),
        getAllProducts(1, 1, { status: 'Rejected' }),
        getAllProducts(1, 1, { status: 'Deleted' })
      ]);

      const productsByStatus = [
        { name: 'Approved', value: safeTotal(approvedRes), color: '#22c55e' },
        { name: 'Submitted', value: safeTotal(submittedRes), color: '#f59e0b' },
        { name: 'Rejected', value: safeTotal(rejectedRes), color: '#ef4444' },
        { name: 'Deleted', value: safeTotal(deletedRes), color: '#6b7280' }
      ];

      // Fetch totals by order status
      const [
        completedRes,
        // pendingRes,
        failedRes,
        cancelledRes,
        dispatchedRes,
        deliveredRes
      ] = await Promise.all([
        getAllOrders(1, 1, 'completed'),
        // getAllOrders(1, 1, 'pending'),
        getAllOrders(1, 1, 'failed'),
        getAllOrders(1, 1, 'cancelled'),
        getAllOrders(1, 1, 'dispatched'),
        getAllOrders(1, 1, 'delivered')
      ]);

      const ordersByStatus = [
        { name: 'Completed', value: safeTotal(completedRes), color: '#22c55e' },
        // { name: 'Pending', value: safeTotal(pendingRes), color: '#f59e0b' },
        { name: 'Failed', value: safeTotal(failedRes), color: '#ef4444' },
        { name: 'Cancelled', value: safeTotal(cancelledRes), color: '#6b7280' },
        { name: 'Dispatched', value: safeTotal(dispatchedRes), color: '#3b82f6' },
        { name: 'Delivered', value: safeTotal(deliveredRes), color: '#f59e0b' }
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
        <div
          className="analysis-card"
          role="button"
          tabIndex={0}
          onClick={() => onNavigateTab('users')}
          onKeyDown={(event) => handleCardKeyDown(event, 'users')}
          aria-label="Open users tab"
        >
          <PieChart 
            data={analysisData.usersByRole} 
            title="Users by Role" 
          />
        </div>
        <div
          className="analysis-card"
          role="button"
          tabIndex={0}
          onClick={() => onNavigateTab('products')}
          onKeyDown={(event) => handleCardKeyDown(event, 'products')}
          aria-label="Open products tab"
        >
          <PieChart 
            data={analysisData.productsByStatus} 
            title="Products by Status" 
          />
        </div>
        <div
          className="analysis-card"
          role="button"
          tabIndex={0}
          onClick={() => onNavigateTab('orders')}
          onKeyDown={(event) => handleCardKeyDown(event, 'orders')}
          aria-label="Open orders tab"
        >
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
