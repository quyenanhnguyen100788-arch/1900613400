/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { useEffect, useRef } from 'react';
import { Message } from '../types';

interface MessageListProps {
  messages: Message[];
}

export default function MessageList({ messages }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-8 py-4 space-y-8 scrollbar-hide scroll-smooth"
    >
      {messages.map((msg) => (
        <motion.div
          key={msg.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
        >
          <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center font-bold text-white shadow-sm transition-all ${
            msg.role === 'model' 
              ? 'bg-white dark:bg-gray-800 text-[#1e293b] dark:text-white border border-[#eee] dark:border-gray-700' 
              : 'bg-[#6366f1] shadow-indigo-100 dark:shadow-none'
          }`}>
            {msg.role === 'model' ? 'KA' : 'QA'}
          </div>
          
          <div className={`max-w-[80%] rounded-[2rem] px-8 py-5 text-sm leading-relaxed transition-all ${
            msg.role === 'model' 
              ? 'bg-white dark:bg-gray-900 text-[#475569] dark:text-[#94a3b8] border border-[#f0f4ff] dark:border-gray-800 rounded-tl-none shadow-sm' 
              : 'bg-[#6366f1] text-white rounded-tr-none shadow-lg shadow-indigo-100 dark:shadow-none'
          }`}>
            {msg.text}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
