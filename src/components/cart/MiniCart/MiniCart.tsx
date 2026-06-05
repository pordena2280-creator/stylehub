import { Link } from 'react-router-dom';
import { useCart } from '../../../contexts/CartContext';
import './MiniCart.css';

export const MiniCart = ({ onClose }: { onClose: () => void }) => {
  const { items, subtotal, itemCount, removeFromCart, updateQuantity } = useCart();

  return (
    <div className="mini-cart">
      <div className="mini-cart-header">
        <h3>Carrito <span>({itemCount})</span></h3>
        <button className="mini-cart-close" onClick={onClose}>
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>

      {items.length === 0 ? (
        <div className="mini-cart-empty">
          <i className="fa-solid fa-cart-shopping"></i>
          <p>Tu carrito está vacío</p>
          <Link to="/products" className="mini-cart-shop-btn" onClick={onClose}>
            Ver productos
          </Link>
        </div>
      ) : (
        <>
          <div className="mini-cart-items">
            {items.map(item => (
              <div key={item.product_id} className="mini-cart-item">
                <Link to={`/product/${item.product_id}`} onClick={onClose}>
                  <img
                    src={item.product?.images?.[0] || 'https://placehold.co/60x60/f5f5f5/909090?text=P'}
                    alt={item.product?.name}
                    onError={e => (e.currentTarget.src = 'https://placehold.co/60x60/f5f5f5/909090?text=P')}
                  />
                </Link>
                <div className="mini-cart-item-info">
                  <Link to={`/product/${item.product_id}`} className="mini-cart-item-name" onClick={onClose}>
                    {item.product?.name}
                  </Link>
                  <div className="mini-cart-item-qty">
                    <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)} disabled={item.quantity <= 1}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)}>+</button>
                  </div>
                  <span className="mini-cart-item-price">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
                <button className="mini-cart-remove" onClick={() => removeFromCart(item.product_id)}>
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
            ))}
          </div>

          <div className="mini-cart-footer">
            <div className="mini-cart-subtotal">
              <span>Subtotal:</span>
              <strong>${subtotal.toFixed(2)}</strong>
            </div>
            <Link to="/cart" className="mini-cart-btn view" onClick={onClose}>
              Ver carrito
            </Link>
            <Link to="/checkout" className="mini-cart-btn checkout" onClick={onClose}>
              <i className="fa-solid fa-lock"></i> Pagar ahora
            </Link>
          </div>
        </>
      )}
    </div>
  );
};
