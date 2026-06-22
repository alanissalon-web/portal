import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { LocalDB } from '@/services/LocalDatabase';
import { Button } from '@/components/ui/button';
import { Lock, ArrowRight, AlertCircle, Shield, GraduationCap, Eye, EyeOff } from 'lucide-react';
import logo from '@/assets/logo-alanis.png';

type Tab = 'admin' | 'client';

const AdminLogin = () => {
  const [activeTab, setActiveTab] = useState<Tab>('admin');

  // Admin fields
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);

  // Client fields
  const [clientEmail, setClientEmail] = useState('');
  const [clientPassword, setClientPassword] = useState('');
  const [clientError, setClientError] = useState('');
  const [clientLoading, setClientLoading] = useState(false);
  const [clientMode, setClientMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);

  const { signIn } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Auto-open client tab when URL hash is #client
  useEffect(() => {
    if (location.hash === '#client') {
      setActiveTab('client');
    }
  }, [location.hash]);

  // --- Admin login ---
  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    setAdminLoading(true);
    const result = await signIn(adminEmail, adminPassword);
    if (result.error) {
      setAdminError(result.error);
      setAdminLoading(false);
    } else {
      navigate('/admin');
    }
  };

  // --- Client login / register ---
  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError('');
    setClientLoading(true);

    try {
      if (clientMode === 'register') {
        const { supabase: sb } = await import('@/lib/supabase');
        const { error } = await sb.auth.signUp({
          email: clientEmail,
          password: clientPassword,
          options: {
            emailRedirectTo: `${window.location.origin}/portal`,
          },
        });
        if (error) {
          setClientError(error.message === 'User already registered'
            ? 'Este email ya tiene cuenta. Inicia sesión.'
            : error.message);
          setClientLoading(false);
          return;
        }
        // Show confirmation screen
        setClientMode('confirm');
        setClientLoading(false);
        return;
      } else {
        const { supabase: sb } = await import('@/lib/supabase');
        const { error } = await sb.auth.signInWithPassword({
          email: clientEmail,
          password: clientPassword,
        });
        if (error) {
          setClientError(error.message === 'Invalid login credentials'
            ? 'Email o contraseña incorrectos'
            : error.message === 'Email not confirmed'
            ? 'Debes confirmar tu correo antes de iniciar sesión. Revisa tu bandeja de entrada.'
            : error.message);
          setClientLoading(false);
          return;
        }
      }
      navigate('/portal');
    } catch (err: any) {
      setClientError(err?.message || 'Error inesperado');
      setClientLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center px-6">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <img src={logo} alt="Alanís Salon" className="h-24 md:h-32 mx-auto mb-6 object-contain" />
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-white/5 rounded-2xl p-1 mb-6 gap-1">
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-body text-sm font-medium transition-all duration-300 ${
              activeTab === 'admin'
                ? 'bg-white text-charcoal shadow-lg'
                : 'text-white/50 hover:text-white/80'
            }`}
          >
            <Shield className="w-4 h-4" />
            Admin
          </button>
          <button
            onClick={() => setActiveTab('client')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-body text-sm font-medium transition-all duration-300 ${
              activeTab === 'client'
                ? 'bg-accent text-white shadow-lg shadow-accent/30'
                : 'text-white/50 hover:text-white/80'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            Clientes
          </button>
        </div>

        {/* ── ADMIN PANEL ── */}
        {activeTab === 'admin' && (
          <form onSubmit={handleAdminSubmit} className="bg-card rounded-2xl p-8 shadow-xl space-y-5">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Lock className="w-3.5 h-3.5" />
              <span className="font-body text-xs uppercase tracking-widest">Acceso Administrativo</span>
            </div>
            {adminError && (
              <div className="flex items-center gap-2 bg-destructive/10 text-destructive rounded-xl px-4 py-3 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {adminError}
              </div>
            )}
            <div>
              <label className="font-body text-sm text-foreground block mb-1.5">Email</label>
              <input
                type="email"
                value={adminEmail}
                onChange={e => setAdminEmail(e.target.value)}
                required
                className="w-full bg-background border border-border rounded-xl px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                placeholder="admin@alanissalon.com"
              />
            </div>
            <div>
              <label className="font-body text-sm text-foreground block mb-1.5">Contraseña</label>
              <input
                type="password"
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
                required
                className="w-full bg-background border border-border rounded-xl px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" variant="default" size="lg" className="w-full" disabled={adminLoading}>
              {adminLoading ? 'Procesando...' : 'Ingresar al Panel'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        )}

        {/* ── CLIENT PORTAL ── */}
        {activeTab === 'client' && (
          <div className="bg-card rounded-2xl p-8 shadow-xl space-y-5">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <GraduationCap className="w-3.5 h-3.5" />
              <span className="font-body text-xs uppercase tracking-widest">
                {clientMode === 'login' ? 'Portal de Estudiantes' : 'Crear Cuenta'}
              </span>
            </div>

            {/* Mode tabs */}
            <div className="flex bg-muted rounded-xl p-1 gap-1">
              <button
                type="button"
                onClick={() => { setClientMode('login'); setClientError(''); }}
                className={`flex-1 py-2 rounded-lg font-body text-xs font-medium transition-all ${
                  clientMode === 'login' ? 'bg-white shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                onClick={() => { setClientMode('register'); setClientError(''); }}
                className={`flex-1 py-2 rounded-lg font-body text-xs font-medium transition-all ${
                  clientMode === 'register' ? 'bg-white shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Registrarse
              </button>
            </div>

            <form onSubmit={handleClientSubmit} className="space-y-4">
              {clientError && (
                <div className="flex items-center gap-2 bg-destructive/10 text-destructive rounded-xl px-4 py-3 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {clientError}
                </div>
              )}
              <div>
                <label className="font-body text-sm text-foreground block mb-1.5">Email</label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={e => setClientEmail(e.target.value)}
                  required
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                  placeholder="tu@email.com"
                />
              </div>
              <div>
                <label className="font-body text-sm text-foreground block mb-1.5">Contraseña</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={clientPassword}
                    onChange={e => setClientPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 pr-12 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {clientMode === 'register' && (
                  <p className="text-[10px] text-muted-foreground mt-1">Mínimo 6 caracteres</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-accent hover:bg-accent/90 h-12 rounded-xl font-bold text-sm gap-2"
                disabled={clientLoading}
              >
                {clientLoading
                  ? 'Procesando...'
                  : clientMode === 'login' ? 'Ingresar al Portal' : 'Crear mi Cuenta'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            <p className="text-center font-body text-xs text-muted-foreground pt-2 leading-relaxed">
              {clientMode === 'login'
                ? <>¿No tienes cuenta? <button type="button" onClick={() => setClientMode('register')} className="text-accent hover:underline font-semibold">Regístrate gratis</button></>
                : <>¿Ya tienes cuenta? <button type="button" onClick={() => setClientMode('login')} className="text-accent hover:underline font-semibold">Inicia sesión</button></>
              }
            </p>
          </div>
        )}

        <p className="text-center mt-6 font-body text-xs text-primary-foreground/30">
          Alanís Salon & Spa — {activeTab === 'admin' ? 'Admin Access Only' : 'Student Portal'}
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
