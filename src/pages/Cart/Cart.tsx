import { Link } from 'react-router-dom';
import { useState } from 'react';
import './Cart.css';
import { useCart } from '../../contexts/CartContext';
import { getProductImageUrl } from '../../utils/imageUtils';

const Cart = () => {
  const { items, updateQuantity, removeFromCart, subtotal, shipping, tax, total, applyCoupon: applyCouponCtx } = useCart();

  const [couponCode, setCouponCode] = useState('');


  const applyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    await applyCouponCtx(couponCode);
  };

  return (
    <div className="tf-sp-cart">
      <div className="container">
        {/* Checkout Status */}
        <div className="checkout-status tf-sp-2 pt-0">
          <div className="checkout-wrap">
            <span className="checkout-bar first"></span>
            <div className="step-payment ">
                 <span className="icon">
                 <i className="fa-solid fa-cart-shopping"></i>
              </span>
               <Link to="/cart" className="text-secondary body-text-3">Carrito de compras</Link>
            </div>
            <div className="step-payment">
              <span className="icon">
                <i className="fa-solid fa-cart-shopping"></i>
              </span>
<Link to="/checkout" className="link-secondary body-text-3">Compras y pago</Link>
            </div>
            <div className="step-payment">
              <span className="icon">
                <i className="fa-solid fa-cart-shopping"></i>
              </span>
<span className="link-secondary body-text-3">Confirmación</span>
            </div>
          </div>
        </div>

        <form className="form-discount" onSubmit={applyCoupon}>
          <div className="overflow-x-auto">
            <div className="cart-table">
              <table className="table-cart">
                <thead>
                  <tr>
<th>Producto</th>
<th>Precio</th>
<th>Cantidad</th>
<th>Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (

                    <tr key={item.id} className="tf-cart-item">
                      <td className="tf-cart-item_product">
<Link to={`/product/${item.product_id}`} className="img-box">
<img src={getProductImageUrl(item.product)} alt={item.product.name} />
</Link>
                        <div className="cart-info">
                          <Link to={`/product/${item.product_id}`} className="cart-title body-md-2 fw-semibold link">
                            {item.product.name}
                          </Link>
                          <div className="variant-box">
                            <p className="body-text-3">Color:</p>
                            <div className="tf-select">
                              <select defaultValue="Yellow">
                                <option>Yellow</option>
                                <option>Green</option>
                                <option>Black</option>
                                <option>Red</option>
                                <option>Beige</option>
                                <option>Pink</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td data-cart-title="Price" className="tf-cart-item_price">
                        <p className="cart-price price-on-sale price-text fw-medium">
                          ${item.price.toFixed(2)}
                        </p>
                      </td>
                      <td data-cart-title="Quantity" className="tf-cart-item_quantity">
                        <div className="wg-quantity">
                          <span
                            className="btn-quantity btn-decrease"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <i className="fa-solid fa-minus"></i>
                          </span>
                          <input
                            className="quantity-product"
                            type="text"
value={item.quantity}
                            onChange={(e) => updateQuantity(item.product_id, parseInt(e.target.value) || 1)}
                          />
                          <span
                            className="btn-quantity btn-increase"
onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          >
                            <i className="fa-solid fa-plus"></i>
                          </span>
                        </div>
                      </td>
                      <td data-cart-title="Total" className="tf-cart-item_total">
                        <p className="cart-total total-price price-text fw-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </td>
                      <td data-cart-title="Remove" className="remove-cart text-xxl-end">
                        <span
                          className="remove fa-solid fa-xmark link"
onClick={() => removeFromCart(item.product_id)}

                        ></span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="cart-bottom">
            <div className="cart-coupon">
              <input
                type="text"
placeholder="Ingresa tu código de cupón"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                required
              />
              <button type="submit" className="tf-btn btn-gray">
<span className="text-white">Aplicar cupón</span>
              </button>
            </div>
<span className="last-total-price main-title fw-semibold">Total:</span>
          </div>
        </form>

        <div className="box-btn">
          <Link to="/products" className="tf-btn btn-gray">
<span className="text-white">Seguir comprando</span>
          </Link>
          <Link to="/checkout" className="tf-btn">
<span className="text-white">Ir al pago</span>
          </Link>
        </div>

        {/* Cart Summary */}
        <div className="cart-summary">
<h3 className="summary-title">Resumen del pedido</h3>
          <div className="summary-row">
<span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
<span>Envío:</span>
            <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
          </div>
          <div className="summary-row">
<span>Impuesto (16%):</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="summary-total">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;