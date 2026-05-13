import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { LocalDB } from '@/services/LocalDatabase';
import { useToast } from '@/hooks/use-toast';

interface SectionContent {
  [key: string]: any;
}

interface CMSContextType {
  isEditing: boolean;
  setIsEditing: (val: boolean) => void;
  content: Record<string, SectionContent>;
  updateContent: (sectionKey: string, field: string, value: any) => void;
  saveChanges: () => Promise<void>;
  addSection: (sectionType: string) => void;
  removeSection: (index: number) => void;
  reorderSections: (from: number, to: number) => void;
  layout: string[];
}

const CMSContext = createContext<CMSContextType | undefined>(undefined);

export function CMSProvider({ children }: { children: ReactNode }) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState<Record<string, SectionContent>>({});
  const [layout, setLayout] = useState<string[]>(['hero', 'booking', 'about', 'services', 'transformations', 'experience', 'cta']);
  const { toast } = useToast();

  useEffect(() => {
    const data = LocalDB.getContent();
    const map: Record<string, SectionContent> = {};
    const layoutOrder: string[] = [];
    
    data.forEach((row: any) => {
      map[row.section_key] = row.content;
      layoutOrder.push(row.section_key);
    });

    if (Object.keys(map).length > 0) {
      setContent(map);
      setLayout(layoutOrder);
    }
  }, []);

  const updateContent = (sectionKey: string, field: string, value: any) => {
    setContent(prev => ({
      ...prev,
      [sectionKey]: { ...(prev[sectionKey] || {}), [field]: value }
    }));
  };

  const saveChanges = async () => {
    try {
      // Save each section to local DB
      Object.entries(content).forEach(([key, val]) => {
        LocalDB.saveContent(key, val);
      });
      
      toast({ title: '¡Cambios Guardados!', description: 'El contenido se ha actualizado localmente.' });
      setIsEditing(false);
    } catch (err) {
      toast({ title: 'Error', description: 'No se pudo guardar los cambios.', variant: 'destructive' });
    }
  };

  const addSection = (type: string) => {
    const newKey = `${type}_${Date.now()}`;
    setLayout(prev => [...prev, newKey]);
    setContent(prev => ({ ...prev, [newKey]: {} }));
  };

  const removeSection = (index: number) => {
    const newLayout = [...layout];
    const keyToRemove = newLayout[index];
    newLayout.splice(index, 1);
    setLayout(newLayout);
    // Optional: remove from content state too
  };

  const reorderSections = (from: number, to: number) => {
    const newLayout = [...layout];
    const [moved] = newLayout.splice(from, 1);
    newLayout.splice(to, 0, moved);
    setLayout(newLayout);
  };

  return (
    <CMSContext.Provider value={{ 
      isEditing, setIsEditing, content, updateContent, saveChanges, 
      addSection, removeSection, reorderSections, layout 
    }}>
      {children}
    </CMSContext.Provider>
  );
}

export const useCMS = () => {
  const context = useContext(CMSContext);
  if (!context) throw new Error('useCMS must be used within a CMSProvider');
  return context;
};
