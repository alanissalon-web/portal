import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Save, Layout, Globe, ArrowRight, Eye, RefreshCw, Palette, Settings, 
  ArrowUp, ArrowDown, EyeOff, Plus, Trash2, ImagePlus, Tag, DollarSign, 
  Type, FileText, Check, Loader2, Sparkles, Layers 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { LocalDB } from '@/services/LocalDatabase';
import { useCMS } from '@/contexts/CMSContext';
import { supabase } from '@/lib/supabase';
import { Link } from 'react-router-dom';

import serviceColor from '@/assets/service-color.jpg';
import serviceCut from '@/assets/service-cut.jpg';
import serviceTreatment from '@/assets/service-treatment.jpg';
import transformation1 from '@/assets/transformation-1.jpg';

const defaultServicesList = [
  {
    title: 'Color + Highlights',
    description: 'One process color, full/partial highlights, ombré, balayage, glaze, and color correction. Wella certified expertise by Master Color Experts.',
    image: serviceColor,
    price: 'From $85+',
  },
  {
    title: 'Cut & Style',
    description: 'Precision cuts for women, men, and kids. Curly cuts, blowouts, formal updos, and special event styling.',
    image: serviceCut,
    price: 'From $35+',
  },
  {
    title: 'Treatments + Texture',
    description: 'Brazilian Blowout, keratin treatments, deep conditioning, perms, and relaxers — professional-grade hair repair and texture.',
    image: serviceTreatment,
    price: 'From $125+',
  },
  {
    title: 'Hair Extensions',
    description: 'Great Lengths, Mago, CombLine, tape-ins, and Micro Point. 20+ years customizing extensions for all hair types. Free consultations available.',
    image: transformation1,
    price: 'Free Consult',
  },
];

const defaultPricingCategoriesList = [
  {
    title: 'Cut + Style',
    items: [
      { service: 'Women (+ style)', price: '$85+' },
      { service: 'Curly Cut', price: '$175+' },
      { service: 'Men', price: '$45+' },
      { service: 'Kids (under 10)', price: '$35+' },
    ],
  },
  {
    title: 'Style + Treatments',
    items: [
      { service: 'Blowout', price: '$50+' },
      { service: 'Blowout (with extensions)', price: '$65+' },
      { service: 'Formal Styling / Updos', price: '$85+' },
      { service: 'Blowout & Deep Conditioner', price: '$70+' },
    ],
  },
  {
    title: 'Color + Highlights',
    note: '*Plus $50 for style. Prices are starting at.',
    items: [
      { service: 'One Process Color / Touch Up', price: '$85+*' },
      { service: 'Full / Partial Highlights', price: '$155+ / $125+*' },
      { service: 'Ombré / Balayage', price: '$175+*' },
      { service: 'Base Break', price: '$65+*' },
      { service: 'Glaze', price: '$60+' },
      { service: 'Color Correction', price: 'Upon Consult' },
    ],
  },
  {
    title: 'Treatments + Texture',
    items: [
      { service: 'Brazilian Blowout', price: '$350+' },
      { service: 'Keratin Treatment', price: '$350+' },
      { service: 'Perms', price: 'Upon Consult' },
      { service: 'Relaxers', price: '$125+' },
    ],
  },
  {
    title: 'Hair Extensions',
    items: [
      { service: 'Great Lengths', price: 'Upon Consult' },
      { service: 'Mago', price: 'Upon Consult' },
      { service: 'Tape-Ins', price: 'Upon Consult' },
      { service: 'CombLine / Microlinks', price: 'Upon Consult' },
    ],
  },
  {
    title: 'Special Events / Weddings',
    items: [
      { service: 'In-salon styling', price: 'Call for pricing' },
      { service: 'On-location styling', price: 'Call for pricing' },
    ],
  },
];

