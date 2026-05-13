import React, { useState } from 'react';
import { useCMS } from '@/contexts/CMSContext';
import { cn } from '@/lib/utils';
import { ImagePlus, Link as LinkIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

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
                  <LinkIcon className="w-3 h-3" /> URL de la imagen
                </label>
                <input 
                  type="text" 
                  value={tempUrl}
                  onChange={(e) => setTempUrl(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent outline-none"
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
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
