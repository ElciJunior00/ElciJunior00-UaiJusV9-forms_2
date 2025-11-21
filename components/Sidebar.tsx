
import React from 'react';
import { Scale, FolderOpen, Clock, FileCheck, PlusCircle, Settings, LogOut, Trash2, FileText, FileSpreadsheet } from 'lucide-react';
import { Case, CaseStatus, Tab } from '../types';

interface SidebarProps {
  activeCase: Case | null;
  cases: Case[];
  onSelectCase: (c: Case) => void;
  onSelectSettings: () => void;
  onCreateNew: () => void;
  onDeleteCase: (id: string, e: React.MouseEvent) => void;
  onSelectForms: () => void;
  activeTab: Tab;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeCase, 
  cases,
  onSelectCase, 
  onSelectSettings, 
  onCreateNew,
  onDeleteCase,
  onSelectForms,
  activeTab 
}) => {

  const emExameCases = cases.filter(c => c.status === CaseStatus.EmExame || c.status === CaseStatus.Novo);
  const examinadoCases = cases.filter(c => c.status === CaseStatus.Examinado);

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0 z-20">
      {/* Logo Area */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-2 text-amber-500 mb-1">
            <Scale className="w-6 h-6" />
            <span className="font-bold text-xl tracking-tight text-slate-100">UaiJus<span className="text-amber-500">V9</span></span>
        </div>
        <p className="text-xs text-slate-500">Análise Jurídica Avançada TJMG</p>
      </div>

      {/* Create New */}
      <div className="p-4">
        <button 
            onClick={onCreateNew}
            className="w-full flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-md border border-slate-700 transition-colors text-sm font-medium shadow-sm hover:shadow"
        >
            <PlusCircle className="w-4 h-4" />
            Novo Processo
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6 custom-scrollbar">
        
        {/* Section: Modules */}
        <div>
            <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Módulos</h3>
            <button 
                onClick={onSelectForms}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${activeTab === Tab.Forms ? 'bg-emerald-900/20 text-emerald-400' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
            >
                <FileSpreadsheet className="w-4 h-4" />
                Integração Google Forms
            </button>
        </div>

        {/* Section: Em Exame */}
        <div>
            <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Clock className="w-3 h-3" />
                Em Exame / Novos
            </h3>
            <div className="space-y-1">
                {emExameCases.length === 0 ? (
                    <p className="text-xs text-slate-600 px-3 italic">Nenhum processo ativo.</p>
                ) : (
                    emExameCases.map(c => (
                        <button 
                            key={c.id}
                            onClick={() => onSelectCase(c)}
                            className={`w-full text-left px-3 py-2 rounded-md text-xs transition-colors border-l-2 group relative ${
                                activeCase?.id === c.id && activeTab !== Tab.Config && activeTab !== Tab.Forms
                                ? 'bg-amber-500/10 border-amber-500 text-amber-400' 
                                : 'border-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                            }`}
                        >
                            <div className="font-medium truncate">{c.number}</div>
                            <div className="text-[10px] opacity-70 truncate">{c.title || 'Aguardando Análise'}</div>
                        </button>
                    ))
                )}
            </div>
        </div>

        {/* Section: Examinados */}
        <div>
            <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                <FileCheck className="w-3 h-3" />
                Examinados
            </h3>
            <div className="space-y-1">
                {examinadoCases.length === 0 ? (
                    <div className="px-3 py-4 text-center border-2 border-dashed border-slate-800 rounded-lg mx-2">
                        <p className="text-[10px] text-slate-600">Nenhum processo finalizado.</p>
                    </div>
                ) : (
                    examinadoCases.map(c => (
                        <div key={c.id} className="relative group">
                            <button 
                                onClick={() => onSelectCase(c)}
                                className={`w-full text-left px-3 py-2 rounded-md text-xs transition-colors border-l-2 pr-8 flex justify-between items-center ${
                                    activeCase?.id === c.id && activeTab !== Tab.Config && activeTab !== Tab.Forms
                                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                                    : 'border-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                                }`}
                            >
                                <div className="truncate flex-1">
                                    <div className="font-medium truncate">{c.number}</div>
                                </div>
                            </button>
                            
                            {/* Delete Action */}
                            <button 
                                onClick={(e) => onDeleteCase(c.id, e)}
                                className="absolute right-2 top-2 text-slate-600 hover:text-red-400 p-1 rounded hover:bg-slate-900 transition-colors z-10"
                                title="Excluir Log do Processo"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Hover Tooltip (Log) */}
                            <div className="absolute left-full top-0 ml-4 w-72 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl p-0 z-50 hidden group-hover:block pointer-events-none animate-fadeIn opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <div className="bg-slate-800 px-3 py-2 rounded-t-lg border-b border-slate-700 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-emerald-500" />
                                        <span className="text-xs font-bold text-slate-200">Log de Análise</span>
                                    </div>
                                    <span className="text-[10px] font-mono text-slate-500">{c.number}</span>
                                </div>
                                
                                {c.analysisLog ? (
                                    <div className="p-3 space-y-3">
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Peças Analisadas</span>
                                            <ul className="max-h-24 overflow-hidden text-[10px] text-slate-400 list-disc pl-3 space-y-0.5">
                                                {c.analysisLog.fileNames.slice(0, 5).map((f, i) => (
                                                    <li key={i} className="truncate">{f}</li>
                                                ))}
                                                {c.analysisLog.fileNames.length > 5 && (
                                                    <li>...e mais {c.analysisLog.fileNames.length - 5}</li>
                                                )}
                                            </ul>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Resumo do Caso</span>
                                            <p className="text-[10px] text-slate-300 line-clamp-4 leading-relaxed bg-slate-950/50 p-2 rounded border border-slate-800">
                                                {c.analysisLog.summaryPreview}
                                            </p>
                                        </div>
                                        <div className="text-[10px] text-slate-600 pt-2 border-t border-slate-800 flex justify-between">
                                            <span>Examinado em:</span>
                                            <span>{c.analysisLog.analyzedAt}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-3">
                                        <p className="text-xs text-slate-500 italic">Sem log de análise registrado.</p>
                                    </div>
                                )}
                                
                                {/* Arrow/Pointer for tooltip */}
                                <div className="absolute top-3 -left-2 w-4 h-4 bg-slate-800 transform rotate-45 border-l border-b border-slate-700"></div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>

      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800">
        <button 
            onClick={onSelectSettings}
            className={`flex items-center gap-3 w-full px-2 py-2 rounded-md transition-colors text-sm ${activeTab === Tab.Config ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
        >
            <Settings className="w-4 h-4" />
            Configurações
        </button>
      </div>
    </aside>
  );
};
