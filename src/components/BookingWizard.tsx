import { useState } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Check, Sparkles, MessageCircle, MessageSquare, PhoneCall } from 'lucide-react';

type StepConfig = {
  title: string;
  subtitle: string;
  options?: string[];
  multiSelect?: boolean;
};

const steps: StepConfig[] = [
  {
    title: 'What are you looking for?',
    subtitle: "Select the service you're interested in",
    options: ['Cut & Style', 'Color', 'Treatment', 'Hair Spa', 'Extensions', 'Other'],
  },
  {
    title: 'How is your hair currently?',
    subtitle: 'This helps us personalize your service',
    options: ['Damaged', 'Dry', 'Color-treated', 'Natural', 'Oily'],
  },
  {
    title: 'What results are you looking for?',
    subtitle: 'Tell us your goals',
    options: ['Shine', 'Hydration', 'New Look', 'Repair', 'Volume'],
    multiSelect: true,
  },
  {
    title: 'When would you like to visit?',
    subtitle: 'Select your availability',
    options: ['This week', 'Next few days', "I'm flexible"],
  },
];

function getRecommendation(answers: Record<number, string[]>) {
  const service = answers[0]?.[0] || '';
  const condition = answers[1]?.[0] || '';
  const goals = answers[2] || [];

  if (condition === 'Damaged' || goals.includes('Repair')) {
    return {
      title: 'Restorative Treatment + Cut',
      description: 'We recommend a deep repair treatment followed by a precision cut to restore your hair\'s vitality.',
    };
  }
  if (service === 'Color' || goals.includes('New Look')) {
    return {
      title: 'Premium Color + Hair Spa',
      description: 'A professional color service paired with a hair spa treatment to keep your hair healthy and vibrant.',
    };
  }
  if (goals.includes('Hydration') || condition === 'Dry') {
    return {
      title: 'Deep Hydration + Spa',
      description: 'An intensive hydration experience with scalp massage to restore softness and shine to your hair.',
    };
  }
  if (service === 'Extensions') {
    return {
      title: 'Extension Consultation',
      description: 'A personalized consultation to find the perfect extension method for your hair type and lifestyle.',
    };
  }
  return {
    title: `${service || 'Personalized Service'} + Diagnosis`,
    description: 'Based on your answers, we\'ll design a personalized plan during your visit with a complimentary diagnosis.',
  };
}

