/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, FormEvent, ChangeEvent } from "react";
import { 
  Send, 
  Paperclip, 
  BookOpen, 
  Lightbulb, 
  CheckCircle2, 
  GraduationCap, 
  User, 
  Search, 
  Share2, 
  Settings, 
  Moon, 
  Trash2, 
  Download,
  MoreVertical,
  ChevronRight,
  LogOut,
  Sparkles,
  Camera,
  ExternalLink,
  Key,
  Database
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import { saveAs } from "file-saver";
import { TEACHER_PROFILE, ROOMS, SYSTEM_INSTRUCTION } from "./constants";

interface Message {
  role: "user" | "model";
  content: string;
  type?: "hint" | "detailed" | "solution";
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function App() {
  const [studentName, setStudentName] = useState("Nguyễn Quyền Anh");
  const [room, setRoom] = useState("Phòng 1");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [teacherAvatar, setTeacherAvatar] = useState(TEACHER_PROFILE.avatar);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  
  // AI Settings
  const [selectedModel, setSelectedModel] = useState("gemini-3-flash-preview");
  const [customApiKey, setCustomApiKey] = useState("");
  const [sheetsUrl, setSheetsUrl] = useState("");
  
  const formatName = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const isOnline = !!customApiKey || !!process.env.GEMINI_API_KEY;
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load profile from localStorage
  useEffect(() => {
    const savedName = localStorage.getItem("studentName");
    const savedRoom = localStorage.getItem("room");
    const savedAvatar = localStorage.getItem("teacherAvatar");
    const savedTheme = localStorage.getItem("theme");
    const savedMessages = localStorage.getItem("chatHistory");
    const savedModel = localStorage.getItem("selectedModel");
    const savedApiKey = localStorage.getItem("customApiKey");
    const savedSheetsUrl = localStorage.getItem("sheetsUrl");
    
    if (savedName && savedRoom) {
      setStudentName(savedName);
      setRoom(savedRoom);
      setIsLoggedIn(true);
    }
    if (savedAvatar) {
      setTeacherAvatar(savedAvatar);
    }
    if (savedTheme === "dark") {
      setIsDarkMode(true);
    }
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      setMessages([
        {
          role: "model",
          content: `Chào ${savedName || "Nguyễn Quyền Anh"}! Cô là Lê Thị Kiều Anh: Thạc sĩ / Giáo viên bộ môn Hoá Học. Cô rất vui được đồng hành cùng em học tập. Hôm nay em cần cô hỗ trợ gì không?`
        }
      ]);
    }
    if (savedModel) {
      setSelectedModel(savedModel);
    }
    if (savedApiKey) {
      setCustomApiKey(savedApiKey);
    }
    if (savedSheetsUrl) {
      setSheetsUrl(savedSheetsUrl);
    }
  }, []);

  // Save chat history to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("chatHistory", JSON.stringify(messages));
    }
  }, [messages]);

  // Handle Theme Toggle
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const handleClearChat = () => {
    const initialMsg: Message = {
      role: "model",
      content: `Chào ${studentName}! Cô là Lê Thị Kiều Anh: Thạc sĩ / Giáo viên bộ môn Hoá Học. Cô rất vui được đồng hành cùng em học tập. Hôm nay em cần cô hỗ trợ gì không?`
    };
    setMessages([initialMsg]);
    localStorage.removeItem("chatHistory");
  };

  const handleShareResults = async () => {
    if (messages.length === 0 || isSharing) return;
    setIsSharing(true);

    try {
      // Generate Word Document
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({ 
                  text: `BÁO CÁO KẾT QUẢ HỌC TẬP`, 
                  bold: true, 
                  size: 32, 
                  font: "Times New Roman" 
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `Học sinh: `, bold: true, font: "Times New Roman" }),
                new TextRun({ text: studentName, font: "Times New Roman" }),
              ],
              spacing: { before: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `Giáo viên hướng dẫn: `, bold: true, font: "Times New Roman" }),
                new TextRun({ text: TEACHER_PROFILE.name, font: "Times New Roman" }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `Môn học: `, bold: true, font: "Times New Roman" }),
                new TextRun({ text: TEACHER_PROFILE.subject, font: "Times New Roman" }),
              ],
            }),
            new Paragraph({
              text: "",
              spacing: { before: 400 },
            }),
            ...messages.flatMap(msg => {
              const lines = msg.content.split('\n');
              const roleName = msg.role === 'user' ? `${studentName}: ` : `${TEACHER_PROFILE.name}: `;
              
              return [
                new Paragraph({
                  children: [
                    new TextRun({ 
                      text: roleName, 
                      bold: true,
                      font: "Times New Roman",
                      color: msg.role === 'user' ? "4f46e5" : "1e293b"
                    }),
                  ],
                  spacing: { before: 200, after: 100 },
                }),
                ...lines.map(line => 
                  new Paragraph({
                    children: [
                      new TextRun({ 
                        text: line.replace(/[#*`]/g, ''), 
                        font: "Times New Roman",
                        size: 24 
                      }),
                    ],
                    spacing: { after: 50 },
                  })
                )
              ];
            }),
            new Paragraph({
              text: "",
              spacing: { before: 800 },
            }),
            new Paragraph({
              children: [
                new TextRun({ 
                  text: "--- Chúc em học tập tốt! ---", 
                  italics: true, 
                  font: "Times New Roman",
                  color: "64748b"
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),
          ],
        }],
      });

      const blob = await Packer.toBlob(doc);
      const fileName = `Trợ lý ảo.docx`;
      const file = new File([blob], fileName, { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });

      if (navigator.share) {
        try {
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: `Kết quả học tập - ${studentName}`,
              text: `Gửi em kết quả buổi học hôm nay.`
            });
          } else {
            const chatContent = messages
              .map(msg => `${msg.role === 'user' ? studentName : TEACHER_PROFILE.name}: ${msg.content}`)
              .join('\n\n---\n\n');
            await navigator.share({
              title: `Kết quả học tập - ${studentName}`,
              text: `Kết quả học tập của ${studentName}:\n\n${chatContent}`
            });
          }
        } catch (shareError) {
          if (shareError instanceof Error && shareError.name !== 'AbortError') {
            console.warn("Share failed, falling back to download:", shareError);
            saveAs(blob, fileName);
          }
        }
      } else {
        saveAs(blob, fileName);
      }
    } catch (error) {
      console.error("Error in share functionality:", error);
      alert("Có lỗi xảy ra khi chuẩn bị tài liệu. Đang tải xuống file thay thế.");
      // Fallback: try to generate text-only download if Word fails?
      // For now just console error as Word gen usually fails only for major issues.
    } finally {
      setIsSharing(false);
    }
  };

  const handleUpdateSettings = (e: FormEvent) => {
    e.preventDefault();
    localStorage.setItem("studentName", studentName);
    localStorage.setItem("room", room);
    localStorage.setItem("selectedModel", selectedModel);
    localStorage.setItem("customApiKey", customApiKey);
    localStorage.setItem("sheetsUrl", sheetsUrl);
    setIsSettingsOpen(false);
    
    // Refresh greeting if chat is empty or just updated
    if (messages.length <= 1) {
      setMessages([
        {
          role: "model",
          content: `Chào ${studentName}! Cô là Lê Thị Kiều Anh: Thạc sĩ / Giáo viên bộ môn Hoá Học. Cô rất vui được đồng hành cùng em học tập. Hôm nay em cần cô hỗ trợ gì không?`
        }
      ]);
    }
  };

  const handleDeleteApiKey = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa API Key đã lưu?")) {
      setCustomApiKey("");
      localStorage.removeItem("customApiKey");
    }
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setTeacherAvatar(base64String);
        localStorage.setItem("teacherAvatar", base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (studentName.trim()) {
      const finalRoom = room || "Phòng học";
      localStorage.setItem("studentName", studentName);
      localStorage.setItem("room", finalRoom);
      setRoom(finalRoom);
      setIsLoggedIn(true);
      // Initial greeting
      setMessages([
        {
          role: "model",
          content: `Chào ${studentName}! Cô là ${TEACHER_PROFILE.name}: ${TEACHER_PROFILE.school}. Cô rất vui được đồng hành cùng em học tập. Hôm nay em cần cô hỗ trợ gì không?`
        }
      ]);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setMessages([]);
    setStudentName("");
    setRoom("");
  };

  const sendMessage = async (overrideInput?: string, type?: "hint" | "detailed" | "solution") => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim() && !type) return;

    // Display message without the requirement suffix
    const userMsg: Message = { role: "user", content: textToSend };
    setMessages(prev => [...prev, userMsg]);
    
    // Add requirement suffix only for the AI prompt
    const aiPrompt = textToSend + (type ? ` (Yêu cầu: ${type === "hint" ? "Gợi ý nhẹ" : type === "detailed" ? "Hướng dẫn chi tiết" : "Giải chi tiết"})` : "");
    
    setInput("");
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));

      // Use custom API key if provided, otherwise fallback to system key
      const currentGenAI = customApiKey 
        ? new GoogleGenAI({ apiKey: customApiKey })
        : ai;

      const model = selectedModel;
      const response = await currentGenAI.models.generateContent({
        model,
        contents: [...history, { role: "user", parts: [{ text: aiPrompt }] }],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION(studentName, room),
        }
      });

      const result = response.text || (response.candidates?.[0]?.content?.parts?.[0]?.text as string) || "";
      setMessages(prev => [...prev, { role: "model", content: result || "Xin lỗi, cô đang gặp chút trục trặc. Em thử lại nhé!" }]);
    } catch (error) {
      console.error("Error calling Gemini:", error);
      let errorMessage = "Đã có lỗi xảy ra khi kết nối với AI. ";
      
      if (error instanceof Error) {
        const msg = error.message.toLowerCase();
        if (msg.includes("404") || msg.includes("not found")) {
          errorMessage += "Model AI này hiện không khả dụng. Vui lòng chọn model khác (như Gemini 1.5 Flash) trong phần Cài đặt.";
        } else if (msg.includes("403") || msg.includes("api_key_invalid") || msg.includes("invalid api key")) {
          errorMessage += "API Key không chính xác hoặc đã hết hạn. Vui lòng kiểm tra lại trong phần Cài đặt.";
        } else {
          errorMessage += error.message;
        }
      }
      
      setMessages(prev => [...prev, { role: "model", content: `⚠️ **Lỗi hệ thống:** ${errorMessage}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#eef2ff] flex items-center justify-center p-4 font-sans text-slate-800 relative overflow-hidden">
        {/* Decorative Background Blobs */}
        <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-blue-300 rounded-full blur-[100px] opacity-40"></div>
        <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-purple-300 rounded-full blur-[100px] opacity-40"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-100 rounded-full blur-[120px] opacity-30"></div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="z-10 w-full max-w-2xl bg-white/40 backdrop-blur-2xl border border-white/60 rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] p-8 md:p-12 flex flex-col gap-8"
        >
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                <GraduationCap className="w-7 h-7" />
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">EduAssist AI</h1>
            </div>
            <p className="text-slate-600 font-medium text-lg">Chào mừng bạn đến với phòng học thông minh</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-500 uppercase tracking-widest px-1 block text-center">Họ và Tên Học Sinh</label>
              <input 
                type="text" 
                value={studentName}
                onChange={(e) => setStudentName(formatName(e.target.value))}
                placeholder="Nhập tên của em..."
                className="w-full bg-white/60 border border-white shadow-sm rounded-2xl px-6 py-4 text-slate-800 placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-xl font-bold text-center"
                required
                autoFocus
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold text-xl shadow-xl hover:bg-black transition-colors flex items-center justify-center gap-3"
            >
              Vào Lớp Học <ChevronRight className="w-6 h-6" />
            </button>
          </form>

          <div className="flex justify-between items-center px-2 pt-4 border-t border-slate-200/50">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-tight">Hệ thống sẵn sàng</span>
            </div>
            <span className="text-xs text-slate-400 font-medium italic">Phiên bản giáo dục 2.4.0</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`h-screen flex flex-col md:flex-row overflow-hidden font-sans transition-colors duration-300 ${isDarkMode ? 'bg-[#1A202C] text-white' : 'bg-[#eef2ff] text-slate-800'} relative`}>
      {/* Decorative Background Blobs for Chat Screen */}
      <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-blue-300 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-[-100px] right-20 w-[400px] h-[400px] bg-purple-300 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>

      {/* Sidebar - Assistant Info */}
      <aside className={`w-full md:w-80 border-r flex flex-col p-6 hidden md:flex z-10 transition-colors ${isDarkMode ? 'bg-gray-900/40 border-gray-700' : 'bg-white/40 border-white/60'} backdrop-blur-xl`}>
        <div className={`rounded-[32px] border p-6 shadow-sm mb-6 flex flex-col items-center transition-colors ${isDarkMode ? 'bg-gray-800/60 border-gray-700' : 'bg-white/60 border-white'} backdrop-blur-md`}>
          <div className="relative mb-4 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <img 
              src={teacherAvatar} 
              alt={TEACHER_PROFILE.name}
              className={`w-32 h-32 rounded-full border-4 shadow-lg object-cover transition-colors ${isDarkMode ? 'border-gray-700' : 'border-white'}`}
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="text-white w-8 h-8" />
            </div>
            <div className={`absolute bottom-2 right-2 w-4 h-4 border-2 rounded-full transition-colors duration-300 ${isOnline ? 'bg-green-500 border-white' : 'bg-gray-400 border-white'}`}></div>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              className="hidden"
            />
          </div>
          <h2 className="text-xl font-bold text-center">{TEACHER_PROFILE.name}</h2>
          <div className="flex items-center gap-1.5 mb-4">
            <div className={`w-2 h-2 rounded-full animate-pulse ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isOnline ? 'text-green-500' : 'text-gray-400'}`}>
              {isOnline ? 'Đang Online' : 'Đang Offline'}
            </span>
          </div>
          <p className="text-indigo-400 font-semibold text-sm mb-4">{TEACHER_PROFILE.school}</p>
          
          <div className="w-full space-y-4">
            <div className="flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-indigo-500 mt-0.5" />
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>Giáo viên môn {TEACHER_PROFILE.subject}</p>
            </div>
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-indigo-500 mt-0.5" />
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>Phong cách: {TEACHER_PROFILE.style}</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-indigo-500 mt-0.5" />
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>{TEACHER_PROFILE.support}</p>
            </div>
          </div>
        </div>

        <div className="mt-auto">
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 text-slate-400 hover:text-red-500 transition-colors text-sm font-medium w-full p-2"
          >
            <LogOut className="w-4 h-4" /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-transparent z-10">
        {/* Header */}
        <header className={`h-16 border-b px-6 flex items-center justify-between shrink-0 transition-colors ${isDarkMode ? 'bg-gray-900/40 border-gray-700' : 'bg-white/40 border-white/60'} backdrop-blur-md`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm">
                {studentName.split(' ').filter(n => n.length > 0).map(n => n[0]).join('').toUpperCase().slice(-2)}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-sm">{studentName}</h3>
            </div>
          </div>
          
          <div className="flex items-center gap-1 md:gap-3 text-slate-500">
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Cài đặt"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-yellow-400 hover:bg-white/10' : 'text-indigo-600 hover:bg-white/50'}`}
              title={isDarkMode ? "Chế độ sáng" : "Chế độ tối"}
            >
              <Moon className="w-5 h-5" />
            </button>
            <button 
              onClick={handleClearChat}
              className={`p-2 rounded-lg transition-colors hover:text-red-500 ${isDarkMode ? 'hover:bg-red-500/10' : 'hover:bg-red-50'}`}
              title="Xóa cuộc trò chuyện"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button 
              onClick={handleShareResults}
              disabled={isSharing}
              className={`p-2 rounded-lg transition-colors hover:text-emerald-500 ${isDarkMode ? 'hover:bg-emerald-500/10' : 'hover:bg-emerald-50'} ${isSharing ? 'animate-pulse opacity-50' : ''}`}
              title="Gửi kết quả (Zalo, Gmail...)"
            >
              {isSharing ? (
                <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Share2 className="w-5 h-5" />
              )}
            </button>
          </div>
        </header>

        {/* Chat Messages */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth"
        >
          {messages.map((msg, idx) => (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              key={idx} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[85%] md:max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-[10px] font-bold shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white' : isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-white'}`}>
                  {msg.role === 'user' 
                    ? studentName.split(' ').filter(n => n.length > 0).map(n => n[0]).join('').toUpperCase().slice(-2) 
                    : TEACHER_PROFILE.name.split(' ').map(n => n[0]).join('').slice(-2)}
                </div>
                <div className={`p-4 rounded-[24px] shadow-sm transform transition-all ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : `${isDarkMode ? 'bg-gray-800/80' : 'bg-white/70'} backdrop-blur-md text-inherit rounded-tl-none border ${isDarkMode ? 'border-gray-700' : 'border-white'}`
                }`}>
                  <div className={`markdown-content text-sm leading-relaxed overflow-x-auto ${isDarkMode ? 'prose-invert' : ''}`}>
                    <ReactMarkdown 
                      remarkPlugins={[remarkMath]} 
                      rehypePlugins={[rehypeKatex]}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-3">
                <div className={`w-8 h-8 rounded-lg shrink-0 border flex items-center justify-center animate-pulse ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-white'}`}>
                  <span className="text-[10px] text-slate-400 font-bold">
                    {TEACHER_PROFILE.name.split(' ').map(n => n[0]).join('').slice(-2)}
                  </span>
                </div>
                <div className={`p-4 rounded-[24px] border flex gap-1 ${isDarkMode ? 'bg-gray-800/60 border-gray-700' : 'bg-white/60 border-white'}`}>
                  <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons & Input */}
        <div className="px-4 md:px-8 pb-4 md:pb-6 pt-2 space-y-4 shrink-0 z-20">
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 justify-center">
            <button 
              onClick={() => sendMessage("Hướng dẫn gợi ý cho em bài toán này nhé!", "hint")}
              className={`px-4 py-2 border rounded-full text-[12px] font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-sm ${
                isDarkMode ? 'bg-gray-800/60 border-gray-700 text-gray-300 hover:bg-gray-800' : 'bg-white/60 border-white text-slate-700 hover:bg-white'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 text-indigo-500" /> Gợi ý nhẹ
            </button>
            <button 
              onClick={() => sendMessage("Hướng dẫn chi tiết cách giải giúp em nhé!", "detailed")}
              className={`px-4 py-2 border rounded-full text-[12px] font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-sm ${
                isDarkMode ? 'bg-gray-800/60 border-gray-700 text-gray-300 hover:bg-gray-800' : 'bg-white/60 border-white text-slate-700 hover:bg-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-500" /> Hướng dẫn chi tiết
            </button>
            <button 
              onClick={() => sendMessage("Giải chi tiết bài toán này cho em với ạ!", "solution")}
              className="px-4 py-2 bg-indigo-600 border border-indigo-400 rounded-full text-[12px] font-bold text-white flex items-center gap-2 hover:bg-indigo-700 hover:scale-105 transition-all shadow-lg shadow-indigo-100"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Giải chi tiết
            </button>
          </div>

          {/* Input Box */}
          <div className={`rounded-[28px] p-2 flex items-center shadow-lg border max-w-4xl mx-auto w-full group focus-within:ring-4 transition-all ${
            isDarkMode ? 'bg-gray-800/80 border-gray-700 focus-within:ring-indigo-900/30' : 'bg-white/80 border-white focus-within:ring-indigo-100'
          } backdrop-blur-2xl`}>
            <button className="p-2.5 text-slate-400 hover:text-indigo-600 transition-colors"><Paperclip className="w-5 h-5" /></button>
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Nhập câu hỏi hoặc bài toán em cần hỗ trợ..."
              className={`flex-1 bg-transparent border-none outline-none resize-none py-2.5 px-3 text-sm max-h-32 placeholder:font-medium ${isDarkMode ? 'text-white placeholder:text-gray-500' : 'text-slate-700 placeholder:text-slate-400'}`}
              rows={1}
            />
            <button 
              onClick={() => sendMessage()}
              disabled={isLoading || !input.trim()}
              className="w-11 h-11 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center transition-all disabled:opacity-50 shadow-lg"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center justify-center gap-4 text-xs font-bold italic text-blue-500 uppercase tracking-widest pb-1">
            <span>© 2026 Editor By Lê Thị Kiều Anh - Học tập thông minh</span>
          </div>
        </div>
      </main>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative z-10 w-full max-w-xl overflow-hidden rounded-[32px] border shadow-2xl transition-colors ${
                isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-white text-slate-800'
              }`}
            >
              {/* Header */}
              <div className={`flex items-center justify-between px-6 py-4 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Settings className="w-5 h-5 text-emerald-500" />
                  </div>
                  <h2 className="text-lg font-bold">Cài đặt AI & API Key</h2>
                </div>
                <button 
                  onClick={() => setIsSettingsOpen(false)} 
                  className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-800 text-gray-500' : 'hover:bg-gray-100 text-slate-400'}`}
                >
                  <MoreVertical className="w-5 h-5 rotate-90" />
                </button>
              </div>

              <div className="overflow-y-auto max-h-[70vh] p-5 space-y-4 text-left">
                {/* Section 1: Model Selection */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider">1. Trí tuệ nhân tạo</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-600`}>Recommended</span>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-1.5">
                    {[
                      { id: "gemini-3-flash-preview", name: "Gemini 3.0 Flash Preview", badge: "Mặc định" },
                      { id: "gemini-1.5-pro", name: "Gemini 3.0 Pro Preview" },
                      { id: "gemini-1.5-flash", name: "Gemini 2.5 Flash" }
                    ].map((model) => (
                      <div 
                        key={model.id}
                        onClick={() => setSelectedModel(model.id)}
                        className={`p-2.5 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                          selectedModel === model.id 
                            ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/10' 
                            : isDarkMode ? 'border-gray-800 bg-gray-800/30 hover:border-gray-700' : 'border-gray-100 bg-white hover:border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-all ${
                            selectedModel === model.id ? 'border-emerald-500' : 'border-gray-300 dark:border-gray-600'
                          }`}>
                            {selectedModel === model.id && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />}
                          </div>
                          <span className={`font-bold text-[11px] ${selectedModel === model.id ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
                            {model.name}
                          </span>
                        </div>
                        {model.badge && (
                          <span className="text-[8px] px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 font-bold uppercase tracking-wider">
                            {model.badge}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 2: API Key */}
                <div className="space-y-2.5 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider">2. Gemini API Key</span>
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-[9px] text-blue-500 flex items-center gap-1 hover:underline font-bold uppercase">
                      Lấy Key <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>

                  <div className={`p-2.5 rounded-xl flex gap-2.5 border ${isDarkMode ? 'bg-orange-900/10 border-orange-500/20' : 'bg-orange-50 border-orange-100'}`}>
                    <Lightbulb className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />
                    <p className={`text-[9px] leading-relaxed font-medium ${isDarkMode ? 'text-orange-200' : 'text-orange-700'}`}>
                      Nếu chưa có key, lấy tại <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="font-bold underline text-orange-600">Google AI Studio</a>.
                    </p>
                  </div>

                  <div className="relative">
                    <Key className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`} />
                    <input 
                      type="password"
                      value={customApiKey}
                      onChange={(e) => setCustomApiKey(e.target.value)}
                      placeholder="Nhập API Key của bạn..."
                      className={`w-full py-2 pl-9 pr-4 border rounded-xl outline-none text-[11px] font-mono transition-all ${
                        isDarkMode ? 'bg-gray-800 border-gray-700 focus:border-emerald-500 focus:bg-gray-800' : 'bg-gray-50 border-gray-200 focus:border-emerald-500 focus:bg-white'
                      }`}
                    />
                  </div>
                </div>

                {/* Section 3: Google Sheets */}
                <div className="space-y-2.5 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider block">3. Lưu trữ dữ liệu (Tùy chọn)</span>
                  <div className="relative">
                    <Database className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`} />
                    <input 
                      type="text" 
                      value={sheetsUrl}
                      onChange={(e) => setSheetsUrl(e.target.value)}
                      placeholder="Google Sheets Web App URL..."
                      className={`w-full py-2 pl-9 pr-4 border rounded-xl outline-none text-[11px] transition-all ${
                        isDarkMode ? 'bg-gray-800 border-gray-700 focus:border-emerald-500 focus:bg-gray-800' : 'bg-gray-50 border-gray-200 focus:border-emerald-500 focus:bg-white'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button 
                    type="button"
                    onClick={handleDeleteApiKey}
                    className="text-[9px] text-red-500 font-bold hover:text-red-600 transition-colors uppercase tracking-wider"
                  >
                    Xóa key đã lưu
                  </button>
                  <p className="text-[8px] text-gray-500 italic">Bảo mật thông tin cá nhân của bạn.</p>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className={`px-6 py-4 border-t flex items-center justify-end gap-3 ${isDarkMode ? 'bg-black/20 border-gray-800' : 'bg-gray-50 border-gray-100'}`}>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                    isDarkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-200 text-slate-500'
                  }`}
                >
                  Đóng
                </button>
                <button 
                  onClick={handleUpdateSettings}
                  className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
                >
                  Lưu cài đặt
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );

}
