import { Button } from '../patterns';
import { useCart } from '../../context/CartContext';

const CartItemRemoveButton = ({ item, onRemove, className = '' }) => {
  const { removeFromCart } = useCart();

  const handleRemove = () => {
    if (onRemove) {
      onRemove(item.pid);
    } else {
      removeFromCart(item.pid);
    }
  };

  return (
    <Button
      onClick={handleRemove}
      className={`remove-button ${className}`}
      variant="danger"
      size="small"
    >
      Remove
    </Button>
  );
};

export default CartItemRemoveButton;