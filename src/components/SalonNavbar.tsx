import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Phone, ShoppingBag, PhoneCall, Fingerprint, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '@/assets/logo-alanis.png';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useCMS } from '@/contexts/CMSContext';
import { Layout, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const DEFAULT_NAV_LINKS = [
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Extensions', href: '/extensions' },
  { label: 'Hair Loss', href: '/hair-loss' },
  { label: 'Academy', href: '/academy' },
  { label: 'Blog', href: '/blog' },
  { label: 'Shop', href: '/shop' },
  { label: 'Contact', href: '/contact' },
];

export function SalonNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const dropdownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const location = useLocation();
  const isHome = location.pathname === '/';
  const { isAdmin } = useAdminAuth();
  const { setIsEditing, content } = useCMS();
  const [loggedUser, setLoggedUser] = useState<any>(null);

  // ── Read nav links from CMS, fall back to defaults ──────────────────────────
  const navLinks: any[] = content['navigation']?.links?.length
    ? content['navigation'].links
    : DEFAULT_NAV_LINKS;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setLoggedUser(session?.user ? { ...session.user } : null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedUser(session?.user ? { ...session.user } : null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setOpenDropdown(null);
    setMobileOpen(false);
  }, [location.pathname]);

  const textColor = scrolled || !isHome ? 'text-charcoal' : 'text-primary-foreground';

  const handleDropdownEnter = (label: string) => {
    if (dropdownTimerRef.current) clearTimeout(dropdownTimerRef.current);
    setOpenDropdown(label);
  };

  const handleDropdownLeave = () => {
    dropdownTimerRef.current = setTimeout(() => setOpenDropdown(null), 150);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${scrolled || !isHome
            ? 'bg-white/80 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.03)] border-b border-black/5 py-3'
            : 'bg-transparent py-6'
          }`}
      >
        <div className="container mx-auto flex items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2 group">
            <motion.img
              src={logo}
              alt="Alanís Salon & Spa"
              className={`w-auto object-contain transition-all duration-500 ${scrolled ? 'h-20' : 'h-24 md:h-32'}`}
              whileHover={{ scale: 1.02 }}
            />
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link: any) => {
              const hasSubmenu = link.submenu && link.submenu.length > 0;
              const isActive = location.pathname === link.href ||
                (hasSubmenu && link.submenu.some((s: any) => location.pathname === s.href));

              if (hasSubmenu) {
                return (
                  <div
                    key={link.href}
                    className="relative"
                    onMouseEnter={() => handleDropdownEnter(link.label)}
                    onMouseLeave={handleDropdownLeave}
                  >
                    <button
                      className={`flex items-center gap-1 font-body text-xs uppercase tracking-[0.2em] transition-colors duration-300 hover:text-accent ${textColor} ${isActive ? 'text-accent font-medium' : ''}`}
                    >
                      {link.label}
                      <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${openDropdown === link.label ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {openDropdown === link.label && (
                        <motion.div
                          initial={{ opacity: 0, y: 6, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.97 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full left-1/2 -translate-x-1/2 mt-3 min-w-[180px] bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-black/5 py-2 overflow-hidden"
                          onMouseEnter={() => handleDropdownEnter(link.label)}
                          onMouseLeave={handleDropdownLeave}
                        >
                          {link.submenu.map((sub: any) => (
                            <Link
                              key={sub.href}
                              to={sub.href}
                              className={`block px-5 py-2.5 font-body text-xs uppercase tracking-widest transition-colors hover:bg-accent/5 hover:text-accent ${location.pathname === sub.href ? 'text-accent font-medium' : 'text-charcoal'}`}
                            >
                              {sub.label}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }

              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`relative font-body text-xs uppercase tracking-[0.2em] transition-colors duration-300 hover:text-accent ${textColor} ${isActive ? 'text-accent font-medium' : ''}`}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="navUnderline"
                      className="absolute -bottom-1 left-0 right-0 h-px bg-accent"
                    />
                  )}
                </Link>
              );
            })}

            <div className="flex items-center gap-4 ml-4">
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full gap-2 border-accent text-accent hover:bg-accent hover:text-white"
                  onClick={() => setIsEditing(true)}
                >
                  <Layout className="w-3.5 h-3.5" />
                  CMS
                </Button>
              )}

              <Link to="/shop" className={`${textColor} hover:text-accent transition-colors`}>
                <ShoppingBag className="w-5 h-5" />
              </Link>
              <a href="tel:7135242610">
                <Button
                  variant={scrolled || !isHome ? 'default' : 'hero'}
                  size="sm"
                  className="rounded-full px-6"
                >
                  <Phone className="w-3.5 h-3.5 mr-2" />
                  713-524-2610
                </Button>
              </a>
              {loggedUser ? (
                <Link
                  to={isAdmin ? "/admin" : "/portal"}
                  className="flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-full bg-accent hover:bg-accent/90 transition-all shadow-md hover:shadow-lg border-2 border-accent"
                  title={isAdmin ? "Admin Panel" : "Client Portal"}
                >
                  <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center bg-white/20">
                    {loggedUser.user_metadata?.avatar_url ? (
                      <img src={loggedUser.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span className="font-body text-xs font-bold text-white max-w-[100px] truncate">
                    {loggedUser.user_metadata?.full_name || loggedUser.email?.split('@')?.[0] || 'My Account'}
                  </span>
                </Link>
              ) : (
                <Link to="/admin/login#client" className="flex items-center justify-center w-10 h-10 rounded-full bg-accent hover:bg-accent/90 transition-all shadow-md hover:shadow-lg" title="Login">
                  <Fingerprint className="w-5 h-5 text-white" />
                </Link>
              )}
            </div>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`lg:hidden p-2 rounded-full transition-colors ${scrolled || !isHome ? 'bg-charcoal/5' : 'bg-white/10'} ${textColor}`}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-white lg:hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-black/5">
              <img src={logo} alt="Alanís Salon & Spa" className="h-20 w-auto object-contain" />
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 bg-charcoal/5 rounded-full text-charcoal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-8 flex flex-col gap-2">
              {navLinks.map((link: any, i: number) => {
                const hasSubmenu = link.submenu && link.submenu.length > 0;
                const isExpanded = mobileExpanded === link.label;
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    {hasSubmenu ? (
                      <div>
                        <button
                          onClick={() => setMobileExpanded(isExpanded ? null : link.label)}
                          className="flex items-center justify-between w-full py-3 font-display text-2xl font-light text-charcoal hover:text-accent transition-colors"
                        >
                          {link.label}
                          <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden pl-4 border-l-2 border-accent/20 mb-2"
                            >
                              {link.submenu.map((sub: any) => (
                                <Link
                                  key={sub.href}
                                  to={sub.href}
                                  onClick={() => setMobileOpen(false)}
                                  className="block py-2 font-body text-base text-charcoal/70 hover:text-accent transition-colors"
                                >
                                  {sub.label}
                                </Link>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <Link
                        to={link.href}
                        onClick={() => setMobileOpen(false)}
                        className="block py-3 font-display text-2xl font-light text-charcoal hover:text-accent transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </motion.div>
                );
              })}
            </div>

            <div className="p-6 border-t border-black/5 space-y-4">
              <a href="tel:17135242610" className="block">
                <Button variant="gold" className="w-full gap-2 h-14 text-base font-bold shadow-lg shadow-accent/20">
                  <PhoneCall className="w-5 h-5" /> Call Now
                </Button>
              </a>
              <p className="text-center font-body text-xs text-muted-foreground tracking-widest uppercase py-2">
                Houston's Premiere Salon
              </p>
              <div className="flex justify-center pt-2">
                {loggedUser ? (
                  <Link to={isAdmin ? "/admin" : "/portal"} onClick={() => setMobileOpen(false)} className="flex items-center gap-4 bg-accent/10 p-4 rounded-xl border border-accent/20">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-accent flex items-center justify-center">
                      {loggedUser.user_metadata?.avatar_url ? (
                        <img src={loggedUser.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="font-display text-xl text-charcoal">{loggedUser.user_metadata?.full_name || loggedUser.email}</p>
                      <p className="font-body text-xs text-charcoal/60">{isAdmin ? "Admin Panel" : "Client Portal"}</p>
                    </div>
                  </Link>
                ) : (
                  <Link to="/admin/login#client" onClick={() => setMobileOpen(false)} className="flex items-center justify-center w-12 h-12 rounded-full bg-accent hover:bg-accent/90 transition-all shadow-md">
                    <Fingerprint className="w-6 h-6 text-white" />
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}


