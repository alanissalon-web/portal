import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { LocalDB } from '@/services/LocalDatabase';
import { useToast } from '@/hooks/use-toast';

const CMS_CACHE_KEY = 'alanis_cms_content_v2';

function readCache(): Record<string, any> | null {
  try {
    const raw = localStorage.getItem(CMS_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function writeCache(data: Record<string, any>) {
  try {
    localStorage.setItem(CMS_CACHE_KEY, JSON.stringify(data));
  } catch { /* storage full – skip */ }
}

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
  loading: boolean;
}

const CMSContext = createContext<CMSContextType | undefined>(undefined);

export function CMSProvider({ children }: { children: ReactNode }) {
  const [isEditing, setIsEditing] = useState(false);

  // ── Seed state immediately from localStorage cache (zero-delay on refresh) ──
  const cached = readCache();
  const [content, setContent] = useState<Record<string, SectionContent>>(cached?.content ?? {});
  const [layout, setLayout] = useState<string[]>(
    cached?.layout ?? ['hero', 'booking', 'about', 'services', 'transformations', 'experience', 'cta']
  );
  // If we have cache data we can skip showing a full spinner
  const [loading, setLoading] = useState(!cached);
  const { toast } = useToast();

  useEffect(() => {
    const fetchContent = async () => {
      // Only show loading spinner when there is no cached data
      if (!cached) setLoading(true);

      const data = await LocalDB.getContent();
      const map: Record<string, SectionContent> = {};
      const layoutOrder: string[] = [];

      data.forEach((row: any) => {
        map[row.section_key] = row.content;
        layoutOrder.push(row.section_key);
      });

      if (Object.keys(map).length > 0) {
        setContent(map);
        setLayout(layoutOrder);
        // Persist fresh data to cache for next page load
        writeCache({ content: map, layout: layoutOrder });
      }
      setLoading(false);
    };
    fetchContent();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateContent = (sectionKey: string, field: string, value: any) => {
    setContent(prev => {
      const updated = {
        ...prev,
        [sectionKey]: { ...(prev[sectionKey] || {}), [field]: value }
      };
      // Keep cache in sync on every field change
      writeCache({ content: updated, layout });
      return updated;
    });
  };

  const saveChanges = async () => {
    try {
      // Await ALL section saves in parallel
      const results = await Promise.all(
        Object.entries(content).map(([key, val]) =>
          LocalDB.saveContent(key, val)
        )
      );

      // Check if any section failed
      const failed = results.filter((r: any) => r?.error);
      if (failed.length > 0) {
        console.error('CMS save errors:', failed.map((r: any) => r.error));
        toast({
          title: 'Error al guardar',
          description: `${failed.length} sección(es) no se pudieron guardar en Supabase. Revisa la consola.`,
          variant: 'destructive'
        });
        return;
      }

      // Update localStorage cache immediately so next refresh is instant
      writeCache({ content, layout });

      toast({ title: '✅ ¡Cambios Guardados!', description: 'El contenido se actualizó correctamente.' });
      setIsEditing(false);
    } catch (err: any) {
      console.error('saveChanges error:', err);
      toast({ title: 'Error', description: err?.message || 'No se pudo guardar los cambios.', variant: 'destructive' });
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
      addSection, removeSection, reorderSections, layout, loading 
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
