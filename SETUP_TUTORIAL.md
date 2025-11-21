# 📘 Tutorial: Configuração do Ambiente de Desenvolvimento - UaiJus

> **Para Iniciantes** - Este guia explica passo a passo como configurar o projeto no seu computador local.

---

## 🎯 O que você vai aprender

- Como baixar o projeto do GitHub para seu computador
- Como configurar as variáveis de ambiente (arquivos `.env`)
- Como obter e usar as chaves do Supabase
- Como executar o projeto localmente

---

## 📋 Pré-requisitos

Antes de começar, você precisa ter instalado:

1. **Git** - Para baixar o código do GitHub
   - Download: https://git-scm.com/downloads
   - Teste no terminal: `git --version`

2. **Node.js** (versão 18 ou superior) - Para executar o projeto
   - Download: https://nodejs.org/
   - Teste no terminal: `node --version`

3. **Um editor de código** (recomendado: VS Code)
   - Download: https://code.visualstudio.com/

---

## 📥 Passo 1: Baixar o Projeto

### 1.1 Escolha uma pasta no seu computador

Abra o terminal (Prompt de Comando no Windows ou Terminal no Mac/Linux) e navegue até onde quer salvar o projeto:

```bash
# Exemplo: ir para a pasta Documentos
cd Documents

# Ou criar uma nova pasta para seus projetos
mkdir meus-projetos
cd meus-projetos
```

### 1.2 Clone o repositório

```bash
git clone https://github.com/ElciJunior00/ElciJunior00-UaiJusV9-forms_2.git
```

### 1.3 Entre na pasta do projeto

```bash
cd ElciJunior00-UaiJusV9-forms_2
```

---

## ⚙️ Passo 2: Configurar Variáveis de Ambiente

### 2.1 O que são arquivos `.env`?

Arquivos `.env` guardam informações sensíveis (como senhas e chaves de API) que não devem ser compartilhadas publicamente. Por isso, eles **não são incluídos no GitHub**.

O arquivo `.env.example` serve como um **modelo** mostrando quais variáveis você precisa configurar.

### 2.2 Copiar o arquivo de exemplo

#### **No Windows (PowerShell ou CMD):**

```powershell
# Entre na pasta backend
cd backend

# Copie o arquivo .env.example para .env
copy .env.example .env
```

#### **No Mac/Linux (Terminal):**

```bash
# Entre na pasta backend
cd backend

# Copie o arquivo .env.example para .env
cp .env.example .env
```

#### **Alternativa: Manualmente**

1. Abra a pasta `backend` no explorador de arquivos
2. Encontre o arquivo `.env.example`
3. Copie e cole na mesma pasta
4. Renomeie a cópia para `.env` (sem o "example")

---

## 🔑 Passo 3: Obter Chaves do Supabase

### 3.1 Acesse o painel do Supabase

1. Vá para: https://supabase.com/dashboard
2. Faça login na sua conta
3. Selecione seu projeto **UaiJusSupa**

### 3.2 Encontre as chaves de API

1. No menu lateral, clique em **"Settings"** (Configurações)
2. Clique em **"API"** ou **"API Keys"**
3. Você verá duas chaves importantes:

   - **Project URL** (URL do Projeto)
     - Exemplo: `https://krzvprootvinoibtlyvz.supabase.co`
   
   - **anon public** (Chave Pública)
     - Começa com `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
     - Clique no botão **"Copy"** para copiar

---

## ✏️ Passo 4: Editar o Arquivo `.env`

### 4.1 Abra o arquivo `.env` no editor

No VS Code:
1. Abra a pasta do projeto: `File > Open Folder`
2. Navegue até `backend/.env`
3. Clique para abrir

Ou use o Bloco de Notas:
```bash
# Windows
notepad backend\.env

# Mac
open -a TextEdit backend/.env

