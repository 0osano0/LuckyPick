import { GoogleGenAI } from "@google/genai";

export const generateCongratulatoryMessage = async (name: string): Promise<string> => {
  if (!process.env.API_KEY) {
    console.warn("API Key not found, skipping AI generation.");
    return "恭喜中奖!";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `为刚刚赢得幸运抽奖的"${name}"写一句非常简短（最多15个字）、有趣且热情的祝贺语。使用emoji。`,
      config: {
        temperature: 1,
        thinkingConfig: { thinkingBudget: 0 },
      }
    });

    return response.text || "中奖啦! 🎉";
  } catch (error) {
    console.error("Error generating AI message:", error);
    return "恭喜中奖! 🎉";
  }
};