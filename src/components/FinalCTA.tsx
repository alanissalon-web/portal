import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Button } from '@/components/ui/button';
import { MessageCircle, MapPin, Clock, Phone } from 'lucide-react';

export function FinalCTA() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section className="py-24 md:py-32 relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-br from-turquoise-deep via-primary to-turquoise-deep" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsla(38,55%,55%,0.12),transparent_70%)]" />

      <div className="relative z-10 container mx-auto px-6 text-center">
        <div className={`max-w-2xl mx-auto ${isVisible ? 'animate-reveal-up' : 'opacity-0'}`}>
          <h2
            className="font-display text-4xl md:text-6xl font-light text-primary-foreground mb-6 text-balance"
            style={{ lineHeight: '1.1' }}
          >
            Book your free consultation <span className="italic text-gold-gradient">today</span>
          </h2>
          <p className="font-body text-lg text-primary-foreground/70 mb-10 max-w-lg mx-auto text-pretty">
            Limited spots available each week. Discover your hair's best version with a personalized diagnosis.
          </p>

          <div className={`flex flex-col sm:flex-row gap-4 justify-center mb-16 ${isVisible ? 'animate-reveal-up delay-200' : 'opacity-0'}`}>
            <a href="#reservar">
              <Button variant="gold" size="xl" className="text-charcoal">
                Book Consultation
              </Button>
            </a>
            <a href="https://wa.me/17135242610" target="_blank" rel="noopener noreferrer">
              <Button variant="heroOutline" size="xl">
                <MessageCircle className="w-5 h-5" />
                WhatsApp
              </Button>
            </a>
          </div>
        </div>

        <div className={`flex flex-col md:flex-row items-center justify-center gap-8 text-primary-foreground/60 ${isVisible ? 'animate-reveal-up delay-400' : 'opacity-0'}`}>
          <div className="flex items-center gap-2 font-body text-sm">
            <MapPin className="w-4 h-4" />
            <span>Houston, TX — Montrose Area</span>
          </div>
          <div className="hidden md:block h-4 w-px bg-primary-foreground/20" />
          <div className="flex items-center gap-2 font-body text-sm">
            <Clock className="w-4 h-4" />
            <span>Mon – Sat: 9:00 AM – 7:00 PM</span>
          </div>
          <div className="hidden md:block h-4 w-px bg-primary-foreground/20" />
          <div className="flex items-center gap-2 font-body text-sm">
            <Phone className="w-4 h-4" />
            <span>(713) 524-2610</span>
          </div>
        </div>
      </div>
    </section>
  );
}
