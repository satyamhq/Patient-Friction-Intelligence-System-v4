// AshaCopilotDrawer.tsx - AI Field-Work Copilot for ASHA / Frontline Workers

import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Send,
  Loader2,
  Bot,
  User,
  Phone,
  CheckCircle2,
  Mic,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { chatService } from '../../services/chatService';
import { openElevenLabsCalling } from '../../services/elevenlabsCallingService';

interface AshaCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AshaCopilotDrawer: React.FC<AshaCopilotDrawerProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Array<{ role: 'assistant' | 'user'; content: string }>>([
    {
      role: 'assistant',
      content:
        'Namaste Didi! I am your AI ASHA Copilot. Ask me about your assigned households, high-risk pregnant mothers, pending child vaccines, or say "Plan today\'s visit route" to organize your field work.',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (customPrompt?: string) => {
    const text = (customPrompt || inputQuery).trim();
    if (!text || isLoading) return;

    const userMsg = { role: 'user' as const, content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await chatService.askQuestion(
        `[ASHA Worker Field Assistant Context: Hindi/English rural frontline support] ${text}`,
        messages as any,
        'asha',
        '/asha/dashboard'
      );
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response.answer || 'I am ready to help organize your field visits. What else would you like to check?',
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I could not connect to the network right now. You can continue logging your visits offline; they will sync automatically when you reach connectivity.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="w-full sm:w-[420px] h-full bg-white shadow-2xl flex flex-col border-l border-slate-200">
        {/* Header */}
        <div className="p-4 bg-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-600/80 flex items-center justify-center text-white">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight">AI ASHA Copilot</h3>
              <p className="text-[11px] text-teal-100">Frontline Field Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => openElevenLabsCalling()}
              className="p-1.5 rounded-lg bg-teal-800/80 hover:bg-teal-800 text-white transition-colors cursor-pointer"
              title="Voice Call Mode"
            >
              <Phone className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-teal-800 text-teal-100 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Suggestion Chips (Bilingual Hindi + English matching Phase 18) */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex gap-1.5 overflow-x-auto text-[11px]">
          {[
            'Mere area mein aaj kisko visit karna chahiye?',
            'Kaunse patients ka follow-up pending hai?',
            'High-risk pregnancies due this week',
            'Kal ke visits plan karo',
            'Stalled hospital referrals',
          ].map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(chip)}
              className="px-2.5 py-1 rounded-full bg-white border border-slate-300 hover:border-teal-600 hover:bg-teal-50 text-slate-700 whitespace-nowrap transition-colors cursor-pointer"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Conversation Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-100 text-slate-800 border border-slate-200/80'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-slate-500 text-xs bg-slate-100 p-2.5 rounded-xl w-fit">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600" />
              <span>Analyzing field data...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask AI Copilot or type household name..."
            className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-teal-600"
          />
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!inputQuery.trim() || isLoading}
            className="p-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
