import { Hono } from 'hono';
import { searchJurisprudence } from '../services/vectorService';

const app = new Hono();

app.post('/search', async (c) => {
  try {
    const body = await c.req.json();
    const { query, context } = body;

    if (!query) {
      return c.json({ error: 'Query is required' }, 400);
    }

    // Combine query and context for better semantic search
    const searchText = context ? `${query}. Contexto: ${context}` : query;
    
    const results = await searchJurisprudence(searchText);

    return c.json({ results });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

export const ragRouter = app;