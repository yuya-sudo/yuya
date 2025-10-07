import React, { useState, useEffect } from 'react';
import { X, Download, BookOpen, Search, Filter, FileText, ShoppingCart, Globe, Check, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import type { NovelCartItem } from '../types/movie';

interface Novela {
  id: number;
  titulo: string;
  genero: string;
  capitulos: number;
  año: number;
  descripcion?: string;
  paymentType?: 'cash' | 'transfer';
  pais?: string;
  imagen?: string;
  estado?: 'transmision' | 'finalizada';
}

interface NovelasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFinalizePedido?: (selectedNovels: NovelCartItem[]) => void;
}

export function NovelasModal({ isOpen, onClose, onFinalizePedido }: NovelasModalProps) {
  const { getCurrentPrices, addNovel } = useCart();
  const [selectedNovelas, setSelectedNovelas] = useState<number[]>([]);
  const [novelasWithPayment, setNovelasWithPayment] = useState<Novela[]>([]);
  const [showNovelList, setShowNovelList] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState<'titulo' | 'año' | 'capitulos' | 'pais'>('titulo');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentSection, setCurrentSection] = useState<'transmision' | 'finalizada'>('transmision');
  const [adminNovels, setAdminNovels] = useState<any[]>([]);

  const currentPrices = getCurrentPrices();
  const novelPricePerChapter = currentPrices.novelPricePerChapter;
  const transferFeePercentage = currentPrices.transferFeePercentage;
  
  const phoneNumber = '+5354690878';

  // Load novels from admin config
  useEffect(() => {
    const loadNovels = () => {
      try {
        const adminConfig = localStorage.getItem('system_config');
        if (adminConfig) {
          const config = JSON.parse(adminConfig);
          if (config.novels) {
            setAdminNovels(config.novels);
          }
        }
      } catch (error) {
        console.error('Error loading novels:', error);
      }
    };

    loadNovels();

    // Listen for admin updates
    const handleAdminStateChange = (event: CustomEvent) => {
      if (event.detail.type === 'novel_add' || 
          event.detail.type === 'novel_update' || 
          event.detail.type === 'novel_delete') {
        loadNovels();
      }
    };

    const handleAdminFullSync = (event: CustomEvent) => {
      if (event.detail.config?.novels) {
        setAdminNovels(event.detail.config.novels);
      }
    };

    window.addEventListener('admin_state_change', handleAdminStateChange as EventListener);
    window.addEventListener('admin_full_sync', handleAdminFullSync as EventListener);

    return () => {
      window.removeEventListener('admin_state_change', handleAdminStateChange as EventListener);
      window.removeEventListener('admin_full_sync', handleAdminFullSync as EventListener);
    };
  }, []);

  // Base novels list (can be empty if only using admin novels)
  const defaultNovelas: Novela[] = [];

  // Combine admin novels with default novels
  const allNovelas = [...defaultNovelas, ...adminNovels.map(novel => ({
    id: novel.id,
    titulo: novel.titulo,
    genero: novel.genero,
    capitulos: novel.capitulos,
    año: novel.año,
    descripcion: novel.descripcion,
    pais: novel.pais || 'No especificado',
    imagen: novel.imagen,
    estado: novel.estado || 'finalizada'
  }))];

  // Get unique values for filters
  const uniqueGenres = [...new Set(allNovelas.map(novela => novela.genero))].sort();
  const uniqueYears = [...new Set(allNovelas.map(novela => novela.año))].sort((a, b) => b - a);
  const uniqueCountries = [...new Set(allNovelas.map(novela => novela.pais))].sort();
  const statusOptions = [
    { value: 'transmision', label: 'En Transmisión' },
    { value: 'finalizada', label: 'Finalizada' }
  ];

  // Initialize novels with default payment type
  useEffect(() => {
    const novelasWithDefaultPayment = allNovelas.map(novela => ({
      ...novela,
      paymentType: 'cash' as const
    }));
    setNovelasWithPayment(novelasWithDefaultPayment);
    
    // Cargar novelas previamente seleccionadas del carrito
    const cartItems = JSON.parse(localStorage.getItem('movieCart') || '[]');
    const novelasEnCarrito = cartItems
      .filter((item: any) => item.type === 'novel')
      .map((item: any) => item.id);
    
    if (novelasEnCarrito.length > 0) {
      setSelectedNovelas(novelasEnCarrito);
    }
  }, [adminNovels]);

  // Filter novels function
  const getFilteredNovelas = () => {
    let filtered = novelasWithPayment.filter(novela => {
      // Improved search: split search term by spaces and check if all words are found
      const searchWords = searchTerm.toLowerCase().trim().split(/\s+/);
      const novelTitle = novela.titulo.toLowerCase();
      const matchesSearch = searchTerm === '' || searchWords.every(word => 
        novelTitle.includes(word) || 
        novela.genero.toLowerCase().includes(word) ||
        (novela.pais && novela.pais.toLowerCase().includes(word))
      );
      const matchesGenre = selectedGenre === '' || novela.genero === selectedGenre;
      const matchesYear = selectedYear === '' || novela.año.toString() === selectedYear;
      const matchesCountry = selectedCountry === '' || novela.pais === selectedCountry;
      const matchesStatus = selectedStatus === '' || novela.estado === selectedStatus;
      const matchesCurrentSection = novela.estado === currentSection;
      
      return matchesSearch && matchesGenre && matchesYear && matchesCountry && matchesStatus && matchesCurrentSection;
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
        case 'pais':
          comparison = a.pais.localeCompare(b.pais);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  };

  const filteredNovelas = getFilteredNovelas();

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
    setSelectedNovelas(filteredNovelas.map(n => n.id));
  };

  const clearAllNovelas = () => {
    setSelectedNovelas([]);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedGenre('');
    setSelectedYear('');
    setSelectedCountry('');
    setSelectedStatus('');
    setSortBy('titulo');
    setSortOrder('asc');
  };

  // Calculate totals by payment type with current pricing
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
    let listText = "📚 CATÁLOGO DE NOVELAS DISPONIBLES\n";
    listText += "TV a la Carta - Novelas Completas\n\n";
    listText += `💰 Precio: $${novelPricePerChapter} CUP por capítulo\n`;
    listText += `💳 Recargo transferencia: ${transferFeePercentage}%\n`;
    listText += "\n";
    listText += "═══════════════════════════════════\n\n";
    
    if (allNovelas.length === 0) {
      listText += "📋 No hay novelas disponibles en este momento.\n";
      listText += "\n";
    } else {
      listText += "💵 PRECIOS EN EFECTIVO:\n";
      listText += "═══════════════════════════════════\n\n";
      
      allNovelas.forEach((novela, index) => {
        const baseCost = novela.capitulos * novelPricePerChapter;
        listText += `${index + 1}. ${novela.titulo}\n`;
        listText += `   📺 Género: ${novela.genero}\n`;
        listText += `   🌍 País: ${novela.pais}\n`;
        listText += `   📊 Capítulos: ${novela.capitulos}\n`;
        listText += `   📅 Año: ${novela.año}\n`;
        listText += `   📡 Estado: ${novela.estado === 'transmision' ? 'En Transmisión' : 'Finalizada'}\n`;
        listText += `   💰 Costo en efectivo: $${baseCost.toLocaleString()} CUP\n\n`;
      });
      
      listText += `\n🏦 PRECIOS CON TRANSFERENCIA BANCARIA (+${transferFeePercentage}%):\n`;
      listText += "═══════════════════════════════════\n\n";
      
      allNovelas.forEach((novela, index) => {
        const baseCost = novela.capitulos * novelPricePerChapter;
        const transferCost = Math.round(baseCost * (1 + transferFeePercentage / 100));
        const recargo = transferCost - baseCost;
        listText += `${index + 1}. ${novela.titulo}\n`;
        listText += `   📺 Género: ${novela.genero}\n`;
        listText += `   🌍 País: ${novela.pais}\n`;
        listText += `   📊 Capítulos: ${novela.capitulos}\n`;
        listText += `   📅 Año: ${novela.año}\n`;
        listText += `   📡 Estado: ${novela.estado === 'transmision' ? 'En Transmisión' : 'Finalizada'}\n`;
        listText += `   💰 Costo base: $${baseCost.toLocaleString()} CUP\n`;
        listText += `   💳 Recargo (${transferFeePercentage}%): +$${recargo.toLocaleString()} CUP\n`;
        listText += `   💰 Costo con transferencia: $${transferCost.toLocaleString()} CUP\n\n`;
      });
    }
    
    listText += `\n📅 Generado el: ${new Date().toLocaleString('es-ES')}`;
    
    return listText;
  };

  const downloadNovelList = () => {
    const listText = generateNovelListText();
    const blob = new Blob([listText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Catalogo_Novelas_TV_a_la_Carta.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFinalizePedido = () => {
    if (selectedNovelas.length === 0) {
      alert('Por favor selecciona al menos una novela');
      return;
    }

    // Convertir novelas seleccionadas a NovelCartItem
    const selectedNovelItems: NovelCartItem[] = novelasWithPayment
      .filter(novela => selectedNovelas.includes(novela.id))
      .map(novela => ({
        id: novela.id,
        title: novela.titulo,
        type: 'novel' as const,
        genre: novela.genero,
        chapters: novela.capitulos,
        year: novela.año,
        description: novela.descripcion,
        country: novela.pais,
        status: novela.estado,
        image: novela.imagen,
        paymentType: novela.paymentType || 'cash',
        pricePerChapter: novelPricePerChapter,
        totalPrice: novela.paymentType === 'transfer' 
          ? Math.round((novela.capitulos * novelPricePerChapter) * (1 + transferFeePercentage / 100))
          : novela.capitulos * novelPricePerChapter
      }));

    // Agregar novelas al carrito
    selectedNovelItems.forEach(novel => {
      addNovel(novel);
    });

    // Cerrar modal
    onClose();
    
    // Opcional: callback para ir directamente al checkout
    if (onFinalizePedido) {
      onFinalizePedido(selectedNovelItems);
    }
  };

  const getNovelImage = (novela: Novela) => {
    if (novela.imagen) {
      return novela.imagen;
    }
    // Imagen por defecto basada en el género
    const genreImages = {
      'Drama': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop',
      'Romance': 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=300&h=400&fit=crop',
      'Acción': 'https://images.unsplash.com/photo-1489599843253-c76cc4bcb8cf?w=300&h=400&fit=crop',
      'Comedia': 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=400&fit=crop',
      'Familia': 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=300&h=400&fit=crop'
    };
    
    return genreImages[novela.genero as keyof typeof genreImages] || 
           'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop';
  };

  const getCountryFlag = (country: string) => {
    const flags: { [key: string]: string } = {
      'Turquía': '🇹🇷',
      'Cuba': '🇨🇺',
      'México': '🇲🇽',
      'Brasil': '🇧🇷',
      'Colombia': '🇨🇴',
      'Argentina': '🇦🇷',
      'España': '🇪🇸',
      'Estados Unidos': '🇺🇸',
      'Corea del Sur': '🇰🇷',
      'India': '🇮🇳',
      'Reino Unido': '🇬🇧',
      'Francia': '🇫🇷',
      'Italia': '🇮🇹',
      'Alemania': '🇩🇪',
      'Japón': '🇯🇵',
      'China': '🇨🇳',
      'Rusia': '🇷🇺',
      'No especificado': '🌍'
    };
    return flags[country] || '🌍';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden shadow-2xl animate-in fade-in duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-600 to-purple-600 p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 p-3 rounded-xl mr-4 shadow-lg">
                <BookOpen className="h-6 w-6 sm:h-8 sm:w-8" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Catálogo de Novelas</h2>
                <p className="text-sm sm:text-base opacity-90">Explora y selecciona novelas</p>
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
          <div className="p-3 sm:p-6">
            {/* Catalog options */}
            <div className="flex justify-center mb-6">
              <button
                onClick={downloadNovelList}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center space-x-3"
              >
                <div className="bg-white/20 p-2 rounded-lg">
                  <FileText className="h-5 w-5" />
                </div>
                <span>Descargar Catálogo</span>
              </button>
            </div>

            {/* Show message when no novels available */}
            {allNovelas.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
                <BookOpen className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                  No hay novelas disponibles
                </h3>
                <p className="text-yellow-700">
                  El catálogo de novelas está vacío. Contacta con el administrador para agregar novelas al sistema.
                </p>
              </div>
            )}

            {/* Netflix-style sections */}
            {allNovelas.length > 0 && (
              <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden">
                {/* Section Navigation */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 border-b border-gray-200">
                  <div className="flex items-center justify-center space-x-4 mb-4">
                    <button
                      onClick={() => setCurrentSection('transmision')}
                      className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                        currentSection === 'transmision'
                          ? 'bg-red-500 text-white shadow-lg scale-105'
                          : 'bg-white text-red-600 hover:bg-red-50 border border-red-200'
                      }`}
                    >
                      📡 En Transmisión
                    </button>
                    <button
                      onClick={() => setCurrentSection('finalizada')}
                      className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                        currentSection === 'finalizada'
                          ? 'bg-green-500 text-white shadow-lg scale-105'
                          : 'bg-white text-green-600 hover:bg-green-50 border border-green-200'
                      }`}
                    >
                      ✅ Finalizadas
                    </button>
                  </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 sm:p-6 border-b border-gray-200">
                  <div className="flex items-center mb-4 sm:mb-6">
                    <Filter className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 mr-3" />
                    <h4 className="text-base sm:text-xl font-bold text-purple-900">Buscar Novelas</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Buscar por título, género, país..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm"
                      />
                    </div>
                    
                    <select
                      value={selectedGenre}
                      onChange={(e) => setSelectedGenre(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm"
                    >
                      <option value="">Todos los géneros</option>
                      {uniqueGenres.map(genre => (
                        <option key={genre} value={genre}>{genre}</option>
                      ))}
                    </select>
                    
                    <select
                      value={selectedCountry}
                      onChange={(e) => setSelectedCountry(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm"
                    >
                      <option value="">Todos los países</option>
                      {uniqueCountries.map(country => (
                        <option key={country} value={country}>
                          {getCountryFlag(country)} {country}
                        </option>
                      ))}
                    </select>
                    
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm"
                    >
                      <option value="">Todos los años</option>
                      {uniqueYears.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
                    <div className="text-sm text-purple-700 bg-white/60 px-4 py-2 rounded-xl text-center sm:text-left">
                      <strong>Mostrando {filteredNovelas.length} de {allNovelas.filter(n => n.estado === currentSection).length} novelas</strong>
                      {(searchTerm || selectedGenre || selectedYear || selectedCountry) && (
                        <span className="block sm:inline sm:ml-2 text-purple-600">• Filtros activos</span>
                      )}
                    </div>
                    
                    {(searchTerm || selectedGenre || selectedYear || selectedCountry || sortBy !== 'titulo' || sortOrder !== 'asc') && (
                      <button
                        onClick={clearFilters}
                        className="text-xs sm:text-sm bg-purple-200 hover:bg-purple-300 text-purple-800 px-3 sm:px-4 py-2 rounded-xl transition-colors font-medium w-full sm:w-auto text-center"
                      >
                        Limpiar filtros
                      </button>
                    )}
                  </div>
                </div>

                {/* Netflix-style grid */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="mr-2">
                      {currentSection === 'transmision' ? '📡' : '✅'}
                    </span>
                    {currentSection === 'transmision' ? 'Novelas en Transmisión' : 'Novelas Finalizadas'}
                    <span className="ml-2 text-sm font-normal text-gray-600">
                      ({filteredNovelas.length})
                    </span>
                  </h3>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {filteredNovelas.length > 0 ? (
                      filteredNovelas.map((novela) => {
                      const isSelected = selectedNovelas.includes(novela.id);
                      
                      return (
                        <div
                          key={novela.id}
                          onClick={() => handleNovelToggle(novela.id)}
                          className={`group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                            isSelected
                              ? 'ring-4 ring-purple-500 scale-105 shadow-2xl'
                              : 'hover:shadow-xl'
                          }`}
                        >
                          <div className="relative w-full aspect-[2/3] bg-gray-200 rounded-xl overflow-hidden">
                            <img
                              src={getNovelImage(novela)}
                              alt={novela.titulo}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop';
                              }}
                            />

                            {/* Netflix-style overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                            {/* Selection indicator */}
                            <div className="absolute top-2 right-2 z-10">
                              <div className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center transition-all duration-300 ${
                                isSelected 
                                  ? 'bg-purple-500 scale-110' 
                                  : 'bg-black/50 group-hover:bg-white/20'
                              }`}>
                                {isSelected && <Check className="h-4 w-4 text-white" />}
                              </div>
                            </div>

                            {/* Country flag */}
                            <div className="absolute top-2 left-2 z-10">
                              <span className={`px-2 py-1 rounded-full text-xs font-bold text-white shadow-lg ${
                                currentSection === 'transmision' ? 'bg-red-500/80' : 'bg-green-500/80'
                              }`}>
                                {getCountryFlag(novela.pais)}
                              </span>
                            </div>

                            {/* Netflix-style info overlay */}
                            <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                              <div className="bg-gradient-to-t from-black/90 to-transparent rounded-b-xl p-3 -m-3">
                                <h3 className="text-white font-bold text-sm mb-2 line-clamp-2">{novela.titulo}</h3>
                                <div className="flex items-center justify-between text-white text-xs mb-2">
                                  <span className="bg-white/20 px-2 py-1 rounded-full">{novela.año}</span>
                                  <span className="bg-white/20 px-2 py-1 rounded-full">{novela.capitulos} cap.</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-white/90 text-xs">{novela.genero}</span>
                                  <span className="text-white font-bold text-sm">
                                    ${(novela.capitulos * novelPricePerChapter).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                      })
                    ) : (
                      <div className="text-center py-12">
                        <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4 sm:mb-6" />
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
                          No hay novelas {currentSection === 'transmision' ? 'en transmisión' : 'finalizadas'}
                        </h3>
                        <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                          {searchTerm || selectedGenre || selectedYear || selectedCountry 
                            ? 'No hay novelas que coincidan con los filtros seleccionados.'
                            : `No hay novelas ${currentSection === 'transmision' ? 'en transmisión' : 'finalizadas'} disponibles.`
                          }
                        </p>
                        {(searchTerm || selectedGenre || selectedYear || selectedCountry) && (
                          <button
                            onClick={clearFilters}
                            className="bg-purple-500 hover:bg-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-sm sm:text-base font-medium transition-colors shadow-sm"
                          >
                            Limpiar filtros
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {selectedNovelas.length > 0 && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                      <div className="text-center sm:text-left">
                        <p className="text-lg font-bold text-gray-900">
                          {selectedNovelas.length} novelas seleccionadas
                        </p>
                        <p className="text-sm text-gray-600">
                          Total: ${totals.grandTotal.toLocaleString()} CUP
                        </p>
                      </div>
                      <button
                        onClick={handleFinalizePedido}
                        disabled={selectedNovelas.length === 0}
                        className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 flex items-center justify-center shadow-lg ${
                          selectedNovelas.length > 0
                            ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        Finalizar Pedido
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
}