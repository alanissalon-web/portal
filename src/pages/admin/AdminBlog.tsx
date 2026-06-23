import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { LocalDB } from '@/services/LocalDatabase';
import { Edit3, Plus, Trash2, Save, X, Image as ImageIcon, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function AdminBlog() {
  const { toast } = useToast();
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBlog, setEditingBlog] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    const { data } = await LocalDB.getBlogs();
    setBlogs(data || []);
    setLoading(false);
  };

  const handleCreateNew = () => {
    setEditingBlog({
      title: '',
      slug: '',
      description: '',
      content: '',
      image: '',
      meta_title: '',
      meta_description: '',
      status: 'draft'
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlog.title || !editingBlog.content) {
      toast({ title: 'Faltan campos', description: 'Título y contenido son obligatorios.', variant: 'destructive' });
      return;
    }
    
    setIsSaving(true);
    try {
      const { error } = await LocalDB.saveBlog(editingBlog);
      if (error) throw error;
      
      toast({ title: '¡Éxito!', description: 'Artículo guardado correctamente.' });
      setEditingBlog(null);
      fetchBlogs();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar este artículo?')) return;
    try {
      await LocalDB.deleteBlog(id);
      toast({ title: 'Eliminado', description: 'Artículo eliminado.' });
      fetchBlogs();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `blog-${Date.now()}.${fileExt}`;
      const filePath = `blogs/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('site-images').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('site-images').getPublicUrl(filePath);
      setEditingBlog({ ...editingBlog, image: data.publicUrl });
      toast({ title: 'Imagen subida' });
    } catch (err: any) {
      toast({ title: 'Error', description: 'No se pudo subir la imagen', variant: 'destructive' });
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) {
    return (
      <div className="p-10 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-display font-light text-charcoal">Gestión del Blog</h1>
          <p className="text-muted-foreground font-body mt-2">Crea y administra tus artículos de blog (SEO).</p>
        </div>
        {!editingBlog && (
          <Button onClick={handleCreateNew} className="gap-2 bg-accent text-white hover:bg-accent/90 rounded-xl">
            <Plus className="w-4 h-4" /> Nuevo Artículo
          </Button>
        )}
      </div>

      {editingBlog ? (
        <form onSubmit={handleSave} className="bg-white rounded-3xl shadow-sm border border-black/5 p-8">
          <div className="flex justify-between items-center mb-6 border-b border-black/5 pb-4">
            <h2 className="text-xl font-display text-charcoal">
              {editingBlog.id ? 'Editar Artículo' : 'Nuevo Artículo'}
            </h2>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={() => setEditingBlog(null)} className="rounded-xl">
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving} className="gap-2 bg-accent text-white hover:bg-accent/90 rounded-xl">
                <Save className="w-4 h-4" /> {isSaving ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Título del Artículo</label>
                <input
                  type="text"
                  value={editingBlog.title}
                  onChange={e => setEditingBlog({...editingBlog, title: e.target.value})}
                  className="w-full border border-black/10 rounded-xl p-3"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Descripción (Breve resumen)</label>
                <textarea
                  value={editingBlog.description}
                  onChange={e => setEditingBlog({...editingBlog, description: e.target.value})}
                  className="w-full border border-black/10 rounded-xl p-3 h-20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Contenido Principal (Texto HTML permitido)</label>
                <textarea
                  value={editingBlog.content}
                  onChange={e => setEditingBlog({...editingBlog, content: e.target.value})}
                  className="w-full border border-black/10 rounded-xl p-3 h-96 font-mono text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-6 bg-accent/5 p-6 rounded-2xl border border-accent/10">
              <h3 className="font-display text-lg">Configuración SEO y Detalles</h3>
              
              <div>
                <label className="block text-sm font-medium mb-2">Estado</label>
                <select
                  value={editingBlog.status}
                  onChange={e => setEditingBlog({...editingBlog, status: e.target.value})}
                  className="w-full border border-black/10 rounded-xl p-3 bg-white"
                >
                  <option value="draft">Borrador</option>
                  <option value="published">Publicado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Imagen Principal</label>
                {editingBlog.image ? (
                  <div className="relative rounded-xl overflow-hidden mb-3 border border-black/10">
                    <img src={editingBlog.image} alt="Portada" className="w-full h-40 object-cover" />
                    <button type="button" onClick={() => setEditingBlog({...editingBlog, image: ''})} className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-full text-destructive hover:bg-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-accent/30 rounded-xl p-8 text-center cursor-pointer hover:bg-accent/5 transition-colors mb-3"
                  >
                    {uploadingImage ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent mx-auto"></div>
                    ) : (
                      <>
                        <ImageIcon className="w-8 h-8 text-accent/50 mx-auto mb-2" />
                        <span className="text-xs text-accent">Subir imagen</span>
                      </>
                    )}
                  </div>
                )}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">SEO Meta Title</label>
                <input
                  type="text"
                  value={editingBlog.meta_title || ''}
                  onChange={e => setEditingBlog({...editingBlog, meta_title: e.target.value})}
                  className="w-full border border-black/10 rounded-xl p-3 bg-white"
                  placeholder="Dejar en blanco para usar el título"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">SEO Meta Description</label>
                <textarea
                  value={editingBlog.meta_description || ''}
                  onChange={e => setEditingBlog({...editingBlog, meta_description: e.target.value})}
                  className="w-full border border-black/10 rounded-xl p-3 bg-white h-24"
                  placeholder="Dejar en blanco para usar la descripción"
                />
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-black/5 overflow-hidden">
          {blogs.length === 0 ? (
            <div className="p-16 text-center">
              <Edit3 className="w-12 h-12 text-black/20 mx-auto mb-4" />
              <h3 className="text-xl font-display">No hay artículos</h3>
              <p className="text-muted-foreground mt-2">Crea tu primer artículo para el blog.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-black/5 border-b border-black/5 font-display text-charcoal">
                <tr>
                  <th className="p-4 pl-6">Artículo</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4">Fecha</th>
                  <th className="p-4 text-right pr-6">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {blogs.map((b) => (
                  <tr key={b.id} className="border-b border-black/5 hover:bg-black/[0.02] transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-4">
                        {b.image ? (
                          <img src={b.image} alt={b.title} className="w-12 h-12 rounded-lg object-cover bg-black/5" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-black/5 flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-black/20" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-base">{b.title}</p>
                          <p className="text-xs text-muted-foreground truncate w-64">{b.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        b.status === 'published' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-amber-50 text-amber-600 border border-amber-200'
                      }`}>
                        {b.status === 'published' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {b.status === 'published' ? 'Publicado' : 'Borrador'}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(b.created_at).toLocaleDateString('es-MX')}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setEditingBlog(b)} className="rounded-lg h-8">
                          Editar
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(b.id)} className="rounded-lg h-8 text-destructive hover:bg-destructive/10 hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
