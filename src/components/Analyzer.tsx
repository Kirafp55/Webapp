import React, { useState, useRef, useEffect } from 'react';
import { ai } from '../lib/gemini';
import { ShieldAlert, Loader2, Code2, UploadCloud, FileBox, CheckCircle, X, AlertTriangle, FileCode, Save, Play, Download, Trash2, FileText, Binary } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism-tomorrow.css';

// Define Smali grammar for Prism
Prism.languages.smali = {
  'comment': /#.*/,
  'string': {
    pattern: /"(?:[^\r\n\\"]|\\.)*"/,
    greedy: true
  },
  'class-name': {
    pattern: /(?:L[^\s;]+;)/,
    alias: 'class'
  },
  'directive': {
    pattern: /\.[a-z]+/,
    alias: 'keyword'
  },
  'register': {
    pattern: /\b[vp]\d+\b/,
    alias: 'variable'
  },
  'number': /\b0x[a-fA-F0-9]+\b|\b\d+\b/,
  'punctuation': /[{}[\];(),.:]/
};

type InputMode = 'code' | 'file';

interface VirtualFile {
  path: string;
  content: string;
  originalContent: string;
  language: string;
}

const MOCK_DECOMPILED_FILES: VirtualFile[] = [
  {
    path: 'java/com/target/app/Constants.java',
    language: 'java',
    originalContent: 'package com.target.app;\n\npublic class Constants {\n    // TODO: Mudar para true para ativar VIP\n    public static final boolean IS_PREMIUM = false;\n    public static final int STARTING_COINS = 100;\n    public static final String API_URL = "https://api.targetapp.com/v1";\n}',
    content: 'package com.target.app;\n\npublic class Constants {\n    // TODO: Mudar para true para ativar VIP\n    public static final boolean IS_PREMIUM = false;\n    public static final int STARTING_COINS = 100;\n    public static final String API_URL = "https://api.targetapp.com/v1";\n}'
  },
  {
    path: 'smali/com/target/app/MainActivity.smali',
    language: 'smali',
    originalContent: '.class public Lcom/target/app/MainActivity;\n.super Landroid/app/Activity;\n\n.method protected onCreate(Landroid/os/Bundle;)V\n    .registers 2\n    invoke-super {p0, p1}, Landroid/app/Activity;->onCreate(Landroid/os/Bundle;)V\n    \n    # Verifica licença\n    invoke-direct {p0}, Lcom/target/app/MainActivity;->checkLicense()Z\n    move-result v0\n    if-eqz v0, :cond_0\n    \n    return-void\n    \n    :cond_0\n    # Fecha o app se falhar\n    invoke-virtual {p0}, Lcom/target/app/MainActivity;->finish()V\n    return-void\n.end method',
    content: '.class public Lcom/target/app/MainActivity;\n.super Landroid/app/Activity;\n\n.method protected onCreate(Landroid/os/Bundle;)V\n    .registers 2\n    invoke-super {p0, p1}, Landroid/app/Activity;->onCreate(Landroid/os/Bundle;)V\n    \n    # Verifica licença\n    invoke-direct {p0}, Lcom/target/app/MainActivity;->checkLicense()Z\n    move-result v0\n    if-eqz v0, :cond_0\n    \n    return-void\n    \n    :cond_0\n    # Fecha o app se falhar\n    invoke-virtual {p0}, Lcom/target/app/MainActivity;->finish()V\n    return-void\n.end method'
  },
  {
    path: 'res/values/strings.xml',
    language: 'xml',
    originalContent: '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <string name="app_name">Target App</string>\n    <string name="error_license">Licença inválida!</string>\n    <string name="secret_key">AIzaSyB-fake-key-12345</string>\n</resources>',
    content: '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <string name="app_name">Target App</string>\n    <string name="error_license">Licença inválida!</string>\n    <string name="secret_key">AIzaSyB-fake-key-12345</string>\n</resources>'
  }
];

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

  // Editor States
  const [virtualFiles, setVirtualFiles] = useState<VirtualFile[]>([]);
  const [activeFileIndex, setActiveFileIndex] = useState<number>(0);
  const [isPatching, setIsPatching] = useState(false);
  const [patchSuccess, setPatchSuccess] = useState(false);
  const [hexData, setHexData] = useState<Uint8Array | null>(null);

  useEffect(() => {
    const savedAnalysis = localStorage.getItem('secAudit_lastAnalysis');
    if (savedAnalysis) {
      setAnalysis(savedAnalysis);
    }
  }, []);

  const updateAnalysis = (text: string) => {
    setAnalysis(text);
    if (text) {
      localStorage.setItem('secAudit_lastAnalysis', text);
    } else {
      localStorage.removeItem('secAudit_lastAnalysis');
    }
  };

  const handleAnalyzeCode = async () => {
    if (!code.trim()) return;
    setLoading(true);
    updateAnalysis('');
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: `Você é um Engenheiro de Segurança Android Sênior. Analise o seguinte código (pode ser AndroidManifest.xml, Java, Kotlin ou Smali) em busca de vulnerabilidades de segurança, más práticas, componentes exportados indevidamente ou segredos hardcoded. Responda em Português do Brasil (PT-BR) de forma técnica e direta.
        
        Código:
        ${code}`,
      });
      updateAnalysis(response.text || 'Nenhuma análise retornada.');
    } catch (error) {
      console.error(error);
      updateAnalysis('Erro ao analisar o código. Verifique o console.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeFile = async (file: File) => {
    setLoading(true);
    updateAnalysis('');
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
        
        Crie um "Plano de Auditoria e Engenharia Reversa" detalhado para este arquivo específico.
        Responda em Português do Brasil (PT-BR) com formatação Markdown clara e direta.`,
      });
      updateAnalysis(response.text || 'Nenhuma análise retornada.');
      
      // Se for APK/ZIP, carrega os arquivos virtuais para o editor
      if (['apk', 'aab', 'zip'].includes(ext)) {
        // Deep copy para resetar as edições anteriores
        setVirtualFiles(JSON.parse(JSON.stringify(MOCK_DECOMPILED_FILES)));
        setActiveFileIndex(0);
        setPatchSuccess(false);
        setHexData(null);
      } else if (['so', 'dll', 'dex', 'bin', 'dat', 'exe', 'o', 'elf'].includes(ext)) {
        setVirtualFiles([]);
        setPatchSuccess(false);
        const reader = new FileReader();
        reader.onload = (e) => {
          const buffer = e.target?.result as ArrayBuffer;
          setHexData(new Uint8Array(buffer));
        };
        reader.readAsArrayBuffer(file);
      } else {
        // Para arquivos de texto (js, txt, json, etc)
        setPatchSuccess(false);
        setHexData(null);
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          setVirtualFiles([{
            path: file.name,
            content: content,
            originalContent: content
          }]);
          setActiveFileIndex(0);
        };
        reader.readAsText(file);
      }
    } catch (error) {
      console.error(error);
      updateAnalysis('Erro ao analisar os metadados do arquivo. Verifique o console.');
    } finally {
      setLoading(false);
    }
  };

  const processFile = async (file: File) => {
    setFileError(null);
    setSelectedFile(file);
    setIsUploading(true);
    setUploadProgress(0);
    updateAnalysis('');
    setVirtualFiles([]);

    try {
      const slice = file.slice(0, 4);
      await slice.arrayBuffer();
    } catch (error) {
      console.error("Erro de leitura do arquivo:", error);
      setFileError("Não foi possível ler o arquivo. Ele pode estar corrompido ou sem permissão.");
      setSelectedFile(null);
      setIsUploading(false);
      return;
    }
    
    const duration = Math.min(Math.max(file.size / 1000000, 1000), 5000);
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

  const handleApplyHack = async () => {
    setIsPatching(true);
    setPatchSuccess(false);
    
    // Simula recompilação
    setTimeout(async () => {
      try {
        const activeFile = virtualFiles[activeFileIndex];
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-pro-preview',
          contents: `Atue como um compilador apktool. O usuário modificou o seguinte arquivo: ${activeFile.path}.
          
          Código Original:
          ${activeFile.originalContent}
          
          Código Modificado:
          ${activeFile.content}
          
          Gere um relatório de patch curto explicando o que essa modificação faz no contexto de um hack de jogo/app (ex: "Bypass de licença ativado", "Moedas infinitas ativadas"). Responda em PT-BR.`,
        });
        
        updateAnalysis(`### 🛠️ Patch Aplicado com Sucesso!\n\n**Processo:**\n1. \`apktool b\` (Recompilando recursos e classes)\n2. \`apksigner\` (Assinando com chave de debug)\n\n**Relatório da Modificação:**\n${response.text}`);
        setPatchSuccess(true);
      } catch (error) {
        console.error(error);
      } finally {
        setIsPatching(false);
      }
    }, 2500);
  };

  const handleEditorChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newFiles = [...virtualFiles];
    newFiles[activeFileIndex].content = e.target.value;
    setVirtualFiles(newFiles);
  };

  const handleDownloadMod = () => {
    if (!selectedFile) return;
    
    // Cria um arquivo simulado para download
    const content = `[SecAudit v2.0.0-DEFENSE] Modded APK Simulation\nOriginal File: ${selectedFile.name}\n\nEste é um arquivo simulado gerado pelo navegador.\nEm um ambiente desktop real, este seria o seu APK assinado e pronto para instalar.`;
    const blob = new Blob([content], { type: 'application/vnd.android.package-archive' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    // Adiciona _mod no final do nome do arquivo
    a.download = selectedFile.name.replace(/\.(apk|aab|zip)$/i, '_mod.apk');
    document.body.appendChild(a);
    a.click();
    
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearReport = () => {
    updateAnalysis('');
    setPatchSuccess(false);
    setHexData(null);
  };

  const handleDownloadReport = () => {
    if (!analysis) return;
    const blob = new Blob([analysis], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'SecAudit_Relatorio.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
      e.target.value = '';
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    updateAnalysis('');
    setFileError(null);
    setVirtualFiles([]);
    setHexData(null);
  };

  return (
    <div className="flex flex-col h-full gap-4 md:gap-6">
      {/* Header Responsivo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-neon-purple to-neon-cyan bg-clip-text text-transparent flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 md:w-8 md:h-8 text-neon-purple md:hidden" />
            Análise Estática
          </h2>
          <p className="opacity-70 text-sm md:text-base mt-1">Auditoria de código ou planejamento de engenharia reversa.</p>
        </div>
        <ShieldAlert className="hidden md:block w-10 h-10 text-neon-purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 flex-1">
        {/* Left Panel - Input / Editor */}
        <div className="flex flex-col gap-4">
          {/* Mode Toggle */}
          <div className="flex p-1 surface border rounded-xl">
            <button
              onClick={() => setMode('code')}
              className={`flex-1 py-2 md:py-3 px-2 rounded-lg font-medium text-xs md:text-sm transition-all flex items-center justify-center gap-1.5 md:gap-2 ${
                mode === 'code' ? 'bg-neon-purple text-white shadow-lg shadow-neon-purple/20' : 'opacity-60 hover:opacity-100'
              }`}
            >
              <Code2 className="w-4 h-4 shrink-0" /> 
              <span className="truncate">Código Fonte</span>
            </button>
            <button
              onClick={() => setMode('file')}
              className={`flex-1 py-2 md:py-3 px-2 rounded-lg font-medium text-xs md:text-sm transition-all flex items-center justify-center gap-1.5 md:gap-2 ${
                mode === 'file' ? 'bg-neon-cyan text-black shadow-lg shadow-neon-cyan/20' : 'opacity-60 hover:opacity-100'
              }`}
            >
              <FileBox className="w-4 h-4 shrink-0" /> 
              <span className="truncate">Upload de Arquivo</span>
            </button>
          </div>

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
                className="flex flex-col gap-4 flex-1 min-h-[300px]"
              >
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="<manifest xmlns:android=...>\n  <application...>\n..."
                  className="flex-1 surface border rounded-xl p-4 font-mono text-sm resize-none focus:outline-none focus:border-neon-purple transition-colors min-h-[200px]"
                />
                <button
                  onClick={handleAnalyzeCode}
                  disabled={loading || !code.trim()}
                  className="bg-neon-purple hover:bg-neon-purple/80 text-white font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldAlert className="w-5 h-5" />}
                  {loading ? 'Analisando...' : 'Auditar Código'}
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="file-mode"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-4 flex-1 min-h-[300px]"
              >
                {fileError && (
                  <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 md:p-4 rounded-xl flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <p className="text-xs md:text-sm font-medium">{fileError}</p>
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
                    className={`flex-1 surface border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 md:p-8 text-center cursor-pointer transition-all duration-300 min-h-[200px] ${
                      dragActive 
                        ? 'border-neon-cyan bg-neon-cyan/5 scale-[1.02]' 
                        : 'border-inherit hover:border-neon-cyan/50 hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mb-4 transition-colors ${dragActive ? 'bg-neon-cyan/20 text-neon-cyan' : 'surface border text-inherit opacity-70'}`}>
                      <UploadCloud className="w-8 h-8 md:w-10 md:h-10" />
                    </div>
                    <h3 className="text-lg md:text-xl font-bold mb-2">Upload de Arquivo</h3>
                    <p className="opacity-60 text-xs md:text-sm max-w-[280px]">
                      Toque para selecionar ou arraste um arquivo (APK, ZIP, SO, CS, etc).
                    </p>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col gap-4">
                    {/* File Info Header */}
                    <div className="surface border rounded-2xl p-4 flex items-center justify-between relative overflow-hidden">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-neon-cyan/20 flex items-center justify-center shrink-0">
                          <FileBox className="w-5 h-5 text-neon-cyan" />
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="font-bold text-sm md:text-base truncate max-w-[150px] md:max-w-[200px]" title={selectedFile.name}>{selectedFile.name}</h4>
                          <p className="opacity-60 text-xs">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <button 
                        onClick={clearFile}
                        disabled={isUploading || loading || isPatching}
                        className="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
                      >
                        <X className="w-5 h-5" />
                      </button>
                      
                      {isUploading && (
                        <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-neon-cyan to-neon-purple" style={{ width: `${uploadProgress}%`, transition: 'width 0.1s linear' }} />
                      )}
                    </div>

                    {/* Editor Section (Only shows if virtual files exist) */}
                    {virtualFiles.length > 0 && !isUploading && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex-1 flex flex-col surface border rounded-2xl overflow-hidden"
                      >
                        {/* File Tabs */}
                        <div className="flex overflow-x-auto border-b border-inherit bg-black/5 dark:bg-white/5 scrollbar-hide">
                          {virtualFiles.map((vf, idx) => (
                            <button
                              key={idx}
                              onClick={() => setActiveFileIndex(idx)}
                              className={`px-4 py-3 text-xs md:text-sm font-medium whitespace-nowrap flex items-center gap-2 border-b-2 transition-colors ${
                                activeFileIndex === idx 
                                  ? 'border-neon-cyan text-neon-cyan bg-neon-cyan/5' 
                                  : 'border-transparent opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'
                              }`}
                            >
                              <FileCode className="w-4 h-4" />
                              {vf.path.split('/').pop()}
                            </button>
                          ))}
                        </div>
                        
                        {/* Textarea Editor -> React Simple Code Editor */}
                        <div className="flex-1 relative group overflow-auto bg-[#1d1f21]">
                          <Editor
                            value={virtualFiles[activeFileIndex].content}
                            onValueChange={(code) => {
                              const newFiles = [...virtualFiles];
                              newFiles[activeFileIndex].content = code;
                              setVirtualFiles(newFiles);
                            }}
                            highlight={(code) => {
                              const ext = virtualFiles[activeFileIndex].path.split('.').pop() || '';
                              let lang = Prism.languages.clike;
                              if (ext === 'java') lang = Prism.languages.java;
                              else if (ext === 'xml') lang = Prism.languages.markup;
                              else if (ext === 'js' || ext === 'javascript') lang = Prism.languages.javascript;
                              else if (ext === 'smali' && Prism.languages.smali) lang = Prism.languages.smali;
                              
                              // Fallback seguro caso a linguagem não esteja carregada
                              if (!lang) lang = Prism.languages.clike || Prism.languages.javascript;
                              
                              try {
                                return Prism.highlight(code, lang, ext);
                              } catch (e) {
                                return code; // fallback sem highlight se der erro
                              }
                            }}
                            padding={16}
                            style={{
                              fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                              fontSize: 14,
                              minHeight: '250px',
                            }}
                            className="w-full h-full min-h-[250px] focus:outline-none"
                            textareaClassName="focus:outline-none"
                          />
                        </div>

                        {/* Action Bar */}
                        <div className="p-3 border-t border-inherit bg-black/5 dark:bg-white/5 flex justify-end gap-2">
                          <button
                            onClick={handleApplyHack}
                            disabled={isPatching || loading}
                            className="bg-neon-cyan hover:bg-neon-cyan/80 text-black font-bold py-2 px-4 rounded-lg transition-all disabled:opacity-50 flex items-center gap-2 text-sm"
                          >
                            {isPatching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                            {isPatching ? 'Recompilando...' : 'Aplicar Hack'}
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* Hex Viewer Section (Only shows if hexData exists) */}
                    {hexData && !isUploading && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex-1 flex flex-col surface border rounded-2xl overflow-hidden min-h-[300px]"
                      >
                        <div className="flex items-center px-4 py-3 bg-black/5 dark:bg-white/5 border-b border-inherit">
                          <div className="flex items-center gap-2 text-neon-green font-mono text-xs md:text-sm">
                            <Binary className="w-4 h-4" />
                            <span>Hex Viewer: {selectedFile.name} (Primeiros 4KB)</span>
                          </div>
                        </div>
                        <div className="flex-1 overflow-auto p-4 font-mono text-[10px] md:text-xs text-gray-400 leading-relaxed whitespace-pre bg-[#0a0a0a]">
                          {(() => {
                            const MAX_BYTES = 4096;
                            const slice = hexData.slice(0, MAX_BYTES);
                            const rows = [];
                            for (let i = 0; i < slice.length; i += 16) {
                              const chunk = slice.slice(i, i + 16);
                              const offset = i.toString(16).padStart(8, '0');
                              
                              let hexPart = '';
                              let asciiPart = '';
                              
                              for (let j = 0; j < 16; j++) {
                                if (j < chunk.length) {
                                  const byte = chunk[j];
                                  hexPart += byte.toString(16).padStart(2, '0').toUpperCase() + ' ';
                                  asciiPart += (byte >= 32 && byte <= 126) ? String.fromCharCode(byte) : '.';
                                } else {
                                  hexPart += '   ';
                                  asciiPart += ' ';
                                }
                              }
                              
                              rows.push(
                                <div key={i} className="flex hover:bg-white/5 px-2 rounded w-max">
                                  <span className="text-gray-500 mr-4 select-none">{offset}</span>
                                  <span className="text-neon-green/80 mr-4 w-[47ch]">{hexPart}</span>
                                  <span className="text-gray-300">{asciiPart}</span>
                                </div>
                              );
                            }
                            return rows;
                          })()}
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Panel - Report */}
        <div className="flex flex-col gap-4 mt-4 lg:mt-0">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-neon-green font-semibold">
              <ShieldAlert className="w-5 h-5" />
              <span>Relatório</span>
            </div>
            <div className="flex items-center gap-2">
              {patchSuccess && (
                <button 
                  onClick={handleDownloadMod}
                  className="flex items-center gap-1.5 text-[10px] md:text-xs font-bold uppercase tracking-wider bg-neon-green text-black px-2 py-1.5 rounded-lg hover:bg-neon-green/80 transition-colors animate-pulse"
                  title="Baixar APK Modificado"
                >
                  <Download className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">APK Mod</span>
                  <span className="sm:hidden">APK</span>
                </button>
              )}
              {analysis && (
                <>
                  <button 
                    onClick={handleDownloadReport}
                    className="flex items-center gap-1.5 text-[10px] md:text-xs font-bold uppercase tracking-wider bg-black/10 dark:bg-white/10 hover:bg-neon-green hover:text-black px-2 py-1.5 rounded-lg transition-colors"
                    title="Baixar Relatório em .md"
                  >
                    <FileText className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="hidden sm:inline">Salvar</span>
                  </button>
                  <button 
                    onClick={handleClearReport}
                    className="flex items-center gap-1.5 text-[10px] md:text-xs font-bold uppercase tracking-wider bg-black/10 dark:bg-white/10 hover:bg-red-500 hover:text-white px-2 py-1.5 rounded-lg transition-colors"
                    title="Limpar Relatório"
                  >
                    <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="hidden sm:inline">Limpar</span>
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="flex-1 surface border rounded-xl p-4 md:p-6 overflow-y-auto prose prose-invert max-w-none min-h-[300px]">
            {analysis ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="whitespace-pre-wrap font-sans text-sm md:text-base"
              >
                {analysis}
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-30 text-center gap-4 py-10">
                {loading ? (
                  <>
                    <Loader2 className="w-8 h-8 md:w-10 md:h-10 animate-spin text-neon-green" />
                    <p className="text-sm md:text-base">Gerando relatório de auditoria...</p>
                  </>
                ) : (
                  <p className="text-sm md:text-base">O relatório da IA ou do Patch aparecerá aqui.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

