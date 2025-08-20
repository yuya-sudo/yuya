// AdminContext.tsx - Generated with current configuration
// Last updated: 2025-08-20T08:01:09.835Z

import React, { createContext, useContext, useReducer, useEffect } from 'react';

export interface PriceConfig {
  moviePrice: 80;
  seriesPrice: 300;
  transferFeePercentage: 10;
  novelPricePerChapter: 5;
}

// Current delivery zones configuration
const deliveryZones = [
  {
    "id": "1",
    "name": "Santiago de Cuba > Santiago de Cuba > Nuevo Vista Alegre",
    "cost": 150,
    "active": true,
    "createdAt": "2025-08-20T07:57:35.826Z",
    "updatedAt": "2025-08-20T07:59:08.460Z"
  },
  {
    "id": "2",
    "name": "Santiago de Cuba > Santiago de Cuba > Vista Alegre",
    "cost": 350,
    "active": true,
    "createdAt": "2025-08-20T07:57:35.826Z",
    "updatedAt": "2025-08-20T08:00:33.859Z"
  }
];

// Current novels configuration  
const novels = [
  {
    "titulo": "pepe",
    "genero": "drama",
    "capitulos": 100,
    "año": 2025,
    "descripcion": "",
    "active": true,
    "id": 1755676806060,
    "createdAt": "2025-08-20T08:00:06.060Z",
    "updatedAt": "2025-08-20T08:00:06.060Z"
  }
];

// Rest of AdminContext implementation...
export default AdminContext;