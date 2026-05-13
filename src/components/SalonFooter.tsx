import { Instagram, Facebook, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '@/assets/logo-alanis.png';

export function SalonFooter() {
  return (
    <footer className="bg-charcoal py-16">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <img src={logo} alt="Alanís Salon & Spa" className="h-24 mb-6 brightness-0 invert" />
            <p className="font-body text-sm text-primary-foreground/50 leading-relaxed max-w-xs">
              Houston's premiere hair extension salon. 25+ years of artistry, innovation, and personalized care.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg text-primary-foreground/90 mb-4">Quick Links</h4>
            <div className="space-y-2">
              {[
                { label: 'About Us', href: '/about' },
                { label: 'Services', href: '/services' },
                { label: 'Extensions', href: '/extensions' },
                { label: 'Hair Loss Solutions', href: '/hair-loss' },
                { label: 'Contact', href: '/contact' },
              ].map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="block font-body text-sm text-primary-foreground/50 hover:text-accent transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg text-primary-foreground/90 mb-4">Contact</h4>
            <div className="space-y-3">
              <a href="tel:7135242610" className="flex items-center gap-2 font-body text-sm text-primary-foreground/50 hover:text-accent transition-colors">
                <Phone className="w-4 h-4" />
                713-524-2610
              </a>
              <div className="flex items-center gap-2 font-body text-sm text-primary-foreground/50">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                Houston, TX — Near Downtown, Montrose & River Oaks
              </div>
              <div className="flex gap-3 pt-2">
                <a
                  href="https://www.instagram.com/alanissalon"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-accent/30 transition-colors"
                >
                  <Instagram className="w-4 h-4 text-primary-foreground/70" />
                </a>
                <a
                  href="https://www.facebook.com/alanissalondayspa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-accent/30 transition-colors"
                >
                  <Facebook className="w-4 h-4 text-primary-foreground/70" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 pt-8 text-center">
          <p className="font-body text-xs text-primary-foreground/30">
            © {new Date().getFullYear()} Alanís Salon & Spa. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
