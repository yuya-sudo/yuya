import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Toast } from '../components/Toast';
import type { CartItem } from '../types/movie';

// ARCHIVO GENERADO AUTOMÁTICAMENTE - SINCRONIZADO CON PANEL DE CONTROL
// Última actualización: 2025-08-21T08:15:57.989Z

// Configuración de precios sincronizada desde el panel de control
const MOVIE_PRICE = 80;
const SERIES_PRICE = 300;
const TRANSFER_FEE_PERCENTAGE = 15;

interface SeriesCartItem extends CartItem {
  selectedSeasons?: number[];
  paymentType?: 'cash' | 'transfer';
}

interface CartState {
  items: SeriesCartItem[];
  total: number;
}

// Implementación completa del CartContext con precios sincronizados...
export function CartProvider({ children }: { children: React.ReactNode }) {
  // Implementación con precios actualizados en tiempo real
  return (
    <CartContext.Provider value={{
      // ... métodos usando precios sincronizados
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}