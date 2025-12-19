
import { GoogleGenAI, Type } from "@google/genai";

// Initialize AI with safety check for API key
const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY is missing. AI features will not work.");
  }
  return new GoogleGenAI({ apiKey: apiKey || "" });
};

export const generateTaskBreakdown = async (taskTitle: string, courseName: string): Promise<any> => {
  try {
    const ai = getAI();
    const prompt = `
      أنا طالب وأحتاج للمساعدة في تقسيم مهمة دراسية إلى خطوات صغيرة قابلة للتنفيذ.
      المهمة: "${taskTitle}"
      المادة: "${courseName}"
      
      قم بإنشاء خطة دراسية مصغرة لهذه المهمة تحتوي على خطوات واضحة ومدة تقديرية.
      قم بالرد بصيغة JSON فقط.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            motivation: {
              type: Type.STRING,
              description: "رسالة تحفيزية قصيرة للطالب",
            },
            steps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "قائمة بخطوات تنفيذ المهمة",
            },
            estimatedTime: {
              type: Type.STRING,
              description: "الوقت المقدر للإنجاز",
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
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `أعطني نصيحة دراسية قصيرة وملهمة جداً لطالب لديه ${taskCount} مهام متبقية اليوم. اجعلها جملة واحدة مشجعة باللغة العربية.`,
        });
        return response.text || "استمر في الإبداع، يومك سيكون مثمراً!";
    } catch (e) {
        return "كل خطوة صغيرة تقربك من حلمك الكبير!";
    }
};
