// Archivo generado automáticamente - Sistema TV a la Carta
// Tipos y configuración del sistema administrativo
// Última modificación: 2025-08-17T19:29:10.517Z
// Configuración actual aplicada desde el panel de control

import React from 'react';

export interface AdminConfig {
  pricing: {
    moviePrice: number;
    seriesPrice: number;
    transferFeePercentage: number;
  };
  novelas: NovelasConfig[];
  deliveryZones: DeliveryZoneConfig[];
}

export interface NovelasConfig {
  id: number;
  titulo: string;
  genero: string;
  capitulos: number;
  año: number;
  costoEfectivo: number;
  costoTransferencia: number;
  descripcion?: string;
}

export interface DeliveryZoneConfig {
  id: number;
  name: string;
  fullPath: string;
  cost: number;
  active: boolean;
}

export interface AdminState {
  isAuthenticated: boolean;
  config: AdminConfig;
}

export type AdminAction = 
  | { type: 'UPDATE_PRICING'; payload: AdminConfig['pricing'] }
  | { type: 'ADD_NOVELA'; payload: NovelasConfig }
  | { type: 'UPDATE_NOVELA'; payload: NovelasConfig }
  | { type: 'DELETE_NOVELA'; payload: number }
  | { type: 'ADD_DELIVERY_ZONE'; payload: DeliveryZoneConfig }
  | { type: 'UPDATE_DELIVERY_ZONE'; payload: DeliveryZoneConfig }
  | { type: 'DELETE_DELIVERY_ZONE'; payload: number }
  | { type: 'TOGGLE_DELIVERY_ZONE'; payload: number }
  | { type: 'LOAD_CONFIG'; payload: AdminConfig }
  | { type: 'LOG_IN' }
  | { type: 'LOG_OUT' };

export interface AdminContextType {
  state: AdminState;
  dispatch: React.Dispatch<AdminAction>;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  addNovela: (novela: Omit<NovelasConfig, 'id'>) => void;
  updateNovela: (id: number, novela: Partial<NovelasConfig>) => void;
  deleteNovela: (id: number) => void;
  addDeliveryZone: (zone: Omit<DeliveryZoneConfig, 'id'>) => void;
  updateDeliveryZone: (id: number, zone: Partial<DeliveryZoneConfig>) => void;
  deleteDeliveryZone: (id: number) => void;
  exportConfig: () => string;
  importConfig: (configData: string) => boolean;
  resetToDefaults: () => void;
  showNotification: (message: string, type: 'success' | 'info' | 'warning' | 'error') => void;
  exportSystemFiles: () => void;
  getCurrentConfig: () => AdminConfig;
}

