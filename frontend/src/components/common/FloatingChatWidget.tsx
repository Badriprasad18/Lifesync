import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User as UserIcon,
  RotateCcw,
  Minimize2,
  Maximize2,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { sendChatMessage } from '../../services/api';
import { ChatMessage } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const FloatingChatWidget: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: user?.profile?.full_name
        ? `Hello **${user.profile.full_name}**! 👋 I am your **LifeSync AI Assistant**. I have real-time access to your lifestyle metrics, ML archetype, and wellness scoring. How can I help you today?`
        : 'Hello! 👋 I am your **LifeSync AI Assistant**. Ask me anything about our wellness scoring (LWI), 6 lifestyle pillars, K-Means clustering, or personalized recommendations!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: [
        'What is my current score?',
        'How is LWI calculated?',
        'Which ML models are used?',
        'What are my top recommendations?',
      ],
      engine: 'offline_knowledge_engine',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const handleSend = async (messageToSend?: string) => {
    const text = (messageToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsgId = `user-${Date.now()}`;
    const newMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const history = messages.slice(-6).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

      const res = await sendChatMessage(text, history);

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: res.suggestions || [],
        engine: res.engine,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: 'assistant',
        text: 'Sorry, I encountered an issue connecting to the AI service. Please make sure the backend is running and try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
        suggestions: ['How is LWI calculated?', 'Which ML models are used?'],
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: user?.profile?.full_name
          ? `Conversation reset. Ready to assist you, **${user.profile.full_name}**! What would you like to explore?`
          : 'Conversation reset. Feel free to ask about any feature, machine learning model, or metric in LifeSync AI!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: [
          'What is my current score?',
          'How is LWI calculated?',
          'Which ML models are used?',
          'What are my top recommendations?',
        ],
      },
    ]);
  };

  // Basic markdown-like formatter for bold text, bullet points and linebreaks
  const renderFormattedText = (rawText: string) => {
    const lines = rawText.split('\n');
    return lines.map((line, idx) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedParts = parts.map((part, pIdx) => {
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
          <div key={idx} className="flex items-start gap-1.5 my-0.5">
            <span className="text-cyan-500 font-bold">•</span>
            <span className="flex-1">{formattedParts}</span>
          </div>
        );
      }

      if (line.trim().length === 0) {
        return <div key={idx} className="h-1.5" />;
      }

      return (
        <p key={idx} className="my-0.5 leading-relaxed">
          {formattedParts}
        </p>
      );
    });
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-full bg-gradient-to-r from-cyan-500 via-teal-500 to-violet-600 text-white font-medium shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105 active:scale-95 transition-all duration-200 group"
          aria-label="Open AI Assistant"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white animate-bounce" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-white dark:ring-slate-900" />
          </div>
          <span className="text-sm font-semibold tracking-wide">Ask AI Assistant</span>
          <Sparkles className="w-4 h-4 text-amber-300 opacity-80 group-hover:rotate-12 transition-transform" />
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 ease-out flex flex-col rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800/90 bg-white/95 dark:bg-[#0c1222]/95 backdrop-blur-2xl overflow-hidden ${
            isExpanded
              ? 'bottom-4 right-4 left-4 lg:left-auto lg:w-[680px] h-[85vh]'
              : 'bottom-4 right-4 left-4 sm:left-auto sm:w-[420px] h-[580px] max-h-[90vh]'
          }`}
        >
          {/* Header */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-cyan-600/90 via-teal-600/90 to-violet-700/90 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm tracking-tight">LifeSync AI Assistant</h3>
                  <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider bg-emerald-400/20 text-emerald-200 px-1.5 py-0.5 rounded-full border border-emerald-300/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-cyan-100/90 truncate max-w-[220px]">
                  {user?.profile?.full_name ? `Personalized for ${user.profile.full_name}` : 'Real-time Platform Support'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-white/80">
              <Link
                to="/assistant"
                onClick={() => setIsOpen(false)}
                title="Open Fullscreen Assistant"
                className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
              <button
                onClick={handleResetChat}
                title="Reset Conversation"
                className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Collapse' : 'Expand'}
                className="hidden sm:block p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close Assistant"
                className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Subheader info pill */}
          <div className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5 truncate">
              <Sparkles className="w-3 h-3 text-cyan-500 shrink-0" />
              Ask anything about scoring, ML clustering, or your profile!
            </span>
            <Link
              to="/assistant"
              onClick={() => setIsOpen(false)}
              className="text-cyan-500 hover:text-cyan-600 font-medium shrink-0 ml-2"
            >
              Full Page &rarr;
            </Link>
          </div>

          {/* Message Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs text-slate-700 dark:text-slate-300">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-500 to-violet-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-br-xs'
                      : msg.isError
                      ? 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-200 rounded-bl-xs'
                      : 'bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 rounded-bl-xs'
                  }`}
                >
                  <div className="space-y-1">{renderFormattedText(msg.text)}</div>

                  <div className="flex items-center justify-between gap-2 mt-1.5 pt-1 border-t border-slate-200/40 dark:border-slate-700/40 text-[10px] opacity-75">
                    <span>{msg.timestamp}</span>
                    {msg.engine && (
                      <span className="text-[9px] uppercase tracking-wider font-semibold opacity-70">
                        {msg.engine === 'offline_knowledge_engine' ? 'Local Engine' : 'AI Cloud'}
                      </span>
                    )}
                  </div>

                  {/* Suggestion Chips */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex flex-wrap gap-1.5">
                      {msg.suggestions.map((suggestion, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => handleSend(suggestion)}
                          className="text-[10px] font-medium px-2 py-1 rounded-md bg-white/80 dark:bg-slate-900/80 hover:bg-cyan-50 dark:hover:bg-cyan-950/50 hover:text-cyan-600 dark:hover:text-cyan-400 border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs text-left"
                        >
                          💬 {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 py-1">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-500 to-violet-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] font-medium ml-1">AI analyzing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick prompt strip */}
          <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[11px]">
            <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider shrink-0">
              Suggestions:
            </span>
            <button
              onClick={() => handleSend('What is my current score?')}
              className="shrink-0 px-2.5 py-0.5 rounded-full bg-white dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium transition-colors"
            >
              My Score
            </button>
            <button
              onClick={() => handleSend('Explain the 4 K-Means clusters')}
              className="shrink-0 px-2.5 py-0.5 rounded-full bg-white dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium transition-colors"
            >
              ML Clusters
            </button>
            <button
              onClick={() => handleSend('How is LWI calculated?')}
              className="shrink-0 px-2.5 py-0.5 rounded-full bg-white dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium transition-colors"
            >
              Scoring Formula
            </button>
            <button
              onClick={() => handleSend('How do I download my PDF report?')}
              className="shrink-0 px-2.5 py-0.5 rounded-full bg-white dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium transition-colors"
            >
              PDF Report
            </button>
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white dark:bg-[#0c1222] border-t border-slate-200/80 dark:border-slate-800 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about your score, ML models, or advice..."
              disabled={isLoading}
              className="flex-1 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-medium shadow-md shadow-cyan-500/20 hover:from-cyan-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