# Linux
gedit backend/.env
```

### 4.2 Substitua os valores

Você verá algo assim:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://krzvprootvinoibtlyvz.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Backend Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

**Substitua:**

1. `your_supabase_anon_key_here` → Cole a chave **anon public** que você copiou do Supabase

**Exemplo final:**

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://krzvprootvinoibtlyvz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtyenZwcm9vdHZpbm9pYnRseXZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTU2NzQwMTAsImV4cCI6MjAxMTI1MDAxMH0.abcdefghijklmnopqrstuvwxyz123456

# Backend Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

### 4.3 Salve o arquivo

- No VS Code: `Ctrl+S` (Windows/Linux) ou `Cmd+S` (Mac)
- No Bloco de Notas: `Arquivo > Salvar`

---

## 🚀 Passo 5: Instalar Dependências e Executar

### 5.1 Instalar pacotes do Backend

```bash
# Certifique-se de estar na pasta backend
cd backend

# Instale as dependências
npm install
```

### 5.2 Instalar pacotes do Frontend

```bash
# Volte para a raiz do projeto
cd ..

# Instale as dependências do frontend
npm install
```

### 5.3 Executar o projeto

**Em um terminal, rode o backend:**

```bash
cd backend
npm run dev
```

Você deve ver: `✓ Server running on port 3001`

**Em outro terminal, rode o frontend:**

```bash
# Na raiz do projeto
npm run dev
```

Você deve ver algo como: `Local: http://localhost:5173`

### 5.4 Abra no navegador

Acesse: http://localhost:5173

---

## ✅ Checklist de Verificação

Marque conforme você completa:

- [ ] Git instalado e funcionando
- [ ] Node.js instalado (versão 18+)
- [ ] Projeto clonado do GitHub
- [ ] Arquivo `.env` criado na pasta `backend`
- [ ] Chaves do Supabase copiadas para o `.env`
- [ ] Dependências instaladas (`npm install`)
- [ ] Backend rodando na porta 3001
- [ ] Frontend rodando na porta 5173
- [ ] Aplicação abrindo no navegador

---

## 🆘 Problemas Comuns

### Erro: "git não é reconhecido"

**Solução:** Instale o Git: https://git-scm.com/downloads

### Erro: "npm não é reconhecido"

**Solução:** Instale o Node.js: https://nodejs.org/

### Erro: "Port 3001 is already in use"

**Solução:** Algum programa está usando a porta 3001. Mude no arquivo `.env`:
```env
PORT=3002
```

### Erro: "Failed to fetch" no navegador

**Solução:** 
1. Verifique se o backend está rodando
2. Confirme que as chaves do Supabase estão corretas no `.env`
3. Verifique se não há erros no console do backend

### Arquivo `.env` não aparece

**Solução:** Arquivos que começam com `.` são ocultos por padrão.

**Windows:**
- No Explorador de Arquivos: `Exibir > Mostrar > Itens ocultos`

**Mac:**
- No Finder: `Cmd + Shift + .`

**Linux:**
- No terminal: `ls -la` mostra arquivos ocultos

---

## 📚 Recursos Adicionais

- **Documentação do Supabase:** https://supabase.com/docs
- **Documentação do Vite:** https://vitejs.dev/
- **Documentação do React:** https://react.dev/

---

## 💡 Dicas Importantes

1. **NUNCA** compartilhe seu arquivo `.env` ou faça commit dele no Git
2. Se você cometer seu `.env` acidentalmente, **regenere** suas chaves no Supabase imediatamente
3. O arquivo `.env.example` pode ser compartilhado - ele é apenas um modelo
4. Sempre rode `npm install` depois de baixar ou atualizar o projeto

---

## 🎓 Próximos Passos

Depois de configurar o ambiente:

1. Explore a estrutura de pastas do projeto
2. Leia o `README.md` para entender a arquitetura
3. Leia o `ARQUITETURA_COMPLETA.md` para detalhes técnicos
4. Comece a fazer suas modificações e testes

---

**✨ Parabéns! Você configurou com sucesso o ambiente de desenvolvimento do UaiJus!**

Se tiver dúvidas, consulte a documentação ou peça ajuda. Bom desenvolvimento! 🚀
