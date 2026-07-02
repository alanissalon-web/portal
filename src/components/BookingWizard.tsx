import { useState, useEffect } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Check, Sparkles, MessageSquare, PhoneCall, Loader2 } from 'lucide-react';
import { EditableText } from './cms/EditableText';
import { LocalDB } from '@/services/LocalDatabase';

type StepConfig = {
  id: string;
  title: string;
  subtitle: string;
  options: string[];
  multiSelect: boolean;
};

type OutcomeRule = {
  id: string;
  triggerStepId: string;
  triggerOption: string;
  resultTitle: string;
  resultDescription: string;
};

type FormConfig = {
  steps: StepConfig[];
  rules: OutcomeRule[];
  fallbackResult: { title: string; description: string };
};

export function BookingWizard() {
  const { ref, isVisible } = useScrollReveal();
  const [config, setConfig] = useState<FormConfig | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string[]>>({});
  const [contactInfo, setContactInfo] = useState({ name: '', phone: '', email: '' });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const data = await LocalDB.getContent('booking_wizard');
        if (data && data.steps && data.steps.length > 0) {
          setConfig({
            steps: data.steps,
            rules: data.rules || [],
            fallbackResult: data.fallbackResult || {
              title: 'Personalized Service + Diagnosis',
              description: "Based on your answers, we'll design a personalized plan during your visit with a complimentary diagnosis."
            }
          });
        } else {
          setConfig({
            steps: [
              { id: 's1', title: 'What are you looking for?', subtitle: "Select the service you're interested in", options: ['Cut & Style', 'Color', 'Treatment'], multiSelect: false }
            ],
            rules: [],
            fallbackResult: {
              title: 'Personalized Service + Diagnosis',
              description: "Based on your answers, we'll design a personalized plan during your visit with a complimentary diagnosis."
            }
          });
        }
      } catch (err) {
        console.error("Failed to load booking wizard config:", err);
      }
    };
    loadConfig();
  }, []);

  const getRecommendation = () => {
    if (!config) return { title: '', description: '' };
    
    const matchedTitles: string[] = [];
    const matchedDescriptions: string[] = [];
    
    for (const rule of config.rules) {
      const stepIndex = config.steps.findIndex(s => s.id === rule.triggerStepId);
      if (stepIndex !== -1 && answers[stepIndex]) {
        if (answers[stepIndex].includes(rule.triggerOption)) {
          matchedTitles.push(rule.resultTitle);
          matchedDescriptions.push(rule.resultDescription);
        }
      }
    }
    
    if (matchedTitles.length > 0) {
      const uniqueTitles = Array.from(new Set(matchedTitles));
      const uniqueDescriptions = Array.from(new Set(matchedDescriptions));
      return {
        title: uniqueTitles.join(' + '),
        description: uniqueDescriptions.join(' ')
      };
    }
    
    return config.fallbackResult;
  };

  const steps = config?.steps || [];
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
        [currentStep]: current.includes(option) ? current.filter((o) => o !== option) : [...current, option],
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

  const recommendation = getRecommendation();

  const next = async () => {
    if (isContactStep) {
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

  const smsMessage = encodeURIComponent(
    `Hi! I'm ${contactInfo.name}. I'd like to book: ${recommendation.title}.`
  );

  return (
    <section id="booking" className="py-24 md:py-32 bg-background" ref={ref}>
      {!config ? (
        <div className="flex h-64 justify-center items-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : (
        <div className="container mx-auto px-6">
          <div className={`text-center max-w-2xl mx-auto mb-12 ${isVisible ? 'animate-reveal-up' : 'opacity-0'}`}>
            <span className="font-body text-xs uppercase tracking-[0.2em] text-accent font-medium">
              <EditableText section="booking" field="badge" defaultText="Book Your Visit" as="span" />
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-light text-foreground mt-3 text-balance" style={{ lineHeight: '1.15' }}>
              <EditableText section="booking" field="title" defaultText="Your transformation starts here" as="span" />
            </h2>
            <div className="luxury-divider mx-auto mt-6" />
          </div>

          <div className={`max-w-xl mx-auto ${isVisible ? 'animate-reveal-up delay-200' : 'opacity-0'}`}>
            <div className="flex gap-2 mb-10">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= currentStep ? 'bg-primary' : 'bg-border'}`} />
              ))}
            </div>

            <div className="bg-card rounded-3xl p-8 md:p-10 shadow-lg shadow-foreground/5 min-h-[360px] flex flex-col">
              {isOptionStep && (
                <div className="flex-1 animate-reveal-up" key={currentStep}>
                  <div className="mb-8">
                    <h3 className="font-display text-2xl font-medium text-foreground mb-2">
                      {steps[currentStep].title}
                    </h3>
                    <p className="font-body text-sm text-muted-foreground">
                      {steps[currentStep].subtitle}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {steps[currentStep].options?.map((option) => {
                      const selected = answers[currentStep]?.includes(option);
                      return (
                        <button
                          key={option}
                          onClick={() => toggleOption(option)}
                          className={`rounded-xl px-5 py-4 font-body text-sm text-left transition-all duration-200 active:scale-[0.97] ${selected ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' : 'bg-secondary text-secondary-foreground hover:bg-secondary/70'}`}
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
                  <div className="mb-6 p-5 rounded-2xl bg-accent/5 border border-accent/10">
                    <p className="font-body text-[10px] text-accent uppercase tracking-[0.2em] mb-2 font-bold">Your Custom Plan</p>
                    <h4 className="font-display text-xl text-foreground mb-2 leading-tight">{recommendation.title}</h4>
                    <p className="font-body text-sm text-muted-foreground leading-relaxed">{recommendation.description}</p>
                  </div>
                  
                  <h3 className="font-display text-xl font-medium text-foreground mb-2">
                    Who is this for?
                  </h3>
                  <p className="font-body text-sm text-muted-foreground mb-6">
                    Enter your details to confirm your booking request.
                  </p>
                  <div className="space-y-3">
                    <input type="text" placeholder="Your name" value={contactInfo.name} onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })} className="w-full rounded-xl border border-border bg-background px-5 py-3.5 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow" />
                    <input type="tel" placeholder="Phone number (SMS)" value={contactInfo.phone} onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })} className="w-full rounded-xl border border-border bg-background px-5 py-3.5 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow" />
                    <input type="email" placeholder="Email (optional)" value={contactInfo.email} onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })} className="w-full rounded-xl border border-border bg-background px-5 py-3.5 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow" />
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
                        <MessageSquare className="w-5 h-5" /> Confirm via SMS
                      </Button>
                    </a>
                    <a href="tel:17135242610">
                      <Button variant="outline" size="xl" className="w-full gap-3 border-accent/20 text-accent hover:bg-accent/5">
                        <PhoneCall className="w-5 h-5" /> Call the Salon
                      </Button>
                    </a>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                {isResultStep ? (
                  <>
                    <button onClick={prev} className="flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-foreground transition-colors">
                      <ArrowLeft className="w-4 h-4" /> Go Back
                    </button>
                    <button onClick={() => { setCurrentStep(0); setAnswers({}); }} className="font-body text-sm text-accent hover:text-accent/80 transition-colors">
                      Start Over
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={prev} disabled={currentStep === 0} className="flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors">
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <Button onClick={next} disabled={!canAdvance()} size="default">
                      {isContactStep ? <><Check className="w-4 h-4" /> Complete Booking</> : <><ArrowRight className="w-4 h-4" /> Next</>}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
