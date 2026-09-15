import fs from 'fs';
import path from 'path';
import https from 'https';
import { config } from '../config/env.js';
import { KnowledgeItem, RagIndexer } from '../intelligence/ragIndexer.js';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  query: string;
  history?: ChatMessage[];
  role?: string;
  currentPath?: string;
}

export interface SourceReference {
  file: string;
  category: string;
  title: string;
  relevanceScore: number;
}

export interface ChatResponse {
  answer: string;
  sources: SourceReference[];
  suggestedQuestions: string[];
  model: string;
  retrievedCount: number;
  timestamp: string;
}

export interface SuggestedQuestionItem {
  category: string;
  role: string;
  questions: string[];
}

export class GeminiRagService {
  private static instance: GeminiRagService;
  private knowledgeBase: KnowledgeItem[] = [];
  private idfMap: Map<string, number> = new Map();
  private avgDocLength = 0;
  private docLengths: number[] = [];
  private dataDir: string;
  private isInitialized = false;

  private primaryModel = 'gemini-3.6-flash';
  private fallbackModels = ['gemini-flash-latest', 'gemini-3.5-flash', 'gemini-3.5-flash-lite'];

  private constructor() {
    this.dataDir = path.resolve(process.cwd(), 'data');
    this.init();
  }

  public static getInstance(): GeminiRagService {
    if (!GeminiRagService.instance) {
      GeminiRagService.instance = new GeminiRagService();
    }
    return GeminiRagService.instance;
  }

  public init(): void {
    const kbPath = path.join(this.dataDir, 'rag_knowledge_base.json');
    if (!fs.existsSync(kbPath)) {
      console.log('[Gemini RAG] Knowledge base not found on disk. Invoking RAG indexer...');
      try {
        const indexer = new RagIndexer();
        indexer.generateKnowledgeBase();
      } catch (err) {
        console.error('[Gemini RAG Error] Failed to generate knowledge base:', err);
      }
    }

    if (fs.existsSync(kbPath)) {
      try {
        const raw = fs.readFileSync(kbPath, 'utf8');
        this.knowledgeBase = JSON.parse(raw);
        this.buildSearchIndex();
        this.isInitialized = true;
        console.log(`[Gemini RAG] Loaded ${this.knowledgeBase.length} knowledge items into memory index.`);
      } catch (err) {
        console.error('[Gemini RAG Error] Could not parse knowledge base:', err);
      }
    }
  }

  public reloadIndex(): { success: boolean; totalItems: number } {
    try {
      const indexer = new RagIndexer();
      const { items } = indexer.generateKnowledgeBase();
      this.knowledgeBase = items;
      this.buildSearchIndex();
      this.isInitialized = true;
      return { success: true, totalItems: items.length };
    } catch (err: any) {
      console.error('[Gemini RAG Error] Reload failed:', err);
      return { success: false, totalItems: this.knowledgeBase.length };
    }
  }

  public getStatus(): { totalItems: number; isInitialized: boolean; model: string; manifest?: any } {
    let manifest: any = null;
    const manifestPath = path.join(this.dataDir, 'knowledge_manifest.json');
    if (fs.existsSync(manifestPath)) {
      try {
        manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      } catch {
        // ignore
      }
    }

    return {
      totalItems: this.knowledgeBase.length,
      isInitialized: this.isInitialized,
      model: this.primaryModel,
      manifest,
    };
  }

  // -------------------------------------------------------------
  // Search & Retrieval (BM25 + TF-IDF)
  // -------------------------------------------------------------

  private tokenize(text: string): string[] {
    return (text || '')
      .toLowerCase()
      .replace(/[^a-z0-9_\-\s]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 1 && !this.isStopWord(t));
  }

  private isStopWord(word: string): boolean {
    const stops = new Set([
      'the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'in', 'to', 'for', 'of', 'with',
      'as', 'by', 'that', 'it', 'from', 'or', 'are', 'was', 'were', 'be', 'this', 'that',
      'how', 'what', 'where', 'when', 'who', 'why', 'can', 'do', 'does', 'did', 'have', 'has'
    ]);
    return stops.has(word);
  }

