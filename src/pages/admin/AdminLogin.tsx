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
  const { signIn } = useAdminAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: signInError } = await signIn(email, password);
    if (signInError) {
      setError(signInError);
      setLoading(false);
    } else {
      navigate('/admin');
    }
  };

  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={logo} alt="Alanís Salon" className="h-16 mx-auto mb-6" />
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent rounded-full px-4 py-1.5 mb-4">
            <Lock className="w-3.5 h-3.5" />
            <span className="font-body text-xs font-medium">Admin Panel</span>
          </div>
          <h1 className="font-display text-3xl font-light text-primary-foreground">Welcome back</h1>
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
            {loading ? 'Signing in...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        <p className="text-center mt-6 font-body text-xs text-primary-foreground/40">
          Alanís Salon & Spa — Admin Access Only
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
