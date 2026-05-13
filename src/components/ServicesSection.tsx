import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import serviceColor from '@/assets/service-color.jpg';
import serviceCut from '@/assets/service-cut.jpg';
import serviceTreatment from '@/assets/service-treatment.jpg';
import transformation1 from '@/assets/transformation-1.jpg';
import { EditableText } from './cms/EditableText';
import { EditableImage } from './cms/EditableImage';

const services = [
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

export function ServicesSection() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section id="services" className="py-24 md:py-32 bg-cream" ref={ref}>
      <div className="container mx-auto px-6">
        <div className={`text-center max-w-2xl mx-auto mb-16 ${isVisible ? 'animate-reveal-up' : 'opacity-0'}`}>
          <span className="font-body text-xs uppercase tracking-[0.2em] text-accent font-medium">
            <EditableText section="services" field="badge" defaultText="Our Services" as="span" />
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-light text-foreground mt-3 text-balance" style={{ lineHeight: '1.15' }}>
            <EditableText section="services" field="title" defaultText="Every service, a premium experience" as="span" />
          </h2>
          <div className="luxury-divider mx-auto mt-6" />
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {services.map((service, i) => (
            <div
              key={service.title}
              className={`group relative overflow-hidden rounded-2xl bg-card shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 ${
                isVisible ? 'animate-reveal-up' : 'opacity-0'
              }`}
              style={{ animationDelay: `${(i + 1) * 120}ms` }}
            >
              <div className="aspect-[4/3] overflow-hidden">
                <EditableImage
                  section="services"
                  field={`service_${i}_image`}
                  defaultImage={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-display text-2xl font-medium text-foreground">
                    <EditableText section="services" field={`service_${i}_title`} defaultText={service.title} as="span" />
                  </h3>
                  <span className="font-body text-sm text-accent font-medium bg-accent/10 px-3 py-1 rounded-full">
                    <EditableText section="services" field={`service_${i}_price`} defaultText={service.price} as="span" />
                  </span>
                </div>
                <div className="font-body text-muted-foreground text-sm leading-relaxed mb-5 text-pretty">
                  <EditableText section="services" field={`service_${i}_description`} defaultText={service.description} />
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
      </div>
    </section>
  );
}
