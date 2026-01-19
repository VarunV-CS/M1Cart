import { useCart } from '../../context/CartContext';

const CartItemQuantityControls = ({ item, className = '' }) => {
  const { updateQuantity } = useCart();

  return (
    <div className={`quantity-controls ${className}`}>
      <Button
        onClick={() => updateQuantity(item.id, item.quantity - 1)}
        className="quantity-button"
      >
        −
      </Button>
      <span className="quantity-value">{item.quantity}</span>
      <Button
        onClick={() => updateQuantity(item.id, item.quantity + 1)}
        className="quantity-button"
      >
        +
      </Button>
    </div>
  );
};

export default CartItemQuantityControls;