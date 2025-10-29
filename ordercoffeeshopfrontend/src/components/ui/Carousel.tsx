import React, { useRef } from 'react';
import './Carousel.css';

interface CarouselProps {
  children: React.ReactNode[];
}

const Carousel = ({ children }: CarouselProps) => {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = carouselRef.current.offsetWidth;
      carouselRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative w-full flex items-center justify-center">
      <button onClick={() => scroll('left')} className="absolute left-0 z-10 bg-white bg-opacity-50 rounded-full p-2">
        &#10094;
      </button>
      <div ref={carouselRef} className="w-full overflow-x-auto scroll-smooth snap-x snap-mandatory flex no-scrollbar">
        {children.map((child, index) => (
          <div key={index} className="w-full md:w-1/3 flex-shrink-0 snap-center p-2">
            {child}
          </div>
        ))}
      </div>
      <button onClick={() => scroll('right')} className="absolute right-0 z-10 bg-white bg-opacity-50 rounded-full p-2">
        &#10095;
      </button>
    </div>
  );
};

export default Carousel;
