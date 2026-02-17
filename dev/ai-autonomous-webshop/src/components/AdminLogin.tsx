import { useState } from 'react';
import { ShieldCheck, Lock, User } from 'lucide-react';

interface AdminLoginProps {
  onSuccess: () => void;
  onBack: () => void;
}

export function AdminLogin({ onSuccess, onBack }: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (username.trim() === 'demo' && password.trim() === 'demo') {
      setError('');
      onSuccess();
      return;
    }
    setError('Invalid credentials. Use demo / demo.');
  };

  return (
    <div className="min-h-screen bg-dark-900 text-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-dark-800 border border-white/[0.06] rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Admin Login</h1>
            <p className="text-xs text-gray-500">Secure access to the management console</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs text-gray-400">Username</label>
            <div className="flex items-center gap-2 rounded-xl bg-white/[0.04] border border-white/[0.06] px-3">
              <User className="w-4 h-4 text-gray-500" />
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="demo"
                className="w-full bg-transparent py-3 text-sm text-white placeholder-gray-600 focus:outline-none"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs text-gray-400">Password</label>
            <div className="flex items-center gap-2 rounded-xl bg-white/[0.04] border border-white/[0.06] px-3">
              <Lock className="w-4 h-4 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="demo"
                className="w-full bg-transparent py-3 text-sm text-white placeholder-gray-600 focus:outline-none"
              />
            </div>
          </div>

          {error && (
            <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-gray-100 transition-colors"
          >
            Sign in
          </button>
        </form>

        <div className="mt-5 flex items-center justify-between text-xs text-gray-500">
          <span>Demo access only</span>
          <button onClick={onBack} className="text-gray-300 hover:text-white">Back to shop</button>
        </div>
      </div>
    </div>
  );
}
