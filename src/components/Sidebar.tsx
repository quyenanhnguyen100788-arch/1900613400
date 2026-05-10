/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LogOut, GraduationCap, Sparkles, Clock, Camera } from 'lucide-react';
import { motion } from 'motion/react';
import { useRef } from 'react';
import { UserProfile } from '../types';

interface SidebarProps {
  user: UserProfile;
  onLogout: () => void;
  onUpdateAvatar: (avatar: string) => void;
}

export default function Sidebar({ user, onLogout, onUpdateAvatar }: SidebarProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-80 h-full bg-white/50 dark:bg-black/20 backdrop-blur-sm flex flex-col p-6 rounded-r-[3rem] border-r border-[#eef2ff] dark:border-gray-800 transition-colors">
      <div className="flex-1">
        {/* Profile Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-6 shadow-sm border border-[#eef2ff] dark:border-gray-800 flex flex-col items-center mb-8 transition-colors"
        >
          <div className="relative w-32 h-32 mb-4 group">
            <div className="w-full h-full rounded-full border-4 border-[#f0f4ff] dark:border-gray-800 overflow-hidden bg-gray-100 flex items-center justify-center">
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Teacher&backgroundColor=b6e3f4" 
                alt="Lê Thị Kiều Anh"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute bottom-1 right-3 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
          </div>
          
          <h2 className="text-xl font-bold text-inherit mb-1">Lê Thị Kiều Anh</h2>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider">ĐANG ONLINE</span>
          </div>

          <p className="text-xs text-[#6366f1] font-medium text-center mb-6 px-4">
            Thạc sĩ / Giáo viên bộ môn Hoá Học
          </p>

          <div className="w-full space-y-4">
            <div className="flex items-start gap-3">
              <GraduationCap className="w-5 h-5 text-[#6366f1] shrink-0" />
              <span className="text-sm text-[#475569] dark:text-[#94a3b8]">Giáo viên môn Hoá Học</span>
            </div>
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-[#6366f1] shrink-0" />
              <span className="text-sm text-[#475569] dark:text-[#94a3b8]">Phong cách: Nhiệt tình, gần gũi, gợi mở tư duy.</span>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-[#6366f1] shrink-0" />
              <span className="text-sm text-[#475569] dark:text-[#94a3b8]">Hỗ trợ 24/7 giải đáp mọi thắc mắc.</span>
            </div>
          </div>
        </motion.div>

        {/* User Card */}
        <div className="bg-white/30 dark:bg-black/10 rounded-3xl p-4 border border-[#eef2ff]/50 dark:border-gray-800/50 flex items-center gap-3">
          <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
            <div className="w-12 h-12 rounded-full border-2 border-white dark:border-gray-800 overflow-hidden shrink-0">
              <img src={user.avatar} alt="User Avatar" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                <Camera className="w-4 h-4 text-white" />
              </div>
            </div>
            <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-inherit truncate">{user.name}</p>
            <p className="text-[10px] text-[#94a3b8] uppercase tracking-tighter">Học viên</p>
          </div>
        </div>
      </div>

      <button 
        onClick={onLogout}
        className="flex items-center justify-center gap-2 py-3 px-6 text-[#94a3b8] hover:text-red-500 transition-colors font-medium"
      >
        <LogOut className="w-5 h-5" />
        <span>Đăng xuất</span>
      </button>
    </div>
  );
}
