import { SalonNavbar } from '@/components/SalonNavbar';
import { SalonFooter } from '@/components/SalonFooter';
import { ContactSection } from '@/components/ContactSection';
import { BookingWizard } from '@/components/BookingWizard';
import salonLounge from '@/assets/salon-lounge-real.jpg';

const ContactPage = () => {
  return (
    <div className="min-h-screen">
      <SalonNavbar />
      {/* Hero banner */}
      <section className="relative pt-40 pb-16 md:pt-56 bg-charcoal overflow-hidden min-h-[50vh] flex items-center">
        <div className="absolute inset-0">
          <img src={salonLounge} alt="Alanís Salon lounge" className="w-full h-full object-cover opacity-30" />
        </div>
        <div className="relative z-10 container mx-auto px-6 py-16 text-center">
          <h1 className="font-display text-5xl md:text-6xl font-light text-primary-foreground mb-4">
            Contact Us
          </h1>
          <p className="font-body text-lg text-primary-foreground/70 max-w-lg mx-auto">
            We'd love to hear from you. Schedule your consultation or visit us in Houston.
          </p>
        </div>
      </section>
      <ContactSection />
      <BookingWizard />
      <SalonFooter />
    </div>
  );
};

export default ContactPage;
