import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CMSContextType {
  content: Record<string, any>;
  updateContent: (key: string, value: any) => void;
  saveContent: (key: string) => Promise<void>;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
}

const CMSContext = createContext<CMSContextType | undefined>(undefined);

export const CMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<Record<string, any>>({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      const { data } = await supabase.from('site_content').select('*');
      if (data) {
        const map: Record<string, any> = {};
        data.forEach(row => {
          map[row.section_key] = row.content;
        });
        setContent(map);
      }
    };
    fetchContent();
  }, []);

  const updateContent = (key: string, value: any) => {
    setContent(prev => ({ ...prev, [key]: value }));
  };

  const saveContent = async (key: string) => {
    const sectionContent = content[key];
    const { data: existing } = await supabase.from('site_content').select('id').eq('section_key', key).maybeSingle();

    if (existing) {
      await supabase.from('site_content').update({ content: sectionContent }).eq('section_key', key);
    } else {
      await supabase.from('site_content').insert([{ section_key: key, content: sectionContent }]);
    }
  };

  return (
    <CMSContext.Provider value={{ content, updateContent, saveContent, isEditing, setIsEditing }}>
      {children}
    </CMSContext.Provider>
  );
};

export const useCMS = () => {
  const context = useContext(CMSContext);
  if (!context) throw new Error('useCMS must be used within a CMSProvider');
  return context;
};
