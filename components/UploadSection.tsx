import React, { useState, useRef } from 'react';
import { UploadCloud, FileType, Loader2, AlertCircle, X, Play, Image as ImageIcon, Calendar as CalendarIcon, CheckCircle2, Split } from 'lucide-react';
import { analyzeWorkoutFile, ExtractedRoutine } from '../services/geminiService';
import { WorkoutPlan } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface UploadSectionProps {
  onScanComplete: (workouts: WorkoutPlan[]) => void;
}

interface DraftRoutine extends ExtractedRoutine {
  id: string;
  selectedDate: string; // YYYY-MM-DD
}

export const UploadSection: React.FC<UploadSectionProps> = ({ onScanComplete }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<{ file: File; preview: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New state for Review Mode (Multi-day split)
  const [draftRoutines, setDraftRoutines] = useState<DraftRoutine[] | null>(null);

  const handleFileSelect = (file: File) => {
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setError("Formato non supportato. Usa JPG, PNG o PDF.");
      return;
    }

    if (file.size > 20 * 1024 * 1024) { // 20MB limit
      setError("File troppo grande. Max 20MB.");
      return;
    }

    setError(null);
    setDraftRoutines(null); // Reset previous analysis
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedFile({
        file,
        preview: e.target?.result as string
      });
    };
    reader.readAsDataURL(file);
  };

  const startAnalysis = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      // Analyze file to get raw routines
      const rawRoutines = await analyzeWorkoutFile(selectedFile.preview, selectedFile.file.type);
      
      // Convert to draft format with temporary IDs and today's date
      const today = new Date().toISOString().split('T')[0];
      const drafts: DraftRoutine[] = rawRoutines.map(r => ({
        ...r,
        id: uuidv4(),
        selectedDate: today
      }));

      setDraftRoutines(drafts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore sconosciuto durante l'analisi.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRoutineUpdate = (id: string, field: 'routineName' | 'selectedDate', value: string) => {
    if (!draftRoutines) return;
    setDraftRoutines(draftRoutines.map(r => 
      r.id === id ? { ...r, [field]: value } : r
    ));
  };

  const finalizeImport = () => {
    if (!draftRoutines) return;

    const newWorkouts: WorkoutPlan[] = draftRoutines.map(draft => ({
      id: uuidv4(),
      title: draft.routineName,
      // Use the selected date. Note: We append current time to ensure uniqueness/sorting if needed, 
      // or just use the date. Let's use noon to avoid timezone shifts on simple dates.
      dateCreated: new Date(draft.selectedDate + 'T12:00:00').toISOString(),
      exercises: draft.exercises
    }));

    onScanComplete(newWorkouts);
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setDraftRoutines(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = () => {
    setIsDragOver(false);
  };

  // --- RENDER: REVIEW MODE (Split & Calendarize) ---
  if (draftRoutines) {
    return (
      <div className="max-w-4xl mx-auto animate-slide-up pb-20">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
            <Split className="w-6 h-6 text-primary" />
            Revisione Giornate
          </h2>
          <p className="text-gray-400">
            L'IA ha trovato {draftRoutines.length} giornat{draftRoutines.length === 1 ? 'a' : 'e'}. 
            Puoi rinominarle e assegnarle a una data specifica.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {draftRoutines.map((routine, index) => (
            <div key={routine.id} className="bg-surface border border-gray-700 rounded-xl p-5 shadow-lg relative">
              <div className="absolute top-0 right-0 p-3 text-gray-500 font-bold text-5xl opacity-10 select-none">
                {index + 1}
              </div>
              
              <div className="space-y-4 relative z-10">
                <div>
                  <label className="text-xs text-gray-400 uppercase font-semibold mb-1 block">Nome Scheda / Giorno</label>
                  <input 
                    type="text" 
                    value={routine.routineName}
                    onChange={(e) => handleRoutineUpdate(routine.id, 'routineName', e.target.value)}
                    className="w-full bg-dark border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-primary outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 uppercase font-semibold mb-1 block flex items-center gap-1">
                    <CalendarIcon className="w-3 h-3" /> Data Inizio / Programmazione
                  </label>
                  <input 
                    type="date" 
                    value={routine.selectedDate}
                    onChange={(e) => handleRoutineUpdate(routine.id, 'selectedDate', e.target.value)}
                    className="w-full bg-dark border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-primary outline-none [color-scheme:dark]"
                  />
                </div>

                <div className="bg-black/20 rounded-lg p-3 text-sm text-gray-300">
                  <p className="font-semibold mb-1 text-primary">{routine.exercises.length} Esercizi rilevati:</p>
                  <ul className="list-disc list-inside opacity-80 text-xs space-y-1">
                    {routine.exercises.slice(0, 3).map((ex, i) => (
                      <li key={i} className="truncate">{ex.name}</li>
                    ))}
                    {routine.exercises.length > 3 && <li>...e altri {routine.exercises.length - 3}</li>}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <button 
            onClick={() => setDraftRoutines(null)}
            className="px-6 py-3 rounded-full border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors font-medium"
          >
            Annulla / Riprova
          </button>
          <button 
            onClick={finalizeImport}
            className="px-8 py-3 rounded-full bg-primary hover:bg-primary/90 text-dark font-bold shadow-lg shadow-primary/20 transition-transform active:scale-95 flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            Salva {draftRoutines.length} Schede
          </button>
        </div>
      </div>
    );
  }

  // --- RENDER: UPLOAD MODE ---
  return (
    <div className="max-w-2xl mx-auto animate-fade-in-up">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-3">Carica la tua Scheda</h2>
        <p className="text-gray-400">
          Carica una foto o un PDF. L'IA riconoscerà automaticamente se ci sono più giornate (es. Split A/B) e ti permetterà di dividerle.
        </p>
      </div>

      {!selectedFile ? (
        <div
          className={`
            relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 cursor-pointer
            ${isDragOver ? 'border-primary bg-primary/10' : 'border-gray-600 hover:border-gray-500 bg-surface'}
          `}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".jpg,.jpeg,.png,.webp,.pdf,image/*,application/pdf"
            onChange={(e) => {
              if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
            }}
          />

          <div className="py-8">
            <div className="w-20 h-20 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <UploadCloud className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Tocca per caricare o trascina qui
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              Supporta Immagini (JPG, PNG) e PDF multipagina
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1"><FileType className="w-4 h-4" /> PDF</span>
              <span className="flex items-center gap-1"><FileType className="w-4 h-4" /> JPG</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-surface border border-gray-700 rounded-2xl p-6 relative animate-scale-in">
          <button 
            onClick={clearSelection}
            disabled={isAnalyzing}
            className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-red-500/80 text-white rounded-full transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center">
             {selectedFile.file.type.includes('pdf') ? (
               <div className="w-full h-64 bg-gray-900/50 rounded-xl flex flex-col items-center justify-center text-gray-300 border-2 border-dashed border-gray-700 mb-6 relative group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  <div className="bg-surface p-6 rounded-2xl shadow-2xl border border-gray-700 flex flex-col items-center relative z-10 transform transition-transform duration-500 group-hover:-translate-y-1">
                    <div className="p-3 bg-red-500/10 rounded-xl mb-3">
                      <FileType className="w-12 h-12 text-red-500" />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-white text-lg mb-1 max-w-[250px] truncate" title={selectedFile.file.name}>
                        {selectedFile.file.name}
                      </p>
                      <div className="flex items-center justify-center gap-2 text-xs text-gray-500 font-medium uppercase tracking-wider">
                        <span>PDF</span>
                        <span>•</span>
                        <span>{(selectedFile.file.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-gray-500 animate-pulse">Pronto per l'analisi</p>
               </div>
             ) : (
               <div className="relative w-full h-64 mb-6 bg-gray-900 rounded-xl overflow-hidden border border-gray-700">
                 <img 
                   src={selectedFile.preview} 
                   alt="Preview" 
                   className="w-full h-full object-contain"
                 />
               </div>
             )}

             {isAnalyzing ? (
                <div className="flex flex-col items-center animate-pulse">
                  <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                  <span className="text-primary font-medium">Analisi Multi-Pagina in corso...</span>
                </div>
             ) : (
               <button
                 onClick={startAnalysis}
                 className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-dark font-bold px-8 py-3 rounded-full transition-all hover:scale-105 shadow-lg shadow-primary/20"
               >
                 <Play className="w-5 h-5 fill-current" />
                 Avvia Analisi IA
               </button>
             )}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-start gap-3 text-red-200">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};