  private buildSearchIndex(): void {
    const N = this.knowledgeBase.length;
    if (N === 0) return;

    const docTermFreqs: Map<string, number>[] = [];
    const docFreq: Map<string, number> = new Map();
    let totalLen = 0;
    this.docLengths = [];

    this.knowledgeBase.forEach((item) => {
      const docText = `${item.question} ${item.question} ${item.answer} ${(item.tags || []).join(' ')} ${(item.keywords || []).join(' ')} ${(item.sourceFiles || []).join(' ')}`;
      const tokens = this.tokenize(docText);
      this.docLengths.push(tokens.length);
      totalLen += tokens.length;

      const tfMap = new Map<string, number>();
      const uniqueTokens = new Set<string>();

      tokens.forEach((t) => {
        tfMap.set(t, (tfMap.get(t) || 0) + 1);
        uniqueTokens.add(t);
      });

      docTermFreqs.push(tfMap);
      uniqueTokens.forEach((t) => {
        docFreq.set(t, (docFreq.get(t) || 0) + 1);
      });
    });

    this.avgDocLength = totalLen / N;
    this.idfMap = new Map();

    docFreq.forEach((df, term) => {
      // BM25 IDF formulation
      const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));
      this.idfMap.set(term, idf);
    });
  }

  public retrieveContext(query: string, userRole?: string, topK = 6): { item: KnowledgeItem; score: number }[] {
    if (this.knowledgeBase.length === 0) return [];
    const queryTokens = this.tokenize(query);
    if (queryTokens.length === 0) {
      return this.knowledgeBase.slice(0, topK).map((item) => ({ item, score: 1.0 }));
    }

    const k1 = 1.5;
    const b = 0.75;
    const scores: { item: KnowledgeItem; score: number }[] = [];

    const normalizedRole = (userRole || '').toLowerCase();

    for (let i = 0; i < this.knowledgeBase.length; i++) {
      const item = this.knowledgeBase[i];
      const docLen = this.docLengths[i] || this.avgDocLength;
      let score = 0;

      const docText = `${item.question} ${item.answer} ${(item.tags || []).join(' ')} ${(item.keywords || []).join(' ')}`;
      const lowerDoc = docText.toLowerCase();

      for (const token of queryTokens) {
        const idf = this.idfMap.get(token) || 0.5;
        // Check exact match in question for high boost
        if (item.question.toLowerCase().includes(token)) {
          score += idf * 2.5;
        }

        // Count frequency in document
        const count = (lowerDoc.match(new RegExp('\\b' + token + '\\b', 'g')) || []).length;
        if (count > 0) {
          const tf = count;
          const termScore = idf * ((tf * (k1 + 1)) / (tf + k1 * (1 - b + b * (docLen / this.avgDocLength))));
          score += termScore;
        }
      }

      // Role Relevance Boost
      if (normalizedRole && (item.role === normalizedRole || item.category === normalizedRole)) {
        score *= 1.35;
      }

      if (score > 0) {
        scores.push({ item, score });
      }
    }

    scores.sort((a, b) => b.score - a.score);
    return scores.slice(0, topK);
  }

  // -------------------------------------------------------------
  // Suggested Questions Catalog
  // -------------------------------------------------------------

  public getSuggestedQuestions(activeRole?: string): SuggestedQuestionItem[] {
    const defaultCatalog: SuggestedQuestionItem[] = [
      {
        category: 'Core System & Architecture',
        role: 'all',
        questions: [
          'What is the Patient Friction Intelligence System (PFIS) and what problem does it solve?',
          'What is the mathematical formula for Patient Friction Index (PFI)?',
          'How does the Digital Twin Simulator model patient queue delays and hospital surge?',
          'What full-stack technologies power the PFIS client and server?',
        ],
      },
      {
        category: 'Patient Accessibility',
        role: 'patient',
        questions: [
          'How can a patient request hospital transport or linguistic assistance?',
          'What is the OPD live queue tracker and how does it predict estimated wait times?',
          'How does the Patient Access Assessment evaluate barriers before hospital visits?',
          'How do patients store and access their longitudinal medical documents?',
        ],
      },
      {
        category: 'Doctor Workspace',
        role: 'doctor',
        questions: [
          'How does the Doctor Consultation Workspace integrate with patient health records?',
          'How do doctors dispatch digital laboratory orders and e-prescriptions?',
          'How does the doctor OPD queue prioritize high-friction or high-risk patients?',
          'How are secondary clinical referrals tracked across hospitals?',
        ],
      },
      {
        category: 'ASHA Frontline Desk',
        role: 'asha',
        questions: [
          'How does the ASHA worker offline sync mechanism work without internet?',
          'What is the maternal high-risk escalation protocol for ASHA workers?',
          'How do ASHA workers schedule household visits and record health indices?',
          'How can ASHA workers book OPD tokens on behalf of illiterate patients?',
        ],
      },
      {
        category: 'Hospital & Quality Operations',
        role: 'hospital',
        questions: [
          'How do hospital administrators monitor department congestion and bed occupancy?',
          'What facility quality metrics are evaluated on the Quality Dashboard?',
          'How are incoming emergency requests dispatched to specific hospital wards?',
          'How does PFIS handle pharmacy and diagnostic stock visibility?',
        ],
      },
      {
        category: 'Government & Public Health',
        role: 'government',
        questions: [
          'How does the Population Friction Map aggregate district-level healthcare barriers?',
          'What is the Intervention Optimizer algorithm and how does it calculate QALY saved?',
          'What is Care Leakage and how does PFIS detect it across referral networks?',
          'How does state leadership compare friction indices between rural and urban districts?',
        ],
      },
      {
        category: 'Admin & Judge Impact Mode',
        role: 'admin',
        questions: [
          'What is the Judge Mode Impact Dashboard and what criteria does it evaluate?',
          'How does PFIS enforce Role-Based Access Control (RBAC) across all routes?',
          'How does Google OAuth 2.0 and JWT authentication function in PFIS?',
          'Where are system audit logs and data quality metrics monitored?',
        ],
      },
    ];

    if (!activeRole || activeRole === 'all') {
      return defaultCatalog;
    }

    const matched = defaultCatalog.filter((cat) => cat.role === activeRole || cat.role === 'all');
    return matched.length > 0 ? matched : defaultCatalog;
  }

  // -------------------------------------------------------------
  // Gemini API Request Execution
  // -------------------------------------------------------------

  private async callGeminiApi(model: string, systemPrompt: string, userPrompt: string, history: ChatMessage[] = []): Promise<string> {
    const apiKey = config.geminiApiKey;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured on the server.');
    }

    // Format history for Gemini contents API
    const contents: any[] = [];

    // Add conversation history
    const recentHistory = history.slice(-6);
    for (const msg of recentHistory) {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      });
    }

    // Add current query with context
    contents.push({
      role: 'user',
      parts: [{ text: userPrompt }],
    });

    const payload = JSON.stringify({
      contents,
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      generationConfig: {
        temperature: 0.2,
        topP: 0.85,
        topK: 40,
        maxOutputTokens: 1200,
      },
    });

    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models/${model}:generateContent?key=${apiKey}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (res.statusCode === 200 && parsed.candidates && parsed.candidates[0]?.content?.parts[0]?.text) {
              resolve(parsed.candidates[0].content.parts[0].text);
            } else {
              const errMsg = parsed.error?.message || `HTTP ${res.statusCode}: ${data.substring(0, 200)}`;
              reject(new Error(errMsg));
            }
          } catch (e: any) {
            reject(new Error(`Failed to parse Gemini response: ${e.message}`));
          }
        });
      });

      req.on('error', (err) => reject(err));
      req.setTimeout(25000, () => {
        req.destroy();
        reject(new Error('Gemini API request timed out (25s)'));
      });

      req.write(payload);
      req.end();
    });
  }

  // -------------------------------------------------------------
  // Main Chat Handler
  // -------------------------------------------------------------

  public async chat(request: ChatRequest): Promise<ChatResponse> {
    const { query, history = [], role = 'all', currentPath = '/' } = request;

    // 1. Retrieve most relevant context items
    const searchResults = this.retrieveContext(query, role, 6);
    const retrievedItems = searchResults.map((r) => r.item);

    // 2. Extract unique source references
    const sourcesMap = new Map<string, SourceReference>();
    searchResults.forEach(({ item, score }) => {
      (item.sourceFiles || []).forEach((file) => {
        if (!sourcesMap.has(file)) {
          sourcesMap.set(file, {
            file,
            category: item.category,
            title: item.question,
            relevanceScore: Math.round(score * 10) / 10,
          });
        }
      });
    });

    const sources = Array.from(sourcesMap.values()).slice(0, 6);

    // 3. Construct Context Block
    const contextSnippet = retrievedItems
      .map(
        (item, idx) =>
          `[Knowledge #${idx + 1} (${item.category.toUpperCase()}) | Role: ${item.role.toUpperCase()}]\n` +
          `Question: ${item.question}\n` +
          `Answer: ${item.answer}\n` +
          `Source Files: ${(item.sourceFiles || []).join(', ')}\n`
      )
      .join('\n---\n');

    const systemPrompt = `You are the official Gemini-Powered AI Copilot for the Patient Friction Intelligence System (PFIS).
PFIS is a non-clinical healthcare logistics and accessibility platform that resolves real-world operational, geographical, linguistic, financial, and bureaucratic barriers preventing patient care completion.

Instructions:
1. Provide an accurate, detailed, and directly helpful answer based on the provided Codebase Knowledge Context and PFIS system architecture.
2. Maintain a professional, empathetic, and technically precise medical-logistics tone.
3. Explicitly cite the relevant source files (e.g. \`server/src/intelligence/friction/frictionEngine.ts\`, \`client/src/pages/patient/DigitalTwinSimulator.tsx\`) so the user can verify the codebase implementation.
4. Format your response cleanly using GitHub markdown (bullet points, bold highlights, tables, and short code snippets where appropriate).
5. If the user asks for actions relevant to their role (${role.toUpperCase()}) or current page (\`${currentPath}\`), provide actionable steps they can take on the platform.`;

    const userPromptWithContext = `User Query: "${query}"

User Context:
- Active Role: ${role.toUpperCase()}
- Current Page Path: ${currentPath}

Retrieved Codebase Knowledge Context:
${contextSnippet}

Please provide a comprehensive answer directly answering the user's question, citing the source files mentioned above.`;

    let generatedText = '';
    let usedModel = this.primaryModel;

    // Try primary model and fallbacks
    const candidateModels = [this.primaryModel, ...this.fallbackModels];
    let succeeded = false;

    for (const model of candidateModels) {
      try {
        generatedText = await this.callGeminiApi(model, systemPrompt, userPromptWithContext, history);
        usedModel = model;
        succeeded = true;
        break;
      } catch (err: any) {
        console.warn(`[Gemini RAG] Model ${model} failed: ${err.message}. Trying next candidate...`);
      }
    }

    // Safe offline fallback if Gemini API is unreachable
    if (!succeeded || !generatedText) {
      console.warn('[Gemini RAG] All Gemini models failed or offline. Synthesizing direct RAG response.');
      usedModel = 'Local RAG Knowledge Engine (Offline Fallback)';
      if (retrievedItems.length > 0) {
        const top = retrievedItems[0];
        const secondary = retrievedItems.slice(1, 3);

        generatedText = `### ${top.question}\n\n${top.answer}\n\n`;
        if (secondary.length > 0) {
          generatedText += `#### Related Platform Knowledge:\n`;
          secondary.forEach((item) => {
            generatedText += `- **${item.question}**: ${item.answer.substring(0, 180)}...\n`;
          });
        }
        generatedText += `\n*Source references: ${(top.sourceFiles || []).map((f) => `\`${f}\``).join(', ')}*`;
      } else {
        generatedText = `I could not locate specific matching records for "${query}". You can explore the role dashboards or ask about the Patient Friction Index, Digital Twin Simulator, ASHA Offline Sync, or API endpoints.`;
      }
    }

    // 4. Determine intelligent follow-up suggestions
    const suggestedQuestions = this.deriveFollowUpQuestions(query, retrievedItems, role);

    return {
      answer: generatedText,
      sources,
      suggestedQuestions,
      model: usedModel,
      retrievedCount: retrievedItems.length,
      timestamp: new Date().toISOString(),
    };
  }

  private deriveFollowUpQuestions(query: string, retrieved: KnowledgeItem[], role: string): string[] {
    const qLower = query.toLowerCase();
    const suggestions: string[] = [];

    if (qLower.includes('pfi') || qLower.includes('friction') || qLower.includes('formula')) {
      suggestions.push('How do wait times and transport distances affect the PFI score?');
      suggestions.push('How does the Government Population Friction Map aggregate local PFI scores?');
      suggestions.push('What are the critical threshold alerts for patient abandonment risk?');
    } else if (qLower.includes('digital twin') || qLower.includes('simulation') || qLower.includes('markov')) {
      suggestions.push('What parameters can be customized in the Digital Twin Simulator?');
      suggestions.push('How does the Monte Carlo engine simulate bad weather or transit strikes?');
      suggestions.push('Where is the discrete event simulation implemented in the backend?');
    } else if (qLower.includes('asha') || qLower.includes('offline') || qLower.includes('sync')) {
      suggestions.push('How does the ASHA worker offline sync resolve data conflicts?');
      suggestions.push('What is the maternal high-risk escalation protocol for ASHA workers?');
      suggestions.push('How are field visit logs stored locally in IndexedDB?');
    } else if (qLower.includes('doctor') || qLower.includes('consultation') || qLower.includes('prescription')) {
      suggestions.push('How does the Doctor Consultation Workspace link to longitudinal records?');
      suggestions.push('How are digital lab orders and prescriptions dispatched?');
      suggestions.push('How does the live OPD queue prioritize emergency tokens?');
    } else if (qLower.includes('api') || qLower.includes('route') || qLower.includes('endpoint')) {
      suggestions.push('What API endpoints are available for patient requests and consents?');
      suggestions.push('How are JWT authentication and RBAC roles enforced in the routes?');
      suggestions.push('How do I run the automated RAG codebase indexer?');
    } else {
      // Pick questions from other retrieved items
      retrieved.slice(1, 4).forEach((item) => {
        if (!suggestions.includes(item.question)) {
          suggestions.push(item.question);
        }
      });
    }

    // Default fallbacks if needed
    if (suggestions.length < 3) {
      const catalog = this.getSuggestedQuestions(role);
      catalog.forEach((cat) => {
        cat.questions.forEach((q) => {
          if (suggestions.length < 3 && !suggestions.includes(q)) {
            suggestions.push(q);
          }
        });
      });
    }

    return suggestions.slice(0, 3);
  }
}

export const geminiRagService = GeminiRagService.getInstance();
