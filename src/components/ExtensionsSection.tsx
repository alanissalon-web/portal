import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

const galleryImages = [
  'https://images.squarespace-cdn.com/content/v1/5b03616f9772ae0c5a7c199b/1712180689466-9VVMGVOL2BPRG27WO807/IMG_9818.jpeg',
  'https://images.squarespace-cdn.com/content/v1/5b03616f9772ae0c5a7c199b/1712180690771-BXHMIWYFPRD742GDAA6Y/IMG_7132.jpeg',
  'https://images.squarespace-cdn.com/content/v1/5b03616f9772ae0c5a7c199b/1712180692054-YY0W41BUF4VNDR8RLA56/IMG_9859.jpeg',
  'https://images.squarespace-cdn.com/content/v1/5b03616f9772ae0c5a7c199b/1712180693376-7W0S5SXPIT7GDU3S4Q3G/IMG_5139.jpeg',
  'https://images.squarespace-cdn.com/content/v1/5b03616f9772ae0c5a7c199b/1712180694792-D6Q9HFL4WJW4448M1GRK/IMG_2198.jpeg',
  'https://images.squarespace-cdn.com/content/v1/5b03616f9772ae0c5a7c199b/1712180696062-3JCXGM7ADF7YV2YF6KAK/IMG_2191.jpeg',
  'https://images.squarespace-cdn.com/content/v1/5b03616f9772ae0c5a7c199b/1712181288815-D4R5M0IAKBA5SCLC84HO/IMG_5415.jpeg',
  'https://images.squarespace-cdn.com/content/v1/5b03616f9772ae0c5a7c199b/1712181290204-7API5712FJ3KKZMYJZ79/IMG_5898.jpeg',
  'https://images.squarespace-cdn.com/content/v1/5b03616f9772ae0c5a7c199b/1712181291533-HY1UX4BEZ8J9BVSK20V3/IMG_6453.jpeg',
  'https://images.squarespace-cdn.com/content/v1/5b03616f9772ae0c5a7c199b/1712181292610-SYHU1DRORNZ2XM2E3VE1/IMG_0624.jpeg',
  'https://images.squarespace-cdn.com/content/v1/5b03616f9772ae0c5a7c199b/1712181295500-QRTCXRHPYDF1OTWV35A2/IMG_6337.jpeg',
  'https://images.squarespace-cdn.com/content/v1/5b03616f9772ae0c5a7c199b/1733427974576-8RAK0T3I3VXN3QIGCJTN/IMG_5890.jpg',
];

const extensionTypes = [
  { name: 'Great Lengths', desc: 'Premium keratin & tape-in extensions — certified since 2004' },
  { name: 'Mago', desc: 'Knotted extensions for natural, seamless blending' },
  { name: 'CombLine / Microlinks', desc: 'Revolutionary hair-to-hair bonding technology' },
  { name: 'Tape-Ins', desc: 'Quick application, easy maintenance, reusable' },
  { name: 'Micro Point', desc: 'Volumizing solution for thinning hair — instant fullness' },
];

const faqs = [
  { q: 'Which hair extensions should I get?', a: 'It depends on the current health of your hair, your goals, health history, lifestyle, and maintenance preferences. A consultation is the best way to find out.' },
  { q: 'Will people know I\'m wearing extensions?', a: 'No. Our extensions are customized to blend seamlessly with your natural hair.' },
  { q: 'Will extensions damage my natural hair?', a: 'With proper application, maintenance, and removal, there should be no damage. In fact, most people find their hair has done better after removal.' },
  { q: 'How long do extensions last?', a: 'Anywhere from a day to 6 months, depending on the type. Tape-ins: 6-8 weeks. Microlinks: 2-3 months. Fusion or Mago: 4-6 months.' },
  { q: 'Can hair be too thin for extensions?', a: 'The majority of the time, thin hair is not an issue — it\'s more about expectations. Your specialist will recommend the best type during consultation.' },
  { q: 'How do I sleep with extensions?', a: 'We suggest a low ponytail, loose bun, or braids. A silk pillowcase helps, and always brush before bed.' },
  { q: 'How short can my hair be?', a: 'Hair can be as short as 1 inch, but length depends on how well it will blend with your natural hair.' },
  { q: 'Can extensions be reused?', a: 'Yes! Many extension types can be reused with proper care.' },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left group"
      >
        <span className="font-body text-sm font-medium text-foreground group-hover:text-primary transition-colors pr-4">{q}</span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-accent flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        )}
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-40 pb-4' : 'max-h-0'}`}
      >
        <p className="font-body text-sm text-muted-foreground leading-relaxed">{a}</p>
      </div>
    </div>
  );
}

