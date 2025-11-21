
# Manual de Implementação UaiJusV7 - Full Stack

Este documento detalha a arquitetura e os passos necessários para implementar a versão completa (produção) do **UaiJusV7**, incluindo backend, banco de dados vetorial e processamento robusto de arquivos.

## 1. Arquitetura do Sistema

### Frontend (React + TypeScript)
Mantido conforme a demo atual, mas conectado a APIs REST/GraphQL.
- **Framework**: React 19
- **Estilização**: TailwindCSS
- **Upload de Lote**: Implementado via `<input webkitdirectory>` para envio de diretórios completos de processos.

### Backend (Python / FastAPI ou Node.js)
Camada intermediária responsável por orquestrar as chamadas de IA, gerenciar arquivos e segurança.
- **Serviço de Ingestão**: Recebe PDFs múltiplos, realiza OCR (se necessário) e "chunking".
- **RAG Engine**: Consulta o banco vetorial para encontrar jurisprudência do TJMG.
- **Orquestrador Gemini**: Monta os prompts com contexto enriquecido e gerencia o histórico.

### Banco de Dados & Vector Store
- **PostgreSQL**: Para dados estruturados (metadados dos processos, usuários, histórico de decisões).
- **Pinecone / ChromaDB / Weaviate**: Para armazenar *embeddings* de jurisprudência (Inteiro Teor de Acórdãos do TJMG).

---

## 2. Passo a Passo de Implementação

### Fase 1: Preparação do Ambiente de Dados (RAG)

1.  **Coleta de Dados**:
    *   Baixar base de dados pública de jurisprudência do TJMG.
    *   Focar em: Ementa, Inteiro Teor, Data de Julgamento, Relator.

2.  **Processamento (Embedding)**:
    *   Utilizar modelo de embedding multilingue (ex: `text-embedding-004`).
    *   Gerar vetores para cada ementa/acórdão.
    *   Armazenar no Vector DB.

### Fase 2: Backend (API)

1.  **Rota `/upload`**:
    *   Receber múltiplos PDFs (Multipart) de uma só vez.
    *   Processar textos e consolidar em um "Contexto do Caso".

2.  **Rota `/analyze`**:
    *   Recebe texto consolidado.
    *   Chama `gemini-2.5-flash` para extração de fatos e controvérsias.

3.  **Rota `/retrieve_jurisprudence` (RAG)**:
    *   Recebe: Tópico jurídico (ex: "Dano Moral - Banco").
    *   Busca no Vector DB os 3 acórdãos mais similares.
    *   Retorna os textos para o Frontend.

4.  **Rota `/draft`**:
    *   Recebe: Dados do caso + Decisões da Enquete + Jurisprudência selecionada.
    *   Gera a minuta final.

### Fase 3: Segurança e Deploy

1.  **Guardrails**:
    *   Implementar verificação de "Prompt Injection" (já simulada no frontend).
    *   Validar citações.

---

## 3. Como Testar (Modo Real vs. Demo)

### No App Atual (Demo Client-Side)
O aplicativo foi configurado para permitir **testes reais** de leitura de múltiplos PDFs diretamente no navegador.

1.  **Leitura de Lote**:
    *   Na aba **Análise**, clique no ícone de Upload.
    *   Selecione uma **PASTA** contendo os PDFs do processo (Inicial, Contestação, etc.).
    *   O sistema lerá todos os arquivos e enviará para o Gemini 2.5 Flash.

2.  **RAG Simulado**:
    *   Após a análise, o sistema dispara automaticamente uma busca por jurisprudência ("Enrichment").
    *   O Gemini atua como o banco de dados, sugerindo ementas reais/verossímeis baseadas em seu treinamento.
    *   Na aba **Enquete**, você verá as "Jurisprudências de Apoio" carregadas dinamicamente.

### Notas Técnicas
- O upload de diretórios depende do suporte do navegador ao atributo `webkitdirectory`.
- O limite de arquivos depende da memória do navegador, pois todos são convertidos para Base64 antes do envio. Em produção, isso seria via stream para o servidor.
