
import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, BarChart3, Search, Upload, CheckCircle, Scale, Folder, RefreshCcw, AlertTriangle } from 'lucide-react';
import { Case, AnalysisResult, AppSettings } from '../types';
import { Button } from './Button';
import { analyzeLegalDocument } from '../services/geminiService';
import { ProgressBar } from './ProgressBar';
import { useToast } from './Toast';
import { validateFile } from '../utils/validation';

interface AnalysisTabProps {
  activeCase: Case;
  onAnalysisComplete: (result: AnalysisResult) => void;
  settings?: AppSettings;
}

export const AnalysisTab: React.FC<AnalysisTabProps> = ({ activeCase, onAnalysisComplete, settings }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  useEffect(() => {
    if (activeCase.analysisResult) {
      setAnalysisResult(activeCase.analysisResult);
      setFiles([]); 
    } else {
      setAnalysisResult(null);
      setFiles([]);
    }
  }, [activeCase.id]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFiles = Array.from(event.target.files) as File[];
      
      // Validate files
      const validFiles: File[] = [];
      let hasError = false;

      selectedFiles.forEach(f => {
          const validation = validateFile(f);
          if (validation.valid) {
              validFiles.push(f);
          } else {
              hasError = true;
              console.warn(`File skipped ${f.name}: ${validation.error}`);
          }
      });

      if (hasError) {
          addToast('Alguns arquivos foram ignorados (formato inválido ou tamanho excedido).', 'warning');
      }

      if (validFiles.length > 0) {
        setFiles(validFiles);
        setAnalysisResult(null);
        addToast(`${validFiles.length} arquivos carregados para análise.`, 'info');
      }
    }
  };

  const handleAnalysis = async () => {
    if (files.length === 0) return;

    setIsAnalyzing(true);
    setProgress(0);
    setProcessingStatus('Iniciando leitura de arquivos...');

    try {
        const BATCH_SIZE = 5; // Process 5 files at a time to avoid freezing UI
        const processedFiles: {base64: string, mimeType: string}[] = [];
        
        // Batch Processing Logic
        for (let i = 0; i < files.length; i += BATCH_SIZE) {
            const batch = files.slice(i, i + BATCH_SIZE);
            setProcessingStatus(`Lendo lote ${Math.floor(i/BATCH_SIZE) + 1} de ${Math.ceil(files.length/BATCH_SIZE)}...`);
            
            const batchPromises = batch.map(file => {
                return new Promise<{base64: string, mimeType: string}>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => {
                        const result = reader.result as string;
                        const base64 = result.split(',')[1];
                        resolve({ base64, mimeType: file.type });
                    };
                    reader.onerror = reject;
                });
            });

            const batchResults = await Promise.all(batchPromises);
            processedFiles.push(...batchResults);
            
            // Update Progress
            const currentProgress = ((i + batch.length) / files.length) * 50; // First 50% is reading
            setProgress(currentProgress);
            // Small delay to let UI update
            await new Promise(r => setTimeout(r, 100));
        }
        
        setProcessingStatus('Enviando para Gemini AI (Pode demorar)...');
        setProgress(60);

        // Send to Gemini Service
        const result = await analyzeLegalDocument(processedFiles, settings);
        setProgress(90);
        
        setProcessingStatus('Finalizando...');
        result.fileNames = files.map(f => f.name);

        setAnalysisResult(result);
        onAnalysisComplete(result);
        
        setProgress(100);
        addToast('Análise concluída com sucesso!', 'success');

    } catch (e: any) {
        console.error("Erro na análise:", e);
        addToast(e.message || "Erro desconhecido na análise.", 'error');
        setProgress(0);
    } finally {
        setIsAnalyzing(false);
        setProcessingStatus('');
    }
  };

  const handleNewUpload = () => {
      setAnalysisResult(null);
      setFiles([]);
      fileInputRef.current?.click();
  };

  // Skeleton Loader Component
  const AnalysisSkeleton = () => (
      <div className="animate-pulse space-y-4 w-full">
          <div className="h-4 bg-slate-800 rounded w-3/4"></div>
          <div className="h-4 bg-slate-800 rounded w-1/2"></div>
          <div className="h-24 bg-slate-800 rounded w-full"></div>
          <div className="h-4 bg-slate-800 rounded w-5/6"></div>
      </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Left Column: Document Viewer / Upload */}
      <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Document Area */}
          <div className="bg-slate-900/50 border border-slate-700 rounded-lg flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden group transition-all hover:border-slate-600 p-6">
            
            {/* Progress Overlay */}
            {isAnalyzing && (
                <div className="absolute inset-0 bg-slate-950/90 z-50 flex flex-col items-center justify-center p-8">
                    <ProgressBar progress={progress} label={processingStatus} color="bg-amber-500" />
                </div>
            )}

            {/* CASE 1: Result Exists */}
            {analysisResult ? (
                 <div className="flex flex-col items-center justify-center w-full h-full animate-fadeIn">
                    <div className="w-20 h-20 bg-emerald-900/30 rounded-full flex items-center justify-center mb-4 border border-emerald-500/30">
                        <CheckCircle className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h3 className="text-slate-200 text-xl font-medium">Autos Processados</h3>
                    <p className="text-slate-400 text-sm mt-2">
                        O sistema já possui o contexto deste processo.
                    </p>

                    <div className="mt-6 p-4 bg-slate-900 rounded-lg border border-slate-800 text-sm text-slate-400 w-full max-w-md shadow-lg">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-2">
                            <span className="font-bold text-slate-300">Log de Análise</span>
                            <span className="text-xs font-mono">{activeCase.analysisLog?.analyzedAt}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                            <Folder className="w-4 h-4 text-amber-500" />
                            <span>{activeCase.analysisLog?.fileCount} arquivos analisados</span>
                        </div>
                        {activeCase.analysisLog?.fileNames && (
                            <div className="max-h-32 overflow-y-auto custom-scrollbar">
                                <ul className="list-disc pl-4 space-y-1 text-xs">
                                     {activeCase.analysisLog.fileNames.map((f, i) => (
                                        <li key={i} className="truncate">{f}</li>
                                     ))}
                                </ul>
                            </div>
                        )}
                    </div>
                    
                    <div className="mt-6">
                        <Button variant="outline" size="sm" onClick={handleNewUpload} icon={<RefreshCcw className="w-4 h-4" />}>
                            Refazer Análise (Novo Upload)
                        </Button>
                    </div>
                 </div>
            ) : (
                /* CASE 2: Upload needed or Ready */
                files.length === 0 ? (
                    <div className="text-center p-8 animate-fadeIn">
                        <div 
                            className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 cursor-pointer hover:bg-slate-700 transition-colors shadow-xl"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-slate-300 text-lg font-medium">Carregar Autos do Processo</h3>
                        <p className="text-slate-500 text-sm mt-2 max-w-xs mx-auto">
                            Clique para selecionar o <b>diretório</b> ou arquivos PDF do processo.
                        </p>
                        <Button onClick={() => fileInputRef.current?.click()} className="mt-6" icon={<Folder className="w-4 h-4"/>}>
                            Selecionar Diretório
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center w-full animate-fadeIn">
                         <div className="w-16 h-16 bg-amber-900/20 rounded-full flex items-center justify-center mb-4 border border-amber-500/30">
                            <Folder className="w-8 h-8 text-amber-500" />
                        </div>
                        <h3 className="text-slate-200 text-lg font-medium">{files.length} arquivos selecionados</h3>
                        <p className="text-slate-500 text-sm mt-1 mb-6">Pronto para iniciar a análise jurídica.</p>
                        
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => setFiles([])}>Cancelar</Button>
                            <Button onClick={handleAnalysis} isLoading={isAnalyzing}>Iniciar Análise IA</Button>
                        </div>
                    </div>
                )
            )}
            
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                multiple 
                onChange={handleFileChange}
                accept="application/pdf"
                // @ts-ignore - webkitdirectory is non-standard but supported in modern browsers
                webkitdirectory="" 
            />
          </div>

          {/* Stats / Metadata */}
          {analysisResult?.metadata && (
            <div className="grid grid-cols-2 gap-4 animate-fadeIn">
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                    <div className="text-slate-500 text-xs font-bold uppercase mb-1">Classe Judicial</div>
                    <div className="text-slate-200 font-mono text-sm">{analysisResult.metadata.type}</div>
                </div>
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                    <div className="text-slate-500 text-xs font-bold uppercase mb-1">Data Distribuição</div>
                    <div className="text-slate-200 font-mono text-sm">{analysisResult.metadata.date}</div>
                </div>
            </div>
          )}
      </div>

      {/* Right Column: Analysis Results */}
      <div className="flex flex-col gap-6 h-full overflow-hidden">
        
        {/* Security Check */}
        <div className={`p-4 rounded-lg border flex items-center gap-4 transition-all ${
            !analysisResult 
            ? 'bg-slate-900 border-slate-800 opacity-50' 
            : analysisResult.risk === 'SAFE' 
                ? 'bg-emerald-900/20 border-emerald-500/30 text-emerald-400' 
                : 'bg-red-900/20 border-red-500/30 text-red-400'
        }`}>
            <ShieldCheck className="w-8 h-8 shrink-0" />
            <div>
                <h4 className="font-bold text-sm">Verificação de Integridade</h4>
                <p className="text-xs opacity-80">
                    {isAnalyzing ? 'Verificando...' : analysisResult 
                        ? (analysisResult.risk === 'SAFE' ? 'Nenhum prompt injection detectado.' : `ALERTA: ${analysisResult.riskReason}`) 
                        : 'Aguardando análise...'}
                </p>
            </div>
        </div>

        {/* Summary & Controversies */}
        <div className="flex-1 bg-slate-800 rounded-lg border border-slate-700 flex flex-col overflow-hidden shadow-lg">
            <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
                <h3 className="font-bold text-slate-200 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-amber-500" />
                    Análise Preliminar
                </h3>
                {analysisResult && <span className="text-[10px] bg-slate-700 px-2 py-1 rounded text-slate-300">Gerado por Gemini 2.5</span>}
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-6">
                {isAnalyzing ? (
                   <AnalysisSkeleton />
                ) : analysisResult ? (
                    <>
                        {/* Summary */}
                        <div className="animate-fadeIn">
                            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Resumo dos Fatos</h4>
                            <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/50 p-3 rounded border border-slate-700/50">
                                {analysisResult.summary}
                            </p>
                        </div>

                        {/* Controversy Table */}
                        <div className="animate-fadeIn animation-delay-200">
                            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Tabela de Controvérsias</h4>
                            <div className="space-y-3">
                                {analysisResult.controversies.map((c, i) => (
                                    <div key={i} className="bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-sm">
                                        <div className="font-bold text-amber-500 mb-2 pb-2 border-b border-slate-800">{c.point}</div>
                                        <div className="grid grid-cols-2 gap-4 mb-2">
                                            <div>
                                                <span className="text-[10px] text-blue-400 block mb-0.5">AUTOR</span>
                                                <p className="text-xs text-slate-400">{c.authorVersion}</p>
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-red-400 block mb-0.5">RÉU</span>
                                                <p className="text-xs text-slate-400">{c.defendantVersion}</p>
                                            </div>
                                        </div>
                                        <div className="bg-slate-950 rounded p-2 mt-2 flex items-start gap-2">
                                            <Search className="w-3 h-3 text-slate-500 mt-0.5" />
                                            <p className="text-[10px] text-slate-500 italic">{c.evidenceStatus}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-600 opacity-60">
                        <Scale className="w-12 h-12 mb-2" />
                        <p className="text-sm">Aguardando documentos...</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
