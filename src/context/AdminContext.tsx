import React, { createContext, useContext, useReducer, useEffect } from 'react';

// ARCHIVO GENERADO AUTOMÁTICAMENTE - SINCRONIZADO CON PANEL DE CONTROL
// Última actualización: 2025-08-21T08:15:57.989Z

export interface PriceConfig {
  moviePrice: number;
  seriesPrice: number;
  transferFeePercentage: number;
  novelPricePerChapter: number;
}

export interface DeliveryZone {
  id: string;
  name: string;
  cost: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Novel {
  id: number;
  titulo: string;
  genero: string;
  capitulos: number;
  año: number;
  descripcion?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Configuración actual sincronizada desde el panel de control
const initialState = {
  isAuthenticated: false,
  prices: {
    "moviePrice": 80,
    "seriesPrice": 300,
    "transferFeePercentage": 15,
    "novelPricePerChapter": 5
},
  deliveryZones: [
    {
        "id": "1",
        "name": "Santiago de Cuba > Santiago de Cuba > Nuevo Vista Alegre",
        "cost": 100,
        "active": true,
        "createdAt": "2025-08-21T08:15:21.831Z",
        "updatedAt": "2025-08-21T08:15:21.831Z"
    },
    {
        "id": "2",
        "name": "Santiago de Cuba > Santiago de Cuba > Vista Alegre",
        "cost": 300,
        "active": true,
        "createdAt": "2025-08-21T08:15:21.831Z",
        "updatedAt": "2025-08-21T08:15:21.831Z"
    }
],
  novels: [],
  systemFiles: [],
  notifications: [],
  lastBackup: null
};

// Implementación completa del AdminContext...
export function AdminProvider({ children }: { children: React.ReactNode }) {
  // Implementación sincronizada con datos actuales
  return (
    <AdminContext.Provider value={{
      state: initialState,
      // ... métodos sincronizados
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}