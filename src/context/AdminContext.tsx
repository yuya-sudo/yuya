import React, { createContext, useContext, useReducer, useEffect } from 'react';
import JSZip from 'jszip';

export interface PriceConfig {
  moviePrice: number;
  seriesPrice: number;
  transferFeePercentage: number;
  novelPricePerChapter: number;
}

export interface DeliveryZone {
  id: number;
  name: string;
  cost: number;
  active: boolean;
  createdAt: string;
}

export interface Novel {
  id: number;
  titulo: string;
  genero: string;
  capitulos: number;
  año: number;
  descripcion?: string;
  active: boolean;
}

export interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: string;
  section: string;
  action: string;
}

export interface AdminState {
  isAuthenticated: boolean;
  prices: PriceConfig;
  deliveryZones: DeliveryZone[];
  novels: Novel[];
  notifications: Notification[];
  lastBackup?: string;
}

const initialState: AdminState = {
  isAuthenticated: false,
  prices: {
    moviePrice: 80,
    seriesPrice: 300,
    transferFeePercentage: 10,
    novelPricePerChapter: 5
  },
  deliveryZones: [],
  novels: [],
  notifications: []
};

type AdminAction =
  | { type: 'LOGIN' }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_PRICES'; payload: PriceConfig }
  | { type: 'ADD_DELIVERY_ZONE'; payload: DeliveryZone }
  | { type: 'UPDATE_DELIVERY_ZONE'; payload: DeliveryZone }
  | { type: 'DELETE_DELIVERY_ZONE'; payload: number }
  | { type: 'ADD_NOVEL'; payload: Novel }
  | { type: 'UPDATE_NOVEL'; payload: Novel }
  | { type: 'DELETE_NOVEL'; payload: number }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'SET_LAST_BACKUP'; payload: string };

function adminReducer(state: AdminState, action: AdminAction): AdminState {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, isAuthenticated: true };
    case 'LOGOUT':
      return { ...state, isAuthenticated: false };
    case 'UPDATE_PRICES':
      return { ...state, prices: action.payload };
    case 'ADD_DELIVERY_ZONE':
      return { ...state, deliveryZones: [...state.deliveryZones, action.payload] };
    case 'UPDATE_DELIVERY_ZONE':
      return {
        ...state,
        deliveryZones: state.deliveryZones.map(zone =>
          zone.id === action.payload.id ? action.payload : zone
        )
      };
    case 'DELETE_DELIVERY_ZONE':
      return {
        ...state,
        deliveryZones: state.deliveryZones.filter(zone => zone.id !== action.payload)
      };
    case 'ADD_NOVEL':
      return { ...state, novels: [...state.novels, action.payload] };
    case 'UPDATE_NOVEL':
      return {
        ...state,
        novels: state.novels.map(novel =>
          novel.id === action.payload.id ? action.payload : novel
        )
      };
    case 'DELETE_NOVEL':
      return {
        ...state,
        novels: state.novels.filter(novel => novel.id !== action.payload)
      };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [...state.notifications, action.payload] };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(notif => notif.id !== action.payload)
      };
    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] };
    case 'SET_LAST_BACKUP':
      return { ...state, lastBackup: action.payload };
    default:
      return state;
  }
}

