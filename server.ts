import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

// Request body parser with 25MB limit to support base64 image uploads
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Initialize GoogleGenAI server-side with User-Agent header for telemetry
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'NovaTools Platform',
    owner: 'Ariyan',
    chatbot: 'Ariyan Bot',
    hasGeminiKey: Boolean(apiKey),
    timestamp: new Date().toISOString(),
  });
});

interface ChatIncomingMessage {
  role: 'user' | 'assistant';
  content: string;
  image?: {
    data: string; // base64 string
    mimeType: string;
    name?: string;
  };
}

// POST /api/chat - Ariyan Bot conversational and vision AI endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { messages, enableSearch } = req.body as {
      messages?: ChatIncomingMessage[];
      enableSearch?: boolean;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: 'INVALID_REQUEST',
        message: 'A non-empty list of messages is required.',
      });
    }

    if (!ai) {
      return res.status(503).json({
        error: 'MISSING_API_KEY',
        message:
          'GEMINI_API_KEY is not configured on the server. To enable Ariyan Bot with full AI intelligence, vision analysis, and live web grounding, please configure your GEMINI_API_KEY in the environment secrets.',
      });
    }

    // Convert messages to Gemini API contents format
    // Map 'assistant' role to 'model'
    const contents = messages.map(msg => {
      const parts: Array<any> = [];

      if (msg.image && msg.image.data) {
        // Strip out data URL prefix if present
        const cleanBase64 = msg.image.data.replace(/^data:[^;]+;base64,/, '');
        parts.push({
          inlineData: {
            mimeType: msg.image.mimeType || 'image/jpeg',
            data: cleanBase64,
          },
        });
      }

      if (msg.content) {
        parts.push({
          text: msg.content,
        });
      } else if (parts.length === 0) {
        parts.push({ text: ' ' });
      }

      return {
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts,
      };
    });

    const systemInstruction =
      'You are Ariyan Bot, an intelligent, helpful, and friendly AI assistant created by Ariyan for NovaTools (https://novatools.app). ' +
      'You assist users with questions, writing, learning, coding, technical analysis, and image understanding in English, Bengali (বাংলা), and other languages. ' +
      'Maintain an encouraging, professional, and clear tone. Format code, lists, and key points cleanly using Markdown. ' +
      'When analyzing images, describe key visual details accurately, answer user inquiries regarding the image, and note visible text or UI elements. ' +
      'If you are uncertain about a fact, acknowledge the limitation rather than fabricating information. ' +
      'The website owner and creator is Ariyan. Your official name is Ariyan Bot.';

    const config: any = {
      systemInstruction,
    };

    let response: any = null;
    let searchNotice = '';

    if (enableSearch) {
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents,
          config: {
            ...config,
            tools: [{ googleSearch: {} }],
          },
        });
      } catch (searchErr: any) {
        console.warn('Google Search Grounding unavailable, falling back to core model knowledge:', searchErr?.message);
        searchNotice = '\n\n*(Note: Live Google web search is currently unavailable or quota-limited on this API key. This response was generated using Ariyan Bot’s core model knowledge.)*';
      }
    }

    if (!response) {
      response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents,
        config,
      });
    }

    const reply = (response.text || 'I processed your request, but no text output was generated.') + searchNotice;

    // Extract grounding search metadata if web search was used
    const candidate = response.candidates?.[0];
    const groundingMetadata = candidate?.groundingMetadata;
    const webSearchQueries: string[] = groundingMetadata?.webSearchQueries || [];
    const rawChunks = groundingMetadata?.groundingChunks || [];

    const sources: Array<{ title: string; url: string }> = [];
    for (const chunk of rawChunks) {
      if (chunk.web?.uri) {
        sources.push({
          title: chunk.web.title || chunk.web.uri,
          url: chunk.web.uri,
        });
      }
    }

    return res.json({
      reply,
      sources,
      webSearchQueries,
      model: 'gemini-3.1-flash-lite',
    });
  } catch (err: any) {
    console.error('Error in Ariyan Bot API:', err);
    const errorMessage =
      err?.message || 'An unexpected error occurred while processing your request with Ariyan Bot.';
    return res.status(500).json({
      error: 'AI_PROCESSING_ERROR',
      message: errorMessage,
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  // Serve static assets from public/ folder with proper mime types
  app.use(express.static(path.resolve(__dirname, 'public')));

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`NovaTools server running at http://0.0.0.0:${port}`);
    console.log(`Creator: Ariyan | AI Assistant: Ariyan Bot`);
  });
}

startServer();
