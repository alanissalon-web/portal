import { SalonNavbar } from '@/components/SalonNavbar';
import { SalonFooter } from '@/components/SalonFooter';
import { WhatsAppFloat } from '@/components/WhatsAppFloat';
import { ExtensionsSection } from '@/components/ExtensionsSection';
import { TransformationsSection } from '@/components/TransformationsSection';
import { BookingWizard } from '@/components/BookingWizard';
import { FinalCTA } from '@/components/FinalCTA';
import salonWash from '@/assets/salon-wash-station.jpg';

const ExtensionsPage = () => {
  return (
    <div className="min-h-screen">
      <SalonNavbar />
      {/* Hero banner */}
      <section className="relative pt-24 pb-16 bg-charcoal overflow-hidden min-h-[50vh] flex items-center">
        <div className="absolute inset-0">
          <img src={salonWash} alt="Alanís Salon" className="w-full h-full object-cover opacity-30" />
        </div>
        <div className="relative z-10 container mx-auto px-6 py-16 text-center">
          <span className="font-body text-xs uppercase tracking-[0.3em] text-accent mb-4 block">Certified Specialists</span>
          <h1 className="font-display text-5xl md:text-6xl font-light text-primary-foreground mb-4">
            Hair Extensions
          </h1>
          <p className="font-body text-lg text-primary-foreground/70 max-w-lg mx-auto">
            Great Lengths, Mago, CombLine, tape-ins — 20+ years perfecting the art of seamless extensions.
          </p>
        </div>
      </section>
      <ExtensionsSection />
      <TransformationsSection />
      <BookingWizard />
      <FinalCTA />
      <SalonFooter />
      <WhatsAppFloat />
    </div>
  );
};

export default ExtensionsPage;
