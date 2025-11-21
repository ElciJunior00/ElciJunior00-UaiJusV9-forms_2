
import React, { useState, useEffect } from 'react';
import { Bot, ChevronDown, ChevronUp, BookOpen, Edit3, Loader2, Search, CheckSquare, Square } from 'lucide-react';
import { LegalIssue, MOCK_ISSUES, JurisprudenceItem } from '../types';
import { Button } from './Button';
import { fetchJurisprudence } from '../services/geminiService';

interface EnqueteTabProps {
  issues?: LegalIssue[];
  onUpdateIssues: (issues: LegalIssue[]) => void;
  isEnriching?: boolean;
}

export const EnqueteTab: React.FC<EnqueteTabProps> = ({ issues: propIssues, onUpdateIssues, isEnriching }) => {
  const [issues, setIssues] = useState<LegalIssue[]>(propIssues || MOCK_ISSUES);
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);
  const [manualSearchTerms, setManualSearchTerms] = useState<Record<string, string>>({});
  const [isSearching, setIsSearching] = useState<Record<string, boolean>>({});

  // Sync props to state
  useEffect(() => {
      if (propIssues) {
          setIssues(propIssues);
          if (propIssues.length > 0 && !expandedIssue) {
              setExpandedIssue(propIssues[0].id);
          }
      }
  }, [propIssues]);

  const toggleIssue = (id: string) => {
    setExpandedIssue(expandedIssue === id ? null : id);
  };

  const handleDecision = (id: string, decision: LegalIssue['decision']) => {
    const updatedIssues = issues.map(issue => 
      issue.id === id ? { ...issue, decision } : issue
    );
    setIssues(updatedIssues);
    onUpdateIssues(updatedIssues);
  };

  const handleReasoningChange = (id: string, text: string) => {
    const updatedIssues = issues.map(issue => 
      issue.id === id ? { ...issue, reasoning: text } : issue
    );
    setIssues(updatedIssues);
    onUpdateIssues(updatedIssues);
  };

  const toggleJurisprudenceSelection = (issueId: string, jurisId: string) => {
      const updatedIssues = issues.map(issue => {
          if (issue.id === issueId) {
              return {
                  ...issue,
                  jurisprudence: issue.jurisprudence.map(item => 
                      item.id === jurisId ? { ...item, selected: !item.selected } : item
                  )
              };
          }
          return issue;
      });
      setIssues(updatedIssues);
      onUpdateIssues(updatedIssues);
  };

  const handleManualSearch = async (issueId: string, summary: string) => {
      const term = manualSearchTerms[issueId];
      if (!term) return;

      setIsSearching(prev => ({ ...prev, [issueId]: true }));
      
      try {
          const newItems = await fetchJurisprudence("", summary, term);
          // Add new items to the existing list
          const updatedIssues = issues.map(issue => {
              if (issue.id === issueId) {
                  return {
                      ...issue,
                      jurisprudence: [...issue.jurisprudence, ...newItems]
                  };
              }
              return issue;
          });
          setIssues(updatedIssues);
          onUpdateIssues(updatedIssues);
          setManualSearchTerms(prev => ({ ...prev, [issueId]: '' })); // Clear input
      } catch (e) {
          console.error(e);
      } finally {
          setIsSearching(prev => ({ ...prev, [issueId]: false }));
      }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="mb-6 flex justify-between items-end">
        <div>
            <h2 className="text-xl font-semibold text-slate-100 mb-1">Quadro Decisório</h2>
            <p className="text-slate-400 text-sm">Analise as sugestões da IA, selecione ementas e defina os rumos do processo.</p>
        </div>
        {isEnriching && (
            <div className="flex items-center gap-2 text-amber-500 text-xs bg-amber-900/20 px-3 py-1 rounded-full border border-amber-900/50 animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin" />
                Buscando Jurisprudência (RAG)...
            </div>
        )}
      </div>

      {issues.map((issue) => (
        <div 
          key={issue.id} 
          className={`bg-slate-800 rounded-lg border transition-all duration-200 ${
            expandedIssue === issue.id ? 'border-amber-500/50 shadow-lg shadow-amber-900/10' : 'border-slate-700'
          }`}
        >
          {/* Header */}
          <div 
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-700/50 rounded-t-lg"
            onClick={() => toggleIssue(issue.id)}
          >
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${issue.decision ? 'bg-green-500' : 'bg-amber-500'}`} />
              <h3 className="text-slate-100 font-medium">{issue.title}</h3>
            </div>
            <div className="flex items-center gap-3">
                {issue.decision && (
                    <span className="text-xs font-bold bg-slate-900 text-slate-300 px-2 py-1 rounded border border-slate-700">
                        {issue.decision}
                    </span>
                )}
                {expandedIssue === issue.id ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
            </div>
          </div>

          {/* Expanded Content */}
          {expandedIssue === issue.id && (
            <div className="p-4 border-t border-slate-700 bg-slate-900/30">
              
              {/* AI Suggestion */}
              <div className="mb-4 bg-slate-800/80 p-3 rounded border border-slate-700/50 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-amber-600"></div>
                <div className="flex gap-2 items-start mb-1">
                    <Bot className="w-4 h-4 text-amber-400 mt-0.5" />
                    <span className="text-xs font-bold text-amber-400 uppercase">Sugestão UaiJus</span>
                </div>
                <p className="text-slate-300 text-sm ml-6">{issue.aiSuggestion}</p>
              </div>

              {/* User Reasoning */}
              <div className="mb-4">
                <label className="text-xs text-slate-400 mb-1 block flex items-center gap-1">
                    <Edit3 className="w-3 h-3" />
                    Sua Fundamentação (Opcional)
                </label>
                <textarea 
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none resize-none h-20"
                    placeholder="Clique para editar ou adicionar fundamentação específica..."
                    value={issue.reasoning}
                    onChange={(e) => handleReasoningChange(issue.id, e.target.value)}
                />
              </div>

              {/* Jurisprudence Section */}
              <div className="mb-6 bg-slate-900/50 p-3 rounded border border-slate-800">
                 <h4 className="text-xs font-semibold text-slate-500 uppercase mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        Jurisprudência de Apoio (RAG)
                    </div>
                    <span className="text-[10px] font-normal opacity-70">
                        Marque para transcrever na minuta
                    </span>
                 </h4>

                 {/* List of Jurisprudence */}
                 {issue.jurisprudence.length > 0 ? (
                    <ul className="space-y-2 mb-3">
                        {issue.jurisprudence.map((item) => (
                            <li 
                                key={item.id} 
                                className={`text-xs p-2 rounded border cursor-pointer transition-colors flex gap-3 items-start group ${
                                    item.selected 
                                    ? 'bg-emerald-900/20 border-emerald-500/50' 
                                    : 'bg-slate-800 border-slate-700 hover:border-slate-500'
                                }`}
                                onClick={() => toggleJurisprudenceSelection(issue.id, item.id)}
                            >
                                <div className={`mt-0.5 shrink-0 ${item.selected ? 'text-emerald-400' : 'text-slate-600 group-hover:text-slate-400'}`}>
                                    {item.selected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                                </div>
                                <span className={`leading-relaxed ${item.selected ? 'text-slate-200' : 'text-slate-400'}`}>
                                    {item.text}
                                </span>
                            </li>
                        ))}
                    </ul>
                 ) : (
                     <p className="text-xs text-slate-600 italic mb-3">
                        {isEnriching ? "Buscando ementas..." : "Nenhuma sugestão automática."}
                     </p>
                 )}

                 {/* Manual Search Input */}
                 <div className="flex gap-2 mt-3 pt-3 border-t border-slate-800">
                    <div className="relative flex-1">
                        <input 
                            type="text" 
                            className="w-full bg-slate-800 border border-slate-700 rounded text-xs text-slate-200 px-3 py-2 focus:ring-1 focus:ring-amber-500 outline-none pl-8"
                            placeholder="Buscar ementas por palavra-chave no RAG..."
                            value={manualSearchTerms[issue.id] || ''}
                            onChange={(e) => setManualSearchTerms(prev => ({ ...prev, [issue.id]: e.target.value }))}
                            onKeyDown={(e) => e.key === 'Enter' && handleManualSearch(issue.id, issue.title)}
                        />
                        <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-500" />
                    </div>
                    <Button 
                        size="sm" 
                        variant="secondary" 
                        onClick={() => handleManualSearch(issue.id, issue.title)}
                        disabled={isSearching[issue.id] || !manualSearchTerms[issue.id]}
                        icon={isSearching[issue.id] ? <Loader2 className="w-3 h-3 animate-spin"/> : undefined}
                    >
                        Buscar
                    </Button>
                 </div>

              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-slate-700/50 justify-end">
                <Button 
                    size="sm" 
                    variant={issue.decision === 'DEFERIR' ? 'success' : 'outline'}
                    onClick={() => handleDecision(issue.id, 'DEFERIR')}
                    className={issue.decision === 'DEFERIR' ? 'bg-emerald-600 text-white border-emerald-500' : ''}
                >
                    DEFERIR
                </Button>
                <Button 
                    size="sm" 
                    variant={issue.decision === 'INDEFERIR' ? 'danger' : 'outline'}
                    onClick={() => handleDecision(issue.id, 'INDEFERIR')}
                    className={issue.decision === 'INDEFERIR' ? 'bg-red-600 text-white border-red-500' : ''}
                >
                    INDEFERIR
                </Button>
                <Button 
                    size="sm" 
                    variant={issue.decision === 'FIXAR' ? 'primary' : 'outline'}
                    onClick={() => handleDecision(issue.id, 'FIXAR')}
                >
                    FIXAR PONTO
                </Button>
              </div>

            </div>
          )}
        </div>
      ))}

      <div className="flex justify-end pt-4">
          <Button variant="ghost" size="sm" icon={<ChevronDown className="w-4 h-4"/>}>
             Nova Questão
          </Button>
      </div>
    </div>
  );
};
