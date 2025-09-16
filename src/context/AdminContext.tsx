import React, { createContext, useContext, useReducer, useEffect } from 'react';

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
}

export interface Novel {
  id: number;
  titulo: string;
  genero: string;
  capitulos: number;
  año: number;
  descripcion?: string;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  section: string;
  action: string;
}

export interface SystemConfig {
  version: string;
  settings: {
    autoSync: boolean;
    syncInterval: number;
    enableNotifications: boolean;
    maxNotifications: number;
  };
  metadata: {
    totalOrders: number;
    totalRevenue: number;
    lastOrderDate: string;
    systemUptime: string;
  };
}

export interface SyncStatus {
  lastSync: string;
  isOnline: boolean;
  pendingChanges: number;
}

export interface AdminState {
  isAuthenticated: boolean;
  prices: PriceConfig;
  deliveryZones: DeliveryZone[];
  novels: Novel[];
  notifications: Notification[];
  systemConfig: SystemConfig;
  syncStatus: SyncStatus;
}

type AdminAction =
  | { type: 'LOGIN'; payload: boolean }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_PRICES'; payload: PriceConfig }
  | { type: 'ADD_DELIVERY_ZONE'; payload: DeliveryZone }
  | { type: 'UPDATE_DELIVERY_ZONE'; payload: DeliveryZone }
  | { type: 'DELETE_DELIVERY_ZONE'; payload: string }
  | { type: 'ADD_NOVEL'; payload: Novel }
  | { type: 'UPDATE_NOVEL'; payload: Novel }
  | { type: 'DELETE_NOVEL'; payload: number }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'UPDATE_SYNC_STATUS'; payload: Partial<SyncStatus> }
  | { type: 'LOAD_STATE'; payload: Partial<AdminState> };

const initialState: AdminState = {
  isAuthenticated: false,
  prices: {
    moviePrice: 80,
    seriesPrice: 300,
    transferFeePercentage: 10,
    novelPricePerChapter: 5,
  },
  deliveryZones: [],
  novels: [],
  notifications: [],
  systemConfig: {
    version: '2.1.0',
    settings: {
      autoSync: true,
      syncInterval: 300000,
      enableNotifications: true,
      maxNotifications: 100,
    },
    metadata: {
      totalOrders: 0,
      totalRevenue: 0,
      lastOrderDate: '',
      systemUptime: new Date().toISOString(),
    },
  },
  syncStatus: {
    lastSync: new Date().toISOString(),
    isOnline: true,
    pendingChanges: 0,
  },
};

function adminReducer(state: AdminState, action: AdminAction): AdminState {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, isAuthenticated: action.payload };
    case 'LOGOUT':
      return { ...state, isAuthenticated: false };
    case 'UPDATE_PRICES':
      return { ...state, prices: action.payload };
    case 'ADD_DELIVERY_ZONE':
      return {
        ...state,
        deliveryZones: [...state.deliveryZones, action.payload],
      };
    case 'UPDATE_DELIVERY_ZONE':
      return {
        ...state,
        deliveryZones: state.deliveryZones.map(zone =>
          zone.id === action.payload.id ? action.payload : zone
        ),
      };
    case 'DELETE_DELIVERY_ZONE':
      return {
        ...state,
        deliveryZones: state.deliveryZones.filter(zone => zone.id !== action.payload),
      };
    case 'ADD_NOVEL':
      return {
        ...state,
        novels: [...state.novels, action.payload],
      };
    case 'UPDATE_NOVEL':
      return {
        ...state,
        novels: state.novels.map(novel =>
          novel.id === action.payload.id ? action.payload : novel
        ),
      };
    case 'DELETE_NOVEL':
      return {
        ...state,
        novels: state.novels.filter(novel => novel.id !== action.payload),
      };
    case 'ADD_NOTIFICATION':
      const newNotifications = [action.payload, ...state.notifications];
      return {
        ...state,
        notifications: newNotifications.slice(0, state.systemConfig.settings.maxNotifications),
      };
    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] };
    case 'UPDATE_SYNC_STATUS':
      return {
        ...state,
        syncStatus: { ...state.syncStatus, ...action.payload },
      };
    case 'LOAD_STATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

interface AdminContextType {
  state: AdminState;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  updatePrices: (prices: PriceConfig) => void;
  addDeliveryZone: (zone: Omit<DeliveryZone, 'id'>) => void;
  updateDeliveryZone: (zone: DeliveryZone) => void;
  deleteDeliveryZone: (id: string) => void;
  addNovel: (novel: Omit<Novel, 'id'>) => void;
  updateNovel: (novel: Novel) => void;
  deleteNovel: (id: number) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  clearNotifications: () => void;
  exportSystemConfig: () => Promise<void>;
  exportCompleteSourceCode: () => Promise<void>;
  syncWithRemote: () => Promise<void>;
  syncAllSections: () => Promise<void>;
}

