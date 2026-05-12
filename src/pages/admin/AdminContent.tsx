import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Save, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SectionContent {
  [key: string]: string;
}

const sections = [
  { key: 'hero', label: 'Hero Section', fields: ['title', 'subtitle', 'cta_text'] },
  { key: 'about', label: 'About Section', fields: ['title', 'description', 'mission'] },
  { key: 'services', label: 'Services Section', fields: ['title', 'subtitle'] },
  { key: 'extensions', label: 'Extensions Section', fields: ['title', 'subtitle'] },
  { key: 'contact', label: 'Contact Section', fields: ['phone', 'email', 'address', 'hours'] },
];

const AdminContent = () => {
  const [content, setContent] = useState<Record<string, SectionContent>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchContent = async () => {
      const { data } = await supabase.from('site_content').select('*');
      if (data) {
        const map: Record<string, SectionContent> = {};
        data.forEach(row => { map[row.section_key] = (row.content as SectionContent) || {}; });
        setContent(map);
      }
    };
    fetchContent();
  }, []);

  const updateField = (sectionKey: string, field: string, value: string) => {
    setContent(prev => ({
      ...prev,
      [sectionKey]: { ...(prev[sectionKey] || {}), [field]: value },
    }));
  };

  const saveSection = async (sectionKey: string) => {
    setSaving(sectionKey);
    const sectionContent = content[sectionKey] || {};

    const jsonContent = sectionContent as unknown as import('@/integrations/supabase/types').Json;
    const { data: existing } = await supabase.from('site_content').select('id').eq('section_key', sectionKey).maybeSingle();

    if (existing) {
      await supabase.from('site_content').update({ content: jsonContent }).eq('section_key', sectionKey);
    } else {
      await supabase.from('site_content').insert([{ section_key: sectionKey, content: jsonContent }]);
    }

    setSaving(null);
    setSaved(sectionKey);
    setTimeout(() => setSaved(null), 2000);
    toast({ title: 'Content saved' });
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-light text-foreground">Site Content</h1>
        <p className="font-body text-sm text-muted-foreground mt-1">Edit text and information across the website</p>
      </div>

      <div className="space-y-6 max-w-3xl">
        {sections.map(section => (
          <div key={section.key} className="bg-card rounded-2xl p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-medium text-foreground">{section.label}</h2>
              <Button
                size="sm"
                onClick={() => saveSection(section.key)}
                disabled={saving === section.key}
                variant={saved === section.key ? 'outline' : 'default'}
              >
                {saved === section.key ? (
                  <><CheckCircle className="w-4 h-4" /> Saved</>
                ) : (
                  <><Save className="w-4 h-4" /> {saving === section.key ? 'Saving...' : 'Save'}</>
                )}
              </Button>
            </div>
            <div className="space-y-3">
              {section.fields.map(field => (
                <div key={field}>
                  <label className="font-body text-xs text-muted-foreground block mb-1 capitalize">{field.replace('_', ' ')}</label>
                  {field === 'description' || field === 'mission' ? (
                    <textarea
                      value={content[section.key]?.[field] ?? ''}
                      onChange={e => updateField(section.key, field, e.target.value)}
                      rows={3}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 font-body text-sm resize-none"
                    />
                  ) : (
                    <input
                      value={content[section.key]?.[field] ?? ''}
                      onChange={e => updateField(section.key, field, e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 font-body text-sm"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminContent;
