import CartItemQuantityControls from './CartItemQuantityControls';
import CartItemTotal from './CartItemTotal';
import CartItemRemoveButton from './CartItemRemoveButton';

const CartItemControls = ({ item, children, className = '' }) => {
  if (children) {
    return (
      <div className={`cart-item-controls ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <div className={`cart-item-controls ${className}`}>
      <CartItemControls.QuantityControls item={item} />
      <CartItemControls.Total item={item} />
      <CartItemControls.RemoveButton item={item} />
    </div>
  );
};

// Attach sub-components to CartItemControls for compound component pattern
CartItemControls.QuantityControls = CartItemQuantityControls;
CartItemControls.Total = CartItemTotal;
CartItemControls.RemoveButton = CartItemRemoveButton;

export default CartItemControls;