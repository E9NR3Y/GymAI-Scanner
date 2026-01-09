import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { UploadSection } from './components/UploadSection';
import { WorkoutList } from './components/WorkoutList';
import { WorkoutDetail } from './components/WorkoutDetail';
import { ConfirmationModal } from './components/ConfirmationModal';
import { ThemeSettings } from './components/ThemeSettings';
import { AIChatBot } from './components/AIChatBot';
import { WorkoutPlan, AppView, ThemeConfig } from './types';
import { Zap, Play, CalendarClock } from 'lucide-react';

const STORAGE_KEY = 'gymai_workouts';
const THEME_KEY = 'gymai_theme';

const DEFAULT_THEME: ThemeConfig = {
  primary: '#10b981', // Emerald 500
  secondary: '#3b82f6', // Blue 500
};

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}` : null;
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [workouts, setWorkouts] = useState<WorkoutPlan[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutPlan | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [autoStartSession, setAutoStartSession] = useState(false);
  const [theme, setTheme] = useState<ThemeConfig>(DEFAULT_THEME);
  const [isThemeSettingsOpen, setIsThemeSettingsOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null; title?: string }>({
    isOpen: false,
    id: null
  });

  useEffect(() => {
    const storedWorkouts = localStorage.getItem(STORAGE_KEY);
    if (storedWorkouts) setWorkouts(JSON.parse(storedWorkouts));
    const storedTheme = localStorage.getItem(THEME_KEY);
    if (storedTheme) setTheme(JSON.parse(storedTheme));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
  }, [workouts]);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, JSON.stringify(theme));
    const root = document.documentElement;
    const primaryRgb = hexToRgb(theme.primary);
    const secondaryRgb = hexToRgb(theme.secondary);
    if (primaryRgb) root.style.setProperty('--color-primary', primaryRgb);
    if (secondaryRgb) root.style.setProperty('--color-secondary', secondaryRgb);
  }, [theme]);

  const lastPlayedWorkout = useMemo(() => {
    const played = workouts.filter(w => w.lastPlayed);
    if (played.length === 0) return null;
    return played.sort((a, b) => new Date(b.lastPlayed!).getTime() - new Date(a.lastPlayed!).getTime())[0];
  }, [workouts]);

  const handleScanComplete = (newWorkouts: WorkoutPlan[]) => {
    setWorkouts(prev => [...newWorkouts, ...prev]);
    if (newWorkouts.length === 1) {
      setSelectedWorkout(newWorkouts[0]);
      setCurrentView(AppView.DETAILS);
    } else {
      setCurrentView(AppView.DASHBOARD);
    }
  };

  const handleUpdateWorkout = (updatedWorkout: WorkoutPlan) => {
    setWorkouts(prev => prev.map(w => w.id === updatedWorkout.id ? updatedWorkout : w));
    if (selectedWorkout?.id === updatedWorkout.id) setSelectedWorkout(updatedWorkout);
  };

  const requestDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const workoutToDelete = workouts.find(w => w.id === id);
    setDeleteModal({ isOpen: true, id, title: workoutToDelete?.title });
  };

  const confirmDelete = () => {
    if (deleteModal.id) setWorkouts(prev => prev.filter(w => w.id !== deleteModal.id));
    setDeleteModal({ isOpen: false, id: null });
  };

  const handleViewChange = (view: AppView) => {
    setCurrentView(view);
    if (view === AppView.DASHBOARD) {
      setSelectedWorkout(null);
      setAutoStartSession(false);
    }
  };

  const handleSelectWorkout = (workout: WorkoutPlan) => {
    setSelectedWorkout(workout);
    setCurrentView(AppView.DETAILS);
  };

  return (
    <div className="min-h-[100dvh] bg-dark text-slate-100 font-sans pb-24 transition-colors duration-500">
      <Header 
        currentView={currentView} 
        onChangeView={handleViewChange}
        onOpenSettings={() => setIsThemeSettingsOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <main className="max-w-6xl mx-auto px-6">
        {currentView === AppView.UPLOAD && <UploadSection onScanComplete={handleScanComplete} />}
        {currentView === AppView.DASHBOARD && (
          <div className="animate-fade-in">
             {lastPlayedWorkout && !searchQuery && (
               <div className="mb-8 animate-slide-up">
                 <div className="bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 rounded-2xl p-6 relative overflow-hidden group">
                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                       <div>
                          <div className="flex items-center gap-2 text-primary font-bold uppercase text-xs mb-2"><Zap className="w-4 h-4" /> Allenamento Veloce</div>
                          <h3 className="text-2xl font-bold text-white mb-1">{lastPlayedWorkout.title}</h3>
                          <div className="flex items-center text-gray-400 text-sm"><CalendarClock className="w-4 h-4 mr-2" /> Ultimo: {new Date(lastPlayedWorkout.lastPlayed!).toLocaleDateString('it-IT')}</div>
                       </div>
                       <button onClick={() => { setSelectedWorkout(lastPlayedWorkout); setAutoStartSession(true); setCurrentView(AppView.DETAILS); }} className="bg-white text-dark font-bold px-6 py-3 rounded-xl shadow-lg flex items-center gap-2">Riprendi Ora</button>
                    </div>
                 </div>
               </div>
             )}
             <WorkoutList workouts={workouts} onSelect={handleSelectWorkout} onDelete={requestDelete} searchQuery={searchQuery} />
          </div>
        )}
        {currentView === AppView.DETAILS && selectedWorkout && (
          <WorkoutDetail workout={selectedWorkout} onUpdate={handleUpdateWorkout} initialSessionMode={autoStartSession} />
        )}
      </main>

      <AIChatBot />

      <ConfirmationModal isOpen={deleteModal.isOpen} title="Elimina Scheda" message="Sei sicuro di voler eliminare definitivamente questa scheda?" workoutTitle={deleteModal.title} onConfirm={confirmDelete} onCancel={() => setDeleteModal({ isOpen: false, id: null })} />
      <ThemeSettings isOpen={isThemeSettingsOpen} onClose={() => setIsThemeSettingsOpen(false)} theme={theme} onUpdateTheme={(k, v) => setTheme(t => ({...t, [k]: v}))} onReset={() => setTheme(DEFAULT_THEME)} />
    </div>
  );
};

export default App;