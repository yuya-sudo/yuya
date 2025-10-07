import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface NetflixSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  itemCount: number;
}

export function NetflixSection({ title, icon, children, itemCount }: NetflixSectionProps) {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
      const newScrollLeft = direction === 'left' 
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount;
      
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      checkScrollButtons();
      container.addEventListener('scroll', checkScrollButtons);
      
      // Check on resize
      const resizeObserver = new ResizeObserver(checkScrollButtons);
      resizeObserver.observe(container);
      
      return () => {
        container.removeEventListener('scroll', checkScrollButtons);
        resizeObserver.disconnect();
      };
    }
  }, [itemCount]);

  return (
    <section className="mb-12 relative group">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
          {icon}
          {title}
        </h2>
      </div>

      <div className="relative">
        {/* Left Arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-20 bg-black/70 hover:bg-black/90 text-white p-3 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 shadow-xl"
            style={{ marginLeft: '-20px' }}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        {/* Right Arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-20 bg-black/70 hover:bg-black/90 text-white p-3 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 shadow-xl"
            style={{ marginRight: '-20px' }}
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}

        {/* Scrollable Content */}
        <div 
          ref={scrollContainerRef}
          className="overflow-x-auto scrollbar-hide -mx-4 sm:mx-0"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex gap-3 sm:gap-4 px-4 sm:px-0 pb-4" style={{ minWidth: 'min-content' }}>
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}