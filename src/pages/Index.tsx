import { SalonNavbar } from '@/components/SalonNavbar';
import { HeroSection } from '@/components/HeroSection';
import { BookingWizard } from '@/components/BookingWizard';
import { AboutSection } from '@/components/AboutSection';
import { ServicesSection } from '@/components/ServicesSection';
import { TransformationsSection } from '@/components/TransformationsSection';
import { ExperienceSection } from '@/components/ExperienceSection';
import { FinalCTA } from '@/components/FinalCTA';
import { WhatsAppFloat } from '@/components/WhatsAppFloat';
import { SalonFooter } from '@/components/SalonFooter';

const Index = () => {
  return (
    <div className="min-h-screen">
      <SalonNavbar />
      <HeroSection />
      <BookingWizard />
      <AboutSection />
      <ServicesSection />
      <TransformationsSection />
      <ExperienceSection />
      <FinalCTA />
      <SalonFooter />
      <WhatsAppFloat />
    </div>
  );
};

export default Index;
