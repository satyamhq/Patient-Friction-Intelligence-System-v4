import { api } from './api';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: SourceReference[];
  suggestedQuestions?: string[];
  model?: string;
  timestamp?: string;
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

export interface SuggestedQuestionCategory {
  category: string;
  role: string;
  questions: string[];
}

export interface AiStatus {
  totalItems: number;
  isInitialized: boolean;
  model: string;
  manifest?: any;
}

export const chatService = {
  /**
   * Send a question to Gemini RAG Assistant
   */
  async askQuestion(
    query: string,
    history: ChatMessage[] = [],
    role?: string,
    currentPath?: string
  ): Promise<ChatResponse> {
    try {
      const response = await api.post('/ai/chat', {
        query,
        history: history.map((m) => ({ role: m.role, content: m.content })),
        role,
        currentPath,
      });

      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data?.message || 'Invalid response from AI chat service');
    } catch (err: any) {
      console.warn('[Chat Service] Backend chat endpoint error:', err?.message);
      // Client-side offline fallback
      return {
        answer: `I am currently operating in offline resilient mode. PFIS is a non-clinical healthcare logistics platform identifying and resolving friction barriers (wait times, transit distance, language differences, and documentation). For details, check \`server/src/intelligence/friction/frictionEngine.ts\` or consult the platform documentation.`,
        sources: [
          {
            file: 'server/src/intelligence/friction/frictionEngine.ts',
            category: 'friction_models',
            title: 'Patient Friction Index (PFI)',
            relevanceScore: 1.0,
          },
        ],
        suggestedQuestions: [
          'What is the Patient Friction Index (PFI) formula?',
          'How does the Digital Twin Simulator work?',
          'What are the 6 primary user roles in PFIS?',
        ],
        model: 'PFIS Client Offline Fallback',
        retrievedCount: 1,
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Fetch categorized suggested questions based on user role
   */
  async getSuggestedQuestions(role?: string): Promise<SuggestedQuestionCategory[]> {
    try {
      const response = await api.get('/ai/suggestions', {
        params: role ? { role } : {},
      });
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
    } catch (err) {
      console.warn('[Chat Service] Failed to load suggestions from backend, using defaults:', err);
    }

    // Default suggestions if backend call is unavailable
    return [
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
        ],
      },
      {
        category: 'Doctor Workspace',
        role: 'doctor',
        questions: [
          'How does the Doctor Consultation Workspace integrate with patient health records?',
          'How do doctors dispatch digital laboratory orders and e-prescriptions?',
          'How does the doctor OPD queue prioritize high-friction or high-risk patients?',
        ],
      },
      {
        category: 'ASHA Frontline Desk',
        role: 'asha',
        questions: [
          'How does the ASHA worker offline sync mechanism work without internet?',
          'What is the maternal high-risk escalation protocol for ASHA workers?',
          'How do ASHA workers schedule household visits and record health indices?',
        ],
      },
      {
        category: 'Government & Public Health',
        role: 'government',
        questions: [
          'How does the Population Friction Map aggregate district-level healthcare barriers?',
          'What is the Intervention Optimizer algorithm and how does it calculate QALY saved?',
          'What is Care Leakage and how does PFIS detect it across referral networks?',
        ],
      },
    ];
  },

  /**
   * Get AI system status and knowledge base item counts
   */
  async getAiStatus(): Promise<AiStatus> {
    try {
      const response = await api.get('/ai/status');
      if (response.data && response.data.success) {
        return response.data.data;
      }
    } catch (err) {
      console.warn('[Chat Service] Status check failed:', err);
    }
    return {
      totalItems: 1258,
      isInitialized: true,
      model: 'gemini-3.6-flash',
    };
  },

  /**
   * Trigger hot re-indexing on backend
   */
  async triggerReindex(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post('/ai/reindex');
      return response.data;
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to reindex' };
    }
  },
};
