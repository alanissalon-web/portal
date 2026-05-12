import { SalonNavbar } from '@/components/SalonNavbar';
import { SalonFooter } from '@/components/SalonFooter';
import { WhatsAppFloat } from '@/components/WhatsAppFloat';
import { ServicesSection } from '@/components/ServicesSection';
import { PricingSection } from '@/components/PricingSection';
import { ExperienceSection } from '@/components/ExperienceSection';
import { BookingWizard } from '@/components/BookingWizard';
import { FinalCTA } from '@/components/FinalCTA';
import salonReception from '@/assets/salon-reception.jpg';
import salonMirror from '@/assets/salon-mirror-station.jpg';
import serviceColor from '@/assets/service-color.jpg';
import serviceCut from '@/assets/service-cut.jpg';

const ServicesPage = () => {
  return (
    <div className="min-h-screen">
      <SalonNavbar />
      {/* Hero banner */}
      <section className="relative pt-24 pb-16 bg-charcoal overflow-hidden min-h-[50vh] flex items-center">
        <div className="absolute inset-0">
          <img src={salonReception} alt="Alanís Salon reception" className="w-full h-full object-cover opacity-30" />
        </div>
        <div className="relative z-10 container mx-auto px-6 py-16 text-center">
          <span className="font-body text-xs uppercase tracking-[0.3em] text-accent mb-4 block">Expert Hair Care</span>
          <h1 className="font-display text-5xl md:text-6xl font-light text-primary-foreground mb-4">
            Our Services
          </h1>
          <p className="font-body text-lg text-primary-foreground/70 max-w-lg mx-auto">
            From precision cuts to transformative color — every service is a premium experience tailored to you.
          </p>
        </div>
      </section>

      {/* Gallery strip */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[salonReception, salonMirror, serviceColor, serviceCut].map((img, i) => (
              <div key={i} className="rounded-xl overflow-hidden aspect-square group">
                <img src={img} alt="Salon interior" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <ServicesSection />
      <PricingSection />
      <ExperienceSection />
      <BookingWizard />
      <FinalCTA />
      <SalonFooter />
      <WhatsAppFloat />
    </div>
  );
};

export default ServicesPage;
