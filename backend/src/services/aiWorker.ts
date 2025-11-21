import { ai } from "../lib/gemini";
import { supabase } from "../lib/supabase";
import { searchJurisprudence } from "./vectorService";
import { extractTextFromDrive } from "./pdfService"; // Real Service
import { Type } from "@google/genai";

interface PipelineData {
  responseId: string;
  solicitante: string;
  matricula: string;
  processo: string;
  pdfUrl: string;
}

export async function analyzeCasePipeline(data: PipelineData) {
  const startTime = Date.now();
  console.log(`🚀 Starting pipeline for ${data.processo}`);
  
  try {
    await updateStatus(data.responseId, 'processando');

    // 1. Extrair Texto (Real Download & Parse)
    console.log("📥 Downloading and extracting text from PDF...");
    const fullText = await extractTextFromDrive(data.pdfUrl);

    // 2. Análise Gemini (Flash)
    console.log("🧠 Analyzing text with Gemini...");
    const analysisResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Analise este processo jurídico e extraia JSON. Ignore cabeçalhos irrelevantes:\n${fullText.substring(0, 30000)}`, // Limit char count for context window safety
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    resumo: { type: Type.STRING },
                    controversias: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                point: { type: Type.STRING },
                                authorVersion: { type: Type.STRING },
                                defendantVersion: { type: Type.STRING }
                            }
                        }
                    }
                }
            }
        }
    });
    
    const analysis = JSON.parse(analysisResponse.text || "{}");

    // 3. RAG (Busca Vetorial)
    console.log("🔍 Searching jurisprudence (RAG)...");
    const jurisprudencia = await searchJurisprudence(analysis.resumo);

    // 4. Gerar Enquete (Gemini)
    console.log("📝 Generating questionnaire...");
    const enqueteResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `
            Crie um questionário para o juiz validar a minuta.
            Caso: ${analysis.resumo}
            Jurisprudência recuperada: ${JSON.stringify(jurisprudencia)}
        `,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    titulo: { type: Type.STRING },
                    perguntas: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                questao: { type: Type.STRING },
                                sugestao: { type: Type.STRING }
                            }
                        }
                    }
                }
            }
        }
    });

    const enquete = JSON.parse(enqueteResponse.text || "{}");

    // 5. Finalizar
    const duration = (Date.now() - startTime) / 1000;
    
    await supabase.from('processos_forms').update({
        status: 'concluido',
        controversias: analysis.controversias,
        enquete_json: enquete,
        tempo_processamento_segundos: Math.floor(duration),
        // In production: create doc via Google Docs API and save URL
        minuta_drive_url: 'https://docs.google.com/document/d/EXAMPLE_DOC_ID' 
    }).eq('form_response_id', data.responseId);

    console.log(`✅ Pipeline finished for ${data.processo} in ${duration}s`);

  } catch (error: any) {
    console.error(`❌ Error in pipeline:`, error);
    await updateStatus(data.responseId, 'erro', error.message);
  }
}

async function updateStatus(id: string, status: string, msg?: string) {
    await supabase.from('processos_forms')
        .update({ status, erro_mensagem: msg })
        .eq('form_response_id', id);
}
