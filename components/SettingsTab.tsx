
import React, { useState, useEffect } from 'react';
import { Settings, Shield, Activity, Database, Server, Sliders, Info, Save, AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from './Button';
import { AppSettings, DEFAULT_SETTINGS } from '../types';
import { useToast } from './Toast';

interface SettingsTabProps {
    settings?: AppSettings;
    onUpdateSettings?: (newSettings: AppSettings) => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ settings: initialSettings, onUpdateSettings }) => {
    const [activeSection, setActiveSection] = useState<'geral' | 'seguranca' | 'logs'>('geral');
    const [localSettings, setLocalSettings] = useState<AppSettings>(initialSettings || DEFAULT_SETTINGS);
    const { addToast } = useToast();

    useEffect(() => {
        if (initialSettings) setLocalSettings(initialSettings);
    }, [initialSettings]);

    const handleChange = (key: keyof AppSettings, value: any) => {
        setLocalSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        if (onUpdateSettings) {
            onUpdateSettings(localSettings);
            addToast('Configurações salvas com sucesso!', 'success');
        } else {
            addToast('Configurações salvas localmente (simulação).', 'success');
        }
    };

    const handleReset = () => {
        setLocalSettings(DEFAULT_SETTINGS);
        if (onUpdateSettings) {
            onUpdateSettings(DEFAULT_SETTINGS);
            addToast('Configurações restauradas para o padrão.', 'info');
        }
    };
    
    return (
        <div className="max-w-6xl mx-auto h-full flex flex-col gap-6">
            <div className="flex justify-between items-end mb-2">
                <div>
                    <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                        <Settings className="w-6 h-6 text-slate-400" />
                        Painel de Controle
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">Administração e monitoramento do sistema UaiJusV7.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleReset} icon={<RotateCcw className="w-4 h-4"/>}>Restaurar</Button>
                    <Button onClick={handleSave} icon={<Save className="w-4 h-4"/>}>Salvar Alterações</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
                {/* Sidebar Settings */}
                <div className="bg-slate-800 rounded-lg border border-slate-700 p-2 h-fit">
                    <button 
                        onClick={() => setActiveSection('geral')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm transition-colors mb-1 ${activeSection === 'geral' ? 'bg-amber-500 text-slate-900 font-bold' : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'}`}
                    >
                        <Sliders className="w-4 h-4" />
                        Parâmetros da IA
                    </button>
                    <button 
                         onClick={() => setActiveSection('seguranca')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm transition-colors mb-1 ${activeSection === 'seguranca' ? 'bg-amber-500 text-slate-900 font-bold' : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'}`}
                    >
                        <Shield className="w-4 h-4" />
                        Segurança & Integridade
                    </button>
                    <button 
                         onClick={() => setActiveSection('logs')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm transition-colors ${activeSection === 'logs' ? 'bg-amber-500 text-slate-900 font-bold' : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'}`}
                    >
                        <Activity className="w-4 h-4" />
                        Logs Operacionais
                    </button>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3 bg-slate-800 rounded-lg border border-slate-700 p-6 overflow-y-auto">
                    
                    {activeSection === 'geral' && (
                        <div className="space-y-8 animate-fadeIn">
                            {/* LLM Config */}
                            <div>
                                <h3 className="text-lg font-medium text-slate-200 mb-4 border-b border-slate-700 pb-2 flex items-center gap-2">
                                    <Server className="w-5 h-5 text-indigo-400" /> Configuração de Modelos (Gemini)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1">Modelo Padrão (Análise Rápida)</label>
                                        <select 
                                            value={localSettings.defaultModel}
                                            onChange={(e) => handleChange('defaultModel', e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-300"
                                        >
                                            <option value="gemini-2.5-flash">gemini-2.5-flash (Recomendado)</option>
                                            <option value="gemini-2.5-flash-lite">gemini-2.5-flash-lite</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1">Modelo Avançado (Minutas)</label>
                                        <select 
                                            value={localSettings.advancedModel}
                                            onChange={(e) => handleChange('advancedModel', e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-300"
                                        >
                                            <option value="gemini-3-pro-preview">gemini-3-pro-preview</option>
                                            <option value="gemini-2.0-pro">gemini-2.0-pro</option>
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs text-slate-400 mb-1">
                                            Temperatura ({localSettings.temperature}) - {localSettings.temperature < 0.3 ? 'Preciso' : 'Criativo'}
                                        </label>
                                        <input 
                                            type="range" 
                                            min="0" max="1" step="0.1"
                                            value={localSettings.temperature}
                                            onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
                                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500" 
                                        />
                                        <div className="flex justify-between text-xs text-slate-500 mt-1">
                                            <span>0.0 (Fatos)</span>
                                            <span>0.5 (Equilíbrio)</span>
                                            <span>1.0 (Criativo)</span>
                                        </div>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs text-slate-400 mb-1">Prompt do Sistema</label>
                                        <textarea 
                                            value={localSettings.systemPrompt}
                                            onChange={(e) => handleChange('systemPrompt', e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-300 h-24"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'seguranca' && (
                         <div className="space-y-6 animate-fadeIn">
                            <div className="bg-red-900/10 border border-red-900/30 p-4 rounded-lg">
                                <h4 className="text-red-400 font-bold text-sm mb-2 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4"/> Prompt Injection Shield
                                </h4>
                                <p className="text-xs text-slate-400 mb-4">
                                    Nível de rigidez na verificação de comandos maliciosos nos PDFs.
                                </p>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-slate-300">Sensibilidade:</span>
                                    <div className="flex bg-slate-900 rounded p-1 border border-slate-700">
                                        {(['low', 'medium', 'high'] as const).map(level => (
                                            <button 
                                                key={level}
                                                onClick={() => handleChange('safetyLevel', level)}
                                                className={`px-3 py-1 text-xs rounded capitalize transition-colors ${localSettings.safetyLevel === level ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}
                                            >
                                                {level === 'low' ? 'Baixa' : level === 'medium' ? 'Média' : 'Alta'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-medium text-slate-200 mb-4 border-b border-slate-700 pb-2">Bancos de Dados (RAG)</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between bg-slate-900/50 p-3 rounded border border-slate-700">
                                        <div className="flex items-center gap-3">
                                            <Database className="w-5 h-5 text-emerald-500" />
                                            <div>
                                                <p className="text-sm font-medium text-slate-200">Base TJMG (Acórdãos)</p>
                                                <p className="text-xs text-slate-500">Conectado via Gemini Knowledge Retrieval</p>
                                            </div>
                                        </div>
                                        <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded border border-emerald-500/30">Ativo</span>
                                    </div>
                                </div>
                            </div>
                         </div>
                    )}

                    {activeSection === 'logs' && (
                        <div className="animate-fadeIn h-full flex flex-col items-center justify-center text-slate-500">
                             <Activity className="w-12 h-12 mb-4 opacity-50" />
                             <p>Visualização de logs disponível apenas para administradores.</p>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};
