import { SalonNavbar } from '@/components/SalonNavbar';
import { SalonFooter } from '@/components/SalonFooter';
import { ShopSection } from '@/components/ShopSection';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Sparkles, Truck, ShieldCheck, Award, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import salonProducts from '@/assets/salon-products.jpg';

const ShopPage = () => {
  const { ref, isVisible } = useScrollReveal();

  return (
    <div className="min-h-screen">
      <SalonNavbar />

      {/* Premium Hero */}
      <section className="relative pt-40 pb-20 md:pt-56 md:pb-28 bg-charcoal overflow-hidden min-h-[60vh] flex items-center">
        <div className="absolute inset-0">
          <img src={salonProducts} alt="Alanís Shop" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal/60 via-charcoal/40 to-charcoal" />
        </div>
        <div className="relative z-10 container mx-auto px-6 text-center">
          <span className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 text-accent rounded-full px-5 py-2 mb-8 font-body text-xs uppercase tracking-[0.2em]">
            <Sparkles className="w-3.5 h-3.5" />
            Curated Collection
          </span>
          <h1 className="font-display text-5xl md:text-7xl font-light text-primary-foreground mb-6 tracking-tight">
            Professional Hair Care
          </h1>
          <p className="font-body text-lg md:text-xl text-primary-foreground/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            The same premium products our stylists trust in-salon — handpicked for extensions, color-treated, and thinning hair.
          </p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-12">
            {[
              { icon: Truck, label: 'Free Shipping Over $75' },
              { icon: ShieldCheck, label: 'Salon-Grade Guaranteed' },
              { icon: Award, label: 'Stylist Curated' },
            ].map(b => (
              <div key={b.label} className="flex items-center gap-2.5 text-primary-foreground/50">
                <b.icon className="w-4 h-4 text-accent" />
                <span className="font-body text-sm">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <div className="bg-accent text-accent-foreground py-3">
        <div className="container mx-auto px-6 text-center">
          <p className="font-body text-sm font-medium tracking-wide">
            ✨ Use code <span className="font-semibold">GLOW15</span> for 15% off your first order — Free shipping on orders $75+
          </p>
        </div>
      </div>

      <ShopSection />

      {/* Why Shop With Us */}
      <section className="py-20 bg-cream" ref={ref}>
        <div className="container mx-auto px-6">
          <div className={`text-center mb-14 ${isVisible ? 'animate-reveal-up' : 'opacity-0'}`}>
            <span className="font-body text-xs uppercase tracking-[0.2em] text-accent font-medium">Why Alanís</span>
            <h2 className="font-display text-3xl md:text-4xl font-light text-foreground mt-3">
              Why shop with us
            </h2>
          </div>
          <div className={`grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto ${isVisible ? 'animate-reveal-up delay-100' : 'opacity-0'}`}>
            {[
              { icon: '🧪', title: 'Expert Selection', desc: 'Every product is tested and approved by our team of licensed stylists.' },
              { icon: '💎', title: 'Premium Quality', desc: 'We only carry professional-grade brands trusted by top salons worldwide.' },
              { icon: '📦', title: 'Fast Delivery', desc: 'Orders ship within 24 hours. Free shipping on purchases over $75.' },
              { icon: '💬', title: 'Stylist Support', desc: 'Need help choosing? Our stylists are available to recommend the perfect products.' },
            ].map(item => (
              <div key={item.title} className="text-center bg-background rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <span className="text-3xl mb-4 block">{item.icon}</span>
                <h3 className="font-display text-lg font-medium text-foreground mb-2">{item.title}</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-charcoal">
        <div className="container mx-auto px-6 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-light text-primary-foreground mb-4">
            Not sure what you need?
          </h2>
          <p className="font-body text-primary-foreground/60 mb-8 max-w-lg mx-auto">
            Book a free consultation and our stylists will create a personalized product regimen for your hair type.
          </p>
          <a href="/contact">
            <Button variant="default" size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              Get Personalized Advice
              <ArrowRight className="w-4 h-4" />
            </Button>
          </a>
        </div>
      </section>

      <SalonFooter />
    </div>
  );
};

export default ShopPage;
