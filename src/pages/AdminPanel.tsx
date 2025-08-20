import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { 
  Settings, 
  DollarSign, 
  MapPin, 
  BookOpen, 
  Bell, 
  Download, 
  Upload,
  Save,
  Edit3,
  Trash2,
  Plus,
  Search,
  Filter,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  RefreshCw,
  Database,
  FileText,
  Shield,
  LogOut,
  User,
  Calendar,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Info,
  X,
  Home,
  ArrowLeft
} from 'lucide-react';
import type { PriceConfig, DeliveryZone, Novel, AdminNotification } from '../context/AdminContext';

export function AdminPanel() {
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
    addNotification,
    clearNotifications,
    exportSystemBackup
  } = useAdmin();

  // Authentication state
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  // Active section state
  const [activeSection, setActiveSection] = useState<'dashboard' | 'prices' | 'zones' | 'novels' | 'notifications' | 'system'>('dashboard');

  // Prices form state
  const [pricesForm, setPricesForm] = useState<PriceConfig>(state.prices);

  // Delivery zones form state
  const [zoneForm, setZoneForm] = useState<Omit<DeliveryZone, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    cost: 0,
    active: true
  });
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);

  // Novels form state
  const [novelForm, setNovelForm] = useState<Omit<Novel, 'id' | 'createdAt' | 'updatedAt'>>({
    titulo: '',
    genero: '',
    capitulos: 0,
    año: new Date().getFullYear(),
    descripcion: '',
    active: true
  });
  const [editingNovel, setEditingNovel] = useState<Novel | null>(null);
  const [novelSearchTerm, setNovelSearchTerm] = useState('');
  const [novelGenreFilter, setNovelGenreFilter] = useState('');
  const [selectedNovels, setSelectedNovels] = useState<number[]>([]);

  // Update forms when state changes
  useEffect(() => {
    setPricesForm(state.prices);
  }, [state.prices]);

  // Handle login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(loginForm.username, loginForm.password);
    if (!success) {
      alert('Credenciales incorrectas');
    }
  };

  // Handle prices update
  const handlePricesUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updatePrices(pricesForm);
    addNotification({
      type: 'success',
      title: 'Precios Actualizados',
      message: 'Los precios han sido actualizados correctamente',
      section: 'Control de Precios',
      action: 'Update Prices'
    });
  };

  // Handle delivery zone operations
  const handleZoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingZone) {
      updateDeliveryZone({ ...editingZone, ...zoneForm, updatedAt: new Date().toISOString() });
      setEditingZone(null);
    } else {
      addDeliveryZone(zoneForm);
    }
    setZoneForm({ name: '', cost: 0, active: true });
  };

  const handleEditZone = (zone: DeliveryZone) => {
    setEditingZone(zone);
    setZoneForm({
      name: zone.name,
      cost: zone.cost,
      active: zone.active
    });
  };

  const handleDeleteZone = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta zona?')) {
      deleteDeliveryZone(id);
    }
  };

  // Handle novel operations
  const handleNovelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingNovel) {
      updateNovel({ ...editingNovel, ...novelForm, updatedAt: new Date().toISOString() });
      setEditingNovel(null);
    } else {
      addNovel(novelForm);
    }
    setNovelForm({
      titulo: '',
      genero: '',
      capitulos: 0,
      año: new Date().getFullYear(),
      descripcion: '',
      active: true
    });
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
  };

  const handleDeleteNovel = (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta novela?')) {
      deleteNovel(id);
    }
  };

  const handleBulkDeleteNovels = () => {
    if (selectedNovels.length === 0) return;
    if (confirm(`¿Estás seguro de que quieres eliminar ${selectedNovels.length} novelas?`)) {
      selectedNovels.forEach(id => deleteNovel(id));
      setSelectedNovels([]);
    }
  };

  // Filter novels
  const filteredNovels = state.novels.filter(novel => {
    const matchesSearch = novel.titulo.toLowerCase().includes(novelSearchTerm.toLowerCase()) ||
                         novel.genero.toLowerCase().includes(novelSearchTerm.toLowerCase());
    const matchesGenre = novelGenreFilter === '' || novel.genero === novelGenreFilter;
    return matchesSearch && matchesGenre;
  });

  const uniqueGenres = [...new Set(state.novels.map(novel => novel.genero))].sort();

  // Get notification icon
  const getNotificationIcon = (type: AdminNotification['type']) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error': return <X className="h-5 w-5 text-red-500" />;
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  // Login screen
  if (!state.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-blob"></div>
        </div>
        
        {/* Back to home button */}
        <Link
          to="/"
          className="absolute top-6 left-6 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-4 py-2 rounded-full font-medium transition-all duration-300 flex items-center group hover:scale-105 border border-white/20"
        >
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
          Volver al Inicio
        </Link>
        
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-md relative z-10 border border-white/20 animate-in fade-in duration-700 transform hover:scale-[1.02] transition-all">
          {/* Decorative elements */}
          <div className="absolute -top-2 -right-2 w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
          <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full blur-xl opacity-40 animate-pulse animation-delay-2000"></div>
          
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-lg animate-bounce hover:animate-none transition-all duration-300 hover:scale-110">
              <Shield className="h-10 w-10 text-white animate-pulse" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 animate-in slide-in-from-top duration-500">
              Panel de Control
            </h1>
            <p className="text-gray-600 animate-in slide-in-from-bottom duration-700">TV a la Carta - Administración</p>
            <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mt-3 animate-in slide-in-from-left duration-1000"></div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6 animate-in slide-in-from-bottom duration-1000">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 animate-in slide-in-from-left duration-500">
                Usuario
              </label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm hover:bg-white focus:bg-white group-hover:shadow-md"
                  placeholder="Ingresa tu usuario"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 animate-in slide-in-from-left duration-700">
                Contraseña
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm hover:bg-white focus:bg-white group-hover:shadow-md"
                  placeholder="Ingresa tu contraseña"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-all duration-300 hover:scale-110"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10">
              Iniciar Sesión
              </span>
            </button>
          </form>

          <div className="mt-8 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">o</span>
              </div>
            </div>
            
            <Link
              to="/"
              className="w-full bg-white border-2 border-gray-200 hover:border-blue-300 text-gray-700 hover:text-blue-600 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 flex items-center justify-center group"
            >
              <Home className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
              Ir a la Página Principal
            </Link>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500 animate-in fade-in duration-1000">
            <p>Acceso restringido solo para administradores</p>
            <div className="flex items-center justify-center mt-2 space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs">Sistema seguro</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg mr-3">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Panel de Control</h1>
                <p className="text-sm text-gray-500">TV a la Carta - Administración</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-1" />
                {new Date().toLocaleString('es-ES')}
              </div>
              <button
                onClick={logout}
                className="flex items-center text-red-600 hover:text-red-800 font-medium"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="bg-white rounded-lg shadow-sm p-4 space-y-2">
              <button
                onClick={() => setActiveSection('dashboard')}
                className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                  activeSection === 'dashboard'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <TrendingUp className="h-5 w-5 mr-3" />
                Dashboard
              </button>
              
              <button
                onClick={() => setActiveSection('prices')}
                className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                  activeSection === 'prices'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <DollarSign className="h-5 w-5 mr-3" />
                Control de Precios
              </button>
              
              <button
                onClick={() => setActiveSection('zones')}
                className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                  activeSection === 'zones'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <MapPin className="h-5 w-5 mr-3" />
                Zonas de Entrega
              </button>
              
              <button
                onClick={() => setActiveSection('novels')}
                className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                  activeSection === 'novels'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <BookOpen className="h-5 w-5 mr-3" />
                Gestión de Novelas
              </button>
              
              <button
                onClick={() => setActiveSection('notifications')}
                className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                  activeSection === 'notifications'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Bell className="h-5 w-5 mr-3" />
                Notificaciones
                {state.notifications.length > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">
                    {state.notifications.length}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => setActiveSection('system')}
                className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                  activeSection === 'system'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Database className="h-5 w-5 mr-3" />
                Sistema
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Dashboard */}
            {activeSection === 'dashboard' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard del Sistema</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100">Zonas de Entrega</p>
                          <p className="text-3xl font-bold">{state.deliveryZones.length}</p>
                        </div>
                        <MapPin className="h-8 w-8 text-blue-200" />
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-100">Novelas</p>
                          <p className="text-3xl font-bold">{state.novels.length}</p>
                        </div>
                        <BookOpen className="h-8 w-8 text-green-200" />
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-100">Notificaciones</p>
                          <p className="text-3xl font-bold">{state.notifications.length}</p>
                        </div>
                        <Bell className="h-8 w-8 text-purple-200" />
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-orange-100">Último Backup</p>
                          <p className="text-sm font-medium">
                            {state.lastBackup 
                              ? new Date(state.lastBackup).toLocaleDateString('es-ES')
                              : 'Nunca'
                            }
                          </p>
                        </div>
                        <Download className="h-8 w-8 text-orange-200" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración de Precios</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Películas:</span>
                          <span className="font-medium">${state.prices.moviePrice} CUP</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Series:</span>
                          <span className="font-medium">${state.prices.seriesPrice} CUP</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Transferencia:</span>
                          <span className="font-medium">{state.prices.transferFeePercentage}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Novelas:</span>
                          <span className="font-medium">${state.prices.novelPricePerChapter} CUP/cap</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
                      <div className="space-y-3">
                        {state.notifications.slice(0, 5).map((notification) => (
                          <div key={notification.id} className="flex items-start space-x-3">
                            {getNotificationIcon(notification.type)}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                              <p className="text-xs text-gray-500">{notification.section}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Prices Section */}
            {activeSection === 'prices' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Control de Precios</h2>
                
                <form onSubmit={handlePricesUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Precio de Películas (CUP)
                      </label>
                      <input
                        type="number"
                        value={pricesForm.moviePrice}
                        onChange={(e) => setPricesForm(prev => ({ ...prev, moviePrice: parseInt(e.target.value) }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Precio de Series por Temporada (CUP)
                      </label>
                      <input
                        type="number"
                        value={pricesForm.seriesPrice}
                        onChange={(e) => setPricesForm(prev => ({ ...prev, seriesPrice: parseInt(e.target.value) }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Recargo por Transferencia (%)
                      </label>
                      <input
                        type="number"
                        value={pricesForm.transferFeePercentage}
                        onChange={(e) => setPricesForm(prev => ({ ...prev, transferFeePercentage: parseInt(e.target.value) }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        max="100"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Precio de Novelas por Capítulo (CUP)
                      </label>
                      <input
                        type="number"
                        value={pricesForm.novelPricePerChapter}
                        onChange={(e) => setPricesForm(prev => ({ ...prev, novelPricePerChapter: parseInt(e.target.value) }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        required
                      />
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
                  >
                    <Save className="h-5 w-5 mr-2" />
                    Guardar Precios
                  </button>
                </form>
              </div>
            )}

            {/* Delivery Zones Section */}
            {activeSection === 'zones' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    {editingZone ? 'Editar Zona de Entrega' : 'Agregar Nueva Zona'}
                  </h2>
                  
                  <form onSubmit={handleZoneSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre de la Zona
                      </label>
                      <input
                        type="text"
                        value={zoneForm.name}
                        onChange={(e) => setZoneForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ej: Santiago de Cuba > Santiago de Cuba > Vista Alegre"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Costo de Entrega (CUP)
                      </label>
                      <input
                        type="number"
                        value={zoneForm.cost}
                        onChange={(e) => setZoneForm(prev => ({ ...prev, cost: parseInt(e.target.value) }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        required
                      />
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="zoneActive"
                        checked={zoneForm.active}
                        onChange={(e) => setZoneForm(prev => ({ ...prev, active: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="zoneActive" className="ml-2 text-sm text-gray-700">
                        Zona activa
                      </label>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
                      >
                        <Save className="h-5 w-5 mr-2" />
                        {editingZone ? 'Actualizar Zona' : 'Agregar Zona'}
                      </button>
                      
                      {editingZone && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingZone(null);
                            setZoneForm({ name: '', cost: 0, active: true });
                          }}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Zonas Configuradas</h3>
                  
                  <div className="space-y-3">
                    {state.deliveryZones.map((zone) => (
                      <div key={zone.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{zone.name}</h4>
                          <p className="text-sm text-gray-600">
                            Costo: ${zone.cost} CUP • {zone.active ? 'Activa' : 'Inactiva'}
                          </p>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditZone(zone)}
                            className="text-blue-600 hover:text-blue-800 p-2"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteZone(zone.id)}
                            className="text-red-600 hover:text-red-800 p-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Novels Section */}
            {activeSection === 'novels' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    {editingNovel ? 'Editar Novela' : 'Agregar Nueva Novela'}
                  </h2>
                  
                  <form onSubmit={handleNovelSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Título
                        </label>
                        <input
                          type="text"
                          value={novelForm.titulo}
                          onChange={(e) => setNovelForm(prev => ({ ...prev, titulo: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Género
                        </label>
                        <input
                          type="text"
                          value={novelForm.genero}
                          onChange={(e) => setNovelForm(prev => ({ ...prev, genero: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Capítulos
                        </label>
                        <input
                          type="number"
                          value={novelForm.capitulos}
                          onChange={(e) => setNovelForm(prev => ({ ...prev, capitulos: parseInt(e.target.value) }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="1"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Año
                        </label>
                        <input
                          type="number"
                          value={novelForm.año}
                          onChange={(e) => setNovelForm(prev => ({ ...prev, año: parseInt(e.target.value) }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="1900"
                          max={new Date().getFullYear()}
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descripción (Opcional)
                      </label>
                      <textarea
                        value={novelForm.descripcion}
                        onChange={(e) => setNovelForm(prev => ({ ...prev, descripcion: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="novelActive"
                        checked={novelForm.active}
                        onChange={(e) => setNovelForm(prev => ({ ...prev, active: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="novelActive" className="ml-2 text-sm text-gray-700">
                        Novela activa
                      </label>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
                      >
                        <Save className="h-5 w-5 mr-2" />
                        {editingNovel ? 'Actualizar Novela' : 'Agregar Novela'}
                      </button>
                      
                      {editingNovel && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingNovel(null);
                            setNovelForm({
                              titulo: '',
                              genero: '',
                              capitulos: 0,
                              año: new Date().getFullYear(),
                              descripcion: '',
                              active: true
                            });
                          }}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* Search and Filter */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Buscar Novelas por Título o Género</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={novelSearchTerm}
                        onChange={(e) => setNovelSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Buscar por título o género..."
                      />
                    </div>
                    
                    <select
                      value={novelGenreFilter}
                      onChange={(e) => setNovelGenreFilter(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Todos los géneros</option>
                      {uniqueGenres.map(genre => (
                        <option key={genre} value={genre}>{genre}</option>
                      ))}
                    </select>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setNovelSearchTerm('');
                          setNovelGenreFilter('');
                        }}
                        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                      >
                        Limpiar
                      </button>
                      {selectedNovels.length > 0 && (
                        <button
                          onClick={handleBulkDeleteNovels}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Eliminar ({selectedNovels.length})
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Novels List */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">
                      Listado de Novelas ({filteredNovels.length})
                    </h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          const allIds = filteredNovels.map(n => n.id);
                          setSelectedNovels(selectedNovels.length === allIds.length ? [] : allIds);
                        }}
                        className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg transition-colors"
                      >
                        {selectedNovels.length === filteredNovels.length ? 'Deseleccionar Todo' : 'Seleccionar Todo'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredNovels.map((novel) => (
                      <div key={novel.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedNovels.includes(novel.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedNovels(prev => [...prev, novel.id]);
                              } else {
                                setSelectedNovels(prev => prev.filter(id => id !== novel.id));
                              }
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{novel.titulo}</h4>
                            <p className="text-sm text-gray-600">
                              {novel.genero} • {novel.capitulos} capítulos • {novel.año} • {novel.active ? 'Activa' : 'Inactiva'}
                            </p>
                            {novel.descripcion && (
                              <p className="text-xs text-gray-500 mt-1">{novel.descripcion}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditNovel(novel)}
                            className="text-blue-600 hover:text-blue-800 p-2"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteNovel(novel.id)}
                            className="text-red-600 hover:text-red-800 p-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Section */}
            {activeSection === 'notifications' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Notificaciones del Sistema</h2>
                  <button
                    onClick={clearNotifications}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Limpiar Todo
                  </button>
                </div>
                
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {state.notifications.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No hay notificaciones</p>
                    </div>
                  ) : (
                    state.notifications.map((notification) => (
                      <div key={notification.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-gray-900">{notification.title}</h4>
                            <span className="text-xs text-gray-500">
                              {new Date(notification.timestamp).toLocaleString('es-ES')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>Sección: {notification.section}</span>
                            <span>Acción: {notification.action}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* System Section */}
            {activeSection === 'system' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Gestión del Sistema</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                      <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                        <Download className="h-5 w-5 mr-2" />
                        Exportar Sistema Completo
                      </h3>
                      <p className="text-blue-700 mb-4 text-sm">
                        Exporta todos los archivos del sistema con las configuraciones actuales en un archivo ZIP con estructura de carpetas.
                      </p>
                      <button
                        onClick={exportSystemBackup}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
                      >
                        <Download className="h-5 w-5 mr-2" />
                        Exportar Sistema
                      </button>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
                      <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                        <RefreshCw className="h-5 w-5 mr-2" />
                        Estado del Sistema
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-green-700">Versión:</span>
                          <span className="font-medium">2.0.0</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-700">Último Backup:</span>
                          <span className="font-medium">
                            {state.lastBackup 
                              ? new Date(state.lastBackup).toLocaleDateString('es-ES')
                              : 'Nunca'
                            }
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-700">Archivos del Sistema:</span>
                          <span className="font-medium">7 archivos</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Archivos del Sistema</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-blue-500 mr-2" />
                            <span>src/context/AdminContext.tsx</span>
                          </div>
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-blue-500 mr-2" />
                            <span>src/context/CartContext.tsx</span>
                          </div>
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-green-500 mr-2" />
                            <span>src/components/CheckoutModal.tsx</span>
                          </div>
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-green-500 mr-2" />
                            <span>src/components/NovelasModal.tsx</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-green-500 mr-2" />
                            <span>src/components/PriceCard.tsx</span>
                          </div>
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-purple-500 mr-2" />
                            <span>src/pages/AdminPanel.tsx</span>
                          </div>
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-gray-500 mr-2" />
                            <span>README.md</span>
                          </div>
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-orange-500 mr-2" />
                            <span>config/system-changes.json</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}