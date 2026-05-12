import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Award, Calendar, Heart, Users, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import salonLoungeImage from '@/assets/salon-lounge-real.jpg';
import { EditableText } from './cms/EditableText';

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        const timer = setInterval(() => {
          current += step;
          if (current >= target) {
            setCount(target);
            clearInterval(timer);
          } else {
            setCount(Math.floor(current));
          }
        }, 16);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

const stats = [
  { icon: Calendar, value: 25, suffix: '+', label: 'Years Experience' },
  { icon: Users, value: 2400, suffix: '+', label: 'Happy Clients' },
  { icon: Award, value: 0, suffix: '', label: 'CombLine National Educator', displayValue: 'CombLine' },
  { icon: Heart, value: 0, suffix: '', label: 'Houston, TX', displayValue: 'Est. 2013' },
];

const team = [
  {
    name: 'Rosie Alanis',
    role: 'Creative Director & Owner',
    image: 'https://images.squarespace-cdn.com/content/v1/5b03616f9772ae0c5a7c199b/10bd6834-c996-4676-b5bc-02a2a8487bb3/IMG_9440.png',
    bio: 'CombLine National Educator with 25+ years in the beauty industry. Passionate about education, the art and science of hair care, extensions, hair replacement, and holistic hair health.',
  },
  {
    name: 'Vanessa R Williams',
    role: 'Senior Colorist & Educator',
    image: 'https://images.squarespace-cdn.com/content/v1/5b03616f9772ae0c5a7c199b/8e3ce211-a0d5-4362-a90b-abf85a042ff5/IMG_7863.png',
    bio: '20+ years of experience. Wella Certified Master Color Expert since 2016 and educator since 2017. Brand educator for Wella and Platinum Seamless Extensions. Great Lengths certified since 2004.',
  },
  {
    name: 'Crystal Saldana',
    role: 'Extensions & Color Specialist',
    image: 'https://images.squarespace-cdn.com/content/v1/5b03616f9772ae0c5a7c199b/8cd5f80e-1417-407d-a8fc-4dfdcff5d72a/872F0E63-74A9-4A65-BA64-EB130E7813D0.jpeg',
    bio: '6+ years at Alanis Salon specializing in color, cutting, and all things hair extensions — CombLine, K-tips, Mago, and Micropoint Links. "Knowledge is POWER."',
  },
];

export function AboutSection() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section id="about" className="py-24 md:py-32 bg-background overflow-hidden" ref={ref}>
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className={`mb-24 ${isVisible ? 'animate-reveal-up' : 'opacity-0'}`}>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="font-body text-xs uppercase tracking-[0.2em] text-accent font-medium inline-flex items-center gap-2 mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <EditableText section="about" field="badge" defaultText="About Us" as="span" />
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-light text-foreground mb-6">
              <EditableText section="about" field="title" defaultText="Our Legacy of Excellence" as="span" />
            </h2>
            <div className="luxury-divider mx-auto" />
          </div>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center max-w-6xl mx-auto">
            <div className="rounded-2xl overflow-hidden shadow-2xl shadow-foreground/10 group aspect-[4/3] lg:aspect-auto lg:h-[500px]">
              <img
                src={salonLoungeImage}
                alt="Luxury lounge area inside Alanís Salon"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
            </div>
            <div className="space-y-6">
              <div className="font-body text-muted-foreground leading-relaxed text-lg text-pretty">
                <EditableText 
                  section="about" 
                  field="para1" 
                  defaultText="Alanis Salon, established in 2013, is centrally located near Downtown, Montrose, and River Oaks in Houston. Before opening, founder Rosie Alanis spent over 20 years honing her skills, exploring innovative techniques, and understanding the profound impact of personal appearance on confidence and self-esteem." 
                />
              </div>
              <div className="font-body text-muted-foreground leading-relaxed text-lg text-pretty">
                <EditableText 
                  section="about" 
                  field="para2" 
                  defaultText="We specialize in hair extensions, hair replacement, and holistic hair health — providing solutions that not only enhance your appearance but also promote your hair's vitality. Our approach is tailored, focusing on individual needs to achieve results that are both transformative and sustainable." 
                />
              </div>
              <div className="font-body text-muted-foreground leading-relaxed text-lg text-pretty">
                <EditableText 
                  section="about" 
                  field="para3" 
                  defaultText="As an Educator, Rosie brings the latest advancements and techniques directly to the salon, ensuring our team is at the forefront of the industry." 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 mb-24 max-w-4xl mx-auto ${isVisible ? 'animate-reveal-up delay-300' : 'opacity-0'}`}>
          {stats.map((stat) => (
            <div key={stat.label} className="text-center p-6 rounded-2xl bg-cream hover:shadow-lg transition-all duration-500 hover:-translate-y-1">
              <stat.icon className="w-6 h-6 text-accent mx-auto mb-3" />
              <p className="font-display text-3xl font-medium text-foreground">
                {stat.displayValue ? stat.displayValue : <AnimatedCounter target={stat.value} suffix={stat.suffix} />}
              </p>
              <p className="font-body text-xs text-muted-foreground uppercase tracking-wider mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Team */}
        <div className={`text-center mb-12 ${isVisible ? 'animate-reveal-up delay-400' : 'opacity-0'}`}>
          <h3 className="font-display text-3xl font-light text-foreground">Meet Our Team</h3>
          <div className="luxury-divider mx-auto mt-4" />
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {team.map((member, i) => (
            <div
              key={member.name}
              className={`group text-center ${isVisible ? 'animate-reveal-up' : 'opacity-0'}`}
              style={{ animationDelay: `${500 + i * 150}ms` }}
            >
              <div className="relative w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden shadow-lg shadow-foreground/5 group-hover:shadow-xl transition-all duration-500">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 rounded-full ring-2 ring-inset ring-accent/20 group-hover:ring-accent/40 transition-all duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <h4 className="font-display text-xl font-medium text-foreground">{member.name}</h4>
              <p className="font-body text-xs uppercase tracking-wider text-accent mt-1 mb-3">{member.role}</p>
              <p className="font-body text-sm text-muted-foreground leading-relaxed text-pretty max-w-xs mx-auto">
                {member.bio}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
