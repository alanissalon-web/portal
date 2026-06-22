import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { GraduationCap, Heart, Star, BookOpen, ShoppingBag, Gift, ArrowRight, Sparkles } from 'lucide-react';

interface ClientRegisterCTAProps {
  variant?: 'academy' | 'shop';
}

export function ClientRegisterCTA({ variant = 'academy' }: ClientRegisterCTAProps) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setLoggedIn(!!session);
      setChecking(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setLoggedIn(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Don't show if already logged in or still checking
  if (checking || loggedIn) return null;

  const academyBenefits = [
    { icon: BookOpen,    text: 'Guarda tus cursos y accede desde cualquier dispositivo' },
    { icon: Star,        text: 'Acceso permanente a lecciones que compres' },
    { icon: GraduationCap, text: 'Historial de aprendizaje y progreso personal' },
  ];

  const shopBenefits = [
    { icon: Heart,       text: 'Lista de favoritos y productos guardados' },
    { icon: ShoppingBag, text: 'Historial de reservaciones y pedidos' },
    { icon: Gift,        text: 'Notificaciones de ofertas exclusivas para clientes' },
  ];

  const benefits = variant === 'academy' ? academyBenefits : shopBenefits;

  const title = variant === 'academy'
    ? '¿Quieres guardar tus cursos?'
    : '¿Quieres guardar tus favoritos?';

  const subtitle = variant === 'academy'
    ? 'Crea tu cuenta gratis y accede a todas tus masterclasses desde cualquier lugar, cuando quieras.'
    : 'Regístrate gratis para guardar productos favoritos, ver tus reservaciones y recibir ofertas exclusivas.';

  return (
    <section className="py-16 bg-gradient-to-br from-charcoal via-charcoal to-charcoal/90 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent/5 rounded-full blur-2xl pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10 items-center">

            {/* Left: Text */}
            <div>
              <div className="inline-flex items-center gap-2 bg-accent/15 border border-accent/30 text-accent rounded-full px-4 py-1.5 mb-5 font-body text-xs uppercase tracking-widest">
                <Sparkles className="w-3 h-3" />
                Área de Clientes — Gratis
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-light text-white mb-4 leading-tight">
                {title}
              </h2>
              <p className="font-body text-white/60 leading-relaxed mb-8 text-sm md:text-base">
                {subtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/admin/login#client">
                  <Button
                    className="bg-accent hover:bg-accent/90 text-white h-13 px-8 rounded-xl font-bold text-sm gap-2 shadow-xl shadow-accent/20 w-full sm:w-auto"
                  >
                    Crear mi cuenta gratis
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/admin/login#client">
                  <Button
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/5 h-13 px-6 rounded-xl text-sm w-full sm:w-auto"
                  >
                    Ya tengo cuenta — Ingresar
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right: Benefits */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 space-y-5">
              <p className="font-body text-xs text-white/40 uppercase tracking-widest mb-6">
                Beneficios de registrarte
              </p>
              {benefits.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-accent/15 border border-accent/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-accent" />
                  </div>
                  <p className="font-body text-sm text-white/80 leading-relaxed pt-1.5">{text}</p>
                </div>
              ))}
              <div className="pt-4 border-t border-white/10 flex items-center gap-2">
                <div className="flex -space-x-2">
                  {['E', 'M', 'A'].map(l => (
                    <div key={l} className="w-7 h-7 rounded-full bg-accent/30 border-2 border-charcoal flex items-center justify-center text-[10px] text-accent font-bold">
                      {l}
                    </div>
                  ))}
                </div>
                <p className="font-body text-xs text-white/40">+500 estudiantes ya registrados</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
