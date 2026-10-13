import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Parser from 'rss-parser';
import { createRequire } from 'module';
import { GoogleGenAI, Type } from '@google/genai';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.NODE_ENV === 'production' && process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const rssParser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 StudyMind-NewsBot/1.0',
    'Accept': 'application/rss+xml, application/xml, text/xml, */*'
  },
  timeout: 10000,
});

// Configure JSON body parser with increased limit for PDF base64 payloads
app.use(express.json({ limit: '25mb' }));

// Initialize Gemini SDK with User-Agent telemetry
const apiKey = process.env.GEMINI_API_KEY || '';
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

// Health / status endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    aiConfigured: !!apiKey,
    model: 'gemini-3.8-flash',
    timestamp: new Date().toISOString(),
  });
});

// Helper for formatting system prompt based on language
function getSystemInstruction(languageMode: string) {
  let langInstruction = 'Respond in clear, accessible English.';
  if (languageMode === 'Telugu') {
    langInstruction = 'Respond in fluent, natural Telugu (తెలుగు లిపి). Provide accurate vocabulary, clear explanations, and respectful tone.';
  } else if (languageMode === 'Telugu + English') {
    langInstruction = 'Respond in a bilingual mix of Telugu and English (Tanglish and Telugu script where helpful), as used by students in Andhra Pradesh and Telangana. Keep technical terms in English and explain intuition in Telugu.';
  }

  return `You are StudyMind AI, a warm, pedagogical, encouraging personal study companion and tutor.
Your mission is to make learning crystal clear, structured, and engaging for students.
- Break down complex concepts into step-by-step logic.
- Use formatting (bullet points, bold highlights, concise analogies, code blocks with syntax highlighting).
- Always be academically rigorous yet approachable.
- Language style: ${langInstruction}`;
}

// 1. AI Study Assistant Chat Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured on the server. Please ensure GEMINI_API_KEY is set in server environment secrets.',
      });
    }

    const { messages, languageMode = 'Simple English' } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    // Build contents for multi-turn conversation
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: getSystemInstruction(languageMode),
        temperature: 0.7,
      },
    });

    const reply = response.text || 'I could not generate a response at this time. Please try again.';
    res.json({ reply });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: error?.message || 'An error occurred while communicating with StudyMind AI.',
    });
  }
});

// 2. Extract Text from PDF Endpoint
app.post('/api/extract-pdf', async (req, res) => {
  try {
    const { base64Data, fileName } = req.body;
    if (!base64Data) {
      return res.status(400).json({ error: 'No PDF data provided.' });
    }

    const cleanBase64 = base64Data.replace(/^data:application\/pdf;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');

    if (buffer.length > 15 * 1024 * 1024) {
      return res.status(400).json({
        error: 'PDF file exceeds the 15MB limit. Please upload a smaller document.',
      });
    }

    const parsed = await pdfParse(buffer);
    const extractedText = (parsed.text || '').trim();

    if (!extractedText || extractedText.length < 20) {
      return res.status(422).json({
        error: `Could not extract readable text from "${fileName || 'this file'}". The document might be an image-only scan or password-protected. Please copy and paste the text directly or provide an accessible PDF.`,
      });
    }

    res.json({
      success: true,
      pages: parsed.numpages,
      textLength: extractedText.length,
      text: extractedText.slice(0, 30000), // safe truncation for prompt token budget
    });
  } catch (error: any) {
    console.error('PDF Parse error:', error);
    res.status(500).json({
      error: 'Failed to process PDF document. The file might be corrupted or incompatible.',
    });
  }
});

// 3. Notes Generator Endpoint
app.post('/api/generate-notes', async (req, res) => {
  try {
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured on the server.',
      });
    }

    const { content, topic, languageMode = 'Simple English', noteType = 'detailed' } = req.body;
    if (!content && !topic) {
      return res.status(400).json({ error: 'Please provide either a topic or study material content.' });
    }

    let noteTypePrompt = 'Comprehensive and structured study notes';
    if (noteType === 'concise') {
      noteTypePrompt = 'High-yield quick revision cheat-sheet with bullet points and summaries';
    } else if (noteType === 'exam-oriented') {
      noteTypePrompt = 'Exam-focused mastery notes highlighting high-probability questions, definitions, formulas, and key pitfalls';
    }

    const prompt = `Please generate high-quality academic study notes.
Target Topic: ${topic || 'Extracted Document Material'}
Note Style: ${noteTypePrompt}

Source Material/Context:
${content ? content.slice(0, 15000) : 'Synthesize comprehensive knowledge on this topic.'}

Format the response cleanly with Markdown headings:
# 📚 [Topic Title] - Comprehensive Study Notes
## 📌 Executive Summary
## 🎯 Core Concepts & Key Principles
## 📖 Essential Definitions & Terminology
## 💡 Real-World Examples & Practical Analogies
## 📝 High-Yield Revision Points
## ❓ Quick Self-Test Practice Questions (with short answers)
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: getSystemInstruction(languageMode),
        temperature: 0.6,
      },
    });

    res.json({ notes: response.text });
  } catch (error: any) {
    console.error('Notes generation error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate study notes.',
    });
  }
});

// 4. Exam Simulator Endpoint
app.post('/api/generate-exam', async (req, res) => {
  try {
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured on the server.',
      });
    }

    const { subject, topic, difficulty = 'Medium', questionCount = 5 } = req.body;
    if (!subject || !topic) {
      return res.status(400).json({ error: 'Subject and topic are required.' });
    }

    const count = Math.min(Math.max(parseInt(questionCount, 10) || 5, 3), 15);

    const prompt = `Generate exactly ${count} multiple choice test questions for:
Subject: ${subject}
Topic: ${topic}
Difficulty: ${difficulty}

Every question must be pedagogically sound, realistic, and contain exactly 4 options (A, B, C, D).
Provide the correct option index (0 for A, 1 for B, 2 for C, 3 for D), and a thorough explanation.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING },
            topic: { type: Type.STRING },
            difficulty: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING },
                },
                required: ['id', 'question', 'options', 'correctIndex', 'explanation'],
              },
            },
          },
          required: ['questions'],
        },
      },
    });

    const parsedJson = JSON.parse(response.text || '{}');
    res.json(parsedJson);
  } catch (error: any) {
    console.error('Exam generator error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate exam questions. Please try again.',
    });
  }
});

