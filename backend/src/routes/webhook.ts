import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { supabase } from '../lib/supabase';
import { analyzeCasePipeline } from '../services/aiWorker';

const app = new Hono();

// Schema do Payload do Google Apps Script
const formSchema = z.object({
  responseId: z.string(),
  solicitante: z.string(),
  matricula: z.string(),
  processo: z.string(), // CNJ
  pdfUrl: z.string().url()
});

app.post('/', zValidator('json', formSchema), async (c) => {
  const data = c.req.valid('json');
  
  console.log(`📥 Webhook received for case: ${data.processo}`);

  // 1. Salva status inicial "Pendente" no Supabase (Instantâneo)
  // Isso libera o Google Forms para não dar timeout
  const { error } = await supabase
    .from('processos_forms')
    .insert({
      form_response_id: data.responseId,
      solicitante_nome: data.solicitante,
      solicitante_matricula: data.matricula,
      numero_processo: data.processo,
      pdf_drive_url: data.pdfUrl,
      status: 'pendente'
    });

  if (error) {
    console.error('Supabase Insert Error:', error);
    return c.json({ error: error.message }, 500);
  }

  // 2. Dispara o processamento pesado em background (Fire & Forget)
  // Não usamos await aqui propositalmente para responder rápido ao Forms
  analyzeCasePipeline(data).catch(err => console.error("Background Worker Error:", err));

  return c.json({ 
    success: true, 
    message: 'Solicitação recebida. Processamento iniciado em background.' 
  });
});

export const webhookRouter = app;