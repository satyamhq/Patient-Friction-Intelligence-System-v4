import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Phone,
  Sparkles,
  MessageSquare,
  X,
  Send,
  Loader2,
  Trash2,
  Shield,
  Bot,
  User,
  Globe,
  ChevronDown,
  BookOpen,
  Search,
  Zap,
  CheckCircle2,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { chatService, ChatMessage, PrebuiltHealthcareQA } from '../../services/chatService';
import { initiateHelplineCall, HELPLINE_PHONE_NUMBER } from '../../services/helplineCallingService';
import { useLanguage } from '../../context/LanguageContext';

const CHAT_STORAGE_KEY = 'pfis_gemini_health_chatbot';

interface LanguageOption {
  code: string;
  label: string;
  flag: string;
}

const CHAT_LANGUAGES: LanguageOption[] = [
  { code: 'auto', label: 'Auto Detect (Same as message)', flag: '🌐' },
  { code: 'hinglish', label: 'Hinglish (Hindi + English)', flag: '🇮🇳' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'हिन्दी (Hindi)', flag: '🇮🇳' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)', flag: '🇮🇳' },
  { code: 'bn', label: 'বাংলা (Bengali)', flag: '🇮🇳' },
  { code: 'mr', label: 'मराठी (Marathi)', flag: '🇮🇳' },
  { code: 'ta', label: 'தமிழ் (Tamil)', flag: '🇮🇳' },
  { code: 'te', label: 'తెలుగు (Telugu)', flag: '🇮🇳' },
  { code: 'gu', label: 'ગુજરાતી (Gujarati)', flag: '🇮🇳' },
  { code: 'kn', label: 'ಕನ್ನಡ (Kannada)', flag: '🇮🇳' },
  { code: 'ml', label: 'മലയാളം (Malayalam)', flag: '🇮🇳' },
  { code: 'ur', label: 'اردو (Urdu)', flag: '🇮🇳' },
];

interface UiLocalization {
  placeholder: string;
  searching: string;
  nonClinical: string;
  callButtonText: string;
  clearHistory: string;
  welcomeGreeting: string;
  callConnecting: string;
  errorFallback: string;
  quickPrompts: string[];
}

