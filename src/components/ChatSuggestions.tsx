/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Lightbulb, BookOpen, CheckCircle } from 'lucide-react';

interface ChatSuggestionsProps {
  onSelect: (suggestion: string) => void;
  disabled?: boolean;
}

export default function ChatSuggestions({ onSelect, disabled }: ChatSuggestionsProps) {
  const suggestions = [
    { text: 'Gợi ý nhẹ', icon: <Lightbulb className="w-4 h-4" /> },
    { text: 'Hướng dẫn chi tiết', icon: <BookOpen className="w-4 h-4" /> },
    { text: 'Giải chi tiết', icon: <CheckCircle className="w-4 h-4" /> },
  ];

  return (
    <div className="flex gap-3 justify-center mb-6 flex-wrap">
      {suggestions.map((s, i) => (
        <button
          key={i}
          onClick={() => onSelect(s.text)}
          disabled={disabled}
          className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all ${
            s.text === 'Giải chi tiết' 
              ? 'bg-[#6366f1] text-white shadow-lg shadow-indigo-100 dark:shadow-none hover:bg-[#4f46e5]' 
              : 'bg-white dark:bg-gray-900 text-[#475569] dark:text-[#94a3b8] border border-[#f0f4ff] dark:border-gray-800 hover:bg-[#f8faff] dark:hover:bg-gray-800'
          } disabled:opacity-50`}
        >
          {s.icon}
          {s.text}
        </button>
      ))}
    </div>
  );
}
