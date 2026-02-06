import { useCart } from '../../context/CartContext';
import { Button } from '../patterns';

const CartItemQuantityControls = ({ item, className = '' }) => {
  const { updateQuantity } = useCart();

  return (
    <div className={`quantity-controls ${className}`}>
      <Button
        onClick={() => updateQuantity(item.pid, item.quantity - 1)}
        className="quantity-button"
      >
        −
      </Button>
      <span className="quantity-value">{item.quantity}</span>
      <Button
        onClick={() => updateQuantity(item.pid, item.quantity + 1)}
        className="quantity-button"
      >
        +
      </Button>
    </div>
  );
};

export default CartItemQuantityControls;