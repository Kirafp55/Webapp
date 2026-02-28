import React, { useEffect } from 'react';
import Analyzer from './components/Analyzer';
import Chatbot from './components/Chatbot';
import Vision from './components/Vision';
import { Shield, MessageSquare, Image as ImageIcon, Moon, Sun, Monitor } from 'lucide-react';

type Theme = 'light' | 'dark' | 'blackdark';
type Tab = 'analyzer' | 'vision' | 'chatbot';

export default function App() {
  const [theme, setTheme] = React.useState<Theme>('dark');
  const [activeTab, setActiveTab] = React.useState<Tab>('analyzer');

  useEffect(() => {
    document.body.className = `theme-${theme}`;
  }, [theme]);

  return (
    <div className="min-h-screen flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 surface border-r flex flex-col">
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

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto h-full">
          {activeTab === 'analyzer' && <Analyzer />}
          {activeTab === 'vision' && <Vision />}
          {activeTab === 'chatbot' && <Chatbot />}
        </div>
      </main>
    </div>
  );
}
