import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Loader2, Sparkles, User, HelpCircle } from 'lucide-react';
import { getChatResponse } from '../services/geminiService';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const AIChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ 
        role: m.role === 'user' ? 'user' : 'model', 
        parts: m.content 
      }));
      const response = await getChatResponse(userMessage, history);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Errore durante la conversazione. Riprova." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 z-[80] p-4 rounded-full bg-secondary text-white shadow-2xl hover:scale-110 active:scale-95 transition-all"
        title="Assistente IA"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 left-6 right-6 sm:left-6 sm:right-auto sm:w-96 z-[80] bg-surface border border-gray-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up h-[500px] max-h-[70vh]">
          {/* Header */}
          <div className="bg-dark p-4 border-b border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-secondary/20 p-1.5 rounded-lg">
                <Bot className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">GymAI Assistant</h3>
                <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Online</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-dark/30">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 text-gray-500">
                <HelpCircle className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-sm">Ciao! Sono il tuo assistente GymAI. Chiedimi spiegazioni sugli esercizi o consigli per il tuo allenamento.</p>
              </div>
            )}
            
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-2 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'}`}>
                    {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                    m.role === 'user' 
                      ? 'bg-primary text-dark font-medium rounded-tr-none' 
                      : 'bg-gray-800 text-gray-100 rounded-tl-none border border-gray-700'
                  }`}>
                    {m.content}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 p-3 rounded-2xl rounded-tl-none border border-gray-700">
                  <Loader2 className="w-4 h-4 text-secondary animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-4 bg-dark border-t border-gray-700 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Fai una domanda..."
              className="flex-1 bg-surface border border-gray-700 rounded-xl px-4 py-2 text-sm text-white focus:border-secondary outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2 bg-secondary text-white rounded-xl hover:bg-secondary/90 disabled:opacity-50 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};