export function ExtensionsSection() {
  const { ref, isVisible } = useScrollReveal();
  const [showAll, setShowAll] = useState(false);
  const visibleImages = showAll ? galleryImages : galleryImages.slice(0, 8);

  return (
    <section id="extensions" className="py-24 md:py-32 bg-background" ref={ref}>
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className={`text-center max-w-2xl mx-auto mb-16 ${isVisible ? 'animate-reveal-up' : 'opacity-0'}`}>
          <span className="font-body text-xs uppercase tracking-[0.2em] text-accent font-medium">
            Hair Extensions
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-light text-foreground mt-3 text-balance" style={{ lineHeight: '1.15' }}>
            Houston's premiere extension salon
          </h2>
          <div className="luxury-divider mx-auto mt-6" />
          <p className="font-body text-muted-foreground mt-6 leading-relaxed text-pretty max-w-xl mx-auto">
            Over 20 years customizing individual hair extensions on all types of hair. Whether you're looking for length, volume, or solutions for thinning hair — we customize extensions that blend seamlessly. Certified by Great Lengths, Mago, Micro Point, Dream Catcher, HairDreams, and more.
          </p>
        </div>

        {/* Hero extension image */}
        <div className={`max-w-4xl mx-auto mb-16 ${isVisible ? 'animate-reveal-scale delay-100' : 'opacity-0'}`}>
          <div className="rounded-2xl overflow-hidden shadow-xl shadow-foreground/10 group">
            <img
              src="https://images.squarespace-cdn.com/content/v1/5b03616f9772ae0c5a7c199b/1603381349501-NID1QSSHZLWD7A894B3U/Micro+Points++.jpg"
              alt="Hair extensions application at Alanis Salon"
              className="w-full h-auto transition-transform duration-700 group-hover:scale-[1.02]"
              loading="lazy"
            />
          </div>
        </div>

        {/* Extension types */}
        <div className={`grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto mb-16 ${isVisible ? 'animate-reveal-up delay-200' : 'opacity-0'}`}>
          {extensionTypes.map((ext) => (
            <div key={ext.name} className="flex items-start gap-3 bg-cream rounded-xl p-5 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
              <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-display text-lg font-medium text-foreground">{ext.name}</p>
                <p className="font-body text-sm text-muted-foreground">{ext.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Did you know callout */}
        <div className={`max-w-3xl mx-auto mb-16 text-center bg-cream rounded-2xl p-8 md:p-10 ${isVisible ? 'animate-reveal-up delay-300' : 'opacity-0'}`}>
          <h3 className="font-display text-2xl md:text-3xl font-light text-foreground mb-3">Did you know?</h3>
          <p className="font-body text-muted-foreground leading-relaxed max-w-lg mx-auto">
            Some hair extensions can last 4 to 6 months depending on the type, your hair care routine, and how fast your hair grows.
          </p>
        </div>

        {/* Gallery */}
        <div className={`mb-16 ${isVisible ? 'animate-reveal-up delay-300' : 'opacity-0'}`}>
          <h3 className="font-display text-2xl font-light text-foreground text-center mb-8">Extension Gallery</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {visibleImages.map((img, i) => (
              <div
                key={i}
                className="group aspect-square overflow-hidden rounded-xl shadow-sm hover:shadow-lg transition-all duration-500 hover:-translate-y-1"
              >
                <img
                  src={img}
                  alt={`Hair extension result ${i + 1}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
          {galleryImages.length > 8 && (
            <div className="text-center mt-6">
              <Button variant="outline" size="sm" onClick={() => setShowAll(!showAll)}>
                {showAll ? 'Show Less' : `View All (${galleryImages.length})`}
              </Button>
            </div>
          )}
        </div>

        {/* FAQ Section */}
        <div className={`max-w-2xl mx-auto mb-12 ${isVisible ? 'animate-reveal-up delay-400' : 'opacity-0'}`}>
          <h3 className="font-display text-2xl font-light text-foreground text-center mb-8">Extension Q&A</h3>
          <div className="bg-card rounded-2xl p-6 md:p-8 shadow-sm">
            {faqs.map((faq) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className={`text-center ${isVisible ? 'animate-reveal-up delay-500' : 'opacity-0'}`}>
          <p className="font-body text-sm text-muted-foreground mb-4">
            Consultations are free but do require appointments.
          </p>
          <a href="#booking">
            <Button variant="default" size="lg">
              Schedule Free Consult
              <ArrowRight className="w-4 h-4" />
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
