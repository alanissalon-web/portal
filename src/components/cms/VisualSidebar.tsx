import React from 'react';
import { useCMS } from '@/contexts/CMSContext';
import { motion, AnimatePresence } from 'framer-motion';
import { GripVertical, Trash2, Plus, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Section {
  id: string;
  name: string;
}

export const VisualSidebar: React.FC = () => {
  const { isEditing, content, updateContent } = useCMS();
  
  // Default order if not specified in CMS
  const defaultSections: Section[] = [
    { id: 'hero', name: 'Hero Section' },
    { id: 'booking', name: 'Booking Wizard' },
    { id: 'about', name: 'About Section' },
    { id: 'services', name: 'Services Section' },
    { id: 'transformations', name: 'Transformations' },
    { id: 'experience', name: 'Experience' },
    { id: 'cta', name: 'Final CTA' },
  ];

  const currentSections = content['page_layout']?.sections || defaultSections;

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...currentSections];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newSections.length) return;
    
    [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
    updateContent('page_layout', { sections: newSections });
  };

  const removeSection = (index: number) => {
    const newSections = currentSections.filter((_: any, i: number) => i !== index);
    updateContent('page_layout', { sections: newSections });
  };

  if (!isEditing) return null;

  return (
    <motion.div 
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      exit={{ x: -300 }}
      className="fixed left-0 top-20 bottom-0 w-72 bg-background/90 backdrop-blur-xl border-r border-border z-50 p-6 shadow-2xl overflow-y-auto"
    >
      <h3 className="font-display text-lg font-medium mb-6 flex items-center gap-2">
        <GripVertical className="w-4 h-4 text-accent" />
        Estructura del Sitio
      </h3>

      <div className="space-y-3">
        {currentSections.map((section: Section, index: number) => (
          <div 
            key={section.id} 
            className="group bg-card border border-border p-3 rounded-xl flex items-center justify-between hover:border-accent/50 transition-all shadow-sm"
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-muted-foreground w-4">{index + 1}</span>
              <span className="text-sm font-medium">{section.name}</span>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7" 
                onClick={() => moveSection(index, 'up')}
                disabled={index === 0}
              >
                <ArrowUp className="w-3 h-3" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7" 
                onClick={() => moveSection(index, 'down')}
                disabled={index === currentSections.length - 1}
              >
                <ArrowDown className="w-3 h-3" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 text-destructive hover:bg-destructive/10"
                onClick={() => removeSection(index)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Button variant="outline" className="w-full mt-6 gap-2 border-dashed rounded-xl">
        <Plus className="w-4 h-4" />
        Añadir Sección
      </Button>
    </motion.div>
  );
};