const UI_LOCALIZATIONS: Record<string, UiLocalization> = {
  hinglish: {
    placeholder: 'Hospital bed, doctor appointment, symptoms, ya dawai ke baare me poochhein...',
    searching: '1,000+ Healthcare Q&A me search ho raha hai...',
    nonClinical: 'Non-clinical sahayata • Emergency me 108 dial karein',
    callButtonText: 'Call',
    clearHistory: 'Chat Saaf Karein',
    welcomeGreeting: `Namaste! Main aapka **Gemini Healthcare AI Copilot** hoon. Aap **Hinglish** ("Mujhe doctor appointment chahiye"), **हिन्दी**, ya kisi bhi bhasha me pooch sakte hain.\n\nMere paas **1,000+ verified healthcare guides** (PM-JAY, ABHA ID, OPD Queue, Jan Aushadhi) ki jankari hai.\n\nTurant madad ke liye aap hamari 24/7 Helpline par call bhi kar sakte hain (**${HELPLINE_PHONE_NUMBER}**).`,
    callConnecting: `Connecting to 24/7 Healthcare Helpline: **${HELPLINE_PHONE_NUMBER}**.\n\nAapke dialer par call initiate ho chuki hai. Agar dialer na khule toh **[Call ${HELPLINE_PHONE_NUMBER}](tel:+916205844155)** par click karein.`,
    errorFallback: `⚠️ AI service se judne me dikkat aa rahi hai. Urgent healthcare guidance ke liye hamari 24/7 Helpline par call karein: **${HELPLINE_PHONE_NUMBER}** ya emergency me **108** dial karein.`,
    quickPrompts: [
      `Call Helpline (${HELPLINE_PHONE_NUMBER})`,
      'Ayushman Card Kaise Banaye?',
      'Doctor Appointment Book Karein',
      'Emergency 108 Ambulance',
      'Jan Aushadhi Sasti Dawai',
    ],
  },
  en: {
    placeholder: 'Ask about hospital beds, PM-JAY, symptoms, or appointments...',
    searching: 'Searching 1,000+ Healthcare Q&A & Reasoning...',
    nonClinical: 'Non-clinical guidance • Dial 108 for emergency',
    callButtonText: 'Call',
    clearHistory: 'Clear Conversation',
    welcomeGreeting: `Namaste! I am your **Gemini Healthcare AI Copilot**, supporting **Hinglish, Hindi, English, and all Indian regional languages** across **1,000+ verified healthcare guides** (PM-JAY, ABHA, OPD queues, Jan Aushadhi).\n\nYou can ask in **Hinglish**, **Hindi**, or any preferred language!\n\nYou can **Chat** with me or click **Call** to reach our 24/7 Helpline directly (**${HELPLINE_PHONE_NUMBER}**).`,
    callConnecting: `Connecting you to our official 24/7 Healthcare Helpline: **${HELPLINE_PHONE_NUMBER}**.\n\nCall has been initiated on your dialer. If it didn't open automatically, please click **[Call ${HELPLINE_PHONE_NUMBER}](tel:+916205844155)**.`,
    errorFallback: `⚠️ Note: Could not connect to the cloud AI service. For urgent healthcare guidance, call our 24/7 Healthcare Helpline directly at **${HELPLINE_PHONE_NUMBER}** or dial **108** for emergency.`,
    quickPrompts: [
      `Call Helpline (${HELPLINE_PHONE_NUMBER})`,
      'Ayushman PM-JAY Eligibility',
      'Create ABHA Health ID',
      'Book OPD Token',
      'Emergency Ambulance 108',
      'Jan Aushadhi Generic Medicines',
    ],
  },
  hi: {
    placeholder: 'अस्पताल बेड, डॉक्टर अपॉइंटमेंट, लक्षण या दवा के बारे में पूछें...',
    searching: '1,000+ स्वास्थ्य प्रश्नों और रिकॉर्ड्स में खोज जारी है...',
    nonClinical: 'गैर-नैदानिक मार्गदर्शन • आपातकाल में 108 डायल करें',
    callButtonText: 'कॉल',
    clearHistory: 'बातचीत साफ़ करें',
    welcomeGreeting: `नमस्ते! मैं आपका **Gemini Healthcare AI Copilot** हूँ। मैं हिन्दी, Hinglish, अंग्रेज़ी और सभी भारतीय भाषाओं में सहायता प्रदान करता हूँ।\n\nमेरे पास **1,000+ प्रमाणित स्वास्थ्य मार्गदर्शिकाएँ** (आयुष्मान भारत, आभा आईडी, ओपीडी कतार, जन औषधि) उपलब्ध हैं।\n\nआप किसी भी समय चैट कर सकते हैं या 24/7 हेल्पलाइन (**${HELPLINE_PHONE_NUMBER}**) पर कॉल कर सकते हैं।`,
    callConnecting: `हमारी 24/7 स्वास्थ्य हेल्पलाइन (**${HELPLINE_PHONE_NUMBER}**) से जोड़ा जा रहा है...\n\nकॉल शुरू करने के लिए क्लिक करें: **[कॉल करें ${HELPLINE_PHONE_NUMBER}](tel:+916205844155)**।`,
    errorFallback: `⚠️ AI सेवा से संपर्क नहीं हो पाया। तत्काल मार्गदर्शन हेतु हमारी 24/7 स्वास्थ्य हेल्पलाइन पर कॉल करें: **${HELPLINE_PHONE_NUMBER}** अथवा **108** डायल करें।`,
    quickPrompts: [
      `हेल्पलाइन कॉल करें (${HELPLINE_PHONE_NUMBER})`,
      'आयुष्मान कार्ड पात्रता व आवेदन',
      'ओपीडी पर्ची / टोकन कैसे बनाएं?',
      'इमरजेंसी एम्बुलेंस 108',
      'जन औषधि सस्ती जेनेरिक दवा',
    ],
  },
  pa: {
    placeholder: 'ਹਸਪਤਾਲ ਬੈੱਡ, ਡਾਕਟਰ ਅਪਾਇੰਟਮੈਂਟ, ਲੱਛਣ ਜਾਂ ਦਵਾਈ ਬਾਰੇ ਪੁੱਛੋ...',
    searching: '1,000+ ਸਿਹਤ ਸਵਾਲਾਂ ਵਿੱਚ ਖੋਜ ਹੋ ਰਹੀ ਹੈ...',
    nonClinical: 'ਗੈਰ-ਕਲੀਨਿਕਲ ਸਹਾਇਤਾ • ਐਮਰਜੈਂਸੀ ਲਈ 108 ਡਾਇਲ ਕਰੋ',
    callButtonText: 'ਕਾਲ',
    clearHistory: 'ਗੱਲਬਾਤ ਸਾਫ਼ ਕਰੋ',
    welcomeGreeting: `ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ **Gemini Healthcare AI Copilot** ਹਾਂ। ਤੁਸੀਂ ਪੰਜਾਬੀ, Hinglish, ਜਾਂ ਅੰਗਰੇਜ਼ੀ ਵਿੱਚ ਕੋਈ ਵੀ ਸਵਾਲ ਪੁੱਛ ਸਕਦੇ ਹੋ।\n\nਸਾਡੇ ਕੋਲ **1,000+ ਪ੍ਰਮਾਣਿਤ ਸਿਹਤ ਗਾਈਡਾਂ** (ਆਯੁਸ਼ਮਾਨ ਭਾਰਤ, ਆਭਾ ਆਈਡੀ, ਓਪੀਡੀ ਟੋਕਨ) ਦੀ ਜਾਣਕਾਰੀ ਹੈ।\n\nਤੁਰੰਤ ਮਦਦ ਲਈ ਸਾਡੀ 24/7 ਹੈਲਪਲਾਈਨ (**${HELPLINE_PHONE_NUMBER}**) 'ਤੇ ਕਾਲ ਕਰੋ।`,
    callConnecting: `ਸਾਡੀ 24/7 ਸਿਹਤ ਹੈਲਪਲਾਈਨ (**${HELPLINE_PHONE_NUMBER}**) ਨਾਲ ਜੋੜਿਆ ਜਾ ਰਿਹਾ ਹੈ...\n\nਕਿਰਪਾ ਕਰਕੇ ਕਾਲ ਸ਼ੁਰੂ ਕਰੋ: **[ਕਾਲ ਕਰੋ ${HELPLINE_PHONE_NUMBER}](tel:+916205844155)**.`,
    errorFallback: `⚠️ AI ਸੇਵਾ ਨਾਲ ਸੰਪਰਕ ਨਹੀਂ ਹੋ ਸਕਿਆ। ਤੁਰੰਤ ਮਦਦ ਲਈ ਸਾਡੀ ਹੈਲਪਲਾਈਨ (**${HELPLINE_PHONE_NUMBER}**) 'ਤੇ ਕਾਲ ਕਰੋ ਜਾਂ **108** ਡਾਇਲ ਕਰੋ।`,
    quickPrompts: [
      `ਹੈਲਪਲਾਈਨ ਕਾਲ ਕਰੋ (${HELPLINE_PHONE_NUMBER})`,
      'ਆਯੁਸ਼ਮਾਨ ਕਾਰਡ ਕਿਵੇਂ ਬਣਾਈਏ?',
      'ਓਪੀਡੀ ਟੋਕਨ ਬੁੱਕ ਕਰੋ',
      'ਐਮਰਜੈਂਸੀ ਐਂਬੂਲੈਂਸ 108',
      'ਜਨ ਔਸ਼ਧੀ ਸਸਤੀ ਦਵਾਈ',
    ],
  },
  bn: {
    placeholder: 'হাসপাতাল বেড, ডাক্তার অ্যাপয়েন্টমেন্ট বা ওষুধ সম্পর্কে জিজ্ঞাসা করুন...',
    searching: '১,০০০+ স্বাস্থ্য তথ্যে অনুসন্ধান চলছে...',
    nonClinical: 'অ-ক্লিনিকাল নির্দেশনা • জরুরি প্রয়োজনে ১০৮ ডায়াল করুন',
    callButtonText: 'কল',
    clearHistory: 'চ্যাট মুছুন',
    welcomeGreeting: `নমস্কার! আমি আপনার **Gemini Healthcare AI Copilot**। আপনি বাংলা, Hinglish, বা ইংরেজিতে প্রশ্ন করতে পারেন।\n\nআমাদের কাছে **১,০০০+ যাচাইকৃত স্বাস্থ্য নির্দেশিকা** (আয়ুষ্মান ভারত, আভা আইডি, ওপিডি) উপলব্ধ রয়েছে।\n\nজরুরি সহায়তার জন্য আমাদের ২৪/৭ হেল্পলাইনে কল করুন (**${HELPLINE_PHONE_NUMBER}**)।`,
    callConnecting: `আমাদের ২৪/৭ হেল্পলাইনে সংযোগ করা হচ্ছে: **${HELPLINE_PHONE_NUMBER}**...\n\nকল শুরু করতে ক্লিক করুন: **[কল করুন ${HELPLINE_PHONE_NUMBER}](tel:+916205844155)**।`,
    errorFallback: `⚠️ AI সেবায় সংযোগ ব্যর্থ হয়েছে। জরুরি স্বাস্থ্য নির্দেশনার জন্য ২৪/৭ হেল্পলাইনে কল করুন: **${HELPLINE_PHONE_NUMBER}** অথবা **১০৮** ডায়াল করুন।`,
    quickPrompts: [
      `হেল্পলাইনে কল করুন (${HELPLINE_PHONE_NUMBER})`,
      'আয়ুষ্মান কার্ডের সুবিধা ও আবেদন',
      'ওপিডি টোকেন বুকিং',
      'জরুরি অ্যাম্বুলেন্স ১০৮',
      'জন ঔষধি জেনেরিক ওষুধ',
    ],
  },
  mr: {
    placeholder: 'रुग्णालय बेड, डॉक्टर अपॉइंटमेंट, लक्षणे किंवा औषधांबद्दल विचारा...',
    searching: '१,०००+ आरोग्य प्रश्नांमध्ये शोध सुरू आहे...',
    nonClinical: 'गैर-वैद्यकीय मार्गदर्शन • आपत्कालीन १०८ डायल करा',
    callButtonText: 'कॉल',
    clearHistory: 'संभाषण साफ करा',
    welcomeGreeting: `नमस्कार! मी तुमचा **Gemini Healthcare AI Copilot** आहे. तुम्ही मराठी, Hinglish किंवा इंग्रजीमध्ये विचारू शकता.\n\nआमच्याकडे **१,०००+ सत्यापित आरोग्य माहिती** (आयुष्मान भारत, आभा आयडी, ओपीडी रांगा) उपलब्ध आहे.\n\nतातडीच्या मदतीसाठी आमच्या २४/७ हेल्पलाइनवर थेट संपर्क करा (**${HELPLINE_PHONE_NUMBER}**).`,
    callConnecting: `आमच्या २४/७ हेल्पलाइनशी जोडले जात आहे: **${HELPLINE_PHONE_NUMBER}**...\n\nकृपया कॉल सुरू करा: **[कॉल करा ${HELPLINE_PHONE_NUMBER}](tel:+916205844155)**.`,
    errorFallback: `⚠️ AI सेवेशी संपर्क होऊ शकला नाही. तात्काळ मार्गदर्शनासाठी २४/७ हेल्पलाइनवर संपर्क करा: **${HELPLINE_PHONE_NUMBER}** किंवा **१०८** डायल करा.`,
    quickPrompts: [
      `हेल्पलाइनवर कॉल करा (${HELPLINE_PHONE_NUMBER})`,
      'आयुष्मान कार्ड कसे मिळवावे?',
      'ओपीडी टोकन नोंदणी',
      'अतिदक्षता रुग्णवाहिका १०८',
      'जन औषधी स्वस्त औषधे',
    ],
  },
  ta: {
    placeholder: 'மருத்துவமனை படுக்கை, மருத்துவர் அப்பாயிண்ட்மென்ட் அல்லது மருந்துகள் பற்றி கேளுங்கள்...',
    searching: '1,000+ மருத்துவ வழிகாட்டிகளில் தேடுகிறது...',
    nonClinical: 'மருத்துவமல்லாத வழிகாட்டல் • அவசரத்திற்கு 108 அழைக்கவும்',
    callButtonText: 'அழைக்க',
    clearHistory: 'அரட்டையை அழிக்கவும்',
    welcomeGreeting: `வணக்கம்! நான் உங்கள் **Gemini Healthcare AI Copilot** ஆகும். தமிழ், Hinglish அல்லது ஆங்கிலத்தில் நீங்கள் கேட்கலாம்.\n\nஎங்களிடம் **1,000+ சரிபார்க்கப்பட்ட சுகாதார வழிகாட்டிகள்** (ஆயுஷ்மான் பாரத், ஆபா ஐடி, OPD டோக்கன்கள்) உள்ளன.\n\nஉடனடி உதவிக்கு எங்கள் 24/7 உதவி எண்ணை அழைக்கவும் (**${HELPLINE_PHONE_NUMBER}**).`,
    callConnecting: `எங்கள் 24/7 உதவி எண்ணுடன் இணைக்கப்படுகிறது: **${HELPLINE_PHONE_NUMBER}**...\n\nஇணைக்க கிளிக் செய்யவும்: **[அழைக்க ${HELPLINE_PHONE_NUMBER}](tel:+916205844155)**.`,
    errorFallback: `⚠️ AI சேவையை இணைக்க முடியவில்லை. அவசர சுகாதார உதவிக்கு எங்களை அழைக்கவும்: **${HELPLINE_PHONE_NUMBER}** அல்லது **108** ஐ டயல் செய்யவும்.`,
    quickPrompts: [
      `உதவி எண் அழைக்க (${HELPLINE_PHONE_NUMBER})`,
      'ஆயுஷ்மான் அட்டை பெறுவது எப்படி?',
      'OPD டோக்கன் முன்பதிவு',
      'அவசர ஆம்புலன்ஸ் 108',
      'ஜன் ஔஷதி குறைந்த விலை மருந்து',
    ],
  },
  te: {
    placeholder: 'ఆసుపత్రి పడకలు, డాక్టర్ అపాయింట్‌మెంట్, లక్షణాలు లేదా మందుల గురించి అడగండి...',
    searching: '1,000+ ఆరోగ్య సమాధానాలలో శోధిస్తోంది...',
    nonClinical: 'నాన్-క్లినికల్ మార్గదర్శకత్వం • అత్యవసరానికి 108 డయల్ చేయండి',
    callButtonText: 'కాల్',
    clearHistory: 'చాట్ తొలగించండి',
    welcomeGreeting: `నమస్కారం! నేను మీ **Gemini Healthcare AI Copilot**ని. మీరు తెలుగు, Hinglish లేదా ఇంగ్లీషులో అడగవచ్చు.\n\nమా వద్ద **1,000+ ధృవీకరించబడిన ఆరోగ్య సమాచారం** (ఆయుష్మాన్ భారత్, ఆభా ఐడీ, ఓపీడీ వివరాలు) అందుబాటులో ఉన్నాయి.\n\nతక్షణ సహాయం కోసం మా 24/7 హెల్ప్‌లైన్‌కు కాల్ చేయండి (**${HELPLINE_PHONE_NUMBER}**).`,
    callConnecting: `మా 24/7 హెల్ప్‌లైన్‌కు కనెక్ట్ చేస్తోంది: **${HELPLINE_PHONE_NUMBER}**...\n\nకాల్ చేయడానికి క్లిక్ చేయండి: **[కాల్ చేయండి ${HELPLINE_PHONE_NUMBER}](tel:+916205844155)**.`,
    errorFallback: `⚠️ AI సేవకు కనెక్ట్ కాలేకపోయాము. తక్షణ ఆరోగ్య సహాయం కోసం హెల్ప్‌లైన్‌కు కాల్ చేయండి: **${HELPLINE_PHONE_NUMBER}** లేదా **108** డయల్ చేయండి.`,
    quickPrompts: [
      `హెల్ప్‌లైన్‌కు కాల్ చేయండి (${HELPLINE_PHONE_NUMBER})`,
      'ఆయుష్మాన్ భారత్ కార్డు దరఖాస్తు',
      'OPD టోకెన్ బుకింగ్',
      'అత్యవసర అంబులెన్స్ 108',
      'జన్ ఔషధి తక్కువ ధర మందులు',
    ],
  },
  gu: {
    placeholder: 'હોસ્પિટલ બેડ, ડોક્ટર એપોઇન્ટમેન્ટ, લક્ષણો અથવા દવાઓ વિશે પૂછો...',
    searching: '1,000+ આરોગ્ય પ્રશ્નોમાં શોધ ચાલુ છે...',
    nonClinical: 'બિન-તબીબી માર્ગદર્શન • કટોકટી માટે 108 ડાયલ કરો',
    callButtonText: 'કૉલ',
    clearHistory: 'વાતચીત સાફ કરો',
    welcomeGreeting: `નમસ્તે! હું તમારો **Gemini Healthcare AI Copilot** છું. તમે ગુજરાતી, Hinglish અથવા અંગ્રેજીમાં પૂછી શકો છો.\n\nઅમારી પાસે **1,000+ પ્રમાણિત આરોગ્ય માર્ગદર્શિકાઓ** (આયુષ્માન ભારત, આભા આઈડી, ઓપીડી કતાર) ઉપલબ્ધ છે.\n\nત્વરિત સહાય માટે અમારી 24/7 હેલ્પલાઇન પર કૉલ કરો (**${HELPLINE_PHONE_NUMBER}**).`,
    callConnecting: `અમારી 24/7 હેલ્પલાઇન સાથે જોડાઈ રહ્યા છો: **${HELPLINE_PHONE_NUMBER}**...\n\nકૉલ શરૂ કરવા ક્લિક કરો: **[કૉલ કરો ${HELPLINE_PHONE_NUMBER}](tel:+916205844155)**.`,
    errorFallback: `⚠️ AI સેવામાં કનેક્ટ થઈ શક્યું નથી. તાત્કાલિક માર્ગદર્શન માટે હેલ્પલાઇન પર કૉલ કરો: **${HELPLINE_PHONE_NUMBER}** અથવા **108** ડાયલ કરો.`,
    quickPrompts: [
      `હેલ્પલાઇન કૉલ કરો (${HELPLINE_PHONE_NUMBER})`,
      'આયુષ્માન કાર્ડ કેવી રીતે મેળવવું?',
      'ઓપીડી ટોકન બુક કરો',
      'ઇમરજન્સી એમ્બ્યુલન્સ 108',
      'જન ઔષધિ સસ્તી દવાઓ',
    ],
  },
  kn: {
    placeholder: 'ಆಸ್ಪತ್ರೆ ಬೆಡ್, ವೈದ್ಯರ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್, ಲಕ್ಷಣಗಳು ಅಥವಾ ಔಷಧಗಳ ಬಗ್ಗೆ ಕೇಳಿ...',
    searching: '1,000+ ಆರೋಗ್ಯ ಪ್ರಶ್ನೆಗಳಲ್ಲಿ ಹುಡುಕಲಾಗುತ್ತಿದೆ...',
    nonClinical: 'ವೈದ್ಯಕೀಯೇತರ ಮಾರ್ಗದರ್ಶನ • ತುರ್ತು ಪರಿಸ್ಥಿತಿಗೆ 108 ಕರೆ ಮಾಡಿ',
    callButtonText: 'ಕರೆ',
    clearHistory: 'ಚಾಟ್ ತೆರವುಗೊಳಿಸಿ',
    welcomeGreeting: `ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ **Gemini Healthcare AI Copilot**. ನೀವು ಕನ್ನಡ, Hinglish ಅಥವಾ ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಬಹುದು.\n\nನಮ್ಮಲ್ಲಿ **1,000+ ಪರಿಶೀಲಿಸಿದ ಆರೋಗ್ಯ ಮಾಹಿತಿ** (ಆಯುಷ್ಮಾನ್ ಭಾರತ್, ಆಭಾ ಐಡಿ, ಒಪಿಡಿ ಟೋಕನ್) ಲಭ್ಯವಿದೆ.\n\nತ್ವರಿತ ನೆರವಿಗಾಗಿ ನಮ್ಮ 24/7 ಹೆಲ್ಪ್‌ಲೈನ್‌ಗೆ ಕರೆ ಮಾಡಿ (**${HELPLINE_PHONE_NUMBER}**).`,
    callConnecting: `ನಮ್ಮ 24/7 ಹೆಲ್ಪ್‌ಲೈನ್‌ಗೆ ಸಂಪರ್ಕಿಸಲಾಗುತ್ತಿದೆ: **${HELPLINE_PHONE_NUMBER}**...\n\nಕರೆ ಮಾಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ: **[ಕರೆ ಮಾಡಿ ${HELPLINE_PHONE_NUMBER}](tel:+916205844155)**.`,
    errorFallback: `⚠️ AI ಸೇವೆಯನ್ನು ಸಂಪರ್ಕಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ತುರ್ತು ಆರೋಗ್ಯ ಮಾರ್ಗದರ್ಶನಕ್ಕಾಗಿ ನಮ್ಮ 24/7 ಹೆಲ್ಪ್‌ಲೈನ್‌ಗೆ ಕರೆ ಮಾಡಿ: **${HELPLINE_PHONE_NUMBER}** ಅಥವಾ **108** ಡಯಲ್ ಮಾಡಿ.`,
    quickPrompts: [
      `ಹೆಲ್ಪ್‌ಲೈನ್‌ಗೆ ಕರೆ ಮಾಡಿ (${HELPLINE_PHONE_NUMBER})`,
      'ಆಯುಷ್ಮಾನ್ ಕಾರ್ಡ್ ಪಡೆಯುವುದು ಹೇಗೆ?',
      'OPD ಟೋಕನ್ ಬುಕಿಂಗ್',
      'ತುರ್ತು ಆಂಬ್ಯುಲೆನ್ಸ್ 108',
      'ಜನೌಷಧಿ ಕಡಿಮೆ ಬೆಲೆಯ ಔಷಧಿಗಳು',
    ],
  },
  ml: {
    placeholder: 'ആശുപത്രി ബെഡ്, ഡോക്ടർ അപ്പോയിന്റ്മെന്റ്, ലക്ഷണങ്ങൾ അല്ലെങ്കിൽ മരുന്നുകളെക്കുറിച്ച് ചോദിക്കൂ...',
    searching: '1,000+ ആരോഗ്യ വിവരങ്ങളിൽ തിരയുന്നു...',
    nonClinical: 'നോൺ-ക്ലിനിക്കൽ മാർഗ്ഗനിർദ്ദേശം • അടിയന്തിര സഹായത്തിന് 108 വിളിക്കുക',
    callButtonText: 'വിളിക്കുക',
    clearHistory: 'ചാറ്റ് മായ്‌ക്കുക',
    welcomeGreeting: `നമസ്കാരം! ഞാൻ നിങ്ങളുടെ **Gemini Healthcare AI Copilot** ആണ്. നിങ്ങൾക്ക് മലയാളം, Hinglish അല്ലെങ്കിൽ ഇംഗ്ലീഷിൽ സംസാരിക്കാം.\n\nഞങ്ങളുടെ പക്കൽ **1,000+ പരിശോധിച്ച ആരോഗ്യ വിവരങ്ങൾ** (ആയുഷ്മാൻ ഭാരത്, ആഭാ ഐഡി, ഒപിഡി) ലഭ്യമാണ്.\n\nഅടിയന്തിര സഹായത്തിന് ഞങ്ങളുടെ 24/7 ഹെൽപ്പ്‌ലൈനിലേക്ക് വിളിക്കുക (**${HELPLINE_PHONE_NUMBER}**).`,
    callConnecting: `ഞങ്ങളുടെ 24/7 ഹെൽപ്പ്‌ലൈനിലേക്ക് ബന്ധിപ്പിക്കുന്നു: **${HELPLINE_PHONE_NUMBER}**...\n\nവിളിക്കാൻ ക്ലിക്ക് ചെയ്യുക: **[വിളിക്കുക ${HELPLINE_PHONE_NUMBER}](tel:+916205844155)**.`,
    errorFallback: `⚠️ AI സേവനവുമായി ബന്ധപ്പെടാൻ കഴിഞ്ഞില്ല. അടിയന്തര ആരോഗ്യ മാർഗ്ഗനിർദ്ദേശത്തിന് ഹെൽപ്പ്‌ലൈൻ വിളിക്കുക: **${HELPLINE_PHONE_NUMBER}** അല്ലെങ്കിൽ **108** ഡയൽ ചെയ്യുക.`,
    quickPrompts: [
      `ഹെൽപ്പ്‌ലൈനിൽ വിളിക്കുക (${HELPLINE_PHONE_NUMBER})`,
      'ആയുഷ്മാൻ കാർഡ് എങ്ങനെ എടുക്കാം?',
      'OPD ടോക്കൺ ബുക്കിംഗ്',
      'അടിയന്തര ആംബുലൻസ് 108',
      'ജൻ ഔഷധി കുറഞ്ഞ നിരക്കിലുള്ള മരുന്നുകൾ',
    ],
  },
  ur: {
    placeholder: 'ہسپتال بیڈ، ڈاکٹر اپائنٹمنٹ، علامات یا ادویات کے متعلق پوچھیں...',
    searching: '1,000+ طبی سوالات میں تلاش جاری ہے...',
    nonClinical: 'غیر طبی رہنمائی • ایمرجنسی میں 108 ڈائل کریں',
    callButtonText: 'کال',
    clearHistory: 'چیٹ صاف کریں',
    welcomeGreeting: `السلام علیکم! میں آپ کا **Gemini Healthcare AI Copilot** ہوں۔ آپ اردو، Hinglish یا انگریزی میں پوچھ سکتے ہیں۔\n\nہمارے پاس **1,000+ تصدیق شدہ طبی گائیڈز** (آیوشمان بھارت، آبھا آئی ڈی، او پی ڈی ٹوکن) دستیاب ہیں۔\n\nفوری مدد کے لیے ہماری 24/7 ہیلپ لائن پر رابطہ کریں (**${HELPLINE_PHONE_NUMBER}**).`,
    callConnecting: `ہماری 24/7 ہیلپ لائن سے رابطہ کیا جا رہا ہے: **${HELPLINE_PHONE_NUMBER}**...\n\nکال شروع کرنے کے لیے کلک کریں: **[کال کریں ${HELPLINE_PHONE_NUMBER}](tel:+916205844155)**.`,
    errorFallback: `⚠️ AI سروس سے رابطہ نہیں ہو سکا۔ فوری طبی رہنمائی کے لیے ہماری 24/7 ہیلپ لائن پر کال کریں: **${HELPLINE_PHONE_NUMBER}** یا **108** ملائیں۔`,
    quickPrompts: [
      `ہیلپ لائن پر کال کریں (${HELPLINE_PHONE_NUMBER})`,
      'آیوشمان کارڈ کیسے حاصل کریں؟',
      'او پی ڈی ٹوکن بکنگ',
      'ایمرجنسی ایمبولینس 108',
      'جن اوشدھی سستی ادویات',
    ],
  },
};

