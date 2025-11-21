import { ai } from '../lib/gemini';
import { supabase } from '../lib/supabase';

export async function generateEmbeddings(text: string): Promise<number[]> {
  // Truncate text if too long for embedding model (max 2048 tokens usually, safe limit chars)
  const truncatedText = text.substring(0, 8000);
  
  const model = ai.getGenerativeModel({ model: "text-embedding-004"});
  const result = await model.embedContent(truncatedText);

  if (!result.embedding?.values) {
    throw new Error('Failed to generate embeddings');
  }

  return result.embedding.values;
}

export async function searchJurisprudence(queryText: string, threshold = 0.6, limit = 5) {
  try {
    const embedding = await generateEmbeddings(queryText);

    const { data, error } = await supabase.rpc('match_jurisprudencia', {
      query_embedding: embedding,
      match_threshold: threshold,
      match_count: limit
    });

    if (error) {
      console.error("Supabase RPC Error:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Vector Search Error:", error);
    return []; // Return empty array on failure to not break flow
  }
}