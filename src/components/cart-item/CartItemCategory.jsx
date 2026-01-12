const CartItemCategory = ({ item, className = '' }) => {
  return (
    <p className={`cart-item-category ${className}`}>
      {item.category}
    </p>
  );
};

export default CartItemCategory;