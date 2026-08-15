import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Send } from 'lucide-react';

const QUICK_QUESTIONS = [
  { label: 'Can I skip Loki?', icon: '⚡' },
  { label: 'Prepare me for Avengers: Secret Wars.', icon: '🛡️' },
  { label: 'I only have 6 hours.', icon: '⏱️' },
  { label: 'Explain the Multiverse.', icon: '🌌' },
  { label: 'What should I watch after No Way Home?', icon: '🕸️' },
];

export function AskCineOrderSection() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/assistant?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleQuickClick = (q: string) => {
    navigate(`/assistant?q=${encodeURIComponent(q)}`);
  };

  return (
    <section className="glass-dark rounded-2xl border border-white/10 p-6 sm:p-10 space-y-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

      <div className="max-w-3xl mx-auto text-center space-y-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Story Graph AI Intelligence</span>
        </motion.div>

        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Ask <span className="text-gradient">CineOrder AI</span>
        </h2>

        <p className="text-muted text-sm sm:text-base leading-relaxed">
          Skip manual searching. Ask natural language questions about watch orders, skipping advice, time budgets, or character lore.
        </p>
      </div>

      {/* Interactive Input Bar */}
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. Can I skip Loki? Prepare me for Avengers: Secret Wars..."
          className="w-full bg-surface border border-white/15 rounded-xl pl-5 pr-28 py-3.5 text-sm text-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-xl"
        />
        <button
          type="submit"
          className="absolute right-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/80 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-primary/25"
        >
          <span>Ask AI</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Quick Chips */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
        {QUICK_QUESTIONS.map((item) => (
          <button
            key={item.label}
            onClick={() => handleQuickClick(item.label)}
            className="px-3.5 py-1.5 rounded-full bg-surface/80 hover:bg-white/10 border border-white/10 text-xs text-muted hover:text-white transition-all hover:scale-105 flex items-center gap-1.5"
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
