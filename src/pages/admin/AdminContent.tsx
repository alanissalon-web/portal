import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Save, Layout, Globe, ArrowRight, Eye, RefreshCw, Palette, Settings, ArrowUp, ArrowDown, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { LocalDB } from '@/services/LocalDatabase';
import { Link } from 'react-router-dom';

const AdminContent = () => {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchContent = async () => {
      const { data } = await LocalDB.getContent();
      const layout = (data || []).find((row: any) => row.section_key === 'page_layout')?.content?.sections;
      
      const defaultLayout = [
        { id: 'hero', name: 'Hero Section' },
        { id: 'booking', name: 'Booking Wizard' },
        { id: 'about', name: 'About Section' },
        { id: 'services', name: 'Services Section' },
        { id: 'transformations', name: 'Transformations' },
        { id: 'experience', name: 'Experience' },
        { id: 'cta', name: 'Final CTA' },
      ];

      setSections(layout || defaultLayout);
      setLoading(false);
    };
    fetchContent();
  }, []);

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSections.length) return;
    
    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
    setSections(newSections);
    toast({ title: 'Order updated' });
  };

  const toggleSection = async (id: string) => {
    const newSections = sections.map(s => s.id === id ? { ...s, hidden: !s.hidden } : s);
    setSections(newSections);
    await LocalDB.saveContent('page_layout', { sections: newSections });
    toast({ title: 'Visibility updated' });
  };

  const resetToDefault = async () => {
    if (confirm('Are you sure you want to reset the default layout? Custom order will be lost.')) {
      await LocalDB.saveContent('page_layout', { sections: null });
      window.location.reload();
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-display text-4xl font-light text-foreground tracking-tight">Visual Design</h1>
          <p className="font-body text-sm text-muted-foreground mt-1">Control the structure and content of your website.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={resetToDefault} className="rounded-xl border-black/5 bg-white shadow-sm">
            <RefreshCw className="w-4 h-4" /> Reset
          </Button>
          <Link to="/">
            <Button className="bg-accent hover:bg-accent/90 shadow-lg shadow-accent/20 rounded-xl px-6 gap-2">
              <Eye className="w-4 h-4" /> View Live
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Visual Builder Shortcut */}
          <div className="bg-gradient-to-r from-accent/90 to-accent rounded-3xl p-8 text-white shadow-xl shadow-accent/20 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h2 className="font-display text-3xl font-medium mb-3">Interactive Visual Editor</h2>
              <p className="font-body text-white/70 mb-8 max-w-md leading-relaxed">
                Edit text, change images, and reorder sections directly on the site with our Live visual builder.
              </p>
              <Link to="/">
                <Button className="bg-white text-accent hover:bg-white/90 rounded-xl font-bold px-8 h-12">
                  Open Editor <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
            <Layout className="absolute -right-8 -bottom-8 w-64 h-64 text-white/10 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
          </div>

          {/* Current Layout Summary */}
          <div className="bg-white rounded-3xl p-8 border border-black/5 shadow-sm">
            <h3 className="font-display text-xl font-medium mb-6">Page Structure</h3>
            <div className="space-y-3">
              {sections.map((s, i) => (
                <div 
                  key={s.id} 
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 ${
                    s.hidden ? 'bg-muted/30 opacity-60 grayscale' : 'bg-[#FAFAFA] border-black/5'
                  }`}
                >
                  <div className="w-8 h-8 bg-white border border-black/5 rounded-lg flex items-center justify-center font-display text-xs font-bold text-accent">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-body text-sm font-medium">{s.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{s.id.split('-')[0]}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" size="icon" className="w-8 h-8 rounded-lg"
                      disabled={i === 0}
                      onClick={() => moveSection(i, 'up')}
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </Button>
                    <Button 
                      variant="ghost" size="icon" className="w-8 h-8 rounded-lg"
                      disabled={i === sections.length - 1}
                      onClick={() => moveSection(i, 'down')}
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </Button>
                    <div className="w-px h-4 bg-border mx-1" />
                    <Button 
                      variant="ghost" size="icon" 
                      className={`w-8 h-8 rounded-lg ${s.hidden ? 'text-muted-foreground' : 'text-accent'}`}
                      onClick={() => toggleSection(s.id)}
                    >
                      {s.hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" /> }
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Quick Settings */}
          <div className="bg-white rounded-3xl p-8 border border-black/5 shadow-sm">
            <h3 className="font-display text-lg font-medium mb-6">Global Styles</h3>
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Accent Color</label>
                <div className="flex gap-2">
                  {['#C4A484', '#1A1A1A', '#E5DED5', '#D4AF37'].map(color => (
                    <button 
                      key={color}
                      className="w-8 h-8 rounded-full border border-black/10 shadow-inner"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <button className="w-8 h-8 rounded-full border border-dashed border-border flex items-center justify-center text-muted-foreground">
                    <Settings className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Main Typography</label>
                <select className="w-full bg-[#FAFAFA] border border-black/5 rounded-xl px-4 py-3 text-sm font-body outline-none">
                  <option>Cormorant Garamond (Display)</option>
                  <option>Inter (Body)</option>
                  <option>Playfair Display</option>
                </select>
              </div>
              <Button variant="outline" className="w-full rounded-xl border-black/5 h-12 gap-2 text-xs font-bold">
                <Palette className="w-4 h-4" /> Customize Theme
              </Button>
            </div>
          </div>

          <div className="bg-cream rounded-3xl p-8 border border-black/5">
            <h3 className="font-display text-lg font-medium mb-3">SEO & Meta</h3>
            <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
              Configure how your site looks on Google and social networks.
            </p>
            <Button variant="ghost" className="w-full justify-between text-accent font-bold text-xs p-0 h-auto hover:bg-transparent group">
              Configure SEO <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminContent;
