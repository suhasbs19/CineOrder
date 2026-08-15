import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Sparkles,
  Send,
  Bot,
  User as UserIcon,
  HelpCircle,
  RotateCcw,
  Compass,
  CheckCircle2,
  Eye,
} from 'lucide-react';
import {
  processAIQuery,
  resetConversationContext,
  getConversationContext,
  type ChatMessage,
} from '@/lib/aiAdvisorEngine';
import { useWatchStore } from '@/store/watchStore';
import { AdvisorResponseCard } from '@/components/ui/AdvisorResponseCard';
import { SafeMarkdown } from '@/components/ui/SafeMarkdown';
import { Button } from '@/components/ui/Button';

const QUICK_ACTIONS = [
  { label: '🎯 Prepare Me', query: 'Prepare me for Avengers: Endgame.' },
  { label: '⏱️ 8-Hour Budget', query: 'I only have 8 hours.' },
  { label: '🦸 Iron Man Arc', query: "Show Iron Man's journey." },
  { label: '🍿 Watch Tonight', query: 'What should I watch tonight?' },
  { label: '⏭️ Skip Eternals?', query: 'Can I skip Eternals?' },
  { label: '🏁 Start Marvel', query: 'Where should I start with Marvel?' },
  { label: '🔮 What\'s Next?', query: "What's coming soon?" },
  { label: '📖 Multiverse Lore', query: 'Explain the Multiverse.' },
];

