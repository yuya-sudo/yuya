import React, { useState, useEffect } from 'react';
import { Settings, Save, Download, Upload, Eye, EyeOff, X, Plus, Trash2, Edit3 } from 'lucide-react';

interface AdminConfig {
  moviePrice: number;
  seriesPrice: number;
  transferSurcharge: number;
  deliveryZones: DeliveryZone[];
  novelas: Novela[];
}

interface DeliveryZone {
  id: string;
  name: string;
  price: number;
}

interface Novela {
  id: string;
  title: string;
  genre: string;
  year: number;
  rating: number;
  duration: string;
  episodes: number;
  status: 'completed' | 'ongoing';
  image: string;
  description: string;
}

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const [config, setConfig] = useState<AdminConfig>({
    moviePrice: 80,
    seriesPrice: 300,
    transferSurcharge: 10,
    deliveryZones: [
      { id: '1', name: 'Centro Habana', price: 50 },
      { id: '2', name: 'Habana Vieja', price: 50 },
      { id: '3', name: 'Vedado', price: 60 },
      { id: '4', name: 'Miramar', price: 80 },
      { id: '5', name: 'Playa', price: 80 },
      { id: '6', name: 'Marianao', price: 70 },
      { id: '7', name: 'La Lisa', price: 90 },
      { id: '8', name: 'Boyeros', price: 100 },
      { id: '9', name: 'Arroyo Naranjo', price: 100 },
      { id: '10', name: 'Cotorro', price: 120 },
      { id: '11', name: 'San Miguel del Padrón', price: 110 },
      { id: '12', name: 'Guanabacoa', price: 130 },
      { id: '13', name: 'Regla', price: 100 },
      { id: '14', name: 'Habana del Este', price: 150 },
      { id: '15', name: 'Alamar', price: 140 },
      { id: '16', name: 'Santiago de las Vegas', price: 120 },
      { id: '17', name: 'Bejucal', price: 150 },
      { id: '18', name: 'San Antonio de los Baños', price: 180 },
      { id: '19', name: 'Bauta', price: 200 },
      { id: '20', name: 'Caimito', price: 220 },
      { id: '21', name: 'Artemisa', price: 250 },
      { id: '22', name: 'Mayabeque', price: 280 },
      { id: '23', name: 'Otras zonas', price: 300 }
    ],
    novelas: [
      {
        id: '1',
        title: 'Pasión de Gavilanes',
        genre: 'Drama/Romance',
        year: 2003,
        rating: 8.5,
        duration: '45 min',
        episodes: 188,
        status: 'completed',
        image: 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg',
        description: 'La historia de tres hermanos que buscan venganza y encuentran el amor.'
      },
      {
        id: '2',
        title: 'Betty la Fea',
        genre: 'Comedia/Romance',
        year: 1999,
        rating: 9.0,
        duration: '40 min',
        episodes: 335,
        status: 'completed',
        image: 'https://images.pexels.com/photos/8111357/pexels-photo-8111357.jpeg',
        description: 'Una secretaria poco agraciada conquista el corazón de su jefe.'
      },
      {
        id: '3',
        title: 'El Señor de los Cielos',
        genre: 'Drama/Acción',
        year: 2013,
        rating: 8.2,
        duration: '60 min',
        episodes: 800,
        status: 'ongoing',
        image: 'https://images.pexels.com/photos/6976094/pexels-photo-6976094.jpeg',
        description: 'La vida del narcotraficante más poderoso de México.'
      },
      {
        id: '4',
        title: 'La Reina del Sur',
        genre: 'Drama/Acción',
        year: 2011,
        rating: 8.7,
        duration: '50 min',
        episodes: 123,
        status: 'completed',
        image: 'https://images.pexels.com/photos/7991580/pexels-photo-7991580.jpeg',
        description: 'Una mujer se convierte en la narcotraficante más poderosa.'
      },
      {
        id: '5',
        title: 'Café con Aroma de Mujer',
        genre: 'Romance/Drama',
        year: 1994,
        rating: 8.8,
        duration: '45 min',
        episodes: 192,
        status: 'completed',
        image: 'https://images.pexels.com/photos/6976095/pexels-photo-6976095.jpeg',
        description: 'Romance entre una recolectora de café y un empresario.'
      },
      {
        id: '6',
        title: 'Sin Senos Sí Hay Paraíso',
        genre: 'Drama',
        year: 2016,
        rating: 7.9,
        duration: '55 min',
        episodes: 295,
        status: 'completed',
        image: 'https://images.pexels.com/photos/8111358/pexels-photo-8111358.jpeg',
        description: 'Una joven lucha por salir de la pobreza en un mundo peligroso.'
      },
      {
        id: '7',
        title: 'Yo Soy Betty, la Fea',
        genre: 'Comedia/Romance',
        year: 2019,
        rating: 8.1,
        duration: '40 min',
        episodes: 92,
        status: 'completed',
        image: 'https://images.pexels.com/photos/7991581/pexels-photo-7991581.jpeg',
        description: 'Remake de la clásica telenovela colombiana.'
      },
      {
        id: '8',
        title: 'El Cartel de los Sapos',
        genre: 'Drama/Crimen',
        year: 2008,
        rating: 8.4,
        duration: '60 min',
        episodes: 117,
        status: 'completed',
        image: 'https://images.pexels.com/photos/6976096/pexels-photo-6976096.jpeg',
        description: 'La historia del cartel de drogas más poderoso de Colombia.'
      },
      {
        id: '9',
        title: 'La Casa de las Flores',
        genre: 'Comedia/Drama',
        year: 2018,
        rating: 7.8,
        duration: '35 min',
        episodes: 33,
        status: 'completed',
        image: 'https://images.pexels.com/photos/8111359/pexels-photo-8111359.jpeg',
        description: 'Una familia disfuncional maneja una floristería en México.'
      },
      {
        id: '10',
        title: 'Narcos',
        genre: 'Drama/Crimen',
        year: 2015,
        rating: 8.8,
        duration: '50 min',
        episodes: 30,
        status: 'completed',
        image: 'https://images.pexels.com/photos/7991582/pexels-photo-7991582.jpeg',
        description: 'La historia de Pablo Escobar y el cartel de Medellín.'
      }
    ]
  });

  const [activeTab, setActiveTab] = useState<'prices' | 'zones' | 'novelas'>('prices');
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);
  const [editingNovela, setEditingNovela] = useState<Novela | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSaveConfig = () => {
    localStorage.setItem('adminConfig', JSON.stringify(config));
    alert('Configuración guardada exitosamente');
  };

  const handleExportConfig = () => {
    const dataStr = JSON.stringify(config, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'tv-config.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedConfig = JSON.parse(e.target?.result as string);
          setConfig(importedConfig);
          alert('Configuración importada exitosamente');
        } catch (error) {
          alert('Error al importar la configuración');
        }
      };
      reader.readAsText(file);
    }
  };

  const addDeliveryZone = () => {
    const newZone: DeliveryZone = {
      id: Date.now().toString(),
      name: 'Nueva Zona',
      price: 100
    };
    setConfig(prev => ({
      ...prev,
      deliveryZones: [...prev.deliveryZones, newZone]
    }));
    setEditingZone(newZone);
  };

  const updateDeliveryZone = (zone: DeliveryZone) => {
    setConfig(prev => ({
      ...prev,
      deliveryZones: prev.deliveryZones.map(z => z.id === zone.id ? zone : z)
    }));
    setEditingZone(null);
  };

  const deleteDeliveryZone = (zoneId: string) => {
    setConfig(prev => ({
      ...prev,
      deliveryZones: prev.deliveryZones.filter(z => z.id !== zoneId)
    }));
  };

  const addNovela = () => {
    const newNovela: Novela = {
      id: Date.now().toString(),
      title: 'Nueva Novela',
      genre: 'Drama',
      year: 2024,
      rating: 8.0,
      duration: '45 min',
      episodes: 100,
      status: 'ongoing',
      image: 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg',
      description: 'Descripción de la nueva novela'
    };
    setConfig(prev => ({
      ...prev,
      novelas: [...prev.novelas, newNovela]
    }));
    setEditingNovela(newNovela);
  };

  const updateNovela = (novela: Novela) => {
    setConfig(prev => ({
      ...prev,
      novelas: prev.novelas.map(n => n.id === novela.id ? novela : n)
    }));
    setEditingNovela(null);
  };

  const deleteNovela = (novelaId: string) => {
    setConfig(prev => ({
      ...prev,
      novelas: prev.novelas.filter(n => n.id !== novelaId)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Settings className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-800">Panel de Administración</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('prices')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'prices'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Precios
          </button>
          <button
            onClick={() => setActiveTab('zones')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'zones'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Zonas de Entrega
          </button>
          <button
            onClick={() => setActiveTab('novelas')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'novelas'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Novelas
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'prices' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio por Película (CUP)
                  </label>
                  <input
                    type="number"
                    value={config.moviePrice}
                    onChange={(e) => setConfig(prev => ({ ...prev, moviePrice: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio por Serie/Temporada (CUP)
                  </label>
                  <input
                    type="number"
                    value={config.seriesPrice}
                    onChange={(e) => setConfig(prev => ({ ...prev, seriesPrice: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recargo por Transferencia (%)
                  </label>
                  <input
                    type="number"
                    value={config.transferSurcharge}
                    onChange={(e) => setConfig(prev => ({ ...prev, transferSurcharge: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'zones' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Zonas de Entrega</h3>
                <button
                  onClick={addDeliveryZone}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar Zona</span>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {config.deliveryZones.map((zone) => (
                  <div key={zone.id} className="border border-gray-200 rounded-lg p-4">
                    {editingZone?.id === zone.id ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editingZone.name}
                          onChange={(e) => setEditingZone({ ...editingZone, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="number"
                          value={editingZone.price}
                          onChange={(e) => setEditingZone({ ...editingZone, price: Number(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => updateDeliveryZone(editingZone)}
                            className="flex-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                          >
                            Guardar
                          </button>
                          <button
                            onClick={() => setEditingZone(null)}
                            className="flex-1 px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h4 className="font-medium text-gray-800">{zone.name}</h4>
                        <p className="text-gray-600">${zone.price} CUP</p>
                        <div className="flex space-x-2 mt-3">
                          <button
                            onClick={() => setEditingZone(zone)}
                            className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Editar</span>
                          </button>
                          <button
                            onClick={() => deleteDeliveryZone(zone.id)}
                            className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Eliminar</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'novelas' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Catálogo de Novelas</h3>
                <button
                  onClick={addNovela}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar Novela</span>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {config.novelas.map((novela) => (
                  <div key={novela.id} className="border border-gray-200 rounded-lg p-4">
                    {editingNovela?.id === novela.id ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editingNovela.title}
                          onChange={(e) => setEditingNovela({ ...editingNovela, title: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Título"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={editingNovela.genre}
                            onChange={(e) => setEditingNovela({ ...editingNovela, genre: e.target.value })}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Género"
                          />
                          <input
                            type="number"
                            value={editingNovela.year}
                            onChange={(e) => setEditingNovela({ ...editingNovela, year: Number(e.target.value) })}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Año"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <input
                            type="number"
                            step="0.1"
                            value={editingNovela.rating}
                            onChange={(e) => setEditingNovela({ ...editingNovela, rating: Number(e.target.value) })}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Rating"
                          />
                          <input
                            type="text"
                            value={editingNovela.duration}
                            onChange={(e) => setEditingNovela({ ...editingNovela, duration: e.target.value })}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Duración"
                          />
                          <input
                            type="number"
                            value={editingNovela.episodes}
                            onChange={(e) => setEditingNovela({ ...editingNovela, episodes: Number(e.target.value) })}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Episodios"
                          />
                        </div>
                        <select
                          value={editingNovela.status}
                          onChange={(e) => setEditingNovela({ ...editingNovela, status: e.target.value as 'completed' | 'ongoing' })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="completed">Completada</option>
                          <option value="ongoing">En emisión</option>
                        </select>
                        <input
                          type="url"
                          value={editingNovela.image}
                          onChange={(e) => setEditingNovela({ ...editingNovela, image: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="URL de imagen"
                        />
                        <textarea
                          value={editingNovela.description}
                          onChange={(e) => setEditingNovela({ ...editingNovela, description: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={3}
                          placeholder="Descripción"
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => updateNovela(editingNovela)}
                            className="flex-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                          >
                            Guardar
                          </button>
                          <button
                            onClick={() => setEditingNovela(null)}
                            className="flex-1 px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex space-x-4">
                        <img
                          src={novela.image}
                          alt={novela.title}
                          className="w-20 h-28 object-cover rounded-md"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800">{novela.title}</h4>
                          <p className="text-sm text-gray-600">{novela.genre} • {novela.year}</p>
                          <p className="text-sm text-gray-600">⭐ {novela.rating} • {novela.episodes} eps</p>
                          <p className="text-xs text-gray-500 mt-1">{novela.description.substring(0, 80)}...</p>
                          <div className="flex space-x-2 mt-3">
                            <button
                              onClick={() => setEditingNovela(novela)}
                              className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Editar</span>
                            </button>
                            <button
                              onClick={() => deleteNovela(novela.id)}
                              className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Eliminar</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="flex space-x-3">
            <button
              onClick={handleSaveConfig}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Configuración</span>
            </button>
            <button
              onClick={handleExportConfig}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Exportar</span>
            </button>
            <label className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>Importar</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportConfig}
                className="hidden"
              />
            </label>
          </div>
          <p className="text-sm text-gray-500">
            Última modificación: {new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}