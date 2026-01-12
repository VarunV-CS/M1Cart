import { useCart } from '../../context/CartContext';

const CartItemRemoveButton = ({ item, onRemove, className = '' }) => {
  const { removeFromCart } = useCart();

  const handleRemove = () => {
    if (onRemove) {
      onRemove(item.id);
    } else {
      removeFromCart(item.id);
    }
  };

  return (
    <button
      onClick={handleRemove}
      className={`remove-button ${className}`}
    >
      Remove
    </button>
  );
};

export default CartItemRemoveButton;