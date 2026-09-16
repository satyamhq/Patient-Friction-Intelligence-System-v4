import { api } from './api';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: SourceReference[];
  suggestedQuestions?: string[];
  model?: string;
  detectedLanguage?: string;
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
  detectedLanguage?: string;
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
    currentPath?: string,
    language?: string
  ): Promise<ChatResponse> {
    try {
      const response = await api.post('/ai/chat', {
        query,
        history: history.map((m) => ({ role: m.role, content: m.content })),
        role,
        currentPath,
        language,
      });

      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data?.message || 'Invalid response from AI chat service');
    } catch (err: any) {
      console.warn('[Chat Service] Backend chat endpoint error:', err?.message);
      // Client-side offline fallback
      const offlineAnswers: Record<string, string> = {
        hinglish: `Main offline mode mein operate kar raha hoon. PFIS ek non-clinical healthcare intelligence platform hai jo hospital wait times, transit, aur documentation friction ko kam karta hai.\n\nKisi bhi zaroorat ya emergency guidance ke liye hamare 24/7 Helpline par call karein: **+91 6205844155** ya **108** dial karein.`,
        hi: `मैं वर्तमान में ऑफ़लाइन मोड में काम कर रहा हूँ। PFIS स्वास्थ्य पहुंच की बाधाओं (ओपीडी कतार, दूरी, आयुष्मान कवरेज) को हल करता है।\n\nतत्काल सहायता के लिए हमारी 24/7 हेल्पलाइन पर संपर्क करें: **+91 6205844155** अथवा **108** डायल करें।`,
        pa: `ਮੈਂ ਇਸ ਸਮੇਂ ਔਫਲਾਈਨ ਮੋਡ ਵਿੱਚ ਹਾਂ। PFIS ਸਿਹਤ ਸੇਵਾਵਾਂ ਦੀਆਂ ਰੁਕਾਵਟਾਂ ਨੂੰ ਹੱਲ ਕਰਦਾ ਹੈ।\n\nਤੁਰੰਤ ਮਦਦ ਲਈ ਸਾਡੀ 24/7 ਹੈਲਪਲਾਈਨ: **+91 6205844155** ਜਾਂ **108** ਡਾਇਲ ਕਰੋ।`,
        bn: `আমি বর্তমানে অফলাইন মোডে রয়েছি। PFIS স্বাস্থ্যসেবার বাধা নিরসনে কাজ করে।\n\nজরুরি সহায়তার জন্য ২৪/৭ হেল্পলাইনে কল করুন: **+91 6205844155** বা **১০৮** ডায়াল করুন।`,
        mr: `मी सध्या ऑफलाइन मोडमध्ये आहे. PFIS आरोग्य अडथळे दूर करण्यासाठी मदत करते.\n\nतातडीच्या मदतीसाठी २४/৭ हेल्पलाइनवर संपर्क करा: **+91 6205844155** किंवा **१०८** डायल करा.`,
        ta: `நான் தற்போது ஆஃப்லைன் பயன்முறையில் உள்ளேன். PFIS சுகாதார தடைகளை தீர்க்க உதவுகிறது.\n\nஉடனடி உதவிக்கு 24/7 உதவி எண்: **+91 6205844155** அல்லது **108** அழைக்கவும்.`,
        te: `నేను ప్రస్తుతం ఆఫ్‌లైన్ మోడ్‌లో ఉన్నాను. PFIS ఆరోగ్య అడ్డంకులను పరిష్కరిస్తుంది.\n\nతక్షణ సహాయం కోసం మా 24/7 హెల్ప్‌లైన్‌కు కాల్ చేయండి: **+91 6205844155** లేదా **108** డయల్ చేయండి.`,
        gu: `હું હાલમાં ઑફલાઇન મોડમાં કાર્યરત છું. PFIS આરોગ્ય સંભાળની મુશ્કેલીઓ નિવારે છે.\n\nતાત્કાલિક સહાય માટે અમારી 24/7 હેલ્પલાઇન પર કૉલ કરો: **+91 6205844155** અથવા **108** ડાયલ કરો.`,
        kn: `ನಾನು ಪ್ರಸ್ತುತ ಆಫ್‌ಲೈನ್ ಮೋಡ್‌ನಲ್ಲಿದ್ದೇನೆ. PFIS ಆರೋಗ್ಯ ಅಡೆತಡೆಗಳನ್ನು ನಿವಾರಿಸುತ್ತದೆ.\n\nತುರ್ತು ನೆರವಿಗಾಗಿ ನಮ್ಮ 24/7 ಹೆಲ್ಪ್‌ಲೈನ್‌ಗೆ ಕರೆ ಮಾಡಿ: **+91 6205844155** ಅಥವಾ **108** ಡಯಲ್ ಮಾಡಿ.`,
        ml: `ഞാൻ ഇപ്പോൾ ഓഫ്‌ലൈൻ മോഡിലാണ് പ്രവർത്തിക്കുന്നത്. PFIS ആരോഗ്യ തടസ്സങ്ങൾ പരിഹരിക്കുന്നു.\n\nഅടിയന്തര സഹായത്തിന് ഞങ്ങളുടെ 24/7 ഹെൽപ്പ്‌ലൈൻ വിളിക്കുക: **+91 6205844155** അല്ലെങ്കിൽ **108** ഡയൽ ചെയ്യുക.`,
        ur: `میں فی الوقت آف لائن موڈ میں کام کر رہا ہوں۔ PFIS طبی سہولیات کی رسائی کو آسان بناتا ہے۔\n\nفوری رہنمائی کے لیے ہماری 24/7 ہیلپ لائن پر رابطہ کریں: **+91 6205844155** یا **108** ملائیں۔`,
        en: `I am currently operating in offline resilient mode. PFIS is a non-clinical healthcare logistics platform identifying and resolving friction barriers (wait times, transit distance, language differences, and documentation). For immediate assistance, call our 24/7 Healthcare Helpline at **+91 6205844155** or dial **108** for emergency.`
      };

      const ans = (language && offlineAnswers[language]) ? offlineAnswers[language] : offlineAnswers.en;

      return {
        answer: ans,
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
        detectedLanguage: language || 'en',
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
