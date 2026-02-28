import React, { useState, useRef, useEffect } from 'react';
import { ai } from '../lib/gemini';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Olá! Sou seu Assistente de Segurança Android. Como posso ajudar a proteger seu aplicativo hoje? Posso ajudar com ofuscação, detecção de root, ou scripts Frida defensivos.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Inicializa o chat fora do render
  const chatRef = useRef<any>(null);

  useEffect(() => {
    chatRef.current = ai.chats.create({
      model: 'gemini-3.1-pro-preview',
      config: {
        systemInstruction: 'Você é um especialista em segurança mobile (Android). Ajude o usuário a proteger seus aplicativos, entender engenharia reversa defensiva, criar scripts Frida para testes de penetração autorizados e implementar proteções como R8, SafetyNet/Play Integrity. Responda sempre em Português do Brasil.',
      }
    });
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !chatRef.current) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const response = await chatRef.current.sendMessage({ message: userMsg });
      setMessages(prev => [...prev, { role: 'model', text: response.text }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: 'Erro de comunicação com a IA.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-neon-green to-neon-cyan bg-clip-text text-transparent">
          Assistente de Segurança (IA)
        </h2>
        <p className="opacity-70 mt-1">Tire dúvidas sobre proteções, bypasses teóricos e engenharia reversa.</p>
      </div>

      <div className="flex-1 surface border rounded-2xl flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={idx}
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-neon-purple' : 'bg-neon-green'}`}>
                {msg.role === 'user' ? <User className="w-6 h-6 text-white" /> : <Bot className="w-6 h-6 text-black" />}
              </div>
              <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-neon-purple/20 border border-neon-purple/30' : 'surface border'}`}>
                <p className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{msg.text}</p>
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-neon-green flex items-center justify-center shrink-0">
                <Bot className="w-6 h-6 text-black" />
              </div>
              <div className="surface border p-4 rounded-2xl flex items-center">
                <Loader2 className="w-5 h-5 animate-spin text-neon-green" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-inherit bg-inherit">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ex: Como implemento SSL Pinning corretamente no OkHttp?"
              className="flex-1 surface border rounded-xl px-4 py-3 focus:outline-none focus:border-neon-green transition-colors"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="bg-neon-green hover:bg-neon-green/80 text-black font-bold p-3 rounded-xl transition-all disabled:opacity-50"
            >
              <Send className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
