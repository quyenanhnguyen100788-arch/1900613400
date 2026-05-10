/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Paperclip, Send } from 'lucide-react';
import { useState } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="relative flex items-center bg-white dark:bg-gray-900 rounded-[2rem] p-2 pr-4 shadow-lg shadow-indigo-100/50 dark:shadow-none border border-[#f0f4ff] dark:border-gray-800 transition-colors"
    >
      <button 
        type="button"
        className="p-4 text-[#94a3b8] hover:text-[#6366f1] transition-colors"
      >
        <Paperclip className="w-5 h-5" />
      </button>
      
      <input 
        type="text" 
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Nhập câu hỏi hoặc bài toán em cần hỗ trợ..."
        className="flex-1 py-4 px-2 bg-transparent outline-none text-[#475569] dark:text-gray-100 placeholder-[#94a3b8]"
        disabled={disabled}
      />

      <button 
        type="submit"
        disabled={!input.trim() || disabled}
        className="w-12 h-12 rounded-2xl bg-[#6366f1] flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-none disabled:opacity-50 disabled:shadow-none transition-all hover:bg-[#4f46e5]"
      >
        <Send className="w-5 h-5" />
      </button>
    </form>
  );
}
