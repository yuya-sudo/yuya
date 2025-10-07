import React, { useState } from 'react';
import { Menu, X, Home, TrendingUp, Clapperboard, Monitor, Sparkles, BookOpen, Radio, CheckCircle2 } from 'lucide-react';

interface FloatingNavButtonProps {
  onNavigate: (sectionId: string) => void;
}

export function FloatingNavButton({ onNavigate }: FloatingNavButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const sections = [
    { id: 'hero', label: 'Inicio', icon: Home, color: 'from-blue-500 to-blue-600' },
    { id: 'trending', label: 'Tendencias', icon: TrendingUp, color: 'from-red-500 to-pink-500' },
    { id: 'novels-live', label: 'Novelas en Vivo', icon: Radio, color: 'from-red-500 to-pink-500' },
    { id: 'novels-finished', label: 'Novelas Finalizadas', icon: CheckCircle2, color: 'from-green-500 to-emerald-500' },
    { id: 'movies', label: 'Películas', icon: Clapperboard, color: 'from-blue-500 to-blue-600' },
    { id: 'tv', label: 'Series', icon: Monitor, color: 'from-purple-500 to-purple-600' },
    { id: 'anime', label: 'Anime', icon: Sparkles, color: 'from-pink-500 to-pink-600' },
  ];

  const handleSectionClick = (sectionId: string) => {
    onNavigate(sectionId);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Menu Items */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 space-y-3 animate-in fade-in duration-300">
          {sections.map((section, index) => (
            <div
              key={section.id}
              className="transform transition-all duration-300 animate-in slide-in-from-right"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <button
                onClick={() => handleSectionClick(section.id)}
                className={`flex items-center bg-gradient-to-r ${section.color} text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 whitespace-nowrap`}
              >
                <section.icon className="h-5 w-5 mr-3" />
                <span className="font-medium">{section.label}</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110 ${
          isOpen ? 'rotate-180' : ''
        }`}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>
    </div>
  );
}