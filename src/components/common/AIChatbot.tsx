import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, X, Send, Sparkles, AlertCircle, CheckCircle2, 
  Sprout, CloudSun, TrendingUp, PackageCheck, HelpCircle, RefreshCw, MessageSquare,
  Globe, Volume2, Mic, Bug, TestTube
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { aiChatbotService, ChatMessage, LanguageCode } from '../../services/aiChatbotService';
import { SupportedLanguage } from '../../services/translations';

export const AIChatbot: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Independent Chatbot Language State (Does NOT affect website language)
  const [chatbotLanguage, setChatbotLanguage] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('agriconnect_chatbot_language');
    return (saved as LanguageCode) || 'en';
  });

  const handleLanguageChange = (l: LanguageCode) => {
    setChatbotLanguage(l);
    localStorage.setItem('agriconnect_chatbot_language', l);
  };

  useEffect(() => {
    const history = aiChatbotService.getChatHistory(user?.id);
    setMessages(history);
  }, [user]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

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
      language: chatbotLanguage,
    };

    const updated = [...messages, userMsg];
    setMessages(updated);
    if (!textToSend) setInput('');
    setIsTyping(true);

    setTimeout(async () => {
      const botMsg = await aiChatbotService.processQuery(userMsg.text, user, chatbotLanguage);
      const finalMessages = [...updated, botMsg];
      setMessages(finalMessages);
      aiChatbotService.saveChatHistory(finalMessages, user?.id);
      setIsTyping(false);
    }, 400);
  };

  const handleQuickAction = (actionKey: string) => {
    let prompt = '';
    switch (actionKey) {
      case 'list_products':
        prompt = 'List the product and the farmer';
        break;
      case 'say_hello':
        prompt = 'Hello! How are you doing today?';
        break;
      case 'recommend_crops':
        prompt = 'Recommend suitable crops for my Black soil location in Rabi season';
        break;
      case 'pest_help':
        prompt = 'My leaves are turning yellow with brown spots, what pest/fungus spray should I use?';
        break;
      case 'weather_check':
        prompt = 'What is today\'s weather forecast and soil moisture?';
        break;
      case 'track_orders':
        prompt = 'Track my recent orders status';
        break;
      case 'trending_market':
        prompt = 'Which crops have the highest market demand trends?';
        break;
      default:
        prompt = actionKey;
    }
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

  const toggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice input is not supported in your browser environment.');
      return;
    }
    
    setIsListening(true);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = chatbotLanguage === 'hi' ? 'hi-IN' : chatbotLanguage === 'mr' ? 'mr-IN' : chatbotLanguage === 'ta' ? 'ta-IN' : 'en-US';
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const clearChat = () => {
    const initial = aiChatbotService.getChatHistory(user?.id).slice(0, 1);
    setMessages(initial);
    aiChatbotService.saveChatHistory(initial, user?.id);
  };

  const getSourceBadge = (source?: ChatMessage['groundedSource']) => {
    switch (source) {
      case 'crop_recommendation':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
            <Sprout className="w-3 h-3" /> AI Crop Advisory
          </span>
        );
      case 'pest_diagnostic':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-bold">
            <Bug className="w-3 h-3" /> Plant Pest Diagnostic
          </span>
        );
      case 'npk_advisory':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[10px] font-bold">
            <TestTube className="w-3 h-3" /> NPK Fertilizer Engine
          </span>
        );
      case 'weather_integration':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 text-[10px] font-bold">
            <CloudSun className="w-3 h-3" /> Live Weather Integration
          </span>
        );
      case 'market_demand':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">
            <TrendingUp className="w-3 h-3" /> Market Demand Index
          </span>
        );
      case 'order_tracking':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[10px] font-bold">
            <PackageCheck className="w-3 h-3" /> Order Ledger
          </span>
        );
      case 'produce_catalog':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 text-[10px] font-bold">
            <Sprout className="w-3 h-3" /> Marketplace Produce
          </span>
        );
      case 'platform_help':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
            <HelpCircle className="w-3 h-3" /> AgriConnect Knowledgebase
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open AI Assistant"
        className={`fixed bottom-6 right-6 z-50 p-3.5 rounded-full shadow-2xl transition-all duration-300 flex items-center gap-2 font-bold text-sm ${
          isOpen
            ? 'bg-slate-800 text-white rotate-90 scale-95'
            : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white hover:scale-105 shadow-emerald-600/30 ring-4 ring-emerald-500/20'
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <div className="relative">
              <Bot className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full" />
            </div>
            <span className="hidden sm:inline">{t('askAgriBot', 'Ask AgriBot AI')}</span>
          </>
        )}
      </button>

      {/* Floating Chat Modal Drawer */}
      {isOpen && (
        <div className="fixed bottom-22 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[440px] h-[560px] max-h-[82vh] bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          
          {/* Drawer Header */}
          <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white flex items-center justify-between border-b border-slate-700">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-slate-900 font-black shadow-md">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm flex items-center gap-1.5">
                  AgriBot AI Assistant
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </h3>
                <p className="text-[11px] text-slate-300 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Grounded in AgriConnect v1.0 Modules
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Language Switcher Dropdown */}
              <div className="relative flex items-center bg-slate-800/80 rounded-lg px-2 py-1 border border-slate-700 text-xs">
                <Globe className="w-3.5 h-3.5 text-emerald-400 mr-1" />
                <select
                  value={chatbotLanguage}
                  onChange={(e) => handleLanguageChange(e.target.value as LanguageCode)}
                  className="bg-transparent text-white text-[11px] font-bold outline-none cursor-pointer"
                >
                  <option value="en" className="bg-slate-900 text-white">EN</option>
                  <option value="hi" className="bg-slate-900 text-white">हिन्दी</option>
                  <option value="mr" className="bg-slate-900 text-white">मराठी</option>
                  <option value="ta" className="bg-slate-900 text-white">தமிழ்</option>
                </select>
              </div>

              <button
                type="button"
                onClick={clearChat}
                title="Reset Conversation"
                className="p-1.5 hover:bg-slate-700/60 text-slate-300 hover:text-white rounded-lg transition-colors text-xs flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-slate-700/60 text-slate-300 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[90%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-xs shadow-md shadow-emerald-600/10 font-medium'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs shadow-xs'
                  }`}
                >
                  {/* Grounded Source Badge & Read Aloud for Bot */}
                  {msg.sender === 'bot' && (
                    <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-1.5 gap-2">
                      {msg.isGrounded ? (
                        getSourceBadge(msg.groundedSource)
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">
                          <AlertCircle className="w-3 h-3 text-amber-600" /> Grounding Info
                        </span>
                      )}

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => speakText(msg.text)}
                          title="Read aloud"
                          className="p-1 hover:bg-slate-100 text-slate-400 hover:text-emerald-600 rounded transition-colors"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-[10px] text-slate-400 font-semibold">{msg.timestamp}</span>
                      </div>
                    </div>
                  )}

                  {/* Message Content */}
                  <div className="whitespace-pre-line font-sans">{msg.text}</div>

                  {/* Suggested Actions if any */}
                  {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                      {msg.suggestedActions.map((act, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleQuickAction(act.action)}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-[11px] rounded-lg transition-colors border border-emerald-200/70 flex items-center gap-1"
                        >
                          {act.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <span className="text-[10px] text-slate-400 mt-1 mr-1">{msg.timestamp}</span>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-slate-400 text-xs bg-white p-3 rounded-2xl w-28 border border-slate-200">
                <Bot className="w-4 h-4 text-emerald-600 animate-spin" />
                <span>Thinking...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <button
              type="button"
              onClick={toggleVoiceInput}
              title="Voice Query Input"
              className={`p-2.5 rounded-xl border transition-all ${
                isListening
                  ? 'bg-rose-500 text-white border-rose-500 animate-pulse'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200'
              }`}
            >
              <Mic className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about crops, pests, NPK, weather, orders..."
              className="flex-1 bg-slate-100 text-slate-800 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 border border-transparent transition-all"
            />

            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="p-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl transition-all shadow-md shadow-emerald-600/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
