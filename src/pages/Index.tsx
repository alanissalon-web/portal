import { SalonNavbar } from '@/components/SalonNavbar';
import { HeroSection } from '@/components/HeroSection';
import { BookingWizard } from '@/components/BookingWizard';
import { AboutSection } from '@/components/AboutSection';
import { ServicesSection } from '@/components/ServicesSection';
import { TransformationsSection } from '@/components/TransformationsSection';
import { ExperienceSection } from '@/components/ExperienceSection';
import { FinalCTA } from '@/components/FinalCTA';
import { InstagramWall } from '@/components/InstagramWall';
import { SalonFooter } from '@/components/SalonFooter';

import { useCMS } from '@/contexts/CMSContext';

import { PricingSection } from '@/components/PricingSection';
import { ExtensionsSection } from '@/components/ExtensionsSection';
import { HairLossSection } from '@/components/HairLossSection';

const sectionComponents: Record<string, React.FC> = {
  hero: HeroSection,
  booking: BookingWizard,
  about: AboutSection,
  services: ServicesSection,
  transformations: TransformationsSection,
  experience: ExperienceSection,
  cta: FinalCTA,
  instagram: InstagramWall,
  pricing: PricingSection,
  extensions: ExtensionsSection,
  hairloss: HairLossSection,
};

const Index = () => {
  const { content } = useCMS();
  
  const defaultSections = [
    { id: 'hero' },
    { id: 'booking' },
    { id: 'about' },
    { id: 'services' },
    { id: 'transformations' },
    { id: 'experience' },
    { id: 'instagram' },
    { id: 'cta' },
  ];

  const sections = content['page_layout']?.sections || defaultSections;

  return (
    <div className="min-h-screen">
      <SalonNavbar />
      {sections.map((section: any, index: number) => {
        if (!section || !section.id) return null;
        // Extract base component name from ID (e.g., "hero-123" -> "hero")
        const baseId = section.id.split('-')[0];
        const Component = sectionComponents[baseId];
        return Component ? <Component key={section.id || index} /> : null;
      })}
      <SalonFooter />
    </div>
  );
};

export default Index;
