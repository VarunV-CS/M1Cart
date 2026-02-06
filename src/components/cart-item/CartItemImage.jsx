import { useNavigate } from 'react-router-dom';

const CartItemImage = ({ item, className = '' }) => {
  const navigate = useNavigate();

  return (
    <div className={`cart-item-image ${className}`}>
      <img
        src={item.image}
        alt={item.name}
        onClick={() => navigate(`/product/${item.pid}`)}
      />
    </div>
  );
};

export default CartItemImage;