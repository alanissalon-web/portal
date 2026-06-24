import { Button } from '@/components/ui/button';
import { MessageCircle, Star, Users, Award, ChevronDown, ImagePlus } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState } from 'react';
import heroImage from '@/assets/hero-salon-blue.jpg';
import { EditableText } from './cms/EditableText';
import { EditableImage } from './cms/EditableImage';
import { useCMS } from '@/contexts/CMSContext';
import { supabase } from '@/lib/supabase';
import { LocalDB } from '@/services/LocalDatabase';
import { useToast } from '@/hooks/use-toast';

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const { isEditing, content, updateContent } = useCMS();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const currentHeroImage = content['hero']?.bg_image || heroImage;

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const fileName = `cms/${Date.now()}-hero.${ext}`;
      const { error } = await supabase.storage
        .from('site-images')
        .upload(fileName, file, { upsert: true, contentType: file.type });
      if (error) throw error;
      const { data } = supabase.storage.from('site-images').getPublicUrl(fileName);
      const url = data.publicUrl;
      updateContent('hero', 'bg_image', url);
      const updated = { ...(content['hero'] || {}), bg_image: url };
      await LocalDB.saveContent('hero', updated);
      toast({ title: '✅ Foto del Hero actualizada', description: 'La imagen se guardó correctamente.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'No se pudo subir la imagen.', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <section ref={containerRef} className="relative min-h-screen flex items-center overflow-hidden bg-charcoal">
      {/* Parallax Background */}
      <motion.div 
        style={{ y: y1 }}
        className="absolute inset-0 z-0"
      >
        <img
          src={currentHeroImage}
          alt="Alanís Salon & Spa luxury interior"
          className="w-full h-full object-cover scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/90 via-charcoal/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-transparent opacity-60" />
      </motion.div>

      {/* Hero image edit button — only visible in CMS editing mode */}
      {isEditing && (
        <div className="absolute top-28 right-6 z-50">
          <button 
            type="button"
            onClick={() => document.getElementById('hero-image-upload')?.click()}
            disabled={uploading}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer shadow-xl transition-all ${
            uploading
              ? 'bg-white/40 text-white/60 cursor-not-allowed'
              : 'bg-accent hover:bg-accent/90 text-white shadow-accent/30'
          }`}>
            <ImagePlus className="w-4 h-4" />
            {uploading ? 'Subiendo...' : 'Cambiar foto del Hero'}
          </button>
          <input
            id="hero-image-upload"
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={handleHeroImageUpload}
          />
        </div>
      )}

      <div className="relative z-10 container mx-auto px-6 pt-40 pb-20 md:pt-56">
        <div className="max-w-3xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 bg-accent/15 border border-accent/20 backdrop-blur-md rounded-full px-5 py-2 mb-8"
          >
            <Award className="w-4 h-4 text-accent" />
            <EditableText 
              section="hero" 
              field="hero_badge" 
              defaultText="Excellence in Houston" 
              as="span"
              className="font-body text-xs uppercase tracking-[0.2em] text-accent font-medium"
            />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-display text-6xl md:text-8xl font-light text-primary-foreground leading-[1.1] mb-8 text-balance"
          >
            <EditableText 
              section="hero" 
              field="title_part1" 
              defaultText="Transform your hair into its" 
              as="span"
            />{' '}
            <span className="text-gold-gradient font-medium italic relative">
              <EditableText 
                section="hero" 
                field="title_highlight" 
                defaultText="best version" 
                as="span"
              />
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1, delay: 1 }}
                className="absolute -bottom-2 left-0 h-1 bg-accent/30 rounded-full"
              />
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="font-body text-xl md:text-2xl text-primary-foreground/70 max-w-xl mb-12 leading-relaxed"
          >
            <EditableText 
              section="hero" 
              field="description" 
              defaultText="Personalized diagnosis meets premium artistry. Experience the pinnacle of hair extensions and styling." 
              as="span"
            />
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-5"
          >
            <a href="#booking">
              <Button variant="hero" size="xl" className="group">
                Book Your Experience
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <ChevronDown className="w-5 h-5 ml-2 rotate-[-90deg]" />
                </motion.span>
              </Button>
            </a>

          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="flex items-center gap-10 pt-16"
          >
            <div className="flex flex-col gap-2">
              <div className="flex -space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                ))}
              </div>
              <span className="font-body text-sm text-primary-foreground/60">
                <strong className="text-primary-foreground">4.9/5.0</strong> from 500+ reviews
              </span>
            </div>
            <div className="h-10 w-px bg-primary-foreground/10" />
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-accent" />
                <span className="font-display text-xl text-primary-foreground">2,400+</span>
              </div>
              <span className="font-body text-sm text-primary-foreground/60">Happy Clients</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Floating Scroll Indicator */}
      <motion.div 
        style={{ opacity }}
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
      >
        <span className="font-body text-[10px] uppercase tracking-[0.3em] text-primary-foreground/40">Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-accent to-transparent" />
      </motion.div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-accent/5 to-transparent pointer-events-none" />
    </section>
  );
}
