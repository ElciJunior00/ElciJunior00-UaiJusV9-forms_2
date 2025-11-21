
import React, { useState } from 'react';
import { Sparkles, Save, FileDown, MessageSquare, RefreshCw } from 'lucide-react';
import { Case, LegalIssue } from '../types';
import { Button } from './Button';
import { generateLegalDraft } from '../services/geminiService';

interface MinutasTabProps {
  activeCase: Case;
  issues: LegalIssue[];
  onDraftSuccess?: () => void;
}

export const MinutasTab: React.FC<MinutasTabProps> = ({ activeCase, issues, onDraftSuccess }) => {
  const [docType, setDocType] = useState('Decisão Saneadora');
  const [strategy, setStrategy] = useState<'fast' | 'deep'>('fast');
  const [instructions, setInstructions] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedText("Gerando minuta com base nas decisões da Enquete... Aguarde.");
    
    const text = await generateLegalDraft(activeCase, issues, instructions, strategy);
    
    setGeneratedText(text);
    setIsGenerating(false);
    
    // Notify parent to move to 'Examinado'
    if (text && !text.startsWith('Erro') && onDraftSuccess) {
        onDraftSuccess();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
      
      {/* Left Panel: Controls */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        <div className="bg-slate-800 rounded-lg p-5 border border-slate-700 shadow-sm">
          <h3 className="text-slate-100 font-medium mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Gerador Inteligente
          </h3>

          {/* Type Selector */}
          <div className="mb-4">
            <label className="block text-xs text-slate-400 mb-1">Tipo de Documento</label>
            <select 
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded p-2 text-sm focus:ring-amber-500 focus:border-amber-500"
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
            >
                <option>Decisão Saneadora</option>
                <option>Sentença (Procedência)</option>
                <option>Sentença (Improcedência)</option>
                <option>Sentença (Parcial)</option>
                <option>Despacho</option>
            </select>
          </div>

          {/* Custom Instructions */}
          <div className="mb-4">
            <label className="block text-xs text-slate-400 mb-1">Instruções Adicionais</label>
            <textarea 
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded p-2 text-sm h-24 resize-none focus:ring-amber-500 focus:border-amber-500"
                placeholder="Ex: Adicionar gratuidade de justiça..."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
            />
          </div>

          {/* Strategy */}
          <div className="mb-6">
            <label className="block text-xs text-slate-400 mb-2">Estratégia de Raciocínio</label>
            <div className="grid grid-cols-2 gap-2">
                <button 
                    onClick={() => setStrategy('fast')}
                    className={`p-2 rounded border text-xs text-left transition-all ${strategy === 'fast' ? 'bg-amber-500/10 border-amber-500 text-amber-400' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'}`}
                >
                    <span className="font-bold block mb-0.5">Rápido</span>
                    Objetivo e conciso.
                </button>
                <button 
                    onClick={() => setStrategy('deep')}
                    className={`p-2 rounded border text-xs text-left transition-all ${strategy === 'deep' ? 'bg-blue-500/10 border-blue-500 text-blue-400' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'}`}
                >
                    <span className="font-bold block mb-0.5">Profundo</span>
                    Fundamentação robusta.
                </button>
            </div>
          </div>

          <Button 
            className="w-full" 
            onClick={handleGenerate}
            disabled={isGenerating}
            icon={isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          >
            {isGenerating ? 'Gerando Minuta...' : 'Gerar/Atualizar Minuta'}
          </Button>
        </div>

        {/* Chat Assistant */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 shadow-sm flex-1 flex flex-col overflow-hidden">
             <div className="p-3 border-b border-slate-700 bg-slate-800/50">
                <h3 className="text-xs font-bold text-slate-400 uppercase">Assessoria Integrada</h3>
             </div>
             <div className="flex-1 p-3 bg-slate-900/30 overflow-y-auto">
                <p className="text-xs text-slate-500 text-center mt-4">
                    Peça ajustes pontuais na minuta ou busque novas jurisprudências aqui.
                </p>
             </div>
             <div className="p-3 border-t border-slate-700">
                 <div className="relative">
                    <input 
                        type="text" 
                        className="w-full bg-slate-900 border border-slate-700 rounded-full pl-3 pr-10 py-2 text-xs text-slate-200 focus:ring-1 focus:ring-amber-500 outline-none"
                        placeholder="Digite uma instrução..."
                    />
                    <MessageSquare className="absolute right-3 top-2 w-4 h-4 text-slate-500" />
                 </div>
             </div>
        </div>
      </div>

      {/* Right Panel: Editor */}
      <div className="lg:col-span-8 flex flex-col h-full">
         <div className="bg-slate-800 border-b border-slate-700 p-2 flex items-center justify-between rounded-t-lg">
            <div className="flex items-center gap-2">
                 <div className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300">Markdown</div>
                 <div className="w-px h-4 bg-slate-600 mx-1"></div>
                 <span className="text-xs text-slate-400">{activeCase.number} - Minuta.docx</span>
            </div>
            <div className="flex gap-2">
                <Button variant="ghost" size="sm" icon={<FileDown className="w-4 h-4" />}>Exportar</Button>
                <Button variant="primary" size="sm" icon={<Save className="w-4 h-4" />}>Salvar</Button>
            </div>
         </div>
         <div className="flex-1 bg-[#1e1e1e] border-x border-b border-slate-700 rounded-b-lg relative overflow-hidden">
            <textarea 
                className="w-full h-full bg-transparent text-slate-300 p-8 font-mono text-sm outline-none resize-none leading-relaxed"
                value={generatedText}
                onChange={(e) => setGeneratedText(e.target.value)}
                placeholder="A minuta gerada pela IA aparecerá aqui..."
                spellCheck={false}
            />
         </div>
      </div>

    </div>
  );
};
