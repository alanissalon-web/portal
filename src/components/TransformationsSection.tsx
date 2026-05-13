import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Star, Quote, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { ImageComparison } from './ImageComparison';

// Placeholder images - in a real app these would be assets or from a CMS
const beforeImage = 'https://images.squarespace-cdn.com/content/v1/5b03616f9772ae0c5a7c199b/1712180689466-9VVMGVOL2BPRG27WO807/IMG_9818.jpeg';
const afterImage = 'https://images.squarespace-cdn.com/content/v1/5b03616f9772ae0c5a7c199b/1712180690771-BXHMIWYFPRD742GDAA6Y/IMG_7132.jpeg';

const testimonials = [
  {
    name: 'Carolina M.',
    text: 'My hair has never looked this good. The experience was incredible from diagnosis to final result. Rosie truly understands hair.',
    rating: 5,
  },
  {
    name: 'Valentina R.',
    text: 'I finally found a salon that understood exactly what I wanted. Professionalism and luxury attention from start to finish.',
    rating: 5,
  },
  {
    name: 'Mariana T.',
    text: 'The hair spa experience is something everyone deserves. I left feeling renewed and my hair looked spectacular. Highly recommend!',
    rating: 5,
  },
];

export function TransformationsSection() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section id="transformations" className="py-24 md:py-32 bg-background overflow-hidden" ref={ref}>
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className={`text-center max-w-2xl mx-auto mb-16 ${isVisible ? 'animate-reveal-up' : 'opacity-0'}`}>
          <span className="inline-flex items-center gap-2 font-body text-xs uppercase tracking-[0.2em] text-accent font-medium mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <EditableText section="transformations" field="badge" defaultText="Real Results" as="span" />
          </span>
          <h2 className="font-display text-4xl md:text-6xl font-light text-foreground mt-3 text-balance" style={{ lineHeight: '1.1' }}>
            <EditableText section="transformations" field="title" defaultText="Transformations that speak for themselves" />
          </h2>
          <div className="luxury-divider mx-auto mt-8" />
        </div>

        {/* Featured Transformation Slider */}
        <div className={`max-w-4xl mx-auto mb-24 transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
          <div className="relative group">
            <div className="absolute -inset-4 bg-accent/5 rounded-[2.5rem] blur-2xl group-hover:bg-accent/10 transition-colors duration-500" />
            <ImageComparison 
              beforeImage={beforeImage}
              afterImage={afterImage}
              section="transformations"
            />
          </div>
          <p className="text-center mt-8 font-body text-sm text-muted-foreground italic">
            <EditableText section="transformations" field="slider_hint" defaultText="Slide to see the magic of our Premium Extensions" as="span" />
          </p>
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-card rounded-3xl p-10 shadow-sm border border-border/50 hover:border-accent/30 hover:shadow-xl hover:shadow-accent/5 transition-all duration-500 group"
            >
              <div className="bg-accent/5 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-accent/10 transition-colors">
                <Quote className="w-6 h-6 text-accent" />
              </div>
              <p className="font-body text-foreground/80 text-lg leading-relaxed mb-8 italic">
                "<EditableText section="transformations" field={`testimonial_${i}_text`} defaultText={t.text} as="span" />"
              </p>
              <div className="flex items-center justify-between pt-6 border-t border-border/50">
                <div>
                  <p className="font-display text-xl font-medium text-foreground">
                    <EditableText section="transformations" field={`testimonial_${i}_name`} defaultText={t.name} as="span" />
                  </p>
                  <p className="font-body text-xs text-muted-foreground uppercase tracking-widest mt-1">Verified Client</p>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-accent text-accent" />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
