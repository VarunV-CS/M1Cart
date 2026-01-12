const CartItemTotal = ({ item, className = '' }) => {
  return (
    <div className={`cart-item-total ${className}`}>
      ${(item.price * item.quantity).toFixed(2)}
    </div>
  );
};

export default CartItemTotal;