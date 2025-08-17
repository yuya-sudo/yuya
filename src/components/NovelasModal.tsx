import React, { useState } from 'react';
import { X, Play, Star, Calendar, Clock } from 'lucide-react';

interface Novela {
  id: number;
  title: string;
  genre: string;
  year: number;
  rating: number;
  duration: string;
  description: string;
  image: string;
  episodes: number;
  status: 'completed' | 'ongoing';
  price: number;
}

interface NovelasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: any) => void;
}

const novelas: Novela[] = [
  {
    id: 1,
    title: "Corazón Indomable",
    genre: "Drama/Romance",
    year: 2023,
    rating: 4.8,
    duration: "45 min",
    description: "Una historia de amor que desafía todas las adversidades.",
    image: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg",
    episodes: 120,
    status: "completed",
    price: 15.99
  },
  {
    id: 2,
    title: "Secretos del Pasado",
    genre: "Drama/Melodrama",
    year: 2024,
    rating: 4.6,
    duration: "50 min",
    description: "Los secretos familiares salen a la luz en esta intensa novela.",
    image: "https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg",
    episodes: 80,
    status: "ongoing",
    price: 18.99
  },
  {
    id: 3,
    title: "Amor Prohibido",
    genre: "Drama/Suspenso",
    year: 2023,
    rating: 4.7,
    duration: "42 min",
    description: "Un amor que desafía las normas sociales y familiares.",
    image: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg",
    episodes: 95,
    status: "completed",
    price: 16.99
  },
  {
    id: 4,
    title: "La Heredera",
    genre: "Drama/Romance",
    year: 2024,
    rating: 4.5,
    duration: "48 min",
    description: "Una joven descubre su verdadera identidad y herencia.",
    image: "https://images.pexels.com/photos/3184639/pexels-photo-3184639.jpeg",
    episodes: 110,
    status: "ongoing",
    price: 17.99
  },
  {
    id: 5,
    title: "Destinos Cruzados",
    genre: "Comedia/Romance",
    year: 2023,
    rating: 4.4,
    duration: "40 min",
    description: "Cuando el destino une a dos personas completamente opuestas.",
    image: "https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg",
    episodes: 75,
    status: "completed",
    price: 14.99
  },
  {
    id: 6,
    title: "El Poder del Amor",
    genre: "Drama/Fantasía",
    year: 2024,
    rating: 4.9,
    duration: "55 min",
    description: "Una historia mágica donde el amor puede cambiar el destino.",
    image: "https://images.pexels.com/photos/3184317/pexels-photo-3184317.jpeg",
    episodes: 100,
    status: "ongoing",
    price: 19.99
  },
  {
    id: 7,
    title: "Venganza y Perdón",
    genre: "Drama/Suspenso",
    year: 2023,
    rating: 4.3,
    duration: "46 min",
    description: "Una mujer busca venganza pero encuentra el perdón.",
    image: "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg",
    episodes: 85,
    status: "completed",
    price: 15.99
  },
  {
    id: 8,
    title: "Sueños Rotos",
    genre: "Drama/Melodrama",
    year: 2024,
    rating: 4.6,
    duration: "44 min",
    description: "La lucha por reconstruir una vida después de la tragedia.",
    image: "https://images.pexels.com/photos/3184394/pexels-photo-3184394.jpeg",
    episodes: 90,
    status: "ongoing",
    price: 16.99
  },
  {
    id: 9,
    title: "Pasión Ardiente",
    genre: "Drama/Romance",
    year: 2023,
    rating: 4.7,
    duration: "47 min",
    description: "Una pasión que consume todo a su paso.",
    image: "https://images.pexels.com/photos/3184454/pexels-photo-3184454.jpeg",
    episodes: 105,
    status: "completed",
    price: 17.99
  },
  {
    id: 10,
    title: "El Último Adiós",
    genre: "Drama/Melodrama",
    year: 2024,
    rating: 4.8,
    duration: "52 min",
    description: "Una emotiva historia sobre segundas oportunidades.",
    image: "https://images.pexels.com/photos/3184302/pexels-photo-3184302.jpeg",
    episodes: 95,
    status: "ongoing",
    price: 18.99
  }
];

export function NovelasModal({ isOpen, onClose, onAddToCart }: NovelasModalProps) {
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  if (!isOpen) return null;

  const genres = ['all', ...Array.from(new Set(novelas.map(n => n.genre)))];
  const statuses = ['all', 'completed', 'ongoing'];

  const filteredNovelas = novelas.filter(novela => {
    const genreMatch = selectedGenre === 'all' || novela.genre === selectedGenre;
    const statusMatch = selectedStatus === 'all' || novela.status === selectedStatus;
    return genreMatch && statusMatch;
  });

  const handleAddToCart = (novela: Novela) => {
    const cartItem = {
      id: `novela-${novela.id}`,
      title: novela.title,
      type: 'novela',
      price: novela.price * 1.1, // 10% recargo por transferencia
      image: novela.image,
      episodes: novela.episodes,
      genre: novela.genre
    };
    onAddToCart(cartItem);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Catálogo de Novelas</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* Filtros */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Género
              </label>
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
              >
                {genres.map(genre => (
                  <option key={genre} value={genre}>
                    {genre === 'all' ? 'Todos los géneros' : genre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Estado
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'Todos' : status === 'completed' ? 'Completada' : 'En emisión'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid de novelas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[60vh] overflow-y-auto">
            {filteredNovelas.map(novela => (
              <div key={novela.id} className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-colors">
                <div className="relative">
                  <img
                    src={novela.image}
                    alt={novela.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      novela.status === 'completed' 
                        ? 'bg-green-600 text-white' 
                        : 'bg-yellow-600 text-white'
                    }`}>
                      {novela.status === 'completed' ? 'Completada' : 'En emisión'}
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">{novela.title}</h3>
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">{novela.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-300 mb-3">
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-yellow-500" />
                      <span>{novela.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>{novela.year}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>{novela.duration}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-400">{novela.episodes} episodios</span>
                    <span className="text-sm text-blue-400">{novela.genre}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-right">
                      <div className="text-lg font-bold text-white">
                        ${(novela.price * 1.1).toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-400">
                        Precio base: ${novela.price.toFixed(2)}
                      </div>
                      <div className="text-xs text-yellow-400">
                        +10% recargo transferencia
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddToCart(novela)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Play size={16} />
                      Agregar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredNovelas.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No se encontraron novelas con los filtros seleccionados.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}