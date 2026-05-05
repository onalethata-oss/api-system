'use client';

import { Search, User, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/lib/auth/AuthContext';

export function Header() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <div className="fixed top-0 right-0 left-64 h-16 bg-gradient-to-r from-slate-900/80 to-slate-800/80 border-b border-blue-500/20 backdrop-blur-sm z-40">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search APIs, users..."
              className="w-full bg-slate-800/50 border border-blue-500/20 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:bg-slate-800"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-6 ml-6">
          {/* Theme Toggle */}
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="relative text-gray-400 hover:text-orange-400 transition-colors"
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute top-0 right-0 h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-3 pl-6 border-l border-blue-500/20">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-white">{user?.email?.split('@')[0]}</p>
              <p className="text-xs text-gray-400">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
