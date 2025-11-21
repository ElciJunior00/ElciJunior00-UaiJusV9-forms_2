
import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, RefreshCw, CheckCircle, Clock, AlertCircle, ExternalLink, Code, PlayCircle } from 'lucide-react';
import { FormRequest } from '../types';
import { Button } from './Button';
import { useToast } from './Toast';
import { v4 as uuidv4 } from 'uuid';

// Mock initial data based on PDF scenarios
const MOCK_REQUESTS: FormRequest[] = [
    {
        id: 'req-001',
        form_response_id: 'RESP-12345',
        solicitante_nome: 'Maria Silva (Assessora)',
        solicitante_matricula: 'M-102030',
        solicitante_email: 'maria.silva@tjmg.jus.br',
        numero_processo: '5030768-12.2023.8.13.0701',
        pdf_drive_url: 'https://drive.google.com/file/d/123...',
        minuta_drive_url: 'https://drive.google.com/file/d/456...',
        status: 'concluido',
        tempo_processamento_segundos: 2400,
        created_at: '2025-11-19T09:00:00Z'
    },
    {
        id: 'req-002',
        form_response_id: 'RESP-67890',
        solicitante_nome: 'João Souza (Juiz Leigo)',
        solicitante_matricula: 'M-998877',
        solicitante_email: 'joao.souza@tjmg.jus.br',
        numero_processo: '5001122-33.2024.8.13.0024',
        pdf_drive_url: 'https://drive.google.com/file/d/789...',
        status: 'processando',
        created_at: '2025-11-20T14:30:00Z'
    }
];

const APPS_SCRIPT_CODE = `
function onFormSubmit(e) { 
 const formData = { 
 responseId: e.response.getId(), 
 solicitante: e.values[1], 
 matricula: e.values[2], 
 processo: e.values[3], 
 pdfUrl: e.values[4] 
 }; 
 
 UrlFetchApp.fetch('https://uaijus-api.br/api/process', { 
 method: 'post', 
 contentType: 'application/json', 
 payload: JSON.stringify(formData) 
 }); 
}`;

