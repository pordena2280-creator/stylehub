import { Link } from 'react-router-dom';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';
import { getProductImageUrl } from '../../utils/imageUtils';
import './Wishlist.css';

// ============================================================
// WISHLIST — conectada al WishlistContext real
// ============================================================

const Wishlist = () => {
  const { items, loading, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleRemove = (item: typeof items[0]) => {
    toggleWishlist(item.product);
  };

  const handleMoveToCart = (item: typeof items[0]) => {
    addToCart(item.product, 1);
    toggleWishlist(item.product);
  };

  if (loading) {
    return (
      <div className="tf-sp-2">
        <div className="container">
          <div className="tf-wishlist">
            <div className="wishlist-loading">
              <div className="loading-spinner"></div>
              <p>Cargando lista de deseos...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tf-sp-2">
      <div className="container">
        <div className="tf-wishlist">
          {items.length === 0 ? (
            <div className="wishlist-empty">
              <i className="fa-regular fa-heart"></i>
              <h3>Tu lista de deseos está vacía</h3>
              <p>Agrega productos a tu lista de deseos para guardarlos para más tarde</p>
              <Link to="/products" className="tf-btn btn-primary">
                Explorar Productos
              </Link>
            </div>
          ) : (
            <table className="tf-table-wishlist">
              <thead>
                <tr>
                  <th className="wishlist-item_remove" />
                  <th className="wishlist-item_image" />
                  <th className="wishlist-item_info">
                    <p className="product-title fw-semibold">Producto</p>
                  </th>
                  <th className="wishlist-item_price">
                    <p className="product-title fw-semibold">Precio</p>
                  </th>
                  <th className="wishlist-item_stock">
                    <p className="product-title fw-semibold">Disponibilidad</p>
                  </th>
                  <th className="wishlist-item_action" />
                </tr>
              </thead>
              <tbody>
                 {items.map((item) => {
                   const product = item.product;
                   const image   = getProductImageUrl(product);
                   const inStock = product.stock > 0;

                  return (
                    <tr key={item.id} className="wishlist-item">
                      {/* Eliminar */}
                      <td className="wishlist-item_remove">
                        <button
                          className="btn-remove-wishlist"
                          onClick={() => handleRemove(item)}
                          title="Eliminar de la lista"
                        >
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      </td>

                      {/* Imagen */}
                      <td className="wishlist-item_image">
                        <Link to={`/product/${product.id}`}>
                          <img
                            src={image}
                            alt={product.name}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/images/products/placeholder.jpg';
                            }}
                          />
                        </Link>
                      </td>

                      {/* Nombre */}
                      <td className="wishlist-item_info">
                        <Link
                          className="text-line-clamp-2 body-md-2 fw-semibold text-secondary link"
                          to={`/product/${product.id}`}
                        >
                          {product.name}
                        </Link>
                        {product.category && (
                          <p className="wishlist-item-category">{product.category.name}</p>
                        )}
                      </td>

                      {/* Precio */}
                      <td className="wishlist-item_price">
                        <p className="price-wrap fw-medium flex-nowrap">
                          <span className="new-price price-text fw-medium mb-0">
                            ${product.price.toFixed(2)}
                          </span>
                          {product.old_price && product.old_price > product.price && (
                            <span className="old-price body-md-2 text-main-2 fw-normal">
                              ${product.old_price.toFixed(2)}
                            </span>
                          )}
                        </p>
                      </td>

                      {/* Stock */}
                      <td className="wishlist-item_stock">
                        <span className={`wishlist-stock-status ${inStock ? 'in-stock' : 'out-of-stock'}`}>
                          {inStock ? 'En Stock' : 'Agotado'}
                        </span>
                      </td>

                      {/* Acción */}
                      <td className="wishlist-item_action">
                        <button
                          className="tf-btn btn-gray"
                          onClick={() => handleMoveToCart(item)}
                          disabled={!inStock}
                        >
                          <span>{inStock ? 'Mover al Carrito' : 'Agotado'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
