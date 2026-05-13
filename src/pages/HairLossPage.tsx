import { SalonNavbar } from '@/components/SalonNavbar';
import { SalonFooter } from '@/components/SalonFooter';
import { HairLossSection } from '@/components/HairLossSection';
import { BookingWizard } from '@/components/BookingWizard';
import { FinalCTA } from '@/components/FinalCTA';
import salonDecor from '@/assets/salon-decor-real.jpg';

const HairLossPage = () => {
  return (
    <div className="min-h-screen">
      <SalonNavbar />
      {/* Hero banner */}
      <section className="relative pt-40 pb-16 md:pt-56 bg-charcoal overflow-hidden min-h-[50vh] flex items-center">
        <div className="absolute inset-0">
          <img src={salonDecor} alt="Alanís Salon" className="w-full h-full object-cover opacity-30" />
        </div>
        <div className="relative z-10 container mx-auto px-6 py-16 text-center">
          <span className="font-body text-xs uppercase tracking-[0.3em] text-accent mb-4 block">Innovative Technology</span>
          <h1 className="font-display text-5xl md:text-6xl font-light text-primary-foreground mb-4">
            Hair Loss Solutions
          </h1>
          <p className="font-body text-lg text-primary-foreground/70 max-w-lg mx-auto">
            CombLine & Micro Point technology — pioneering hair-to-hair solutions for natural-looking fullness.
          </p>
        </div>
      </section>
      <HairLossSection />
      <BookingWizard />
      <FinalCTA />
      <SalonFooter />
    </div>
  );
};

export default HairLossPage;