export function BookingWizard() {
  const { ref, isVisible } = useScrollReveal();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string[]>>({});
  const [contactInfo, setContactInfo] = useState({ name: '', phone: '', email: '' });
  const [submitted, setSubmitted] = useState(false);

  const totalSteps = steps.length + 2;
  const isOptionStep = currentStep < steps.length;
  const isContactStep = currentStep === steps.length;
  const isResultStep = currentStep === steps.length + 1;

  const toggleOption = (option: string) => {
    const step = steps[currentStep];
    const current = answers[currentStep] || [];
    if (step.multiSelect) {
      setAnswers({
        ...answers,
        [currentStep]: current.includes(option)
          ? current.filter((o) => o !== option)
          : [...current, option],
      });
    } else {
      setAnswers({ ...answers, [currentStep]: [option] });
    }
  };

  const canAdvance = () => {
    if (isOptionStep) return (answers[currentStep]?.length || 0) > 0;
    if (isContactStep) return contactInfo.name && contactInfo.phone;
    return true;
  };

  const next = async () => {
    if (isContactStep) {
      const { LocalDB } = await import('@/services/LocalDatabase');
      await LocalDB.saveBooking({
        id: `book-${Date.now()}`,
        name: contactInfo.name,
        phone: contactInfo.phone,
        email: contactInfo.email,
        service: recommendation.title,
        date: new Date().toISOString(),
        status: 'pending'
      });
      setSubmitted(true);
    }
    if (currentStep < totalSteps - 1) setCurrentStep(currentStep + 1);
  };

  const prev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const recommendation = getRecommendation(answers);

  const smsMessage = encodeURIComponent(
    `Hi! I'm ${contactInfo.name}. I'd like to book: ${recommendation.title}. ${recommendation.description}`
  );

  return (
    <section id="booking" className="py-24 md:py-32 bg-background" ref={ref}>
      <div className="container mx-auto px-6">
        <div className={`text-center max-w-2xl mx-auto mb-12 ${isVisible ? 'animate-reveal-up' : 'opacity-0'}`}>
          <span className="font-body text-xs uppercase tracking-[0.2em] text-accent font-medium">
            Book Your Visit
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-light text-foreground mt-3 text-balance" style={{ lineHeight: '1.15' }}>
            Your transformation starts here
          </h2>
          <div className="luxury-divider mx-auto mt-6" />
        </div>

        <div className={`max-w-xl mx-auto ${isVisible ? 'animate-reveal-up delay-200' : 'opacity-0'}`}>
          {/* Progress bar */}
          <div className="flex gap-2 mb-10">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                  i <= currentStep ? 'bg-primary' : 'bg-border'
                }`}
              />
            ))}
          </div>

          {/* Card */}
          <div className="bg-card rounded-3xl p-8 md:p-10 shadow-lg shadow-foreground/5 min-h-[360px] flex flex-col">
            {isOptionStep && (
              <div className="flex-1 animate-reveal-up" key={currentStep}>
                <h3 className="font-display text-2xl font-medium text-foreground mb-2">
                  {steps[currentStep].title}
                </h3>
                <p className="font-body text-sm text-muted-foreground mb-8">
                  {steps[currentStep].subtitle}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {steps[currentStep].options?.map((option) => {
                    const selected = answers[currentStep]?.includes(option);
                    return (
                      <button
                        key={option}
                        onClick={() => toggleOption(option)}
                        className={`rounded-xl px-5 py-4 font-body text-sm text-left transition-all duration-200 active:scale-[0.97] ${
                          selected
                            ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                            : 'bg-secondary text-secondary-foreground hover:bg-secondary/70'
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {isContactStep && (
              <div className="flex-1 animate-reveal-up" key="contact">
                <h3 className="font-display text-2xl font-medium text-foreground mb-2">
                  Your Information
                </h3>
                <p className="font-body text-sm text-muted-foreground mb-8">
                  To confirm your booking and send you recommendations
                </p>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Your name"
                    value={contactInfo.name}
                    onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-5 py-3.5 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
                  />
                  <input
                    type="tel"
                    placeholder="Phone number (SMS)"
                    value={contactInfo.phone}
                    onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-5 py-3.5 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
                  />
                  <input
                    type="email"
                    placeholder="Email (optional)"
                    value={contactInfo.email}
                    onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-5 py-3.5 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
                  />
                </div>
              </div>
            )}

            {isResultStep && (
              <div className="flex-1 text-center animate-reveal-scale" key="result">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-display text-2xl font-medium text-foreground mb-2">
                  Our Recommendation for You
                </h3>
                <p className="font-display text-xl text-accent italic mb-4">
                  {recommendation.title}
                </p>
                <p className="font-body text-sm text-muted-foreground leading-relaxed mb-8 text-pretty">
                  {recommendation.description}
                </p>
                <div className="flex flex-col gap-3 max-w-sm mx-auto">
                  <a href={`sms:17135242610?body=${smsMessage}`}>
                    <Button variant="gold" size="xl" className="w-full gap-3 shadow-lg shadow-accent/20">
                      <MessageSquare className="w-5 h-5" />
                      Confirmar vía SMS
                    </Button>
                  </a>
                  
                  <a href="tel:17135242610">
                    <Button variant="outline" size="xl" className="w-full gap-3 border-accent/20 text-accent hover:bg-accent/5">
                      <PhoneCall className="w-5 h-5" />
                      Llamar al Salón
                    </Button>
                  </a>
                </div>
              </div>
            )}

            {/* Navigation */}
            {!isResultStep && (
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                <button
                  onClick={prev}
                  disabled={currentStep === 0}
                  className="flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <Button onClick={next} disabled={!canAdvance()} size="default">
                  {isContactStep ? (
                    <>
                      See Recommendation
                      <Check className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
