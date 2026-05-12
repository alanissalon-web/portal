import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Shield, RefreshCw, Clock, Scissors } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Instant Fullness',
    desc: 'Add density and volume in just one session with Micro Point technology.',
  },
  {
    icon: Shield,
    title: 'Zero Damage',
    desc: 'Hair fibers are 4x lighter than human hair — no stress or tension on natural hair.',
  },
  {
    icon: RefreshCw,
    title: 'Easy Maintenance',
    desc: 'Color, shampoo, brush, blow dry — treat it like your own hair with no limits.',
  },
  {
    icon: Clock,
    title: 'Long Lasting',
    desc: 'Results last 4 to 8 weeks with our convenient refill system.',
  },
  {
    icon: Scissors,
    title: 'Fully Customizable',
    desc: 'Personalized to match your natural texture and color, cut and styled just for you.',
  },
];

const beforeAfterImages = [
  {
    src: 'https://images.squarespace-cdn.com/content/v1/5b03616f9772ae0c5a7c199b/1693253971556-ZQYOEKPPRA2LFY3F8DOI/Combline+before+and+after.JPG',
    alt: 'CombLine before and after',
  },
  {
    src: 'https://images.squarespace-cdn.com/content/v1/5b03616f9772ae0c5a7c199b/1693254162719-82J4U9AS87S2VCP0RA2U/9BB617E7-1007-4FF5-852D-129724CB7A8F.JPG',
    alt: 'Hair loss solution results',
  },
  {
    src: 'https://images.squarespace-cdn.com/content/v1/5b03616f9772ae0c5a7c199b/1733438328220-76M8POLR3J1YOU7GVSYH/A24EE515-AB14-4E00-A7C8-2E94ABEA3771.JPG',
    alt: 'CombLine application close-up',
  },
  {
    src: 'https://images.squarespace-cdn.com/content/v1/5b03616f9772ae0c5a7c199b/1693254260523-RBIFL5DXUVP09SCBF9KJ/45936B7B-3623-4CA6-8A07-F17BF32C0197.JPG',
    alt: 'CombLine hair-to-hair bonding',
  },
];

const processSteps = [
  'Your stylist examines your hair color to determine the best blend of shades.',
  'In thinning areas, host hairs are carefully identified and sectioned.',
  'Using an application wand, strands are knotted onto the base of each host hair at the root.',
  'Hair separates into multiple strands when shampooed for an immediate increase in density.',
  'Your stylist finishes with a professional cut and style for a flawless, fuller look.',
];

export function HairLossSection() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section className="py-24 md:py-32 bg-cream" ref={ref}>
      <div className="container mx-auto px-6">
        {/* Main content */}
        <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto mb-20">
          {/* Left — content */}
          <div className={`${isVisible ? 'animate-reveal-left' : 'opacity-0'}`}>
            <span className="font-body text-xs uppercase tracking-[0.2em] text-accent font-medium">
              Hair Loss Solutions
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-light text-foreground mt-3 mb-6 text-balance" style={{ lineHeight: '1.15' }}>
              CombLine & Micro Point Technology
            </h2>
            <p className="font-body text-muted-foreground leading-relaxed mb-4 text-pretty">
              As pioneers in hair-to-hair technology, we've developed CombLine — a method that seamlessly bonds extensions even to the thinnest areas, including delicate sections like bangs, sides, and the nape.
            </p>
            <p className="font-body text-muted-foreground leading-relaxed mb-8 text-pretty">
              If you want thicker hair instantly, Micro Point adds strands to your existing hair at the root, making it virtually undetectable. This breakthrough technology has the same characteristics of human hair but is four times lighter — no stress or tension on natural hair.
            </p>

            <div className="space-y-4 mb-10">
              {features.map((f) => (
                <div key={f.title} className="flex items-start gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <f.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-display text-lg font-medium text-foreground">{f.title}</p>
                    <p className="font-body text-sm text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <a href="#reservar">
              <Button variant="default" size="lg">
                Book Free Consultation
                <ArrowRight className="w-4 h-4" />
              </Button>
            </a>
          </div>

          {/* Right — before/after images grid */}
          <div className={`${isVisible ? 'animate-reveal-right delay-200' : 'opacity-0'}`}>
            <div className="grid grid-cols-2 gap-3">
              {beforeAfterImages.map((img, i) => (
                <div key={i} className="rounded-xl overflow-hidden shadow-lg shadow-foreground/10 group">
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
            <p className="font-body text-xs text-muted-foreground text-center mt-4 italic">
              Before & After — CombLine & Micro Point Solutions
            </p>
          </div>
        </div>

        {/* Process steps */}
        <div className={`max-w-4xl mx-auto ${isVisible ? 'animate-reveal-up delay-300' : 'opacity-0'}`}>
          <h3 className="font-display text-2xl md:text-3xl font-light text-foreground text-center mb-10">
            How Micro Point Works
          </h3>
          <div className="grid md:grid-cols-5 gap-4">
            {processSteps.map((step, i) => (
              <div key={i} className="text-center group">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-display text-lg font-medium flex items-center justify-center mx-auto mb-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  {i + 1}
                </div>
                <p className="font-body text-xs text-muted-foreground leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
