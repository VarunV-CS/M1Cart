import CartItemImage from './cart-item/CartItemImage';
import CartItemDetails from './cart-item/CartItemDetails';
import CartItemControls from './cart-item/CartItemControls';
import './CartItem.css';

const CartItem = ({ item, children, className = '', ...props }) => {
  if (children) {
    return (
      <div className={`cart-item ${className}`} {...props}>
        {children}
      </div>
    );
  }

  return (
    <CartItem item={item}>
      <CartItem.Image item={item} />
      <CartItem.Details item={item} />
      <CartItem.Controls item={item} />
    </CartItem>
  );
};

// Attach sub-components to CartItem for compound component pattern
CartItem.Image = CartItemImage;
CartItem.Details = CartItemDetails;
CartItem.Controls = CartItemControls;

// Also attach deeper sub-components for backward compatibility
CartItem.Name = CartItemDetails.Name;
CartItem.Category = CartItemDetails.Category;
CartItem.Price = CartItemDetails.Price;
CartItem.QuantityControls = CartItemControls.QuantityControls;
CartItem.Total = CartItemControls.Total;
CartItem.RemoveButton = CartItemControls.RemoveButton;

export default CartItem;
