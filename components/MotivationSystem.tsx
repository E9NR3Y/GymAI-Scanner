import React, { useState, useEffect, useRef } from 'react';
import { Bell, Zap, X, Clock, Settings, BicepsFlexed } from 'lucide-react';
import { getMotivationalQuote } from '../services/geminiService';

export const MotivationSystem: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [frequency, setFrequency] = useState<number>(15); // Minutes
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const timerRef = useRef<number | null>(null);

  // Request notification permissions
  const requestPermission = async () => {
    if (!("Notification" in window)) {
      alert("Il tuo browser non supporta le notifiche desktop.");
      return false;
    }
    
    if (Notification.permission === "granted") return true;
    
    const permission = await Notification.requestPermission();
    return permission === "granted";
  };

  const triggerMotivation = async () => {
    setIsLoading(true);
    try {
      // 1. Get Quote from AI
      const quote = await getMotivationalQuote();
      setLastMessage(quote);

      // 2. Show Browser Notification
      if (Notification.permission === "granted" && document.hidden) {
        new Notification("Coach IA GymScanner", {
          body: quote,
          icon: "/icon.png" // Assuming generic icon or none
        });
      }

      // 3. Play sound effect
      const audio = new Audio('https://actions.google.com/sounds/v1/cartoon/pop.ogg');
      audio.volume = 0.5;
      audio.play().catch(() => {});

    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSystem = async () => {
    if (!isActive) {
      const granted = await requestPermission();
      if (granted) {
        setIsActive(true);
        // Trigger immediately once for feedback
        triggerMotivation();
      } else {
        alert("Devi abilitare le notifiche per usare il Coach IA.");
      }
    } else {
      setIsActive(false);
      setLastMessage(null);
    }
  };

  // Timer Logic
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (isActive) {
      // Convert minutes to ms
      const intervalMs = frequency * 60 * 1000;
      timerRef.current = window.setInterval(triggerMotivation, intervalMs);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, frequency]);

  return (
    <>
      {/* Settings Modal / Popover */}
      {isOpen && (
        <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center sm:justify-end sm:px-6 pointer-events-none">
          <div className="absolute inset-0 bg-black/20 pointer-events-auto" onClick={() => setIsOpen(false)} />
          
          <div className="bg-surface border border-gray-700 p-6 rounded-t-2xl sm:rounded-2xl w-full sm:w-80 shadow-2xl pointer-events-auto mb-0 sm:mb-24 animate-slide-up relative">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="bg-primary/20 p-2 rounded-lg">
                <BicepsFlexed className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-white">Coach IA</h3>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-400 mb-4">
                  L'IA ti invierà messaggi motivazionali mentre ti alleni.
                </p>
                
                <button
                  onClick={toggleSystem}
                  className={`
                    w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all
                    ${isActive 
                      ? 'bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20' 
                      : 'bg-primary text-dark hover:bg-primary/90 shadow-lg shadow-primary/20'}
                  `}
                >
                  {isActive ? "Disattiva Coach" : "Attiva Coach IA"}
                </button>
              </div>

              {isActive && (
                <div className="animate-fade-in">
                  <label className="text-xs text-gray-500 uppercase font-bold mb-2 block flex items-center gap-2">
                    <Clock className="w-3 h-3" /> Frequenza Notifiche
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[15, 30, 45].map((min) => (
                      <button
                        key={min}
                        onClick={() => setFrequency(min)}
                        className={`
                          py-2 rounded-lg text-sm font-medium border transition-colors
                          ${frequency === min 
                            ? 'bg-primary text-dark border-primary' 
                            : 'bg-dark border-gray-600 text-gray-400 hover:border-gray-400'}
                        `}
                      >
                        {min} min
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button (Always Visible) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          fixed bottom-6 right-6 z-[80] p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110
          ${isActive ? 'bg-primary text-dark shadow-[0_0_20px_rgba(var(--color-primary),0.4)] animate-pulse-slow' : 'bg-gray-700 text-white hover:bg-gray-600'}
        `}
      >
        <Zap className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} />
        {isActive && (
           <span className="absolute -top-1 -right-1 flex h-3 w-3">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
             <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
           </span>
        )}
      </button>

      {/* In-App Toast Message */}
      {lastMessage && (
        <div className="fixed bottom-24 right-6 left-6 sm:left-auto sm:w-96 z-[80] bg-surface/90 backdrop-blur-md border-l-4 border-primary text-white p-4 rounded-lg shadow-2xl animate-slide-up">
           <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                 <h4 className="text-primary font-bold text-sm uppercase mb-1 flex items-center gap-2">
                   <BicepsFlexed className="w-4 h-4" /> Coach IA dice:
                 </h4>
                 <p className="font-medium italic text-lg leading-tight">"{lastMessage}"</p>
              </div>
              <button onClick={() => setLastMessage(null)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
           </div>
        </div>
      )}
    </>
  );
};