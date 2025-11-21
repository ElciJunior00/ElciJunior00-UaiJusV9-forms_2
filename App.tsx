
import React, { useState, useEffect } from 'react';
import { Scale } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { AnalysisTab } from './components/AnalysisTab';
import { EnqueteTab } from './components/EnqueteTab';
import { MinutasTab } from './components/MinutasTab';
import { SettingsTab } from './components/SettingsTab';
import { FormsIntegrationTab } from './components/FormsIntegrationTab';
import { NewCaseModal } from './components/NewCaseModal';
import { ToastProvider } from './components/Toast';
import { Case, MOCK_CASES, Tab, LegalIssue, MOCK_ISSUES, AnalysisResult, CaseStatus } from './types';
import { fetchJurisprudence } from './services/geminiService';
import { v4 as uuidv4 } from 'uuid';

const App: React.FC = () => {
  const [cases, setCases] = useState<Case[]>(MOCK_CASES);
  const [activeCase, setActiveCase] = useState<Case | null>(MOCK_CASES[0]);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Analise);
  const [issues, setIssues] = useState<LegalIssue[]>(MOCK_ISSUES);
  const [isEnriching, setIsEnriching] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Initial load of mock issues for the mock case
  useEffect(() => {
      if (activeCase && activeCase.id === '1' && !activeCase.issues) {
          // Initialize mock case with mock issues for demo consistency
          const updatedMock = { ...activeCase, issues: MOCK_ISSUES };
          setActiveCase(updatedMock);
          setCases(prev => prev.map(c => c.id === '1' ? updatedMock : c));
          setIssues(MOCK_ISSUES);
      }
  }, []);

  // --- Navigation & Selection ---

  const handleSelectSettings = () => {
      setActiveTab(Tab.Config);
  }

  const handleSelectForms = () => {
      setActiveTab(Tab.Forms);
  }

  const handleSelectCase = (c: Case) => {
      setActiveCase(c);
      setActiveTab(Tab.Analise);
      
      // Restore issues from the selected case or clear if none
      if (c.issues && c.issues.length > 0) {
          setIssues(c.issues);
      } else {
          setIssues([]);
      }
  }

  // --- Case Management ---

  const handleCreateCase = (cnj: string) => {
    const newCase: Case = {
      id: uuidv4(),
      number: cnj,
      status: CaseStatus.Novo,
      title: 'Aguardando Análise',
      date: new Date().toLocaleDateString('pt-BR'),
      type: 'Não Identificado'
    };
    setCases(prev => [newCase, ...prev]);
    setActiveCase(newCase);
    setActiveTab(Tab.Analise);
    setIssues([]); // New case starts with empty issues
    setIsModalOpen(false);
  };

  const handleDeleteCase = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering selection
    if (confirm('Tem certeza que deseja excluir o registro deste processo e seu log de análise?')) {
        const updatedCases = cases.filter(c => c.id !== id);
        setCases(updatedCases);
        if (activeCase?.id === id) {
            setActiveCase(updatedCases.length > 0 ? updatedCases[0] : null);
            if(updatedCases.length > 0) {
               setIssues(updatedCases[0].issues || []);
            } else {
               setIssues([]);
            }
        }
    }
  };

  // --- Analysis Workflow ---

  const handleAnalysisComplete = async (result: AnalysisResult) => {
      if (!activeCase) return;

      // Generate initial issues from analysis result
      let newIssues: LegalIssue[] = [];
      if (result.suggestedIssues && result.suggestedIssues.length > 0) {
          newIssues = result.suggestedIssues.map((issue, index) => ({
              id: `auto-${Date.now()}-${index}`,
              title: issue.title,
              type: issue.type,
              aiSuggestion: issue.suggestion,
              reasoning: '',
              decision: null,
              jurisprudence: [] 
          }));
      }

      // Update case with metadata, summary, LOGS, AnalysisResult and Initial Issues
      const updatedCase: Case = {
          ...activeCase,
          number: result.metadata?.number || activeCase.number,
          type: result.metadata?.type || activeCase.type,
          title: result.metadata?.title || activeCase.title,
          summary: result.summary,
          status: CaseStatus.EmExame,
          analysisLog: {
             analyzedAt: new Date().toLocaleString('pt-BR'),
             fileCount: result.fileNames?.length || 0,
             fileNames: result.fileNames || [],
             summaryPreview: result.summary
          },
          analysisResult: result, // Save the full analysis
          issues: newIssues       // Save the generated issues
      };

      // Update in case list and active state
      setCases(prev => prev.map(c => c.id === activeCase.id ? updatedCase : c));
      setActiveCase(updatedCase);
      setIssues(newIssues);

      // Trigger RAG Enrichment automatically if issues exist
      if (newIssues.length > 0) {
          setIsEnriching(true);
          try {
            const enrichedIssues = await Promise.all(newIssues.map(async (issue) => {
               const ragResults = await fetchJurisprudence(issue.title, result.summary);
               return { ...issue, jurisprudence: ragResults };
            }));
            
            // Update state with enriched issues
            setIssues(enrichedIssues);
            
            // Persist enriched issues to case
            const caseWithEnrichment = { ...updatedCase, issues: enrichedIssues };
            setActiveCase(caseWithEnrichment);
            setCases(prev => prev.map(c => c.id === activeCase.id ? caseWithEnrichment : c));
            
          } catch (error) {
              console.error("Erro no RAG:", error);
          } finally {
              setIsEnriching(false);
          }
      }
  };

  // --- Enquete Updates ---
  
  const handleUpdateIssues = (updatedIssues: LegalIssue[]) => {
      setIssues(updatedIssues);
      // Persist changes to the active case immediately
      if (activeCase) {
          const updatedCase = { ...activeCase, issues: updatedIssues };
          setActiveCase(updatedCase);
          setCases(prev => prev.map(c => c.id === activeCase.id ? updatedCase : c));
      }
  };

  // --- Draft Workflow ---

  const handleDraftSuccess = () => {
      if (activeCase && activeCase.status !== CaseStatus.Examinado) {
          const updatedCase = { ...activeCase, status: CaseStatus.Examinado };
          setCases(prev => prev.map(c => c.id === activeCase.id ? updatedCase : c));
          setActiveCase(updatedCase);
          alert(`Minuta gerada com sucesso! Processo ${activeCase.number} movido para "Examinados".`);
      }
  };

  // --- Rendering ---

  const renderContent = () => {
    if (activeTab === Tab.Config) {
        return <SettingsTab />;
    }

    if (activeTab === Tab.Forms) {
        return <FormsIntegrationTab />;
    }

    if (!activeCase) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-500 animate-fadeIn">
          <div className="bg-slate-900 p-8 rounded-full mb-6 shadow-2xl border border-slate-800">
            <Scale className="w-16 h-16 text-amber-500/50" /> 
          </div>
          <p className="mb-6 text-lg font-medium text-slate-400">Nenhum processo selecionado.</p>
          <button 
             onClick={() => setIsModalOpen(true)}
             className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-3 rounded-lg transition-all shadow-lg hover:shadow-amber-500/20 font-medium flex items-center gap-2"
          >
            Criar Novo Processo
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case Tab.Analise:
        return <AnalysisTab activeCase={activeCase} onAnalysisComplete={handleAnalysisComplete} />;
      case Tab.Enquete:
        return <EnqueteTab onUpdateIssues={handleUpdateIssues} issues={issues} isEnriching={isEnriching} />;
      case Tab.Minutas:
        return <MinutasTab activeCase={activeCase} issues={issues} onDraftSuccess={handleDraftSuccess} />;
      default:
        return null;
    }
  };

  return (
    <ToastProvider>
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-amber-500/30">
        <Sidebar 
            activeCase={activeCase}
            cases={cases} 
            onSelectCase={handleSelectCase} 
            onSelectSettings={handleSelectSettings}
            onSelectForms={handleSelectForms}
            onCreateNew={() => setIsModalOpen(true)}
            onDeleteCase={handleDeleteCase}
            activeTab={activeTab}
        />
        
        <NewCaseModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            onCreate={handleCreateCase} 
        />
        
        <main className="pl-64 flex flex-col h-screen overflow-hidden">
            
            {/* Top Bar / Header */}
            <header className="h-16 bg-slate-900/80 backdrop-blur border-b border-slate-800 flex items-center justify-between px-8 shrink-0 z-10">
            <div className="flex flex-col">
                <h1 className="text-lg font-bold text-white flex items-center gap-2">
                    {activeTab === Tab.Config ? 'Configurações' : activeTab === Tab.Forms ? 'Monitoramento Google Forms' : (activeCase ? activeCase.number : 'Bem-vindo')}
                </h1>
                {activeCase && activeTab !== Tab.Config && activeTab !== Tab.Forms && (
                    <span className={`text-xs font-medium ${activeCase.status === CaseStatus.Examinado ? 'text-emerald-500' : 'text-amber-500'}`}>
                        Status: {activeCase.status}
                    </span>
                )}
            </div>
            
            {/* Tabs */}
            {activeCase && activeTab !== Tab.Config && activeTab !== Tab.Forms && (
                <nav className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
                    <button 
                        onClick={() => setActiveTab(Tab.Analise)}
                        className={`px-4 py-1.5 text-sm rounded-md transition-all ${activeTab === Tab.Analise ? 'bg-slate-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        Análise e Contexto
                    </button>
                    <button 
                        onClick={() => setActiveTab(Tab.Enquete)}
                        className={`px-4 py-1.5 text-sm rounded-md transition-all flex items-center gap-2 ${activeTab === Tab.Enquete ? 'bg-slate-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        Enquete
                        {isEnriching && <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>}
                    </button>
                    <button 
                        onClick={() => setActiveTab(Tab.Minutas)}
                        className={`px-4 py-1.5 text-sm rounded-md transition-all ${activeTab === Tab.Minutas ? 'bg-slate-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        Minutas
                    </button>
                </nav>
            )}
            </header>

            {/* Content Area */}
            <div className="flex-1 overflow-auto p-8 relative bg-gradient-to-br from-slate-950 to-slate-900">
            {renderContent()}
            </div>
        </main>
        </div>
    </ToastProvider>
  );
};

export default App;