// 5. Daily News Endpoint with In-Memory Caching
interface CachedNews {
  timestamp: number;
  data: any[];
}
const newsCache: Record<string, CachedNews> = {};
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

const RSS_FEEDS: Record<string, string[]> = {
  'all': [
    'https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en',
    'https://timesofindia.indiatimes.com/rssfeedstopstories.cms',
  ],
  'india': [
    'https://news.google.com/rss/headlines/section/topic/NATION?hl=en-IN&gl=IN&ceid=IN:en',
    'https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms',
  ],
  'ap-ts': [
    'https://news.google.com/rss/search?q=Andhra+Pradesh+OR+Telangana+Hyderabad+Amaravati&hl=en-IN&gl=IN&ceid=IN:en',
    'https://timesofindia.indiatimes.com/rssfeeds/2950623.cms',
  ],
  'world': [
    'https://news.google.com/rss/headlines/section/topic/WORLD?hl=en-IN&gl=IN&ceid=IN:en',
    'http://feeds.bbci.co.uk/news/world/rss.xml',
  ],
  'technology': [
    'https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=en-IN&gl=IN&ceid=IN:en',
    'https://timesofindia.indiatimes.com/rssfeeds/66949542.cms',
  ],
  'education': [
    'https://news.google.com/rss/search?q=Education+India+UGC+CBSE+NEET+JEE+Exam+Admissions&hl=en-IN&gl=IN&ceid=IN:en',
    'https://timesofindia.indiatimes.com/rssfeeds/913168846.cms',
  ],
  'science': [
    'https://news.google.com/rss/headlines/section/topic/SCIENCE?hl=en-IN&gl=IN&ceid=IN:en',
  ],
};

app.get('/api/news', async (req, res) => {
  const category = (req.query.category as string) || 'all';
  const forceRefresh = req.query.refresh === 'true';

  const cacheKey = category;
  const now = Date.now();

  if (!forceRefresh && newsCache[cacheKey] && now - newsCache[cacheKey].timestamp < CACHE_TTL_MS) {
    return res.json({
      category,
      cached: true,
      lastUpdated: new Date(newsCache[cacheKey].timestamp).toISOString(),
      articles: newsCache[cacheKey].data,
    });
  }

  const urls = RSS_FEEDS[category] || RSS_FEEDS['all'];
  const allArticles: any[] = [];
  let feedErrors: string[] = [];

  for (const url of urls) {
    try {
      const feed = await rssParser.parseURL(url);
      if (feed && feed.items) {
        for (const item of feed.items) {
          if (!item.title || !item.link) continue;
          allArticles.push({
            id: item.guid || item.link,
            title: item.title.trim(),
            link: item.link,
            pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
            source: feed.title?.replace('Google News - ', '')?.replace('Google News', 'Google News India') || 'News Bureau',
            snippet: (item.contentSnippet || item.content || '').replace(/<[^>]*>/g, '').trim().slice(0, 240),
            category,
          });
        }
      }
    } catch (err: any) {
      console.warn(`RSS fetch failed for ${url}:`, err.message);
      feedErrors.push(err.message);
    }
  }

  // Deduplicate by title similarity or link
  const seenTitles = new Set<string>();
  const uniqueArticles = allArticles.filter((art) => {
    const key = art.title.toLowerCase().slice(0, 40);
    if (seenTitles.has(key)) return false;
    seenTitles.add(key);
    return true;
  });

  if (uniqueArticles.length === 0) {
    return res.status(502).json({
      error: 'Unable to fetch live news feeds at the moment. Please check your internet connection and try refreshing.',
      details: feedErrors,
    });
  }

  // Sort by pubDate descending
  uniqueArticles.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
  const finalArticles = uniqueArticles.slice(0, 30);

  newsCache[cacheKey] = {
    timestamp: now,
    data: finalArticles,
  };

  res.json({
    category,
    cached: false,
    lastUpdated: new Date(now).toISOString(),
    articles: finalArticles,
  });
});

// Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`StudyMind AI server running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Server failed to start:', err);
});
