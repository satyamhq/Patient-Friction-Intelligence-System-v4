import fs from 'fs';
import path from 'path';
import https from 'https';
import { config } from '../config/env.js';
import { KnowledgeItem, RagIndexer } from '../intelligence/ragIndexer.js';
import { HealthcareQA, generateHealthcareKnowledge } from '../intelligence/generateHealthcareKnowledge.js';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  query: string;
  history?: ChatMessage[];
  role?: string;
  currentPath?: string;
  language?: string;
  mode?: 'hybrid' | 'gemini' | 'prebuilt';
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
  detectedLanguage: string;
  timestamp: string;
  isPrebuiltMatch?: boolean;
  prebuiltQuestion?: string;
  matchScore?: number;
}

export interface SuggestedQuestionItem {
  category: string;
  role: string;
  questions: string[];
}

export class GeminiRagService {
  private static instance: GeminiRagService;
  private knowledgeBase: KnowledgeItem[] = [];
  private prebuiltQuestions: HealthcareQA[] = [];
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

    // Load 1,000+ Verified Pre-built Healthcare Questions & Answers
    const prebuiltPath = path.join(this.dataDir, 'healthcare_1000_qa.json');
    if (fs.existsSync(prebuiltPath)) {
      try {
        const rawPrebuilt = fs.readFileSync(prebuiltPath, 'utf8');
        this.prebuiltQuestions = JSON.parse(rawPrebuilt);
        console.log(`[Gemini RAG] Loaded ${this.prebuiltQuestions.length} pre-built healthcare Q&As into memory.`);
      } catch (err) {
        console.error('[Gemini RAG Error] Could not parse healthcare_1000_qa.json:', err);
      }
    } else {
      try {
        this.prebuiltQuestions = generateHealthcareKnowledge();
        fs.writeFileSync(prebuiltPath, JSON.stringify(this.prebuiltQuestions, null, 2), 'utf8');
        console.log(`[Gemini RAG] Generated and loaded ${this.prebuiltQuestions.length} pre-built healthcare Q&As.`);
      } catch (err) {
        console.error('[Gemini RAG Error] Could not generate healthcare Q&As:', err);
      }
    }
  }

  public reloadIndex(): { success: boolean; totalItems: number; prebuiltItems: number } {
    try {
      const indexer = new RagIndexer();
      const { items } = indexer.generateKnowledgeBase();
      this.knowledgeBase = items;
      this.buildSearchIndex();
      this.prebuiltQuestions = generateHealthcareKnowledge();
      this.isInitialized = true;
      return { success: true, totalItems: items.length, prebuiltItems: this.prebuiltQuestions.length };
    } catch (err: any) {
      console.error('[Gemini RAG Error] Reload failed:', err);
      return { success: false, totalItems: this.knowledgeBase.length, prebuiltItems: this.prebuiltQuestions.length };
    }
  }

  /**
   * Search and filter from the 1,000+ Pre-built Healthcare Questions Library
   */
  public getPrebuiltQuestions(params: {
    category?: string;
    role?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): { items: HealthcareQA[]; total: number; categories: string[] } {
    let filtered = this.prebuiltQuestions;

    if (params.category && params.category !== 'all') {
      filtered = filtered.filter((q) => q.category === params.category);
    }

    if (params.role && params.role !== 'all') {
      filtered = filtered.filter((q) => q.role === params.role || q.role === 'all');
    }

    if (params.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      filtered = filtered.filter(
        (item) =>
          item.question.toLowerCase().includes(q) ||
          item.answer.toLowerCase().includes(q) ||
          (item.tags || []).some((t) => t.toLowerCase().includes(q)) ||
          (item.keywords || []).some((k) => k.toLowerCase().includes(q))
      );
    }

    const total = filtered.length;
    const offset = params.offset || 0;
    const limit = params.limit || 50;
    const paged = filtered.slice(offset, offset + limit);

    const categories = Array.from(new Set(this.prebuiltQuestions.map((q) => q.category)));

    return { items: paged, total, categories };
  }

  /**
   * Match a user query directly against the 1,000+ Pre-built Questions
   */
  public findPrebuiltMatch(query: string): { item: HealthcareQA; score: number } | null {
    if (this.prebuiltQuestions.length === 0) return null;
    const normQuery = query.toLowerCase().trim().replace(/[?!.,]/g, '');

    // 1. Exact or near-exact question match
    for (const item of this.prebuiltQuestions) {
      const normQ = item.question.toLowerCase().trim().replace(/[?!.,]/g, '');
      if (normQ === normQuery) {
        return { item, score: 1.0 };
      }
      if (normQ.includes(normQuery) && normQuery.length > 15) {
        return { item, score: 0.95 };
      }
      if (normQuery.includes(normQ) && normQ.length > 15) {
        return { item, score: 0.92 };
      }
    }

    // 2. Token overlap check
    const queryTokens = this.tokenize(query);
    if (queryTokens.length >= 2) {
      let bestItem: HealthcareQA | null = null;
      let maxOverlap = 0;

      for (const item of this.prebuiltQuestions) {
        const qTokens = this.tokenize(item.question);
        let matchCount = 0;
        for (const t of queryTokens) {
          if (qTokens.includes(t)) matchCount++;
        }
        const score = matchCount / Math.max(queryTokens.length, qTokens.length);
        if (score > 0.60 && score > maxOverlap) {
          maxOverlap = score;
          bestItem = item;
        }
      }

      if (bestItem && maxOverlap >= 0.60) {
        return { item: bestItem, score: Math.round(maxOverlap * 100) / 100 };
      }
    }

    return null;
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

  public detectLanguage(text: string, history?: ChatMessage[], fallbackLang?: string): string {
    const raw = (text || '').trim();
    if (!raw) return fallbackLang && fallbackLang !== 'auto' ? fallbackLang : 'en';

    // 1. Script checks for Indian native scripts
    if (/[\u0A00-\u0A7F]/.test(raw)) return 'pa'; // Gurmukhi / Punjabi
    if (/[\u0980-\u09FF]/.test(raw)) return 'bn'; // Bengali
    if (/[\u0B80-\u0BFF]/.test(raw)) return 'ta'; // Tamil
    if (/[\u0C00-\u0C7F]/.test(raw)) return 'te'; // Telugu
    if (/[\u0A80-\u0AFF]/.test(raw)) return 'gu'; // Gujarati
    if (/[\u0C80-\u0CFF]/.test(raw)) return 'kn'; // Kannada
    if (/[\u0D00-\u0D7F]/.test(raw)) return 'ml'; // Malayalam
    if (/[\u0600-\u06FF]/.test(raw)) return 'ur'; // Urdu / Arabic script
    if (/[\u0900-\u097F]/.test(raw)) {
      if (/\b(आहे|नाही|कसे|कुठे|मला|काय|करावे|रुग्णालय|डॉक्टर|औषध|तपासणी|बाळ|आरोग्य|होय|नाही)\b/i.test(raw)) {
        return 'mr'; // Marathi
      }
      return 'hi'; // Hindi
    }

    // 2. Hinglish check: Roman Hindi vocabulary, grammar constructs, interrogatives, healthcare slang
    const hinglishTokens = [
      'mujhe', 'mera', 'meri', 'mere', 'hum', 'humara', 'humari', 'aap', 'aapka', 'aapki', 'aapke', 'tum', 'tera', 'teri',
      'kya', 'kyun', 'kyu', 'kaise', 'kab', 'kahan', 'kidhar', 'kisko', 'chahiye', 'mangta', 'mangti',
      'karo', 'karna', 'karein', 'kare', 'karu', 'hoga', 'hogi', 'honge', 'hote', 'hota', 'hoti',
      'hain', 'hai', 'nahi', 'nahin', 'na', 'haan', 'hanji', 'theek', 'thik', 'batao', 'bataye', 'batayein', 'bataiye',
      'bimar', 'bimari', 'dawa', 'dawai', 'dawakhana', 'aspataal', 'aspatal', 'ilaaj', 'ilaj',
      'parchi', 'doctor', 'dikhana', 'dikhao', 'check', 'kitna', 'kitni', 'paise', 'paisa',
      'lagega', 'lagti', 'card', 'banna', 'banaye', 'banayein', 'banega', 'banta',
      'ambulance', 'bukhar', 'pet', 'sir', 'sar', 'khansi', 'saans', 'chot', 'chhati', 'seena',
      'delivery', 'bacha', 'bachhe', 'baccha', 'garbhavati', 'pregnant', 'mahila', 'aurat',
      'asha', 'didi', 'token', 'line', 'samay', 'waqt', 'milna', 'milega', 'madad', 'sahayata',
      'bhaiya', 'namaste', 'namaskar', 'khoon', 'jaanch', 'takleef', 'dard', 'sujan', 'chot',
      'ulti', 'dast', 'chakkar', 'kamzori', 'sasta', 'sasti', 'sarkari', 'jan aushadhi',
      'ayushman', 'suvidha', 'pension', 'muft', 'free'
    ];

    const lower = raw.toLowerCase();
    const hitCount = hinglishTokens.filter((token) => new RegExp(`\\b${token}\\b`, 'i').test(lower)).length;
    if (hitCount >= 1) {
      return 'hinglish';
    }

    // 3. Conversation Continuity: If query is short or neutral (e.g. "ok", "yes", "tell me more", "thanks", "schedule"),
    // inspect previous history to keep language consistent throughout conversation
    if (history && history.length > 0) {
      for (let i = history.length - 1; i >= 0; i--) {
        const h = history[i];
        if (h && h.content) {
          const prevLang = this.detectLanguage(h.content);
          if (prevLang && prevLang !== 'en') {
            return prevLang;
          }
        }
      }
    }

    if (fallbackLang && fallbackLang !== 'auto') {
      return fallbackLang;
    }

    return 'en';
  }

  private expandMultilingualQuery(query: string): string {
    const termMap: Record<string, string> = {
      // Hindi & Hinglish
      'pet': 'stomach abdominal gastric pain',
      'dard': 'pain emergency acute severe ache',
      'दर्द': 'pain emergency stomach chest ache',
      'ulti': 'vomiting nausea emesis',
      'उल्टी': 'vomiting nausea',
      'bukhar': 'fever pyrexia temperature',
      'बुखार': 'fever temperature pyrexia',
      'saans': 'breathing respiratory asthma shortness dyspnea',
      'सांस': 'breathing respiratory asthma shortness',
      'khansi': 'cough cold chest pulmonary bronchitis',
      'खांसी': 'cough cold pulmonary chest',
      'chhati': 'chest cardiac heart myocardial infarction',
      'छाती': 'chest cardiac heart',
      'dawa': 'medicine prescription pharmacy generic jan aushadhi',
      'dawai': 'medicine prescription pharmacy generic jan aushadhi',
      'दवा': 'medicine prescription pharmacy generic jan aushadhi',
      'aspataal': 'hospital facility opd clinic casualty emergency',
      'aspatal': 'hospital facility opd clinic',
      'अस्पताल': 'hospital facility opd clinic casualty',
      'ilaaj': 'treatment therapy consultation management care',
      'इलाज': 'treatment consultation therapy care',
      'parchi': 'token opd registration queue appointment',
      'पर्ची': 'token opd registration queue appointment',
      'token': 'queue opd token registration schedule wait time',
      'ayushman': 'ayushman bharat pmjay cashless insurance golden card abha',
      'आयुष्मान': 'ayushman bharat pmjay cashless insurance golden card',
      'bistar': 'bed icu ward admission occupancy casualty',
      'bed': 'bed icu ward admission occupancy availability',
      'बेड': 'bed icu ward admission occupancy',
      'delivery': 'delivery maternal pregnancy anc jsy pmsma obstetric labor',
      'garbhavati': 'pregnant maternal pregnancy anc high risk',
      'गर्भवती': 'pregnant maternal pregnancy anc',
      'bacha': 'child infant pediatric immunization vaccine rbsk newborn',
      'बच्चा': 'child infant pediatric immunization vaccine',
      'asha': 'asha frontline community health worker visit escort',
      'आशा': 'asha frontline community health worker visit escort',
      'jaanch': 'lab test diagnostic pathology blood urine xray usg',
      'जांच': 'lab test diagnostic pathology blood',
      'khoon': 'blood anemia transfusion hemoglobin bleeding',
      'खून': 'blood anemia transfusion hemoglobin',
      'paise': 'cost fee free cashless pmjay subsidy expenditure',
      'phone': 'helpline calling contact phone 6205844155 108',
      'call': 'call phone helpline direct 6205844155',

      // Punjabi
      'ਦਰਦ': 'pain emergency severe ache',
      'ਬੁਖ਼ਾਰ': 'fever temperature pyrexia',
      'ਖੰਘ': 'cough pulmonary chest',
      'ਦਵਾਈ': 'medicine prescription pharmacy',
      'ਹਸਪਤਾਲ': 'hospital facility clinic opd',
      'ਪਰਚੀ': 'token opd queue registration',
      'ਆਯੁਸ਼ਮਾਨ': 'ayushman bharat pmjay insurance card',
      'ਗਰਭਵਤੀ': 'pregnant maternal anc',
      'ਬੱਚਾ': 'child pediatric immunization',
      'ਐਂਬੂਲੈਂਸ': 'ambulance emergency 108',

      // Bengali
      'ব্যথা': 'pain emergency severe ache',
      'জ্বর': 'fever temperature pyrexia',
      'কাশি': 'cough cold chest',
      'ওষুধ': 'medicine prescription pharmacy generic',
      'হাসপাতাল': 'hospital facility opd clinic',
      'টোকেন': 'queue opd token registration',
      'আয়ুষ্মান': 'ayushman bharat pmjay card',
      'গর্ভবতী': 'pregnant maternal anc delivery',
      'শিশু': 'child infant pediatric immunization',

      // Marathi
      'वेदना': 'pain emergency ache',
      'ताप': 'fever temperature pyrexia',
      'खोकला': 'cough cold chest',
      'औषध': 'medicine prescription pharmacy generic',
      'रुग्णालय': 'hospital facility opd clinic',
      'तपासणी': 'lab test diagnostic pathology blood',
      'बाळ': 'child infant pediatric immunization',

      // Tamil
      'வலி': 'pain emergency severe ache',
      'காய்ச்சல்': 'fever temperature pyrexia',
      'இருமல்': 'cough cold chest',
      'மருந்து': 'medicine prescription pharmacy generic',
      'மருத்துவமனை': 'hospital facility opd clinic',
      'டோக்கன்': 'queue opd token appointment',
      'ஆயுஷ்மான்': 'ayushman bharat pmjay card',
      'கர்ப்பிணி': 'pregnant maternal anc delivery',

      // Telugu
      'నొప్పి': 'pain emergency severe ache',
      'జ్వరం': 'fever temperature pyrexia',
      'దగ్గు': 'cough cold chest',
      'మందులు': 'medicine prescription pharmacy generic',
      'ఆసుపత్రి': 'hospital facility opd clinic',
      'టోకెన్': 'queue opd token appointment',
      'ఆయుష్మాన్': 'ayushman bharat pmjay card',
      'గర్భిణీ': 'pregnant maternal anc delivery',

      // Gujarati
      'દર્દ': 'pain emergency ache',
      'તાવ': 'fever temperature pyrexia',
      'ખાંસી': 'cough cold chest',
      'દવા': 'medicine prescription pharmacy',
      'હોસ્પિટલ': 'hospital facility opd clinic',
      'ટોકન': 'queue opd token appointment',
      'આયુષ્માન': 'ayushman bharat pmjay card',

      // Kannada
      'ನೋವು': 'pain emergency severe ache',
      'ಜ್ವರ': 'fever temperature pyrexia',
      'ಕೆಮ್ಮು': 'cough cold chest',
      'ಔಷಧಿ': 'medicine prescription pharmacy generic',
      'ಆಸ್ಪತ್ರೆ': 'hospital facility opd clinic',
      'ಟೋಕನ್': 'queue opd token appointment',
      'ಆಯುಷ್ಮಾನ್': 'ayushman bharat pmjay card',

      // Malayalam
      'വേദന': 'pain emergency severe ache',
      'പനി': 'fever temperature pyrexia',
      'ചുമ': 'cough cold chest',
      'മരുന്ന്': 'medicine prescription pharmacy generic',
      'ആശുപത്രി': 'hospital facility opd clinic',
      'ടോക്കൺ': 'queue opd token appointment',
      'ആയുഷ്മാൻ': 'ayushman bharat pmjay card',

      // Urdu
      'درد': 'pain emergency severe ache',
      'بخار': 'fever temperature pyrexia',
      'کھانسی': 'cough cold chest',
      'دوا': 'medicine prescription pharmacy generic',
      'ہسپتال': 'hospital facility opd clinic',
      'پرچی': 'queue opd token appointment',
      'حمل': 'pregnant maternal anc delivery',
      'علاج': 'treatment consultation therapy care',
    };

    let expanded = query.toLowerCase();
    for (const [k, v] of Object.entries(termMap)) {
      if (expanded.includes(k.toLowerCase())) {
        expanded += ' ' + v;
      }
    }
    return expanded;
  }

  public retrieveContext(query: string, userRole?: string, topK = 6): { item: KnowledgeItem; score: number }[] {
    if (this.knowledgeBase.length === 0) return [];
    const expandedQuery = this.expandMultilingualQuery(query);
    const queryTokens = this.tokenize(expandedQuery);
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
    const { query, history = [], role = 'all', currentPath = '/', language, mode = 'hybrid' } = request;

    // Detect user language or respect explicit choice, taking history and conversation continuity into account
    let targetLang = (language && language !== 'auto') ? language : '';
    if (!targetLang) {
      targetLang = this.detectLanguage(query, history, language === 'auto' ? undefined : language);
    }

    // Direct Pre-built Match Check from 1,000+ Questions Library
    const prebuiltMatch = this.findPrebuiltMatch(query);

    // If pure pre-built mode requested and we have a strong match, return directly
    if (mode === 'prebuilt' && prebuiltMatch) {
      const matchItem = prebuiltMatch.item;
      return {
        answer: matchItem.answer,
        sources: [
          {
            file: matchItem.sourceFiles?.[0] || 'server/data/healthcare_1000_qa.json',
            category: matchItem.category,
            title: matchItem.question,
            relevanceScore: prebuiltMatch.score,
          },
        ],
        suggestedQuestions: this.deriveFollowUpQuestions(query, [], role),
        model: 'Pre-built Healthcare Knowledge Base (Instant Match)',
        retrievedCount: 1,
        detectedLanguage: targetLang || 'en',
        timestamp: new Date().toISOString(),
        isPrebuiltMatch: true,
        prebuiltQuestion: matchItem.question,
        matchScore: prebuiltMatch.score,
      };
    }

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

    let languageDirective = '';
    switch (targetLang) {
      case 'hinglish':
        languageDirective = `CRITICAL LANGUAGE REQUIREMENT: The user communicated in Hinglish (Hindi written using English/Roman characters).
You MUST reply ENTIRELY in natural, conversational, polite Indian Hinglish (e.g., "Namaste! Aapka swasthya hamari priority hai. Pet dard aur ulti ke case mein sabse pehle...").
Do NOT answer in pure English or pure Devanagari script. Retain standard medical abbreviations in English (e.g., OPD, ICU, ABHA ID, PM-JAY, ECG, BP).`;
        break;
      case 'hi':
        languageDirective = `CRITICAL LANGUAGE REQUIREMENT: The user communicated in Hindi (हिन्दी).
You MUST reply ENTIRELY in grammatically correct, polite, and empathetic Hindi using Devanagari script (हिन्दी).
Include medical terms in brackets if helpful (e.g., ओपीडी (OPD), आईसीयू (ICU), आयुष्मान भारत (PM-JAY)).`;
        break;
      case 'pa':
        languageDirective = `CRITICAL LANGUAGE REQUIREMENT: The user communicated in Punjabi (ਪੰਜਾਬੀ).
You MUST reply ENTIRELY in fluent, respectful Punjabi using Gurmukhi script (ਪੰਜਾਬੀ).`;
        break;
      case 'bn':
        languageDirective = `CRITICAL LANGUAGE REQUIREMENT: The user communicated in Bengali (বাংলা).
You MUST reply ENTIRELY in polite, authentic Bengali using Bengali script (বাংলা).`;
        break;
      case 'mr':
        languageDirective = `CRITICAL LANGUAGE REQUIREMENT: The user communicated in Marathi (मराठी).
You MUST reply ENTIRELY in fluent Marathi using Devanagari script (मराठी).`;
        break;
      case 'ta':
        languageDirective = `CRITICAL LANGUAGE REQUIREMENT: The user communicated in Tamil (தமிழ்).
You MUST reply ENTIRELY in polite Tamil using Tamil script (தமிழ்).`;
        break;
      case 'te':
        languageDirective = `CRITICAL LANGUAGE REQUIREMENT: The user communicated in Telugu (తెలుగు).
You MUST reply ENTIRELY in polite Telugu using Telugu script (తెలుగు).`;
        break;
      case 'gu':
        languageDirective = `CRITICAL LANGUAGE REQUIREMENT: The user communicated in Gujarati (ગુજરાતી).
You MUST reply ENTIRELY in polite Gujarati using Gujarati script (ગુજરાતી).`;
        break;
      case 'kn':
        languageDirective = `CRITICAL LANGUAGE REQUIREMENT: The user communicated in Kannada (ಕನ್ನಡ).
You MUST reply ENTIRELY in polite Kannada using Kannada script (ಕನ್ನಡ).`;
        break;
      case 'ml':
        languageDirective = `CRITICAL LANGUAGE REQUIREMENT: The user communicated in Malayalam (മലയാളം).
You MUST reply ENTIRELY in polite Malayalam using Malayalam script (മലയാളം).`;
        break;
      case 'ur':
        languageDirective = `CRITICAL LANGUAGE REQUIREMENT: The user communicated in Urdu (اردو).
You MUST reply ENTIRELY in polite, formal Urdu using Urdu/Arabic script (اردو).`;
        break;
      case 'en':
      default:
        languageDirective = `CRITICAL LANGUAGE REQUIREMENT: Reply in clear, professional, empathetic English.`;
        break;
    }

    const systemPrompt = `You are the official Gemini-Powered Healthcare Copilot for the Patient Friction Intelligence System (PFIS).
PFIS is a comprehensive healthcare accessibility and operational platform unifying Patients, Citizens, Doctors, ASHA Community Health Workers, Hospital Administrators, and Government Policy Makers.

${languageDirective}

Knowledge Base Instructions:
1. You are equipped with a primary knowledge base of 1,000+ pre-built, verified healthcare questions and answers covering:
   - Patient & Citizen care: OPD booking, ABHA ID creation, Ayushman Bharat PM-JAY eligibility and claims, Jan Aushadhi generic medicines, barrier checks, non-clinical triage.
   - Doctor & Specialist: OPD queue triage, e-prescriptions, clinical notes, lab investigations, teleconsultation rooms.
   - Hospital Desk: Live ICU/ward bed availability, casualty triage (Red/Yellow/Green/Black), blood bank, pharmacy inventory.
   - ASHA Field Workers: Antenatal care (ANC) registration, obstetric danger signs, postnatal home visits (HBNC), child immunization schedule, malnutrition (SAM) screening, offline sync.
   - Government & Schemes: JSY, PMSMA, RBSK, Nikshay Poshan Yojana, Patient Friction Index (PFI) formula.
   - 24/7 Care Helpline: Citizens can directly call **+91 6205844155**.

2. Primary Knowledge Matching & Translation: Use the retrieved pre-built Q&A context as your primary source of truth. Translate and synthesize the answers faithfully into the requested target language without losing medical meaning.
3. Fallback Reasoning: If the user's question does not exactly match the pre-built questions, use clinical-logistical reasoning to formulate an accurate, safe, empathetic, and actionable response in the target language.
4. Calling & Emergencies: If the user asks about calling, speaking with a human, or needs emergency care, explicitly inform them that they can directly call the 24/7 Healthcare Helpline at **+91 6205844155** or dial **108** for critical emergencies.
5. Format cleanly with GitHub markdown (bullet points, bold highlights, clear sections). Keep answers fast, concise, and easy to read.`;

    const prebuiltMatchSnippet = prebuiltMatch
      ? `\n\n🎯 HIGH-CONFIDENCE PRE-BUILT QUESTION MATCH (GROUND TRUTH):
Verified Question: "${prebuiltMatch.item.question}"
Verified Answer:
${prebuiltMatch.item.answer}
Category: ${prebuiltMatch.item.category.toUpperCase()} | Role: ${prebuiltMatch.item.role.toUpperCase()}
Match Confidence Score: ${(prebuiltMatch.score * 100).toFixed(0)}%`
      : '';

    const userPromptWithContext = `User Query: "${query}"
Target Response Language: ${targetLang.toUpperCase()}

User Context:
- Active Role: ${role.toUpperCase()}
- Current Page Path: ${currentPath}
${prebuiltMatchSnippet}

Retrieved Healthcare Knowledge Context (1,000+ Verified Q&A Base):
${contextSnippet}

Please provide the most accurate, helpful, and concise answer directly addressing the user's query in the designated target language (${targetLang}), synthesizing from the verified knowledge base and applying safe reasoning where necessary.`;

    let generatedText = '';
    let usedModel = this.primaryModel;

    // Try primary model and fallbacks
    const candidateModels = [this.primaryModel, ...this.fallbackModels];
    let succeeded = false;

    for (const model of candidateModels) {
      try {
        generatedText = await this.callGeminiApi(model, systemPrompt, userPromptWithContext, history);
        usedModel = prebuiltMatch ? `${model} (1,000+ Pre-built Q&A Hybrid)` : `${model} (AI Reasoning)`;
        succeeded = true;
        break;
      } catch (err: any) {
        console.warn(`[Gemini RAG] Model ${model} failed: ${err.message}. Trying next candidate...`);
      }
    }

    // Safe offline fallback if Gemini API is unreachable
    if (!succeeded || !generatedText) {
      console.warn('[Gemini RAG] All Gemini models failed or offline. Synthesizing direct RAG response.');
      usedModel = prebuiltMatch
        ? 'Pre-built Healthcare Knowledge Base (Direct Answer)'
        : 'Local RAG Knowledge Engine (Offline Fallback)';
      generatedText = prebuiltMatch
        ? prebuiltMatch.item.answer
        : this.synthesizeOfflineResponse(query, retrievedItems, targetLang);
    }

    // 4. Determine intelligent follow-up suggestions
    const suggestedQuestions = this.deriveFollowUpQuestions(query, retrievedItems, role);

    return {
      answer: generatedText,
      sources,
      suggestedQuestions,
      model: usedModel,
      retrievedCount: retrievedItems.length,
      detectedLanguage: targetLang,
      timestamp: new Date().toISOString(),
      isPrebuiltMatch: !!prebuiltMatch,
      prebuiltQuestion: prebuiltMatch?.item.question,
      matchScore: prebuiltMatch?.score,
    };
  }

  private synthesizeOfflineResponse(query: string, retrievedItems: KnowledgeItem[], targetLang: string): string {
    const top = retrievedItems[0];
    const secondary = retrievedItems.slice(1, 3);
    const hasMatch = retrievedItems.length > 0;

    const phrases: Record<string, { heading: string; related: string; helpline: string; noMatch: string }> = {
      hinglish: {
        heading: 'Health Guidance',
        related: 'Sambandhit Jankari:',
        helpline: '*Kisi bhi emergency ya turant guidance ke liye hamare 24/7 Helpline par call karein: **+91 6205844155** ya **108** dial karein.*',
        noMatch: `Mujhe "${query}" ke liye direct knowledge record nahi mila. Aap OPD appointment, Ayushman Bharat PM-JAY card, ya ASHA protocols ke bare mein pooch sakte hain.\n\n*Turant madad ke liye hamari 24/7 Healthcare Helpline par call karein: **+91 6205844155**.*`
      },
      hi: {
        heading: 'स्वास्थ्य मार्गदर्शन',
        related: 'संबंधित स्वास्थ्य जानकारी:',
        helpline: '*किसी भी आपात स्थिति या तत्काल मार्गदर्शन हेतु हमारी 24/7 हेल्पलाइन पर कॉल करें: **+91 6205844155** अथवा **108** डायल करें।*',
        noMatch: `"${query}" के लिए सीधा रिकॉर्ड नहीं मिला। आप ओपीडी पर्ची, आयुष्मान कार्ड, या जन औषधि केंद्र के बारे में पूछ सकते हैं।\n\n*तत्काल सहायता के लिए 24/7 हेल्पलाइन पर संपर्क करें: **+91 6205844155**।*`
      },
      pa: {
        heading: 'ਸਿਹਤ ਮਾਰਗਦਰਸ਼ਨ',
        related: 'ਸੰਬੰਧਿਤ ਸਿਹਤ ਜਾਣਕਾਰੀ:',
        helpline: '*ਐਮਰਜੈਂਸੀ ਜਾਂ ਤੁਰੰਤ ਮਦਦ ਲਈ ਸਾਡੀ 24/7 ਹੈਲਪਲਾਈਨ ਨੰਬਰ **+91 6205844155** ਜਾਂ **108** ਡਾਇਲ ਕਰੋ।*',
        noMatch: `"${query}" ਲਈ ਸਿੱਧਾ ਰਿਕਾਰਡ ਨਹੀਂ ਮਿਲਿਆ। ਤੁਸੀਂ ਓਪੀਡੀ ਟੋਕਨ, ਆਯੁਸ਼ਮਾਨ ਕਾਰਡ, ਜਾਂ ਦਵਾਈਆਂ ਬਾਰੇ ਪੁੱਛ ਸਕਦੇ ਹੋ।\n\n*ਸਾਡੀ 24/7 ਹੈਲਪਲਾਈਨ: **+91 6205844155**।*`
      },
      bn: {
        heading: 'স্বাস্থ্য নির্দেশিকা',
        related: 'সম্পর্কিত তথ্য:',
        helpline: '*জরুরি বা তাৎক্ষণিক সহায়তার জন্য আমাদের ২৪/৭ হেল্পলাইনে কল করুন: **+91 6205844155** বা **১০৮** ডায়াল করুন।*',
        noMatch: `"${query}" এর জন্য সরাসরি তথ্য মেলেনি। আপনি ওপিডি টোকেন, আয়ুষ্মান কার্ড বা ওষুধ সম্পর্কে জিজ্ঞাসা করতে পারেন।\n\n*২৪/৭ হেল্পলাইন: **+91 6205844155**।*`
      },
      mr: {
        heading: 'आरोग्य मार्गदर्शन',
        related: 'संबंधित माहिती:',
        helpline: '*तातडीच्या मदतीसाठी आमच्या २४/७ हेल्पलाइनवर कॉल करा: **+91 6205844155** किंवा **१०८** डायल करा.*',
        noMatch: `"${query}" साठी थेट माहिती सापडली नाही. आपण ओपीडी टोकन, आयुष्मान कार्ड किंवा औषधांबद्दल विचारू शकता.\n\n*२४/७ हेल्पलाइन: **+91 6205844155**.*`
      },
      ta: {
        heading: 'சுகாதார வழிகாட்டல்',
        related: 'தொடர்புடைய தகவல்:',
        helpline: '*அவசர உதவிக்கு எங்கள் 24/7 உதவி எண்ணை அழைக்கவும்: **+91 6205844155** அல்லது **108** ஐ டயல் செய்யவும்.*',
        noMatch: `"${query}" க்கான நேரடி பதிவு கிடைக்கவில்லை. OPD டோக்கன், ஆயுஷ்மான் அட்டை பற்றி கேட்கலாம்.\n\n*24/7 உதவி எண்: **+91 6205844155**.*`
      },
      te: {
        heading: 'ఆరోగ్య మార్గదర్శకత్వం',
        related: 'సంబంధిత సమాచారం:',
        helpline: '*తక్షణ సహాయం కోసం మా 24/7 హెల్ప్‌లైన్‌కు కాల్ చేయండి: **+91 6205844155** లేదా **108** డయల్ చేయండి.*',
        noMatch: `"${query}" కోసం నేరుగా సమాచారం దొరకలేదు. OPD టోకెన్ లేదా ఆయుష్మాన్ కార్డు గురించి అడగవచ్చు.\n\n*24/7 హెల్ప్‌లైన్: **+91 6205844155**.*`
      },
      gu: {
        heading: 'આરોગ્ય માર્ગદર્શન',
        related: 'સંબંધિત માહિતી:',
        helpline: '*તાત્કાલિક સહાય માટે અમારી 24/7 હેલ્પલાઇન પર કૉલ કરો: **+91 6205844155** અથવા **108** ડાયલ કરો.*',
        noMatch: `"${query}" માટે સીધો રેકોર્ડ મળ્યો નથી. આપ OPD ટોકન અથવા આયુષ્માન કાર્ડ વિશે પૂછી શકો છો.\n\n*24/7 હેલ્પલાઇન: **+91 6205844155**.*`
      },
      kn: {
        heading: 'ಆರೋಗ್ಯ ಮಾರ್ಗದರ್ಶನ',
        related: 'ಸಂಬಂಧಿತ ಮಾಹಿತಿ:',
        helpline: '*ತುರ್ತು ನೆರವಿಗಾಗಿ ನಮ್ಮ 24/7 ಹೆಲ್ಪ್‌ಲೈನ್‌ಗೆ ಕರೆ ಮಾಡಿ: **+91 6205844155** ಅಥವಾ **108** ಡಯಲ್ ಮಾಡಿ.*',
        noMatch: `"${query}" ಗಾಗಿ ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ. OPD ಟೋಕನ್ ಅಥವಾ ಆಯುಷ್ಮಾನ್ ಕಾರ್ಡ್ ಬಗ್ಗೆ ನೀವು ಕೇಳಬಹುದು.\n\n*24/7 ಹೆಲ್ಪ್‌ಲೈನ್: **+91 6205844155**.*`
      },
      ml: {
        heading: 'ആരോഗ്യ മാർഗ്ഗനിർദ്ദേശം',
        related: 'ബന്ധപ്പെട്ട വിവരങ്ങൾ:',
        helpline: '*അടിയന്തര സഹായത്തിന് ഞങ്ങളുടെ 24/7 ഹെൽപ്പ്‌ലൈൻ വിളിക്കുക: **+91 6205844155** അല്ലെങ്കിൽ **108** ഡയൽ ചെയ്യുക.*',
        noMatch: `"${query}" സംബന്ധിച്ച വിവരങ്ങൾ ലഭ്യമല്ല. OPD ടോക്കൺ അല്ലെങ്കിൽ ആയുഷ്മാൻ കാർഡിനെക്കുറിച്ച് ചോദിക്കാം.\n\n*24/7 ഹെൽപ്പ്‌ലൈൻ: **+91 6205844155**.*`
      },
      ur: {
        heading: 'طبی رہنمائی',
        related: 'متعلقہ معلومات:',
        helpline: '*فوری مدد کے لیے ہماری 24/7 ہیلپ لائن پر کال کریں: **+91 6205844155** یا **108** ملائیں۔*',
        noMatch: `"${query}" کے لیے ریکارڈ نہیں ملا۔ آپ او پی ڈی پرچی یا آیوشمان کارڈ کے متعلق پوچھ سکتے ہیں۔\n\n*24/7 ہیلپ لائن: **+91 6205844155**.*`
      },
      en: {
        heading: 'Platform Health Guidance',
        related: 'Related Platform Knowledge:',
        helpline: '*Need immediate human assistance? Call our 24/7 Healthcare Helpline directly at **+91 6205844155** or dial **108** for emergency.*',
        noMatch: `I could not locate specific matching records for "${query}". You can explore the role dashboards or ask about OPD appointments, Ayushman Bharat PM-JAY, ASHA worker protocols, or emergency services.\n\n*For immediate assistance, dial our 24/7 Healthcare Helpline at **+91 6205844155**.*`
      }
    };

    const p = phrases[targetLang] || phrases.en;
    if (!hasMatch) return p.noMatch;

    let res = `### ${top.question}\n\n${top.answer}\n\n`;
    if (secondary.length > 0) {
      res += `#### ${p.related}\n`;
      secondary.forEach((item) => {
        res += `- **${item.question}**: ${item.answer.substring(0, 180)}...\n`;
      });
    }
    res += `\n${p.helpline}`;
    return res;
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
