/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Settings, Moon, Sun, Trash2, Share2 } from 'lucide-react';
import { Theme, UserProfile } from '../types';

interface HeaderProps {
  user: UserProfile;
  theme: Theme;
  onThemeToggle: () => void;
  onClearChat: () => void;
  onShare: () => void;
}

export default function Header({ user, theme, onThemeToggle, onClearChat, onShare }: HeaderProps) {
  return (
    <div className="h-20 flex items-center justify-between px-8 bg-transparent">
      <div className="flex items-center gap-3">
        {user.avatar ? (
          <img src={user.avatar} className="w-10 h-10 rounded-xl object-cover" alt="User Avatar" />
        ) : (
          <div className="w-10 h-10 rounded-xl bg-[#6366f1] flex items-center justify-center text-white font-bold">
            {user.name.substring(0, 2).toUpperCase()}
          </div>
        )}
        <span className="font-semibold text-inherit">{user.name}</span>
      </div>

      <div className="flex items-center gap-4 text-[#94a3b8]">
        <button className="p-2 hover:bg-white/80 dark:hover:bg-gray-800 rounded-lg transition-colors">
          <Settings className="w-5 h-5" />
        </button>
        <button 
          onClick={onThemeToggle}
          className="p-2 hover:bg-white/80 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
        <button 
          onClick={onClearChat}
          className="p-2 hover:bg-white/80 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <Trash2 className="w-5 h-5" />
        </button>
        <button 
          onClick={onShare}
          className="p-2 hover:bg-white/80 dark:hover:bg-gray-800 rounded-lg transition-colors border border-[#eef2ff] dark:border-gray-800"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
