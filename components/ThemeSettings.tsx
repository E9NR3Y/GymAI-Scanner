import React from 'react';
import { X, RotateCcw, Palette } from 'lucide-react';
import { ThemeConfig } from '../types';

interface ThemeSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeConfig;
  onUpdateTheme: (key: keyof ThemeConfig, value: string) => void;
  onReset: () => void;
}

export const ThemeSettings: React.FC<ThemeSettingsProps> = ({
  isOpen,
  onClose,
  theme,
  onUpdateTheme,
  onReset,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      <div className="relative bg-surface border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-bold text-white">Personalizza Tema</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Colore Primario</label>
            <div className="flex items-center gap-3">
              <input 
                type="color" 
                value={theme.primary}
                onChange={(e) => onUpdateTheme('primary', e.target.value)}
                className="h-10 w-20 bg-transparent rounded cursor-pointer"
              />
              <span className="text-gray-400 font-mono text-sm">{theme.primary}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Colore per bottoni principali e accenti.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Colore Secondario</label>
            <div className="flex items-center gap-3">
              <input 
                type="color" 
                value={theme.secondary}
                onChange={(e) => onUpdateTheme('secondary', e.target.value)}
                className="h-10 w-20 bg-transparent rounded cursor-pointer"
              />
              <span className="text-gray-400 font-mono text-sm">{theme.secondary}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Colore per elementi di supporto.</p>
          </div>
        </div>

        <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-700">
           <button 
             onClick={onReset}
             className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
           >
             <RotateCcw className="w-4 h-4" />
             Reset Default
           </button>
           <button
             onClick={onClose}
             className="px-6 py-2 bg-primary hover:bg-primary/90 text-dark font-bold rounded-full transition-all active:scale-95 shadow-lg shadow-primary/20"
           >
             Fatto
           </button>
        </div>
      </div>
    </div>
  );
};