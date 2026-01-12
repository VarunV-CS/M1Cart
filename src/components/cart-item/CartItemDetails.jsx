import CartItemName from './CartItemName';
import CartItemCategory from './CartItemCategory';
import CartItemPrice from './CartItemPrice';

const CartItemDetails = ({ item, children, className = '' }) => {
  if (children) {
    return (
      <div className={`cart-item-details ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <div className={`cart-item-details ${className}`}>
      <CartItemDetails.Name item={item} />
      <CartItemDetails.Category item={item} />
      <CartItemDetails.Price item={item} />
    </div>
  );
};

// Attach sub-components to CartItemDetails for compound component pattern
CartItemDetails.Name = CartItemName;
CartItemDetails.Category = CartItemCategory;
CartItemDetails.Price = CartItemPrice;

export default CartItemDetails;