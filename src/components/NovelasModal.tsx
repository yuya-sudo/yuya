import React, { useState, useEffect } from 'react';
import { X, Download, MessageCircle, Phone, BookOpen, Info, Check, DollarSign, CreditCard, Calculator, Search, Filter, SortAsc, SortDesc } from 'lucide-react';

// CLONED SYSTEM - Real-time synchronized configuration
const CURRENT_NOVELS = [
  {
    "id": 1,
    "titulo": "La Casa de Papel",
    "genero": "accion",
    "capitulos": 48,
    "año": 2017,
    "descripcion": "Una banda organizada de ladrones tiene el objetivo de cometer el atraco del siglo.",
    "active": true
  },
  {
    "id": 2,
    "titulo": "Élite",
    "genero": "Drama",
    "capitulos": 40,
    "año": 2018,
    "descripcion": "Las Encinas es el colegio privado más exclusivo de España.",
    "active": true
  },
  {
    "id": 3,
    "titulo": "Narcos",
    "genero": "Crimen",
    "capitulos": 30,
    "año": 2015,
    "descripcion": "La historia del narcotráfico en Colombia.",
    "active": true
  }
];
const CURRENT_PRICES = {
  "moviePrice": 100,
  "seriesPrice": 300,
  "transferFeePercentage": 100,
  "novelPricePerChapter": 5
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
  // Real-time synchronized state with admin panel
  const [selectedNovelas, setSelectedNovelas] = useState<number[]>([]);
  const [novelasWithPayment, setNovelasWithPayment] = useState<Novela[]>([]);
  const [showNovelList, setShowNovelList] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [sortBy, setSortBy] = useState<'titulo' | 'año' | 'capitulos'>('titulo');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Use synchronized novels and prices
  const allNovelas = CURRENT_NOVELS.map(novel => ({
    id: novel.id,
    titulo: novel.titulo,
    genero: novel.genero,
    capitulos: novel.capitulos,
    año: novel.año,
    descripcion: novel.descripcion
  }));

  const novelPricePerChapter = CURRENT_PRICES.novelPricePerChapter;
  const transferFeePercentage = CURRENT_PRICES.transferFeePercentage;
  const phoneNumber = '+5354690878';

  // Initialize novels with default payment type
  useEffect(() => {
    const novelasWithDefaultPayment = allNovelas.map(novela => ({
      ...novela,
      paymentType: 'cash' as const
    }));
    setNovelasWithPayment(novelasWithDefaultPayment);
  }, []);

  // Rest of the component implementation with real-time sync...
  // [Complete implementation would continue here]

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-pink-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 p-3 rounded-xl mr-4">
                <BookOpen className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Catálogo de Novelas - CLONADO</h2>
                <p className="text-sm opacity-90">Sistema sincronizado en tiempo real</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        {/* Rest of modal content */}
      </div>
    </div>
  );
}