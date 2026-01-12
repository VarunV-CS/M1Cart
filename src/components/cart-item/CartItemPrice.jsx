const CartItemPrice = ({ item, className = '' }) => {
  return (
    <p className={`cart-item-price ${className}`}>
      ${item.price.toFixed(2)}
    </p>
  );
};

export default CartItemPrice;