import { Menu, User, LogOut } from 'lucide-react';

interface SiteHeaderProps {
  onMenuClick: () => void;
  onLogout: () => void;
  userName: string;
}

export function SiteHeader({ onMenuClick, onLogout, userName }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-900/80 backdrop-blur supports-[backdrop-filter]:bg-slate-900/60">
      <div className="flex h-16 items-center px-4 justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onMenuClick} className="md:hidden p-2 -ml-2 text-gray-400 hover:text-white">
            <Menu size={24} />
          </button>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
            Tylersoft API
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-300 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50">
            <User size={14} />
            {userName}
          </div>
          <button onClick={onLogout} className="text-gray-400 hover:text-red-400 p-2 rounded-full hover:bg-slate-800/50 transition" title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
