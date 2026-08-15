import { useState, useCallback } from 'react';
import type { Content, Franchise } from '@/types';
import { processAIQuery } from '@/lib/aiAdvisorEngine';

export interface AIQuestionSuggestion {
  id: string;
  label: string;
  question: string;
}

export interface AIAnswer {
  question: string;
  answer: string;
  timestamp: string;
}

const DEFAULT_SUGGESTIONS: AIQuestionSuggestion[] = [
  {
    id: 'sug-1',
    label: 'Why this order?',
    question: 'What is the difference between Release Order and Chronological Order?',
  },
  {
    id: 'sug-2',
    label: 'Optional titles',
    question: 'Can I safely skip non-required titles without missing major plot points?',
  },
  {
    id: 'sug-3',
    label: 'Where to start?',
    question: 'Where should I start with this franchise?',
  },
  {
    id: 'sug-4',
    label: 'Time budget',
    question: 'I only have 8 hours.',
  },
];

export function useAIAssistant(franchise?: Franchise, currentContent?: Content) {
  const [history, setHistory] = useState<AIAnswer[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const askQuestion = useCallback(
    async (questionText: string): Promise<AIAnswer> => {
      setIsLoading(true);

      // Simulate natural typing UX
      await new Promise((resolve) => setTimeout(resolve, 400));

      // Append context if provided and not already in prompt
      let fullQuery = questionText;
      if (currentContent && !questionText.toLowerCase().includes(currentContent.title.toLowerCase())) {
        fullQuery = `${questionText} for ${currentContent.title}`;
      } else if (franchise && !questionText.toLowerCase().includes(franchise.name.toLowerCase())) {
        fullQuery = `${questionText} for ${franchise.name}`;
      }

      // Call the unified KG-backed AI Advisor engine
      const responseMsg = processAIQuery(fullQuery, []);

      const newEntry: AIAnswer = {
        question: questionText,
        answer: responseMsg.text,
        timestamp: responseMsg.timestamp,
      };

      setHistory((prev) => [newEntry, ...prev]);
      setIsLoading(false);
      return newEntry;
    },
    [franchise, currentContent]
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return {
    history,
    isLoading,
    askQuestion,
    clearHistory,
    suggestions: DEFAULT_SUGGESTIONS,
  };
}
