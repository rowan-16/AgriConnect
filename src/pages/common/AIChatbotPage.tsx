import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, Send, Sparkles, RefreshCw, Download, Volume2, Mic, Globe,
  Sprout, CloudSun, TrendingUp, PackageCheck, Bug, TestTube, HelpCircle, AlertCircle,
  FileText, CheckCircle2, MessageSquare, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { aiChatbotService, ChatMessage, LanguageCode } from '../../services/aiChatbotService';

export const AIChatbotPage: React.FC = () => {
  const { user, role } = useAuth();
  const { showToast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('agriconnect_chatbot_language');
    return (saved as LanguageCode) || 'en';
  });

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem('agriconnect_chatbot_language', lang);
  };
  const [isListening, setIsListening] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'all' | 'crop' | 'pest' | 'weather' | 'market' | 'orders'>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const history = aiChatbotService.getChatHistory(user?.id);
    setMessages(history);
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isGrounded: true,
      language,
    };

    const updated = [...messages, userMsg];
    setMessages(updated);
    if (!textToSend) setInput('');
    setIsTyping(true);

    setTimeout(async () => {
      const botMsg = await aiChatbotService.processQuery(userMsg.text, user, language);
      const finalMessages = [...updated, botMsg];
      setMessages(finalMessages);
      aiChatbotService.saveChatHistory(finalMessages, user?.id);
      setIsTyping(false);
    }, 400);
  };

  const handlePromptCard = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.replace(/[*#]/g, ''));
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleExportTranscript = () => {
    const content = aiChatbotService.exportTranscript(messages);
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `agriconnect_ai_chat_${Date.now()}.txt`;
    link.click();
    showToast('Chat transcript exported successfully.', 'success', 'Export Complete');
  };

  const clearChat = () => {
    const initial = aiChatbotService.getChatHistory(user?.id).slice(0, 1);
    setMessages(initial);
    aiChatbotService.saveChatHistory(initial, user?.id);
    showToast('Conversation cleared.', 'info', 'Chat Reset');
  };

  const getSourceBadge = (source?: ChatMessage['groundedSource']) => {
    switch (source) {
      case 'crop_recommendation':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold">
            <Sprout className="w-3.5 h-3.5" /> AI Crop Advisory Engine
          </span>
        );
      case 'pest_diagnostic':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 text-xs font-bold">
            <Bug className="w-3.5 h-3.5" /> Plant Health & Pest Diagnostic
          </span>
        );
      case 'npk_advisory':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-800 text-xs font-bold">
            <TestTube className="w-3.5 h-3.5" /> NPK Fertilizer & Soil Health
          </span>
        );
      case 'weather_integration':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-100 text-sky-800 text-xs font-bold">
            <CloudSun className="w-3.5 h-3.5" /> Live Microclimate Weather
          </span>
        );
      case 'market_demand':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 text-xs font-bold">
            <TrendingUp className="w-3.5 h-3.5" /> Market Demand Index
          </span>
        );
      case 'order_tracking':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-100 text-purple-800 text-xs font-bold">
            <PackageCheck className="w-3.5 h-3.5" /> Order & Transaction Database
          </span>
        );
      case 'produce_catalog':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-100 text-teal-800 text-xs font-bold">
            <Sprout className="w-3.5 h-3.5" /> MongoDB Produce & Farmer Catalog
          </span>
        );
      case 'platform_help':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold">
            <HelpCircle className="w-3.5 h-3.5" /> AgriConnect Knowledgebase
          </span>
        );
      default:
        return null;
    }
  };

  const presetCards = [
    {
      title: 'List Products & Farmers',
      desc: 'Fetch live agricultural produce and farmer details directly from MongoDB Atlas.',
      prompt: 'List the product and the farmer',
      icon: Sprout,
      color: 'from-emerald-600 to-teal-700',
    },
    {
      title: 'Recommend Crops',
      desc: 'Get soil and season matched crop advice with yield & profit score.',
      prompt: 'Recommend suitable crops for my Black soil location in Rabi season',
      icon: Sprout,
      color: 'from-emerald-500 to-teal-600',
    },
    {
      title: 'Pest & Health Diagnostic',
      desc: 'Identify leaf spots, fungal blight, and pest remedies.',
      prompt: 'My crop leaves are turning yellow with brown spots, what pest spray should I use?',
      icon: Bug,
      color: 'from-rose-500 to-amber-600',
    },
    {
      title: 'Weather & Soil Moisture',
      desc: 'Check live weather forecast and irrigation advice for your region.',
      prompt: 'What is today\'s weather forecast and soil moisture level?',
      icon: CloudSun,
      color: 'from-sky-500 to-blue-600',
    },
    {
      title: 'Market Price Trends',
      desc: 'View 30-day demand surges and mandi prices for paddy, spices & vegetables.',
      prompt: 'Which crops currently have the highest market demand surge?',
      icon: TrendingUp,
      color: 'from-amber-500 to-orange-600',
    },
    {
      title: 'Track Orders & Delivery',
      desc: 'Look up real-time status and estimated delivery dates for active orders.',
      prompt: 'Track my recent orders status and delivery reference',
      icon: PackageCheck,
      color: 'from-purple-500 to-indigo-600',
    },
    {
      title: 'NPK Fertilizer Formula',
      desc: 'Calculate NPK split dosing and farm yard manure recommendations.',
      prompt: 'What is the recommended NPK fertilizer split ratio for wheat?',
      icon: TestTube,
      color: 'from-indigo-500 to-blue-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-slate-900 font-black shadow-lg shrink-0">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">AgriBot AI Assistant Studio</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Grounded AI
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-2xl">
                24/7 AI Agronomic Advisor & Platform Support grounded in live AgriConnect crop algorithms, microclimate weather, market demand logs, and order records.
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Language Switcher */}
            <div className="flex items-center bg-slate-800/90 rounded-xl px-3 py-2 border border-slate-700 text-xs font-semibold">
              <Globe className="w-4 h-4 text-emerald-400 mr-2" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as LanguageCode)}
                className="bg-transparent text-white font-bold outline-none cursor-pointer"
              >
                <option value="en" className="bg-slate-900 text-white">English (EN)</option>
                <option value="hi" className="bg-slate-900 text-white">हिन्दी (Hindi)</option>
                <option value="mr" className="bg-slate-900 text-white">मराठी (Marathi)</option>
                <option value="ta" className="bg-slate-900 text-white">தமிழ் (Tamil)</option>
              </select>
            </div>

            <button
              onClick={handleExportTranscript}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all border border-slate-700 flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" /> Export Transcript
            </button>

            <button
              onClick={clearChat}
              className="px-3.5 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-xl text-xs font-bold transition-all border border-rose-500/30 flex items-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4" /> Reset Chat
            </button>
          </div>
        </div>
      </div>

      {/* Quick Launch Preset Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {presetCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <button
              key={idx}
              onClick={() => handlePromptCard(card.prompt)}
              className="bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl p-4 text-left shadow-xs hover:shadow-md transition-all group flex items-start gap-3.5 hover:scale-[1.01]"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shrink-0 shadow-sm group-hover:scale-110 transition-transform`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-emerald-700 transition-colors">
                  {card.title}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-tight">
                  {card.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Studio Conversation Workspace */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-soft-lg flex flex-col h-[600px] overflow-hidden">
        
        {/* Workspace Sub-Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 font-semibold">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active Knowledge Grounding: <strong>AgriConnect ML Advisory, OpenWeather, MongoDB Orders</strong></span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Grounded Responses Active</span>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/40">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-3xl p-4 text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-xs shadow-md shadow-emerald-600/15 font-medium'
                    : 'bg-white border border-slate-200/90 text-slate-800 rounded-bl-xs shadow-xs'
                }`}
              >
                {/* Grounded Source Badge & Voice Read Aloud */}
                {msg.sender === 'bot' && (
                  <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2 gap-2">
                    {msg.isGrounded ? (
                      getSourceBadge(msg.groundedSource)
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 text-xs font-bold">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> General Response
                      </span>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => speakText(msg.text)}
                        title="Read Aloud"
                        className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-emerald-600 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-semibold"
                      >
                        <Volume2 className="w-4 h-4" /> Listen
                      </button>
                      <span className="text-xs text-slate-400 font-semibold">{msg.timestamp}</span>
                    </div>
                  </div>
                )}

                {/* Message Body */}
                <div className="whitespace-pre-line font-sans text-slate-900">{msg.text}</div>

                {/* Suggested Action Chips */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                    {msg.suggestedActions.map((act, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSendMessage(act.label)}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl transition-all border border-emerald-200/80 hover:scale-[1.02]"
                      >
                        {act.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <span className="text-xs text-slate-400 mt-1 mr-2 font-medium">{msg.timestamp}</span>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-slate-500 text-xs bg-white p-3.5 rounded-2xl w-32 border border-slate-200 shadow-xs">
              <Bot className="w-4 h-4 text-emerald-600 animate-spin" />
              <span className="font-semibold">AgriBot thinking...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-4 bg-white border-t border-slate-200 flex items-center gap-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your agronomic question, pest query, weather check, or order tracking request..."
            className="flex-1 bg-slate-50 text-slate-900 text-sm rounded-2xl px-4 py-3 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 border border-slate-200 transition-all font-medium"
          />

          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-sm rounded-2xl transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2"
          >
            <span>Send Query</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
