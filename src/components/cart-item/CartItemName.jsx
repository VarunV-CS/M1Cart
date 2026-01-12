import { useNavigate } from 'react-router-dom';

const CartItemName = ({ item, className = '' }) => {
  const navigate = useNavigate();

  return (
    <h3
      className={`cart-item-name ${className}`}
      onClick={() => navigate(`/product/${item.id}`)}
    >
      {item.name}
    </h3>
  );
};

export default CartItemName;