import React, { useEffect } from 'react';
import Analyzer from './components/Analyzer';
import Chatbot from './components/Chatbot';
import Vision from './components/Vision';
import FridaGenerator from './components/FridaGenerator';
import { Shield, MessageSquare, Image as ImageIcon, Moon, Sun, Monitor, Terminal } from 'lucide-react';

type Theme = 'light' | 'dark' | 'blackdark';
type Tab = 'analyzer' | 'vision' | 'chatbot' | 'frida';

export default function App() {
  const [theme, setTheme] = React.useState<Theme>('blackdark');
  const [activeTab, setActiveTab] = React.useState<Tab>('analyzer');

  useEffect(() => {
    document.body.className = `theme-${theme}`;
  }, [theme]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans bg-inherit">
      
      {/* ================= MOBILE HEADER ================= */}
      <header className="md:hidden flex items-center justify-between p-4 surface border-b border-inherit sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-purple to-neon-cyan flex items-center justify-center shadow-lg shadow-neon-purple/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-bold text-lg tracking-tight">SecAudit</h1>
        </div>
        
        {/* Mobile Theme Switcher */}
        <div className="flex gap-1 surface border border-inherit rounded-lg p-1">
          <button onClick={() => setTheme('light')} className={`p-1.5 rounded-md transition-colors ${theme === 'light' ? 'bg-black/10' : 'opacity-50'}`}>
            <Sun className="w-4 h-4" />
          </button>
          <button onClick={() => setTheme('dark')} className={`p-1.5 rounded-md transition-colors ${theme === 'dark' ? 'bg-white/10' : 'opacity-50'}`}>
            <Moon className="w-4 h-4" />
          </button>
          <button onClick={() => setTheme('blackdark')} className={`p-1.5 rounded-md transition-colors ${theme === 'blackdark' ? 'bg-white/10 text-neon-cyan' : 'opacity-50'}`}>
            <Monitor className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden md:flex w-64 surface border-r border-inherit flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-inherit">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-purple to-neon-cyan flex items-center justify-center shadow-lg shadow-neon-purple/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-tight">SecAudit</h1>
              <p className="text-xs opacity-60 font-mono">v2.0.0-DEFENSE</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab('analyzer')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
              activeTab === 'analyzer' 
                ? 'bg-neon-purple/10 text-neon-purple border border-neon-purple/20' 
                : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-70 hover:opacity-100'
            }`}
          >
            <Shield className="w-5 h-5" />
            Análise Estática
          </button>
          
          <button
            onClick={() => setActiveTab('vision')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
              activeTab === 'vision' 
                ? 'bg-neon-orange/10 text-neon-orange border border-neon-orange/20' 
                : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-70 hover:opacity-100'
            }`}
          >
            <ImageIcon className="w-5 h-5" />
            Análise Visual
          </button>

          <button
            onClick={() => setActiveTab('frida')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
              activeTab === 'frida' 
                ? 'bg-neon-pink/10 text-neon-pink border border-neon-pink/20' 
                : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-70 hover:opacity-100'
            }`}
          >
            <Terminal className="w-5 h-5" />
            Gerador Frida
          </button>

          <button
            onClick={() => setActiveTab('chatbot')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
              activeTab === 'chatbot' 
                ? 'bg-neon-green/10 text-neon-green border border-neon-green/20' 
                : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-70 hover:opacity-100'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            Assistente IA
          </button>
        </nav>

        <div className="p-4 border-t border-inherit">
          <p className="text-xs font-semibold uppercase tracking-wider opacity-50 mb-3 px-2">Tema</p>
          <div className="flex gap-2">
            <button onClick={() => setTheme('light')} className={`flex-1 p-2 rounded-lg flex justify-center transition-colors ${theme === 'light' ? 'bg-black/10' : 'hover:bg-black/5 dark:hover:bg-white/5'}`} title="Light">
              <Sun className="w-5 h-5" />
            </button>
            <button onClick={() => setTheme('dark')} className={`flex-1 p-2 rounded-lg flex justify-center transition-colors ${theme === 'dark' ? 'bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/5'}`} title="Dark">
              <Moon className="w-5 h-5" />
            </button>
            <button onClick={() => setTheme('blackdark')} className={`flex-1 p-2 rounded-lg flex justify-center transition-colors ${theme === 'blackdark' ? 'bg-white/10 text-neon-cyan' : 'hover:bg-black/5 dark:hover:bg-white/5'}`} title="BlackDark (AMOLED)">
              <Monitor className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      {/* pb-24 no mobile para não ficar escondido atrás da bottom nav */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-24 md:pb-8">
        <div className="max-w-6xl mx-auto h-full">
          {activeTab === 'analyzer' && <Analyzer />}
          {activeTab === 'vision' && <Vision />}
          {activeTab === 'frida' && <FridaGenerator />}
          {activeTab === 'chatbot' && <Chatbot />}
        </div>
      </main>

      {/* ================= MOBILE BOTTOM NAV ================= */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 surface border-t border-inherit flex justify-around items-center p-2 pb-safe z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
        <button
          onClick={() => setActiveTab('analyzer')}
          className={`flex flex-col items-center gap-1 p-2 w-16 transition-all ${
            activeTab === 'analyzer' ? 'text-neon-purple' : 'opacity-50'
          }`}
        >
          <Shield className="w-5 h-5" />
          <span className="text-[9px] font-medium">Análise</span>
        </button>
        
        <button
          onClick={() => setActiveTab('vision')}
          className={`flex flex-col items-center gap-1 p-2 w-16 transition-all ${
            activeTab === 'vision' ? 'text-neon-orange' : 'opacity-50'
          }`}
        >
          <ImageIcon className="w-5 h-5" />
          <span className="text-[9px] font-medium">Visão</span>
        </button>

        <button
          onClick={() => setActiveTab('frida')}
          className={`flex flex-col items-center gap-1 p-2 w-16 transition-all ${
            activeTab === 'frida' ? 'text-neon-pink' : 'opacity-50'
          }`}
        >
          <Terminal className="w-5 h-5" />
          <span className="text-[9px] font-medium">Frida</span>
        </button>

        <button
          onClick={() => setActiveTab('chatbot')}
          className={`flex flex-col items-center gap-1 p-2 w-16 transition-all ${
            activeTab === 'chatbot' ? 'text-neon-green' : 'opacity-50'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-[9px] font-medium">Chat</span>
        </button>
      </nav>

    </div>
  );
}
