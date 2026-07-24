import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Button } from '@/components/ui/button';
import { ArrowRight, Phone, Plus, Trash2 } from 'lucide-react';
import { EditableText } from './cms/EditableText';
import { useCMS } from '@/contexts/CMSContext';
import { cn } from '@/lib/utils';

const defaultCategories = [
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

export function PricingSection() {
  const { ref, isVisible } = useScrollReveal();
  const { content, updateContent, isEditing } = useCMS();

  const pricingCategories = content.pricing?.categories || defaultCategories;

  const updateCategoryTitle = (catIdx: number, newTitle: string) => {
    const newCats = [...pricingCategories];
    newCats[catIdx] = { ...newCats[catIdx], title: newTitle };
    updateContent('pricing', 'categories', newCats);
  };

  const updateCategoryNote = (catIdx: number, newNote: string) => {
    const newCats = [...pricingCategories];
    newCats[catIdx] = { ...newCats[catIdx], note: newNote };
    updateContent('pricing', 'categories', newCats);
  };

  const updateItem = (catIdx: number, itemIdx: number, field: 'service' | 'price', value: string) => {
    const newCats = [...pricingCategories];
    const newItems = [...newCats[catIdx].items];
    newItems[itemIdx] = { ...newItems[itemIdx], [field]: value };
    newCats[catIdx] = { ...newCats[catIdx], items: newItems };
    updateContent('pricing', 'categories', newCats);
  };

  const addCategory = () => {
    const newCats = [
      ...pricingCategories,
      {
        title: 'New Category',
        items: [
          { service: 'New Service', price: '$50+' }
        ]
      }
    ];
    updateContent('pricing', 'categories', newCats);
  };

  const removeCategory = (catIdx: number) => {
    if (confirm('Are you sure you want to delete this category?')) {
      const newCats = pricingCategories.filter((_: any, i: number) => i !== catIdx);
      updateContent('pricing', 'categories', newCats);
    }
  };

  const addItem = (catIdx: number) => {
    const newCats = [...pricingCategories];
    const newItems = [
      ...newCats[catIdx].items,
      { service: 'New Service', price: '$50+' }
    ];
    newCats[catIdx] = { ...newCats[catIdx], items: newItems };
    updateContent('pricing', 'categories', newCats);
  };

  const removeItem = (catIdx: number, itemIdx: number) => {
    if (confirm('Are you sure you want to delete this service?')) {
      const newCats = [...pricingCategories];
      const newItems = newCats[catIdx].items.filter((_: any, i: number) => i !== itemIdx);
      newCats[catIdx] = { ...newCats[catIdx], items: newItems };
      updateContent('pricing', 'categories', newCats);
    }
  };

  return (
    <section id="pricing" className="py-24 md:py-32 bg-cream" ref={ref}>
      <div className="container mx-auto px-6">
        <div className={`text-center max-w-2xl mx-auto mb-16 ${isVisible ? 'animate-reveal-up' : 'opacity-0'}`}>
          <span className="font-body text-xs uppercase tracking-[0.2em] text-accent font-medium">
            <EditableText section="pricing" field="badge" defaultText="Our Prices" as="span" />
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-light text-foreground mt-3 text-balance" style={{ lineHeight: '1.15' }}>
            <EditableText section="pricing" field="title" defaultText="Services & Pricing" as="span" />
          </h2>
          <div className="luxury-divider mx-auto mt-6" />
        </div>

        <div className={`grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12 ${isVisible ? 'animate-reveal-up delay-200' : 'opacity-0'}`}>
          {pricingCategories.map((cat: any, i: number) => (
            <div
              key={i}
              className="bg-card rounded-2xl p-7 shadow-sm hover:shadow-lg transition-all duration-500 hover:-translate-y-1 relative"
              style={{ animationDelay: `${200 + i * 80}ms` }}
            >
              {isEditing && (
                <button
                  onClick={() => removeCategory(i)}
                  className="absolute top-4 right-4 z-20 bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full p-1.5 shadow-md hover:scale-105 transition-all"
                  title="Delete Category"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}

              <h3
                contentEditable={isEditing}
                suppressContentEditableWarning
                onBlur={(e) => updateCategoryTitle(i, e.currentTarget.innerText.trim())}
                className={cn(
                  "font-display text-xl font-medium text-foreground mb-5 pb-3 border-b border-border outline-none",
                  isEditing && "hover:bg-accent/5 focus:bg-accent/5 focus:ring-1 focus:ring-accent/50 rounded px-1 cursor-text border border-dashed border-accent/30 pr-8"
                )}
              >
                {cat.title}
              </h3>

              <div className="space-y-3">
                {cat.items.map((item: any, j: number) => (
                  <div key={j} className="flex items-center justify-between gap-3 group/row">
                    <span
                      contentEditable={isEditing}
                      suppressContentEditableWarning
                      onBlur={(e) => updateItem(i, j, 'service', e.currentTarget.innerText.trim())}
                      className={cn(
                        "font-body text-sm text-foreground/80 outline-none flex-1",
                        isEditing && "hover:bg-accent/5 focus:bg-accent/5 focus:ring-1 focus:ring-accent/50 rounded px-1 cursor-text border border-dashed border-accent/20"
                      )}
                    >
                      {item.service}
                    </span>
                    <span
                      contentEditable={isEditing}
                      suppressContentEditableWarning
                      onBlur={(e) => updateItem(i, j, 'price', e.currentTarget.innerText.trim())}
                      className={cn(
                        "font-body text-sm font-medium text-accent whitespace-nowrap outline-none",
                        isEditing && "hover:bg-accent/5 focus:bg-accent/5 focus:ring-1 focus:ring-accent/50 rounded px-1 cursor-text border border-dashed border-accent/20"
                      )}
                    >
                      {item.price}
                    </span>
                    {isEditing && (
                      <button
                        onClick={() => removeItem(i, j)}
                        className="text-destructive hover:text-destructive/80 p-0.5 opacity-60 hover:opacity-100 transition-opacity"
                        title="Delete Service Row"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {(cat.note || isEditing) && (
                <div className="mt-4 pt-3 border-t border-border">
                  <p
                    contentEditable={isEditing}
                    suppressContentEditableWarning
                    onBlur={(e) => updateCategoryNote(i, e.currentTarget.innerText.trim())}
                    className={cn(
                      "font-body text-xs text-muted-foreground italic outline-none",
                      isEditing && "hover:bg-accent/5 focus:bg-accent/5 focus:ring-1 focus:ring-accent/50 rounded px-1 cursor-text border border-dashed border-accent/20 min-h-[1.5em]"
                    )}
                  >
                    {cat.note || (isEditing ? 'Add category note...' : '')}
                  </p>
                </div>
              )}

              {isEditing && (
                <div className="mt-5 flex justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addItem(i)}
                    className="text-[10px] uppercase tracking-wider py-1.5 h-8 rounded-xl font-bold border-accent/20 text-accent hover:bg-accent/5"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add Row
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        {isEditing && (
          <div className="flex justify-center mb-16">
            <Button
              onClick={addCategory}
              className="gap-2 bg-accent hover:bg-accent/90 text-white rounded-full px-6 py-5 shadow-md hover:scale-105 transition-all"
            >
              <Plus className="w-4 h-4" /> Add New Category
            </Button>
          </div>
        )}

        <div className={`text-center ${isVisible ? 'animate-reveal-up delay-300' : 'opacity-0'}`}>
          <p className="font-body text-muted-foreground mb-4">
            We would be honored to be part of your special day.
          </p>
          <a href="tel:7135242610">
            <Button variant="outline" size="lg">
              <Phone className="w-4 h-4" />
              Call (713) 524-2610
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
