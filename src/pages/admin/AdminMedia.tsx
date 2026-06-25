import { useEffect, useState } from 'react';
import { Image as ImageIcon, Upload, Trash2, Search, Filter, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { LocalDB } from '@/services/LocalDatabase';
import { supabase } from '@/lib/supabase';

const AdminMedia = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const fetchFiles = async () => {
    setLoading(true);
    const { data } = await LocalDB.getMedia();
    setFiles(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const ext = file.name.split('.').pop() || 'jpg';
      const fileName = `media/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
      
      const { error: uploadError } = await supabase.storage
        .from('site-images')
        .upload(fileName, file, { contentType: file.type, upsert: true });
        
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('site-images').getPublicUrl(fileName);
      const url = data.publicUrl;

      const newMedia = {
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)}KB`,
        type: file.type,
        url: url
      };
      await LocalDB.saveMedia(newMedia);
      
      toast({ title: 'File uploaded', description: `${file.name} has been saved to the library.` });
      await fetchFiles();
    } catch (error: any) {
      toast({ title: 'Upload error', description: error.message, variant: 'destructive' });
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this file?')) {
      await LocalDB.deleteMedia(id);
      toast({ title: 'File deleted' });
      await fetchFiles();
    }
  };

  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-light text-foreground">Media</h1>
          <p className="font-body text-sm text-muted-foreground mt-1">Manage your site images and files.</p>
        </div>
        <label className="cursor-pointer bg-accent hover:bg-accent/90 text-white px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-accent/20 flex items-center gap-2 font-body text-sm">
          <Upload className="w-4 h-4" /> Upload File
          <input type="file" className="hidden" onChange={handleUpload} accept="image/*" />
        </label>
      </div>

      <div className="flex gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search files..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-black/5 rounded-xl pl-10 pr-4 py-2.5 font-body text-sm outline-none focus:ring-1 focus:ring-accent shadow-sm"
          />
        </div>
        <Button variant="outline" className="gap-2 rounded-xl border-black/5 bg-white shadow-sm">
          <Filter className="w-4 h-4" /> Filters
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
          <p className="font-body text-sm text-muted-foreground">Loading library...</p>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-border">
          <ImageIcon className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
          <p className="font-body text-sm text-muted-foreground">No se encontraron archivos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredFiles.map((file) => (
            <div key={file.id} className="group relative bg-white border border-black/5 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div className="aspect-square bg-[#F5F5F5] flex items-center justify-center overflow-hidden">
                <img src={file.url} alt={file.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="p-3">
                <p className="font-body text-[10px] font-bold text-foreground truncate mb-0.5">{file.name}</p>
                <p className="font-body text-[10px] text-muted-foreground">{file.size}</p>
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleDelete(file.id)}
                  className="bg-white/90 backdrop-blur-sm p-1.5 rounded-lg text-destructive shadow-sm hover:bg-white transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminMedia;