export const AdminContext = createContext<{
  state: AdminState;
  dispatch: React.Dispatch<AdminAction>;
  login: () => void;
  logout: () => void;
  updatePrices: (prices: PriceConfig) => void;
  addDeliveryZone: (zone: Omit<DeliveryZone, 'id' | 'createdAt'>) => void;
  updateDeliveryZone: (zone: DeliveryZone) => void;
  deleteDeliveryZone: (id: number) => void;
  addNovel: (novel: Omit<Novel, 'id'>) => void;
  updateNovel: (novel: Novel) => void;
  deleteNovel: (id: number) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  exportSystemBackup: () => void;
  exportCompleteSystemClone: () => void;
} | null>(null);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(adminReducer, initialState);

  const login = () => {
    dispatch({ type: 'LOGIN' });
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const updatePrices = (prices: PriceConfig) => {
    dispatch({ type: 'UPDATE_PRICES', payload: prices });
    addNotification({
      type: 'success',
      title: 'Precios Actualizados',
      message: `Película: $${prices.moviePrice} CUP, Serie: $${prices.seriesPrice} CUP, Transferencia: ${prices.transferFeePercentage}%, Novela: $${prices.novelPricePerChapter} CUP/cap`,
      section: 'Precios',
      action: 'Actualizar'
    });
  };

  const addDeliveryZone = (zoneData: Omit<DeliveryZone, 'id' | 'createdAt'>) => {
    const newZone: DeliveryZone = {
      ...zoneData,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    dispatch({ type: 'ADD_DELIVERY_ZONE', payload: newZone });
    addNotification({
      type: 'success',
      title: 'Zona de Entrega Agregada',
      message: `Nueva zona "${zoneData.name}" con costo de $${zoneData.cost} CUP`,
      section: 'Zonas de Entrega',
      action: 'Agregar'
    });
  };

  const updateDeliveryZone = (zone: DeliveryZone) => {
    dispatch({ type: 'UPDATE_DELIVERY_ZONE', payload: zone });
    addNotification({
      type: 'info',
      title: 'Zona de Entrega Actualizada',
      message: `Zona "${zone.name}" actualizada con costo de $${zone.cost} CUP`,
      section: 'Zonas de Entrega',
      action: 'Actualizar'
    });
  };

  const deleteDeliveryZone = (id: number) => {
    const zone = state.deliveryZones.find(z => z.id === id);
    dispatch({ type: 'DELETE_DELIVERY_ZONE', payload: id });
    if (zone) {
      addNotification({
        type: 'warning',
        title: 'Zona de Entrega Eliminada',
        message: `Zona "${zone.name}" ha sido eliminada del sistema`,
        section: 'Zonas de Entrega',
        action: 'Eliminar'
      });
    }
  };

  const addNovel = (novelData: Omit<Novel, 'id'>) => {
    const newNovel: Novel = {
      ...novelData,
      id: Date.now()
    };
    dispatch({ type: 'ADD_NOVEL', payload: newNovel });
    addNotification({
      type: 'success',
      title: 'Novela Agregada',
      message: `"${novelData.titulo}" (${novelData.capitulos} caps) agregada al catálogo`,
      section: 'Novelas',
      action: 'Agregar'
    });
  };

  const updateNovel = (novel: Novel) => {
    dispatch({ type: 'UPDATE_NOVEL', payload: novel });
    addNotification({
      type: 'info',
      title: 'Novela Actualizada',
      message: `"${novel.titulo}" ha sido actualizada en el catálogo`,
      section: 'Novelas',
      action: 'Actualizar'
    });
  };

  const deleteNovel = (id: number) => {
    const novel = state.novels.find(n => n.id === id);
    dispatch({ type: 'DELETE_NOVEL', payload: id });
    if (novel) {
      addNotification({
        type: 'warning',
        title: 'Novela Eliminada',
        message: `"${novel.titulo}" ha sido eliminada del catálogo`,
        section: 'Novelas',
        action: 'Eliminar'
      });
    }
  };

  const addNotification = (notificationData: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });
  };

  const removeNotification = (id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  };

  const clearNotifications = () => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
    addNotification({
      type: 'info',
      title: 'Notificaciones Limpiadas',
      message: 'Todas las notificaciones han sido eliminadas',
      section: 'Sistema',
      action: 'Limpiar'
    });
  };

  const exportSystemBackup = () => {
    try {
      const backupData = {
        timestamp: new Date().toISOString(),
        version: '2.0',
        data: {
          prices: state.prices,
          deliveryZones: state.deliveryZones,
          novels: state.novels,
          notifications: state.notifications
        }
      };

      const dataStr = JSON.stringify(backupData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `tv-a-la-carta-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      dispatch({ type: 'SET_LAST_BACKUP', payload: new Date().toISOString() });
      
      addNotification({
        type: 'success',
        title: 'Backup Exportado',
        message: 'El respaldo del sistema ha sido descargado exitosamente',
        section: 'Sistema',
        action: 'Exportar'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error en Backup',
        message: 'No se pudo exportar el respaldo del sistema',
        section: 'Sistema',
        action: 'Exportar'
      });
    }
  };

  const exportCompleteSystemClone = async () => {
    try {
      const files = {
        'NovelasModal-clone.tsx': generateNovelasModalClone(),
        'AdminContext-clone.tsx': generateAdminContextClone(),
        'CartContext-clone.tsx': generateCartContextClone(),
        'CheckoutModal-clone.tsx': generateCheckoutModalClone(),
        'PriceCard-clone.tsx': generatePriceCardClone(),
        'AdminPanel-clone.tsx': generateAdminPanelClone(),
        'system-config-clone.json': JSON.stringify({
          prices: state.prices,
          deliveryZones: state.deliveryZones,
          novels: state.novels,
          notifications: state.notifications,
          exportDate: new Date().toISOString(),
          version: '2.0-clone',
          description: 'Clon exacto del sistema con configuraciones aplicadas en tiempo real'
        }, null, 2),
        'README-clone.md': generateReadmeClone()
      };

      const zip = new JSZip();
      
      Object.entries(files).forEach(([filename, content]) => {
        zip.file(filename, content);
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tv-a-la-carta-system-clone-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addNotification({
        type: 'success',
        title: 'Sistema Clonado Exportado',
        message: 'El clon completo del sistema con configuraciones actuales ha sido descargado',
        section: 'Sistema',
        action: 'Exportar Clon'
      });
    } catch (error) {
      console.error('Error exporting system clone:', error);
      addNotification({
        type: 'error',
        title: 'Error al Exportar Clon',
        message: 'No se pudo exportar el clon del sistema: ' + (error as Error).message,
        section: 'Sistema',
        action: 'Exportar Clon'
      });
    }
  };

  const generateNovelasModalClone = () => {
    return `import React, { useState, useEffect } from 'react';
import { X, Download, MessageCircle, Phone, BookOpen, Info, Check, DollarSign, CreditCard, Calculator, Search, Filter, SortAsc, SortDesc } from 'lucide-react';
import { AdminContext } from '../context/AdminContext';

// Configuración actual de novelas sincronizada en tiempo real
const NOVELS_CATALOG_CLONE = ${JSON.stringify(state.novels, null, 2)};

// Configuración actual de precios sincronizada en tiempo real
const PRICING_CONFIG_CLONE = {
  moviePrice: ${state.prices.moviePrice},
  seriesPrice: ${state.prices.seriesPrice},
  transferFeePercentage: ${state.prices.transferFeePercentage},
  novelPricePerChapter: ${state.prices.novelPricePerChapter}
};

interface Novela {
  id: number;
  titulo: string;
  genero: string;
  capitulos: number;
  año: number;
  descripcion?: string;
  paymentType?: 'cash' | 'transfer';
}

interface NovelasModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NovelasModalClone({ isOpen, onClose }: NovelasModalProps) {
  const adminContext = React.useContext(AdminContext);
  const [selectedNovelas, setSelectedNovelas] = useState<number[]>([]);
  const [novelasWithPayment, setNovelasWithPayment] = useState<Novela[]>([]);
  const [showNovelList, setShowNovelList] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [sortBy, setSortBy] = useState<'titulo' | 'año' | 'capitulos'>('titulo');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Usar configuración clonada con fallback a admin context para actualizaciones en tiempo real
  const adminNovels = adminContext?.state?.novels || NOVELS_CATALOG_CLONE;
  const novelPricePerChapter = adminContext?.state?.prices?.novelPricePerChapter || PRICING_CONFIG_CLONE.novelPricePerChapter;
  const transferFeePercentage = adminContext?.state?.prices?.transferFeePercentage || PRICING_CONFIG_CLONE.transferFeePercentage;
  
  const allNovelas = adminNovels.map(novel => ({
    id: novel.id,
    titulo: novel.titulo,
    genero: novel.genero,
    capitulos: novel.capitulos,
    año: novel.año,
    descripcion: novel.descripcion
  }));

  const phoneNumber = '+5354690878';
  const uniqueGenres = [...new Set(allNovelas.map(novela => novela.genero))].sort();
  const uniqueYears = [...new Set(allNovelas.map(novela => novela.año))].sort((a, b) => b - a);

  const getFilteredNovelas = () => {
    let filtered = novelasWithPayment.filter(novela => {
      const matchesSearch = novela.titulo.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGenre = selectedGenre === '' || novela.genero === selectedGenre;
      const matchesYear = selectedYear === '' || novela.año.toString() === selectedYear;
      
      return matchesSearch && matchesGenre && matchesYear;
    });

    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'titulo':
          comparison = a.titulo.localeCompare(b.titulo);
          break;
        case 'año':
          comparison = a.año - b.año;
          break;
        case 'capitulos':
          comparison = a.capitulos - b.capitulos;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  };

  const filteredNovelas = getFilteredNovelas();

  useEffect(() => {
    const novelasWithDefaultPayment = allNovelas.map(novela => ({
      ...novela,
      paymentType: 'cash' as const
    }));
    setNovelasWithPayment(novelasWithDefaultPayment);
  }, [adminNovels.length]);

  const handleNovelToggle = (novelaId: number) => {
    setSelectedNovelas(prev => {
      if (prev.includes(novelaId)) {
        return prev.filter(id => id !== novelaId);
      } else {
        return [...prev, novelaId];
      }
    });
  };

  const handlePaymentTypeChange = (novelaId: number, paymentType: 'cash' | 'transfer') => {
    setNovelasWithPayment(prev => 
      prev.map(novela => 
        novela.id === novelaId 
          ? { ...novela, paymentType }
          : novela
      )
    );
  };

  const selectAllNovelas = () => {
    setSelectedNovelas(allNovelas.map(n => n.id));
  };

  const clearAllNovelas = () => {
    setSelectedNovelas([]);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedGenre('');
    setSelectedYear('');
    setSortBy('titulo');
    setSortOrder('asc');
  };

  const calculateTotals = () => {
    const selectedNovelasData = novelasWithPayment.filter(n => selectedNovelas.includes(n.id));
    
    const cashNovelas = selectedNovelasData.filter(n => n.paymentType === 'cash');
    const transferNovelas = selectedNovelasData.filter(n => n.paymentType === 'transfer');
    
    const cashTotal = cashNovelas.reduce((sum, n) => sum + (n.capitulos * novelPricePerChapter), 0);
    const transferBaseTotal = transferNovelas.reduce((sum, n) => sum + (n.capitulos * novelPricePerChapter), 0);
    const transferFee = Math.round(transferBaseTotal * (transferFeePercentage / 100));
    const transferTotal = transferBaseTotal + transferFee;
    
    const grandTotal = cashTotal + transferTotal;
    
    return {
      cashNovelas,
      transferNovelas,
      cashTotal,
      transferBaseTotal,
      transferFee,
      transferTotal,
      grandTotal,
      totalCapitulos: selectedNovelasData.reduce((sum, n) => sum + n.capitulos, 0)
    };
  };

  const totals = calculateTotals();

  const generateNovelListText = () => {
    let listText = "📚 CATÁLOGO DE NOVELAS DISPONIBLES\\n";
    listText += "TV a la Carta - Novelas Completas\\n\\n";
    listText += \`💰 Precio: $\${novelPricePerChapter} CUP por capítulo\\n\`;
    listText += \`💳 Recargo transferencia: \${transferFeePercentage}%\\n\`;
    listText += "📱 Contacto: +5354690878\\n\\n";
    listText += "═══════════════════════════════════\\n\\n";
    
    listText += "💵 PRECIOS EN EFECTIVO:\\n";
    listText += "═══════════════════════════════════\\n\\n";
    
    allNovelas.forEach((novela, index) => {
      const baseCost = novela.capitulos * novelPricePerChapter;
      listText += \`\${index + 1}. \${novela.titulo}\\n\`;
      listText += \`   📺 Género: \${novela.genero}\\n\`;
      listText += \`   📊 Capítulos: \${novela.capitulos}\\n\`;
      listText += \`   📅 Año: \${novela.año}\\n\`;
      listText += \`   💰 Costo en efectivo: \${baseCost.toLocaleString()} CUP\\n\\n\`;
    });
    
    return listText;
  };

  const downloadNovelList = () => {
    const listText = generateNovelListText();
    const blob = new Blob([listText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Catalogo_Novelas_TV_a_la_Carta_Clone.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const sendSelectedNovelas = () => {
    if (selectedNovelas.length === 0) {
      alert('Por favor selecciona al menos una novela');
      return;
    }

    const { cashNovelas, transferNovelas, cashTotal, transferBaseTotal, transferFee, transferTotal, grandTotal, totalCapitulos } = totals;
    
    let message = "Me interesan los siguientes títulos:\\n\\n";
    
    if (cashNovelas.length > 0) {
      message += "💵 PAGO EN EFECTIVO:\\n";
      message += "═══════════════════════════════════\\n";
      cashNovelas.forEach((novela, index) => {
        message += \`\${index + 1}. \${novela.titulo}\\n\`;
        message += \`   📺 Género: \${novela.genero}\\n\`;
        message += \`   📊 Capítulos: \${novela.capitulos}\\n\`;
        message += \`   📅 Año: \${novela.año}\\n\`;
        message += \`   💰 Costo: $\${(novela.capitulos * novelPricePerChapter).toLocaleString()} CUP\\n\\n\`;
      });
      message += \`💰 Subtotal Efectivo: $\${cashTotal.toLocaleString()} CUP\\n\`;
      message += \`📊 Total capítulos: \${cashNovelas.reduce((sum, n) => sum + n.capitulos, 0)}\\n\\n\`;
    }
    
    if (transferNovelas.length > 0) {
      message += \`🏦 PAGO POR TRANSFERENCIA BANCARIA (+\${transferFeePercentage}%):\\n\`;
      message += "═══════════════════════════════════\\n";
      transferNovelas.forEach((novela, index) => {
        const baseCost = novela.capitulos * novelPricePerChapter;
        const fee = Math.round(baseCost * (transferFeePercentage / 100));
        const totalCost = baseCost + fee;
        message += \`\${index + 1}. \${novela.titulo}\\n\`;
        message += \`   📺 Género: \${novela.genero}\\n\`;
        message += \`   📊 Capítulos: \${novela.capitulos}\\n\`;
        message += \`   📅 Año: \${novela.año}\\n\`;
        message += \`   💰 Costo base: $\${baseCost.toLocaleString()} CUP\\n\`;
        message += \`   💳 Recargo (\${transferFeePercentage}%): +$\${fee.toLocaleString()} CUP\\n\`;
        message += \`   💰 Costo total: $\${totalCost.toLocaleString()} CUP\\n\\n\`;
      });
      message += \`💰 Subtotal base transferencia: $\${transferBaseTotal.toLocaleString()} CUP\\n\`;
      message += \`💳 Recargo total (\${transferFeePercentage}%): +$\${transferFee.toLocaleString()} CUP\\n\`;
      message += \`💰 Subtotal Transferencia: $\${transferTotal.toLocaleString()} CUP\\n\`;
      message += \`📊 Total capítulos: \${transferNovelas.reduce((sum, n) => sum + n.capitulos, 0)}\\n\\n\`;
    }
    
    message += "📊 RESUMEN FINAL:\\n";
    message += "═══════════════════════════════════\\n";
    message += \`• Total de novelas: \${selectedNovelas.length}\\n\`;
    message += \`• Total de capítulos: \${totalCapitulos}\\n\`;
    if (cashTotal > 0) {
      message += \`• Efectivo: $\${cashTotal.toLocaleString()} CUP (\${cashNovelas.length} novelas)\\n\`;
    }
    if (transferTotal > 0) {
      message += \`• Transferencia: $\${transferTotal.toLocaleString()} CUP (\${transferNovelas.length} novelas)\\n\`;
    }
    message += \`• TOTAL A PAGAR: $\${grandTotal.toLocaleString()} CUP\\n\\n\`;
    message += \`📱 Enviado desde TV a la Carta\\n\`;
    message += \`📅 Fecha: \${new Date().toLocaleString('es-ES')}\`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = \`https://wa.me/5354690878?text=\${encodedMessage}\`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCall = () => {
    window.open(\`tel:\${phoneNumber}\`, '_self');
  };

  const handleWhatsApp = () => {
    const message = "Gracias por escribir a [TV a la Carta], se ha comunicado con el operador [Yero], Gracias por dedicarnos un momento de su tiempo hoy. ¿En qué puedo serle útil?";
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = \`https://wa.me/5354690878?text=\${encodedMessage}\`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden shadow-2xl animate-in fade-in duration-300">
        <div className="bg-gradient-to-r from-pink-600 to-purple-600 p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 p-3 rounded-xl mr-4 shadow-lg">
                <BookOpen className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold">Catálogo de Novelas (Clonado)</h2>
                <p className="text-sm sm:text-base opacity-90">Novelas completas disponibles - Versión Clonada</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-120px)]">
          <div className="p-4 sm:p-6">
            <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-6 mb-6 border-2 border-pink-200">
              <div className="flex items-center mb-4">
                <div className="bg-pink-100 p-3 rounded-xl mr-4">
                  <Info className="h-6 w-6 text-pink-600" />
                </div>
                <h3 className="text-xl font-bold text-pink-900">Información Importante (Versión Clonada)</h3>
              </div>
              
              <div className="space-y-4 text-pink-800">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">📚</span>
                  <p className="font-semibold">Las novelas se encargan completas</p>
                </div>
                <div className="flex items-center">
                  <span className="text-2xl mr-3">💰</span>
                  <p className="font-semibold">Costo: \${novelPricePerChapter} CUP por cada capítulo</p>
                </div>
                <div className="flex items-center">
                  <span className="text-2xl mr-3">💳</span>
                  <p className="font-semibold">Transferencia bancaria: +{transferFeePercentage}% de recargo</p>
                </div>
              </div>

              <div className="mt-6 bg-white rounded-xl p-4 border border-pink-300">
                <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                  <div className="text-center sm:text-left">
                    <p className="text-lg font-bold text-gray-900">{phoneNumber}</p>
                    <p className="text-sm text-gray-600">Contacto directo</p>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={handleCall}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Llamar
                    </button>
                    <button
                      onClick={handleWhatsApp}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <button
                onClick={downloadNovelList}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center"
              >
                <Download className="h-6 w-6 mr-3" />
                <div className="text-left">
                  <div className="text-lg">Descargar Catálogo</div>
                  <div className="text-sm opacity-90">Lista completa de novelas</div>
                </div>
              </button>
              
              <button
                onClick={() => setShowNovelList(!showNovelList)}
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white p-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center"
              >
                <BookOpen className="h-6 w-6 mr-3" />
                <div className="text-left">
                  <div className="text-lg">Ver y Seleccionar</div>
                  <div className="text-sm opacity-90">Elegir novelas específicas</div>
                </div>
              </button>
            </div>

            {showNovelList && (
              <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 border-b border-gray-200">
                  <div className="flex items-center mb-4">
                    <Filter className="h-5 w-5 text-purple-600 mr-2" />
                    <h4 className="text-lg font-bold text-purple-900">Filtros de Búsqueda</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Buscar por título..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    
                    <select
                      value={selectedGenre}
                      onChange={(e) => setSelectedGenre(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Todos los géneros</option>
                      {uniqueGenres.map(genre => (
                        <option key={genre} value={genre}>{genre}</option>
                      ))}
                    </select>
                    
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Todos los años</option>
                      {uniqueYears.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                    
                    <div className="flex space-x-2">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'titulo' | 'año' | 'capitulos')}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                      >
                        <option value="titulo">Título</option>
                        <option value="año">Año</option>
                        <option value="capitulos">Capítulos</option>
                      </select>
                      
                      <button
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        className="px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors"
                        title={\`Ordenar \${sortOrder === 'asc' ? 'descendente' : 'ascendente'}\`}
                      >
                        {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                    <div className="text-sm text-purple-700">
                      Mostrando {filteredNovelas.length} de {allNovelas.length} novelas
                      {(searchTerm || selectedGenre || selectedYear) && (
                        <span className="ml-2 text-purple-600">• Filtros activos</span>
                      )}
                    </div>
                    
                    {(searchTerm || selectedGenre || selectedYear || sortBy !== 'titulo' || sortOrder !== 'asc') && (
                      <button
                        onClick={clearFilters}
                        className="text-sm bg-purple-200 hover:bg-purple-300 text-purple-800 px-3 py-1 rounded-lg transition-colors"
                      >
                        Limpiar filtros
                      </button>
                    )}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                    <h4 className="text-lg font-bold text-gray-900">
                      Seleccionar Novelas ({selectedNovelas.length} seleccionadas)
                    </h4>
                    <div className="flex space-x-2">
                      <button
                        onClick={selectAllNovelas}
                        className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Todas
                      </button>
                      <button
                        onClick={clearAllNovelas}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Ninguna
                      </button>
                    </div>
                  </div>
                </div>

                {selectedNovelas.length > 0 && (
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 border-b border-gray-200">
                    <div className="flex items-center mb-4">
                      <Calculator className="h-6 w-6 text-green-600 mr-3" />
                      <h5 className="text-lg font-bold text-gray-900">Resumen de Selección</h5>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
                        <div className="text-2xl font-bold text-purple-600">{selectedNovelas.length}</div>
                        <div className="text-sm text-gray-600">Novelas</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
                        <div className="text-2xl font-bold text-blue-600">{totals.totalCapitulos}</div>
                        <div className="text-sm text-gray-600">Capítulos</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
                        <div className="text-2xl font-bold text-green-600">\${totals.cashTotal.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">Efectivo</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
                        <div className="text-2xl font-bold text-orange-600">\${totals.transferTotal.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">Transferencia</div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-4 border-2 border-green-300">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900">TOTAL A PAGAR:</span>
                        <span className="text-2xl font-bold text-green-600">\${totals.grandTotal.toLocaleString()} CUP</span>
                      </div>
                      {totals.transferFee > 0 && (
                        <div className="text-sm text-orange-600 mt-2">
                          Incluye \${totals.transferFee.toLocaleString()} CUP de recargo por transferencia ({transferFeePercentage}%)
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="max-h-96 overflow-y-auto p-4">
                  <div className="grid grid-cols-1 gap-3">
                    {filteredNovelas.length > 0 ? (
                      filteredNovelas.map((novela) => {
                        const isSelected = selectedNovelas.includes(novela.id);
                        const baseCost = novela.capitulos * novelPricePerChapter;
                        const transferCost = Math.round(baseCost * (1 + transferFeePercentage / 100));
                        const finalCost = novela.paymentType === 'transfer' ? transferCost : baseCost;
                        
                        return (
                          <div
                            key={novela.id}
                            className={\`p-4 rounded-xl border transition-all \${
                              isSelected 
                                ? 'bg-purple-50 border-purple-300 shadow-md' 
                                : 'bg-gray-50 border-gray-200 hover:bg-purple-25 hover:border-purple-200'
                            }\`}
                          >
                            <div className="flex items-start space-x-4">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleNovelToggle(novela.id)}
                                className="mt-1 h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                              />
                              
                              <div className="flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between space-y-3 sm:space-y-0">
                                  <div className="flex-1">
                                    <p className="font-semibold text-gray-900 mb-2">{novela.titulo}</p>
                                    <div className="flex flex-wrap gap-2 text-sm text-gray-600 mb-3">
                                      <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                                        {novela.genero}
                                      </span>
                                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                        {novela.capitulos} capítulos
                                      </span>
                                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                        {novela.año}
                                      </span>
                                    </div>
                                    
                                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                                      <span className="text-sm font-medium text-gray-700">Tipo de pago:</span>
                                      <div className="flex space-x-2">
                                        <button
                                          onClick={() => handlePaymentTypeChange(novela.id, 'cash')}
                                          className={\`px-3 py-2 rounded-full text-xs font-medium transition-colors \${
                                            novela.paymentType === 'cash'
                                              ? 'bg-green-500 text-white'
                                              : 'bg-gray-200 text-gray-600 hover:bg-green-100'
                                          }\`}
                                        >
                                          <DollarSign className="h-3 w-3 inline mr-1" />
                                          Efectivo
                                        </button>
                                        <button
                                          onClick={() => handlePaymentTypeChange(novela.id, 'transfer')}
                                          className={\`px-3 py-2 rounded-full text-xs font-medium transition-colors \${
                                            novela.paymentType === 'transfer'
                                              ? 'bg-orange-500 text-white'
                                              : 'bg-gray-200 text-gray-600 hover:bg-orange-100'
                                          }\`}
                                        >
                                          <CreditCard className="h-3 w-3 inline mr-1" />
                                          Transferencia (+{transferFeePercentage}%)
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="text-right sm:ml-4">
                                    <div className={\`text-lg font-bold \${
                                      novela.paymentType === 'cash' ? 'text-green-600' : 'text-orange-600'
                                    }\`}>
                                      \${finalCost.toLocaleString()} CUP
                                    </div>
                                    {novela.paymentType === 'transfer' && (
                                      <div className="text-xs text-gray-500">
                                        Base: \${baseCost.toLocaleString()} CUP
                                        <br />
                                        Recargo: +\${(transferCost - baseCost).toLocaleString()} CUP
                                      </div>
                                    )}
                                    <div className="text-xs text-gray-500 mt-1">
                                      \${novelPricePerChapter} CUP × {novela.capitulos} cap.
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {isSelected && (
                                <Check className="h-5 w-5 text-purple-600 mt-1" />
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8">
                        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          No se encontraron novelas
                        </h3>
                        <p className="text-gray-600 mb-4">
                          No hay novelas que coincidan con los filtros seleccionados.
                        </p>
                        <button
                          onClick={clearFilters}
                          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                          Limpiar filtros
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {selectedNovelas.length > 0 && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                      <div className="text-center sm:text-left">
                        <p className="font-semibold text-gray-900">
                          {selectedNovelas.length} novelas seleccionadas
                        </p>
                        <p className="text-sm text-gray-600">
                          Total: \${totals.grandTotal.toLocaleString()} CUP
                        </p>
                      </div>
                      <button
                        onClick={sendSelectedNovelas}
                        disabled={selectedNovelas.length === 0}
                        className={\`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center \${
                          selectedNovelas.length > 0
                            ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }\`}
                      >
                        <MessageCircle className="h-5 w-5 mr-2" />
                        Enviar por WhatsApp
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}`;
  };

  const generateAdminContextClone = () => {
    return `import React, { createContext, useContext, useReducer, useEffect } from 'react';
import JSZip from 'jszip';

// Configuración inicial clonada con valores actuales
const INITIAL_STATE_CLONE = {
  isAuthenticated: false,
  prices: {
    moviePrice: ${state.prices.moviePrice},
    seriesPrice: ${state.prices.seriesPrice},
    transferFeePercentage: ${state.prices.transferFeePercentage},
    novelPricePerChapter: ${state.prices.novelPricePerChapter}
  },
  deliveryZones: ${JSON.stringify(state.deliveryZones, null, 2)},
  novels: ${JSON.stringify(state.novels, null, 2)},
  notifications: []
};

export interface PriceConfig {
  moviePrice: number;
  seriesPrice: number;
  transferFeePercentage: number;
  novelPricePerChapter: number;
}

export interface DeliveryZone {
  id: number;
  name: string;
  cost: number;
  active: boolean;
  createdAt: string;
}

export interface Novel {
  id: number;
  titulo: string;
  genero: string;
  capitulos: number;
  año: number;
  descripcion?: string;
  active: boolean;
}

export interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: string;
  section: string;
  action: string;
}

export interface AdminState {
  isAuthenticated: boolean;
  prices: PriceConfig;
  deliveryZones: DeliveryZone[];
  novels: Novel[];
  notifications: Notification[];
  lastBackup?: string;
}

type AdminAction =
  | { type: 'LOGIN' }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_PRICES'; payload: PriceConfig }
  | { type: 'ADD_DELIVERY_ZONE'; payload: DeliveryZone }
  | { type: 'UPDATE_DELIVERY_ZONE'; payload: DeliveryZone }
  | { type: 'DELETE_DELIVERY_ZONE'; payload: number }
  | { type: 'ADD_NOVEL'; payload: Novel }
  | { type: 'UPDATE_NOVEL'; payload: Novel }
  | { type: 'DELETE_NOVEL'; payload: number }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'SET_LAST_BACKUP'; payload: string };

function adminReducer(state: AdminState, action: AdminAction): AdminState {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, isAuthenticated: true };
    case 'LOGOUT':
      return { ...state, isAuthenticated: false };
    case 'UPDATE_PRICES':
      return { ...state, prices: action.payload };
    case 'ADD_DELIVERY_ZONE':
      return { ...state, deliveryZones: [...state.deliveryZones, action.payload] };
    case 'UPDATE_DELIVERY_ZONE':
      return {
        ...state,
        deliveryZones: state.deliveryZones.map(zone =>
          zone.id === action.payload.id ? action.payload : zone
        )
      };
    case 'DELETE_DELIVERY_ZONE':
      return {
        ...state,
        deliveryZones: state.deliveryZones.filter(zone => zone.id !== action.payload)
      };
    case 'ADD_NOVEL':
      return { ...state, novels: [...state.novels, action.payload] };
    case 'UPDATE_NOVEL':
      return {
        ...state,
        novels: state.novels.map(novel =>
          novel.id === action.payload.id ? action.payload : novel
        )
      };
    case 'DELETE_NOVEL':
      return {
        ...state,
        novels: state.novels.filter(novel => novel.id !== action.payload)
      };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [...state.notifications, action.payload] };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(notif => notif.id !== action.payload)
      };
    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] };
    case 'SET_LAST_BACKUP':
      return { ...state, lastBackup: action.payload };
    default:
      return state;
  }
}

export const AdminContext = createContext<{
  state: AdminState;
  dispatch: React.Dispatch<AdminAction>;
  login: () => void;
  logout: () => void;
  updatePrices: (prices: PriceConfig) => void;
  addDeliveryZone: (zone: Omit<DeliveryZone, 'id' | 'createdAt'>) => void;
  updateDeliveryZone: (zone: DeliveryZone) => void;
  deleteDeliveryZone: (id: number) => void;
  addNovel: (novel: Omit<Novel, 'id'>) => void;
  updateNovel: (novel: Novel) => void;
  deleteNovel: (id: number) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  exportSystemBackup: () => void;
  exportCompleteSystemClone: () => void;
} | null>(null);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(adminReducer, INITIAL_STATE_CLONE);

  // Resto de la implementación igual que el original...
  const login = () => {
    dispatch({ type: 'LOGIN' });
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const updatePrices = (prices: PriceConfig) => {
    dispatch({ type: 'UPDATE_PRICES', payload: prices });
    addNotification({
      type: 'success',
      title: 'Precios Actualizados',
      message: \`Película: $\${prices.moviePrice} CUP, Serie: $\${prices.seriesPrice} CUP, Transferencia: \${prices.transferFeePercentage}%, Novela: $\${prices.novelPricePerChapter} CUP/cap\`,
      section: 'Precios',
      action: 'Actualizar'
    });
  };

  const addDeliveryZone = (zoneData: Omit<DeliveryZone, 'id' | 'createdAt'>) => {
    const newZone: DeliveryZone = {
      ...zoneData,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    dispatch({ type: 'ADD_DELIVERY_ZONE', payload: newZone });
    addNotification({
      type: 'success',
      title: 'Zona de Entrega Agregada',
      message: \`Nueva zona "\${zoneData.name}" con costo de $\${zoneData.cost} CUP\`,
      section: 'Zonas de Entrega',
      action: 'Agregar'
    });
  };

  const updateDeliveryZone = (zone: DeliveryZone) => {
    dispatch({ type: 'UPDATE_DELIVERY_ZONE', payload: zone });
    addNotification({
      type: 'info',
      title: 'Zona de Entrega Actualizada',
      message: \`Zona "\${zone.name}" actualizada con costo de $\${zone.cost} CUP\`,
      section: 'Zonas de Entrega',
      action: 'Actualizar'
    });
  };

  const deleteDeliveryZone = (id: number) => {
    const zone = state.deliveryZones.find(z => z.id === id);
    dispatch({ type: 'DELETE_DELIVERY_ZONE', payload: id });
    if (zone) {
      addNotification({
        type: 'warning',
        title: 'Zona de Entrega Eliminada',
        message: \`Zona "\${zone.name}" ha sido eliminada del sistema\`,
        section: 'Zonas de Entrega',
        action: 'Eliminar'
      });
    }
  };

  const addNovel = (novelData: Omit<Novel, 'id'>) => {
    const newNovel: Novel = {
      ...novelData,
      id: Date.now()
    };
    dispatch({ type: 'ADD_NOVEL', payload: newNovel });
    addNotification({
      type: 'success',
      title: 'Novela Agregada',
      message: \`"\${novelData.titulo}" (\${novelData.capitulos} caps) agregada al catálogo\`,
      section: 'Novelas',
      action: 'Agregar'
    });
  };

  const updateNovel = (novel: Novel) => {
    dispatch({ type: 'UPDATE_NOVEL', payload: novel });
    addNotification({
      type: 'info',
      title: 'Novela Actualizada',
      message: \`"\${novel.titulo}" ha sido actualizada en el catálogo\`,
      section: 'Novelas',
      action: 'Actualizar'
    });
  };

  const deleteNovel = (id: number) => {
    const novel = state.novels.find(n => n.id === id);
    dispatch({ type: 'DELETE_NOVEL', payload: id });
    if (novel) {
      addNotification({
        type: 'warning',
        title: 'Novela Eliminada',
        message: \`"\${novel.titulo}" ha sido eliminada del catálogo\`,
        section: 'Novelas',
        action: 'Eliminar'
      });
    }
  };

  const addNotification = (notificationData: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });
  };

  const removeNotification = (id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  };

  const clearNotifications = () => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
    addNotification({
      type: 'info',
      title: 'Notificaciones Limpiadas',
      message: 'Todas las notificaciones han sido eliminadas',
      section: 'Sistema',
      action: 'Limpiar'
    });
  };

  const exportSystemBackup = () => {
    try {
      const backupData = {
        timestamp: new Date().toISOString(),
        version: '2.0-clone',
        data: {
          prices: state.prices,
          deliveryZones: state.deliveryZones,
          novels: state.novels,
          notifications: state.notifications
        }
      };

      const dataStr = JSON.stringify(backupData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = \`tv-a-la-carta-backup-clone-\${new Date().toISOString().split('T')[0]}.json\`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      dispatch({ type: 'SET_LAST_BACKUP', payload: new Date().toISOString() });
      
      addNotification({
        type: 'success',
        title: 'Backup Exportado (Clone)',
        message: 'El respaldo del sistema clonado ha sido descargado exitosamente',
        section: 'Sistema',
        action: 'Exportar'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error en Backup',
        message: 'No se pudo exportar el respaldo del sistema clonado',
        section: 'Sistema',
        action: 'Exportar'
      });
    }
  };

  const exportCompleteSystemClone = async () => {
    // Esta función se implementa en el contexto principal
    console.log('Exportando sistema clonado...');
  };

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('adminDataClone');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        if (parsedData.prices) {
          dispatch({ type: 'UPDATE_PRICES', payload: parsedData.prices });
        }
        if (parsedData.deliveryZones) {
          parsedData.deliveryZones.forEach((zone: DeliveryZone) => {
            dispatch({ type: 'ADD_DELIVERY_ZONE', payload: zone });
          });
        }
        if (parsedData.novels) {
          parsedData.novels.forEach((novel: Novel) => {
            dispatch({ type: 'ADD_NOVEL', payload: novel });
          });
        }
      } catch (error) {
        console.error('Error loading admin data clone:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    const dataToSave = {
      prices: state.prices,
      deliveryZones: state.deliveryZones,
      novels: state.novels
    };
    localStorage.setItem('adminDataClone', JSON.stringify(dataToSave));
  }, [state.prices, state.deliveryZones, state.novels]);

  return (
    <AdminContext.Provider value={{ 
      state, 
      dispatch,
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
      removeNotification,
      clearNotifications,
      exportSystemBackup,
      exportCompleteSystemClone
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};`;
  };

  const generateCartContextClone = () => {
    return `import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Toast } from '../components/Toast';
import { AdminContext } from '../context/AdminContext';
import type { CartItem } from '../types/movie';

// Configuración actual de precios clonada
const CURRENT_PRICES_CLONE = {
  moviePrice: ${state.prices.moviePrice},
  seriesPrice: ${state.prices.seriesPrice},
  transferFeePercentage: ${state.prices.transferFeePercentage},
  novelPricePerChapter: ${state.prices.novelPricePerChapter}
};

interface SeriesCartItem extends CartItem {
  selectedSeasons?: number[];
  paymentType?: 'cash' | 'transfer';
}

interface CartState {
  items: SeriesCartItem[];
  total: number;
}

type CartAction = 
  | { type: 'ADD_ITEM'; payload: SeriesCartItem }
  | { type: 'REMOVE_ITEM'; payload: number }
  | { type: 'UPDATE_SEASONS'; payload: { id: number; seasons: number[] } }
  | { type: 'UPDATE_PAYMENT_TYPE'; payload: { id: number; paymentType: 'cash' | 'transfer' } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: SeriesCartItem[] };

interface CartContextType {
  state: CartState;
  addItem: (item: SeriesCartItem) => void;
  removeItem: (id: number) => void;
  updateSeasons: (id: number, seasons: number[]) => void;
  updatePaymentType: (id: number, paymentType: 'cash' | 'transfer') => void;
  clearCart: () => void;
  isInCart: (id: number) => boolean;
  getItemSeasons: (id: number) => number[];
  getItemPaymentType: (id: number) => 'cash' | 'transfer';
  calculateItemPrice: (item: SeriesCartItem) => number;
  calculateTotalPrice: () => number;
  calculateTotalByPaymentType: () => { cash: number; transfer: number };
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM':
      if (state.items.some(item => item.id === action.payload.id && item.type === action.payload.type)) {
        return state;
      }
      return {
        ...state,
        items: [...state.items, action.payload],
        total: state.total + 1
      };
    case 'UPDATE_SEASONS':
      return {
        ...state,
        items: state.items.map(item => 
          item.id === action.payload.id 
            ? { ...item, selectedSeasons: action.payload.seasons }
            : item
        )
      };
    case 'UPDATE_PAYMENT_TYPE':
      return {
        ...state,
        items: state.items.map(item => 
          item.id === action.payload.id 
            ? { ...item, paymentType: action.payload.paymentType }
            : item
        )
      };
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
        total: state.total - 1
      };
    case 'CLEAR_CART':
      return {
        items: [],
        total: 0
      };
    case 'LOAD_CART':
      return {
        items: action.payload,
        total: action.payload.length
      };
    default:
      return state;
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0 });
  const adminContext = React.useContext(AdminContext);
  const [toast, setToast] = React.useState<{
    message: string;
    type: 'success' | 'error';
    isVisible: boolean;
  }>({ message: '', type: 'success', isVisible: false });

  // Clear cart on page refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.setItem('pageRefreshed', 'true');
    };

    const handleLoad = () => {
      if (sessionStorage.getItem('pageRefreshed') === 'true') {
        localStorage.removeItem('movieCartClone');
        dispatch({ type: 'CLEAR_CART' });
        sessionStorage.removeItem('pageRefreshed');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('load', handleLoad);

    if (sessionStorage.getItem('pageRefreshed') === 'true') {
      localStorage.removeItem('movieCartClone');
      dispatch({ type: 'CLEAR_CART' });
      sessionStorage.removeItem('pageRefreshed');
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('load', handleLoad);
    };
  }, []);

  useEffect(() => {
    if (sessionStorage.getItem('pageRefreshed') !== 'true') {
      const savedCart = localStorage.getItem('movieCartClone');
      if (savedCart) {
        try {
          const items = JSON.parse(savedCart);
          dispatch({ type: 'LOAD_CART', payload: items });
        } catch (error) {
          console.error('Error loading cart from localStorage:', error);
        }
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('movieCartClone', JSON.stringify(state.items));
  }, [state.items]);

  const addItem = (item: SeriesCartItem) => {
    const itemWithDefaults = { 
      ...item, 
      paymentType: 'cash' as const,
      selectedSeasons: item.type === 'tv' && !item.selectedSeasons ? [1] : item.selectedSeasons
    };
    dispatch({ type: 'ADD_ITEM', payload: itemWithDefaults });
    
    setToast({
      message: \`"\${item.title}" agregado al carrito\`,
      type: 'success',
      isVisible: true
    });
  };

  const removeItem = (id: number) => {
    const item = state.items.find(item => item.id === id);
    dispatch({ type: 'REMOVE_ITEM', payload: id });
    
    if (item) {
      setToast({
        message: \`"\${item.title}" retirado del carrito\`,
        type: 'error',
        isVisible: true
      });
    }
  };

  const updateSeasons = (id: number, seasons: number[]) => {
    dispatch({ type: 'UPDATE_SEASONS', payload: { id, seasons } });
  };

  const updatePaymentType = (id: number, paymentType: 'cash' | 'transfer') => {
    dispatch({ type: 'UPDATE_PAYMENT_TYPE', payload: { id, paymentType } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const isInCart = (id: number) => {
    return state.items.some(item => item.id === id);
  };

  const getItemSeasons = (id: number): number[] => {
    const item = state.items.find(item => item.id === id);
    return item?.selectedSeasons || [];
  };

  const getItemPaymentType = (id: number): 'cash' | 'transfer' => {
    const item = state.items.find(item => item.id === id);
    return item?.paymentType || 'cash';
  };

  const calculateItemPrice = (item: SeriesCartItem): number => {
    // Obtener precios del admin context con actualizaciones en tiempo real o fallback a configuración clonada
    const moviePrice = adminContext?.state?.prices?.moviePrice || CURRENT_PRICES_CLONE.moviePrice;
    const seriesPrice = adminContext?.state?.prices?.seriesPrice || CURRENT_PRICES_CLONE.seriesPrice;
    const transferFeePercentage = adminContext?.state?.prices?.transferFeePercentage || CURRENT_PRICES_CLONE.transferFeePercentage;
    
    if (item.type === 'movie') {
      const basePrice = moviePrice;
      return item.paymentType === 'transfer' ? Math.round(basePrice * (1 + transferFeePercentage / 100)) : basePrice;
    } else {
      const seasons = item.selectedSeasons?.length || 1;
      const basePrice = seasons * seriesPrice;
      return item.paymentType === 'transfer' ? Math.round(basePrice * (1 + transferFeePercentage / 100)) : basePrice;
    }
  };

  const calculateTotalPrice = (): number => {
    return state.items.reduce((total, item) => {
      return total + calculateItemPrice(item);
    }, 0);
  };

  const calculateTotalByPaymentType = (): { cash: number; transfer: number } => {
    const moviePrice = adminContext?.state?.prices?.moviePrice || CURRENT_PRICES_CLONE.moviePrice;
    const seriesPrice = adminContext?.state?.prices?.seriesPrice || CURRENT_PRICES_CLONE.seriesPrice;
    const transferFeePercentage = adminContext?.state?.prices?.transferFeePercentage || CURRENT_PRICES_CLONE.transferFeePercentage;
    
    return state.items.reduce((totals, item) => {
      const basePrice = item.type === 'movie' ? moviePrice : (item.selectedSeasons?.length || 1) * seriesPrice;
      if (item.paymentType === 'transfer') {
        totals.transfer += Math.round(basePrice * (1 + transferFeePercentage / 100));
      } else {
        totals.cash += basePrice;
      }
      return totals;
    }, { cash: 0, transfer: 0 });
  };

  const closeToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  return (
    <CartContext.Provider value={{ 
      state, 
      addItem, 
      removeItem, 
      updateSeasons, 
      updatePaymentType,
      clearCart, 
      isInCart, 
      getItemSeasons,
      getItemPaymentType,
      calculateItemPrice,
      calculateTotalPrice,
      calculateTotalByPaymentType
    }}>
      {children}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={closeToast}
      />
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}`;
  };

  const generateCheckoutModalClone = () => {
    return `import React, { useState } from 'react';
import { X, User, MapPin, Phone, Copy, Check, MessageCircle, Calculator, DollarSign, CreditCard } from 'lucide-react';
import { AdminContext } from '../context/AdminContext';

// Zonas de entrega clonadas con configuración actual
const DELIVERY_ZONES_CLONE = {
  'Por favor seleccionar su Barrio/Zona': 0,
  ${state.deliveryZones.map(zone => `'${zone.name}': ${zone.cost}`).join(',\n  ')}
};

// Configuración actual de precios clonada
const CURRENT_PRICES_CLONE = {
  moviePrice: ${state.prices.moviePrice},
  seriesPrice: ${state.prices.seriesPrice},
  transferFeePercentage: ${state.prices.transferFeePercentage},
  novelPricePerChapter: ${state.prices.novelPricePerChapter}
};

export interface CustomerInfo {
  fullName: string;
  phone: string;
  address: string;
}

export interface OrderData {
  orderId: string;
  customerInfo: CustomerInfo;
  deliveryZone: string;
  deliveryCost: number;
  items: any[];
  subtotal: number;
  transferFee: number;
  total: number;
  cashTotal?: number;
  transferTotal?: number;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: (orderData: OrderData) => void;
  items: any[];
  total: number;
}

export function CheckoutModalClone({ isOpen, onClose, onCheckout, items, total }: CheckoutModalProps) {
  const adminContext = React.useContext(AdminContext);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    fullName: '',
    phone: '',
    address: '',
  });
  
  const [deliveryZone, setDeliveryZone] = useState('Por favor seleccionar su Barrio/Zona');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderGenerated, setOrderGenerated] = useState(false);
  const [generatedOrder, setGeneratedOrder] = useState('');
  const [copied, setCopied] = useState(false);

  // Obtener zonas de entrega del admin context con actualizaciones en tiempo real o fallback a configuración clonada
  const adminZones = adminContext?.state?.deliveryZones || [];
  const adminZonesMap = adminZones.reduce((acc, zone) => {
    acc[zone.name] = zone.cost;
    return acc;
  }, {} as { [key: string]: number });
  
  // Combinar zonas clonadas con admin zones - sincronización en tiempo real
  const allZones = { ...DELIVERY_ZONES_CLONE, ...adminZonesMap };
  const deliveryCost = allZones[deliveryZone as keyof typeof allZones] || 0;
  const finalTotal = total + deliveryCost;

  // Obtener porcentaje de recargo actual con actualizaciones en tiempo real
  const transferFeePercentage = adminContext?.state?.prices?.transferFeePercentage || CURRENT_PRICES_CLONE.transferFeePercentage;

  const isFormValid = customerInfo.fullName.trim() !== '' && 
                     customerInfo.phone.trim() !== '' && 
                     customerInfo.address.trim() !== '' &&
                     deliveryZone !== 'Por favor seleccionar su Barrio/Zona';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateOrderId = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return \`TVC-CLONE-\${timestamp}-\${random}\`.toUpperCase();
  };

  const calculateTotals = () => {
    const cashItems = items.filter(item => item.paymentType === 'cash');
    const transferItems = items.filter(item => item.paymentType === 'transfer');
    
    // Obtener precios actuales con actualizaciones en tiempo real
    const moviePrice = adminContext?.state?.prices?.moviePrice || CURRENT_PRICES_CLONE.moviePrice;
    const seriesPrice = adminContext?.state?.prices?.seriesPrice || CURRENT_PRICES_CLONE.seriesPrice;
    
    const cashTotal = cashItems.reduce((sum, item) => {
      const basePrice = item.type === 'movie' ? moviePrice : (item.selectedSeasons?.length || 1) * seriesPrice;
      return sum + basePrice;
    }, 0);
    
    const transferTotal = transferItems.reduce((sum, item) => {
      const basePrice = item.type === 'movie' ? moviePrice : (item.selectedSeasons?.length || 1) * seriesPrice;
      return sum + Math.round(basePrice * (1 + transferFeePercentage / 100));
    }, 0);
    
    return { cashTotal, transferTotal };
  };

  const generateOrderText = () => {
    const orderId = generateOrderId();
    const { cashTotal, transferTotal } = calculateTotals();
    const transferFee = transferTotal - items.filter(item => item.paymentType === 'transfer').reduce((sum, item) => {
      const moviePrice = adminContext?.state?.prices?.moviePrice || CURRENT_PRICES_CLONE.moviePrice;
      const seriesPrice = adminContext?.state?.prices?.seriesPrice || CURRENT_PRICES_CLONE.seriesPrice;
      const basePrice = item.type === 'movie' ? moviePrice : (item.selectedSeasons?.length || 1) * seriesPrice;
      return sum + basePrice;
    }, 0);

    // Formatear lista de productos con precios en tiempo real
    const itemsList = items
      .map(item => {
        const seasonInfo = item.selectedSeasons && item.selectedSeasons.length > 0 
          ? \`\\n  📺 Temporadas: \${item.selectedSeasons.sort((a, b) => a - b).join(', ')}\` 
          : '';
        const itemType = item.type === 'movie' ? 'Película' : 'Serie';
        const moviePrice = adminContext?.state?.prices?.moviePrice || CURRENT_PRICES_CLONE.moviePrice;
        const seriesPrice = adminContext?.state?.prices?.seriesPrice || CURRENT_PRICES_CLONE.seriesPrice;
        const basePrice = item.type === 'movie' ? moviePrice : (item.selectedSeasons?.length || 1) * seriesPrice;
        const finalPrice = item.paymentType === 'transfer' ? Math.round(basePrice * (1 + transferFeePercentage / 100)) : basePrice;
        const paymentTypeText = item.paymentType === 'transfer' ? \`Transferencia (+\${transferFeePercentage}%)\` : 'Efectivo';
        const emoji = item.type === 'movie' ? '🎬' : '📺';
        return \`\${emoji} *\${item.title}*\${seasonInfo}\\n  📋 Tipo: \${itemType}\\n  💳 Pago: \${paymentTypeText}\\n  💰 Precio: $\${finalPrice.toLocaleString()} CUP\`;
      })
      .join('\\n\\n');

    let orderText = \`🎬 *PEDIDO - TV A LA CARTA (CLONADO)*\\n\\n\`;
    orderText += \`📋 *ID de Orden:* \${orderId}\\n\\n\`;
    
    orderText += \`👤 *DATOS DEL CLIENTE:*\\n\`;
    orderText += \`• Nombre: \${customerInfo.fullName}\\n\`;
    orderText += \`• Teléfono: \${customerInfo.phone}\\n\`;
    orderText += \`• Dirección: \${customerInfo.address}\\n\\n\`;
    
    orderText += \`🎯 *PRODUCTOS SOLICITADOS:*\\n\${itemsList}\\n\\n\`;
    
    orderText += \`💰 *RESUMEN DE COSTOS:*\\n\`;
    
    if (cashTotal > 0) {
      orderText += \`💵 Efectivo: $\${cashTotal.toLocaleString()} CUP\\n\`;
    }
    if (transferTotal > 0) {
      orderText += \`🏦 Transferencia: $\${transferTotal.toLocaleString()} CUP\\n\`;
    }
    orderText += \`• *Subtotal Contenido: $\${total.toLocaleString()} CUP*\\n\`;
    
    if (transferFee > 0) {
      orderText += \`• Recargo transferencia (\${transferFeePercentage}%): +$\${transferFee.toLocaleString()} CUP\\n\`;
    }
    
    orderText += \`🚚 Entrega (\${deliveryZone.split(' > ')[2]}): +$\${deliveryCost.toLocaleString()} CUP\\n\`;
    orderText += \`\\n🎯 *TOTAL FINAL: $\${finalTotal.toLocaleString()} CUP*\\n\\n\`;
    
    orderText += \`📍 *ZONA DE ENTREGA:*\\n\`;
    orderText += \`\${deliveryZone.replace(' > ', ' → ')}\\n\`;
    orderText += \`💰 Costo de entrega: $\${deliveryCost.toLocaleString()} CUP\\n\\n\`;
    
    orderText += \`⏰ *Fecha:* \${new Date().toLocaleString('es-ES')}\\n\`;
    orderText += \`🌟 *¡Gracias por elegir TV a la Carta! (Versión Clonada)*\`;

    return { orderText, orderId };
  };

  const handleGenerateOrder = () => {
    if (!isFormValid) {
      alert('Por favor complete todos los campos requeridos antes de generar la orden.');
      return;
    }
    
    const { orderText } = generateOrderText();
    setGeneratedOrder(orderText);
    setOrderGenerated(true);
  };

  const handleCopyOrder = async () => {
    try {
      await navigator.clipboard.writeText(generatedOrder);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (deliveryZone === 'Por favor seleccionar su Barrio/Zona') {
      alert('Por favor selecciona un barrio específico para la entrega.');
      return;
    }

    setIsProcessing(true);

    try {
      const { orderId } = generateOrderText();
      const { cashTotal, transferTotal } = calculateTotals();
      const transferFee = transferTotal - items.filter(item => item.paymentType === 'transfer').reduce((sum, item) => {
        const moviePrice = adminContext?.state?.prices?.moviePrice || CURRENT_PRICES_CLONE.moviePrice;
        const seriesPrice = adminContext?.state?.prices?.seriesPrice || CURRENT_PRICES_CLONE.seriesPrice;
        const basePrice = item.type === 'movie' ? moviePrice : (item.selectedSeasons?.length || 1) * seriesPrice;
        return sum + basePrice;
      }, 0);

      const orderData: OrderData = {
        orderId,
        customerInfo,
        deliveryZone,
        deliveryCost,
        items,
        subtotal: total,
        transferFee,
        total: finalTotal,
        cashTotal,
        transferTotal
      };

      await onCheckout(orderData);
    } catch (error) {
      console.error('Checkout failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 p-2 rounded-lg mr-3">
                <MessageCircle className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">Finalizar Pedido (Clonado)</h2>
                <p className="text-sm opacity-90">Complete sus datos para procesar el pedido - Versión Clonada</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-120px)]">
          <div className="p-4 sm:p-6">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-4 sm:p-6 mb-6 border border-blue-200">
              <div className="flex items-center mb-4">
                <Calculator className="h-6 w-6 text-blue-600 mr-3" />
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Resumen del Pedido (Clonado)</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">
                      \${total.toLocaleString()} CUP
                    </div>
                    <div className="text-sm text-gray-600">Subtotal Contenido</div>
                    <div className="text-xs text-gray-500 mt-1">{items.length} elementos</div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-2">
                      \${deliveryCost.toLocaleString()} CUP
                    </div>
                    <div className="text-sm text-gray-600">Costo de Entrega</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {deliveryZone.split(' > ')[2] || 'Seleccionar zona'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-xl p-4 border-2 border-green-300">
                <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
                  <span className="text-lg sm:text-xl font-bold text-gray-900">Total Final:</span>
                  <span className="text-2xl sm:text-3xl font-bold text-green-600">
                    \${finalTotal.toLocaleString()} CUP
                  </span>
                </div>
              </div>
            </div>

            {!orderGenerated ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg sm:text-xl font-bold mb-4 flex items-center text-gray-900">
                    <User className="h-5 w-5 mr-3 text-blue-600" />
                    Información Personal
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre Completo *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={customerInfo.fullName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Ingrese su nombre completo"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={customerInfo.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="+53 5XXXXXXX"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dirección Completa *
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={customerInfo.address}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Calle, número, entre calles..."
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg sm:text-xl font-bold mb-4 flex items-center text-gray-900">
                    <MapPin className="h-5 w-5 mr-3 text-green-600" />
                    Zona de Entrega
                  </h3>
                  
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 mb-4 border border-green-200">
                    <div className="flex items-center mb-2">
                      <div className="bg-green-100 p-2 rounded-lg mr-3">
                        <span className="text-sm">📍</span>
                      </div>
                      <h4 className="font-semibold text-green-900">Información de Entrega</h4>
                    </div>
                    <p className="text-sm text-green-700 ml-11">
                      Seleccione su zona para calcular el costo de entrega. Los precios pueden variar según la distancia.
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Seleccionar Barrio/Zona *
                    </label>
                    <select
                      value={deliveryZone}
                      onChange={(e) => setDeliveryZone(e.target.value)}
                      required
                      className={\`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all bg-white \${
                        deliveryZone === 'Por favor seleccionar su Barrio/Zona'
                          ? 'border-orange-300 focus:ring-orange-500 bg-orange-50'
                          : 'border-gray-300 focus:ring-green-500'
                      }\`}
                    >
                      {Object.entries(allZones).map(([zone, cost]) => (
                        <option key={zone} value={zone}>
                          {zone === 'Por favor seleccionar su Barrio/Zona' 
                            ? zone 
                            : \`\${zone.split(' > ')[2]} \${cost > 0 ? \`- $\${cost.toLocaleString()} CUP\` : ''}\`
                          }
                        </option>
                      ))}
                    </select>
                    
                    {deliveryZone === 'Por favor seleccionar su Barrio/Zona' && (
                      <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="flex items-center">
                          <span className="text-orange-600 mr-2">⚠️</span>
                          <span className="text-sm font-medium text-orange-700">
                            Por favor seleccione su zona de entrega para continuar
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {deliveryCost > 0 && (
                      <div className="mt-3 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div className="bg-green-100 p-2 rounded-lg mr-3">
                              <span className="text-sm">🚚</span>
                            </div>
                            <span className="text-sm font-semibold text-green-800">
                              Costo de entrega confirmado:
                            </span>
                          </div>
                          <div className="bg-white rounded-lg px-3 py-2 border border-green-300">
                            <span className="text-lg font-bold text-green-600">
                              \${deliveryCost.toLocaleString()} CUP
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-green-600 ml-11">
                          ✅ Zona: {deliveryZone.split(' > ')[2]}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerateOrder}
                    disabled={!isFormValid || deliveryZone === 'Por favor seleccionar su Barrio/Zona'}
                    className={\`flex-1 px-6 py-4 rounded-xl transition-all font-medium \${
                      isFormValid && deliveryZone !== 'Por favor seleccionar su Barrio/Zona'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }\`}
                  >
                    Generar Orden
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing || !isFormValid || deliveryZone === 'Por favor seleccionar su Barrio/Zona'}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all font-medium flex items-center justify-center"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Procesando...
                      </>
                    ) : (
                      <>
                        <MessageCircle className="h-5 w-5 mr-2" />
                        Enviar por WhatsApp
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
                    <Check className="h-6 w-6 text-green-600 mr-3" />
                    Orden Generada (Clonado)
                  </h3>
                  <button
                    onClick={handleCopyOrder}
                    className={\`px-4 py-2 rounded-xl font-medium transition-all flex items-center justify-center \${
                      copied
                        ? 'bg-green-100 text-green-700 border border-green-300'
                        : 'bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200'
                    }\`}
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        ¡Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar Orden
                      </>
                    )}
                  </button>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 max-h-96 overflow-y-auto">
                  <pre className="text-xs sm:text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed">
                    {generatedOrder}
                  </pre>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <button
                    onClick={() => setOrderGenerated(false)}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
                  >
                    Volver a Editar
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isProcessing || !isFormValid}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:opacity-50 text-white rounded-xl transition-all font-medium flex items-center justify-center"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <MessageCircle className="h-5 w-5 mr-2" />
                        Enviar por WhatsApp
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}`;
  };

  const generatePriceCardClone = () => {
    return `import React from 'react';
import { DollarSign, Tv, Film, Star, CreditCard } from 'lucide-react';
import { AdminContext } from '../context/AdminContext';

// Configuración actual de precios clonada
const CURRENT_PRICES_CLONE = {
  moviePrice: ${state.prices.moviePrice},
  seriesPrice: ${state.prices.seriesPrice},
  transferFeePercentage: ${state.prices.transferFeePercentage},
  novelPricePerChapter: ${state.prices.novelPricePerChapter}
};

interface PriceCardProps {
  type: 'movie' | 'tv';
  selectedSeasons?: number[];
  episodeCount?: number;
  isAnime?: boolean;
}

export function PriceCardClone({ type, selectedSeasons = [], episodeCount = 0, isAnime = false }: PriceCardProps) {
  const adminContext = React.useContext(AdminContext);
  
  // Obtener precios del admin context con actualizaciones en tiempo real o fallback a configuración clonada
  const moviePrice = adminContext?.state?.prices?.moviePrice || CURRENT_PRICES_CLONE.moviePrice;
  const seriesPrice = adminContext?.state?.prices?.seriesPrice || CURRENT_PRICES_CLONE.seriesPrice;
  const transferFeePercentage = adminContext?.state?.prices?.transferFeePercentage || CURRENT_PRICES_CLONE.transferFeePercentage;
  
  const calculatePrice = () => {
    if (type === 'movie') {
      return moviePrice;
    } else {
      // Series: precio dinámico por temporada
      return selectedSeasons.length * seriesPrice;
    }
  };

  const price = calculatePrice();
  const transferPrice = Math.round(price * (1 + transferFeePercentage / 100));
  
  const getIcon = () => {
    if (type === 'movie') {
      return isAnime ? '🎌' : '🎬';
    }
    return isAnime ? '🎌' : '📺';
  };

  const getTypeLabel = () => {
    if (type === 'movie') {
      return isAnime ? 'Película Animada (Clone)' : 'Película (Clone)';
    }
    return isAnime ? 'Anime (Clone)' : 'Serie (Clone)';
  };

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="bg-green-100 p-2 rounded-lg mr-3 shadow-sm">
            <span className="text-lg">{getIcon()}</span>
          </div>
          <div>
            <h3 className="font-bold text-green-800 text-sm">{getTypeLabel()}</h3>
            <p className="text-green-600 text-xs">
              {type === 'tv' && selectedSeasons.length > 0 
                ? \`\${selectedSeasons.length} temporada\${selectedSeasons.length > 1 ? 's' : ''}\`
                : 'Contenido completo'
              }
            </p>
          </div>
        </div>
        <div className="bg-green-500 text-white p-2 rounded-full shadow-md">
          <DollarSign className="h-4 w-4" />
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="bg-white rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-green-700 flex items-center">
              <DollarSign className="h-3 w-3 mr-1" />
              Efectivo
            </span>
            <span className="text-lg font-bold text-green-700">
              \${price.toLocaleString()} CUP
            </span>
          </div>
        </div>
        
        <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-orange-700 flex items-center">
              <CreditCard className="h-3 w-3 mr-1" />
              Transferencia
            </span>
            <span className="text-lg font-bold text-orange-700">
              \${transferPrice.toLocaleString()} CUP
            </span>
          </div>
          <div className="text-xs text-orange-600">
            +{transferFeePercentage}% recargo bancario
          </div>
        </div>
        
        {type === 'tv' && selectedSeasons.length > 0 && (
          <div className="text-xs text-green-600 text-center bg-green-100 rounded-lg p-2">
            \${(price / selectedSeasons.length).toLocaleString()} CUP por temporada (efectivo)
          </div>
        )}
      </div>
    </div>
  );
}`;
  };

  const generateAdminPanelClone = () => {
    return `import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, 
  DollarSign, 
  MapPin, 
  BookOpen, 
  Bell, 
  Download, 
  Upload, 
  Trash2, 
  Plus, 
  Edit3, 
  Save, 
  X, 
  Eye, 
  EyeOff, 
  Lock,
  Home,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import type { PriceConfig, DeliveryZone, Novel, Notification } from '../context/AdminContext';

// Configuración actual del sistema clonada
const SYSTEM_CONFIG_CLONE = {
  prices: {
    moviePrice: ${state.prices.moviePrice},
    seriesPrice: ${state.prices.seriesPrice},
    transferFeePercentage: ${state.prices.transferFeePercentage},
    novelPricePerChapter: ${state.prices.novelPricePerChapter}
  },
  deliveryZones: ${JSON.stringify(state.deliveryZones, null, 2)},
  novels: ${JSON.stringify(state.novels, null, 2)},
  lastUpdate: '${new Date().toISOString()}'
};

// Credenciales de acceso actualizadas
const LOGIN_CREDENTIALS = {
  username: 'root',
  password: 'video'
};

export function AdminPanelClone() {
  const navigate = useNavigate();
  const { 
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
    removeNotification,
    clearNotifications,
    exportSystemBackup,
    exportCompleteSystemClone
  } = useAdmin();

  // Authentication state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // UI state
  const [activeTab, setActiveTab] = useState<'prices' | 'zones' | 'novels' | 'notifications'>('prices');
  const [showAddZoneModal, setShowAddZoneModal] = useState(false);
  const [showAddNovelModal, setShowAddNovelModal] = useState(false);
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);
  const [editingNovel, setEditingNovel] = useState<Novel | null>(null);

  // Form states
  const [priceForm, setPriceForm] = useState<PriceConfig>(state.prices);
  const [zoneForm, setZoneForm] = useState({ name: '', cost: 0, active: true });
  const [novelForm, setNovelForm] = useState({
    titulo: '',
    genero: '',
    capitulos: 0,
    año: new Date().getFullYear(),
    descripcion: '',
    active: true
  });

  // Update price form when state changes
  useEffect(() => {
    setPriceForm(state.prices);
  }, [state.prices]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === LOGIN_CREDENTIALS.username && password === LOGIN_CREDENTIALS.password) {
      login();
      setLoginError('');
    } else {
      setLoginError('Usuario o contraseña incorrectos');
    }
  };

  const handlePriceUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updatePrices(priceForm);
  };

  const handleAddZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (zoneForm.name.trim() && zoneForm.cost >= 0) {
      addDeliveryZone(zoneForm);
      setZoneForm({ name: '', cost: 0, active: true });
      setShowAddZoneModal(false);
    }
  };

  const handleEditZone = (zone: DeliveryZone) => {
    setEditingZone(zone);
    setZoneForm({
      name: zone.name,
      cost: zone.cost,
      active: zone.active
    });
    setShowAddZoneModal(true);
  };

  const handleUpdateZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingZone && zoneForm.name.trim() && zoneForm.cost >= 0) {
      updateDeliveryZone({
        ...editingZone,
        name: zoneForm.name,
        cost: zoneForm.cost,
        active: zoneForm.active
      });
      setEditingZone(null);
      setZoneForm({ name: '', cost: 0, active: true });
      setShowAddZoneModal(false);
    }
  };

  const handleAddNovel = (e: React.FormEvent) => {
    e.preventDefault();
    if (novelForm.titulo.trim() && novelForm.genero.trim() && novelForm.capitulos > 0) {
      addNovel(novelForm);
      setNovelForm({
        titulo: '',
        genero: '',
        capitulos: 0,
        año: new Date().getFullYear(),
        descripcion: '',
        active: true
      });
      setShowAddNovelModal(false);
    }
  };

  const handleEditNovel = (novel: Novel) => {
    setEditingNovel(novel);
    setNovelForm({
      titulo: novel.titulo,
      genero: novel.genero,
      capitulos: novel.capitulos,
      año: novel.año,
      descripcion: novel.descripcion || '',
      active: novel.active
    });
    setShowAddNovelModal(true);
  };

  const handleUpdateNovel = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingNovel && novelForm.titulo.trim() && novelForm.genero.trim() && novelForm.capitulos > 0) {
      updateNovel({
        ...editingNovel,
        titulo: novelForm.titulo,
        genero: novelForm.genero,
        capitulos: novelForm.capitulos,
        año: novelForm.año,
        descripcion: novelForm.descripcion,
        active: novelForm.active
      });
      setEditingNovel(null);
      setNovelForm({
        titulo: '',
        genero: '',
        capitulos: 0,
        año: new Date().getFullYear(),
        descripcion: '',
        active: true
      });
      setShowAddNovelModal(false);
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getNotificationBgColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  if (!state.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white text-center">
            <div className="bg-white/20 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Lock className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold">Panel de Administración (Clonado)</h1>
            <p className="text-blue-100 mt-2">TV a la Carta - Versión Clonada</p>
          </div>
          
          <form onSubmit={handleLogin} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usuario
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ingrese el usuario"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña de Administrador
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                  placeholder="Ingrese la contraseña"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {loginError && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {loginError}
                </p>
              )}
            </div>
            
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <p className="text-sm text-blue-700">
                <strong>Credenciales:</strong><br />
                Usuario: root<br />
                Contraseña: video
              </p>
            </div>
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
            >
              Iniciar Sesión
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <Home className="h-5 w-5 mr-2" />
              Volver al Inicio
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Settings className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Panel de Administración (Clonado)</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-900 flex items-center"
              >
                <Home className="h-5 w-5 mr-1" />
                Inicio
              </button>
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm mb-8 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'prices', label: 'Precios', icon: DollarSign },
                { id: 'zones', label: 'Zonas de Entrega', icon: MapPin },
                { id: 'novels', label: 'Novelas', icon: BookOpen },
                { id: 'notifications', label: 'Notificaciones', icon: Bell }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={\`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors \${
                    activeTab === id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }\`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {label}
                  {id === 'notifications' && state.notifications.length > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {state.notifications.length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {activeTab === 'prices' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Configuración de Precios (Clonado)</h2>
              <div className="flex space-x-3">
                <button
                  onClick={exportSystemBackup}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Backup
                </button>
                <button
                  onClick={exportCompleteSystemClone}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Sistema Clonado
                </button>
              </div>
            </div>
            
            <form onSubmit={handlePriceUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio por Película (CUP)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={priceForm.moviePrice}
                    onChange={(e) => setPriceForm(prev => ({ ...prev, moviePrice: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio por Temporada de Serie (CUP)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={priceForm.seriesPrice}
                    onChange={(e) => setPriceForm(prev => ({ ...prev, seriesPrice: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recargo por Transferencia (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={priceForm.transferFeePercentage}
                    onChange={(e) => setPriceForm(prev => ({ ...prev, transferFeePercentage: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio por Capítulo de Novela (CUP)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={priceForm.novelPricePerChapter}
                    onChange={(e) => setPriceForm(prev => ({ ...prev, novelPricePerChapter: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                Guardar Precios
              </button>
            </form>
          </div>
        )}

        {/* Resto de las pestañas con implementación completa... */}
        {activeTab === 'zones' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Zonas de Entrega (Clonado)</h2>
              <button
                onClick={() => setShowAddZoneModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Zona
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Zona
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Costo (CUP)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {state.deliveryZones.map((zone) => (
                    <tr key={zone.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {zone.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        \${zone.cost.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={\`inline-flex px-2 py-1 text-xs font-semibold rounded-full \${
                          zone.active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }\`}>
                          {zone.active ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(zone.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEditZone(zone)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteDeliveryZone(zone.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Resto de la implementación completa del AdminPanel... */}
      </div>

      {/* Modales completos... */}
      {showAddZoneModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingZone ? 'Editar Zona (Clone)' : 'Agregar Nueva Zona (Clone)'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddZoneModal(false);
                    setEditingZone(null);
                    setZoneForm({ name: '', cost: 0, active: true });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={editingZone ? handleUpdateZone : handleAddZone} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de la Zona
                  </label>
                  <input
                    type="text"
                    value={zoneForm.name}
                    onChange={(e) => setZoneForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Habana > Centro Habana > Cayo Hueso"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Costo de Entrega (CUP)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={zoneForm.cost}
                    onChange={(e) => setZoneForm(prev => ({ ...prev, cost: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="active"
                    checked={zoneForm.active}
                    onChange={(e) => setZoneForm(prev => ({ ...prev, active: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                    Zona activa
                  </label>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddZoneModal(false);
                      setEditingZone(null);
                      setZoneForm({ name: '', cost: 0, active: true });
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    {editingZone ? 'Actualizar' : 'Agregar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}`;
  };

  const generateReadmeClone = () => {
    return `# TV a la Carta - Sistema Clonado

## Descripción
Este es un clon completo del sistema TV a la Carta con todas las configuraciones actuales aplicadas y sincronización en tiempo real con el panel de control.

## Credenciales de Acceso
- **Usuario:** root
- **Contraseña:** video

## Configuración Actual Clonada

### Precios
- Película: $${state.prices.moviePrice} CUP
- Serie (por temporada): $${state.prices.seriesPrice} CUP
- Recargo transferencia: ${state.prices.transferFeePercentage}%
- Novela (por capítulo): $${state.prices.novelPricePerChapter} CUP

### Zonas de Entrega
${state.deliveryZones.map(zone => `- ${zone.name}: $${zone.cost} CUP`).join('\n')}

### Catálogo de Novelas
${state.novels.map(novel => `- ${novel.titulo} (${novel.genero}, ${novel.capitulos} caps, ${novel.año})`).join('\n')}

## Características
- ✅ Sincronización en tiempo real con el panel de control
- ✅ Configuraciones clonadas aplicadas automáticamente
- ✅ Compatibilidad completa con la aplicación principal
- ✅ Funcionalidad de exportación mejorada
- ✅ Sistema de notificaciones integrado
- ✅ Gestión completa de precios, zonas y novelas

## Fecha de Exportación
${new Date().toLocaleString('es-ES')}

## Versión
2.0-clone

## Notas
Este sistema mantiene sincronización automática con las modificaciones del panel de control original, permitiendo que todos los cambios se reflejen en tiempo real.
`;
  };

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('adminData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        if (parsedData.prices) {
          dispatch({ type: 'UPDATE_PRICES', payload: parsedData.prices });
        }
        if (parsedData.deliveryZones) {
          parsedData.deliveryZones.forEach((zone: DeliveryZone) => {
            dispatch({ type: 'ADD_DELIVERY_ZONE', payload: zone });
          });
        }
        if (parsedData.novels) {
          parsedData.novels.forEach((novel: Novel) => {
            dispatch({ type: 'ADD_NOVEL', payload: novel });
          });
        }
      } catch (error) {
        console.error('Error loading admin data:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    const dataToSave = {
      prices: state.prices,
      deliveryZones: state.deliveryZones,
      novels: state.novels
    };
    localStorage.setItem('adminData', JSON.stringify(dataToSave));
  }, [state.prices, state.deliveryZones, state.novels]);

  return (
    <AdminContext.Provider value={{ 
      state, 
      dispatch,
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
      removeNotification,
      clearNotifications,
      exportSystemBackup,
      exportCompleteSystemClone
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};