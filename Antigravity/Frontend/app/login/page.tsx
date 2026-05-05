'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        if (userData.role === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      }
    } else {
      setError(result.error || 'Invalid email or password');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 flex items-center justify-center p-4">
      {/* Animated background with Tylersoft colors */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-600/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-orange-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <Card className="w-full max-w-md relative z-10 bg-slate-900/80 backdrop-blur-xl border border-blue-500/20 shadow-2xl">
        <div className="p-8">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <Image
                src="/tylersoft-icon.png"
                alt="Tylersoft"
                width={80}
                height={80}
                priority
                className="drop-shadow-lg"
              />
            </div>
            <h1 className="text-3xl font-bold mb-2">
              <span className="text-blue-500">Tylersoft</span>
              <span className="text-orange-500">-Eclectics</span>
            </h1>
            <p className="text-gray-400 text-sm">API Hub Dashboard</p>
            <p className="text-gray-500 text-xs mt-2">Sign in to your account</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-slate-800/50 border-blue-500/30 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-800/50 border-blue-500/30 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full gradient-tylersoft hover:opacity-90 text-white font-semibold py-2 rounded-lg transition duration-200"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-slate-700">
            <p className="text-xs text-gray-400 mb-3 font-semibold">Demo Credentials:</p>
            <div className="space-y-3">
              <div className="bg-blue-900/20 border border-blue-500/30 rounded p-3">
                <p className="text-xs text-blue-300 mb-1 font-medium">Admin Account</p>
                <p className="text-xs text-gray-300"><span className="text-blue-400">Email:</span> admin@tylersoft.com</p>
                <p className="text-xs text-gray-300"><span className="text-blue-400">Password:</span> AdminPass123!</p>
              </div>
              <div className="bg-orange-900/20 border border-orange-500/30 rounded p-3">
                <p className="text-xs text-orange-300 mb-1 font-medium">User Account</p>
                <p className="text-xs text-gray-300"><span className="text-orange-400">Email:</span> user@tylersoft.com</p>
                <p className="text-xs text-gray-300"><span className="text-orange-400">Password:</span> UserPass123!</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">Powered by Tylersoft-Eclectics Technologies</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