export const GeminiHealthChatbot: React.FC = () => {
  const location = useLocation();
  const { currentLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  // Initialize selected language (auto by default)
  const [selectedLanguage, setSelectedLanguage] = useState<string>(() => {
    return localStorage.getItem('pfis_chatbot_language') || 'auto';
  });

  // Track the most recent language detected in the conversation to maintain continuity
  const [lastDetectedLanguage, setLastDetectedLanguage] = useState<string>(() => {
    return localStorage.getItem('pfis_chatbot_detected_lang') || 'hinglish';
  });

  // Determine active UI language
  const effectiveLang =
    selectedLanguage !== 'auto'
      ? selectedLanguage
      : lastDetectedLanguage || currentLanguage.code || 'hinglish';

  const [activeTab, setActiveTab] = useState<'chat' | 'library'>('chat');
  const [chatMode, setChatMode] = useState<'hybrid' | 'prebuilt'>('hybrid');

  // 1,000+ Pre-built Questions state
  const [prebuiltList, setPrebuiltList] = useState<PrebuiltHealthcareQA[]>([]);
  const [prebuiltTotal, setPrebuiltTotal] = useState<number>(1059);
  const [prebuiltLoading, setPrebuiltLoading] = useState<boolean>(false);
  const [libraryCategory, setLibraryCategory] = useState<string>('all');
  const [librarySearch, setLibrarySearch] = useState<string>('');
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);

  const activeUi: UiLocalization =
    UI_LOCALIZATIONS[effectiveLang] ||
    UI_LOCALIZATIONS[currentLanguage.code] ||
    UI_LOCALIZATIONS.hinglish;

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [
      {
        role: 'assistant',
        content: activeUi.welcomeGreeting,
        timestamp: new Date().toISOString(),
      },
    ];
  });

  // If conversation has only the single initial greeting and language changes, update greeting
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].role === 'assistant') {
        return [
          {
            ...prev[0],
            content: activeUi.welcomeGreeting,
          },
        ];
      }
      return prev;
    });
  }, [effectiveLang, activeUi.welcomeGreeting]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [messages, isOpen]);

  // Persist history
  useEffect(() => {
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    } catch {}
  }, [messages]);

  const loadPrebuiltQuestions = async (category = libraryCategory, search = librarySearch) => {
    setPrebuiltLoading(true);
    try {
      const res = await chatService.getPrebuiltQuestions({
        category: category !== 'all' ? category : undefined,
        search: search.trim() || undefined,
        limit: 100,
      });
      setPrebuiltList(res.items || []);
      if (res.total) setPrebuiltTotal(res.total);
    } catch (err) {
      console.warn('Failed to load prebuilt questions:', err);
    } finally {
      setPrebuiltLoading(false);
    }
  };

  // Load prebuilt questions when modal opens
  useEffect(() => {
    if (isOpen && prebuiltList.length === 0) {
      loadPrebuiltQuestions();
    }
  }, [isOpen]);

  const handleLanguageChange = (code: string) => {
    setSelectedLanguage(code);
    localStorage.setItem('pfis_chatbot_language', code);
    setIsLangMenuOpen(false);
  };

  const handleCall = () => {
    initiateHelplineCall();
  };

  // Handle chat submission
  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const queryText = (customText || inputQuery).trim();
    if (!queryText || isLoading) return;

    setActiveTab('chat');

    // Check if user specifically requested a call
    const lower = queryText.toLowerCase();
    if (
      lower.includes('call') ||
      lower.includes('phone') ||
      lower.includes('कॉल') ||
      lower.includes('ਕਾਲ') ||
      lower.includes('কল') ||
      lower.includes('फोन') ||
      lower.includes('speak to human') ||
      lower.includes('talk to someone') ||
      lower.includes('baat karni hai') ||
      lower.includes('phone milao') ||
      lower.includes('helpline') ||
      lower.includes('doctor se baat')
    ) {
      const userMsg: ChatMessage = {
        role: 'user',
        content: queryText,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInputQuery('');
      setIsLoading(true);

      setTimeout(() => {
        const botMsg: ChatMessage = {
          role: 'assistant',
          content: activeUi.callConnecting,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, botMsg]);
        setIsLoading(false);
        initiateHelplineCall();
      }, 400);
      return;
    }

    const userMsg: ChatMessage = {
      role: 'user',
      content: queryText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await chatService.askQuestion(
        queryText,
        messages,
        'patient',
        location.pathname,
        selectedLanguage !== 'auto' ? selectedLanguage : (lastDetectedLanguage || currentLanguage.code || 'auto'),
        chatMode
      );

      if (response.detectedLanguage) {
        setLastDetectedLanguage(response.detectedLanguage);
        localStorage.setItem('pfis_chatbot_detected_lang', response.detectedLanguage);
      }

      const botMsg: ChatMessage = {
        role: 'assistant',
        content: response.answer || "I'm sorry, I couldn't retrieve an answer right now.",
        sources: response.sources,
        suggestedQuestions: response.suggestedQuestions,
        model: response.model || 'Google Gemini (1,000+ Q&A Base)',
        detectedLanguage: response.detectedLanguage,
        isPrebuiltMatch: response.isPrebuiltMatch,
        prebuiltQuestion: response.prebuiltQuestion,
        matchScore: response.matchScore,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        role: 'assistant',
        content: `${activeUi.errorFallback} (${err.message || 'Network issue'}).`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    const welcomeMsg: ChatMessage = {
      role: 'assistant',
      content: activeUi.welcomeGreeting,
      timestamp: new Date().toISOString(),
    };
    setMessages([welcomeMsg]);
    try {
      localStorage.removeItem(CHAT_STORAGE_KEY);
    } catch {}
  };

  const currentLangLabel =
    CHAT_LANGUAGES.find((l) => l.code === selectedLanguage)?.label || 'Auto Detect';

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 flex flex-col items-end select-none">
      {/* 1. Expanded Chat Window */}
      {isOpen && (
        <div className="mb-3 w-[calc(100vw-2rem)] sm:w-[460px] h-[580px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold tracking-tight">Gemini Health Copilot</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[10px] text-teal-200/90">
                  1,000+ Q&A • Hinglish & 11 Indian Languages
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Language Selector Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                  className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-teal-200 hover:text-white text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer border border-white/10"
                  title="Switch Chatbot Language"
                >
                  <Globe className="w-3 h-3 text-teal-300" />
                  <span className="max-w-[70px] truncate">{selectedLanguage === 'auto' ? 'Auto' : selectedLanguage.toUpperCase()}</span>
                  <ChevronDown className="w-2.5 h-2.5 opacity-70" />
                </button>

                {isLangMenuOpen && (
                  <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50 text-slate-800 text-xs max-h-60 overflow-y-auto">
                    <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      Select Response Language
                    </div>
                    {CHAT_LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`w-full px-3 py-1.5 text-left text-xs flex items-center gap-2 hover:bg-teal-50 hover:text-teal-900 transition-colors cursor-pointer ${
                          selectedLanguage === lang.code ? 'bg-teal-50 text-teal-800 font-bold' : ''
                        }`}
                      >
                        <span>{lang.flag}</span>
                        <span className="truncate">{lang.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Clear History */}
              <button
                type="button"
                onClick={handleClearHistory}
                className="p-1.5 rounded-lg text-teal-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Clear Conversation"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-teal-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sub-Navigation: Chat vs 1,000+ Q&A Library + Dual Engine Mode Selector */}
          <div className="px-3 py-2 bg-slate-100 border-b border-slate-200 flex items-center justify-between gap-2 text-xs">
            {/* Tab switch */}
            <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setActiveTab('chat')}
                className={`px-2.5 py-1 rounded-md font-semibold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'chat'
                    ? 'bg-teal-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-teal-700 hover:bg-slate-50'
                }`}
              >
                <MessageSquare className="w-3 h-3" />
                <span>Chat</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('library');
                  if (prebuiltList.length === 0) loadPrebuiltQuestions();
                }}
                className={`px-2.5 py-1 rounded-md font-semibold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'library'
                    ? 'bg-teal-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-teal-700 hover:bg-slate-50'
                }`}
              >
                <BookOpen className="w-3 h-3" />
                <span>1,000+ Q&As</span>
                <span
                  className={`text-[9px] px-1 py-0.2 rounded-full font-bold ${
                    activeTab === 'library'
                      ? 'bg-teal-700 text-white'
                      : 'bg-teal-50 text-teal-800 border border-teal-200'
                  }`}
                >
                  {prebuiltTotal > 0 ? `${prebuiltTotal}+` : '1000+'}
                </span>
              </button>
            </div>

            {/* AI Engine Mode Switch: Hybrid (Gemini + 1000+ Pre-built) vs Direct Match */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setChatMode(chatMode === 'hybrid' ? 'prebuilt' : 'hybrid')}
                className={`px-2 py-1 rounded-md border text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  chatMode === 'hybrid'
                    ? 'bg-teal-50 border-teal-300 text-teal-800'
                    : 'bg-amber-50 border-amber-300 text-amber-900'
                }`}
                title={
                  chatMode === 'hybrid'
                    ? 'Hybrid Mode: Gemini uses 1,000+ pre-built Q&As as ground truth and translates to any language'
                    : 'Direct Match Mode: Returns exact verified pre-built answer instantly without waiting for AI generation'
                }
              >
                {chatMode === 'hybrid' ? (
                  <>
                    <Zap className="w-2.5 h-2.5 text-teal-600" />
                    <span>⚡ Gemini + 1,000+ Q&As</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-2.5 h-2.5 text-amber-600" />
                    <span>🎯 Direct 1,000+ Match</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 1,000+ Pre-built Questions Library Tab */}
          {activeTab === 'library' && (
            <div className="flex-1 overflow-y-auto flex flex-col bg-slate-50 text-xs">
              {/* Search & Filter Header */}
              <div className="p-3 bg-white border-b border-slate-200 space-y-2.5">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={librarySearch}
                    onChange={(e) => {
                      setLibrarySearch(e.target.value);
                      loadPrebuiltQuestions(libraryCategory, e.target.value);
                    }}
                    placeholder="Search 1,000+ verified healthcare questions..."
                    className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-teal-600 focus:bg-white transition-colors"
                  />
                  {librarySearch && (
                    <button
                      type="button"
                      onClick={() => {
                        setLibrarySearch('');
                        loadPrebuiltQuestions(libraryCategory, '');
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Categories */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[10px]">
                  {[
                    { id: 'all', label: 'All 1,000+' },
                    { id: 'patient', label: '👤 Patient' },
                    { id: 'doctor', label: '🩺 Doctor' },
                    { id: 'hospital', label: '🏥 Hospital' },
                    { id: 'asha', label: '🤝 ASHA' },
                    { id: 'government', label: '🏛️ Govt Schemes' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setLibraryCategory(cat.id);
                        loadPrebuiltQuestions(cat.id, librarySearch);
                      }}
                      className={`px-2.5 py-1 rounded-full font-medium whitespace-nowrap border transition-all cursor-pointer ${
                        libraryCategory === cat.id
                          ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300 hover:text-teal-700'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question list */}
              <div className="flex-1 p-3 space-y-2 overflow-y-auto">
                {prebuiltLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-500 text-xs">
                    <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
                    <span>Loading questions library...</span>
                  </div>
                ) : prebuiltList.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-xs">
                    No questions found matching "{librarySearch}". Try a different search term or category.
                  </div>
                ) : (
                  prebuiltList.map((item) => {
                    const isExpanded = expandedQuestionId === item.id;
                    return (
                      <div
                        key={item.id}
                        className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs hover:border-teal-200 transition-all"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-teal-50 text-teal-800 border border-teal-200 uppercase">
                                {item.category}
                              </span>
                              {item.role && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-100 text-slate-700">
                                  {item.role}
                                </span>
                              )}
                            </div>
                            <h4 className="font-semibold text-slate-900 text-xs leading-snug">
                              {item.question}
                            </h4>
                          </div>

                          <button
                            type="button"
                            onClick={() => setExpandedQuestionId(isExpanded ? null : item.id)}
                            className="text-slate-400 hover:text-teal-600 p-1 cursor-pointer"
                            title={isExpanded ? 'Collapse' : 'Expand preview'}
                          >
                            <ChevronDown
                              className={`w-3.5 h-3.5 transition-transform ${
                                isExpanded ? 'rotate-180' : ''
                              }`}
                            />
                          </button>
                        </div>

                        {/* Answer preview or full */}
                        <p
                          className={`mt-2 text-slate-600 text-[11px] leading-relaxed ${
                            isExpanded ? '' : 'line-clamp-2'
                          }`}
                        >
                          {item.answer}
                        </p>

                        {/* Action buttons */}
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab('chat');
                              handleSendMessage(undefined, item.question);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-medium transition-colors cursor-pointer shadow-2xs"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>Ask Gemini</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab('chat');
                              const userMsg: ChatMessage = {
                                role: 'user',
                                content: item.question,
                                timestamp: new Date().toISOString(),
                              };
                              const botMsg: ChatMessage = {
                                role: 'assistant',
                                content: item.answer,
                                timestamp: new Date().toISOString(),
                                isPrebuiltMatch: true,
                                suggestedQuestions: item.suggestedFollowups || [],
                              };
                              setMessages((prev) => [...prev, userMsg, botMsg]);
                            }}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition-colors cursor-pointer"
                            title="Insert verified pre-built answer directly into chat"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Instant Answer</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Messages Area (Active when activeTab === 'chat') */}
          {activeTab === 'chat' && (
            <div
              dir={effectiveLang === 'ur' ? 'rtl' : 'ltr'}
              className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs text-slate-800 bg-slate-50/50"
            >
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed shadow-xs ${
                      msg.role === 'user'
                        ? 'bg-teal-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>

                    {/* Pre-built Ground Truth Badge */}
                    {msg.isPrebuiltMatch && (
                      <div className="mt-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-[9px] font-semibold text-emerald-800">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                        <span>Verified 1,000+ Pre-built Q&A</span>
                      </div>
                    )}

                    {/* Language badge if detected */}
                    {msg.detectedLanguage && msg.detectedLanguage !== 'en' && (
                      <div className="mt-1 text-[9px] text-teal-700/80 font-semibold flex items-center gap-1">
                        <span>🌐 Responded in: {msg.detectedLanguage.toUpperCase()}</span>
                      </div>
                    )}

                    {/* Suggested follow-up chips */}
                    {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap gap-1">
                        {msg.suggestedQuestions.map((q, qIdx) => (
                          <button
                            key={qIdx}
                            type="button"
                            onClick={() => handleSendMessage(undefined, q)}
                            className="px-2 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-[10px] text-teal-800 border border-teal-200 transition-colors cursor-pointer text-left"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-6 h-6 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 text-slate-600 text-xs bg-white border border-slate-200 p-2.5 rounded-2xl w-fit shadow-xs">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600" />
                  <span>{activeUi.searching}</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Quick Prompts Bar */}
          <div className="px-3 py-1.5 bg-slate-100 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px]">
            {activeUi.quickPrompts.map((topic, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  if (i === 0 || topic.includes(HELPLINE_PHONE_NUMBER)) {
                    handleCall();
                  } else {
                    handleSendMessage(undefined, topic);
                  }
                }}
                className="px-2.5 py-1 rounded-full bg-white hover:bg-teal-50 hover:border-teal-300 text-slate-700 border border-slate-200 whitespace-nowrap transition-colors cursor-pointer text-xs font-medium shrink-0"
              >
                {topic}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={handleSendMessage}
            dir={effectiveLang === 'ur' ? 'rtl' : 'ltr'}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={activeUi.placeholder}
              disabled={isLoading}
              className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs focus:outline-hidden focus:border-teal-600 focus:bg-white transition-colors"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isLoading}
              className="p-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white transition-all cursor-pointer shadow-xs"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Non-clinical footnote */}
          <div className="px-3 py-1.5 bg-slate-100 border-t border-slate-200 text-[10px] text-slate-500 text-center flex items-center justify-between gap-1">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-slate-500" />
              <span>{activeUi.nonClinical}</span>
            </span>
            <button
              type="button"
              onClick={handleCall}
              className="text-teal-700 font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              <Phone className="w-2.5 h-2.5" />
              <span>Helpline: {HELPLINE_PHONE_NUMBER}</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Floating Launcher: Call & Chat (Accessible from all dashboards) */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-white/95 backdrop-blur-xl border border-slate-300 shadow-xl">
        {/* Direct Call Button -> Directly initiates call to +91 6205844155 */}
        <button
          type="button"
          onClick={handleCall}
          className="px-3.5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          title={`Call Healthcare Helpline (${HELPLINE_PHONE_NUMBER})`}
        >
          <Phone className="w-3.5 h-3.5 fill-current" />
          <span>{activeUi.callButtonText}</span>
        </button>

        {/* Gemini Chat Toggle */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`px-3.5 py-2 rounded-full font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
            isOpen
              ? 'bg-slate-200 text-slate-900'
              : 'bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200'
          }`}
          title="Chat with Gemini Healthcare Copilot in Hinglish or 11 Languages"
        >
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>Gemini AI ({selectedLanguage === 'auto' ? 'Multi' : selectedLanguage.toUpperCase()})</span>
        </button>
      </div>
    </div>
  );
};
