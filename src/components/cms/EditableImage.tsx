import React, { useState } from 'react';
import { useCMS } from '@/contexts/CMSContext';
import { cn } from '@/lib/utils';
import { ImagePlus, X, Upload, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/lib/supabase';
import { LocalDB } from '@/services/LocalDatabase';
import { useToast } from '@/hooks/use-toast';

interface EditableImageProps {
  section: string;
  field: string;
  defaultImage: string;
  className?: string;
  alt?: string;
}

// Upload a file to Supabase Storage and return the public URL
async function uploadToSupabase(file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg';
  const fileName = `cms/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from('site-images')
    .upload(fileName, file, { upsert: true, contentType: file.type });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from('site-images').getPublicUrl(fileName);
  return data.publicUrl;
}

export const EditableImage: React.FC<EditableImageProps> = ({
  section,
  field,
  defaultImage,
  className,
  alt = 'Image',
}) => {
  const { content, updateContent, isEditing } = useCMS();
  const { toast } = useToast();

  const imageUrl = content[section]?.[field] || defaultImage;
  const [tempUrl, setTempUrl] = useState(imageUrl);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [open, setOpen] = useState(false);

  // When editing mode is off, just render the img
  if (!isEditing) {
    return <img src={imageUrl} alt={alt} className={className} loading="lazy" />;
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setSaved(false);
    try {
      const url = await uploadToSupabase(file);
      setTempUrl(url);
    } catch (err: any) {
      // Fallback: use local object URL so the user can at least preview
      // but warn that it won't survive a page reload
      const objectUrl = URL.createObjectURL(file);
      setTempUrl(objectUrl);
      toast({
        title: 'Advertencia: Storage no disponible',
        description: 'La imagen se mostrará ahora pero puede no guardarse permanentemente. Verifica el bucket "site-images" en Supabase.',
        variant: 'destructive',
      });
      console.error('Supabase Storage upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setUploading(true);
    setSaved(false);
    try {
      // 1. Update React state so the page reflects it immediately
      updateContent(section, field, tempUrl);

      // 2. Immediately persist this section to Supabase so refresh works
      const currentSection = content[section] || {};
      const updatedSection = { ...currentSection, [field]: tempUrl };
      const result = await LocalDB.saveContent(section, updatedSection);

      if ((result as any)?.error) {
        throw new Error((result as any).error.message);
      }

      setSaved(true);
      toast({ title: '✅ Imagen guardada', description: 'La foto se actualizó correctamente.' });
      setTimeout(() => {
        setSaved(false);
        setOpen(false);
      }, 1200);
    } catch (err: any) {
      console.error('EditableImage save error:', err);
      toast({
        title: 'Error al guardar',
        description: err?.message || 'No se pudo guardar la imagen.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative group">
      <img
        src={imageUrl}
        alt={alt}
        className={cn(className, 'ring-2 ring-transparent group-hover:ring-accent/50 transition-all')}
      />

      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button size="sm" className="pointer-events-auto gap-2 bg-accent hover:bg-accent/90">
              <ImagePlus className="w-4 h-4" />
              Cambiar Imagen
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" onOpenAutoFocus={(e) => e.preventDefault()}>
            <div className="space-y-4">
              <h4 className="font-display font-medium text-sm">Editar Imagen</h4>

              {/* Preview */}
              {tempUrl && (
                <div className="w-full h-32 rounded-xl overflow-hidden border border-border bg-muted">
                  <img src={tempUrl} alt="preview" className="w-full h-full object-cover" />
                </div>
              )}

              {/* URL input */}
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground block">URL de imagen</label>
                <input
                  type="text"
                  value={tempUrl.startsWith('data:') || tempUrl.startsWith('blob:') ? '' : tempUrl}
                  onChange={(e) => setTempUrl(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent outline-none"
                  placeholder="https://..."
                />
              </div>

              {/* File upload */}
              <div>
                <label className="text-xs text-muted-foreground block mb-2">O sube desde tu dispositivo</label>
                <label className={cn(
                  'flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed text-xs font-medium cursor-pointer transition-colors',
                  uploading
                    ? 'border-accent/30 text-accent/50 cursor-not-allowed'
                    : 'border-accent/20 text-accent hover:bg-accent/5 hover:border-accent/40'
                )}>
                  {uploading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Subiendo...</>
                  ) : (
                    <><Upload className="w-4 h-4" /> Seleccionar foto</>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    disabled={uploading}
                    onChange={handleFileChange}
                  />
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 text-xs h-9 gap-2"
                  onClick={handleSave}
                  disabled={uploading || !tempUrl}
                >
                  {uploading ? (
                    <><Loader2 className="w-3 h-3 animate-spin" /> Guardando...</>
                  ) : saved ? (
                    <><CheckCircle className="w-3 h-3" /> ¡Guardado!</>
                  ) : (
                    'Guardar imagen'
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs h-9"
                  onClick={() => { setTempUrl(imageUrl); setOpen(false); }}
                  disabled={uploading}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
