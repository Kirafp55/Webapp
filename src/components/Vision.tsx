import React, { useState } from 'react';
import { ai } from '../lib/gemini';
import { Image as ImageIcon, Upload, Loader2, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

export default function Vision() {
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    try {
      // Extrai o base64 e o mimeType
      const base64Data = image.split(',')[1];
      const mimeType = image.split(';')[0].split(':')[1];

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            },
            {
              text: 'Analise esta captura de tela do meu aplicativo Android. Procure por possíveis vazamentos de dados sensíveis na interface (PII, tokens, senhas expostas), problemas de UX que possam levar a engenharia social, ou áreas suscetíveis a ataques de overlay (tapjacking). Forneça um relatório de segurança focado na UI.',
            },
          ],
        },
      });
      setAnalysis(response.text || 'Nenhuma análise retornada.');
    } catch (error) {
      console.error(error);
      setAnalysis('Erro ao analisar a imagem. Verifique o console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-neon-orange to-neon-pink bg-clip-text text-transparent">
            Análise de UI (Visão)
          </h2>
          <p className="opacity-70 mt-1">Faça upload de prints do seu app para detectar vazamento de dados visuais e riscos de Tapjacking.</p>
        </div>
        <ImageIcon className="w-10 h-10 text-neon-orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[500px]">
        <div className="flex flex-col gap-4">
          <div className="flex-1 surface border rounded-2xl flex flex-col items-center justify-center p-6 relative overflow-hidden group">
            {image ? (
              <>
                <img src={image} alt="App Screenshot" className="max-h-full max-w-full object-contain rounded-xl z-10" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center justify-center">
                  <label className="cursor-pointer bg-neon-orange text-black font-bold py-2 px-4 rounded-lg flex items-center gap-2">
                    <Upload className="w-5 h-5" /> Trocar Imagem
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>
              </>
            ) : (
              <label className="cursor-pointer flex flex-col items-center gap-4 text-center opacity-70 hover:opacity-100 transition-opacity">
                <div className="w-20 h-20 rounded-full surface border flex items-center justify-center border-dashed border-neon-orange/50">
                  <Upload className="w-8 h-8 text-neon-orange" />
                </div>
                <div>
                  <p className="font-bold text-lg">Upload de Screenshot</p>
                  <p className="text-sm">Arraste ou clique para selecionar (PNG, JPG)</p>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            )}
          </div>
          
          <button
            onClick={handleAnalyze}
            disabled={loading || !image}
            className="bg-neon-orange hover:bg-neon-orange/80 text-black font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <AlertTriangle className="w-5 h-5" />}
            {loading ? 'Analisando Interface...' : 'Auditar Interface'}
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-neon-pink font-semibold">
            <AlertTriangle className="w-5 h-5" />
            <span>Relatório Visual</span>
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
              <div className="h-full flex items-center justify-center opacity-30 text-center">
                O relatório de análise visual aparecerá aqui.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
