import { GoogleGenAI, Type } from "@google/genai";
import { Task } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateTaskBreakdown = async (taskTitle: string, courseName: string): Promise<any> => {
  try {
    const prompt = `
      أنا طالب وأحتاج للمساعدة في تقسيم مهمة دراسية إلى خطوات صغيرة قابلة للتنفيذ.
      المهمة: "${taskTitle}"
      المادة: "${courseName}"
      
      قم بإنشاء خطة دراسية مصغرة لهذه المهمة.
      قم بالرد بصيغة JSON فقط.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            motivation: {
              type: Type.STRING,
              description: "رسالة تحفيزية قصيرة للطالب باللهجة الودية",
            },
            steps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "قائمة بخطوات تنفيذ المهمة",
            },
            estimatedTime: {
              type: Type.STRING,
              description: "الوقت المقدر للإنجاز (مثال: 45 دقيقة)",
            },
          },
          required: ["motivation", "steps", "estimatedTime"],
        },
      },
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const getDailyMotivation = async (taskCount: number): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `أعطني نصيحة دراسية قصيرة وملهمة لطالب لديه ${taskCount} مهام اليوم. اجعلها قصيرة جداً (جملة واحدة).`,
        });
        return response.text || "استمر في العمل الجاد، النجاح في انتظارك!";
    } catch (e) {
        return "يوم جديد، فرصة جديدة للتعلم!";
    }
}
