import React from 'react';
import { AlertTriangle, X, Trash2 } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  workoutTitle?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  workoutTitle,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300" 
        onClick={onCancel}
      />
      
      {/* Modal Content */}
      <div className="relative bg-surface border border-gray-700 rounded-3xl p-8 w-full max-w-md shadow-2xl animate-scale-in flex flex-col items-center text-center">
        <button 
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-full transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="bg-red-500/10 p-4 rounded-full mb-6 border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
          <Trash2 className="w-8 h-8 text-red-500" />
        </div>

        <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
        
        <p className="text-gray-400 mb-6 leading-relaxed">
          {message}
        </p>

        {workoutTitle && (
          <div className="bg-black/30 border border-gray-700 rounded-xl py-3 px-4 mb-8 w-full">
            <span className="text-sm text-gray-500 block mb-1 uppercase tracking-wider font-bold">Scheda selezionata</span>
            <span className="text-white font-semibold text-lg truncate block">{workoutTitle}</span>
          </div>
        )}

        <div className="flex w-full gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-all transform active:scale-95"
          >
            Annulla
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold shadow-lg shadow-red-500/20 transition-all transform hover:scale-105 active:scale-95"
          >
            Elimina
          </button>
        </div>
      </div>
    </div>
  );
};