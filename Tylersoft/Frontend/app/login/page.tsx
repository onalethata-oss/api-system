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
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <Card className="w-full max-w-md bg-white border-2 border-slate-200 shadow-2xl rounded-[2.5rem] overflow-hidden">
        <div className="p-12">
          {/* Logo/Header */}
          <div className="text-center mb-10">
            <div className="flex justify-center mb-8">
              <div className="p-4 bg-slate-50 rounded-3xl border-2 border-slate-100 shadow-inner">
                <Image
                  src="/tylersoft-icon.png"
                  alt="Tylersoft"
                  width={80}
                  height={80}
                  priority
                />
              </div>
            </div>
            <h1 className="text-4xl font-black mb-2 tracking-tighter italic">
              <span className="text-blue-500">Tylersoft-</span>
              <span className="text-orange-500 lowercasecase">eclectics</span>
            </h1>
            <p className="text-slate-500 text-sm mt-4 font-medium">Sign in to your account</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border-2 border-rose-100 rounded-2xl">
              <p className="text-rose-600 text-sm font-bold">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="identity@tylersoft.com"
                className="w-full bg-slate-50 border-2 border-slate-200 text-slate-900 placeholder-slate-400 h-14 px-6 rounded-2xl focus:border-primary focus:ring-0 transition-all font-medium"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border-2 border-slate-200 text-slate-900 placeholder-slate-400 h-14 px-6 rounded-2xl focus:border-primary focus:ring-0 transition-all font-medium"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:opacity-90 text-white font-black text-lg h-14 rounded-2xl transition-all shadow-lg shadow-primary/20 uppercase tracking-widest italic"
            >
              {isLoading ? 'Loading...' : 'Login'}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-12 text-center">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Powered by Tylersoft-Eclectics Systems</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
