import React, { useState } from 'react';
import { WorkoutPlan } from '../types';
import { ChevronLeft, ChevronRight, Circle } from 'lucide-react';

interface CalendarViewProps {
  workouts: WorkoutPlan[];
  onSelectWorkout: (workout: WorkoutPlan) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ workouts, onSelectWorkout }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday
  
  // Adjust so Monday is 0 (optional, but standard in Europe)
  // Let's keep Sunday as 0 for simplicity or adjust:
  // JS getDay(): 0 Sun, 1 Mon ... 6 Sat. 
  // Visual grid: Mon Tue Wed Thu Fri Sat Sun
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const monthNames = [
    "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
    "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
  ];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getWorkoutsForDay = (day: number) => {
    return workouts.filter(w => {
      const d = new Date(w.dateCreated);
      return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
    });
  };

  return (
    <div className="animate-fade-in bg-surface border border-gray-700 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-white capitalize">
          {monthNames[month]} <span className="text-primary">{year}</span>
        </h3>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 bg-dark hover:bg-gray-700 rounded-full transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-300" />
          </button>
          <button onClick={nextMonth} className="p-2 bg-dark hover:bg-gray-700 rounded-full transition-colors">
            <ChevronRight className="w-5 h-5 text-gray-300" />
          </button>
        </div>
      </div>

      {/* Weekdays Header */}
      <div className="grid grid-cols-7 mb-4 text-center">
        {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map(day => (
          <div key={day} className="text-gray-500 text-sm font-semibold uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Empty cells for previous month */}
        {Array.from({ length: adjustedFirstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="h-24 rounded-xl bg-dark/30 border border-transparent"></div>
        ))}

        {/* Days */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dayWorkouts = getWorkoutsForDay(day);
          const isToday = 
            day === new Date().getDate() && 
            month === new Date().getMonth() && 
            year === new Date().getFullYear();

          return (
            <div 
              key={day} 
              className={`
                h-24 rounded-xl p-2 border transition-all flex flex-col justify-between overflow-hidden
                ${isToday ? 'bg-primary/5 border-primary/50' : 'bg-dark border-gray-700 hover:border-gray-500'}
                ${dayWorkouts.length > 0 ? 'cursor-pointer hover:bg-gray-700' : ''}
              `}
              onClick={() => {
                if(dayWorkouts.length === 1) onSelectWorkout(dayWorkouts[0]);
                // If multiple, ideally open a modal, but for now select the first or ignore if logic needed
                else if (dayWorkouts.length > 1) onSelectWorkout(dayWorkouts[0]);
              }}
            >
              <div className="flex justify-between items-start">
                 <span className={`text-sm font-medium ${isToday ? 'text-primary' : 'text-gray-400'}`}>
                   {day}
                 </span>
                 {dayWorkouts.length > 0 && (
                   <span className="text-xs bg-primary text-dark font-bold px-1.5 rounded-full">
                     {dayWorkouts.length}
                   </span>
                 )}
              </div>
              
              <div className="space-y-1">
                {dayWorkouts.slice(0, 2).map((w, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <Circle className="w-2 h-2 fill-primary text-primary" />
                    <span className="text-[10px] text-gray-300 truncate leading-tight">{w.title}</span>
                  </div>
                ))}
                {dayWorkouts.length > 2 && (
                  <div className="text-[10px] text-gray-500 pl-3">+ altri {dayWorkouts.length - 2}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};