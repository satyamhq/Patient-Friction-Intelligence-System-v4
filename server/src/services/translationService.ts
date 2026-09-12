export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  dialects: { code: string; name: string; nativeName: string }[];
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    direction: 'ltr',
    dialects: [
      { code: 'standard', name: 'Standard English', nativeName: 'Standard English' },
      { code: 'indian', name: 'Indian English', nativeName: 'Indian English' },
    ],
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    direction: 'ltr',
    dialects: [
      { code: 'standard', name: 'Standard Hindi (खड़ी बोली)', nativeName: 'मानक हिन्दी' },
      { code: 'bhojpuri', name: 'Bhojpuri (भोजपुरी)', nativeName: 'भोजपुरी' },
      { code: 'awadhi', name: 'Awadhi (अवधी)', nativeName: 'अवधी' },
      { code: 'braj', name: 'Braj (ब्रज भाषा)', nativeName: 'ब्रज' },
      { code: 'maithili', name: 'Maithili (मैथिली)', nativeName: 'मैथिली' },
      { code: 'magahi', name: 'Magahi (मगही)', nativeName: 'मगही' },
    ],
  },
  {
    code: 'pa',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    direction: 'ltr',
    dialects: [
      { code: 'standard', name: 'Standard Punjabi', nativeName: 'ਮਿਆਰੀ ਪੰਜਾਬੀ' },
      { code: 'majhi', name: 'Majhi (ਮਾਝੀ)', nativeName: 'ਮਾਝੀ' },
      { code: 'doabi', name: 'Doabi (ਦੋਆਬੀ)', nativeName: 'ਦੋਆਬੀ' },
      { code: 'malwai', name: 'Malwai (ਮਲਵਈ)', nativeName: 'ਮਲਵਈ' },
      { code: 'puadhi', name: 'Puadhi (ਪੁਆਧੀ)', nativeName: 'ਪੁਆਧੀ' },
    ],
  },
  {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    direction: 'ltr',
    dialects: [
      { code: 'standard', name: 'Standard Bengali (মান্য চলিত)', nativeName: 'প্রমিত বাংলা' },
      { code: 'rarhi', name: 'Rarhi (রাঢ়ী)', nativeName: 'রাঢ়ী' },
      { code: 'barendra', name: 'Barendra (বরেন্দ্রী)', nativeName: 'বরেন্দ্রী' },
      { code: 'sylheti', name: 'Sylheti (সিলেটি)', nativeName: 'সিলেটি' },
    ],
  },
  {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    direction: 'ltr',
    dialects: [
      { code: 'standard', name: 'Standard Marathi', nativeName: 'प्रमाण मराठी' },
      { code: 'varhadi', name: 'Varhadi (वऱ्हाडी)', nativeName: 'वऱ्हाडी' },
      { code: 'malvani', name: 'Malvani (मालवणी)', nativeName: 'मालवणी' },
      { code: 'ahirani', name: 'Ahirani (अहिराणी)', nativeName: 'अहिराणी' },
    ],
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    direction: 'ltr',
    dialects: [
      { code: 'standard', name: 'Standard Tamil', nativeName: 'செந்தமிழ்' },
      { code: 'kongu', name: 'Kongu Tamil (கொங்கு தமிழ்)', nativeName: 'கொங்கு தமிழ்' },
      { code: 'madurai', name: 'Madurai Tamil (மதுரை தமிழ்)', nativeName: 'மதுரை தமிழ்' },
      { code: 'nellai', name: 'Nellai Tamil (நெல்லை தமிழ்)', nativeName: 'நெல்லை தமிழ்' },
    ],
  },
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    direction: 'ltr',
    dialects: [
      { code: 'standard', name: 'Standard Telugu', nativeName: 'ప్రామాణిక తెలుగు' },
      { code: 'telangana', name: 'Telangana Telugu (తెలంగాణ యాస)', nativeName: 'తెలంగాణ తెలుగు' },
      { code: 'rayalaseema', name: 'Rayalaseema Telugu (రాయలసీమ యాస)', nativeName: 'రాయలసీమ తెలుగు' },
      { code: 'coastal', name: 'Coastal Andhra (కోస్తా యాస)', nativeName: 'కోస్తా ఆంధ్ర' },
    ],
  },
  {
    code: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    direction: 'ltr',
    dialects: [
      { code: 'standard', name: 'Standard Gujarati', nativeName: 'પ્રમાણભૂત ગુજરાતી' },
      { code: 'kathiawari', name: 'Kathiawari (કાઠિયાવાડી)', nativeName: 'કાઠિયાવાડી' },
      { code: 'surati', name: 'Surati (સુરતી)', nativeName: 'સુરતી' },
      { code: 'charotari', name: 'Charotari (ચરોતરી)', nativeName: 'ચરોતરી' },
    ],
  },
  {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    direction: 'ltr',
    dialects: [
      { code: 'standard', name: 'Standard Kannada', nativeName: 'ಪ್ರಮಾಣಿತ ಕನ್ನಡ' },
      { code: 'mysore', name: 'Mysore / Southern Kannada', nativeName: 'ಮೈಸೂರು ಕನ್ನಡ' },
      { code: 'kundagannada', name: 'Kundagannada / Coastal', nativeName: 'ಕುಂದಗನ್ನಡ' },
      { code: 'dharwad', name: 'Dharwad / Northern Kannada', nativeName: 'ಧಾರವಾಡ ಕನ್ನಡ' },
    ],
  },
  {
    code: 'ml',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    direction: 'ltr',
    dialects: [
      { code: 'standard', name: 'Standard Malayalam', nativeName: 'ശുദ്ധ മലയാളം' },
      { code: 'malabar', name: 'Malabar Malayalam (മലബാർ)', nativeName: 'മലബാർ ശൈലി' },
      { code: 'travancore', name: 'Travancore Malayalam (തിരുവിതാംകൂർ)', nativeName: 'തിരുവിതാംകൂർ ശൈലി' },
    ],
  },
  {
    code: 'ur',
    name: 'Urdu',
    nativeName: 'اردو',
    direction: 'rtl',
    dialects: [
      { code: 'standard', name: 'Standard Urdu (معیاری اردو)', nativeName: 'معیاری اردو' },
      { code: 'deccani', name: 'Deccani Urdu (دکنی)', nativeName: 'دکنی اردو' },
    ],
  },
];

