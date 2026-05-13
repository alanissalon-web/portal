import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { EditableImage } from './cms/EditableImage';
import { useCMS } from '@/contexts/CMSContext';

interface ImageComparisonProps {
  beforeImage: string;
  afterImage: string;
  section?: string;
}

export function ImageComparison({ beforeImage, afterImage, section = 'transformations' }: ImageComparisonProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isEditing } = useCMS();

  const handleMove = (event: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = 'touches' in event 
      ? event.touches[0].clientX - rect.left 
      : (event as React.MouseEvent).clientX - rect.left;
    
    const position = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, position)));
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-[4/3] rounded-[2rem] overflow-hidden cursor-ew-resize select-none border border-border/50 shadow-2xl"
      onMouseMove={handleMove}
      onTouchMove={handleMove}
    >
      {/* After Image (Background) */}
      <div className="absolute inset-0">
        <EditableImage
          section={section}
          field="after_image"
          defaultImage={afterImage}
          alt="After transformation"
          className="w-full h-full object-cover"
        />
        <div className="absolute top-6 right-6 bg-accent text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest z-10 shadow-lg">
          After
        </div>
      </div>

      {/* Before Image (Foreground with Clip Path) */}
      <div 
        className="absolute inset-0 w-full h-full pointer-events-none z-20"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <div className="relative w-full h-full">
          <EditableImage
            section={section}
            field="before_image"
            defaultImage={beforeImage}
            alt="Before transformation"
            className="w-full h-full object-cover pointer-events-auto"
          />
          <div className="absolute top-6 left-6 bg-black/80 text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest z-30 shadow-lg">
            Before
          </div>
        </div>
      </div>

      {/* Slider Handle */}
      <div 
        className="absolute inset-y-0 w-1 bg-white shadow-xl z-40 pointer-events-none"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-2xl flex items-center justify-center pointer-events-auto cursor-grab active:cursor-grabbing border border-accent/20">
          <div className="flex gap-1">
            <div className="w-0.5 h-3 bg-accent rounded-full" />
            <div className="w-0.5 h-3 bg-accent rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
