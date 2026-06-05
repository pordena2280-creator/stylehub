import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react';
import { localCartService, cartService } from '../services';
import { couponService } from '../services/couponService';
import { useAuth } from './AuthContext';
import type { Product, Coupon } from '../types';

// CartItem local (en este proyecto lo armamos dentro del contexto)
type CartItem = {
  id: number;
  user_id: string;
  session_id?: string;
  product_id: number;
  product: Product;
  quantity: number;
  price: number;
  created_at: string;
};

// ============================================
// CONTEXTO DE CARRITO
// ============================================

interface CartState {
  items: CartItem[];
  coupon: Coupon | null;
  loading: boolean;
}

type CartAction =
  | { type: 'SET_ITEMS'; payload: CartItem[] }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: number }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: number; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_COUPON'; payload: Coupon | null }
  | { type: 'SET_LOADING'; payload: boolean };

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  coupon: Coupon | null;
  loading: boolean;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  isInCart: (productId: number) => boolean;
}

// Reducer
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_ITEMS':
      return { ...state, items: action.payload };
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i.product_id === action.payload.product_id);
      if (existing) {
        return {
          ...state,
          items: state.items.map(i =>
            i.product_id === action.payload.product_id
              ? { ...i, quantity: i.quantity + action.payload.quantity }
              : i
          ),
        };
      }
      return { ...state, items: [...state.items, action.payload] };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i.product_id !== action.payload) };
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(i =>
          i.product_id === action.payload.productId
            ? { ...i, quantity: action.payload.quantity }
            : i
        ),
      };
    case 'CLEAR_CART':
      return { ...state, items: [], coupon: null };
    case 'SET_COUPON':
      return { ...state, coupon: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(cartReducer, {
    items: localCartService.getCart(),
    coupon: null,
    loading: false,
  });

  // Cargar carrito desde Supabase si hay sesión
  useEffect(() => {
    if (user) {
      dispatch({ type: 'SET_LOADING', payload: true });
      cartService.getCart(user.id)
        .then(items => dispatch({ type: 'SET_ITEMS', payload: items }))
        .catch(console.error)
        .finally(() => dispatch({ type: 'SET_LOADING', payload: false }));
    } else {
      // Cargar desde localStorage cuando no hay sesión
      const localItems = localCartService.getCart();
      dispatch({ type: 'SET_ITEMS', payload: localItems });
      
      // Cargar cupón guardado en localStorage
      const savedCoupon = localStorage.getItem('coupon');
      if (savedCoupon) {
        try {
          const coupon = JSON.parse(savedCoupon);
          dispatch({ type: 'SET_COUPON', payload: coupon });
        } catch (e) {
          console.error('Error parsing saved coupon:', e);
          localStorage.removeItem('coupon');
        }
      }
    }
  }, [user]);

  // Persistir en localStorage cuando no hay sesión
  useEffect(() => {
    if (!user) {
      localCartService.saveCart(state.items);
      // También guardar el cupón en localStorage
      if (state.coupon) {
        localStorage.setItem('coupon', JSON.stringify(state.coupon));
      } else {
        localStorage.removeItem('coupon');
      }
    }
  }, [state.items, state.coupon, user]);

const addToCart = (product: Product, quantity = 1) => {
     const item: CartItem = {
       id: Date.now(),
       user_id: user?.id || '',
       session_id: undefined,
       product_id: product.id,
       product,
       quantity,
       price: product.price,
       created_at: new Date().toISOString(),
     };
     dispatch({ type: 'ADD_ITEM', payload: item });
 
     if (user) {
       cartService.upsertItem(user.id, product.id, quantity, product.price).catch(console.error);
     }
   };

  const removeFromCart = (productId: number) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId });
    if (user) {
      cartService.removeItem(user.id, productId).catch(console.error);
    }
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity < 1) return;
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
    if (user) {
      cartService.updateQuantity(user.id, productId, quantity).catch(console.error);
    }
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
    if (user) {
      cartService.clearCart(user.id).catch(console.error);
    } else {
      localCartService.clearCart();
    }
  };

  const applyCoupon = async (code: string): Promise<boolean> => {
    try {
      const validation = await couponService.validateCoupon(
        code, 
        user?.id ?? null, 
        subtotal, 
        state.items.map(item => ({
          product_id: item.product_id,
          category_id: item.product.category_id || 0
        }))
      );
      
      if (validation.valid) {
        dispatch({ type: 'SET_COUPON', payload: validation.coupon });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error applying coupon:', error);
      return false;
    }
  };

  const removeCoupon = () => dispatch({ type: 'SET_COUPON', payload: null });

  const isInCart = (productId: number) => state.items.some(i => i.product_id === productId);

  // Cálculos
  const subtotal = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = subtotal >= 100 ? 0 : 15;
  const tax = subtotal * 0.16;
  const discount = state.coupon ? (
    state.coupon.type === 'percentage'
      ? subtotal * (state.coupon.discount / 100)
      : state.coupon.discount
  ) : 0;
  const total = subtotal + shipping + tax - discount;
  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        itemCount,
        subtotal,
        shipping,
        tax,
        discount,
        total,
        coupon: state.coupon,
        loading: state.loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart debe usarse dentro de CartProvider');
  return context;
};
