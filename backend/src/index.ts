import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { webhookRouter } from './routes/webhook';
import { ragRouter } from './routes/rag';

const app = new Hono();

// Middlewares
app.use('/*', cors());
app.use('/*', logger());

// Health Check
app.get('/', (c) => c.json({ 
    status: 'UaiJusV9 API Online 🚀', 
    version: '9.0.0',
    env: process.env.NODE_ENV || 'development'
}));

// Routes
app.route('/api/webhook', webhookRouter); // Google Forms
app.route('/api/rag', ragRouter);         // Frontend RAG Search

console.log(`
🚀 UaiJusV9 Backend Running
--------------------------
📡 Listening on port ${process.env.PORT || 3000}
🔗 Routes:
   - POST /api/webhook
   - POST /api/rag/search
`);

export default { 
  port: process.env.PORT || 3000, 
  fetch: app.fetch 
};