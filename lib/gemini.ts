import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export type AspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9";

export interface ImageGenerationConfig {
  aspectRatio?: AspectRatio;
  style?: string;
}

export interface GenerationResult {
  imageUrl: string;
  text?: string;
}

export async function generateImage(
  prompt: string,
  config: ImageGenerationConfig = {}
): Promise<GenerationResult> {
  const fullPrompt = config.style && config.style !== "none"
    ? `${prompt}. Style: ${config.style}`
    : prompt;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: {
      parts: [{ text: fullPrompt }],
    },
    config: {
      imageConfig: {
        aspectRatio: config.aspectRatio || "1:1",
      },
    },
  });

  const candidate = response.candidates?.[0];
  if (!candidate) throw new Error("No response from AI");

  let imageUrl = "";
  let text = "";

  for (const part of candidate.content.parts) {
    if (part.inlineData) {
      imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    } else if (part.text) {
      text += part.text;
    }
  }

  if (!imageUrl) throw new Error("No image generated");

  return { imageUrl, text };
}

export async function editImage(
  prompt: string,
  base64Image: string,
  mimeType: string,
  config: ImageGenerationConfig = {}
): Promise<GenerationResult> {
  const fullPrompt = config.style && config.style !== "none"
    ? `${prompt}. Style: ${config.style}`
    : prompt;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image.split(",")[1] || base64Image,
            mimeType: mimeType,
          },
        },
        { text: fullPrompt },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: config.aspectRatio || "1:1",
      },
    },
  });

  const candidate = response.candidates?.[0];
  if (!candidate) throw new Error("No response from AI");

  let imageUrl = "";
  let text = "";

  for (const part of candidate.content.parts) {
    if (part.inlineData) {
      imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    } else if (part.text) {
      text += part.text;
    }
  }

  if (!imageUrl) throw new Error("No image generated");

  return { imageUrl, text };
}
