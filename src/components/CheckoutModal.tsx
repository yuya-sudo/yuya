import React, { useState } from 'react';
import { X, User, MapPin, Phone, Copy, Check, MessageCircle, Calculator, DollarSign, CreditCard } from 'lucide-react';

// ARCHIVO GENERADO AUTOMÁTICAMENTE - SINCRONIZADO CON PANEL DE CONTROL
// Última actualización: 2025-08-21T08:15:57.989Z

// Zonas de entrega sincronizadas desde el panel de control
const DELIVERY_ZONES = {
  'Por favor seleccionar su Barrio/Zona': 0,
  'Santiago de Cuba > Santiago de Cuba > Nuevo Vista Alegre': 100,
  'Santiago de Cuba > Santiago de Cuba > Vista Alegre': 300
};

// Porcentaje de transferencia sincronizado
const TRANSFER_FEE_PERCENTAGE = 15;

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

export function CheckoutModal({ isOpen, onClose, onCheckout, items, total }: CheckoutModalProps) {
  // Implementación completa con datos sincronizados...
  return (
    <div>CheckoutModal Component con datos sincronizados</div>
  );
}