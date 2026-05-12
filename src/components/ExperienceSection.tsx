import { useScrollReveal } from '@/hooks/useScrollReveal';
import experienceDiag from '@/assets/salon-color-bar-real.jpg';
import experienceTreat from '@/assets/salon-styling-area.jpg';
import experienceResult from '@/assets/salon-ambience-real.jpg';

const steps = [
  {
    number: '01',
    title: 'Diagnosis',
    description: 'We analyze your hair, listen to your desires, and design a personalized plan tailored just for you.',
    image: experienceDiag,
  },
  {
    number: '02',
    title: 'Premium Experience',
    description: 'Every detail — from the salon ambiance to the personalized attention — elevates your visit into a sensory experience.',
    image: experienceTreat,
  },
  {
    number: '03',
    title: 'Result',
    description: 'Transformed, radiant, and healthy hair within a luxury experience you feel from the moment you walk in.',
    image: experienceResult,
  },
];

export function ExperienceSection() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section id="experience" className="py-24 md:py-32 bg-cream" ref={ref}>
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className={`text-center max-w-2xl mx-auto mb-20 ${isVisible ? 'animate-reveal-up' : 'opacity-0'}`}>
          <span className="font-body text-xs uppercase tracking-[0.2em] text-accent font-medium">
            Your Experience
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-light text-foreground mt-3 text-balance" style={{ lineHeight: '1.15' }}>
            More than a service, a ritual
          </h2>
          <div className="luxury-divider mx-auto mt-6" />
        </div>

        {/* Steps */}
        <div className="space-y-16 md:space-y-0 md:grid md:grid-cols-3 md:gap-12 max-w-5xl mx-auto">
          {steps.map((step, i) => (
            <div
              key={step.number}
              className={`text-center ${isVisible ? 'animate-reveal-up' : 'opacity-0'}`}
              style={{ animationDelay: `${(i + 1) * 150}ms` }}
            >
              <div className="relative w-48 h-48 mx-auto mb-8 rounded-full overflow-hidden shadow-lg shadow-foreground/5">
                <img
                  src={step.image}
                  alt={step.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 rounded-full ring-2 ring-inset ring-accent/20" />
              </div>
              <span className="font-display text-3xl text-accent/50 font-light">{step.number}</span>
              <h3 className="font-display text-2xl font-medium text-foreground mt-2 mb-3">{step.title}</h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto text-pretty">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
