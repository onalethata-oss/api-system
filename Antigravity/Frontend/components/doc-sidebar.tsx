import { X, Book, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface UserApiRow {
  id: number;
  name: string;
  description?: string;
  endpointUrl?: string;
  documentation?: string;
  parsedDocumentation?: string;
}

interface DocSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  apis: UserApiRow[];
  activeDocId: number | 'getting-started' | null;
  onNavigate: (id: number | 'getting-started') => void;
}

export function DocSidebar({ isOpen, onClose, apis, activeDocId, onNavigate }: DocSidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden" 
          onClick={onClose}
        />
      )}
      
      <div className={cn(
        "fixed md:sticky top-16 z-40 w-64 h-[calc(100vh-4rem)] bg-slate-950 border-r border-slate-800 transition-transform duration-200 ease-in-out flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="flex items-center justify-between p-4 border-b border-slate-800/60 md:hidden">
          <span className="font-semibold text-white">Documentation</span>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto flex-1">
          <div className="space-y-1 mb-6">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Overview</div>
            <button
              onClick={() => onNavigate('getting-started')}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition",
                activeDocId === 'getting-started' 
                  ? "bg-blue-500/10 text-blue-400" 
                  : "text-gray-400 hover:bg-slate-900 hover:text-gray-200"
              )}
            >
              <Book size={16} />
              Getting Started
            </button>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">My Assigned APIs</div>
            {apis.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-600">No APIs assigned yet.</div>
            ) : (
              apis.map(api => (
                <button
                  key={api.id}
                  onClick={() => onNavigate(api.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition text-left",
                    activeDocId === api.id 
                      ? "bg-blue-500/10 text-blue-400" 
                      : "text-gray-400 hover:bg-slate-900 hover:text-gray-200"
                  )}
                >
                  <Package size={16} className={activeDocId === api.id ? "text-blue-400" : "text-gray-500"} />
                  <span className="truncate">{api.name}</span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