// Configuración actual aplicada - Generada desde el panel de control
// Fecha de generación: 2025-08-17T19:29:10.517Z
export const DEFAULT_ADMIN_CONFIG: AdminConfig = {
  "pricing": {
    "moviePrice": 80,
    "seriesPrice": 300,
    "transferFeePercentage": 10
  },
  "novelas": [
    {
      "id": 1,
      "titulo": "Corazón Salvaje",
      "genero": "Drama/Romance",
      "capitulos": 185,
      "año": 2009,
      "costoEfectivo": 925,
      "costoTransferencia": 1018,
      "descripcion": "Una apasionante historia de amor y venganza"
    },
    {
      "id": 2,
      "titulo": "La Usurpadora",
      "genero": "Drama/Melodrama",
      "capitulos": 98,
      "año": 1998,
      "costoEfectivo": 490,
      "costoTransferencia": 539,
      "descripcion": "La historia de dos mujeres idénticas con destinos opuestos"
    },
    {
      "id": 3,
      "titulo": "María la del Barrio",
      "genero": "Drama/Romance",
      "capitulos": 73,
      "año": 1995,
      "costoEfectivo": 365,
      "costoTransferencia": 402,
      "descripcion": "Una joven humilde que conquista el corazón de un millonario"
    },
    {
      "id": 4,
      "titulo": "Marimar",
      "genero": "Drama/Romance",
      "capitulos": 63,
      "año": 1994,
      "costoEfectivo": 315,
      "costoTransferencia": 347,
      "descripcion": "La transformación de una joven de la playa en una mujer sofisticada"
    },
    {
      "id": 5,
      "titulo": "Rosalinda",
      "genero": "Drama/Romance",
      "capitulos": 80,
      "año": 1999,
      "costoEfectivo": 400,
      "costoTransferencia": 440,
      "descripcion": "Una historia de amor que supera las diferencias sociales"
    },
    {
      "id": 6,
      "titulo": "La Madrastra",
      "genero": "Drama/Suspenso",
      "capitulos": 135,
      "año": 2005,
      "costoEfectivo": 675,
      "costoTransferencia": 743,
      "descripcion": "Una mujer lucha por demostrar su inocencia"
    },
    {
      "id": 7,
      "titulo": "Rubí",
      "genero": "Drama/Melodrama",
      "capitulos": 115,
      "año": 2004,
      "costoEfectivo": 575,
      "costoTransferencia": 633,
      "descripcion": "La ambición desmedida de una mujer hermosa"
    },
    {
      "id": 8,
      "titulo": "Pasión de Gavilanes",
      "genero": "Drama/Romance",
      "capitulos": 188,
      "año": 2003,
      "costoEfectivo": 940,
      "costoTransferencia": 1034,
      "descripcion": "Tres hermanos buscan venganza pero encuentran el amor"
    },
    {
      "id": 9,
      "titulo": "Yo Soy Betty, la Fea",
      "genero": "Comedia/Romance",
      "capitulos": 335,
      "año": 1999,
      "costoEfectivo": 1675,
      "costoTransferencia": 1843,
      "descripcion": "La transformación de una secretaria en una mujer exitosa"
    },
    {
      "id": 10,
      "titulo": "El Cuerpo del Deseo",
      "genero": "Drama/Fantasía",
      "capitulos": 178,
      "año": 2005,
      "costoEfectivo": 890,
      "costoTransferencia": 979,
      "descripcion": "Una historia sobrenatural de amor y reencarnación"
    }
  ],
  "deliveryZones": [
    {
      "id": 1,
      "name": "Por favor seleccionar su Barrio/Zona",
      "fullPath": "Por favor seleccionar su Barrio/Zona",
      "cost": 0,
      "active": true
    },
    {
      "id": 2,
      "name": "Nuevo Vista Alegre",
      "fullPath": "Santiago de Cuba > Santiago de Cuba > Nuevo Vista Alegre",
      "cost": 100,
      "active": true
    },
    {
      "id": 3,
      "name": "Vista Alegre",
      "fullPath": "Santiago de Cuba > Santiago de Cuba > Vista Alegre",
      "cost": 300,
      "active": true
    },
    {
      "id": 4,
      "name": "Reparto Sueño",
      "fullPath": "Santiago de Cuba > Santiago de Cuba > Reparto Sueño",
      "cost": 250,
      "active": true
    },
    {
      "id": 5,
      "name": "San Pedrito",
      "fullPath": "Santiago de Cuba > Santiago de Cuba > San Pedrito",
      "cost": 150,
      "active": true
    },
    {
      "id": 6,
      "name": "Altamira",
      "fullPath": "Santiago de Cuba > Santiago de Cuba > Altamira",
      "cost": 300,
      "active": true
    },
    {
      "id": 7,
      "name": "Micro 7, 8 , 9",
      "fullPath": "Santiago de Cuba > Santiago de Cuba > Micro 7, 8 , 9",
      "cost": 150,
      "active": true
    },
    {
      "id": 8,
      "name": "Alameda",
      "fullPath": "Santiago de Cuba > Santiago de Cuba > Alameda",
      "cost": 150,
      "active": true
    },
    {
      "id": 9,
      "name": "El Caney",
      "fullPath": "Santiago de Cuba > Santiago de Cuba > El Caney",
      "cost": 800,
      "active": true
    },
    {
      "id": 10,
      "name": "Quintero",
      "fullPath": "Santiago de Cuba > Santiago de Cuba > Quintero",
      "cost": 200,
      "active": true
    },
    {
      "id": 11,
      "name": "Marimon",
      "fullPath": "Santiago de Cuba > Santiago de Cuba > Marimon",
      "cost": 100,
      "active": true
    },
    {
      "id": 12,
      "name": "Los cangrejitos",
      "fullPath": "Santiago de Cuba > Santiago de Cuba > Los cangrejitos",
      "cost": 150,
      "active": true
    },
    {
      "id": 13,
      "name": "Trocha",
      "fullPath": "Santiago de Cuba > Santiago de Cuba > Trocha",
      "cost": 200,
      "active": true
    },
    {
      "id": 14,
      "name": "Versalles",
      "fullPath": "Santiago de Cuba > Santiago de Cuba > Versalles",
      "cost": 800,
      "active": true
    },
    {
      "id": 15,
      "name": "Reparto Portuondo",
      "fullPath": "Santiago de Cuba > Santiago de Cuba > Reparto Portuondo",
      "cost": 600,
      "active": true
    },
    {
      "id": 16,
      "name": "30 de Noviembre",
      "fullPath": "Santiago de Cuba > Santiago de Cuba > 30 de Noviembre",
      "cost": 600,
      "active": true
    },
    {
      "id": 17,
      "name": "Rajayoga",
      "fullPath": "Santiago de Cuba > Santiago de Cuba > Rajayoga",
      "cost": 800,
      "active": true
    },
    {
      "id": 18,
      "name": "Antonio Maceo",
      "fullPath": "Santiago de Cuba > Santiago de Cuba > Antonio Maceo",
      "cost": 600,
      "active": true
    },
    {
      "id": 19,
      "name": "Los Pinos",
      "fullPath": "Santiago de Cuba > Santiago de Cuba > Los Pinos",
      "cost": 200,
      "active": true
    },
    {
      "id": 20,
      "name": "Distrito José Martí",
      "fullPath": "Santiago de Cuba > Santiago de Cuba > Distrito José Martí",
      "cost": 100,
      "active": true
    },
    {
      "id": 21,
      "name": "Cobre",
      "fullPath": "Santiago de Cuba > Santiago de Cuba > Cobre",
      "cost": 800,
      "active": true
    },
    {
      "id": 22,
      "name": "El Parque Céspedes",
      "fullPath": "Santiago de Cuba > Santiago de Cuba > El Parque Céspedes",
      "cost": 200,
      "active": true
    },
    {
      "id": 23,
      "name": "Carretera del Morro",
      "fullPath": "Santiago de Cuba > Santiago de Cuba > Carretera del Morro",
      "cost": 300,
      "active": true
    }
  ]
};
