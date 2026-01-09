import React from 'react';
import { Dumbbell, Plus, Settings, Search, X } from 'lucide-react';
import { AppView } from '../types';

interface HeaderProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  onOpenSettings: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentView, 
  onChangeView, 
  onOpenSettings,
  searchQuery,
  setSearchQuery
}) => {
  return (
    <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-gray-700 py-4 px-6 mb-6 transition-all duration-300">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div 
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity self-start md:self-auto"
          onClick={() => onChangeView(AppView.DASHBOARD)}
        >
          <div className="bg-primary/20 p-2 rounded-lg transition-colors">
            <Dumbbell className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent hidden sm:block">
            GymAI Scanner
          </h1>
        </div>

        {/* Search Bar */}
        <div className="flex-1 w-full md:max-w-md relative">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca allenamenti o esercizi..."
              className="w-full bg-dark/50 border border-gray-600 rounded-full py-2 pl-10 pr-10 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-gray-500"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          {currentView === AppView.DASHBOARD && (
            <button
              onClick={() => onChangeView(AppView.UPLOAD)}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-dark font-semibold px-4 py-2 rounded-full transition-all active:scale-95 shadow-lg shadow-primary/20 whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Nuova Scheda</span>
            </button>
          )}
          
          {currentView !== AppView.DASHBOARD && (
             <button
             onClick={() => onChangeView(AppView.DASHBOARD)}
             className="text-gray-400 hover:text-white font-medium px-4 py-2 transition-colors whitespace-nowrap"
           >
             Indietro
           </button>
          )}

          <button 
            onClick={onOpenSettings}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-all"
            title="Impostazioni Tema"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};