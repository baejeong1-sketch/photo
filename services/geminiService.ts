
import { GoogleGenAI } from "@google/genai";
import { ProfessionalStyle } from "../types";

export const transformPhoto = async (
  base64Image: string,
  style: ProfessionalStyle
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  // Extract pure base64 data
  const base64Data = base64Image.split(',')[1];
  
  const stylePrompts = {
    [ProfessionalStyle.MALE_SUIT]: "Transform the person in the photo into a professional studio portrait. Change their outfit to a high-quality dark business suit with a white shirt and tie. Set the background to a clean, professional solid studio gray. Maintain the person's identity and facial structure but enhance the lighting and skin texture for a polished resume look.",
    [ProfessionalStyle.FEMALE_SUIT]: "Transform the person in the photo into a professional studio portrait. Change their outfit to a sophisticated business suit or professional blouse. Set the background to a clean, professional solid studio light blue. Maintain the person's identity and facial structure but enhance the lighting and skin texture for a polished resume look.",
    [ProfessionalStyle.SMART_CASUAL]: "Transform the person in the photo into a modern professional portrait. Change their outfit to smart business casual (e.g., a blazer over a knit or a crisp button-down). Set the background to a bright, modern studio setup. Maintain the person's identity and enhance overall photo quality.",
    [ProfessionalStyle.MINIMAL_WHITE]: "Enhance the person's photo for a professional profile. Replace the existing background with a perfectly clean, minimalist solid white studio background. Improve lighting to remove shadows and enhance facial clarity while keeping the original outfit if it's appropriate, or subtlely refining it.",
    [ProfessionalStyle.MODERN_GRAY]: "Create a high-end corporate headshot. Replace the background with a professional textured gray studio backdrop. Adjust lighting to follow standard professional photography patterns (butterfly or Rembrandt lighting). Ensure the person looks sharp and trustworthy."
  };

  const prompt = stylePrompts[style];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: 'image/png',
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    throw new Error("결과 이미지를 생성하지 못했습니다. 다시 시도해 주세요.");
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
