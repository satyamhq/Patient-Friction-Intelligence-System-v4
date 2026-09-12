import i18n, { isRTL, updateDocumentDirection } from './config';

export interface LanguageMeta {
  code: string;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  speechCode: string;
  flag?: string;
  dialects: { code: string; name: string; nativeName: string }[];
}

export const LANGUAGES: LanguageMeta[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    direction: 'ltr',
    speechCode: 'en-IN',
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
    speechCode: 'hi-IN',
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
    speechCode: 'pa-IN',
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
    speechCode: 'bn-IN',
    dialects: [
      { code: 'standard', name: 'Standard Bengali', nativeName: 'প্রমিত বাংলা' },
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
    speechCode: 'mr-IN',
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
    speechCode: 'ta-IN',
    dialects: [
      { code: 'standard', name: 'Standard Tamil', nativeName: 'செந்தமிழ்' },
      { code: 'kongu', name: 'Kongu Tamil', nativeName: 'கொங்கு தமிழ்' },
      { code: 'madurai', name: 'Madurai Tamil', nativeName: 'மதுரை தமிழ்' },
      { code: 'nellai', name: 'Nellai Tamil', nativeName: 'நெல்லை தமிழ்' },
    ],
  },
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    direction: 'ltr',
    speechCode: 'te-IN',
    dialects: [
      { code: 'standard', name: 'Standard Telugu', nativeName: 'ప్రామాణిక తెలుగు' },
      { code: 'telangana', name: 'Telangana Telugu', nativeName: 'తెలంగాణ తెలుగు' },
      { code: 'rayalaseema', name: 'Rayalaseema Telugu', nativeName: 'రాయలసీమ తెలుగు' },
      { code: 'coastal', name: 'Coastal Andhra', nativeName: 'కోస్తా ఆంధ్ర' },
    ],
  },
  {
    code: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    direction: 'ltr',
    speechCode: 'gu-IN',
    dialects: [
      { code: 'standard', name: 'Standard Gujarati', nativeName: 'પ્રમાણભૂત ગુજરાતી' },
      { code: 'kathiawari', name: 'Kathiawari', nativeName: 'કાઠિયાવાડી' },
      { code: 'surati', name: 'Surati', nativeName: 'સુરતી' },
      { code: 'charotari', name: 'Charotari', nativeName: 'ચરોતરી' },
    ],
  },
  {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    direction: 'ltr',
    speechCode: 'kn-IN',
    dialects: [
      { code: 'standard', name: 'Standard Kannada', nativeName: 'ಪ್ರಮಾಣಿತ ಕನ್ನಡ' },
      { code: 'mysore', name: 'Mysore Kannada', nativeName: 'ಮೈಸೂರು ಕನ್ನಡ' },
      { code: 'kundagannada', name: 'Kundagannada', nativeName: 'ಕುಂದಗನ್ನಡ' },
      { code: 'dharwad', name: 'Dharwad Kannada', nativeName: 'ಧಾರವಾಡ ಕನ್ನಡ' },
    ],
  },
  {
    code: 'ml',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    direction: 'ltr',
    speechCode: 'ml-IN',
    dialects: [
      { code: 'standard', name: 'Standard Malayalam', nativeName: 'ശുദ്ധ മലയാളം' },
      { code: 'malabar', name: 'Malabar Malayalam', nativeName: 'മലബാർ ശൈലി' },
      { code: 'travancore', name: 'Travancore Malayalam', nativeName: 'തിരുവിതാംകൂർ ശൈലി' },
    ],
  },
  {
    code: 'ur',
    name: 'Urdu',
    nativeName: 'اردو',
    direction: 'rtl',
    speechCode: 'ur-IN',
    dialects: [
      { code: 'standard', name: 'Standard Urdu', nativeName: 'معیاری اردو' },
      { code: 'deccani', name: 'Deccani Urdu', nativeName: 'دکنی اردو' },
    ],
  },
];

export { i18n, isRTL, updateDocumentDirection };
