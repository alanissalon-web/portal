import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Button } from '@/components/ui/button';
import { ArrowRight, Phone } from 'lucide-react';

const categories = [
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

  return (
    <section id="pricing" className="py-24 md:py-32 bg-cream" ref={ref}>
      <div className="container mx-auto px-6">
        <div className={`text-center max-w-2xl mx-auto mb-16 ${isVisible ? 'animate-reveal-up' : 'opacity-0'}`}>
          <span className="font-body text-xs uppercase tracking-[0.2em] text-accent font-medium">
            Our Prices
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-light text-foreground mt-3 text-balance" style={{ lineHeight: '1.15' }}>
            Services & Pricing
          </h2>
          <div className="luxury-divider mx-auto mt-6" />
        </div>

        <div className={`grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12 ${isVisible ? 'animate-reveal-up delay-200' : 'opacity-0'}`}>
          {categories.map((cat, i) => (
            <div
              key={cat.title}
              className="bg-card rounded-2xl p-7 shadow-sm hover:shadow-lg transition-all duration-500 hover:-translate-y-1"
              style={{ animationDelay: `${200 + i * 80}ms` }}
            >
              <h3 className="font-display text-xl font-medium text-foreground mb-5 pb-3 border-b border-border">
                {cat.title}
              </h3>
              <div className="space-y-3">
                {cat.items.map((item) => (
                  <div key={item.service} className="flex items-center justify-between gap-3">
                    <span className="font-body text-sm text-foreground/80">{item.service}</span>
                    <span className="font-body text-sm font-medium text-accent whitespace-nowrap">{item.price}</span>
                  </div>
                ))}
              </div>
              {cat.note && (
                <p className="font-body text-xs text-muted-foreground italic mt-4 pt-3 border-t border-border">{cat.note}</p>
              )}
            </div>
          ))}
        </div>

        {/* Special events CTA */}
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
