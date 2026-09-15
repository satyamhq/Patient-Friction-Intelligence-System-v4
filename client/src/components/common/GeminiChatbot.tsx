import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Sparkles,
  X,
  Send,
  Trash2,
  Maximize2,
  Minimize2,
  FileText,
  Copy,
  Check,
  Volume2,
  VolumeX,
  RefreshCw,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Mic,
  MicOff,
  Database,
  ExternalLink,
} from 'lucide-react';
import { chatService, ChatMessage, SourceReference, SuggestedQuestionCategory } from '../../services/chatService';

const STORAGE_KEY = 'pfis_gemini_chat_history';

export const GeminiChatbot: React.FC = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [
      {
        role: 'assistant',
        content: `👋 **Welcome to PFIS Intelligence Copilot!**\n\nI am powered by **Google Gemini (3.6 Flash)** and a **local RAG knowledge base** analyzing the entire PFIS codebase (1,250+ questions, models, schemas, and routes).\n\nAsk me anything about the **Patient Friction Index (PFI)**, **Digital Twin Simulator**, **ASHA offline sync**, **doctor workflows**, or **API architecture**, or pick a suggested topic below!`,
        timestamp: new Date().toISOString(),
      },
    ];
  });

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeRole, setActiveRole] = useState<string>('all');
  const [suggestions, setSuggestions] = useState<SuggestedQuestionCategory[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [totalKbItems, setTotalKbItems] = useState(1258);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isReindexing, setIsReindexing] = useState(false);
  const [reindexNotification, setReindexNotification] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-detect role from URL path
  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/patient')) setActiveRole('patient');
    else if (path.startsWith('/doctor')) setActiveRole('doctor');
    else if (path.startsWith('/asha')) setActiveRole('asha');
    else if (path.startsWith('/hospital')) setActiveRole('hospital');
    else if (path.startsWith('/government')) setActiveRole('government');
    else if (path.startsWith('/admin')) setActiveRole('admin');
  }, [location.pathname]);

  // Load suggestions & status
  useEffect(() => {
    chatService.getSuggestedQuestions(activeRole).then(setSuggestions);
    chatService.getAiStatus().then((status) => {
      if (status.totalItems) setTotalKbItems(status.totalItems);
    });
  }, [activeRole]);

  // Save history
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // ignore
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await chatService.askQuestion(
        userMessage.content,
        messages,
        activeRole,
        location.pathname
      );

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.answer,
        sources: response.sources,
        suggestedQuestions: response.suggestedQuestions,
        model: response.model,
        timestamp: response.timestamp,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ Failed to fetch answer: ${err.message || 'Network error'}. Please try again.`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    const welcome: ChatMessage = {
      role: 'assistant',
      content: 'Chat history cleared. How can I assist you with PFIS today?',
      timestamp: new Date().toISOString(),
    };
    setMessages([welcome]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const toggleSpeech = (text: string, index: number) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Strip markdown formatting for cleaner speech
    const cleanText = text.replace(/[*_#`\[\]]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.onend = () => setSpeakingIndex(null);
    utterance.onerror = () => setSpeakingIndex(null);

    setSpeakingIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  const triggerVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputQuery(transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleReindex = async () => {
    setIsReindexing(true);
    setReindexNotification('Re-indexing codebase files...');
    try {
      const res = await chatService.triggerReindex();
      setReindexNotification(res.message || 'Re-indexing complete!');
      const status = await chatService.getAiStatus();
      if (status.totalItems) setTotalKbItems(status.totalItems);
    } catch (err: any) {
      setReindexNotification('Failed to reindex: ' + err.message);
    } finally {
      setIsReindexing(false);
      setTimeout(() => setReindexNotification(null), 4000);
    }
  };

  // Simple Markdown renderer
  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, lIdx) => {
      // Header 3
      if (line.startsWith('### ')) {
        return (
          <h4 key={lIdx} className="font-extrabold text-sm text-slate-900 mt-2.5 mb-1">
            {line.replace('### ', '')}
          </h4>
        );
      }
      // Header 4
      if (line.startsWith('#### ')) {
        return (
          <h5 key={lIdx} className="font-bold text-xs uppercase tracking-wider text-teal-700 mt-2 mb-1">
            {line.replace('#### ', '')}
          </h5>
        );
      }
      // Bullet items
      if (line.startsWith('- ') || line.startsWith('* ')) {
        const itemText = line.replace(/^[-*]\s+/, '');
        return (
          <li key={lIdx} className="text-xs text-slate-700 ml-3.5 list-disc leading-relaxed my-0.5">
            {renderInlineMarkdown(itemText)}
          </li>
        );
      }
      // Empty line
      if (!line.trim()) {
        return <div key={lIdx} className="h-1.5" />;
      }
      // Standard paragraph
      return (
        <p key={lIdx} className="text-xs text-slate-700 leading-relaxed my-1">
          {renderInlineMarkdown(line)}
        </p>
      );
    });
  };

  const renderInlineMarkdown = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return parts.map((part, pIdx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={pIdx} className="font-bold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={pIdx} className="px-1.5 py-0.5 rounded bg-slate-100 text-teal-800 font-mono text-[11px] border border-slate-200">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <aside aria-label="PFIS Gemini AI Assistant" className="fixed bottom-5 right-5 z-[9980]">
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open PFIS Gemini AI Copilot"
          className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-bold shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all border border-teal-400/30 text-xs tracking-wide min-h-[44px] touch-target"
        >
          <div className="relative">
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full ring-2 ring-teal-600" />
          </div>
          <span className="font-extrabold tracking-tight">PFIS AI Copilot</span>
          <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-semibold text-teal-50">
            Gemini
          </span>
        </button>
      )}

      {/* Expanded Chatbot Window */}
      {isOpen && (
        <section
          aria-label="PFIS Gemini RAG Chatbot"
          className={`flex flex-col bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden transition-all duration-300 animate-in fade-in zoom-in-95 ${
            isExpanded
              ? 'fixed inset-4 sm:inset-10 z-[9999] w-auto h-auto'
              : 'w-[calc(100vw-2.5rem)] sm:w-[420px] md:w-[460px] h-[640px] max-h-[85vh]'
          }`}
        >
          {/* Header */}
          <header className="p-3.5 bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 text-white flex items-center justify-between shadow-sm shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-xs sm:text-sm tracking-tight">PFIS AI Copilot</h3>
                  <span className="flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-teal-500/30 border border-teal-400/40 text-[9px] font-bold text-teal-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Gemini 3.6 Flash
                  </span>
                </div>
                <p className="text-[10px] text-teal-200/90 font-medium">
                  {totalKbItems.toLocaleString()} Codebase Q&As • Live RAG Index
                </p>
              </div>
            </div>

            {/* Header Controls */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleReindex}
                disabled={isReindexing}
                title="Re-index codebase knowledge base"
                className="p-1.5 rounded-lg text-teal-100 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isReindexing ? 'animate-spin text-amber-300' : ''}`} />
              </button>
              <button
                type="button"
                onClick={clearHistory}
                title="Clear conversation history"
                className="p-1.5 rounded-lg text-teal-100 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Collapse' : 'Expand window'}
                className="p-1.5 rounded-lg text-teal-100 hover:text-white hover:bg-white/10 transition-colors hidden sm:inline-flex"
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close AI Copilot"
                className="p-1.5 rounded-lg text-teal-100 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Re-index banner notification */}
          {reindexNotification && (
            <div className="bg-teal-50 border-b border-teal-200 px-3 py-1.5 text-[11px] font-semibold text-teal-800 flex items-center justify-between animate-in slide-in-from-top-1">
              <span className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-teal-600" />
                {reindexNotification}
              </span>
            </div>
          )}

          {/* Role Filter Tabs */}
          <div className="bg-slate-50 border-b border-slate-200/80 px-3 py-1.5 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none text-[11px]">
            {[
              { id: 'all', label: 'All' },
              { id: 'patient', label: 'Patient' },
              { id: 'doctor', label: 'Doctor' },
              { id: 'asha', label: 'ASHA' },
              { id: 'hospital', label: 'Hospital' },
              { id: 'government', label: 'Govt' },
              { id: 'admin', label: 'Admin' },
              { id: 'technical', label: 'Architecture' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveRole(tab.id)}
                className={`px-2.5 py-1 rounded-full font-bold transition-colors whitespace-nowrap ${
                  activeRole === tab.id
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200/80 border border-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Suggested Questions Drawer */}
          <div className="border-b border-slate-100 bg-teal-50/40 shrink-0">
            <button
              type="button"
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="w-full px-3 py-1.5 flex items-center justify-between text-[11px] font-bold text-teal-900 hover:bg-teal-50 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-teal-600" />
                Suggested Questions ({activeRole.toUpperCase()})
              </span>
              {showSuggestions ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {showSuggestions && (
              <div className="p-2.5 max-h-32 overflow-y-auto space-y-1.5">
                {suggestions.flatMap((cat) =>
                  cat.questions.map((q, idx) => (
                    <button
                      key={`${cat.category}-${idx}`}
                      type="button"
                      onClick={() => handleSendMessage(q)}
                      className="w-full text-left p-1.5 rounded-xl bg-white hover:bg-teal-50 text-[11px] font-medium text-slate-700 hover:text-teal-900 border border-slate-200/70 hover:border-teal-300 transition-all flex items-start gap-1.5 shadow-2xs"
                    >
                      <Sparkles className="w-3 h-3 text-teal-500 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{q}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-4 bg-slate-50/50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                {/* Message Bubble */}
                <div
                  className={`relative p-3.5 rounded-2xl max-w-[88%] text-xs shadow-xs ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-tr-none'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none space-y-2'
                  }`}
                >
                  {/* Sender Badge */}
                  <div className="flex items-center justify-between gap-3 mb-1 border-b border-slate-100 pb-1">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                        msg.role === 'user' ? 'text-teal-200' : 'text-teal-700'
                      }`}
                    >
                      {msg.role === 'user' ? (
                        'You'
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          PFIS Copilot
                        </>
                      )}
                    </span>
                    {msg.timestamp && (
                      <span
                        className={`text-[9px] ${
                          msg.role === 'user' ? 'text-teal-200/80' : 'text-slate-400'
                        }`}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="leading-relaxed">
                    {msg.role === 'user' ? (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      renderMarkdown(msg.content)
                    )}
                  </div>

                  {/* Source Reference Chips */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 space-y-1.5">
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                        <FileText className="w-3 h-3 text-teal-600" />
                        Codebase Source References ({msg.sources.length})
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {msg.sources.map((src, sIdx) => (
                          <span
                            key={sIdx}
                            title={`${src.title} (Relevance: ${src.relevanceScore})`}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 border border-teal-200 text-teal-800 font-mono text-[10px] hover:bg-teal-100 transition-colors"
                          >
                            <span className="w-1 h-1 rounded-full bg-teal-500" />
                            {src.file}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Follow-up Suggested Questions */}
                  {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 space-y-1">
                      <p className="text-[10px] font-bold text-slate-500">Related follow-up questions:</p>
                      <div className="space-y-1">
                        {msg.suggestedQuestions.map((fq, fqIdx) => (
                          <button
                            key={fqIdx}
                            type="button"
                            onClick={() => handleSendMessage(fq)}
                            className="w-full text-left px-2 py-1 rounded-lg bg-slate-50 hover:bg-teal-50 text-[11px] text-teal-700 hover:text-teal-900 border border-slate-200/60 font-medium transition-colors flex items-center justify-between"
                          >
                            <span className="truncate">{fq}</span>
                            <ExternalLink className="w-3 h-3 shrink-0 text-slate-400" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Bar (Copy & TTS) */}
                  {msg.role === 'assistant' && (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] text-slate-400">
                      <span>{msg.model || 'Gemini 3.6 Flash'}</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(msg.content, idx)}
                          className="flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors"
                          title="Copy text"
                        >
                          {copiedIndex === idx ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleSpeech(msg.content, idx)}
                          className="flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors"
                          title="Read aloud"
                        >
                          {speakingIndex === idx ? (
                            <VolumeX className="w-3 h-3 text-rose-600" />
                          ) : (
                            <Volume2 className="w-3 h-3" />
                          )}
                          <span>{speakingIndex === idx ? 'Stop' : 'Listen'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-lg bg-teal-600 flex items-center justify-center text-white shrink-0">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="p-3 bg-white rounded-2xl rounded-tl-none border border-slate-200 text-xs text-slate-600 shadow-2xs space-y-1.5">
                  <p className="font-semibold text-teal-800 flex items-center gap-1.5">
                    Analyzing RAG Knowledge Base...
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-teal-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-teal-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-teal-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Form */}
          <footer className="p-3 bg-white border-t border-slate-200/90 shrink-0 space-y-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder={`Ask Gemini about ${activeRole.toUpperCase()} or codebase...`}
                  disabled={isLoading}
                  className="w-full px-3.5 py-2.5 pr-9 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={triggerVoiceInput}
                  title="Voice input"
                  className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors ${
                    isListening ? 'text-rose-600 bg-rose-50 animate-pulse' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                </button>
              </div>

              <button
                type="submit"
                disabled={!inputQuery.trim() || isLoading}
                className="p-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white font-bold transition-all shadow-sm hover:shadow active:scale-95 touch-target flex items-center justify-center"
                aria-label="Send query"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
              <span>Press Enter to send</span>
              <span className="font-semibold text-teal-700">PFIS • Google Gemini 3.6 Flash RAG</span>
            </div>
          </footer>
        </section>
      )}
    </aside>
  );
};
