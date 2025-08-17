// Archivo generado automáticamente - Sistema TV a la Carta
// Contexto administrativo con configuración actual aplicada
// Última modificación: 2025-08-17T19:29:10.517Z
// IMPORTANTE: Este archivo contiene la configuración sincronizada del panel de control

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { DEFAULT_ADMIN_CONFIG } from '../types/admin';
import type { AdminConfig, AdminState, AdminAction, AdminContextType, NovelasConfig, DeliveryZoneConfig } from '../types/admin';

const AdminContext = createContext<AdminContextType | undefined>(undefined);

function adminReducer(state: AdminState, action: AdminAction): AdminState {
  switch (action.type) {
    case 'LOG_IN':
      return { ...state, isAuthenticated: true };
    case 'LOG_OUT':
      return { ...state, isAuthenticated: false };
    case 'UPDATE_PRICING':
      const newConfig = { ...state.config, pricing: action.payload };
      localStorage.setItem('adminConfig', JSON.stringify(newConfig));
      return { ...state, config: newConfig };
    case 'ADD_NOVELA':
      const novelaWithId = { ...action.payload, id: Date.now() };
      const configWithNovela = { 
        ...state.config, 
        novelas: [...state.config.novelas, novelaWithId] 
      };
      localStorage.setItem('adminConfig', JSON.stringify(configWithNovela));
      return { ...state, config: configWithNovela };
    case 'UPDATE_NOVELA':
      const updatedNovelas = state.config.novelas.map(novela =>
        novela.id === action.payload.id ? { ...novela, ...action.payload } : novela
      );
      const configWithUpdatedNovela = { ...state.config, novelas: updatedNovelas };
      localStorage.setItem('adminConfig', JSON.stringify(configWithUpdatedNovela));
      return { ...state, config: configWithUpdatedNovela };
    case 'DELETE_NOVELA':
      const filteredNovelas = state.config.novelas.filter(novela => novela.id !== action.payload);
      const configWithoutNovela = { ...state.config, novelas: filteredNovelas };
      localStorage.setItem('adminConfig', JSON.stringify(configWithoutNovela));
      return { ...state, config: configWithoutNovela };
    case 'ADD_DELIVERY_ZONE':
      const zoneWithId = { ...action.payload, id: Date.now() };
      const configWithZone = { 
        ...state.config, 
        deliveryZones: [...state.config.deliveryZones, zoneWithId] 
      };
      localStorage.setItem('adminConfig', JSON.stringify(configWithZone));
      return { ...state, config: configWithZone };
    case 'UPDATE_DELIVERY_ZONE':
      const updatedZones = state.config.deliveryZones.map(zone =>
        zone.id === action.payload.id ? { ...zone, ...action.payload } : zone
      );
      const configWithUpdatedZone = { ...state.config, deliveryZones: updatedZones };
      localStorage.setItem('adminConfig', JSON.stringify(configWithUpdatedZone));
      return { ...state, config: configWithUpdatedZone };
    case 'DELETE_DELIVERY_ZONE':
      const filteredZones = state.config.deliveryZones.filter(zone => zone.id !== action.payload);
      const configWithoutZone = { ...state.config, deliveryZones: filteredZones };
      localStorage.setItem('adminConfig', JSON.stringify(configWithoutZone));
      return { ...state, config: configWithoutZone };
    case 'LOAD_CONFIG':
      localStorage.setItem('adminConfig', JSON.stringify(action.payload));
      return { ...state, config: action.payload };
    default:
      return state;
  }
}

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(adminReducer, {
    isAuthenticated: false,
    config: DEFAULT_ADMIN_CONFIG
  });

  useEffect(() => {
    const savedConfig = localStorage.getItem('adminConfig');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        dispatch({ type: 'LOAD_CONFIG', payload: config });
      } catch (error) {
        console.error('Error loading admin config:', error);
        localStorage.setItem('adminConfig', JSON.stringify(DEFAULT_ADMIN_CONFIG));
      }
    } else {
      localStorage.setItem('adminConfig', JSON.stringify(DEFAULT_ADMIN_CONFIG));
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    if (username === 'admin' && password === 'admin123') {
      dispatch({ type: 'LOG_IN' });
      return true;
    }
    return false;
  };

  const logout = () => {
    dispatch({ type: 'LOG_OUT' });
  };

  const addNovela = (novela: Omit<NovelasConfig, 'id'>) => {
    dispatch({ type: 'ADD_NOVELA', payload: novela });
  };

  const updateNovela = (id: number, novela: Partial<NovelasConfig>) => {
    dispatch({ type: 'UPDATE_NOVELA', payload: { ...novela, id } as NovelasConfig });
  };

  const deleteNovela = (id: number) => {
    dispatch({ type: 'DELETE_NOVELA', payload: id });
  };

  const addDeliveryZone = (zone: Omit<DeliveryZoneConfig, 'id'>) => {
    dispatch({ type: 'ADD_DELIVERY_ZONE', payload: zone });
  };

  const updateDeliveryZone = (id: number, zone: Partial<DeliveryZoneConfig>) => {
    dispatch({ type: 'UPDATE_DELIVERY_ZONE', payload: { ...zone, id } as DeliveryZoneConfig });
  };

  const deleteDeliveryZone = (id: number) => {
    dispatch({ type: 'DELETE_DELIVERY_ZONE', payload: id });
  };

  const exportConfig = (): string => {
    const exportData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      config: state.config
    };
    return JSON.stringify(exportData, null, 2);
  };

  const importConfig = (configData: string): boolean => {
    try {
      const data = JSON.parse(configData);
      if (data.config && data.config.pricing && data.config.novelas && data.config.deliveryZones) {
        dispatch({ type: 'LOAD_CONFIG', payload: data.config });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing config:', error);
      return false;
    }
  };

  const resetToDefaults = () => {
    dispatch({ type: 'LOAD_CONFIG', payload: DEFAULT_ADMIN_CONFIG });
  };

  const showNotification = (message: string, type: 'success' | 'info' | 'warning' | 'error') => {
    console.log(`${type.toUpperCase()}: ${message}`);
  };

  const getCurrentConfig = (): AdminConfig => {
    return state.config;
  };

  const exportSystemFiles = () => {
    // Implementación de exportación de archivos del sistema
    console.log('Exportando archivos del sistema...');
  };

  return (
    <AdminContext.Provider value={{ 
      state, 
      dispatch, 
      login, 
      logout, 
      addNovela, 
      updateNovela, 
      deleteNovela, 
      addDeliveryZone, 
      updateDeliveryZone, 
      deleteDeliveryZone, 
      exportConfig, 
      importConfig, 
      resetToDefaults, 
      showNotification, 
      exportSystemFiles,
      getCurrentConfig
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
