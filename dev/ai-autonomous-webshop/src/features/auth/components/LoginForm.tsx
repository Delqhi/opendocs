import React, { useState } from 'react';
import { useAuthStore } from '../hooks/useAuth';
import { Button } from '../../../components/ui/Button';
import { BiometricAuth } from './BiometricAuth';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md p-8 glass rounded-3xl">
      <h2 className="text-2xl font-bold mb-6">Welcome Back</h2>
      {error && <div className="p-3 bg-red-500/20 border border-red-500/50 text-red-400 rounded-xl text-sm">{error}</div>}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          placeholder="you@example.com"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          placeholder="••••••••"
          required
        />
      </div>
      <Button type="submit" className="w-full" isLoading={isLoading}>
        Sign In
      </Button>
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-[#0a0a0a] text-gray-500 italic">or</span>
        </div>
      </div>
      <BiometricAuth />
    </form>
  );
};
