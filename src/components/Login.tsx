/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { User, Image as ImageIcon, Sparkles } from 'lucide-react';
import { UserProfile } from './types';

interface LoginProps {
  onJoin: (profile: UserProfile) => void;
}

export default function Login({ onJoin }: LoginProps) {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('https://api.dicebear.com/7.x/avataaars/svg?seed=Felix');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onJoin({ name: name.trim(), avatar });
    }
  };

  return (
    <div className="fixed inset-0 bg-[#f8faff] flex items-center justify-center p-6 z-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl shadow-indigo-100 border border-[#eef2ff]"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-[#6366f1] rounded-3xl flex items-center justify-center text-white mb-6 rotate-3 shadow-lg shadow-indigo-200">
            <Sparkles className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold text-[#1e293b]">Lê Thị Kiều Anh</h1>
          <p className="text-[#94a3b8] text-sm mt-2">Học tập thông minh cùng AI Tutor</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-24 h-24 rounded-full border-4 border-[#f0f4ff] overflow-hidden bg-gray-50 flex items-center justify-center">
                <img src={avatar} alt="User Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ImageIcon className="text-white w-6 h-6" />
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange} 
              />
            </div>
            <p className="text-[10px] uppercase tracking-wider text-[#94a3b8] mt-2 font-bold">Chọn ảnh đại diện</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#475569] ml-2">Họ và tên của em</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#cbd5e1] w-5 h-5" />
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                placeholder="Ví dụ: Nguyễn Quyền Anh"
                className="w-full pl-12 pr-4 py-4 bg-[#f8faff] border border-[#eef2ff] rounded-2xl focus:outline-none focus:border-[#6366f1] focus:ring-4 focus:ring-indigo-50/50 transition-all text-[#1e293b]"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={!name.trim()}
            className="w-full py-4 bg-[#6366f1] text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-[#4f46e5] disabled:opacity-50 disabled:shadow-none transition-all"
          >
            Vào phòng học
          </button>
        </form>
      </motion.div>
    </div>
  );
}
