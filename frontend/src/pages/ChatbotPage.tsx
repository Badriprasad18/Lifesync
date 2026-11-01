import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  User as UserIcon,
  RotateCcw,
  Copy,
  Check,
  HelpCircle,
  ShieldAlert,
  BrainCircuit,
  Activity,
  ChevronRight,
  Lightbulb,
  Cpu,
  FileText,
} from 'lucide-react';
import { sendChatMessage, fetchChatFaqs } from '../services/api';
import { ChatMessage, ChatFaq } from '../types';
import { useAuth } from '../context/AuthContext';

export const ChatbotPage: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'init-1',
      sender: 'assistant',
      text: user?.profile?.full_name
        ? `Welcome to the LifeSync AI Assistant, **${user.profile.full_name}**! 🤖✨\n\nI have live context of your health metrics (Height: **${user.profile.height_cm || 188} cm**, Weight: **${user.profile.weight_kg || 65} kg**, BMI: **18.4 kg/m²**). You can ask me anything about your LifeSync Wellness Index (LWI), the 4 K-Means cluster archetypes, Isolation Forest anomaly detection, or actionable wellness micro-habits.`
        : 'Welcome to the LifeSync AI Real-Time Assistant! 🤖✨\n\nI am your comprehensive guide to the LifeSync platform. Ask me about our 6-pillar assessment, scoring formulas, machine learning models, or personalized recommendations.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: [
        'What is my current score?',
        'How does the K-Means clustering model work?',
        'How is the LifeSync Wellness Index (LWI) calculated?',
        'What are the 6 lifestyle pillars?',
      ],
      engine: 'offline_knowledge_engine',
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [faqs, setFaqs] = useState<ChatFaq[]>([]);
  const [activeFaqCategory, setActiveFaqCategory] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load FAQs
    fetchChatFaqs()
      .then((data) => setFaqs(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.slice(-8).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

      const res = await sendChatMessage(query, history);

      const botMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        sender: 'assistant',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: res.suggestions || [],
        engine: res.engine,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errReply: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'I could not process your request right now. Please verify your connection to the LifeSync API and try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
        suggestions: ['What is my current score?', 'Explain the ML engine'],
      };
      setMessages((prev) => [...prev, errReply]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: `reset-${Date.now()}`,
        sender: 'assistant',
        text: `Conversation restarted. Hello **${user?.profile?.full_name || 'Guest'}**, how can I assist your wellness journey or project inquiry today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: [
          'What is my current score?',
          'Which ML models are used in LifeSync AI?',
          'How is LWI calculated?',
          'What are my top recommendations?',
        ],
      },
    ]);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const categories = ['All', ...Array.from(new Set(faqs.map((f) => f.category)))];
  const filteredFaqs =
    activeFaqCategory === 'All' ? faqs : faqs.filter((f) => f.category === activeFaqCategory);

  const renderFormattedText = (raw: string) => {
    const lines = raw.split('\n');
    return lines.map((line, idx) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formatted = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={pIdx} className="font-semibold text-slate-900 dark:text-white">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
        return (
          <div key={idx} className="flex items-start gap-2 my-1 pl-1">
            <span className="text-cyan-500 font-bold">•</span>
            <span className="flex-1 text-slate-700 dark:text-slate-300">{formatted}</span>
          </div>
        );
      }

      if (line.trim().length === 0) {
        return <div key={idx} className="h-2" />;
      }

      return (
        <p key={idx} className="my-1 leading-relaxed text-slate-700 dark:text-slate-300">
          {formatted}
        </p>
      );
    });
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-900/60 via-slate-900/90 to-violet-950/80 border border-cyan-500/30 p-6 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                Real-Time AI Assistant
              </span>
              <span className="text-xs text-slate-400">Hybrid AI / Offline Knowledge Engine</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              LifeSync Conversational Intelligence
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Ask questions about lifestyle health scoring, machine learning algorithms, personalized
              recommendations, and your live assessment data.
            </p>
          </div>

          {/* User Live Context Pill */}
          {user && (
            <div className="shrink-0 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 text-xs text-slate-200 space-y-1">
              <div className="flex items-center gap-2 font-semibold text-white">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Live Context Active</span>
              </div>
              <div className="text-[11px] text-slate-300">
                User: <strong className="text-white">{user.profile?.full_name || user.email}</strong>
              </div>
              <div className="text-[11px] text-slate-300 flex items-center gap-2">
                <span>Height: {user.profile?.height_cm || 188} cm</span>
                <span>•</span>
                <span>Weight: {user.profile?.weight_kg || 65} kg</span>
                <span>•</span>
                <span className="text-teal-300 font-semibold">BMI: 18.4</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Chat Workspace + FAQ & Knowledge Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Chat Conversation Container */}
        <div className="lg:col-span-8 flex flex-col h-[700px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1222] shadow-sm overflow-hidden">
          {/* Chat Top bar */}
          <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center text-white shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  LifeSync AI Assistant
                </h3>
                <span className="text-[11px] text-emerald-500 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Ready to assist in real-time
                </span>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-cyan-500 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-cyan-500/40 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Chat</span>
            </button>
          </div>

          {/* Conversation history */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-violet-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-xs relative group ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-br-none'
                      : msg.isError
                      ? 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-bl-none'
                      : 'bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 rounded-bl-none'
                  }`}
                >
                  {/* Copy button on hover */}
                  {msg.sender === 'assistant' && (
                    <button
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="absolute top-2 right-2 p-1 rounded-md bg-white/70 dark:bg-slate-900/70 opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-cyan-500"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}

                  <div className="text-sm">{renderFormattedText(msg.text)}</div>

                  <div className="flex items-center justify-between gap-3 mt-2 pt-1.5 border-t border-slate-200/40 dark:border-slate-700/40 text-[11px] opacity-70">
                    <span>{msg.timestamp}</span>
                    {msg.engine && (
                      <span className="text-[10px] uppercase font-semibold">
                        {msg.engine === 'offline_knowledge_engine' ? 'Local Engine' : 'AI Cloud'}
                      </span>
                    )}
                  </div>

                  {/* Suggestion Chips */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 flex flex-wrap gap-2">
                      {msg.suggestions.map((sug, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => handleSendMessage(sug)}
                          className="text-xs font-medium px-2.5 py-1 rounded-lg bg-white/90 dark:bg-slate-900/90 hover:bg-cyan-50 dark:hover:bg-cyan-950/50 hover:text-cyan-600 dark:hover:text-cyan-400 border border-slate-200 dark:border-slate-700 transition-all text-slate-700 dark:text-slate-300 shadow-2xs"
                        >
                          💬 {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-3 py-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-violet-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-violet-500 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-xs font-medium text-slate-500 ml-1">AI Assistant is typing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input field container */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1222]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-3"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your score, ML models, sleep analysis, recommendations..."
                disabled={loading}
                className="flex-1 bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white font-medium shadow-md shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95 flex items-center gap-2 shrink-0"
              >
                <span>Send</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Knowledge Base, FAQs, and Viva Quick Cards */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Prompts Panel */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1222] p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>Recommended Inquiries</span>
            </div>
            <p className="text-xs text-slate-500">
              Click any question to ask the AI assistant immediately:
            </p>
            <div className="space-y-2">
              {[
                { title: 'What is my current score?', desc: 'Check latest LWI and tier' },
                { title: 'Explain the 4 K-Means clusters', desc: 'Archetype breakdown & centroids' },
                { title: 'How does Isolation Forest detect anomalies?', desc: 'Contamination factor & multivariate detection' },
                { title: 'How is LWI calculated?', desc: 'Deterministic 0-100 score formulas' },
                { title: 'What are my top recommendations?', desc: 'Actionable micro-habits' },
                { title: 'How do I download my PDF report?', desc: 'ReportLab PDF export instructions' },
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(item.title)}
                  className="w-full text-left p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-cyan-500/40 hover:bg-cyan-50/50 dark:hover:bg-cyan-950/20 transition-all flex items-center justify-between group"
                >
                  <div>
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-cyan-500">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-slate-400">{item.desc}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-500 transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          </div>

          {/* Categorized FAQs Accordion */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1222] p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <HelpCircle className="w-4 h-4 text-cyan-500" />
                <span>Service Knowledge Base</span>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-500">
                {faqs.length} FAQs
              </span>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveFaqCategory(cat)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                    activeFaqCategory === cat
                      ? 'bg-cyan-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* FAQ List */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {filteredFaqs.map((faq, fIdx) => (
                <div
                  key={fIdx}
                  onClick={() => handleSendMessage(faq.question)}
                  className="cursor-pointer p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 hover:border-cyan-500/30 transition-colors"
                >
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                    <span>{faq.question}</span>
                    <span className="text-[10px] text-cyan-500 uppercase tracking-wider font-bold">
                      {faq.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Academic Viva & Safety Notice */}
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-xs space-y-1.5 text-amber-700 dark:text-amber-300">
            <div className="flex items-center gap-2 font-bold">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <span>Medical Safety & Educational Policy</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-200/90">
              LifeSync AI is an educational lifestyle optimization and academic ML research system.
              It does not diagnose, treat, or replace professional clinical consultations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
