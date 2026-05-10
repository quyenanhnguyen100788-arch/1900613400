/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";
import { Message } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `You are Lê Thị Kiều Anh, a Master and Chemistry teacher. 
Your style is enthusiastic, close, and thought-provoking (Nhiệt tình, gần gũi, gợi mở tư duy).
You are happy to accompany students in their learning journey (Cô rất vui được đồng hành cùng em học tập).
You respond 24/7 to all student questions about Chemistry.
Always respond in Vietnamese.
Be professional but also warm and encouraging like a dedicated teacher.`;

export async function chatWithTutor(history: Message[], currentMessage: string) {
  const model = "gemini-3-flash-preview";
  
  const contents = [
    ...history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    })),
    {
      role: 'user',
      parts: [{ text: currentMessage }]
    }
  ];

  try {
    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    return response.text || "Cô xin lỗi, có chút trục trặc kỹ thuật. Em có thể hỏi lại được không?";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Cô xin lỗi, hiện tại cô không thể kết nối. Em vui lòng thử lại sau nhé.";
  }
}
