import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Button } from '@/components/ui/button';
import { Phone, MapPin, Clock, Instagram, Facebook, MessageCircle, Mail, ArrowRight, Send } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import salonAmbienceImage from '@/assets/salon-ambience-real.jpg';

export function ContactSection() {
  const { ref, isVisible } = useScrollReveal();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', service: '', message: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    toast({ title: 'Message sent!', description: "We'll get back to you within 24 hours." });
  };

  return (
    <section id="contact" className="py-24 md:py-32 bg-background" ref={ref}>
      <div className="container mx-auto px-6">
        <div className={`text-center max-w-2xl mx-auto mb-16 ${isVisible ? 'animate-reveal-up' : 'opacity-0'}`}>
          <span className="font-body text-xs uppercase tracking-[0.2em] text-accent font-medium">Get In Touch</span>
          <h2 className="font-display text-4xl md:text-5xl font-light text-foreground mt-3 text-balance" style={{ lineHeight: '1.15' }}>
            We'd love to hear from you
          </h2>
          <div className="luxury-divider mx-auto mt-6" />
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Left — Contact Info + Form */}
          <div className={`${isVisible ? 'animate-reveal-left delay-200' : 'opacity-0'}`}>
            {/* Contact details */}
            <div className="grid sm:grid-cols-2 gap-4 mb-10">
              <a href="tel:7135242610" className="flex items-start gap-4 bg-cream rounded-xl p-5 hover:shadow-md transition-all duration-300 group">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-display text-sm font-medium text-foreground">Phone</p>
                  <p className="font-body text-sm text-muted-foreground">(713) 524-2610</p>
                </div>
              </a>
              <a href="mailto:alanissalon@gmail.com" className="flex items-start gap-4 bg-cream rounded-xl p-5 hover:shadow-md transition-all duration-300 group">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-display text-sm font-medium text-foreground">Email</p>
                  <p className="font-body text-sm text-muted-foreground">alanissalon@gmail.com</p>
                </div>
              </a>
              <div className="flex items-start gap-4 bg-cream rounded-xl p-5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-display text-sm font-medium text-foreground">Location</p>
                  <p className="font-body text-sm text-muted-foreground">Houston, TX</p>
                  <p className="font-body text-xs text-muted-foreground">Near Downtown, Montrose & River Oaks</p>
                </div>
              </div>
              <div className="flex items-start gap-4 bg-cream rounded-xl p-5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-display text-sm font-medium text-foreground">Hours</p>
                  <p className="font-body text-xs text-muted-foreground">Mon–Fri: 10am – 7pm</p>
                  <p className="font-body text-xs text-muted-foreground">Sat: 9am – 5pm · Sun: Closed</p>
                </div>
              </div>
            </div>

            {/* Social */}
            <div className="flex gap-3 mb-10">
              <a href="https://www.instagram.com/alanissalon" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-cream flex items-center justify-center hover:bg-accent/10 transition-colors">
                <Instagram className="w-5 h-5 text-foreground/70" />
              </a>
              <a href="https://www.facebook.com/alanissalon" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-cream flex items-center justify-center hover:bg-accent/10 transition-colors">
                <Facebook className="w-5 h-5 text-foreground/70" />
              </a>
              <a href="https://wa.me/17135242610" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-cream flex items-center justify-center hover:bg-accent/10 transition-colors">
                <MessageCircle className="w-5 h-5 text-foreground/70" />
              </a>
            </div>

            {/* Contact Form */}
            <div className="bg-card rounded-2xl p-6 md:p-8 shadow-sm">
              <h3 className="font-display text-xl font-medium text-foreground mb-6">Send Us a Message</h3>
              {formSubmitted ? (
                <div className="text-center py-8">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Send className="w-6 h-6 text-primary" />
                  </div>
                  <p className="font-display text-lg text-foreground mb-1">Message sent!</p>
                  <p className="font-body text-sm text-muted-foreground">We'll respond within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <input
                      type="text" placeholder="Your Name" required
                      value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                    />
                    <input
                      type="email" placeholder="Email" required
                      value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <input
                      type="tel" placeholder="Phone (optional)"
                      value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                    />
                    <select
                      value={formData.service} onChange={e => setFormData(p => ({ ...p, service: e.target.value }))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                    >
                      <option value="">Service of Interest</option>
                      <option value="extensions">Hair Extensions</option>
                      <option value="color">Color & Highlights</option>
                      <option value="hairloss">Hair Loss Solutions</option>
                      <option value="cut">Cut & Style</option>
                      <option value="treatment">Treatments</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <textarea
                    placeholder="Your message..." rows={4} required
                    value={formData.message} onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
                  />
                  <Button type="submit" variant="default" size="lg" className="w-full">
                    Send Message
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* Right — Image + Map */}
          <div className={`${isVisible ? 'animate-reveal-right delay-300' : 'opacity-0'}`}>
            <div className="rounded-2xl overflow-hidden shadow-lg mb-6 relative aspect-[4/3] group">
              <img
                src={salonAmbienceImage}
                alt="Luxury interior at Alanís Salon in Houston"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/15 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="font-display text-2xl text-primary-foreground mb-2">A luxury salon experience in Houston</p>
                <p className="font-body text-sm text-primary-foreground/80">Near Downtown, Montrose & River Oaks · By appointment and phone consultation</p>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-lg mb-6 aspect-[4/3]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3464.2!2d-95.39!3d29.74!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sAlanis+Salon!5e0!3m2!1sen!2sus!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Alanis Salon location"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <a href="tel:7135242610" className="flex-1">
                <Button variant="default" size="lg" className="w-full">
                  <Phone className="w-4 h-4" />
                  Call Now
                </Button>
              </a>
              <a href="https://wa.me/17135242610" target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button variant="outline" size="lg" className="w-full">
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
