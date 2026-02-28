import React, { useState } from 'react';
import { ai } from '../lib/gemini';
import { Terminal, Loader2, Copy, CheckCircle, Code2, ShieldAlert, Smartphone } from 'lucide-react';
import { motion } from 'motion/react';

type HookType = 'ssl_pinning' | 'root_bypass' | 'emulator_bypass' | 'custom_hook';

export default function FridaGenerator() {
  const [packageName, setPackageName] = useState('');
  const [hookType, setHookType] = useState<HookType>('root_bypass');
  const [customClass, setCustomClass] = useState('');
  const [customMethod, setCustomMethod] = useState('');
  const [generatedScript, setGeneratedScript] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setGeneratedScript('');
    setCopied(false);

    let objective = '';
    switch (hookType) {
      case 'ssl_pinning':
        objective = 'Fazer bypass de SSL Pinning (OkHttp3, TrustManager, etc) para interceptar tráfego HTTP/HTTPS.';
        break;
      case 'root_bypass':
        objective = 'Fazer bypass de detecção de Root (RootBeer, verificação de binários su, test-keys, etc).';
        break;
      case 'emulator_bypass':
        objective = 'Fazer bypass de detecção de Emulador (verificação de build props, qemu, bluestacks, etc).';
        break;
      case 'custom_hook':
        objective = `Fazer um hook customizado na classe '${customClass}' e interceptar o método '${customMethod}'. O script deve logar os argumentos originais, permitir a modificação do retorno (ex: retornar true ou um valor alto) e chamar o método original.`;
        break;
    }

    const prompt = `Você é um especialista em Engenharia Reversa Android e Frida.
Crie um script Frida (JavaScript) focado no aplicativo alvo: "${packageName || 'com.target.app'}".
Objetivo do script: ${objective}

Regras:
1. Retorne APENAS o código JavaScript válido, pronto para ser injetado com 'frida -U -f ${packageName || 'com.target.app'} -l script.js'.
2. Inclua comentários curtos e explicativos no código em Português (PT-BR).
3. Use blocos Java.perform(function() { ... }).
4. Formate a resposta dentro de um bloco de código markdown (\`\`\`javascript ... \`\`\`).`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
      });
      
      // Extrai apenas o código do bloco markdown, se houver
      const text = response.text || '';
      const match = text.match(/```(?:javascript|js)?\n([\s\S]*?)```/);
      setGeneratedScript(match ? match[1].trim() : text.trim());
    } catch (error) {
      console.error(error);
      setGeneratedScript('// Erro ao gerar o script. Verifique sua conexão ou tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!generatedScript) return;
    navigator.clipboard.writeText(generatedScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full gap-4 md:gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-neon-pink to-neon-purple bg-clip-text text-transparent flex items-center gap-2">
            <Terminal className="w-6 h-6 md:w-8 md:h-8 text-neon-pink md:hidden" />
            Gerador Frida
          </h2>
          <p className="opacity-70 text-sm md:text-base mt-1">Crie scripts de injeção dinâmica para bypass e hooks.</p>
        </div>
        <Terminal className="hidden md:block w-10 h-10 text-neon-pink" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 flex-1">
        {/* Left Panel - Configurações */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="surface border rounded-2xl p-4 md:p-6 flex flex-col gap-4">
            
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider opacity-70 mb-2">Pacote do App (Opcional)</label>
              <input
                type="text"
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
                placeholder="ex: com.jogo.teste"
                className="w-full surface border rounded-xl px-4 py-3 focus:outline-none focus:border-neon-pink transition-colors text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider opacity-70 mb-2">Tipo de Injeção</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => setHookType('root_bypass')}
                  className={`p-3 rounded-xl border text-sm font-medium flex items-center gap-2 transition-all ${
                    hookType === 'root_bypass' ? 'bg-neon-pink/10 border-neon-pink text-neon-pink' : 'border-inherit hover:bg-black/5 dark:hover:bg-white/5 opacity-70'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4" /> Root Bypass
                </button>
                <button
                  onClick={() => setHookType('ssl_pinning')}
                  className={`p-3 rounded-xl border text-sm font-medium flex items-center gap-2 transition-all ${
                    hookType === 'ssl_pinning' ? 'bg-neon-pink/10 border-neon-pink text-neon-pink' : 'border-inherit hover:bg-black/5 dark:hover:bg-white/5 opacity-70'
                  }`}
                >
                  <Code2 className="w-4 h-4" /> SSL Pinning
                </button>
                <button
                  onClick={() => setHookType('emulator_bypass')}
                  className={`p-3 rounded-xl border text-sm font-medium flex items-center gap-2 transition-all ${
                    hookType === 'emulator_bypass' ? 'bg-neon-pink/10 border-neon-pink text-neon-pink' : 'border-inherit hover:bg-black/5 dark:hover:bg-white/5 opacity-70'
                  }`}
                >
                  <Smartphone className="w-4 h-4" /> Emulador Bypass
                </button>
                <button
                  onClick={() => setHookType('custom_hook')}
                  className={`p-3 rounded-xl border text-sm font-medium flex items-center gap-2 transition-all ${
                    hookType === 'custom_hook' ? 'bg-neon-pink/10 border-neon-pink text-neon-pink' : 'border-inherit hover:bg-black/5 dark:hover:bg-white/5 opacity-70'
                  }`}
                >
                  <Terminal className="w-4 h-4" /> Hook Customizado
                </button>
              </div>
            </div>

            {hookType === 'custom_hook' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex flex-col gap-4 pt-2 border-t border-inherit"
              >
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider opacity-70 mb-2">Classe Alvo</label>
                  <input
                    type="text"
                    value={customClass}
                    onChange={(e) => setCustomClass(e.target.value)}
                    placeholder="ex: com.jogo.teste.PlayerManager"
                    className="w-full surface border rounded-xl px-4 py-3 focus:outline-none focus:border-neon-pink transition-colors text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider opacity-70 mb-2">Método Alvo</label>
                  <input
                    type="text"
                    value={customMethod}
                    onChange={(e) => setCustomMethod(e.target.value)}
                    placeholder="ex: getCoins"
                    className="w-full surface border rounded-xl px-4 py-3 focus:outline-none focus:border-neon-pink transition-colors text-sm font-mono"
                  />
                </div>
              </motion.div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading || (hookType === 'custom_hook' && (!customClass || !customMethod))}
              className="mt-2 bg-neon-pink hover:bg-neon-pink/80 text-white font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 w-full"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Terminal className="w-5 h-5" />}
              {loading ? 'Gerando Script...' : 'Gerar Script Frida'}
            </button>
          </div>
        </div>

        {/* Right Panel - Código Gerado */}
        <div className="lg:col-span-7 flex flex-col gap-4 mt-4 lg:mt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-neon-pink font-semibold">
              <Code2 className="w-5 h-5" />
              <span>Script JavaScript</span>
            </div>
            {generatedScript && (
              <button 
                onClick={copyToClipboard}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-black/10 dark:bg-white/10 hover:bg-neon-pink hover:text-white px-3 py-1.5 rounded-lg transition-colors"
              >
                {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
            )}
          </div>
          
          <div className="flex-1 surface border rounded-xl overflow-hidden flex flex-col min-h-[300px] relative group">
            {generatedScript ? (
              <textarea
                readOnly
                value={generatedScript}
                className="flex-1 w-full bg-transparent p-4 md:p-6 font-mono text-sm md:text-base resize-none focus:outline-none text-neon-pink/90"
                spellCheck="false"
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-30 text-center gap-4 py-10 px-4">
                {loading ? (
                  <>
                    <Loader2 className="w-8 h-8 md:w-10 md:h-10 animate-spin text-neon-pink" />
                    <p className="text-sm md:text-base">Escrevendo código de injeção...</p>
                  </>
                ) : (
                  <>
                    <Terminal className="w-10 h-10 md:w-12 md:h-12 text-neon-pink" />
                    <p className="text-sm md:text-base">Configure as opções ao lado e clique em Gerar para criar seu script Frida.</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
