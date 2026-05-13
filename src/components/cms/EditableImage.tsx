import React, { useState } from 'react';
import { useCMS } from '@/contexts/CMSContext';
import { cn } from '@/lib/utils';
import { ImagePlus, Link as LinkIcon, X, Image as ImageIcon, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { LocalDB } from '@/services/LocalDatabase';

interface EditableImageProps {
  section: string;
  field: string;
  defaultImage: string;
  className?: string;
  alt?: string;
}

export const EditableImage: React.FC<EditableImageProps> = ({ 
  section, 
  field, 
  defaultImage, 
  className,
  alt = "Image"
}) => {
  const { content, updateContent, isEditing } = useCMS();
  const imageUrl = content[section]?.[field] || defaultImage;
  const [tempUrl, setTempUrl] = useState(imageUrl);

  const handleSave = () => {
    updateContent(section, field, tempUrl);
    
    // Si es una imagen nueva (Base64), la guardamos en la galería central
    if (tempUrl.startsWith('data:image')) {
      LocalDB.saveMedia({
        name: `upload-${Date.now()}.png`,
        size: 'Auto',
        type: 'image/png',
        url: tempUrl
      });
    }
  };

  if (!isEditing) {
    return <img src={imageUrl} alt={alt} className={className} loading="lazy" />;
  }

  return (
    <div className="relative group">
      <img src={imageUrl} alt={alt} className={cn(className, 'ring-2 ring-transparent group-hover:ring-accent/50 transition-all')} />
      
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
        <Popover>
          <PopoverTrigger asChild>
            <Button size="sm" className="pointer-events-auto gap-2 bg-accent hover:bg-accent/90">
              <ImagePlus className="w-4 h-4" />
              Cambiar Imagen
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4">
            <div className="space-y-4">
              <h4 className="font-display font-medium text-sm">Editar Imagen</h4>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" /> Subir o URL
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={tempUrl}
                    onChange={(e) => setTempUrl(e.target.value)}
                    className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent outline-none"
                    placeholder="https://..."
                  />
                  <label className="cursor-pointer bg-accent/10 hover:bg-accent/20 text-accent p-2 rounded-lg transition-colors">
                    <Upload className="w-4 h-4" />
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setTempUrl(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="flex-1 text-xs h-8" onClick={handleSave}>Guardar</Button>
                <Button size="sm" variant="ghost" className="text-xs h-8" onClick={() => setTempUrl(imageUrl)}>Reset</Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
