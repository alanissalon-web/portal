import React from 'react';
import { useCMS } from '@/contexts/CMSContext';
import { motion, AnimatePresence } from 'framer-motion';
import { GripVertical, Trash2, Plus, ArrowUp, ArrowDown, Layout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'react-router-dom';
interface Section {
  id: string;
  name: string;
}

export const VisualSidebar: React.FC = () => {
  const { isEditing, content, updateContent } = useCMS();
  const location = useLocation();

  if (!isEditing || location.pathname !== '/') return null;
  
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

  const availableBlocks = [
    { id: 'hero', name: 'Hero Section' },
    { id: 'booking', name: 'Booking Wizard' },
    { id: 'about', name: 'About Section' },
    { id: 'services', name: 'Services Section' },
    { id: 'transformations', name: 'Transformations' },
    { id: 'experience', name: 'Experience' },
    { id: 'cta', name: 'Final CTA' },
    { id: 'pricing', name: 'Pricing Section' },
    { id: 'extensions', name: 'Extensions' },
    { id: 'hairloss', name: 'Hair Loss' },
  ];

  const addSection = (block: any) => {
    const newSections = [...currentSections, { ...block, id: `${block.id}-${Date.now()}` }];
    updateContent('page_layout', { sections: newSections });
  };

  const removeSection = (index: number) => {
    const newSections = currentSections.filter((_: any, i: number) => i !== index);
    updateContent('page_layout', { sections: newSections });
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('index', index.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('index'));
    if (sourceIndex === targetIndex) return;

    const newSections = [...currentSections];
    const [moved] = newSections.splice(sourceIndex, 1);
    newSections.splice(targetIndex, 0, moved);
    updateContent('page_layout', { sections: newSections });
  };

  if (!isEditing) return null;

  return (
    <motion.div 
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      exit={{ x: -300 }}
      className="fixed left-0 top-20 bottom-0 w-80 bg-background/95 backdrop-blur-xl border-r border-border z-50 shadow-2xl overflow-hidden flex flex-col"
    >
      <div className="p-6 border-b border-border">
        <h3 className="font-display text-lg font-medium flex items-center gap-2">
          <Layout className="w-4 h-4 text-accent" />
          Alanis Builder
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-8">
        {/* Structure */}
        <section>
          <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-4 px-2">Estructura de la Página</h4>
          <div className="space-y-2">
            {currentSections.map((section: Section, index: number) => (
              <div 
                key={section.id} 
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className="group bg-card border border-border p-3 rounded-xl flex items-center justify-between hover:border-accent/50 transition-all shadow-sm cursor-move active:scale-95"
              >
                <div className="flex items-center gap-3">
                  <GripVertical className="w-3 h-3 text-muted-foreground" />
                  <span className="text-sm font-medium truncate max-w-[120px]">{section.name}</span>
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
        </section>

        {/* Library */}
        <section>
          <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-4 px-2">Librería de Bloques</h4>
          <div className="grid grid-cols-2 gap-2">
            {availableBlocks.map(block => (
              <button
                key={block.id}
                onClick={() => addSection(block)}
                className="flex flex-col items-center justify-center p-4 bg-background border border-border rounded-xl hover:border-accent hover:bg-accent/5 transition-all gap-2 text-center"
              >
                <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Plus className="w-4 h-4 text-accent" />
                </div>
                <span className="text-[10px] font-medium leading-tight">{block.name}</span>
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="p-4 border-t border-border bg-accent/5">
        <p className="text-[10px] text-muted-foreground text-center">
          Arrastra y suelta para reordenar (Próximamente)
        </p>
      </div>
    </motion.div>
  );
};
