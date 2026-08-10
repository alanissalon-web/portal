import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Button } from '@/components/ui/button';
import { ArrowRight, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import serviceColor from '@/assets/service-color.jpg';
import serviceCut from '@/assets/service-cut.jpg';
import serviceTreatment from '@/assets/service-treatment.jpg';
import transformation1 from '@/assets/transformation-1.jpg';
import { EditableText } from './cms/EditableText';
import { EditableImage } from './cms/EditableImage';
import { useCMS } from '@/contexts/CMSContext';
import { cn } from '@/lib/utils';

export function ServicesSection() {
  const { ref, isVisible } = useScrollReveal();
  const { content, updateContent, isEditing } = useCMS();

  const defaultServices = [
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

  const items = content.services?.items || defaultServices;

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    updateContent('services', 'items', newItems);
  };

  const addItem = () => {
    const newItems = [
      ...items,
      {
        title: 'New Service',
        description: 'Service description goes here.',
        image: serviceCut,
        price: 'From $50',
      }
    ];
    updateContent('services', 'items', newItems);
  };

  const removeItem = (index: number) => {
    if (confirm('Are you sure you want to delete this service?')) {
      const newItems = items.filter((_: any, i: number) => i !== index);
      updateContent('services', 'items', newItems);
    }
  };

  return (
    <section id="services" className="py-24 md:py-32 bg-cream" ref={ref}>
      <div className="container mx-auto px-6">
        <div className={`text-center max-w-2xl mx-auto mb-16 ${isVisible ? 'animate-reveal-up' : 'opacity-0'}`}>
          <span className="font-body text-xs uppercase tracking-[0.2em] text-accent font-medium">
            <EditableText section="services" field="badge" defaultText="The Alanis Experience" as="span" />
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-light text-foreground mt-3 text-balance" style={{ lineHeight: '1.15' }}>
            <EditableText section="services" field="title" defaultText="Exclusive Services for Radiant Hair" as="span" />
          </h2>
          <div className="luxury-divider mx-auto mt-6" />
        </div>

        <div className={cn(
          "grid gap-8 mx-auto transition-all duration-500",
          items.length >= 3 ? "md:grid-cols-2 lg:grid-cols-3 max-w-6xl" : "md:grid-cols-2 max-w-5xl"
        )}>
          {items.map((service: any, i: number) => (
            <div
              key={i}
              className={`group relative overflow-hidden rounded-2xl bg-card shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 ${
                isVisible ? 'animate-reveal-up' : 'opacity-0'
              }`}
              style={{ animationDelay: `${(i + 1) * 120}ms` }}
            >
              {isEditing && (
                <button
                  onClick={() => removeItem(i)}
                  className="absolute top-4 right-4 z-20 bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full p-2 shadow-md hover:scale-105 transition-all"
                  title="Delete Service"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              <div className="aspect-[4/3] overflow-hidden relative">
                <EditableImage
                  defaultImage={service.image}
                  onSave={(url) => updateItem(i, 'image', url)}
                  alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-2 gap-2">
                  <h3
                    contentEditable={isEditing}
                    suppressContentEditableWarning
                    onBlur={(e) => updateItem(i, 'title', e.currentTarget.innerText.trim())}
                    className={cn(
                      "font-display text-2xl font-medium text-foreground outline-none flex-1",
                      isEditing && "hover:bg-accent/5 focus:bg-accent/5 focus:ring-1 focus:ring-accent/50 rounded px-1 cursor-text border border-dashed border-accent/30"
                    )}
                  >
                    {service.title}
                  </h3>
                  <span
                    contentEditable={isEditing}
                    suppressContentEditableWarning
                    onBlur={(e) => updateItem(i, 'price', e.currentTarget.innerText.trim())}
                    className={cn(
                      "font-body text-sm text-accent font-medium bg-accent/10 px-3 py-1 rounded-full outline-none",
                      isEditing && "hover:bg-accent/5 focus:bg-accent/5 focus:ring-1 focus:ring-accent/50 cursor-text border border-dashed border-accent/30"
                    )}
                  >
                    {service.price}
                  </span>
                </div>
                <div
                  contentEditable={isEditing}
                  suppressContentEditableWarning
                  onBlur={(e) => updateItem(i, 'description', e.currentTarget.innerText.trim())}
                  className={cn(
                    "font-body text-muted-foreground text-sm leading-relaxed mb-5 text-pretty outline-none min-h-[3.5em]",
                    isEditing && "hover:bg-accent/5 focus:bg-accent/5 focus:ring-1 focus:ring-accent/50 rounded px-1 cursor-text border border-dashed border-accent/30"
                  )}
                >
                  {service.description}
                </div>
                <Link to="/services">
                  <Button variant="outline" size="sm" className="group/btn">
                    Learn More
                    <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {isEditing && (
          <div className="flex justify-center mt-12">
            <Button
              onClick={addItem}
              className="gap-2 bg-accent hover:bg-accent/90 text-white rounded-full px-6 py-5 shadow-md hover:scale-105 transition-all"
            >
              <Plus className="w-4 h-4" /> Add New Service
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
