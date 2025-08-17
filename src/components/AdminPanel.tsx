import React, { useState } from 'react';
import { X, Settings, DollarSign, BookOpen, Download, Upload, RotateCcw, Save, Plus, Edit3, Trash2, Eye, EyeOff, MapPin, FileCode, CheckCircle, Info, AlertTriangle, XCircle } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import type { NovelasConfig, DeliveryZoneConfig } from '../types/admin';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const { state, logout, updatePricing, addNovela, updateNovela, deleteNovela, addDeliveryZone, updateDeliveryZone, deleteDeliveryZone, exportConfig, importConfig, resetToDefaults, showNotification, exportSystemFiles } = useAdmin();
  const [activeTab, setActiveTab] = useState<'pricing' | 'novelas' | 'delivery' | 'backup'>('pricing');
  const [showPassword, setShowPassword] = useState(false);
  const [notifications, setNotifications] = useState<Array<{ id: number; message: string; type: 'success' | 'info' | 'warning' | 'error' }>>([]);
  
  // Pricing form state
  const [pricingForm, setPricingForm] = useState(state.config.pricing);
  
  // Novelas form state
  const [novelaForm, setNovelaForm] = useState<Partial<NovelasConfig>>({
    titulo: '',
    genero: '',
    capitulos: 0,
    año: new Date().getFullYear(),
    costoEfectivo: 0,
    costoTransferencia: 0,
    descripcion: ''
  });
  const [editingNovela, setEditingNovela] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Delivery zones form state
  const [deliveryForm, setDeliveryForm] = useState<Partial<DeliveryZoneConfig>>({
    name: '',
    fullPath: '',
    cost: 0,
    active: true
  });
  const [editingZone, setEditingZone] = useState<number | null>(null);
  const [zoneSearchTerm, setZoneSearchTerm] = useState('');
  // Backup state
  const [importData, setImportData] = useState('');

  // Local notification handler
  const displayLocalNotification = (message: string, type: 'success' | 'info' | 'warning' | 'error') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (!isOpen) return null;

  const handlePricingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePricing(pricingForm);
    displayLocalNotification('Configuración de precios actualizada correctamente', 'success');
  };

  const handleNovelaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingNovela) {
      updateNovela(editingNovela, novelaForm);
      setEditingNovela(null);
      displayLocalNotification('Novela actualizada correctamente', 'success');
    } else {
      if (novelaForm.titulo && novelaForm.genero && novelaForm.capitulos && novelaForm.año) {
        addNovela(novelaForm as Omit<NovelasConfig, 'id'>);
        displayLocalNotification('Nueva novela agregada al catálogo', 'success');
      } else {
        displayLocalNotification('Por favor complete todos los campos obligatorios', 'warning');
        return;
      }
    }
    setNovelaForm({
      titulo: '',
      genero: '',
      capitulos: 0,
      año: new Date().getFullYear(),
      costoEfectivo: 0,
      costoTransferencia: 0,
      descripcion: ''
    });
  };

  const handleEditNovela = (novela: NovelasConfig) => {
    setNovelaForm(novela);
    setEditingNovela(novela.id);
  };

  const handleDeleteNovela = (id: number) => {
    if (confirm('¿Está seguro de que desea eliminar esta novela?')) {
      deleteNovela(id);
      displayLocalNotification('Novela eliminada del catálogo', 'info');
    }
  };

  const handleDeliverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingZone) {
      updateDeliveryZone(editingZone, deliveryForm);
      setEditingZone(null);
      displayLocalNotification('Zona de entrega actualizada correctamente', 'success');
    } else {
      if (deliveryForm.name && deliveryForm.fullPath !== undefined && deliveryForm.cost !== undefined) {
        const fullPath = deliveryForm.fullPath || `Santiago de Cuba > Santiago de Cuba > ${deliveryForm.name}`;
        addDeliveryZone({ ...deliveryForm, fullPath } as Omit<DeliveryZoneConfig, 'id'>);
        displayLocalNotification('Nueva zona de entrega agregada', 'success');
      } else {
        displayLocalNotification('Por favor complete todos los campos obligatorios', 'warning');
        return;
      }
    }
    setDeliveryForm({
      name: '',
      fullPath: '',
      cost: 0,
      active: true
    });
  };

  const handleEditZone = (zone: DeliveryZoneConfig) => {
    setDeliveryForm(zone);
    setEditingZone(zone.id);
  };

  const handleDeleteZone = (id: number) => {
    if (confirm('¿Está seguro de que desea eliminar esta zona de entrega?')) {
      deleteDeliveryZone(id);
      displayLocalNotification('Zona de entrega eliminada', 'info');
    }
  };
  const handleExport = () => {
    const configData = exportConfig();
    const blob = new Blob([configData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tv-a-la-carta-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    displayLocalNotification('Configuración JSON exportada correctamente', 'success');
  };

  const handleImport = () => {
    if (importConfig(importData)) {
      displayLocalNotification('Configuración importada y aplicada correctamente', 'success');
      setImportData('');
      setPricingForm(state.config.pricing);
    } else {
      displayLocalNotification('Error al importar la configuración. Verifique el formato del archivo.', 'error');
    }
  };

  const handleReset = () => {
    if (confirm('¿Está seguro de que desea restaurar la configuración por defecto? Esta acción no se puede deshacer.')) {
      resetToDefaults();
      setPricingForm(state.config.pricing);
      displayLocalNotification('Configuración restaurada a valores por defecto', 'info');
    }
  };

  const filteredNovelas = state.config.novelas.filter(novela =>
    novela.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    novela.genero.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredZones = state.config.deliveryZones.filter(zone =>
    zone.name.toLowerCase().includes(zoneSearchTerm.toLowerCase()) ||
    zone.fullPath.toLowerCase().includes(zoneSearchTerm.toLowerCase())
  );
  const calculateTransferPrice = (basePrice: number) => {
    return Math.round(basePrice * (1 + pricingForm.transferFeePercentage / 100));
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {/* Sistema de Notificaciones */}
      <div className="fixed top-4 right-4 z-[60] space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`flex items-center p-4 rounded-lg shadow-lg max-w-sm animate-in slide-in-from-right duration-300 ${
              notification.type === 'success' ? 'bg-green-500 text-white' :
              notification.type === 'info' ? 'bg-blue-500 text-white' :
              notification.type === 'warning' ? 'bg-yellow-500 text-white' :
              'bg-red-500 text-white'
            }`}
          >
            <div className="mr-3">
              {notification.type === 'success' && <CheckCircle className="h-5 w-5" />}
              {notification.type === 'info' && <Info className="h-5 w-5" />}
              {notification.type === 'warning' && <AlertTriangle className="h-5 w-5" />}
              {notification.type === 'error' && <XCircle className="h-5 w-5" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-3 hover:bg-white/20 rounded-full p-1 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden shadow-2xl animate-in fade-in duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 p-3 rounded-xl mr-4 shadow-lg">
                <Settings className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Panel de Control Administrativo</h2>
                <p className="text-sm opacity-90">Gestión completa del sistema TV a la Carta</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={logout}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cerrar Sesión
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="flex space-x-1 p-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('pricing')}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center ${
                activeTab === 'pricing'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-indigo-600 hover:bg-white/50'
              }`}
            >
              <DollarSign className="h-5 w-5 mr-2" />
              Control de Precios
            </button>
            <button
              onClick={() => setActiveTab('novelas')}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center ${
                activeTab === 'novelas'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-indigo-600 hover:bg-white/50'
              }`}
            >
              <BookOpen className="h-5 w-5 mr-2" />
              Gestión de Novelas
            </button>
            <button
              onClick={() => setActiveTab('delivery')}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center ${
                activeTab === 'delivery'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-indigo-600 hover:bg-white/50'
              }`}
            >
              <MapPin className="h-5 w-5 mr-2" />
              Zonas de Entrega
            </button>
            <button
              onClick={() => setActiveTab('backup')}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center ${
                activeTab === 'backup'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-indigo-600 hover:bg-white/50'
              }`}
            >
              <Download className="h-5 w-5 mr-2" />
              Sistema Backup
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-200px)]">
          {/* Pricing Tab */}
          {activeTab === 'pricing' && (
            <div className="p-6">
              <div className="max-w-4xl mx-auto">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 mb-6 border border-blue-200">
                  <h3 className="text-2xl font-bold text-indigo-900 mb-4 flex items-center">
                    <DollarSign className="h-6 w-6 mr-3" />
                    Configuración de Precios del Sistema
                  </h3>
                  <p className="text-indigo-700 mb-6">
                    Modifique los precios base y porcentajes que rigen toda la aplicación. Los cambios se aplicarán inmediatamente.
                  </p>

                  <form onSubmit={handlePricingSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Precio de Películas (CUP)
                        </label>
                        <input
                          type="number"
                          value={pricingForm.moviePrice}
                          onChange={(e) => setPricingForm(prev => ({ ...prev, moviePrice: parseInt(e.target.value) || 0 }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          min="0"
                          required
                        />
                        <p className="text-sm text-gray-500 mt-2">
                          Precio actual: ${pricingForm.moviePrice} CUP por película
                        </p>
                      </div>

                      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Precio de Series por Temporada (CUP)
                        </label>
                        <input
                          type="number"
                          value={pricingForm.seriesPrice}
                          onChange={(e) => setPricingForm(prev => ({ ...prev, seriesPrice: parseInt(e.target.value) || 0 }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          min="0"
                          required
                        />
                        <p className="text-sm text-gray-500 mt-2">
                          Precio actual: ${pricingForm.seriesPrice} CUP por temporada
                        </p>
                      </div>

                      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Porcentaje de Recargo por Transferencia (%)
                        </label>
                        <input
                          type="number"
                          value={pricingForm.transferFeePercentage}
                          onChange={(e) => setPricingForm(prev => ({ ...prev, transferFeePercentage: parseFloat(e.target.value) || 0 }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          min="0"
                          max="100"
                          step="0.1"
                          required
                        />
                        <p className="text-sm text-gray-500 mt-2">
                          Recargo actual: {pricingForm.transferFeePercentage}% adicional para pagos por transferencia
                        </p>
                      </div>
                    </div>

                    {/* Preview Section */}
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
                      <h4 className="text-lg font-bold text-green-900 mb-4">Vista Previa de Precios</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-4 border border-green-200">
                          <h5 className="font-semibold text-gray-900 mb-2">Películas</h5>
                          <p className="text-sm text-gray-600">Efectivo: ${pricingForm.moviePrice} CUP</p>
                          <p className="text-sm text-gray-600">Transferencia: ${calculateTransferPrice(pricingForm.moviePrice)} CUP</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-green-200">
                          <h5 className="font-semibold text-gray-900 mb-2">Series (por temporada)</h5>
                          <p className="text-sm text-gray-600">Efectivo: ${pricingForm.seriesPrice} CUP</p>
                          <p className="text-sm text-gray-600">Transferencia: ${calculateTransferPrice(pricingForm.seriesPrice)} CUP</p>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center transform hover:scale-105"
                    >
                      <Save className="h-5 w-5 mr-2" />
                      Guardar Configuración de Precios
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Novelas Tab */}
          {activeTab === 'novelas' && (
            <div className="p-6">
              <div className="max-w-7xl mx-auto">
                <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-6 mb-6 border border-pink-200">
                  <h3 className="text-2xl font-bold text-purple-900 mb-4 flex items-center">
                    <BookOpen className="h-6 w-6 mr-3" />
                    Gestión de Catálogo de Novelas
                  </h3>
                  <p className="text-purple-700 mb-6">
                    Administre el catálogo completo de novelas: agregar, editar, eliminar y configurar precios.
                  </p>

                  {/* Add/Edit Form */}
                  <form onSubmit={handleNovelaSubmit} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-6">
                    <h4 className="text-lg font-bold text-gray-900 mb-4">
                      {editingNovela ? 'Editar Novela' : 'Agregar Nueva Novela'}
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Título *</label>
                        <input
                          type="text"
                          value={novelaForm.titulo || ''}
                          onChange={(e) => setNovelaForm(prev => ({ ...prev, titulo: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Género *</label>
                        <input
                          type="text"
                          value={novelaForm.genero || ''}
                          onChange={(e) => setNovelaForm(prev => ({ ...prev, genero: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Capítulos *</label>
                        <input
                          type="number"
                          value={novelaForm.capitulos || ''}
                          onChange={(e) => {
                            const capitulos = parseInt(e.target.value) || 0;
                            const costoEfectivo = capitulos * 5;
                            const costoTransferencia = Math.round(costoEfectivo * 1.1);
                            setNovelaForm(prev => ({ 
                              ...prev, 
                              capitulos,
                              costoEfectivo,
                              costoTransferencia
                            }));
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          min="1"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Año *</label>
                        <input
                          type="number"
                          value={novelaForm.año || ''}
                          onChange={(e) => setNovelaForm(prev => ({ ...prev, año: parseInt(e.target.value) || new Date().getFullYear() }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          min="1900"
                          max={new Date().getFullYear() + 5}
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Costo Efectivo (CUP)</label>
                        <input
                          type="number"
                          value={novelaForm.costoEfectivo || ''}
                          onChange={(e) => setNovelaForm(prev => ({ ...prev, costoEfectivo: parseInt(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          min="0"
                        />
                        <p className="text-xs text-gray-500 mt-1">Auto-calculado: ${(novelaForm.capitulos || 0) * 5} CUP</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Costo Transferencia (CUP)</label>
                        <input
                          type="number"
                          value={novelaForm.costoTransferencia || ''}
                          onChange={(e) => setNovelaForm(prev => ({ ...prev, costoTransferencia: parseInt(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          min="0"
                        />
                        <p className="text-xs text-gray-500 mt-1">Auto-calculado: ${Math.round(((novelaForm.capitulos || 0) * 5) * 1.1)} CUP</p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                      <textarea
                        value={novelaForm.descripcion || ''}
                        onChange={(e) => setNovelaForm(prev => ({ ...prev, descripcion: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex space-x-4">
                      <button
                        type="submit"
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center"
                      >
                        {editingNovela ? <Save className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                        {editingNovela ? 'Actualizar Novela' : 'Agregar Novela'}
                      </button>
                      
                      {editingNovela && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingNovela(null);
                            setNovelaForm({
                              titulo: '',
                              genero: '',
                              capitulos: 0,
                              año: new Date().getFullYear(),
                              costoEfectivo: 0,
                              costoTransferencia: 0,
                              descripcion: ''
                            });
                          }}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </form>

                  {/* Search */}
                  <div className="mb-6">
                    <input
                      type="text"
                      placeholder="Buscar novelas por título o género..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* Novelas List */}
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                      <h4 className="text-lg font-bold text-gray-900">
                        Catálogo de Novelas ({filteredNovelas.length} novelas)
                      </h4>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                      {filteredNovelas.map((novela) => (
                        <div key={novela.id} className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h5 className="font-semibold text-gray-900 mb-1">{novela.titulo}</h5>
                              <div className="flex flex-wrap gap-2 text-sm text-gray-600 mb-2">
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
                              <div className="flex space-x-4 text-sm">
                                <span className="text-green-600 font-medium">
                                  Efectivo: ${novela.costoEfectivo.toLocaleString()} CUP
                                </span>
                                <span className="text-orange-600 font-medium">
                                  Transferencia: ${novela.costoTransferencia.toLocaleString()} CUP
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 ml-4">
                              <button
                                onClick={() => handleEditNovela(novela)}
                                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
                                title="Editar novela"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteNovela(novela.id)}
                                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
                                title="Eliminar novela"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Delivery Zones Tab */}
          {activeTab === 'delivery' && (
            <div className="p-6">
              <div className="max-w-7xl mx-auto">
                <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-6 mb-6 border border-green-200">
                  <h3 className="text-2xl font-bold text-green-900 mb-4 flex items-center">
                    <MapPin className="h-6 w-6 mr-3" />
                    Gestión de Zonas de Entrega
                  </h3>
                  <p className="text-green-700 mb-6">
                    Administre las zonas de entrega disponibles: agregar, editar, eliminar y configurar costos.
                  </p>

                  {/* Add/Edit Form */}
                  <form onSubmit={handleDeliverySubmit} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-6">
                    <h4 className="text-lg font-bold text-gray-900 mb-4">
                      {editingZone ? 'Editar Zona de Entrega' : 'Agregar Nueva Zona de Entrega'}
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de la Zona *</label>
                        <input
                          type="text"
                          value={deliveryForm.name || ''}
                          onChange={(e) => setDeliveryForm(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Ej: Vista Alegre"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ruta Completa</label>
                        <input
                          type="text"
                          value={deliveryForm.fullPath || ''}
                          onChange={(e) => setDeliveryForm(prev => ({ ...prev, fullPath: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Santiago de Cuba > Santiago de Cuba > Vista Alegre"
                        />
                        <p className="text-xs text-gray-500 mt-1">Si se deja vacío, se generará automáticamente</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Costo de Entrega (CUP) *</label>
                        <input
                          type="number"
                          value={deliveryForm.cost || ''}
                          onChange={(e) => setDeliveryForm(prev => ({ ...prev, cost: parseInt(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          min="0"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                        <select
                          value={deliveryForm.active ? 'true' : 'false'}
                          onChange={(e) => setDeliveryForm(prev => ({ ...prev, active: e.target.value === 'true' }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="true">Activa</option>
                          <option value="false">Inactiva</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="flex space-x-4">
                      <button
                        type="submit"
                        className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center"
                      >
                        {editingZone ? <Save className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                        {editingZone ? 'Actualizar Zona' : 'Agregar Zona'}
                      </button>
                      
                      {editingZone && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingZone(null);
                            setDeliveryForm({
                              name: '',
                              fullPath: '',
                              cost: 0,
                              active: true
                            });
                          }}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </form>

                  {/* Search */}
                  <div className="mb-6">
                    <input
                      type="text"
                      placeholder="Buscar zonas por nombre o ruta..."
                      value={zoneSearchTerm}
                      onChange={(e) => setZoneSearchTerm(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  {/* Zones List */}
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                      <h4 className="text-lg font-bold text-gray-900">
                        Zonas de Entrega ({filteredZones.length} zonas)
                      </h4>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                      {filteredZones.map((zone) => (
                        <div key={zone.id} className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h5 className="font-semibold text-gray-900 mb-1">{zone.name}</h5>
                              <p className="text-sm text-gray-600 mb-2">{zone.fullPath}</p>
                              <div className="flex space-x-4 text-sm">
                                <span className="text-green-600 font-medium">
                                  Costo: ${zone.cost.toLocaleString()} CUP
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  zone.active 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                  {zone.active ? 'Activa' : 'Inactiva'}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 ml-4">
                              <button
                                onClick={() => handleEditZone(zone)}
                                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
                                title="Editar zona"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              {zone.id !== 1 && ( // No permitir eliminar la zona por defecto
                                <button
                                  onClick={() => handleDeleteZone(zone.id)}
                                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
                                  title="Eliminar zona"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Backup Tab */}
          {activeTab === 'backup' && (
            <div className="p-6">
              <div className="max-w-4xl mx-auto">
                <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-6 border border-green-200">
                  <h3 className="text-2xl font-bold text-green-900 mb-4 flex items-center">
                    <Download className="h-6 w-6 mr-3" />
                    Sistema de Backup y Restauración
                  </h3>
                  <p className="text-green-700 mb-6">
                    Exporte e importe la configuración completa del sistema (precios, novelas y zonas de entrega) para crear respaldos o migrar configuraciones.
                  </p>

                  <div className="space-y-6">
                    {/* Export Section */}
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <Download className="h-5 w-5 mr-2 text-green-600" />
                        Exportar Configuración JSON
                      </h4>
                      <p className="text-gray-600 mb-4">
                        Descargue un archivo JSON con toda la configuración actual del sistema (precios, novelas y zonas de entrega).
                      </p>
                      <button
                        onClick={handleExport}
                        className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
                      >
                        <Download className="h-5 w-5 mr-2" />
                        Exportar JSON
                      </button>
                    </div>

                    {/* Import Section */}
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <Upload className="h-5 w-5 mr-2 text-blue-600" />
                        Importar Configuración
                      </h4>
                      <p className="text-gray-600 mb-4">
                        Pegue el contenido de un archivo de backup para restaurar la configuración.
                      </p>
                      <textarea
                        value={importData}
                        onChange={(e) => setImportData(e.target.value)}
                        placeholder="Pegue aquí el contenido del archivo JSON de backup..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                        rows={8}
                      />
                      <button
                        onClick={handleImport}
                        disabled={!importData.trim()}
                        className="mt-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
                      >
                        <Upload className="h-5 w-5 mr-2" />
                        Importar Configuración
                      </button>
                    </div>

                    {/* Reset Section */}
                    <div className="bg-white rounded-xl p-6 border border-red-200 shadow-sm">
                      <h4 className="text-lg font-bold text-red-900 mb-4 flex items-center">
                        <RotateCcw className="h-5 w-5 mr-2 text-red-600" />
                        Restaurar Configuración por Defecto
                      </h4>
                      <p className="text-red-700 mb-4">
                        <strong>¡Atención!</strong> Esta acción restaurará todos los valores (precios, novelas y zonas de entrega) a su configuración original y eliminará todas las personalizaciones.
                      </p>
                      <button
                        onClick={handleReset}
                        className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
                      >
                        <RotateCcw className="h-5 w-5 mr-2" />
                        Restaurar por Defecto
                      </button>
                    </div>

                    {/* Nueva Sección: Exportar Archivos del Sistema */}
                    <div className="bg-white rounded-xl p-6 border border-indigo-200 shadow-sm">
                      <h4 className="text-lg font-bold text-indigo-900 mb-4 flex items-center">
                        <FileCode className="h-5 w-5 mr-2 text-indigo-600" />
                        Exportar Archivos del Sistema Completos
                      </h4>
                      <p className="text-indigo-700 mb-4">
                        <strong>Exportación Avanzada:</strong> Descarga los archivos del código fuente que controlan el sistema (admin.ts, AdminContext.tsx, AdminPanel.tsx, CheckoutModal.tsx, NovelasModal.tsx) con toda la configuración actual aplicada.
                      </p>
                      <div className="bg-indigo-50 rounded-lg p-4 mb-4 border border-indigo-200">
                        <div className="flex items-center mb-2">
                          <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                            <FileCode className="h-4 w-4 text-indigo-600" />
                          </div>
                          <h5 className="font-semibold text-indigo-900">Archivos que se exportarán:</h5>
                        </div>
                        <ul className="text-sm text-indigo-700 ml-11 space-y-1">
                          <li>• <code>admin.ts</code> - Tipos y configuración actual</li>
                          <li>• <code>AdminContext.tsx</code> - Contexto con valores aplicados</li>
                          <li>• <code>AdminPanel.tsx</code> - Panel con configuración actual</li>
                          <li>• <code>CheckoutModal.tsx</code> - Sistema de checkout sincronizado</li>
                          <li>• <code>NovelasModal.tsx</code> - Catálogo sincronizado</li>
                        </ul>
                      </div>
                      <button
                        onClick={exportSystemFiles}
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
                      >
                        <FileCode className="h-5 w-5 mr-2" />
                        Exportar Archivos del Sistema
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}