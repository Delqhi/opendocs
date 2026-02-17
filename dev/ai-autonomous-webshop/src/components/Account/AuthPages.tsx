import { useState } from 'react';
import { useShopStore } from '../../store/shopStore';
import { ArrowLeft, Eye, EyeOff, ShieldCheck, Mail, User, Lock, CheckCircle } from 'lucide-react';

interface AuthProps {
  mode: 'login' | 'register' | 'forgot';
  onBack: () => void;
  onSuccess: () => void;
  onSwitchMode: (mode: 'login' | 'register' | 'forgot') => void;
}

export function AuthPages({ mode, onBack, onSuccess, onSwitchMode }: AuthProps) {
  const { loginUser, registerUser } = useShopStore();
  const [email, setEmail] = useState('user@test.com');
  const [password, setPassword] = useState('password');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleLogin = () => {
    const ok = loginUser(email, password);
    if (ok) {
      setError('');
      onSuccess();
      return;
    }
    setError('Invalid credentials. Use user@test.com / password.');
  };

  const handleRegister = () => {
    const ok = registerUser({ email, password, firstName, lastName });
    if (ok) {
      setError('');
      onSuccess();
      return;
    }
    setError('Please fill in all fields.');
  };

  const handleForgot = () => {
    if (!email) {
      setError('Enter your email to reset password.');
      return;
    }
    setError('');
    setSuccess(true);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md surface border border-subtle rounded-3xl p-6 sm:p-8">
        <button onClick={onBack} className="text-xs text-muted hover:text-foreground flex items-center gap-1 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to shop
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl border border-subtle surface flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {mode === 'login' ? 'Welcome back' : mode === 'register' ? 'Create account' : 'Reset password'}
            </h1>
            <p className="text-xs text-muted">
              {mode === 'login'
                ? 'Access your orders and saved products.'
                : mode === 'register'
                ? 'Track orders, save favorites, faster checkout.'
                : 'We will send a reset link to your email.'}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {mode === 'register' && (
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 rounded-xl surface border border-subtle px-3">
                <User className="w-4 h-4 text-muted" />
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  className="w-full bg-transparent py-3 text-sm text-foreground placeholder:text-muted focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2 rounded-xl surface border border-subtle px-3">
                <User className="w-4 h-4 text-muted" />
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  className="w-full bg-transparent py-3 text-sm text-foreground placeholder:text-muted focus:outline-none"
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 rounded-xl surface border border-subtle px-3">
            <Mail className="w-4 h-4 text-muted" />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="w-full bg-transparent py-3 text-sm text-foreground placeholder:text-muted focus:outline-none"
              type="email"
            />
          </div>

          {mode !== 'forgot' && (
            <div className="flex items-center gap-2 rounded-xl surface border border-subtle px-3">
              <Lock className="w-4 h-4 text-muted" />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-transparent py-3 text-sm text-foreground placeholder:text-muted focus:outline-none"
                type={showPassword ? 'text' : 'password'}
              />
              <button onClick={() => setShowPassword(!showPassword)} className="text-muted hover:text-foreground">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          )}

          {error && (
            <div className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {success && (
            <div className="text-xs text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Reset link sent. Check your inbox.
            </div>
          )}

          {mode === 'login' && (
            <button
              onClick={handleLogin}
              className="w-full py-3 rounded-xl bg-foreground text-white font-semibold text-sm hover:opacity-90 transition-colors"
            >
              Sign in
            </button>
          )}
          {mode === 'register' && (
            <button
              onClick={handleRegister}
              className="w-full py-3 rounded-xl bg-foreground text-white font-semibold text-sm hover:opacity-90 transition-colors"
            >
              Create account
            </button>
          )}
          {mode === 'forgot' && (
            <button
              onClick={handleForgot}
              className="w-full py-3 rounded-xl bg-foreground text-white font-semibold text-sm hover:opacity-90 transition-colors"
            >
              Send reset link
            </button>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between text-xs text-muted">
          {mode === 'login' ? (
            <>
              <button onClick={() => onSwitchMode('register')} className="text-muted hover:text-foreground">Create account</button>
              <button onClick={() => onSwitchMode('forgot')} className="text-muted hover:text-foreground">Forgot password</button>
            </>
          ) : (
            <button onClick={() => onSwitchMode('login')} className="text-muted hover:text-foreground">Back to login</button>
          )}
        </div>
      </div>
    </div>
  );
}
