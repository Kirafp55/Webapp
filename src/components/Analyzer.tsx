import React, { useState, useRef } from 'react';
import { ai } from '../lib/gemini';
import { ShieldAlert, Loader2, Code2, UploadCloud, FileBox, CheckCircle, X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type InputMode = 'code' | 'file';

export default function Analyzer() {
  const [mode, setMode] = useState<InputMode>('code');
  const [code, setCode] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);

  // File Upload States
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAnalyzeCode = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setAnalysis('');
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: `Você é um Engenheiro de Segurança Android Sênior. Analise o seguinte código (pode ser AndroidManifest.xml, Java, Kotlin ou Smali) em busca de vulnerabilidades de segurança, más práticas, componentes exportados indevidamente ou segredos hardcoded. Responda em Português do Brasil (PT-BR) de forma técnica e direta.
        
        Código:
        ${code}`,
      });
      setAnalysis(response.text || 'Nenhuma análise retornada.');
    } catch (error) {
      console.error(error);
      setAnalysis('Erro ao analisar o código. Verifique o console.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeFile = async (file: File) => {
    setLoading(true);
    setAnalysis('');
    try {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      const ext = file.name.split('.').pop()?.toLowerCase() || 'desconhecido';
      
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: `Você é um Engenheiro de Segurança Sênior e Especialista em Engenharia Reversa. O usuário carregou um arquivo para análise na nossa plataforma web.
        
        Metadados do Arquivo:
        - Nome: ${file.name}
        - Extensão: .${ext}
        - Tamanho: ${fileSizeMB} MB
        - Tipo MIME: ${file.type || 'Desconhecido'}
        
        Como não podemos descompilar ou ler arquivos binários grandes diretamente no navegador do cliente, crie um "Plano de Auditoria e Engenharia Reversa" detalhado para este arquivo específico.
        
        Diretrizes:
        1. Se for um pacote (APK, AAB, ZIP, IPA): Diga quais ferramentas usar (apktool, jadx, etc) e o que procurar (strings, ofuscação, libs nativas). Dê um exemplo de script Frida útil.
        2. Se for uma biblioteca compilada (.so, .dll, ex: libil2cpp.so): Sugira ferramentas de análise estática/dinâmica (Ghidra, IDA Pro, Il2CppDumper) e explique como encontrar offsets de funções importantes (vida, dinheiro, etc).
        3. Se for código-fonte ou texto (.cs, .cpp, .java, .xml, .txt): Explique a importância desse tipo de arquivo no contexto de jogos/apps e quais vulnerabilidades ou lógicas de segurança costumam estar presentes neles.
        
        Responda em Português do Brasil (PT-BR) com formatação Markdown clara e direta.`,
      });
      setAnalysis(response.text || 'Nenhuma análise retornada.');
    } catch (error) {
      console.error(error);
      setAnalysis('Erro ao analisar os metadados do arquivo. Verifique o console.');
    } finally {
      setLoading(false);
    }
  };

  // Processamento robusto de arquivo (agora aceita qualquer formato)
  const processFile = async (file: File) => {
    setFileError(null);
    setSelectedFile(file);
    setIsUploading(true);
    setUploadProgress(0);
    setAnalysis('');

    try {
      // Tenta ler os primeiros 4 bytes para garantir que o arquivo não está corrompido
      // e que o navegador tem permissão real de leitura
      const slice = file.slice(0, 4);
      await slice.arrayBuffer();
    } catch (error) {
      console.error("Erro de leitura do arquivo:", error);
      setFileError("Não foi possível ler o arquivo. Ele pode estar corrompido ou sem permissão.");
      setSelectedFile(null);
      setIsUploading(false);
      return;
    }
    
    // Simula um upload/processamento
    const duration = Math.min(Math.max(file.size / 1000000, 1000), 5000); // Entre 1s e 5s
    const interval = 50;
    const steps = duration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = Math.min((currentStep / steps) * 100, 100);
      setUploadProgress(progress);

      if (currentStep >= steps) {
        clearInterval(timer);
        setIsUploading(false);
        handleAnalyzeFile(file);
      }
    }, interval);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
      e.target.value = ''; // Reseta o input
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setAnalysis('');
    setFileError(null);
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-neon-purple to-neon-cyan bg-clip-text text-transparent">
            Análise Estática (IA)
          </h2>
          <p className="opacity-70 mt-1">Auditoria de código fonte ou planejamento de engenharia reversa de arquivos.</p>
        </div>
        <ShieldAlert className="w-10 h-10 text-neon-purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[500px]">
        {/* Left Panel - Input */}
        <div className="flex flex-col gap-4">
          {/* Mode Toggle */}
          <div className="flex p-1 surface border rounded-xl">
            <button
              onClick={() => setMode('code')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                mode === 'code' ? 'bg-neon-purple text-white shadow-lg shadow-neon-purple/20' : 'opacity-60 hover:opacity-100'
              }`}
            >
              <Code2 className="w-4 h-4" /> Código Fonte
            </button>
            <button
              onClick={() => setMode('file')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                mode === 'file' ? 'bg-neon-cyan text-black shadow-lg shadow-neon-cyan/20' : 'opacity-60 hover:opacity-100'
              }`}
            >
              <FileBox className="w-4 h-4" /> Arquivo (APK, SO, CS...)
            </button>
          </div>

          {/* Input File Oculto (Sem restrição de accept) */}
          <input
            ref={inputRef}
            type="file"
            onChange={handleChange}
            className="hidden"
          />

          <AnimatePresence mode="wait">
            {mode === 'code' ? (
              <motion.div
                key="code-mode"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex flex-col gap-4 flex-1"
              >
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="<manifest xmlns:android=...>\n  <application...>\n..."
                  className="flex-1 surface border rounded-xl p-4 font-mono text-sm resize-none focus:outline-none focus:border-neon-purple transition-colors"
                />
                <button
                  onClick={handleAnalyzeCode}
                  disabled={loading || !code.trim()}
                  className="bg-neon-purple hover:bg-neon-purple/80 text-white font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldAlert className="w-5 h-5" />}
                  {loading ? 'Analisando Proteções...' : 'Auditar Código'}
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="file-mode"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-4 flex-1"
              >
                {fileError && (
                  <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-medium">{fileError}</p>
                    <button onClick={() => setFileError(null)} className="ml-auto hover:bg-red-500/20 p-1 rounded-lg">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {!selectedFile ? (
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                    className={`flex-1 surface border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 text-center cursor-pointer transition-all duration-300 ${
                      dragActive 
                        ? 'border-neon-cyan bg-neon-cyan/5 scale-[1.02]' 
                        : 'border-inherit hover:border-neon-cyan/50 hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-colors ${dragActive ? 'bg-neon-cyan/20 text-neon-cyan' : 'surface border text-inherit opacity-70'}`}>
                      <UploadCloud className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Upload de Arquivo</h3>
                    <p className="opacity-60 text-sm max-w-[280px]">
                      Arraste e solte qualquer arquivo aqui (APK, ZIP, SO, DLL, CS, CPP, etc) ou clique para selecionar.
                    </p>
                  </div>
                ) : (
                  <div className="flex-1 surface border rounded-2xl p-6 flex flex-col justify-center relative overflow-hidden">
                    <button 
                      onClick={clearFile}
                      disabled={isUploading || loading}
                      className="absolute top-4 right-4 p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-xl bg-neon-cyan/20 flex items-center justify-center shrink-0">
                        <FileBox className="w-8 h-8 text-neon-cyan" />
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="font-bold text-lg truncate" title={selectedFile.name}>{selectedFile.name}</h4>
                        <p className="opacity-60 text-sm">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm font-medium">
                        <span className="opacity-70">
                          {isUploading ? 'Lendo e processando...' : 'Processamento concluído'}
                        </span>
                        <span className="text-neon-cyan">{Math.round(uploadProgress)}%</span>
                      </div>
                      <div className="h-3 w-full bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple"
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress}%` }}
                          transition={{ ease: "linear", duration: 0.1 }}
                        />
                      </div>
                    </div>

                    {!isUploading && !loading && (
                      <div className="mt-6 flex items-center gap-2 text-neon-green font-medium bg-neon-green/10 p-3 rounded-lg">
                        <CheckCircle className="w-5 h-5" />
                        Pronto para análise de segurança
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Panel - Report */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-neon-green font-semibold">
            <ShieldAlert className="w-5 h-5" />
            <span>Relatório de Segurança</span>
          </div>
          <div className="flex-1 surface border rounded-xl p-6 overflow-y-auto prose prose-invert max-w-none">
            {analysis ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="whitespace-pre-wrap font-sans"
              >
                {analysis}
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-30 text-center gap-4">
                {loading ? (
                  <>
                    <Loader2 className="w-10 h-10 animate-spin text-neon-green" />
                    <p>Gerando relatório de auditoria...</p>
                  </>
                ) : (
                  <p>O relatório da IA aparecerá aqui após a análise.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
