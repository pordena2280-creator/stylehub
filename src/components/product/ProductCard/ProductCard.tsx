import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../../contexts/CartContext';
import { useWishlist } from '../../../contexts/WishlistContext';
import { StarRating } from '../../common/StarRating/StarRating';
import type { Product } from '../../../types';
import { calcDiscount } from '../../../utils';
import { getProductImageUrl } from '../../../utils/imageUtils';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
  showQuickAdd?: boolean;
}

export const ProductCard = React.memo(({ product, showQuickAdd = true }: ProductCardProps) => {
  const { addToCart, isInCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const inCart     = isInCart(product.id);
  const inWishlist = isInWishlist(product.id);
  const discount   = product.old_price ? calcDiscount(product.price, product.old_price) : 0;
  const mainImage  = getProductImageUrl(product);

  return (
    <div className="pcard">
      {/* Badges */}
      {discount > 0 && <span className="pcard-badge sale">-{discount}%</span>}
      {product.featured && !discount && <span className="pcard-badge new">Nuevo</span>}
      {product.stock === 0 && <span className="pcard-badge out">Agotado</span>}

       {/* Image */}
       <Link to={`/product/${product.id}`} className="pcard-img-wrap">
         <img
           src={mainImage}
           alt={product.name}
           loading="lazy"
           onError={e => (e.currentTarget.src = '/images/products/placeholder.jpg')}
         />
        {/* Hover actions */}
        <div className="pcard-actions">
          <button
            className={`pcard-action-btn ${inWishlist ? 'active' : ''}`}
            onClick={e => { e.preventDefault(); toggleWishlist(product); }}
            title={inWishlist ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            <i className={inWishlist ? 'fa-solid fa-heart' : 'fa-regular fa-heart'}></i>
          </button>
          <Link
            to={`/product/${product.id}`}
            className="pcard-action-btn"
            title="Ver producto"
            onClick={e => e.stopPropagation()}
          >
            <i className="fa-regular fa-eye"></i>
          </Link>
          <Link
            to="/compare"
            className="pcard-action-btn"
            title="Comparar"
            onClick={e => e.stopPropagation()}
          >
            <i className="fa-solid fa-code-compare"></i>
          </Link>
        </div>
      </Link>

      {/* Body */}
      <div className="pcard-body">
        <p className="pcard-cat">{product.category?.name || 'General'}</p>
        <Link to={`/product/${product.id}`} className="pcard-name">{product.name}</Link>

        <div className="pcard-rating">
          <StarRating value={product.rating || 0} readonly size="sm" />
          <span className="pcard-reviews">({product.reviews_count || 0})</span>
        </div>

        <div className="pcard-price">
          {product.old_price ? (
            <>
              <span className="pcard-price-sale">${product.price.toFixed(2)}</span>
              <span className="pcard-price-old">${product.old_price.toFixed(2)}</span>
            </>
          ) : (
            <span className="pcard-price-current">${product.price.toFixed(2)}</span>
          )}
        </div>

        {showQuickAdd && (
          <button
            className={`pcard-add-btn ${inCart ? 'in-cart' : ''}`}
            onClick={() => addToCart(product)}
            disabled={product.stock === 0}
          >
            <i className={inCart ? 'fa-solid fa-check' : 'fa-solid fa-cart-shopping'}></i>
            {product.stock === 0 ? 'Agotado' : inCart ? 'En el carrito' : 'Agregar'}
          </button>
        )}
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';
