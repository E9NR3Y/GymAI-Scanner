import React, { useState, useMemo } from 'react';
import { WorkoutPlan } from '../types';
import { Calendar, ChevronRight, Trash2, Dumbbell, Repeat, Layers, Filter, LayoutGrid, CalendarDays, ArrowUpDown, Search } from 'lucide-react';
import { CalendarView } from './CalendarView';

interface WorkoutListProps {
  workouts: WorkoutPlan[];
  onSelect: (workout: WorkoutPlan) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  searchQuery: string;
}

type SortOption = 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc';

export const WorkoutList: React.FC<WorkoutListProps> = ({ workouts, onSelect, onDelete, searchQuery }) => {
  const [selectedMuscle, setSelectedMuscle] = useState<string>('Tutti');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [sortOption, setSortOption] = useState<SortOption>('date-desc');
  const [exerciseFilter, setExerciseFilter] = useState<string>('');

  // Derive unique muscle groups for filter
  const muscleGroups = useMemo(() => {
    const groups = new Set<string>();
    workouts.forEach(w => w.exercises.forEach(e => {
       if (e.muscleGroup) groups.add(e.muscleGroup);
    }));
    return ['Tutti', ...Array.from(groups).sort()];
  }, [workouts]);

  // Main Filter & Sort Logic
  const processedWorkouts = useMemo(() => {
    let result = [...workouts];

    // 1. Global Search (Header)
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(w => 
        w.title.toLowerCase().includes(q) || 
        w.exercises.some(e => e.name.toLowerCase().includes(q))
      );
    }

    // 2. Muscle Group Filter
    if (selectedMuscle !== 'Tutti') {
      result = result.filter(w => 
        w.exercises.some(e => e.muscleGroup === selectedMuscle)
      );
    }

    // 3. Specific Exercise Name Filter (Advanced Filter)
    if (exerciseFilter) {
      const q = exerciseFilter.toLowerCase();
      result = result.filter(w => 
        w.exercises.some(e => e.name.toLowerCase().includes(q))
      );
    }

    // 4. Sorting
    result.sort((a, b) => {
      switch (sortOption) {
        case 'date-desc':
          return new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime();
        case 'date-asc':
          return new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime();
        case 'name-asc':
          return a.title.localeCompare(b.title);
        case 'name-desc':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

    return result;
  }, [workouts, searchQuery, selectedMuscle, exerciseFilter, sortOption]);

  if (workouts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center opacity-70 animate-fade-in">
        <div className="bg-gray-800/50 p-6 rounded-full mb-6 ring-1 ring-gray-700">
           <Dumbbell className="w-16 h-16 text-gray-500" />
        </div>
        <h3 className="text-2xl font-bold text-gray-300 mb-2">Nessun allenamento</h3>
        <p className="text-gray-500 max-w-sm">
          Non hai ancora caricato nessuna scheda. Clicca su "Nuova Scheda" per iniziare.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Controls Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-surface p-4 rounded-xl border border-gray-700 animate-slide-up">
        
        {/* Left: View Toggle & Sort */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="bg-dark rounded-lg p-1 flex border border-gray-700">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-all ${viewMode === 'list' ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-white'}`}
              title="Vista Lista"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-2 rounded transition-all ${viewMode === 'calendar' ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-white'}`}
              title="Vista Calendario"
            >
              <CalendarDays className="w-5 h-5" />
            </button>
          </div>

          <div className="h-8 w-px bg-gray-700 mx-1 hidden md:block"></div>

          <div className="relative flex-1 md:flex-none">
             <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
             <select 
               value={sortOption}
               onChange={(e) => setSortOption(e.target.value as SortOption)}
               className="w-full md:w-48 bg-dark border border-gray-700 text-white text-sm rounded-lg pl-9 pr-8 py-2.5 focus:border-primary outline-none appearance-none cursor-pointer transition-colors hover:border-gray-500"
             >
               <option value="date-desc">Più recenti</option>
               <option value="date-asc">Meno recenti</option>
               <option value="name-asc">Nome (A-Z)</option>
               <option value="name-desc">Nome (Z-A)</option>
             </select>
          </div>
        </div>

        {/* Right: Specific Filter */}
        <div className="relative w-full md:w-64">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
           <input 
             type="text"
             value={exerciseFilter}
             onChange={(e) => setExerciseFilter(e.target.value)}
             placeholder="Filtra per nome esercizio..."
             className="w-full bg-dark border border-gray-700 rounded-lg py-2.5 pl-9 pr-4 text-sm text-white focus:border-primary outline-none transition-all focus:ring-1 focus:ring-primary/30"
           />
        </div>
      </div>

      {/* Muscle Group Filter Chips */}
      <div className="overflow-x-auto pb-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400 shrink-0 mr-1" />
          {muscleGroups.map(group => (
            <button
              key={group}
              onClick={() => setSelectedMuscle(group)}
              className={`
                px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-300 border
                ${selectedMuscle === group 
                  ? 'bg-primary text-dark border-primary shadow-[0_0_15px_rgba(var(--color-primary),0.3)] scale-105' 
                  : 'bg-surface text-gray-400 border-gray-700 hover:border-gray-500 hover:text-white'}
              `}
            >
              {group}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      {viewMode === 'calendar' ? (
        <CalendarView workouts={processedWorkouts} onSelectWorkout={onSelect} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {processedWorkouts.map((workout, index) => (
            <div 
              key={workout.id}
              onClick={() => onSelect(workout)}
              // Staggered animation: delay depends on index
              style={{ animationDelay: `${index * 0.05}s` }}
              className="
                group relative bg-surface border border-gray-700 rounded-2xl p-6 cursor-pointer overflow-hidden
                opacity-0 animate-slide-up
                transition-all duration-300 ease-out
                hover:border-primary/50 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5
              "
            >
              {/* Delete Button - enhanced interaction */}
              <div className="absolute top-4 right-4 z-20">
                <button 
                  onClick={(e) => onDelete(workout.id, e)}
                  className="
                    p-2 rounded-full opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0
                    bg-gray-800 text-gray-400 border border-transparent
                    hover:bg-red-500 hover:text-white hover:border-red-400 hover:rotate-12
                    transition-all duration-300 shadow-sm
                  "
                  title="Elimina Scheda"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="mb-4 pr-8">
                <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-primary transition-colors duration-300">{workout.title}</h3>
                <div className="flex items-center text-gray-400 text-sm">
                  <Calendar className="w-4 h-4 mr-1.5" />
                  {new Date(workout.dateCreated).toLocaleDateString('it-IT', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </div>
              </div>

              <div className="space-y-3 mb-4">
                {workout.exercises.slice(0, 3).map((ex, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm text-gray-300 border-b border-gray-700/50 pb-2 last:border-0 last:pb-0">
                    <span className="truncate flex-1 font-medium group-hover:text-gray-200 transition-colors">{ex.name}</span>
                    <span className="text-gray-500 text-xs bg-gray-800 px-2 py-0.5 rounded ml-2 whitespace-nowrap border border-gray-700/50">
                      {ex.sets}x{ex.reps}
                    </span>
                  </div>
                ))}
                {workout.exercises.length > 3 && (
                  <p className="text-xs text-primary font-medium pt-1">
                    + altri {workout.exercises.length - 3} esercizi
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700/50 group-hover:border-gray-600 transition-colors">
                 <div className="text-xs text-gray-500 font-mono">ID: {workout.id.slice(0,6)}</div>
                 <div className="flex items-center gap-1 text-primary text-sm font-medium transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                    Apri <ChevronRight className="w-4 h-4" />
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {processedWorkouts.length === 0 && (
         <div className="text-center py-12 text-gray-500 animate-fade-in">
           Nessun allenamento trovato con i filtri attuali.
         </div>
      )}
    </div>
  );
};