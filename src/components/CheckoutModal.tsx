import React, { useState } from 'react';
import { X, MapPin, User, Phone, MessageCircle, DollarSign, CreditCard } from 'lucide-react';

export interface OrderData {
  customerInfo: CustomerInfo;
  items: any[];
  subtotal: number;
  transferFee: number;
  total: number;
  deliveryCost: number;
  cashTotal: number;
  transferTotal: number;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  zone: string;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: (orderData: OrderData) => void;
  items: Array<{
    id: number;
    title: string;
    price: number;
    quantity: number;
  }>;
  total: number;
}

const deliveryZones = [
  { name: 'Vedado', cost: 50 },
  { name: 'Centro Habana', cost: 60 },
  { name: 'Habana Vieja', cost: 70 },
  { name: 'Plaza de la Revolución', cost: 55 },
  { name: 'Cerro', cost: 65 },
  { name: 'Marianao', cost: 80 },
  { name: 'La Lisa', cost: 90 },
  { name: 'Boyeros', cost: 85 },
  { name: 'Arroyo Naranjo', cost: 95 },
  { name: 'Cotorro', cost: 100 },
  { name: 'San Miguel del Padrón', cost: 75 },
  { name: 'Guanabacoa', cost: 85 },
  { name: 'Regla', cost: 80 },
  { name: 'Habana del Este', cost: 90 },
  { name: '10 de Octubre', cost: 70 },
  { name: 'Playa', cost: 75 },
  { name: 'Diez de Octubre', cost: 70 },
  { name: 'San José de las Lajas', cost: 120 },
  { name: 'Bejucal', cost: 110 },
  { name: 'Madruga', cost: 130 },
  { name: 'Nueva Paz', cost: 140 },
  { name: 'Güines', cost: 125 },
  { name: 'Melena del Sur', cost: 135 }
];

export function CheckoutModal({ isOpen, onClose, onCheckout, items, total }: CheckoutModalProps) {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    phone: '',
    address: '',
    zone: ''
  });

  const [selectedZone, setSelectedZone] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerInfo.name || !customerInfo.phone || !customerInfo.address || !selectedZone) {
      alert('Por favor, complete todos los campos');
      return;
    }

    const zone = deliveryZones.find(z => z.name === selectedZone);
    const deliveryCost = zone ? zone.cost : 0;

    const orderData: OrderData = {
      customerInfo: {
        ...customerInfo,
        zone: selectedZone
      },
      items,
      subtotal: total,
      transferFee: 0,
      total: total + deliveryCost,
      deliveryCost,
      cashTotal: 0,
      transferTotal: 0
    };

    onCheckout(orderData);
  };

  const selectedZoneData = deliveryZones.find(z => z.name === selectedZone);
  const deliveryCost = selectedZoneData ? selectedZoneData.cost : 0;
  const finalTotal = total + deliveryCost;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center">
              <MessageCircle className="mr-3 h-6 w-6" />
              Finalizar Pedido
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors p-2 hover:bg-white/20 rounded-full"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Customer Information */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="mr-2 h-5 w-5 text-blue-600" />
              Información del Cliente
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  required
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ingrese su nombre completo"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  required
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+53 5xxx xxxx"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dirección completa *
              </label>
              <textarea
                required
                value={customerInfo.address}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Calle, número, entre calles, referencias..."
              />
            </div>
          </div>

          {/* Delivery Zone */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="mr-2 h-5 w-5 text-green-600" />
              Zona de Entrega
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccione su zona *
              </label>
              <select
                required
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Seleccione una zona</option>
                {deliveryZones.map((zone) => (
                  <option key={zone.name} value={zone.name}>
                    {zone.name} - ${zone.cost} CUP
                  </option>
                ))}
              </select>
            </div>
            
            {selectedZoneData && (
              <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-700">
                  <strong>Costo de entrega:</strong> ${selectedZoneData.cost} CUP
                </p>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Resumen del Pedido
            </h3>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Subtotal ({items.length} elementos):</span>
                <span className="font-medium">${total.toLocaleString()} CUP</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Costo de entrega:</span>
                <span className="font-medium">${deliveryCost.toLocaleString()} CUP</span>
              </div>
              
              <div className="border-t border-gray-300 pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total:</span>
                  <span className="text-xl font-bold text-blue-600">
                    ${finalTotal.toLocaleString()} CUP
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Enviar por WhatsApp
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Su pedido será enviado por WhatsApp para confirmar los detalles
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}