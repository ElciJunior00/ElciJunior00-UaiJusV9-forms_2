import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from "@google/genai";
import 'dotenv/config';

// Configuração para execução manual
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const GEMINI_KEY = process.env.GEMINI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY || !GEMINI_KEY) {
    console.error("❌ Erro: Variáveis de ambiente (SUPABASE_URL, SUPABASE_KEY, GEMINI_API_KEY) não encontradas.");
    console.error("Certifique-se de criar um arquivo .env na pasta /backend com essas chaves.");
    throw new Error("Env vars missing for seed script.");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const ai = new GoogleGenAI({ apiKey: GEMINI_KEY });

const JURISPRUDENCIA_MOCK = [
    {
        numero_acordao: "1.0000.23.123456-7/001",
        ementa: "APELAÇÃO CÍVEL - AÇÃO DE INDENIZAÇÃO - INTERRUPÇÃO DO FORNECIMENTO DE ENERGIA ELÉTRICA - DEMORA NO RESTABELECIMENTO - DANO MORAL CONFIGURADO - QUANTUM INDENIZATÓRIO - RAZOABILIDADE E PROPORCIONALIDADE. A interrupção do fornecimento de energia elétrica por tempo desarrazoado ultrapassa o mero dissabor, configurando dano moral passível de indenização.",
        decisao: "DERAM PROVIMENTO AO RECURSO",
        relator: "Des. Cláudia Maia"
    },
    {
        numero_acordao: "1.0024.14.123123-4/002",
        ementa: "EMENTA: APELAÇÃO CÍVEL - AÇÃO DECLARATÓRIA DE INEXISTÊNCIA DE DÉBITO C/C INDENIZAÇÃO POR DANOS MORAIS - NEGATIVAÇÃO INDEVIDA - DANO MORAL IN RE IPSA. A inscrição indevida em cadastro de inadimplentes enseja danos morais, os quais decorrem do próprio ato (in re ipsa), prescindindo de comprovação do prejuízo.",
        decisao: "NEGARAM PROVIMENTO",
        relator: "Des. Estevão Lucchesi"
    },
    {
         numero_acordao: "1.0701.19.000111-2/001",
         ementa: "APELAÇÃO - FORNECIMENTO DE ENERGIA - OSCILAÇÃO DE TENSÃO - QUEIMA DE APARELHOS ELETROELETRÔNICOS - NEXO DE CAUSALIDADE COMPROVADO - DEVER DE INDENIZAR. Comprovado o nexo de causalidade entre a oscilação de tensão na rede elétrica e a queima dos equipamentos da parte autora, impõe-se o dever da concessionária de reparar os danos materiais suportados.",
         decisao: "DERAM PARCIAL PROVIMENTO",
         relator: "Des. Cabral da Silva"
    },
    {
        numero_acordao: "1.0000.24.999888-1/001",
        ementa: "AGRAVO DE INSTRUMENTO - TUTELA DE URGÊNCIA - SAÚDE - FORNECIMENTO DE MEDICAMENTO - REQUISITOS PRESENTES. Presentes a probabilidade do direito e o perigo de dano, deve ser concedida a tutela de urgência para determinar o fornecimento de medicamento imprescindível ao tratamento da parte autora.",
        decisao: "DERAM PROVIMENTO",
        relator: "Des. José de Oliveira"
    },
    {
        numero_acordao: "1.0000.24.777666-2/001",
        ementa: "APELAÇÃO CÍVEL - DIREITO DO CONSUMIDOR - BANCO - FRAUDE EM EMPRÉSTIMO CONSIGNADO - DESCONTOS INDEVIDOS EM BENEFÍCIO PREVIDENCIÁRIO - FALHA NA PRESTAÇÃO DO SERVIÇO. A instituição financeira responde objetivamente pelos danos gerados por fortuito interno relativo a fraudes e delitos praticados por terceiros no âmbito de operações bancárias.",
        decisao: "NEGARAM PROVIMENTO",
        relator: "Des. Maria Silva"
    }
];

async function generateEmbedding(text: string) {
    const model = ai.getGenerativeModel({ model: "text-embedding-004"});
    const result = await model.embedContent(text);
    return result.embedding.values;
}

async function main() {
    console.log("🌱 Iniciando Seed do Banco de Dados...");

    for (const item of JURISPRUDENCIA_MOCK) {
        console.log(`Gerando vetor para Acórdão ${item.numero_acordao}...`);
        
        try {
            // 1. Gerar Embedding
            const embedding = await generateEmbedding(item.ementa);
            
            if (!embedding) {
                console.error(`Falha ao gerar embedding para ${item.numero_acordao}`);
                continue;
            }

            // 2. Inserir no Supabase
            const { error } = await supabase.from('jurisprudencia').upsert({
                numero_acordao: item.numero_acordao,
                ementa: item.ementa,
                decisao: item.decisao,
                relator: item.relator,
                embedding_ementa: embedding
            }, { onConflict: 'numero_acordao' });

            if (error) {
                console.error(`Erro ao inserir ${item.numero_acordao}:`, error.message);
            } else {
                console.log(`✅ Inserido: ${item.numero_acordao}`);
            }

        } catch (e) {
            console.error(`Erro processando item:`, e);
        }
    }
    
    console.log("🏁 Seed concluído!");
}

main();