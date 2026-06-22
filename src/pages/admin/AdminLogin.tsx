import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { Lock, ArrowRight, AlertCircle } from 'lucide-react';
import logo from '@/assets/logo-alanis.png';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { signIn, signUp } = useAdminAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    let result;
    if (isSignUp) {
      result = await signUp(email, password);
    } else {
      result = await signIn(email, password);
    }

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      // If it's sign up, Supabase might require email verification depending on settings, 
      // but usually it signs you in if email confirm is disabled. 
      // If the login inside signUp succeeds, it will have isAdmin set (or not, but LocalDB assumes admin).
      navigate('/admin');
    }
  };

  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={logo} alt="Alanís Salon" className="h-24 md:h-32 mx-auto mb-6 object-contain" />
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent rounded-full px-4 py-1.5 mb-4">
            <Lock className="w-3.5 h-3.5" />
            <span className="font-body text-xs font-medium">Admin Panel</span>
          </div>
          <h1 className="font-display text-3xl font-light text-primary-foreground">
            {isSignUp ? 'Create Admin User' : 'Welcome back'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-8 shadow-xl space-y-5">
          {error && (
            <div className="flex items-center gap-2 bg-destructive/10 text-destructive rounded-xl px-4 py-3 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}
          <div>
            <label className="font-body text-sm text-foreground block mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full bg-background border border-border rounded-xl px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              placeholder="admin@alanissalon.com"
            />
          </div>
          <div>
            <label className="font-body text-sm text-foreground block mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full bg-background border border-border rounded-xl px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" variant="default" size="lg" className="w-full" disabled={loading}>
            {loading ? 'Procesando...' : (isSignUp ? 'Sign Up' : 'Sign In')}
            <ArrowRight className="w-4 h-4" />
          </Button>

          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-accent text-sm font-body hover:underline"
            >
              {isSignUp ? 'Already have an account? Sign In' : 'Create new admin user'}
            </button>
          </div>
        </form>

        <p className="text-center mt-6 font-body text-xs text-primary-foreground/40">
          Alanís Salon & Spa — Admin Access Only
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
