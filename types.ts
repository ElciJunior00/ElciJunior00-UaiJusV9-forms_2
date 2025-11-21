
export enum CaseStatus {
  EmExame = 'Em Exame',
  Examinado = 'Examinado',
  Novo = 'Novo'
}

export enum Tab {
  Analise = 'analise',
  Enquete = 'enquete',
  Minutas = 'minutas',
  Config = 'config',
  Forms = 'forms' // New Tab
}

export interface AppSettings {
  defaultModel: string;
  advancedModel: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  safetyLevel: 'low' | 'medium' | 'high';
}

export const DEFAULT_SETTINGS: AppSettings = {
  defaultModel: 'gemini-2.5-flash',
  advancedModel: 'gemini-3-pro-preview',
  temperature: 0.2,
  maxTokens: 8192,
  systemPrompt: 'Você é um Assessor Jurídico Virtual do Tribunal de Justiça de Minas Gerais (TJMG). Atue com precisão, técnica e imparcialidade.',
  safetyLevel: 'medium'
};

export interface AnalysisLog {
  analyzedAt: string;
  fileCount: number;
  fileNames: string[];
  summaryPreview: string;
}

export interface Controversy {
  point: string;
  authorVersion: string;
  defendantVersion: string;
  evidenceStatus: string;
}

export interface AnalysisResult {
  metadata?: {
    number: string;
    type: string;
    title: string;
    date: string;
  };
  summary: string;
  risk: string; // 'SAFE' | 'RISK'
  riskReason?: string;
  controversies: Controversy[];
  suggestedIssues: {
    title: string;
    suggestion: string;
    type: 'preliminar' | 'merito';
  }[];
  fileNames?: string[]; 
}

export interface JurisprudenceItem {
  id: string;
  text: string;
  selected: boolean;
}

export interface LegalIssue {
  id: string;
  title: string;
  aiSuggestion: string;
  reasoning: string;
  decision: 'DEFERIR' | 'INDEFERIR' | 'FIXAR' | null;
  jurisprudence: JurisprudenceItem[];
  type?: 'preliminar' | 'merito';
}

export interface Case {
  id: string;
  number: string;
  status: CaseStatus;
  title: string;
  date: string;
  type: string;
  summary?: string;
  analysisLog?: AnalysisLog; 
  analysisResult?: AnalysisResult; 
  issues?: LegalIssue[]; 
}

// --- NEW UaiJusV9 Types (based on PDF SQL) ---

export interface VectorJurisprudence {
  id: string;
  numero_processo: string;
  numero_acordao: string;
  data_julgamento: string;
  relator: string;
  ementa: string;
  decisao: string;
  assunto: string;
  similarity?: number;
}

export interface FormRequest {
  id: string; // UUID
  form_response_id: string;
  solicitante_nome: string;
  solicitante_matricula: string;
  solicitante_email: string;
  numero_processo: string;
  pdf_drive_url: string;
  minuta_drive_url?: string;
  status: 'pendente' | 'processando' | 'concluido' | 'erro';
  erro_mensagem?: string;
  tempo_processamento_segundos?: number;
  created_at: string; // TIMESTAMPTZ
}

// Mock Data for Development
export const MOCK_CASES: Case[] = [
  {
    id: '1',
    number: '5030768-12.2023.8.13.0701',
    status: CaseStatus.EmExame,
    title: 'Indenização por Dano Material',
    date: '19/11/2025',
    type: 'PROCEDIMENTO COMUM CÍVEL',
    summary: 'Ação indenizatória movida contra concessionária de energia elétrica devido à oscilação de rede que supostamente danificou equipamentos eletrônicos.',
    analysisLog: {
      analyzedAt: '19/11/2025 10:30',
      fileCount: 2,
      fileNames: ['Inicial.pdf', 'Contestação.pdf'],
      summaryPreview: 'Ação indenizatória movida contra concessionária...'
    }
  }
];

export const MOCK_ISSUES: LegalIssue[] = [
  {
    id: 'p1',
    title: 'Preliminar de Ilegitimidade Passiva',
    type: 'preliminar',
    aiSuggestion: 'INDEFERIR. A jurisprudência deste E. TJMG é pacífica no sentido de que a responsabilidade da concessionária de serviço público é objetiva. A parte ré participou da cadeia de fornecimento.',
    reasoning: '',
    decision: null,
    jurisprudence: [
      { id: 'j1', text: 'TJMG - Apelação Cível 1.0000.23.123456-7/001 - Rel. Des. Silva - Legitimidade da Concessionária confirmada.', selected: true },
      { id: 'j2', text: 'STJ - AgRg no AREsp 876543 - Cadeia de consumo e responsabilidade solidária.', selected: false }
    ]
  },
  {
    id: 'm1',
    title: 'Ponto Controvertido: Ocorrência do Dano Moral',
    type: 'merito',
    aiSuggestion: 'FIXAR como ponto controvertido. A existência e a extensão do abalo anímico dependem de prova, especialmente testemunhal, a ser produzida na fase de instrução.',
    reasoning: '',
    decision: null,
    jurisprudence: []
  },
  {
    id: 'req1',
    title: 'Requerimento de Prova Pericial (Autor)',
    type: 'merito',
    aiSuggestion: 'DEFERIR. A prova técnica é essencial para aferir a extensão dos danos no veículo, sendo crucial para o deslinde da controvérsia.',
    reasoning: '',
    decision: null,
    jurisprudence: []
  }
];
