import { useProducts } from '../hooks/useProducts';
import ProductCard from '../components/ProductCard';
import withLoading from '../hocs/withLoading';
import withErrorBoundary from '../hocs/withErrorBoundary';

const ProductListContent = ({ products, error, ...props }) => {
  if (error) {
    throw new Error(error);
  }

  return (
    <div className="product-list">
      <div className="products-grid">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

const ProductListWithLoading = withLoading(ProductListContent);

// This wrapper component calls the hook once and passes data + loading to HOC
const ProductList = (props) => {
  const { products, error, loading } = useProducts();
  return (
    <ProductListWithLoading 
      loading={loading} 
      products={products}
      error={error}
      {...props} 
    />
  );
};

const ProductListWithErrorBoundary = withErrorBoundary(ProductList);

export default ProductListWithErrorBoundary;