import { useState, useEffect, useCallback } from 'react';
import { fetchProducts } from '../services/api';

export const useProducts = (initialPage = 1, initialLimit = 10) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // Pagination state
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Exponential backoff for retries
  const getRetryDelay = useCallback((count) => {
    // Base delay: 1s, 2s, 4s, 8s (max 4 retries)
    return Math.min(1000 * Math.pow(2, count), 8000);
  }, []);

  const loadProducts = useCallback(async (pageNum = page, limitNum = limit) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProducts(pageNum, limitNum);
      
      // Handle both old format (array) and new format (object with pagination)
      if (Array.isArray(data)) {
        // Old format - no pagination
        setProducts(data);
        setTotal(data.length);
        setTotalPages(1);
      } else {
        // New format with pagination
        setProducts(data.products);
        setTotal(data.pagination?.total || data.products.length);
        setTotalPages(data.pagination?.totalPages || 1);
      }
      
      setError(null);
      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      setError(err.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

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

  const goToPage = useCallback((newPage) => {
    const pageNum = Math.max(1, Math.min(newPage, totalPages));
    setPage(pageNum);
  }, [totalPages]);

  const changeLimit = useCallback((newLimit) => {
    const limitNum = Math.max(1, Math.min(newLimit, 100));
    setLimit(limitNum);
    setPage(1); // Reset to first page when changing limit
  }, []);

  const nextPage = useCallback(() => {
    if (page < totalPages) {
      setPage(prev => prev + 1);
    }
  }, [page, totalPages]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage(prev => prev - 1);
    }
  }, [page]);

  return { 
    products, 
    loading, 
    error, 
    refetch,
    retry,
    retryCount,
    canRetry: retryCount < 4,
    // Pagination state
    page,
    totalPages,
    total,
    limit,
    hasNext: page < totalPages,
    hasPrev: page > 1,
    // Pagination actions
    goToPage,
    changeLimit,
    nextPage,
    prevPage,
    setPage,
    setLimit
  };
};
