'use client';

import { Menu, User, LogOut, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import Image from 'next/image';

interface SiteHeaderProps {
  onMenuClick: () => void;
  onLogout: () => void;
  userName: string;
}

export function SiteHeader({ onMenuClick, onLogout, userName }: SiteHeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b-2 border-border bg-card transition-all duration-300">
      <div className="flex h-16 items-center px-6 justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onMenuClick} className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground">
            <Menu size={24} />
          </button>

          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden border-2 border-border/50 bg-background p-1.5 shadow-sm transition-all hover:border-primary">
              <Image
                src="/logo.png"
                alt="Tylersoft Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-2xl font-black tracking-tighter italic">
              <span className="text-blue-500">Tylersoft-</span>
              <span className="text-orange-500 lowercase">eclectics</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-background px-4 py-2 rounded-xl border-2 border-border/50">
            <User size={14} className="text-primary" />
            {userName}
          </div>

          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-primary bg-card hover:bg-background border-2 border-border rounded-xl transition-all shadow-sm"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          )}

          <button
            onClick={onLogout}
            className="flex items-center justify-center w-10 h-10 text-muted-foreground hover:text-rose-600 bg-card hover:bg-rose-500/10 border-2 border-border hover:border-rose-500/20 rounded-xl transition-all shadow-sm"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
