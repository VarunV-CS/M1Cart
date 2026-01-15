import { useProducts } from '../hooks/useProducts';
import ProductCard from '../components/ProductCard';
import withLoading from '../hocs/withLoading';
import withErrorBoundary from '../hocs/withErrorBoundary';

const ProductList = ({ category }) => {
  const { products, error } = useProducts();

  const filteredProducts = category
    ? products.filter(product => product.category === category)
    : products;

  if (error) {
    throw new Error(error);
  }

  return (
    <div className="product-list">
      <div className="products-grid">
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

const ProductListWithLoading = withLoading(ProductList);
const ProductListWithErrorBoundary = withErrorBoundary(ProductListWithLoading);

export default ProductListWithErrorBoundary;