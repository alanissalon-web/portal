import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { X, Mail, Lock, User, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StudentAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export function StudentAuthModal({ isOpen, onClose, onSuccess }: StudentAuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        variant: 'destructive',
        title: 'Missing Fields',
        description: 'Please fill in all required fields.',
      });
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) throw error;

        toast({
          title: 'Registration Successful',
          description: 'Please check your email to verify your account or proceed to log in.',
        });
        
        // Auto sign-in if no email confirmation is required, otherwise switch to login
        if (data?.user) {
          onSuccess(data.user);
          onClose();
        } else {
          setIsSignUp(false);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: 'Welcome back!',
          description: 'You have signed in successfully.',
        });

        if (data?.user) {
          onSuccess(data.user);
          onClose();
        }
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: err.message || 'An error occurred during authentication.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden bg-card border border-border rounded-[2.5rem] shadow-2xl p-8 md:p-10 animate-scale-up">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-8">
          <h3 className="font-display text-2xl font-medium text-foreground">
            {isSignUp ? 'Create Student Account' : 'Student Sign In'}
          </h3>
          <p className="font-body text-xs text-muted-foreground mt-2">
            {isSignUp 
              ? 'Join Academy to track and save your course progress.' 
              : 'Sign in to access your purchased courses.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full Name"
                className="w-full bg-[#F8F8F8] border border-border rounded-xl pl-12 pr-4 py-3.5 font-body text-sm outline-none focus:ring-2 focus:ring-accent/40 transition-all"
                required
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="w-full bg-[#F8F8F8] border border-border rounded-xl pl-12 pr-4 py-3.5 font-body text-sm outline-none focus:ring-2 focus:ring-accent/40 transition-all"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-[#F8F8F8] border border-border rounded-xl pl-12 pr-4 py-3.5 font-body text-sm outline-none focus:ring-2 focus:ring-accent/40 transition-all"
              required
            />
          </div>

          <Button 
            type="submit" 
            variant="gold" 
            className="w-full h-12 rounded-xl text-sm font-bold shadow-lg shadow-accent/20 gap-2 mt-2"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isSignUp ? (
              'Create Account'
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="font-body text-xs text-muted-foreground">
            {isSignUp ? 'Already have an account?' : "Don't have an account yet?"}{' '}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-accent font-semibold hover:underline"
            >
              {isSignUp ? 'Sign In' : 'Register Now'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
