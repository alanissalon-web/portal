import { SalonNavbar } from '@/components/SalonNavbar';
import { SalonFooter } from '@/components/SalonFooter';
import { WhatsAppFloat } from '@/components/WhatsAppFloat';
import { AboutSection } from '@/components/AboutSection';
import { BookingWizard } from '@/components/BookingWizard';
import { FinalCTA } from '@/components/FinalCTA';
import salonLoungeImage from '@/assets/salon-lounge-real.jpg';

const AboutPage = () => {
  return (
    <div className="min-h-screen">
      <SalonNavbar />
      {/* Hero banner */}
      <section className="relative pt-40 pb-16 md:pt-56 bg-charcoal overflow-hidden min-h-[50vh] flex items-center">
        <div className="absolute inset-0">
          <img src={salonLoungeImage} alt="Alanís Salon lounge" className="w-full h-full object-cover opacity-25" />
        </div>
        <div className="relative z-10 container mx-auto px-6 py-16 text-center">
          <span className="font-body text-xs uppercase tracking-[0.3em] text-accent mb-4 block">Our Story</span>
          <h1 className="font-display text-5xl md:text-6xl font-light text-primary-foreground mb-4">
            About Alanís
          </h1>
          <p className="font-body text-lg text-primary-foreground/70 max-w-lg mx-auto">
            25+ years of passion, expertise, and dedication to transforming lives through the art of hair.
          </p>
        </div>
      </section>
      <AboutSection />
      <BookingWizard />
      <FinalCTA />
      <SalonFooter />
      <WhatsAppFloat />
    </div>
  );
};

export default AboutPage;
