import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, HelpCircle, Bot } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAIAssistant } from '@/hooks/useAIAssistant';
import type { Franchise, Content } from '@/types';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  franchise?: Franchise;
  currentContent?: Content;
}

export function AIAssistantModal({
  isOpen,
  onClose,
  franchise,
  currentContent,
}: AIAssistantModalProps) {
  const { history, isLoading, askQuestion, suggestions } = useAIAssistant(franchise, currentContent);
  const [questionInput, setQuestionInput] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!questionInput.trim() || isLoading) return;
    const q = questionInput;
    setQuestionInput('');
    await askQuestion(q);
  };

  const handleChipClick = async (questionText: string) => {
    if (isLoading) return;
    await askQuestion(questionText);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-2xl bg-card border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10 bg-gradient-to-r from-primary/20 via-card to-card flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  CineOrder AI Assistant
                  <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-semibold border border-primary/30">
                    BETA
                  </span>
                </h3>
                <p className="text-xs text-muted">
                  Ask about watch orders, canon status, or timeline connections
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-muted hover:text-white rounded-xl hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Suggestions */}
          <div className="p-4 border-b border-white/5 bg-black/20 overflow-x-auto flex gap-2">
            <span className="text-xs text-muted flex items-center gap-1 self-center mr-1 flex-shrink-0">
              <HelpCircle className="w-3.5 h-3.5" /> Suggestions:
            </span>
            {suggestions.map((sug) => (
              <button
                key={sug.id}
                onClick={() => handleChipClick(sug.question)}
                disabled={isLoading}
                className="text-xs px-3 py-1.5 rounded-full bg-white/5 hover:bg-primary/20 hover:text-white text-muted-light border border-white/10 hover:border-primary/40 transition-all whitespace-nowrap flex-shrink-0"
              >
                {sug.label}
              </button>
            ))}
          </div>

          {/* Chat Feed */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-[250px] max-h-[400px]">
            {history.length === 0 ? (
              <div className="text-center py-10 text-muted">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                  <Bot className="w-6 h-6 text-muted-light" />
                </div>
                <p className="font-semibold text-white">How can I help you navigate {franchise?.name || 'CineOrder'}?</p>
                <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
                  Click a suggestion above or ask a custom question about canon titles, release differences, or optional episodes.
                </p>
              </div>
            ) : (
              history.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                  {/* User Question */}
                  <div className="flex justify-end">
                    <div className="bg-primary/20 border border-primary/30 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[80%] text-sm font-medium">
                      {item.question}
                    </div>
                  </div>
                  {/* AI Response */}
                  <div className="flex justify-start items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1 border border-primary/20">
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    <div className="bg-white/5 border border-white/10 text-muted-light rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%] text-sm leading-relaxed">
                      {item.answer}
                      <div className="text-[10px] text-muted mt-2 text-right">
                        {item.timestamp}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-primary font-medium animate-pulse">
                <Sparkles className="w-4 h-4" /> AI Assistant is analyzing the watch order...
              </div>
            )}
          </div>

          {/* Input Bar */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-white/10 bg-black/30 flex gap-2">
            <input
              type="text"
              value={questionInput}
              onChange={(e) => setQuestionInput(e.target.value)}
              placeholder={`Ask about ${franchise?.name || 'this franchise'} watch order...`}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-muted focus:outline-none focus:border-primary/50 transition-colors"
            />
            <Button
              type="submit"
              disabled={!questionInput.trim() || isLoading}
              className="px-5 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Ask</span>
            </Button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
