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
  ExternalLink,
  ChevronRight,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { chatService, ChatMessage } from '../../services/chatService';
import { openElevenLabsCalling } from '../../services/elevenlabsCallingService';

const CHAT_STORAGE_KEY = 'pfis_elevenlabs_gemini_chat';

export const ElevenLabsWidget: React.FC = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'call_info'>('chat');
  const [isCalling, setIsCalling] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
        content: `Hello! I am your **ElevenLabs Healthcare Assistant**, powered by **Google Gemini**.\n\nHow can I help you today? You can **Chat** with me here or click **Call** to speak with me verbally in real-time.`,
        timestamp: new Date().toISOString(),
      },
    ];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [messages, isOpen]);

  // Save history
  useEffect(() => {
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    } catch {}
  }, [messages]);

  // Handle Call Click
  const handleStartCall = () => {
    setIsCalling(true);
    openElevenLabsCalling();
    setTimeout(() => setIsCalling(false), 2000);
  };

  // Handle Chat Submit
  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const queryText = (customText || inputQuery).trim();
    if (!queryText || isLoading) return;

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
        location.pathname
      );

      const botMsg: ChatMessage = {
        role: 'assistant',
        content: response.answer || "I'm sorry, I couldn't retrieve an answer right now.",
        sources: response.sources,
        suggestedQuestions: response.suggestedQuestions,
        model: response.model || 'Google Gemini',
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        role: 'assistant',
        content: `⚠️ Error: Could not reach the Gemini AI assistant (${err.message || 'Network error'}). Please try again.`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    const welcomeMsg: ChatMessage = {
      role: 'assistant',
      content: `Chat history cleared. How can I help you with your healthcare booking or hospital navigation today?`,
      timestamp: new Date().toISOString(),
    };
    setMessages([welcomeMsg]);
    localStorage.removeItem(CHAT_STORAGE_KEY);
  };

  return (
    <div className="fixed bottom-18 md:bottom-5 right-4 sm:right-5 z-40 flex flex-col items-end pointer-events-auto">
      {/* 1. Expandable Gemini AI Chat Window (Light Mode) */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="ElevenLabs and Gemini Healthcare Assistant"
          className="mb-3 w-[92vw] sm:w-[410px] h-[540px] max-h-[82vh] bg-white border border-slate-200 text-slate-900 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          {/* Top Header */}
          <div className="px-4 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center text-white font-black shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm tracking-tight text-slate-900">
                    ElevenLabs AI
                  </span>
                  <span className="text-[10px] font-semibold bg-teal-100 text-teal-800 border border-teal-200 px-1.5 py-0.2 rounded-full">
                    Gemini Brain
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-none mt-0.5">
                  Healthcare & Appointment Intelligence
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Quick Call Switch Button */}
              <button
                type="button"
                onClick={handleStartCall}
                className="px-2.5 py-1 rounded-full bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                title="Start ElevenLabs Voice Call"
              >
                <Phone className="w-3 h-3 fill-current" />
                <span>Call</span>
              </button>

              <button
                type="button"
                onClick={clearChat}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
                title="Clear Chat History"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
                aria-label="Close Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs text-slate-800">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-lg bg-teal-100 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[84%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-slate-100 border border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>

                  {/* Suggested follow-up chips */}
                  {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200 flex flex-wrap gap-1">
                      {msg.suggestedQuestions.map((q, qIdx) => (
                        <button
                          key={qIdx}
                          type="button"
                          onClick={() => handleSendMessage(undefined, q)}
                          className="px-2 py-0.5 rounded-md bg-white hover:bg-teal-50 text-[10px] text-teal-700 border border-slate-300 hover:border-teal-500 transition-colors cursor-pointer"
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
              <div className="flex items-center gap-2 text-slate-600 text-xs bg-slate-100 border border-slate-200 p-2.5 rounded-2xl w-fit">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600" />
                <span>Gemini is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px]">
            {[
              'Book appointment tomorrow',
              'OPD token status',
              'Nearest Hospital',
              'Hospital guidelines',
            ].map((topic, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage(undefined, topic)}
                className="px-2.5 py-0.5 rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap transition-colors cursor-pointer"
              >
                {topic}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask anything or request appointment..."
              disabled={isLoading}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs focus:outline-hidden focus:border-teal-600 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isLoading}
              className="p-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white transition-all cursor-pointer"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Non-clinical footnote */}
          <div className="px-3 py-1.5 bg-slate-100 border-t border-slate-200 text-[10px] text-slate-500 text-center flex items-center justify-center gap-1">
            <Shield className="w-3 h-3 text-slate-500" />
            <span>Non-clinical guidance. For emergency care, call 108 immediately.</span>
          </div>
        </div>
      )}

      {/* 2. Sleek ElevenLabs Floating Widget Launcher (Light Mode: Call & Chat) */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-white/95 backdrop-blur-xl border border-slate-300 shadow-xl">
        {/* Call Option -> Starts ElevenLabs Voice Calling */}
        <button
          type="button"
          onClick={handleStartCall}
          className="px-3.5 py-2 rounded-full bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          title="Call with ElevenLabs Voice Agent"
        >
          <Phone className="w-3.5 h-3.5 fill-current" />
          <span>Call</span>
        </button>

        {/* Chat Option -> Opens Gemini AI Chat */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`px-3.5 py-2 rounded-full font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
            isOpen
              ? 'bg-slate-200 text-slate-900'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
          }`}
          title="Chat with Gemini AI"
        >
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>Chat</span>
        </button>
      </div>
    </div>
  );
};
