'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { LogOut, LayoutDashboard, Plug, PlusCircle, Tag, Users, KeyRound, ShieldCheck } from 'lucide-react';
import Image from 'next/image';

type NavItem = {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
};

const NAV_SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: '',
    items: [
      { id: 'dashboard', label: 'Dashboard', href: '/admin', icon: <LayoutDashboard size={16} /> },
    ],
  },
  {
    title: 'API Management',
    items: [
      { id: 'apis', label: 'All APIs', href: '/admin/apis', icon: <Plug size={16} /> },
      { id: 'addapi', label: 'Add New API', href: '/admin/apis/new', icon: <PlusCircle size={16} /> },
      { id: 'assign-apis', label: 'Assign APIs', href: '/admin/assign-apis', icon: <Tag size={16} /> },
    ],
  },
  {
    title: 'User Management',
    items: [
      { id: 'users', label: 'User Management', href: '/admin/users', icon: <Users size={16} />, adminOnly: true },
    ],
  },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const isAdmin = user?.role === 'ADMIN';
  const initials = user?.email?.charAt(0).toUpperCase() ?? 'U';

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-slate-900 to-slate-950 border-r border-blue-500/20 flex flex-col overflow-hidden">
      {/* Logo */}
      <div className="p-6 border-b border-blue-500/20 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Image
            src="/tylersoft-icon.png"
            alt="Tylersoft"
            width={36}
            height={36}
            priority
          />
          <div>
            <h1 className="text-sm font-bold text-white">
              <span className="text-blue-500">Tylersoft</span>
            </h1>
            <p className="text-xs text-gray-400">API Hub</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {NAV_SECTIONS.map((section) => {
          const visibleItems = section.items.filter(
            (item) => !item.adminOnly || isAdmin
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title || 'main'}>
              {section.title && (
                <p className="text-[10px] font-semibold text-gray-500 uppercase mb-2 tracking-widest px-1">
                  {section.title}
                </p>
              )}
              <div className="space-y-1">
                {visibleItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${isActive
                        ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-md shadow-blue-900/30'
                        : 'text-gray-400 hover:bg-slate-800/60 hover:text-white'
                        }`}
                    >
                      <span className={isActive ? 'text-white' : 'text-gray-500'}>
                        {item.icon}
                      </span>
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="bg-slate-800/50 rounded-lg px-3 py-2.5 border border-blue-500/10 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Account</p>
          <p className="text-xs font-semibold text-white truncate">{user?.email}</p>
        </div>
        <span className="flex-shrink-0 bg-gradient-to-r from-blue-500/20 to-orange-500/20 text-white border border-blue-500/30 capitalize text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
          {isAdmin && <ShieldCheck size={10} />}
          {user?.role}
        </span>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg transition-all font-medium border border-transparent hover:border-red-500/30 text-sm"
      >
        <LogOut size={15} />
        Logout
      </button>
    </div>

  );
}