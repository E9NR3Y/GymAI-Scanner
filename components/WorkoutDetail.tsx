import React, { useState, useEffect, useMemo, useRef } from 'react';
import { WorkoutPlan, Exercise } from '../types';
import { Calendar, Layers, Repeat, Check, X, Edit2, FileDown, Search, PlayCircle, RotateCcw, ChevronRight, Trophy, StickyNote, Timer, Play, Pause, Plus, Minus, AlertTriangle, LogOut, Save, Sparkles, Info, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { getExerciseExplanation } from '../services/geminiService';

interface WorkoutDetailProps {
  workout: WorkoutPlan;
  onUpdate: (updatedWorkout: WorkoutPlan) => void;
  initialSessionMode?: boolean;
}

export const WorkoutDetail: React.FC<WorkoutDetailProps> = ({ workout, onUpdate, initialSessionMode = false }) => {
  // Mode States
  const [isWorkoutMode, setIsWorkoutMode] = useState(initialSessionMode);
  const [explainingExercise, setExplainingExercise] = useState<string | null>(null);
  const [explanationContent, setExplanationContent] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  
  // Update local state if prop changes
  useEffect(() => {
    if (initialSessionMode) setIsWorkoutMode(true);
  }, [initialSessionMode]);
  
  // Filter/Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Edit States
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Exercise | null>(null);

  // Helper for History Keys
  const getHistoryKey = (exerciseIndex: number) => `gym_history_${workout.id}_${exerciseIndex}`;

  const filteredExercises = useMemo(() => {
    if (!searchQuery) return workout.exercises;
    const q = searchQuery.toLowerCase();
    return workout.exercises.filter(ex => 
      ex.name.toLowerCase().includes(q) || 
      ex.muscleGroup.toLowerCase().includes(q)
    );
  }, [workout.exercises, searchQuery]);

  const startExplaining = async (ex: Exercise) => {
    setExplainingExercise(ex.name);
    setExplanationContent(null);
    setIsExplaining(true);
    try {
      const text = await getExerciseExplanation(ex.name, ex.muscleGroup);
      setExplanationContent(text);
    } catch (e) {
      setExplanationContent("Impossibile caricare la spiegazione.");
    } finally {
      setIsExplaining(false);
    }
  };

  // --- EDIT FUNCTIONS ---
  const startEditing = (index: number, exercise: Exercise) => {
    setEditingIndex(index);
    setEditForm({ ...exercise });
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setEditForm(null);
  };

  const saveEditing = () => {
    if (editingIndex !== null && editForm) {
      const originalExercise = workout.exercises[editingIndex];
      const historyKey = getHistoryKey(editingIndex);
      const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
      const newHistory = [...history, originalExercise].slice(-5); 
      localStorage.setItem(historyKey, JSON.stringify(newHistory));

      const updatedExercises = [...workout.exercises];
      updatedExercises[editingIndex] = editForm;
      const updatedWorkout = { ...workout, exercises: updatedExercises };
      onUpdate(updatedWorkout);
      setEditingIndex(null);
      setEditForm(null);
    }
  };

  const handleUndo = (index: number) => {
    const historyKey = getHistoryKey(index);
    const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
    if (history.length === 0) return;
    const previousVersion = history.pop();
    localStorage.setItem(historyKey, JSON.stringify(history));
    const updatedExercises = [...workout.exercises];
    updatedExercises[index] = previousVersion;
    onUpdate({ ...workout, exercises: updatedExercises });
    if (editingIndex === index) cancelEditing();
  };

  const handleInputChange = (field: keyof Exercise, value: string | number) => {
    if (editForm) setEditForm({ ...editForm, [field]: value });
  };

  const hasHistory = (index: number) => {
    return JSON.parse(localStorage.getItem(getHistoryKey(index)) || '[]').length > 0;
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text(workout.title, 20, 20);
    doc.setFontSize(12);
    let yPos = 50;
    workout.exercises.forEach((ex, i) => {
       if (yPos > 270) { doc.addPage(); yPos = 20; }
       doc.setFontSize(14);
       doc.text(`${i + 1}. ${ex.name}`, 20, yPos);
       yPos += 15;
    });
    doc.save(`${workout.title.replace(/\s+/g, '_')}.pdf`);
  };

  const handleSessionComplete = () => {
    onUpdate({ ...workout, lastPlayed: new Date().toISOString() });
  };

  if (isWorkoutMode) {
    return (
      <WorkoutSessionMode 
        workout={workout} 
        onExit={() => setIsWorkoutMode(false)}
        onSaveProgress={handleSessionComplete}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-slide-up pb-20">
      {/* Top Header */}
      <div className="flex flex-col gap-4 mb-8 border-b border-gray-700 pb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
              <h2 className="text-3xl font-bold text-white mb-2">{workout.title}</h2>
              <div className="flex items-center text-gray-400">
              <Calendar className="w-4 h-4 mr-2" />
              <span className="capitalize">
                  {new Date(workout.dateCreated).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
              </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button onClick={exportPDF} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/50 px-4 py-2 rounded-lg transition-colors font-medium text-sm active:scale-95">
                <FileDown className="w-4 h-4" /> PDF
            </button>
            <button onClick={() => setIsWorkoutMode(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-dark px-4 py-2 rounded-lg transition-transform font-bold text-sm shadow-lg shadow-primary/20 active:scale-95">
                <PlayCircle className="w-4 h-4" /> Avvia Allenamento
            </button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cerca esercizi in questa scheda..."
            className="w-full bg-surface border border-gray-700 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:border-primary outline-none placeholder:text-gray-500 transition-all"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredExercises.map((exercise, index) => {
          const originalIndex = workout.exercises.indexOf(exercise);
          const isEditing = editingIndex === originalIndex;

          return (
            <div 
              key={originalIndex}
              className={`bg-surface rounded-xl p-5 border transition-all duration-300 relative group ${isEditing ? 'border-primary' : 'border-gray-700/50'}`}
            >
              {!isEditing && (
                <div className="absolute top-4 right-4 flex gap-2">
                   <button 
                      onClick={() => startExplaining(exercise)}
                      className="p-2 text-secondary hover:bg-secondary/10 rounded-lg transition-all"
                      title="Spiega con IA"
                   >
                      <Sparkles className="w-4 h-4" />
                   </button>
                   {hasHistory(originalIndex) && (
                     <button onClick={() => handleUndo(originalIndex)} className="p-2 text-gray-400 hover:text-yellow-400 rounded-lg transition-all">
                       <RotateCcw className="w-4 h-4" />
                     </button>
                   )}
                   <button onClick={() => startEditing(originalIndex, exercise)} className="p-2 text-gray-400 hover:text-white rounded-lg transition-all">
                      <Edit2 className="w-4 h-4" />
                   </button>
                </div>
              )}

              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gray-700/50 rounded-full flex items-center justify-center text-white font-bold border border-gray-600">
                  {originalIndex + 1}
                </div>
                <div className="flex-grow">
                  {isEditing ? (
                    <div className="space-y-4">
                       <input type="text" value={editForm?.name} onChange={(e) => handleInputChange('name', e.target.value)} className="w-full bg-dark border border-gray-600 rounded px-3 py-2 text-white" />
                       <div className="flex gap-2">
                         <button onClick={saveEditing} className="flex-1 bg-primary text-dark py-2 rounded"><Check className="w-4 h-4 mx-auto" /></button>
                         <button onClick={cancelEditing} className="flex-1 bg-gray-700 text-white py-2 rounded"><X className="w-4 h-4 mx-auto" /></button>
                       </div>
                    </div>
                  ) : (
                    <>
                      <h4 className="text-lg font-bold text-white mb-1">{exercise.name}</h4>
                      <p className="text-sm text-primary font-medium uppercase">{exercise.muscleGroup}</p>
                    </>
                  )}
                </div>
                {!isEditing && (
                   <div className="flex gap-6">
                     <div className="text-center">
                       <p className="text-xs text-gray-500 uppercase">Serie</p>
                       <p className="text-xl font-bold">{exercise.sets}</p>
                     </div>
                     <div className="text-center">
                       <p className="text-xs text-gray-500 uppercase">Reps</p>
                       <p className="text-xl font-bold">{exercise.reps}</p>
                     </div>
                   </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Explanation Dialog */}
      {explainingExercise && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setExplainingExercise(null)} />
           <div className="relative bg-surface border border-gray-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-scale-in">
              <div className="flex items-center justify-between mb-4 border-b border-gray-700 pb-4">
                 <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-secondary" />
                    <h3 className="text-xl font-bold text-white">{explainingExercise}</h3>
                 </div>
                 <button onClick={() => setExplainingExercise(null)} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              {isExplaining ? (
                <div className="py-12 flex flex-col items-center gap-4">
                   <Loader2 className="w-8 h-8 text-secondary animate-spin" />
                   <p className="text-gray-400 text-sm animate-pulse">L'IA sta preparando la spiegazione...</p>
                </div>
              ) : (
                <div className="text-gray-200 text-sm leading-relaxed space-y-4">
                   {explanationContent?.split('\n').map((line, i) => (
                      <p key={i} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-secondary">$1</strong>') }} />
                   ))}
                </div>
              )}
              <div className="mt-8 flex justify-end">
                 <button onClick={() => setExplainingExercise(null)} className="px-6 py-2 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-colors">Chiudi</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

// --- WORKOUT SESSION SUB-COMPONENT ---
interface WorkoutSessionModeProps {
  workout: WorkoutPlan;
  onExit: () => void;
  onSaveProgress: () => void;
}

const WorkoutSessionMode: React.FC<WorkoutSessionModeProps> = ({ workout, onExit, onSaveProgress }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());
  const [isComplete, setIsComplete] = useState(false);
  const [successAnimation, setSuccessAnimation] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [timeLeft, setTimeLeft] = useState(workout.exercises[0]?.restTime || 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    window.history.pushState({ sessionMode: true }, '');
    const handlePopState = (e: PopStateEvent) => { e.preventDefault(); setShowExitConfirm(true); };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    let interval: number;
    if (isTimerRunning && timeLeft > 0) interval = window.setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const currentExercise = workout.exercises[activeIndex];
  const progress = (completedExercises.size / workout.exercises.length) * 100;

  const toggleComplete = () => {
    if (!completedExercises.has(activeIndex)) {
      setSuccessAnimation(true);
      setTimeout(() => {
         const newCompleted = new Set(completedExercises);
         newCompleted.add(activeIndex);
         setCompletedExercises(newCompleted);
         setSuccessAnimation(false);
         if (activeIndex < workout.exercises.length - 1) setActiveIndex(prev => prev + 1);
         else { setIsComplete(true); onSaveProgress(); }
      }, 1500);
    }
  };

  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center h-[100dvh]">
        <Trophy className="w-20 h-20 text-primary mb-8" />
        <h2 className="text-4xl font-bold text-white mb-4">Ottimo Lavoro!</h2>
        <button onClick={onExit} className="bg-primary text-dark font-bold px-10 py-4 rounded-full">Torna alla Scheda</button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] bg-dark flex flex-col">
      <div className="bg-surface border-b border-gray-700 p-4 flex items-center justify-between">
         <span className="text-white font-medium">{workout.title}</span>
         <button onClick={() => setShowExitConfirm(true)}><X className="w-6 h-6 text-white" /></button>
      </div>
      <div className="h-1 bg-gray-800"><div className="h-full bg-primary" style={{ width: `${progress}%` }}></div></div>
      <div className="flex-1 p-6 flex flex-col justify-center max-w-2xl mx-auto w-full">
         <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">{currentExercise.name}</h1>
            <p className="text-xl text-gray-400">{currentExercise.muscleGroup}</p>
         </div>
         <div className="bg-surface border border-gray-700 rounded-3xl p-8 mb-6 flex justify-around">
            <div className="text-center">
              <p className="text-gray-500 uppercase text-sm mb-1">Serie</p>
              <p className="text-5xl font-bold text-white">{currentExercise.sets}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-500 uppercase text-sm mb-1">Reps</p>
              <p className="text-5xl font-bold text-white">{currentExercise.reps}</p>
            </div>
         </div>
         <button onClick={toggleComplete} className="w-full py-5 rounded-2xl bg-primary text-dark font-bold text-xl shadow-xl active:scale-95 transition-transform">
           {completedExercises.has(activeIndex) ? "Completato" : "Segna come Fatto"}
         </button>
      </div>

      {successAnimation && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-green-500/20 backdrop-blur-sm animate-fade-in">
           <div className="bg-surface border-4 border-green-500 p-12 rounded-full shadow-2xl animate-scale-in">
              <Check className="w-32 h-32 text-green-500" strokeWidth={4} />
           </div>
        </div>
      )}

      {showExitConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
           <div className="bg-surface border border-gray-700 rounded-3xl p-8 w-full max-w-sm text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Uscire dalla sessione?</h3>
              <div className="flex flex-col gap-3">
                 <button onClick={() => setShowExitConfirm(false)} className="w-full py-3 rounded-xl bg-primary text-dark font-bold">Continua</button>
                 <button onClick={onExit} className="w-full py-3 rounded-xl bg-gray-800 text-red-500 font-medium">Esci</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};