export default function AssistantPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { watchHistory } = useWatchStore();

  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showWatchedPanel, setShowWatchedPanel] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const watchedArray = Object.keys(watchHistory).filter((k) => watchHistory[k]);

  // Welcome message initialization
  useEffect(() => {
    const initialQuery = searchParams.get('q');

    const welcomeMsg: ChatMessage = {
      id: 'welcome-1',
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `Hello! I am your **CineOrder AI Movie Advisor**, powered by our **Story Knowledge Graph**.\n\nAsk me anything! I can calculate custom watch plans, check if titles are skippable, plot character arcs, or recommend what to watch tonight based on your watch history.`,
      data: {
        type: 'general',
        intent: 'general',
        resolvedEntities: [],
        followUpSuggestions: [
          'Prepare me for Avengers: Endgame.',
          'I only have 8 hours.',
          'Can I skip Eternals?',
          'What should I watch tonight?',
        ],
      },
    };

    setMessages([welcomeMsg]);

    if (initialQuery) {
      handleSendQuery(initialQuery);
    }
  }, [searchParams]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendQuery = (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setIsTyping(true);

    setTimeout(() => {
      const responseMsg = processAIQuery(query, watchedArray, messages);
      setMessages((prev) => [...prev, responseMsg]);
      setIsTyping(false);
    }, 450);
  };

  const toggleSpoilerFor = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId ? { ...m, spoilersRevealed: !m.spoilersRevealed } : m
      )
    );
  };

  const handleResetChat = () => {
    resetConversationContext();
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `Chat reset! How can I assist your movie marathon today?`,
        data: {
          type: 'general',
          intent: 'general',
          resolvedEntities: [],
          followUpSuggestions: [
            'Prepare me for Avengers: Endgame.',
            'I only have 6 hours.',
            'Where should I start with Marvel?',
          ],
        },
      },
    ]);
  };

  const activeContext = getConversationContext();

  return (
    <>
      <Helmet>
        <title>AI Movie Advisor — CineOrder</title>
        <meta
          name="description"
          content="Ask CineOrder's AI Movie Advisor natural language questions about watch orders, skipping advice, time budgets, character timelines, and story graphs."
        />
      </Helmet>

      <div className="min-h-screen pt-24 pb-12 flex flex-col">
        <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 flex-1 flex flex-col space-y-5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary shadow-lg shadow-primary/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  AI Movie <span className="text-gradient">Advisor</span>
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                  Story Graph v3.0
                </span>
              </div>
              <p className="text-xs text-muted">
                Knowledge Graph-backed intelligence for watch plans, skip advice, timelines, and lore.
              </p>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowWatchedPanel(!showWatchedPanel)}
                leftIcon={<Eye className="w-3.5 h-3.5" />}
                className="text-xs text-muted hover:text-white"
              >
                Watched Context ({watchedArray.length})
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetChat}
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                className="text-xs text-muted hover:text-white"
              >
                Reset Chat
              </Button>
            </div>
          </div>

          {/* Context Banner */}
          {activeContext.lastEntity && (
            <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs">
              <span className="text-muted flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-primary" /> Active Context:
                <span className="font-bold text-white">{activeContext.lastEntity.name}</span>
              </span>
              <span className="text-[10px] text-muted">Turn #{activeContext.turnCount}</span>
            </div>
          )}

          {/* Watched Context Panel */}
          {showWatchedPanel && (
            <div className="p-4 rounded-xl bg-surface border border-white/10 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  Your Watched History ({watchedArray.length} items)
                </span>
                <span className="text-[10px] text-muted">The AI Advisor uses this to tailor preparation guides and skip advice.</span>
              </div>
              <p className="text-muted">
                {watchedArray.length === 0
                  ? 'No titles marked watched yet. Click "Watched" on any movie page to update your status.'
                  : `${watchedArray.length} titles marked watched in your profile.`}
              </p>
            </div>
          )}

          {/* Quick Action Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <span className="text-[10px] font-bold uppercase text-muted tracking-wider whitespace-nowrap flex items-center gap-1">
              <HelpCircle className="w-3 h-3 text-primary" /> Quick Actions:
            </span>
            {QUICK_ACTIONS.map((act) => (
              <button
                key={act.label}
                onClick={() => handleSendQuery(act.query)}
                className="px-3 py-1.5 rounded-full bg-surface/80 hover:bg-primary/20 border border-white/10 hover:border-primary/40 text-xs text-muted hover:text-white transition-all whitespace-nowrap"
              >
                {act.label}
              </button>
            ))}
          </div>

          {/* Chat Container */}
          <div className="flex-1 glass-dark rounded-2xl border border-white/10 p-4 sm:p-6 flex flex-col justify-between space-y-6 overflow-hidden min-h-[520px]">
            {/* Messages Scroll Area */}
            <div className="flex-1 space-y-6 overflow-y-auto max-h-[620px] pr-2 scrollbar-thin">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'assistant' && (
                    <div className="w-8 h-8 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary flex-shrink-0 mt-1 shadow-md">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`space-y-3 max-w-2xl ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    {/* Message Bubble */}
                    <div
                      className={`p-4 rounded-2xl text-sm leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-primary text-white shadow-lg shadow-primary/25 rounded-tr-none'
                          : 'bg-surface/80 border border-white/10 text-white rounded-tl-none space-y-3 shadow-md'
                      }`}
                    >
                      {msg.sender === 'user' ? (
                        <div className="whitespace-pre-line">{msg.text}</div>
                      ) : (
                        <SafeMarkdown content={msg.text} />
                      )}

                      {/* Render Rich Metadata Response Cards */}
                      {msg.data && (
                        <AdvisorResponseCard
                          data={msg.data}
                          spoilersRevealed={msg.spoilersRevealed}
                          onToggleSpoilers={() => toggleSpoilerFor(msg.id)}
                          onNavigate={(path) => navigate(path)}
                          onSendQuery={(q) => handleSendQuery(q)}
                        />
                      )}

                      {/* Context-aware follow-up suggestion chips */}
                      {msg.sender === 'assistant' && msg.data?.followUpSuggestions && msg.data.followUpSuggestions.length > 0 && (
                        <div className="pt-2 border-t border-white/10 space-y-1.5">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-muted flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-primary" /> Suggested Next:
                          </span>
                          <div className="flex flex-wrap gap-1.5 pt-0.5">
                            {msg.data.followUpSuggestions.map((suggestion, sIdx) => (
                              <button
                                key={sIdx}
                                onClick={() => handleSendQuery(suggestion)}
                                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-primary/20 border border-white/10 hover:border-primary/40 text-[11px] font-medium text-white/80 hover:text-white transition-all text-left"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <span className="text-[10px] text-muted px-1">{msg.timestamp}</span>
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-8 h-8 rounded-xl bg-surface border border-white/10 flex items-center justify-center text-muted flex-shrink-0 mt-1">
                      <UserIcon className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex gap-3 items-center text-xs text-muted">
                  <div className="w-8 h-8 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary shadow-md">
                    <Bot className="w-4 h-4 animate-pulse" />
                  </div>
                  <span className="flex items-center gap-1.5 font-medium text-white/80">
                    <Sparkles className="w-3.5 h-3.5 text-primary animate-spin" />
                    CineOrder is analyzing your movie journey...
                  </span>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendQuery();
              }}
              className="relative flex items-center gap-2 pt-2 border-t border-white/10"
            >
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Ask about watch orders, skipping titles, time budgets, or character journeys..."
                className="w-full bg-surface border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm text-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button
                type="submit"
                disabled={!inputQuery.trim()}
                className="absolute right-2 p-2 rounded-lg bg-primary text-white hover:bg-primary/80 disabled:opacity-40 disabled:hover:bg-primary transition-all shadow-md shadow-primary/20"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
