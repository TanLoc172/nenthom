import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../api/client.js';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [], subtotal: 0, count: 0 });

  const refresh = useCallback(async () => {
    try {
      const r = await api.get('/cart');
      setCart(r.data);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem = async (productId, variantSku, quantity = 1) => {
    const r = await api.post('/cart/items', { productId, variantSku, quantity });
    setCart(r.data);
  };
  const updateItem = async (productId, variantSku, quantity) => {
    const r = await api.put('/cart/items', { productId, variantSku, quantity });
    setCart(r.data);
  };
  const removeItem = async (productId, variantSku) => {
    const r = await api.delete('/cart/items', { data: { productId, variantSku } });
    setCart(r.data);
  };
  const clear = async () => {
    const r = await api.delete('/cart');
    setCart(r.data);
  };

  return (
    <CartContext.Provider value={{ cart, refresh, addItem, updateItem, removeItem, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
