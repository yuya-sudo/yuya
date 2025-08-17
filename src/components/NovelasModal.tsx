import React, { useState, useEffect } from 'react';
import { X, Download, MessageCircle, Phone, BookOpen, Info, Check, DollarSign, CreditCard, Calculator } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

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

export function NovelasModal({ isOpen, onClose }: NovelasModalProps) {
  const { state: adminState } = useAdmin();
  const [selectedNovelas, setSelectedNovelas] = useState<number[]>([]);
  const [novelasWithPayment, setNovelasWithPayment] = useState<Novela[]>([]);
  const [showContactOptions, setShowContactOptions] = useState(false);
  const [showNovelList, setShowNovelList] = useState(false);

  // Get novelas from admin config
  const novelas: Novela[] = adminState.config.novelas.map(novela => ({
    id: novela.id,
    titulo: novela.titulo,
    genero: novela.genero,
    capitulos: novela.capitulos,
    año: novela.año,
    descripcion: novela.descripcion
  }));

  const phoneNumber = '+5354690878';

  // Inicializar novelas con tipo de pago por defecto
  useEffect(() => {
    const novelasWithDefaultPayment = novelas.map(novela => ({
      ...novela,
      paymentType: 'cash' as const
    }));
    setNovelasWithPayment(novelasWithDefaultPayment);
  }, []);

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
    setSelectedNovelas(novelas.map(n => n.id));
  };

  const clearAllNovelas = () => {
    setSelectedNovelas([]);
  };

  // Calcular totales por tipo de pago
  const calculateTotals = () => {
    const selectedNovelasData = novelasWithPayment.filter(n => selectedNovelas.includes(n.id));
    
    const cashNovelas = selectedNovelasData.filter(n => n.paymentType === 'cash');
    const transferNovelas = selectedNovelasData.filter(n => n.paymentType === 'transfer');
    
    const cashTotal = cashNovelas.reduce((sum, n) => {
      const novelaConfig = adminState.config.novelas.find(config => config.id === n.id);
      return sum + (novelaConfig?.costoEfectivo || n.capitulos * 5);
    }, 0);
    
    const transferTotal = transferNovelas.reduce((sum, n) => {
      const novelaConfig = adminState.config.novelas.find(config => config.id === n.id);
      return sum + (novelaConfig?.costoTransferencia || Math.round((n.capitulos * 5) * 1.1));
    }, 0);
    
    const transferBaseTotal = transferNovelas.reduce((sum, n) => {
      const novelaConfig = adminState.config.novelas.find(config => config.id === n.id);
      return sum + (novelaConfig?.costoEfectivo || n.capitulos * 5);
    }, 0);
    
    const transferFee = transferTotal - transferBaseTotal;
    
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
    // Get admin config for dynamic pricing
    const adminConfig = JSON.parse(localStorage.getItem('adminConfig') || '{}');
    const transferFeePercentage = adminConfig.pricing?.transferFeePercentage || 10;
    
    let listText = "📚 CATÁLOGO DE NOVELAS DISPONIBLES\n";
    listText += "TV a la Carta - Novelas Completas\n\n";
    listText += "💰 Precios variables según novela\n";
    listText += "📱 Contacto: +5354690878\n\n";
    listText += "═══════════════════════════════════\n\n";
    
    // Separar novelas por tipo de pago para mostrar cálculos
    listText += "💵 PRECIOS EN EFECTIVO:\n";
    listText += "═══════════════════════════════════\n\n";
    
    novelas.forEach((novela, index) => {
      const novelaConfig = adminState.config.novelas.find(config => config.id === novela.id);
      const baseCost = novelaConfig?.costoEfectivo || novela.capitulos * 5;
      listText += `${index + 1}. ${novela.titulo}\n`;
      listText += `   📺 Género: ${novela.genero}\n`;
      listText += `   📊 Capítulos: ${novela.capitulos}\n`;
      listText += `   📅 Año: ${novela.año}\n`;
      listText += `   💰 Costo en efectivo: $${baseCost.toLocaleString()} CUP\n\n`;
    });
    
    listText += `\n🏦 PRECIOS CON TRANSFERENCIA BANCARIA (+${transferFeePercentage}%):\n`;
    listText += "═══════════════════════════════════\n\n";
    
    novelas.forEach((novela, index) => {
      const novelaConfig = adminState.config.novelas.find(config => config.id === novela.id);
      const baseCost = novelaConfig?.costoEfectivo || novela.capitulos * 5;
      const transferCost = novelaConfig?.costoTransferencia || Math.round(baseCost * 1.1);
      const recargo = transferCost - baseCost;
      listText += `${index + 1}. ${novela.titulo}\n`;
      listText += `   📺 Género: ${novela.genero}\n`;
      listText += `   📊 Capítulos: ${novela.capitulos}\n`;
      listText += `   📅 Año: ${novela.año}\n`;
      listText += `   💰 Costo base: $${baseCost.toLocaleString()} CUP\n`;
      listText += `   💳 Recargo (${transferFeePercentage}%): +$${recargo.toLocaleString()} CUP\n`;
      listText += `   💰 Costo con transferencia: $${transferCost.toLocaleString()} CUP\n\n`;
    });
    
    listText += "\n📊 RESUMEN DE COSTOS:\n";
    listText += "═══════════════════════════════════\n\n";
    
    const totalCapitulos = novelas.reduce((sum, novela) => sum + novela.capitulos, 0);
    const totalEfectivo = novelas.reduce((sum, novela) => {
      const novelaConfig = adminState.config.novelas.find(config => config.id === novela.id);
      return sum + (novelaConfig?.costoEfectivo || novela.capitulos * 5);
    }, 0);
    const totalTransferencia = novelas.reduce((sum, novela) => {
      const novelaConfig = adminState.config.novelas.find(config => config.id === novela.id);
      return sum + (novelaConfig?.costoTransferencia || Math.round((novela.capitulos * 5) * 1.1));
    }, 0);
    const totalRecargo = totalTransferencia - totalEfectivo;
    
    listText += `📊 Total de novelas: ${novelas.length}\n`;
    listText += `📊 Total de capítulos: ${totalCapitulos.toLocaleString()}\n\n`;
    listText += `💵 CATÁLOGO COMPLETO EN EFECTIVO:\n`;
    listText += `   💰 Costo total: $${totalEfectivo.toLocaleString()} CUP\n\n`;
    listText += `🏦 CATÁLOGO COMPLETO CON TRANSFERENCIA:\n`;
    listText += `   💰 Costo base: $${totalEfectivo.toLocaleString()} CUP\n`;
    listText += `   💳 Recargo total (${transferFeePercentage}%): +$${totalRecargo.toLocaleString()} CUP\n`;
    listText += `   💰 Costo total con transferencia: $${totalTransferencia.toLocaleString()} CUP\n\n`;
    
    listText += "═══════════════════════════════════\n";
    listText += "💡 INFORMACIÓN IMPORTANTE:\n";
    listText += "• Los precios en efectivo no tienen recargo adicional\n";
    listText += `• Las transferencias bancarias tienen un ${transferFeePercentage}% de recargo\n`;
    listText += "• Puedes seleccionar novelas individuales o el catálogo completo\n";
    listText += "• Todos los precios están en pesos cubanos (CUP)\n\n";
    listText += "📞 Para encargar, contacta al +5354690878\n";
    listText += "🌟 ¡Disfruta de las mejores novelas!\n";
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

  const sendSelectedNovelas = () => {
    if (selectedNovelas.length === 0) {
      alert('Por favor selecciona al menos una novela');
      return;
    }

    const { cashNovelas, transferNovelas, cashTotal, transferBaseTotal, transferFee, transferTotal, grandTotal, totalCapitulos } = totals;
    const adminConfig = JSON.parse(localStorage.getItem('adminConfig') || '{}');
    const transferFeePercentage = adminConfig.pricing?.transferFeePercentage || 10;
    
    let message = "Estoy interesado en el catálogo de novelas\nQuiero encargar los títulos o el título:\n\n";
    
    // Novelas en efectivo
    if (cashNovelas.length > 0) {
      message += "💵 PAGO EN EFECTIVO:\n";
      message += "═══════════════════════════════════\n";
      cashNovelas.forEach((novela, index) => {
        const novelaConfig = adminState.config.novelas.find(config => config.id === novela.id);
        const costo = novelaConfig?.costoEfectivo || novela.capitulos * 5;
        message += `${index + 1}. ${novela.titulo}\n`;
        message += `   📺 Género: ${novela.genero}\n`;
        message += `   📊 Capítulos: ${novela.capitulos}\n`;
        message += `   📅 Año: ${novela.año}\n`;
        message += `   💰 Costo: $${costo.toLocaleString()} CUP\n\n`;
      });
      message += `💰 Subtotal Efectivo: $${cashTotal.toLocaleString()} CUP\n`;
      message += `📊 Total capítulos: ${cashNovelas.reduce((sum, n) => sum + n.capitulos, 0)}\n\n`;
    }
    
    // Novelas por transferencia
    if (transferNovelas.length > 0) {
      message += `🏦 PAGO POR TRANSFERENCIA BANCARIA (+${transferFeePercentage}%):\n`;
      message += "═══════════════════════════════════\n";
      transferNovelas.forEach((novela, index) => {
        const novelaConfig = adminState.config.novelas.find(config => config.id === novela.id);
        const baseCost = novelaConfig?.costoEfectivo || novela.capitulos * 5;
        const totalCost = novelaConfig?.costoTransferencia || Math.round(baseCost * 1.1);
        const fee = totalCost - baseCost;
        message += `${index + 1}. ${novela.titulo}\n`;
        message += `   📺 Género: ${novela.genero}\n`;
        message += `   📊 Capítulos: ${novela.capitulos}\n`;
        message += `   📅 Año: ${novela.año}\n`;
        message += `   💰 Costo base: $${baseCost.toLocaleString()} CUP\n`;
        message += `   💳 Recargo (${transferFeePercentage}%): +$${fee.toLocaleString()} CUP\n`;
        message += `   💰 Costo total: $${totalCost.toLocaleString()} CUP\n\n`;
      });
      message += `💰 Subtotal base transferencia: $${transferBaseTotal.toLocaleString()} CUP\n`;
      message += `💳 Recargo total (${transferFeePercentage}%): +$${transferFee.toLocaleString()} CUP\n`;
      message += `💰 Subtotal Transferencia: $${transferTotal.toLocaleString()} CUP\n`;
      message += `📊 Total capítulos: ${transferNovelas.reduce((sum, n) => sum + n.capitulos, 0)}\n\n`;
    }
    
    // Resumen final
    message += "📊 RESUMEN FINAL:\n";
    message += "═══════════════════════════════════\n";
    message += `• Total de novelas: ${selectedNovelas.length}\n`;
    message += `• Total de capítulos: ${totalCapitulos}\n`;
    if (cashTotal > 0) {
      message += `• Efectivo: $${cashTotal.toLocaleString()} CUP (${cashNovelas.length} novelas)\n`;
    }
    if (transferTotal > 0) {
      message += `• Transferencia: $${transferTotal.toLocaleString()} CUP (${transferNovelas.length} novelas)\n`;
    }
    message += `• TOTAL A PAGAR: $${grandTotal.toLocaleString()} CUP\n\n`;
    message += `📱 Enviado desde TV a la Carta\n`;
    message += `📅 Fecha: ${new Date().toLocaleString('es-ES')}`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/5354690878?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCall = () => {
    window.open(`tel:${phoneNumber}`, '_self');
  };

  const handleWhatsApp = () => {
    const message = "Gracias por escribir a [TV a la Carta], se ha comunicado con el operador [Yero], Gracias por dedicarnos un momento de su tiempo hoy. ¿En qué puedo serle útil?";
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/5354690878?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden shadow-2xl animate-in fade-in duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-600 to-purple-600 p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 p-3 rounded-xl mr-4 shadow-lg">
                <BookOpen className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold">Catálogo de Novelas</h2>
                <p className="text-sm sm:text-base opacity-90">Novelas completas disponibles</p>
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
            {/* Información Principal */}
            <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-6 mb-6 border-2 border-pink-200">
              <div className="flex items-center mb-4">
                <div className="bg-pink-100 p-3 rounded-xl mr-4">
                  <Info className="h-6 w-6 text-pink-600" />
                </div>
                <h3 className="text-xl font-bold text-pink-900">Información Importante</h3>
              </div>
              
              <div className="space-y-4 text-pink-800">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">📚</span>
                  <p className="font-semibold">Las novelas se encargan completas</p>
                </div>
                <div className="flex items-center">
                  <span className="text-2xl mr-3">💰</span>
                  <p className="font-semibold">Precios variables según novela</p>
                </div>
                <div className="flex items-center">
                  <span className="text-2xl mr-3">💳</span>
                  <p className="font-semibold">Transferencia bancaria: +10% de recargo</p>
                </div>
                <div className="flex items-center">
                  <span className="text-2xl mr-3">📱</span>
                  <p className="font-semibold">Para más información, contacta al número:</p>
                </div>
              </div>

              {/* Número de contacto */}
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

            {/* Opciones del catálogo */}
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

            {/* Lista de novelas */}
            {showNovelList && (
              <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden">
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

                {/* Resumen de totales */}
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
                        <div className="text-2xl font-bold text-green-600">${totals.cashTotal.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">Efectivo</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
                        <div className="text-2xl font-bold text-orange-600">${totals.transferTotal.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">Transferencia</div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-4 border-2 border-green-300">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900">TOTAL A PAGAR:</span>
                        <span className="text-2xl font-bold text-green-600">${totals.grandTotal.toLocaleString()} CUP</span>
                      </div>
                      {totals.transferFee > 0 && (
                        <div className="text-sm text-orange-600 mt-2">
                          Incluye ${totals.transferFee.toLocaleString()} CUP de recargo por transferencia
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="max-h-96 overflow-y-auto p-4">
                  <div className="grid grid-cols-1 gap-3">
                    {novelasWithPayment.map((novela) => {
                      const isSelected = selectedNovelas.includes(novela.id);
                      const novelaConfig = adminState.config.novelas.find(config => config.id === novela.id);
                      const baseCost = novelaConfig?.costoEfectivo || novela.capitulos * 5;
                      const transferCost = novelaConfig?.costoTransferencia || Math.round(baseCost * 1.1);
                      const finalCost = novela.paymentType === 'transfer' ? transferCost : baseCost;
                      
                      return (
                        <div
                          key={novela.id}
                          className={`p-4 rounded-xl border transition-all ${
                            isSelected 
                              ? 'bg-purple-50 border-purple-300 shadow-md' 
                              : 'bg-gray-50 border-gray-200 hover:bg-purple-25 hover:border-purple-200'
                          }`}
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
                                  
                                  {/* Selector de tipo de pago */}
                                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                                    <span className="text-sm font-medium text-gray-700">Tipo de pago:</span>
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={() => handlePaymentTypeChange(novela.id, 'cash')}
                                        className={`px-3 py-2 rounded-full text-xs font-medium transition-colors ${
                                          novela.paymentType === 'cash'
                                            ? 'bg-green-500 text-white'
                                            : 'bg-gray-200 text-gray-600 hover:bg-green-100'
                                        }`}
                                      >
                                        <DollarSign className="h-3 w-3 inline mr-1" />
                                        Efectivo
                                      </button>
                                      <button
                                        onClick={() => handlePaymentTypeChange(novela.id, 'transfer')}
                                        className={`px-3 py-2 rounded-full text-xs font-medium transition-colors ${
                                          novela.paymentType === 'transfer'
                                            ? 'bg-orange-500 text-white'
                                            : 'bg-gray-200 text-gray-600 hover:bg-orange-100'
                                        }`}
                                      >
                                        <CreditCard className="h-3 w-3 inline mr-1" />
                                        Transferencia (+10%)
                                      </button>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="text-right sm:ml-4">
                                  <div className={`text-lg font-bold ${
                                    novela.paymentType === 'cash' ? 'text-green-600' : 'text-orange-600'
                                  }`}>
                                    ${finalCost.toLocaleString()} CUP
                                  </div>
                                  {novela.paymentType === 'transfer' && (
                                    <div className="text-xs text-gray-500">
                                      Base: ${baseCost.toLocaleString()} CUP
                                      <br />
                                      Recargo: +${(transferCost - baseCost).toLocaleString()} CUP
                                    </div>
                                  )}
                                  <div className="text-xs text-gray-500 mt-1">
                                    ${Math.round(baseCost / novela.capitulos)} CUP × {novela.capitulos} cap.
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
                    })}
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
                          Total: ${totals.grandTotal.toLocaleString()} CUP
                        </p>
                      </div>
                      <button
                        onClick={sendSelectedNovelas}
                        disabled={selectedNovelas.length === 0}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center ${
                          selectedNovelas.length > 0
                            ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
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
}