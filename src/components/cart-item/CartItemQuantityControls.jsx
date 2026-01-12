import { useCart } from '../../context/CartContext';

const CartItemQuantityControls = ({ item, className = '' }) => {
  const { updateQuantity } = useCart();

  return (
    <div className={`quantity-controls ${className}`}>
      <button
        onClick={() => updateQuantity(item.id, item.quantity - 1)}
        className="quantity-button"
      >
        −
      </button>
      <span className="quantity-value">{item.quantity}</span>
      <button
        onClick={() => updateQuantity(item.id, item.quantity + 1)}
        className="quantity-button"
      >
        +
      </button>
    </div>
  );
};

export default CartItemQuantityControls;