
# Documentação Técnica e Arquitetura - UaiJusV9-forms

**Versão:** 9.0.0
**Data:** 20/11/2025
**Autor:** Equipe UaiJus TJMG

---

## 1. VISÃO GERAL

O **UaiJusV9-forms** representa uma evolução significativa do sistema, integrando a interface do **Google Forms** como ponto de entrada para solicitações de análise processual. Esta arquitetura permite que assessores e juízes solicitem análises remotamente, sem a necessidade de VPN, recebendo relatórios e minutas formatadas diretamente em seu Google Drive.

### 1.1 Inovações da Versão 9
- **Acesso Remoto via Google Forms**: Eliminação de barreiras de infraestrutura.
- **Banco Vetorial de Jurisprudência**: Implementação de RAG (Retrieval-Augmented Generation) com embeddings de 768 dimensões (Supabase + pgvector).
- **Filtro Anti-Injection**: Camada de segurança aprimorada contra ataques em prompts.
- **Custo Zero de Infraestrutura**: Utilização de quotas gratuitas do Google Workspace e Gemini Flash.

---

## 2. ARQUITETURA TÉCNICA

A arquitetura é baseada em quatro camadas principais, conforme diagrama de fluxo (ver PDF página 2).

### Stack Tecnológico
- **Frontend de Solicitação**: Google Forms + Google Apps Script.
- **Orquestrador**: UaiJus Engine (Node.js/React) + Webhooks.
- **IA Core**: Google Gemini 2.5 Flash (Análise) + Gemini 3.0 Pro (Raciocínio).
- **Banco de Dados**: Supabase (PostgreSQL) + pgvector (Extension).

### Fluxo de Dados (Pipeline)

1.  **CAMADA DE ENTRADA (Solicitação)**
    *   Usuário preenche Google Forms (CNJ, PDF Url).
    *   Trigger `onFormSubmit` do Apps Script captura dados.
    *   Webhook POST enviado para API UaiJus.

2.  **CAMADA DE PROCESSAMENTO (Engine)**
    *   Download e OCR dos PDFs.
    *   **Análise IA**: Gemini 2.5 Flash extrai fatos e controvérsias.
    *   **Busca RAG**: Consulta vetorial na tabela `jurisprudencia` buscando acórdãos similares (>0.75 threshold).
    *   **Geração de Questionário**: IA cria um JSON de enquete baseado nas controvérsias.

3.  **CAMADA DE SAÍDA**
    *   Criação de Google Doc (Relatório de Análise).
    *   Envio de Email de Notificação.
    *   Geração de Minuta DOCX ao final.

---

## 3. ESTRUTURA DE ARQUIVOS (Frontend Web)

O frontend React serve agora como **Dashboard de Monitoramento** e **Console de Operação**.

```text
/
├── components/
│   ├── FormsIntegrationTab.tsx # [NOVO V9] Monitoramento de solicitações Forms
│   ├── AnalysisTab.tsx         # Upload Manual (Legacy V8)
│   └── Sidebar.tsx             # Navegação atualizada
├── services/
│   └── geminiService.ts        # Adicionado generateQuestionnaire()
├── types.ts                    # Adicionado FormRequest e VectorJurisprudence
└── utils/
```

---

## 4. BANCO DE DADOS & RAG (Supabase)

Esquema SQL completo para suportar a V9.

### Tabela: `jurisprudencia`
Armazena o conhecimento jurídico vetorial.

```sql
CREATE TABLE jurisprudencia (
 id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 numero_processo TEXT,
 numero_acordao TEXT UNIQUE NOT NULL,
 ementa TEXT NOT NULL,
 decisao TEXT,
 embedding_ementa VECTOR(768), -- Gerado por text-embedding-004
 embedding_decisao VECTOR(768)
);

-- Índice HNSW para busca rápida
CREATE INDEX idx_embedding_ementa_hnsw 
ON jurisprudencia 
USING hnsw (embedding_ementa vector_cosine_ops) 
WITH (m = 16, ef_construction = 64);
```

### Tabela: `processos_forms`
Gerencia o estado das solicitações via Forms.

```sql
CREATE TABLE processos_forms (
 id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 form_response_id TEXT UNIQUE NOT NULL,
 solicitante_nome TEXT NOT NULL,
 solicitante_email TEXT,
 numero_processo TEXT NOT NULL,
 pdf_drive_url TEXT,
 minuta_drive_url TEXT,
 status TEXT DEFAULT 'pendente', -- pendente, processando, concluido, erro
 controversias JSONB,
 enquete_json JSONB
);
```

---

## 5. CONFIGURAÇÃO GOOGLE FORMS

Para habilitar a integração, o seguinte Apps Script deve ser anexado ao formulário (Disponível na aba "Integração Google Forms"):

```javascript
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
}
```

---

## 6. SERVIÇOS E LÓGICA (Gemini Integration)

### `generateQuestionnaire(analysis, jurisprudence)`
Nova função crítica da V9.
- **Input**: Resultado da análise inicial + Jurisprudência recuperada via RAG.
- **Output**: JSON estruturado para criar um Google Form de "Enquete" dinâmico.
- **Objetivo**: Permitir que o juiz valide as premissas da IA antes da redação da minuta final.

---

## 7. SEGURANÇA

- **Autenticação**: OAuth 2.0 para serviços Google.
- **RLS (Row Level Security)**: No Supabase, garantindo que cada assessor veja apenas seus processos.
- **Auditoria**: Logs completos de quem solicitou e o tempo de processamento.

---

## 8. ROADMAP DE IMPLEMENTAÇÃO

### Fase 1: Preparação (Concluída)
- [x] Definição de Arquitetura V9.
- [x] Criação do Frontend de Monitoramento.
- [x] Definição dos Schemas SQL.

### Fase 2: Backend Node.js (Próximos Passos)
- [ ] Implementar Webhook Receiver (Express.js).
- [ ] Conectar `pdf-parse` para ler stream do Google Drive.
- [ ] Implementar lógica de escrita no Google Docs API.

### Fase 3: Banco Vetorial
- [ ] Popular Supabase com 1000 acórdãos iniciais.
- [ ] Gerar embeddings.

---

**Documentação gerada para UaiJusV9-forms.**
