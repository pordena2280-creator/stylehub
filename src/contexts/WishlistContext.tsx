import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { wishlistService, localWishlistService } from '../services';
import { useAuth } from './AuthContext';
import type { WishlistItem, Product } from '../types';

// ============================================
// CONTEXTO DE WISHLIST
// ============================================

interface WishlistContextType {
  items: WishlistItem[];
  wishlistIds: number[];
  count: number;
  loading: boolean;
  toggleWishlist: (product: Product) => Promise<void>;
  isInWishlist: (productId: number) => boolean;
  clearWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  // Cargar wishlist al cambiar usuario
  useEffect(() => {
    if (user) {
      setLoading(true);
      wishlistService.getWishlist(user.id)
        .then(data => {
          setItems(data);
          setWishlistIds(data.map(i => i.product_id));
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setItems([]);
      setWishlistIds(localWishlistService.getIds());
    }
  }, [user]);

  const toggleWishlist = async (product: Product) => {
    if (user) {
      const isNowInWishlist = await wishlistService.toggleWishlist(user.id, product.id);
      if (isNowInWishlist) {
        const newItem: WishlistItem = {
          id: Date.now(),
          product_id: product.id,
          product,
          added_at: new Date().toISOString(),
        };
        setItems(prev => [newItem, ...prev]);
        setWishlistIds(prev => [...prev, product.id]);
      } else {
        setItems(prev => prev.filter(i => i.product_id !== product.id));
        setWishlistIds(prev => prev.filter(id => id !== product.id));
      }
    } else {
      const updated = localWishlistService.toggle(product.id);
      setWishlistIds(updated);
    }
  };

  const isInWishlist = (productId: number) => wishlistIds.includes(productId);

  const clearWishlist = async () => {
    if (user) {
      await wishlistService.clearWishlist(user.id);
    } else {
      localWishlistService.clear();
    }
    setItems([]);
    setWishlistIds([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        wishlistIds,
        count: wishlistIds.length,
        loading,
        toggleWishlist,
        isInWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist debe usarse dentro de WishlistProvider');
  return context;
};