export class TranslationService {
  /**
   * Returns list of supported languages
   */
  static getSupportedLanguages(): LanguageOption[] {
    return SUPPORTED_LANGUAGES;
  }

  /**
   * Returns dialects for a specific language
   */
  static getSupportedDialects(langCode: string) {
    const lang = SUPPORTED_LANGUAGES.find((l) => l.code === langCode);
    return lang ? lang.dialects : [];
  }

  /**
   * Normalizes search query across Indian languages
   * e.g. "अस्पताल" -> "hospital", "ਦਵਾਈ" -> "medicine"
   */
  static normalizeSearchQuery(query: string): string {
    if (!query) return '';
    let normalized = query.toLowerCase().trim();

    const termsMap: Record<string, string> = {
      'अस्पताल': 'hospital',
      'हस्पताल': 'hospital',
      'हॉस्पिटल': 'hospital',
      'হাসপাতাল': 'hospital',
      'மருத்துவமனை': 'hospital',
      'ఆసుపత్రి': 'hospital',
      'દવાખાનું': 'hospital',
      'ಆಸ್ಪತ್ರೆ': 'hospital',
      'ആശുപത്രി': 'hospital',
      'ہسپتال': 'hospital',
      'रुग्णालय': 'hospital',
      'ਹਸਪਤਾਲ': 'hospital',
      'ਦਿਲ': 'cardiology',
      'हार्ट': 'cardiology',
      'दिल': 'cardiology',
      'हड्डी': 'orthopedics',
      'হাড়': 'orthopedics',
      'বাচ্চা': 'pediatrics',
      'बच्चा': 'pediatrics',
      'குழந்தை': 'pediatrics',
    };

    for (const [nativeTerm, englishTerm] of Object.entries(termsMap)) {
      if (normalized.includes(nativeTerm.toLowerCase())) {
        normalized = `${normalized} ${englishTerm}`;
      }
    }

    return normalized;
  }

  /**
   * Calculates Language friction score based on language match and interpreter support
   */
  static calculateLanguageFriction(
    patientLanguage: string,
    hospitalSupportedLanguages: string[] = ['English', 'Hindi']
  ): { score: number; level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'; reason: string } {
    const pLangNorm = (patientLanguage || 'Hindi').toLowerCase();
    const hospLangsNorm = hospitalSupportedLanguages.map((l) => l.toLowerCase());

    const directMatch = hospLangsNorm.some(
      (l) => l.includes(pLangNorm) || pLangNorm.includes(l)
    );

    if (directMatch) {
      return {
        score: 15,
        level: 'LOW',
        reason: `Hospital clinical staff directly support patient's preferred language (${patientLanguage}).`,
      };
    }

    // Secondary support (Hindi / English bridge)
    if (hospLangsNorm.includes('hindi') || hospLangsNorm.includes('english')) {
      return {
        score: 45,
        level: 'MEDIUM',
        reason: `Hospital uses bridge language (Hindi/English). Moderate communication barrier for native ${patientLanguage} speaker.`,
      };
    }

    return {
      score: 75,
      level: 'HIGH',
      reason: `Significant language discordance. Facility does not natively support ${patientLanguage}; translation escort recommended.`,
    };
  }
}
