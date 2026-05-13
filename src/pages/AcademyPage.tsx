import { SalonNavbar } from '@/components/SalonNavbar';
import { SalonFooter } from '@/components/SalonFooter';
import { AcademySection } from '@/components/AcademySection';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { GraduationCap, Play, Award, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import salonStyling from '@/assets/salon-styling-area.jpg';

const AcademyPage = () => {
  const { ref, isVisible } = useScrollReveal();

  return (
    <div className="min-h-screen">
      <SalonNavbar />

      {/* Premium Hero */}
      <section className="relative pt-40 pb-20 md:pt-56 md:pb-28 bg-charcoal overflow-hidden min-h-[60vh] flex items-center">
        <div className="absolute inset-0">
          <img src={salonStyling} alt="Alanís Academy" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal/60 via-charcoal/40 to-charcoal" />
        </div>
        <div className="relative z-10 container mx-auto px-6 text-center">
          <span className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 text-accent rounded-full px-5 py-2 mb-8 font-body text-xs uppercase tracking-[0.2em]">
            <GraduationCap className="w-3.5 h-3.5" />
            Professional Education
          </span>
          <h1 className="font-display text-5xl md:text-7xl font-light text-primary-foreground mb-6 tracking-tight">
            Alanís Academy
          </h1>
          <p className="font-body text-lg md:text-xl text-primary-foreground/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            Master the art of hair with 20+ years of expertise. On-demand courses, live workshops, and hands-on education from certified professionals.
          </p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-12">
            {[
              { icon: Play, label: 'On-Demand Courses' },
              { icon: Users, label: 'Live Workshops' },
              { icon: Award, label: 'Certification' },
            ].map(b => (
              <div key={b.label} className="flex items-center gap-2.5 text-primary-foreground/50">
                <b.icon className="w-4 h-4 text-accent" />
                <span className="font-body text-sm">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <div className="bg-accent/5 border-b border-accent/10 py-6" ref={ref}>
        <div className={`container mx-auto px-6 ${isVisible ? 'animate-reveal-up' : 'opacity-0'}`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-center">
            {[
              { value: '3+', label: 'Expert Courses' },
              { value: '13+', label: 'Hours of Content' },
              { value: '25+', label: 'Years Experience' },
              { value: '500+', label: 'Stylists Trained' },
            ].map(s => (
              <div key={s.label}>
                <p className="font-display text-3xl font-medium text-foreground">{s.value}</p>
                <p className="font-body text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AcademySection />

      {/* CTA Section */}
      <section className="py-16 bg-charcoal">
        <div className="container mx-auto px-6 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-light text-primary-foreground mb-4">
            Ready to elevate your career?
          </h2>
          <p className="font-body text-primary-foreground/60 mb-8 max-w-lg mx-auto">
            Join our waitlist to get early access and exclusive launch pricing on all courses.
          </p>
          <a href="#waitlist">
            <Button variant="default" size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              Join the Waitlist
              <ArrowRight className="w-4 h-4" />
            </Button>
          </a>
        </div>
      </section>

      <SalonFooter />
    </div>
  );
};

export default AcademyPage;