const AdminContent = () => {
  const { content, updateContent, saveChanges } = useCMS();
  const [activeTab, setActiveTab] = useState<'services' | 'pricing' | 'titles' | 'pages' | 'layout'>('services');
  const [saving, setSaving] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const { toast } = useToast();

  // Local state for easy form manipulation synced with CMS
  const [services, setServices] = useState<any[]>([]);
  const [pricingCategories, setPricingCategories] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);

  // Section titles local state
  const [heroBadge, setHeroBadge] = useState('Excellence in Houston');
  const [heroTitle1, setHeroTitle1] = useState('Transform your hair into its');
  const [heroTitleHighlight, setHeroTitleHighlight] = useState('best version');
  const [heroDesc, setHeroDesc] = useState('Personalized diagnosis meets premium artistry. Experience the pinnacle of hair extensions and styling.');

  const [servicesBadge, setServicesBadge] = useState('The Alanis Experience');
  const [servicesTitle, setServicesTitle] = useState('Exclusive Services for Radiant Hair');

  const [pricingBadge, setPricingBadge] = useState('Our Prices');
  const [pricingTitle, setPricingTitle] = useState('Services & Pricing');

  const [bookingBadge, setBookingBadge] = useState('Book Your Visit');
  const [bookingTitle, setBookingTitle] = useState('Your transformation starts here');

  const [aboutBadge, setAboutBadge] = useState('About Us');
  const [aboutTitle, setAboutTitle] = useState('Our Legacy of Excellence');

  // Subpages Titles Local State
  const [aboutPageBadge, setAboutPageBadge] = useState('Our Story');
  const [aboutPageTitle, setAboutPageTitle] = useState('About Alanís');
  const [aboutPageDesc, setAboutPageDesc] = useState('25+ years of passion, expertise, and dedication to transforming lives through the art of hair.');

  const [extPageBadge, setExtPageBadge] = useState('Certified Specialists');
  const [extPageTitle, setExtPageTitle] = useState('Hair Extensions');
  const [extPageDesc, setExtPageDesc] = useState('Great Lengths, Mago, CombLine, tape-ins — 20+ years perfecting the art of seamless extensions.');

  const [hlPageBadge, setHlPageBadge] = useState('Innovative Technology');
  const [hlPageTitle, setHlPageTitle] = useState('Hair Loss Solutions');
  const [hlPageDesc, setHlPageDesc] = useState('CombLine & Micro Point technology — pioneering hair-to-hair solutions for natural-looking fullness.');

  const [srvPageBadge, setSrvPageBadge] = useState('Expert Hair Care');
  const [srvPageTitle, setSrvPageTitle] = useState('Our Services');
  const [srvPageDesc, setSrvPageDesc] = useState('From precision cuts to transformative color — every service is a premium experience tailored to you.');

  const [contactPhone, setContactPhone] = useState('713-524-2610');
  const [contactEmail, setContactEmail] = useState('alanissalon@gmail.com');
  const [contactLocation, setContactLocation] = useState('Houston, TX');
  const [contactHours, setContactHours] = useState('Mon–Fri: 10am – 7pm | Sat: 9am – 5pm');

  useEffect(() => {
    // Services
    const initialServices = content.services?.items || defaultServicesList;
    setServices(initialServices);

    // Pricing
    const initialPricing = content.pricing?.categories || defaultPricingCategoriesList;
    setPricingCategories(initialPricing);

    // Titles
    setHeroBadge(content.hero?.hero_badge || 'Excellence in Houston');
    setHeroTitle1(content.hero?.title_part1 || 'Transform your hair into its');
    setHeroTitleHighlight(content.hero?.title_highlight || 'best version');
    setHeroDesc(content.hero?.description || 'Personalized diagnosis meets premium artistry. Experience the pinnacle of hair extensions and styling.');

    setServicesBadge(content.services?.badge || 'The Alanis Experience');
    setServicesTitle(content.services?.title || 'Exclusive Services for Radiant Hair');

    setPricingBadge(content.pricing?.badge || 'Our Prices');
    setPricingTitle(content.pricing?.title || 'Services & Pricing');

    setBookingBadge(content.booking?.badge || 'Book Your Visit');
    setBookingTitle(content.booking?.title || 'Your transformation starts here');

    setAboutBadge(content.about?.badge || 'About Us');
    setAboutTitle(content.about?.title || 'Our Legacy of Excellence');

    // Subpages
    setAboutPageBadge(content.about_page?.badge || 'Our Story');
    setAboutPageTitle(content.about_page?.title || 'About Alanís');
    setAboutPageDesc(content.about_page?.description || '25+ years of passion, expertise, and dedication to transforming lives through the art of hair.');

    setExtPageBadge(content.extensions_page?.badge || 'Certified Specialists');
    setExtPageTitle(content.extensions_page?.title || 'Hair Extensions');
    setExtPageDesc(content.extensions_page?.description || 'Great Lengths, Mago, CombLine, tape-ins — 20+ years perfecting the art of seamless extensions.');

    setHlPageBadge(content.hairloss_page?.badge || 'Innovative Technology');
    setHlPageTitle(content.hairloss_page?.title || 'Hair Loss Solutions');
    setHlPageDesc(content.hairloss_page?.description || 'CombLine & Micro Point technology — pioneering hair-to-hair solutions for natural-looking fullness.');

    setSrvPageBadge(content.services_page?.badge || 'Expert Hair Care');
    setSrvPageTitle(content.services_page?.title || 'Our Services');
    setSrvPageDesc(content.services_page?.description || 'From precision cuts to transformative color — every service is a premium experience tailored to you.');

    setContactPhone(content.contact?.phone_text || '713-524-2610');
    setContactEmail(content.contact?.email_text || 'alanissalon@gmail.com');
    setContactLocation(content.contact?.location_text_1 || 'Houston, TX');
    setContactHours(content.contact?.hours_text_1 || 'Mon–Fri: 10am – 7pm');

    // Layout
    const layout = content.page_layout?.sections || [
      { id: 'hero', name: 'Hero Section' },
      { id: 'booking', name: 'Booking Wizard' },
      { id: 'about', name: 'About Section' },
      { id: 'services', name: 'Services Section' },
      { id: 'transformations', name: 'Transformations' },
      { id: 'experience', name: 'Experience' },
      { id: 'cta', name: 'Final CTA' },
    ];
    setSections(layout);
  }, [content]);

  // Sync state to CMS context and DB
  const handleSaveAll = async () => {
    setSaving(true);
    try {
      // 1. Services
      updateContent('services', 'items', services);
      updateContent('services', 'badge', servicesBadge);
      updateContent('services', 'title', servicesTitle);
      await LocalDB.saveContent('services', {
        items: services,
        badge: servicesBadge,
        title: servicesTitle,
      });

      // 2. Pricing
      updateContent('pricing', 'categories', pricingCategories);
      updateContent('pricing', 'badge', pricingBadge);
      updateContent('pricing', 'title', pricingTitle);
      await LocalDB.saveContent('pricing', {
        categories: pricingCategories,
        badge: pricingBadge,
        title: pricingTitle,
      });

      // 3. Hero
      updateContent('hero', 'hero_badge', heroBadge);
      updateContent('hero', 'title_part1', heroTitle1);
      updateContent('hero', 'title_highlight', heroTitleHighlight);
      updateContent('hero', 'description', heroDesc);
      await LocalDB.saveContent('hero', {
        ...(content.hero || {}),
        hero_badge: heroBadge,
        title_part1: heroTitle1,
        title_highlight: heroTitleHighlight,
        description: heroDesc,
      });

      // 4. Booking
      updateContent('booking', 'badge', bookingBadge);
      updateContent('booking', 'title', bookingTitle);
      await LocalDB.saveContent('booking', {
        ...(content.booking || {}),
        badge: bookingBadge,
        title: bookingTitle,
      });

      // 6. Subpages
      updateContent('about_page', 'badge', aboutPageBadge);
      updateContent('about_page', 'title', aboutPageTitle);
      updateContent('about_page', 'description', aboutPageDesc);
      await LocalDB.saveContent('about_page', { ...(content.about_page || {}), badge: aboutPageBadge, title: aboutPageTitle, description: aboutPageDesc });

      updateContent('extensions_page', 'badge', extPageBadge);
      updateContent('extensions_page', 'title', extPageTitle);
      updateContent('extensions_page', 'description', extPageDesc);
      await LocalDB.saveContent('extensions_page', { ...(content.extensions_page || {}), badge: extPageBadge, title: extPageTitle, description: extPageDesc });

      updateContent('hairloss_page', 'badge', hlPageBadge);
      updateContent('hairloss_page', 'title', hlPageTitle);
      updateContent('hairloss_page', 'description', hlPageDesc);
      await LocalDB.saveContent('hairloss_page', { ...(content.hairloss_page || {}), badge: hlPageBadge, title: hlPageTitle, description: hlPageDesc });

      updateContent('services_page', 'badge', srvPageBadge);
      updateContent('services_page', 'title', srvPageTitle);
      updateContent('services_page', 'description', srvPageDesc);
      await LocalDB.saveContent('services_page', { ...(content.services_page || {}), badge: srvPageBadge, title: srvPageTitle, description: srvPageDesc });

      updateContent('contact', 'phone_text', contactPhone);
      updateContent('contact', 'email_text', contactEmail);
      updateContent('contact', 'location_text_1', contactLocation);
      updateContent('contact', 'hours_text_1', contactHours);
      await LocalDB.saveContent('contact', { ...(content.contact || {}), phone_text: contactPhone, email_text: contactEmail, location_text_1: contactLocation, hours_text_1: contactHours });

      // 7. Layout
      updateContent('page_layout', 'sections', sections);
      await LocalDB.saveContent('page_layout', { sections });

      // Call CMS saveChanges to finalize
      await saveChanges();
      toast({
        title: '✅ ¡Guardado Exitoso!',
        description: 'Todos los precios, servicios y títulos del sitio fueron actualizados correctamente.',
      });
    } catch (err: any) {
      console.error('Error saving content:', err);
      toast({
        title: 'Error al guardar',
        description: err?.message || 'No se pudieron guardar los cambios.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // --- Service Item Handlers ---
  const handleServiceChange = (index: number, field: string, val: any) => {
    const updated = [...services];
    updated[index] = { ...updated[index], [field]: val };
    setServices(updated);
    updateContent('services', 'items', updated);
  };

  const handleAddService = () => {
    const newService = {
      title: 'Nuevo Servicio',
      description: 'Descripción del servicio aquí...',
      price: 'Desde $50+',
      image: serviceCut,
    };
    const updated = [...services, newService];
    setServices(updated);
    updateContent('services', 'items', updated);
    toast({ title: 'Servicio agregado' });
  };

  const handleRemoveService = (index: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar este servicio?')) {
      const updated = services.filter((_, i) => i !== index);
      setServices(updated);
      updateContent('services', 'items', updated);
      toast({ title: 'Servicio eliminado' });
    }
  };

  const handleMoveService = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= services.length) return;
    const updated = [...services];
    [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
    setServices(updated);
    updateContent('services', 'items', updated);
  };

  const handleUploadServiceImage = async (index: number, file: File) => {
    setUploadingIdx(index);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const fileName = `cms/service-${Date.now()}-${index}.${ext}`;
      const { error } = await supabase.storage
        .from('site-images')
        .upload(fileName, file, { upsert: true, contentType: file.type });
      if (error) throw error;
      const { data } = supabase.storage.from('site-images').getPublicUrl(fileName);
      handleServiceChange(index, 'image', data.publicUrl);
      toast({ title: '✅ Imagen de servicio actualizada' });
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Error subiendo imagen', variant: 'destructive' });
    } finally {
      setUploadingIdx(null);
    }
  };

  // --- Pricing Category Handlers ---
  const handleCategoryTitleChange = (catIdx: number, title: string) => {
    const updated = [...pricingCategories];
    updated[catIdx] = { ...updated[catIdx], title };
    setPricingCategories(updated);
    updateContent('pricing', 'categories', updated);
  };

  const handleCategoryNoteChange = (catIdx: number, note: string) => {
    const updated = [...pricingCategories];
    updated[catIdx] = { ...updated[catIdx], note };
    setPricingCategories(updated);
    updateContent('pricing', 'categories', updated);
  };

  const handlePricingItemChange = (catIdx: number, itemIdx: number, field: 'service' | 'price', val: string) => {
    const updated = [...pricingCategories];
    const items = [...updated[catIdx].items];
    items[itemIdx] = { ...items[itemIdx], [field]: val };
    updated[catIdx] = { ...updated[catIdx], items };
    setPricingCategories(updated);
    updateContent('pricing', 'categories', updated);
  };

  const handleAddPricingItem = (catIdx: number) => {
    const updated = [...pricingCategories];
    const items = [...updated[catIdx].items, { service: 'Nuevo Servicio', price: '$50+' }];
    updated[catIdx] = { ...updated[catIdx], items };
    setPricingCategories(updated);
    updateContent('pricing', 'categories', updated);
  };

  const handleRemovePricingItem = (catIdx: number, itemIdx: number) => {
    const updated = [...pricingCategories];
    const items = updated[catIdx].items.filter((_: any, i: number) => i !== itemIdx);
    updated[catIdx] = { ...updated[catIdx], items };
    setPricingCategories(updated);
    updateContent('pricing', 'categories', updated);
  };

  const handleAddCategory = () => {
    const newCat = {
      title: 'Nueva Categoría',
      items: [{ service: 'Nuevo Servicio', price: '$50+' }],
    };
    const updated = [...pricingCategories, newCat];
    setPricingCategories(updated);
    updateContent('pricing', 'categories', updated);
    toast({ title: 'Categoría de precios agregada' });
  };

  const handleRemoveCategory = (catIdx: number) => {
    if (confirm('¿Eliminar esta categoría de precios completa?')) {
      const updated = pricingCategories.filter((_, i) => i !== catIdx);
      setPricingCategories(updated);
      updateContent('pricing', 'categories', updated);
      toast({ title: 'Categoría eliminada' });
    }
  };

  // --- Layout Handlers ---
  const moveSection = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;
    const updated = [...sections];
    [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
    setSections(updated);
    updateContent('page_layout', 'sections', updated);
  };

  const toggleSection = (id: string) => {
    const updated = sections.map((s) => (s.id === id ? { ...s, hidden: !s.hidden } : s));
    setSections(updated);
    updateContent('page_layout', 'sections', updated);
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Top Bar Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-black/5 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
              <Layout className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-light text-foreground tracking-tight">Constructor de Sitio & Precios</h1>
              <p className="font-body text-xs text-muted-foreground mt-0.5">Gestiona precios, títulos, servicios y la estructura de tu sitio web.</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/">
            <Button variant="outline" className="rounded-xl gap-2 text-xs font-semibold">
              <Eye className="w-4 h-4" /> Ver Sitio En Vivo
            </Button>
          </Link>
          <Button
            onClick={handleSaveAll}
            disabled={saving}
            className="bg-accent hover:bg-accent/90 text-white rounded-xl px-6 h-11 gap-2 shadow-lg shadow-accent/20 font-bold"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar Cambios
          </Button>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-black/10 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('services')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'services'
              ? 'bg-accent text-white shadow-md shadow-accent/20'
              : 'bg-white text-foreground hover:bg-secondary/50 border border-black/5'
          }`}
        >
          <Tag className="w-4 h-4" /> Servicios Principales ({services.length})
        </button>

        <button
          onClick={() => setActiveTab('pricing')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'pricing'
              ? 'bg-accent text-white shadow-md shadow-accent/20'
              : 'bg-white text-foreground hover:bg-secondary/50 border border-black/5'
          }`}
        >
          <DollarSign className="w-4 h-4" /> Lista de Precios ({pricingCategories.length} cat.)
        </button>

        <button
          onClick={() => setActiveTab('titles')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'titles'
              ? 'bg-accent text-white shadow-md shadow-accent/20'
              : 'bg-white text-foreground hover:bg-secondary/50 border border-black/5'
          }`}
        >
          <Type className="w-4 h-4" /> Títulos & Encabezados
        </button>

        <button
          onClick={() => setActiveTab('pages')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'pages'
              ? 'bg-accent text-white shadow-md shadow-accent/20'
              : 'bg-white text-foreground hover:bg-secondary/50 border border-black/5'
          }`}
        >
          <FileText className="w-4 h-4" /> Páginas del Sitio
        </button>

        <button
          onClick={() => setActiveTab('layout')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'layout'
              ? 'bg-accent text-white shadow-md shadow-accent/20'
              : 'bg-white text-foreground hover:bg-secondary/50 border border-black/5'
          }`}
        >
          <Layers className="w-4 h-4" /> Estructura de Páginas
        </button>
      </div>

      {/* ── TAB 1: SERVICIOS PRINCIPALES ── */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-cream p-6 rounded-3xl border border-black/5">
            <div>
              <h2 className="font-display text-xl font-medium">Servicios Destacados en la Página</h2>
              <p className="font-body text-xs text-muted-foreground mt-1">
                Administra los nombres, precios, descripciones e imágenes de las tarjetas de servicios de Alanís Salon.
              </p>
            </div>
            <Button onClick={handleAddService} className="bg-accent hover:bg-accent/90 text-white rounded-xl gap-2 text-xs font-bold">
              <Plus className="w-4 h-4" /> Agregar Nuevo Servicio
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {services.map((service, index) => (
              <div key={index} className="bg-white rounded-3xl p-6 border border-black/5 shadow-sm space-y-4 relative group">
                <div className="flex items-center justify-between pb-3 border-b border-black/5">
                  <span className="font-display text-sm font-bold text-accent">Servicio #{index + 1}</span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg"
                      disabled={index === 0}
                      onClick={() => handleMoveService(index, 'up')}
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg"
                      disabled={index === services.length - 1}
                      onClick={() => handleMoveService(index, 'down')}
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemoveService(index)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Service Card Image Upload */}
                <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-secondary/30 border border-black/5 group/img">
                  <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
                  <label className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer gap-2 font-body text-xs font-bold">
                    <ImagePlus className="w-4 h-4" />
                    {uploadingIdx === index ? 'Subiendo...' : 'Cambiar Imagen'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingIdx === index}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadServiceImage(index, file);
                      }}
                    />
                  </label>
                </div>

                {/* Fields */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Nombre del Servicio</label>
                    <input
                      type="text"
                      value={service.title || ''}
                      onChange={(e) => handleServiceChange(index, 'title', e.target.value)}
                      className="w-full bg-[#FAFAFA] border border-black/5 rounded-xl px-4 py-2.5 text-sm font-body font-medium outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-accent uppercase tracking-widest block mb-1">Precio</label>
                    <input
                      type="text"
                      value={service.price || ''}
                      onChange={(e) => handleServiceChange(index, 'price', e.target.value)}
                      className="w-full bg-[#FAFAFA] border border-accent/20 text-accent rounded-xl px-4 py-2.5 text-sm font-body font-bold outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Descripción</label>
                  <textarea
                    rows={3}
                    value={service.description || ''}
                    onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                    className="w-full bg-[#FAFAFA] border border-black/5 rounded-xl px-4 py-2.5 text-sm font-body outline-none focus:ring-1 focus:ring-accent resize-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 2: LISTA DE PRECIOS Y CATEGORÍAS ── */}
      {activeTab === 'pricing' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-cream p-6 rounded-3xl border border-black/5">
            <div>
              <h2 className="font-display text-xl font-medium">Lista de Precios Completa por Categoría</h2>
              <p className="font-body text-xs text-muted-foreground mt-1">
                Modifica los precios exactos, nombres de tratamientos, notas y categorías que aparecen en el menú de precios del sitio.
              </p>
            </div>
            <Button onClick={handleAddCategory} className="bg-accent hover:bg-accent/90 text-white rounded-xl gap-2 text-xs font-bold">
              <Plus className="w-4 h-4" /> Agregar Nueva Categoría
            </Button>
          </div>

          <div className="space-y-6">
            {pricingCategories.map((cat, catIdx) => (
              <div key={catIdx} className="bg-white rounded-3xl p-6 border border-black/5 shadow-sm space-y-4">
                <div className="flex items-center justify-between gap-4 pb-4 border-b border-black/5">
                  <div className="flex-1 max-w-md">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Título de la Categoría</label>
                    <input
                      type="text"
                      value={cat.title || ''}
                      onChange={(e) => handleCategoryTitleChange(catIdx, e.target.value)}
                      className="w-full bg-[#FAFAFA] border border-black/5 rounded-xl px-4 py-2 text-sm font-display font-medium outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 rounded-xl gap-1 text-xs"
                    onClick={() => handleRemoveCategory(catIdx)}
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Eliminar Categoría
                  </Button>
                </div>

                {/* Rows Table */}
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2">
                    <span className="col-span-7">Tratamiento / Servicio</span>
                    <span className="col-span-4">Precio</span>
                    <span className="col-span-1 text-center">Acción</span>
                  </div>

                  {cat.items?.map((item: any, itemIdx: number) => (
                    <div key={itemIdx} className="grid grid-cols-12 gap-2 items-center bg-[#FAFAFA] p-2 rounded-xl border border-black/5">
                      <div className="col-span-7">
                        <input
                          type="text"
                          value={item.service || ''}
                          onChange={(e) => handlePricingItemChange(catIdx, itemIdx, 'service', e.target.value)}
                          placeholder="Nombre del servicio"
                          className="w-full bg-white border border-black/5 rounded-lg px-3 py-1.5 text-xs font-body outline-none focus:ring-1 focus:ring-accent"
                        />
                      </div>
                      <div className="col-span-4">
                        <input
                          type="text"
                          value={item.price || ''}
                          onChange={(e) => handlePricingItemChange(catIdx, itemIdx, 'price', e.target.value)}
                          placeholder="Ej: $85+"
                          className="w-full bg-white border border-accent/20 text-accent font-bold rounded-lg px-3 py-1.5 text-xs font-body outline-none focus:ring-1 focus:ring-accent"
                        />
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <button
                          onClick={() => handleRemovePricingItem(catIdx, itemIdx)}
                          className="p-1.5 text-muted-foreground hover:text-destructive rounded-lg hover:bg-white transition-colors"
                          title="Eliminar Fila"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Category Note & Add Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-black/5">
                  <div className="flex-1 max-w-lg">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Nota Opcional de Categoría</label>
                    <input
                      type="text"
                      value={cat.note || ''}
                      onChange={(e) => handleCategoryNoteChange(catIdx, e.target.value)}
                      placeholder="Ej: *Precios iniciales sujeto a valoración."
                      className="w-full bg-[#FAFAFA] border border-black/5 rounded-xl px-3 py-1.5 text-xs italic font-body outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddPricingItem(catIdx)}
                    className="rounded-xl text-xs gap-1 border-accent/20 text-accent hover:bg-accent/5 font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" /> Agregar Fila de Precio
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 3: TÍTULOS Y ENCABEZADOS ── */}
      {activeTab === 'titles' && (
        <div className="space-y-6">
          <div className="bg-cream p-6 rounded-3xl border border-black/5">
            <h2 className="font-display text-xl font-medium">Textos y Encabezados Principales del Sitio</h2>
            <p className="font-body text-xs text-muted-foreground mt-1">
              Personaliza los títulos, insignias y descripciones de las secciones principales.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Hero Section Texts */}
            <div className="bg-white rounded-3xl p-6 border border-black/5 shadow-sm space-y-4">
              <h3 className="font-display text-base font-bold text-accent pb-2 border-b border-black/5">Sección Hero (Portada)</h3>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Insignia (Badge)</label>
                <input
                  type="text"
                  value={heroBadge}
                  onChange={(e) => setHeroBadge(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-black/5 rounded-xl px-4 py-2 text-sm font-body outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Título Primera Parte</label>
                <input
                  type="text"
                  value={heroTitle1}
                  onChange={(e) => setHeroTitle1(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-black/5 rounded-xl px-4 py-2 text-sm font-body outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-accent uppercase tracking-widest block mb-1">Título Destacado (Dorado)</label>
                <input
                  type="text"
                  value={heroTitleHighlight}
                  onChange={(e) => setHeroTitleHighlight(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-accent/20 text-accent font-bold rounded-xl px-4 py-2 text-sm font-body outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Descripción</label>
                <textarea
                  rows={2}
                  value={heroDesc}
                  onChange={(e) => setHeroDesc(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-black/5 rounded-xl px-4 py-2 text-sm font-body outline-none focus:ring-1 focus:ring-accent resize-none"
                />
              </div>
            </div>

            {/* Services Section Texts */}
            <div className="bg-white rounded-3xl p-6 border border-black/5 shadow-sm space-y-4">
              <h3 className="font-display text-base font-bold text-accent pb-2 border-b border-black/5">Sección Servicios</h3>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Insignia (Badge)</label>
                <input
                  type="text"
                  value={servicesBadge}
                  onChange={(e) => setServicesBadge(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-black/5 rounded-xl px-4 py-2 text-sm font-body outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Título Principal</label>
                <input
                  type="text"
                  value={servicesTitle}
                  onChange={(e) => setServicesTitle(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-black/5 rounded-xl px-4 py-2 text-sm font-body outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>

            {/* Pricing Section Texts */}
            <div className="bg-white rounded-3xl p-6 border border-black/5 shadow-sm space-y-4">
              <h3 className="font-display text-base font-bold text-accent pb-2 border-b border-black/5">Sección Lista de Precios</h3>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Insignia (Badge)</label>
                <input
                  type="text"
                  value={pricingBadge}
                  onChange={(e) => setPricingBadge(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-black/5 rounded-xl px-4 py-2 text-sm font-body outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Título Principal</label>
                <input
                  type="text"
                  value={pricingTitle}
                  onChange={(e) => setPricingTitle(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-black/5 rounded-xl px-4 py-2 text-sm font-body outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>

            {/* Booking Section Texts */}
            <div className="bg-white rounded-3xl p-6 border border-black/5 shadow-sm space-y-4">
              <h3 className="font-display text-base font-bold text-accent pb-2 border-b border-black/5">Sección de Reservas</h3>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Insignia (Badge)</label>
                <input
                  type="text"
                  value={bookingBadge}
                  onChange={(e) => setBookingBadge(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-black/5 rounded-xl px-4 py-2 text-sm font-body outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Título Principal</label>
                <input
                  type="text"
                  value={bookingTitle}
                  onChange={(e) => setBookingTitle(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-black/5 rounded-xl px-4 py-2 text-sm font-body outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: SUBPÁGINAS DEL SITIO ── */}
      {activeTab === 'pages' && (
        <div className="space-y-6">
          <div className="bg-cream p-6 rounded-3xl border border-black/5">
            <h2 className="font-display text-xl font-medium">Contenido y Encabezados de Subpáginas</h2>
            <p className="font-body text-xs text-muted-foreground mt-1">
              Personaliza los encabezados, descripciones e información de las páginas individuales (*Sobre Nosotros*, *Extensiones*, *Pérdida de Cabello*, *Servicios* y *Contacto*).
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* About Page */}
            <div className="bg-white rounded-3xl p-6 border border-black/5 shadow-sm space-y-4">
              <h3 className="font-display text-base font-bold text-accent pb-2 border-b border-black/5">Página: Sobre Nosotros (About)</h3>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Insignia (Badge)</label>
                <input
                  type="text"
                  value={aboutPageBadge}
                  onChange={(e) => setAboutPageBadge(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-black/5 rounded-xl px-4 py-2 text-sm font-body outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Título de la Página</label>
                <input
                  type="text"
                  value={aboutPageTitle}
                  onChange={(e) => setAboutPageTitle(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-black/5 rounded-xl px-4 py-2 text-sm font-body outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Descripción de la Banner</label>
                <textarea
                  rows={2}
                  value={aboutPageDesc}
                  onChange={(e) => setAboutPageDesc(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-black/5 rounded-xl px-4 py-2 text-sm font-body outline-none focus:ring-1 focus:ring-accent resize-none"
                />
              </div>
            </div>

            {/* Extensions Page */}
            <div className="bg-white rounded-3xl p-6 border border-black/5 shadow-sm space-y-4">
              <h3 className="font-display text-base font-bold text-accent pb-2 border-b border-black/5">Página: Extensiones de Cabello</h3>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Insignia (Badge)</label>
                <input
                  type="text"
                  value={extPageBadge}
                  onChange={(e) => setExtPageBadge(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-black/5 rounded-xl px-4 py-2 text-sm font-body outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Título de la Página</label>
                <input
                  type="text"
                  value={extPageTitle}
                  onChange={(e) => setExtPageTitle(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-black/5 rounded-xl px-4 py-2 text-sm font-body outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Descripción</label>
                <textarea
                  rows={2}
                  value={extPageDesc}
                  onChange={(e) => setExtPageDesc(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-black/5 rounded-xl px-4 py-2 text-sm font-body outline-none focus:ring-1 focus:ring-accent resize-none"
                />
              </div>
            </div>

            {/* Hair Loss Page */}
            <div className="bg-white rounded-3xl p-6 border border-black/5 shadow-sm space-y-4">
              <h3 className="font-display text-base font-bold text-accent pb-2 border-b border-black/5">Página: Pérdida de Cabello</h3>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Insignia (Badge)</label>
                <input
                  type="text"
                  value={hlPageBadge}
                  onChange={(e) => setHlPageBadge(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-black/5 rounded-xl px-4 py-2 text-sm font-body outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Título de la Página</label>
                <input
                  type="text"
                  value={hlPageTitle}
                  onChange={(e) => setHlPageTitle(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-black/5 rounded-xl px-4 py-2 text-sm font-body outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Descripción</label>
                <textarea
                  rows={2}
                  value={hlPageDesc}
                  onChange={(e) => setHlPageDesc(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-black/5 rounded-xl px-4 py-2 text-sm font-body outline-none focus:ring-1 focus:ring-accent resize-none"
                />
              </div>
            </div>

            {/* Services Page */}
            <div className="bg-white rounded-3xl p-6 border border-black/5 shadow-sm space-y-4">
              <h3 className="font-display text-base font-bold text-accent pb-2 border-b border-black/5">Página: Servicios Completo</h3>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Insignia (Badge)</label>
                <input
                  type="text"
                  value={srvPageBadge}
                  onChange={(e) => setSrvPageBadge(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-black/5 rounded-xl px-4 py-2 text-sm font-body outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Título de la Página</label>
                <input
                  type="text"
                  value={srvPageTitle}
                  onChange={(e) => setSrvPageTitle(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-black/5 rounded-xl px-4 py-2 text-sm font-body outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Descripción</label>
                <textarea
                  rows={2}
                  value={srvPageDesc}
                  onChange={(e) => setSrvPageDesc(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-black/5 rounded-xl px-4 py-2 text-sm font-body outline-none focus:ring-1 focus:ring-accent resize-none"
                />
              </div>
            </div>

            {/* Contact Details */}
            <div className="bg-white rounded-3xl p-6 border border-black/5 shadow-sm space-y-4 col-span-2">
              <h3 className="font-display text-base font-bold text-accent pb-2 border-b border-black/5">Información Pública de Contacto (Tarjetas y Pie de Página)</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Teléfono de Contacto</label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full bg-[#FAFAFA] border border-black/5 rounded-xl px-4 py-2 text-sm font-body outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Correo de Contacto</label>
                  <input
                    type="text"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full bg-[#FAFAFA] border border-black/5 rounded-xl px-4 py-2 text-sm font-body outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Ubicación / Dirección</label>
                  <input
                    type="text"
                    value={contactLocation}
                    onChange={(e) => setContactLocation(e.target.value)}
                    className="w-full bg-[#FAFAFA] border border-black/5 rounded-xl px-4 py-2 text-sm font-body outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Horario de Atención</label>
                  <input
                    type="text"
                    value={contactHours}
                    onChange={(e) => setContactHours(e.target.value)}
                    className="w-full bg-[#FAFAFA] border border-black/5 rounded-xl px-4 py-2 text-sm font-body outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 5: ESTRUCTURA DE PÁGINAS ── */}
      {activeTab === 'layout' && (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gradient-to-r from-accent/90 to-accent rounded-3xl p-8 text-white shadow-xl shadow-accent/20 relative overflow-hidden group">
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <h2 className="font-display text-3xl font-medium mb-3">Editor Visual Interactivo</h2>
                <p className="font-body text-white/70 mb-8 max-w-md leading-relaxed">
                  También puedes hacer clic directamente en el texto o imágenes del sitio para editarlos visualmente en vivo.
                </p>
                <Link to="/">
                  <Button className="bg-white text-accent hover:bg-white/90 rounded-xl font-bold px-8 h-12">
                    Abrir Editor Visual <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
              <Layout className="absolute -right-8 -bottom-8 w-64 h-64 text-white/10 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
            </div>

            <div className="bg-[#FFFFFF] rounded-3xl p-8 border border-black/5 shadow-sm">
              <h3 className="font-display text-xl font-medium mb-6">Orden y Visibilidad de Secciones</h3>
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
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 rounded-lg"
                        disabled={i === 0}
                        onClick={() => moveSection(i, 'up')}
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 rounded-lg"
                        disabled={i === sections.length - 1}
                        onClick={() => moveSection(i, 'down')}
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </Button>
                      <div className="w-px h-4 bg-border mx-1" />
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`w-8 h-8 rounded-lg ${s.hidden ? 'text-muted-foreground' : 'text-accent'}`}
                        onClick={() => toggleSection(s.id)}
                      >
                        {s.hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-8 border border-black/5 shadow-sm">
              <h3 className="font-display text-lg font-medium mb-6">Estilos Globales</h3>
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Color de Acento</label>
                  <div className="flex gap-2">
                    {['#C4A484', '#1A1A1A', '#E5DED5', '#D4AF37'].map((color) => (
                      <button
                        key={color}
                        className="w-8 h-8 rounded-full border border-black/10 shadow-inner"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Tipografía Principal</label>
                  <select className="w-full bg-[#FAFAFA] border border-black/5 rounded-xl px-4 py-3 text-sm font-body outline-none">
                    <option>Cormorant Garamond (Display)</option>
                    <option>Inter (Body)</option>
                    <option>Playfair Display</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Floating Save Button for convenience */}
      <div className="flex justify-end pt-4">
        <Button
          onClick={handleSaveAll}
          disabled={saving}
          className="bg-accent hover:bg-accent/90 text-white rounded-2xl px-8 h-12 gap-2 shadow-xl shadow-accent/20 font-bold text-sm"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Guardar Todos los Cambios
        </Button>
      </div>
    </div>
  );
};

export default AdminContent;

