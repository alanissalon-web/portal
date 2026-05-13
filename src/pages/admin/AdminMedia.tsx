import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Image as ImageIcon, Upload, Trash2, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const AdminMedia = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // In a real app, we would list files from Supabase Storage
    // For now, let's mock it with local assets or existing DB data
    setFiles([
      { name: 'hero-salon.jpg', size: '2.4MB', type: 'image/jpeg', url: '/src/assets/hero-salon-real.jpg' },
      { name: 'service-color.jpg', size: '105KB', type: 'image/jpeg', url: '/src/assets/service-color.jpg' },
      { name: 'transformation-1.jpg', size: '176KB', type: 'image/jpeg', url: '/src/assets/transformation-1.jpg' },
    ]);
    setLoading(false);
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-light text-foreground">Multimedia</h1>
          <p className="font-body text-sm text-muted-foreground mt-1">Gestiona las imágenes y archivos de tu sitio.</p>
        </div>
        <Button className="gap-2 rounded-xl">
          <Upload className="w-4 h-4" /> Subir Archivo
        </Button>
      </div>

      <div className="flex gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Buscar archivos..." 
            className="w-full bg-white border border-black/5 rounded-xl pl-10 pr-4 py-2.5 font-body text-sm outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <Button variant="outline" className="gap-2 rounded-xl border-black/5">
          <Filter className="w-4 h-4" /> Filtros
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {files.map((file, i) => (
          <div key={i} className="group relative bg-white border border-black/5 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
            <div className="aspect-square bg-[#F5F5F5] flex items-center justify-center overflow-hidden">
              <img src={file.url} alt={file.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="p-3">
              <p className="font-body text-[10px] font-bold text-foreground truncate mb-0.5">{file.name}</p>
              <p className="font-body text-[10px] text-muted-foreground">{file.size}</p>
            </div>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="bg-white/90 backdrop-blur-sm p-1.5 rounded-lg text-destructive shadow-sm hover:bg-white">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminMedia;