export const FormsIntegrationTab: React.FC = () => {
    const [requests, setRequests] = useState<FormRequest[]>(MOCK_REQUESTS);
    const [viewMode, setViewMode] = useState<'monitor' | 'config'>('monitor');
    const { addToast } = useToast();

    // Simulation Loop
    useEffect(() => {
        const interval = setInterval(() => {
            setRequests(prev => prev.map(req => {
                if (req.status === 'processando') {
                    // Simulate completion chance
                    if (Math.random() > 0.7) {
                        return {
                            ...req,
                            status: 'concluido',
                            minuta_drive_url: 'https://drive.google.com/generated-doc',
                            tempo_processamento_segundos: Math.floor(Math.random() * 1000) + 300
                        };
                    }
                }
                return req;
            }));
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleSimulateWebhook = () => {
        const newRequest: FormRequest = {
            id: uuidv4(),
            form_response_id: `RESP-${Math.floor(Math.random() * 10000)}`,
            solicitante_nome: 'Usuário Simulado (Google Forms)',
            solicitante_matricula: 'M-SIMULADO',
            solicitante_email: 'simulado@tjmg.jus.br',
            numero_processo: `500${Math.floor(Math.random() * 1000)}-99.2025.8.13.0000`,
            pdf_drive_url: 'http://drive.google.com/dummy',
            status: 'pendente',
            created_at: new Date().toISOString()
        };

        setRequests(prev => [newRequest, ...prev]);
        addToast('Webhook recebido! Nova solicitação iniciada.', 'info');

        // Move to processing after 2s
        setTimeout(() => {
            setRequests(prev => prev.map(r => r.id === newRequest.id ? { ...r, status: 'processando' } : r));
        }, 2000);
    };

    const stats = {
        total: requests.length,
        concluido: requests.filter(r => r.status === 'concluido').length,
        processando: requests.filter(r => r.status === 'processando').length,
        erro: requests.filter(r => r.status === 'erro').length
    };

    return (
        <div className="h-full flex flex-col gap-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                        <FileSpreadsheet className="w-6 h-6 text-green-500" />
                        Integração Google Forms (V9)
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                        Monitoramento de solicitações remotas e integração com Google Workspace.
                    </p>
                </div>
                <div className="flex gap-2">
                     <Button 
                        variant={viewMode === 'monitor' ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => setViewMode('monitor')}
                        icon={<Clock className="w-4 h-4"/>}
                    >
                        Monitoramento
                    </Button>
                    <Button 
                        variant={viewMode === 'config' ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => setViewMode('config')}
                        icon={<Code className="w-4 h-4"/>}
                    >
                        Configuração (Apps Script)
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                    <span className="text-xs text-slate-500 uppercase font-bold">Total Solicitações</span>
                    <div className="text-2xl font-mono text-slate-200 mt-1">{stats.total}</div>
                </div>
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                    <span className="text-xs text-emerald-500 uppercase font-bold">Concluídos</span>
                    <div className="text-2xl font-mono text-emerald-400 mt-1">{stats.concluido}</div>
                </div>
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                    <span className="text-xs text-amber-500 uppercase font-bold">Processando</span>
                    <div className="text-2xl font-mono text-amber-400 mt-1">{stats.processando}</div>
                </div>
                 <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                    <span className="text-xs text-red-500 uppercase font-bold">Erros</span>
                    <div className="text-2xl font-mono text-red-400 mt-1">{stats.erro}</div>
                </div>
            </div>

            {/* Main Content */}
            {viewMode === 'monitor' ? (
                <div className="flex-1 bg-slate-800 rounded-lg border border-slate-700 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/30">
                        <h3 className="font-bold text-slate-300">Fila de Processamento</h3>
                        <Button size="sm" onClick={handleSimulateWebhook} icon={<PlayCircle className="w-4 h-4"/>}>
                            Simular Nova Entrada (Webhook)
                        </Button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        <table className="w-full text-left text-sm text-slate-400">
                            <thead className="bg-slate-900/50 text-slate-500 text-xs uppercase sticky top-0">
                                <tr>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Solicitante</th>
                                    <th className="px-4 py-3">Processo (CNJ)</th>
                                    <th className="px-4 py-3">Recebido em</th>
                                    <th className="px-4 py-3 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {requests.map(req => (
                                    <tr key={req.id} className="hover:bg-slate-700/30 transition-colors">
                                        <td className="px-4 py-3">
                                            {req.status === 'concluido' && (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-900/30 text-emerald-400 text-xs border border-emerald-500/30">
                                                    <CheckCircle className="w-3 h-3" /> Concluído
                                                </span>
                                            )}
                                            {req.status === 'processando' && (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-amber-900/30 text-amber-400 text-xs border border-amber-500/30 animate-pulse">
                                                    <RefreshCw className="w-3 h-3 animate-spin" /> IA Analisando...
                                                </span>
                                            )}
                                            {req.status === 'pendente' && (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-700 text-slate-300 text-xs border border-slate-600">
                                                    <Clock className="w-3 h-3" /> Fila
                                                </span>
                                            )}
                                             {req.status === 'erro' && (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-900/30 text-red-400 text-xs border border-red-500/30">
                                                    <AlertCircle className="w-3 h-3" /> Falha
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-slate-200">{req.solicitante_nome}</div>
                                            <div className="text-xs opacity-60">{req.solicitante_email}</div>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-slate-300">{req.numero_processo}</td>
                                        <td className="px-4 py-3 text-xs">{new Date(req.created_at).toLocaleString()}</td>
                                        <td className="px-4 py-3 text-right">
                                            {req.minuta_drive_url && (
                                                <a href={req.minuta_drive_url} target="_blank" rel="noreferrer" className="text-amber-500 hover:text-amber-400 flex items-center gap-1 justify-end text-xs font-bold">
                                                    Minuta <ExternalLink className="w-3 h-3"/>
                                                </a>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="flex-1 bg-slate-800 rounded-lg border border-slate-700 p-6 overflow-y-auto animate-fadeIn">
                    <div className="max-w-3xl mx-auto">
                        <h3 className="text-lg font-bold text-slate-200 mb-4">Configuração do Trigger (Google Apps Script)</h3>
                        <p className="text-sm text-slate-400 mb-6">
                            Para conectar seu Formulário Google ao UaiJusV9, abra o editor de script do formulário e cole o código abaixo. 
                            Isso criará um gatilho (Trigger) que envia os dados para nossa API sempre que uma nova resposta for submetida.
                        </p>
                        
                        <div className="bg-[#1e1e1e] rounded-lg border border-slate-700 p-4 relative group">
                            <pre className="font-mono text-xs text-blue-300 leading-relaxed whitespace-pre-wrap">
                                {APPS_SCRIPT_CODE}
                            </pre>
                            <Button 
                                size="sm" 
                                variant="secondary" 
                                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => {
                                    navigator.clipboard.writeText(APPS_SCRIPT_CODE);
                                    addToast('Código copiado para a área de transferência', 'success');
                                }}
                            >
                                Copiar Código
                            </Button>
                        </div>
                        
                        <div className="mt-8 space-y-4">
                            <h4 className="text-sm font-bold text-slate-300">Instruções de Instalação:</h4>
                            <ol className="list-decimal list-inside text-sm text-slate-400 space-y-2">
                                <li>No Google Forms, clique em <strong>Mais (três pontos) &gt; Editor de script</strong>.</li>
                                <li>Apague o código existente e cole o código acima.</li>
                                <li>Salve o projeto com o nome "UaiJusTrigger".</li>
                                <li>No menu esquerdo, clique em <strong>Acionadores (Relógio)</strong>.</li>
                                <li>Clique em <strong>+ Adicionar Acionador</strong>.</li>
                                <li>Configure: <code>onFormSubmit</code> | <code>Do formulário</code> | <code>Ao enviar o formulário</code>.</li>
                                <li>Salve e autorize as permissões do Google.</li>
                            </ol>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