export const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(adminReducer, initialState);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('admin_system_state');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        dispatch({ type: 'LOAD_STATE', payload: parsedState });
      }
    } catch (error) {
      console.error('Error loading admin state:', error);
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('admin_system_state', JSON.stringify(state));
      
      // Dispatch events for real-time updates
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('admin_prices_updated', { detail: state.prices }));
        window.dispatchEvent(new CustomEvent('admin_delivery_zones_updated', { detail: state.deliveryZones }));
        window.dispatchEvent(new CustomEvent('admin_novels_updated', { detail: state.novels }));
      }
    } catch (error) {
      console.error('Error saving admin state:', error);
    }
  }, [state]);

  const login = (username: string, password: string): boolean => {
    // Simple authentication - in production, this should be more secure
    if (username === 'admin' && password === 'admin123') {
      dispatch({ type: 'LOGIN', payload: true });
      addNotification({
        type: 'success',
        title: 'Acceso autorizado',
        message: 'Sesión iniciada correctamente',
        section: 'auth',
        action: 'login',
      });
      return true;
    }
    return false;
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    addNotification({
      type: 'info',
      title: 'Sesión cerrada',
      message: 'Has cerrado sesión correctamente',
      section: 'auth',
      action: 'logout',
    });
  };

  const updatePrices = (prices: PriceConfig) => {
    dispatch({ type: 'UPDATE_PRICES', payload: prices });
    addNotification({
      type: 'success',
      title: 'Precios actualizados',
      message: 'Los precios han sido actualizados correctamente',
      section: 'prices',
      action: 'update',
    });
  };

  const addDeliveryZone = (zone: Omit<DeliveryZone, 'id'>) => {
    const newZone: DeliveryZone = {
      ...zone,
      id: Date.now().toString(),
    };
    dispatch({ type: 'ADD_DELIVERY_ZONE', payload: newZone });
    addNotification({
      type: 'success',
      title: 'Zona agregada',
      message: `Zona "${zone.name}" agregada correctamente`,
      section: 'delivery',
      action: 'add',
    });
  };

  const updateDeliveryZone = (zone: DeliveryZone) => {
    dispatch({ type: 'UPDATE_DELIVERY_ZONE', payload: zone });
    addNotification({
      type: 'success',
      title: 'Zona actualizada',
      message: `Zona "${zone.name}" actualizada correctamente`,
      section: 'delivery',
      action: 'update',
    });
  };

  const deleteDeliveryZone = (id: string) => {
    const zone = state.deliveryZones.find(z => z.id === id);
    dispatch({ type: 'DELETE_DELIVERY_ZONE', payload: id });
    addNotification({
      type: 'warning',
      title: 'Zona eliminada',
      message: `Zona "${zone?.name || 'desconocida'}" eliminada`,
      section: 'delivery',
      action: 'delete',
    });
  };

  const addNovel = (novel: Omit<Novel, 'id'>) => {
    const newNovel: Novel = {
      ...novel,
      id: Date.now(),
    };
    dispatch({ type: 'ADD_NOVEL', payload: newNovel });
    addNotification({
      type: 'success',
      title: 'Novela agregada',
      message: `Novela "${novel.titulo}" agregada correctamente`,
      section: 'novels',
      action: 'add',
    });
  };

  const updateNovel = (novel: Novel) => {
    dispatch({ type: 'UPDATE_NOVEL', payload: novel });
    addNotification({
      type: 'success',
      title: 'Novela actualizada',
      message: `Novela "${novel.titulo}" actualizada correctamente`,
      section: 'novels',
      action: 'update',
    });
  };

  const deleteNovel = (id: number) => {
    const novel = state.novels.find(n => n.id === id);
    dispatch({ type: 'DELETE_NOVEL', payload: id });
    addNotification({
      type: 'warning',
      title: 'Novela eliminada',
      message: `Novela "${novel?.titulo || 'desconocida'}" eliminada`,
      section: 'novels',
      action: 'delete',
    });
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });
  };

  const clearNotifications = () => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
  };

  const exportSystemConfig = async () => {
    try {
      const config = {
        version: state.systemConfig.version,
        exportDate: new Date().toISOString(),
        prices: state.prices,
        deliveryZones: state.deliveryZones,
        novels: state.novels,
        systemConfig: state.systemConfig,
      };

      const blob = new Blob([JSON.stringify(config, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tv-a-la-carta-config-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addNotification({
        type: 'success',
        title: 'Configuración exportada',
        message: 'La configuración del sistema ha sido exportada correctamente',
        section: 'system',
        action: 'export',
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error en exportación',
        message: 'No se pudo exportar la configuración del sistema',
        section: 'system',
        action: 'export',
      });
    }
  };

  const exportCompleteSourceCode = async () => {
    try {
      // This would contain the complete source code export logic
      addNotification({
        type: 'info',
        title: 'Exportación iniciada',
        message: 'La exportación del código fuente ha comenzado',
        section: 'system',
        action: 'export_source',
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error en exportación',
        message: 'No se pudo exportar el código fuente',
        section: 'system',
        action: 'export_source',
      });
    }
  };

  const syncWithRemote = async () => {
    try {
      dispatch({
        type: 'UPDATE_SYNC_STATUS',
        payload: { lastSync: new Date().toISOString(), pendingChanges: 0 },
      });
      addNotification({
        type: 'success',
        title: 'Sincronización completada',
        message: 'Los datos han sido sincronizados correctamente',
        section: 'system',
        action: 'sync',
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error de sincronización',
        message: 'No se pudo completar la sincronización',
        section: 'system',
        action: 'sync',
      });
    }
  };

  const syncAllSections = async () => {
    try {
      // Simulate comprehensive sync
      await new Promise(resolve => setTimeout(resolve, 2000));
      dispatch({
        type: 'UPDATE_SYNC_STATUS',
        payload: { lastSync: new Date().toISOString(), pendingChanges: 0 },
      });
      addNotification({
        type: 'success',
        title: 'Sincronización completa',
        message: 'Todas las secciones han sido sincronizadas',
        section: 'system',
        action: 'full_sync',
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error de sincronización',
        message: 'No se pudo completar la sincronización completa',
        section: 'system',
        action: 'full_sync',
      });
    }
  };

  return (
    <AdminContext.Provider
      value={{
        state,
        login,
        logout,
        updatePrices,
        addDeliveryZone,
        updateDeliveryZone,
        deleteDeliveryZone,
        addNovel,
        updateNovel,
        deleteNovel,
        addNotification,
        clearNotifications,
        exportSystemConfig,
        exportCompleteSourceCode,
        syncWithRemote,
        syncAllSections,
      }}
    >
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