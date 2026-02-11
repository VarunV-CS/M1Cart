import { useState, useEffect, useCallback } from 'react';
import { fetchProducts } from '../services/api';

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Exponential backoff for retries
  const getRetryDelay = useCallback((count) => {
    // Base delay: 1s, 2s, 4s, 8s (max 4 retries)
    return Math.min(1000 * Math.pow(2, count), 8000);
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProducts();
      setProducts(data);
      setError(null);
      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      setError(err.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Retry logic with exponential backoff
  useEffect(() => {
    if (error && retryCount > 0 && retryCount <= 4) {
      const timer = setTimeout(() => {
        console.log(`Retrying fetch (attempt ${retryCount}/${4})...`);
        loadProducts();
      }, getRetryDelay(retryCount - 1));

      return () => clearTimeout(timer);
    }
  }, [error, retryCount, loadProducts, getRetryDelay]);

  const refetch = useCallback(async () => {
    setRetryCount(0);
    await loadProducts();
  }, [loadProducts]);

  const retry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    if (retryCount === 0) {
      loadProducts();
    }
  }, [retryCount, loadProducts]);

  return { 
    products, 
    loading, 
    error, 
    refetch,
    retry,
    retryCount,
    canRetry: retryCount < 4
  };
};
