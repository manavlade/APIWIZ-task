import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const genAI = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});

export const GetAIGeneartedTree = async (prompt) => {
  console.log(GEMINI_API_KEY);
  console.log(prompt);

  if (!prompt) {
    return { error: "Prompt is required" };
  }

  const response = await genAI.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Generate a structured JSON tree based on this: ${prompt}`,
    config: {
      systemInstruction:
        "You are an expert in JSON tree visualization. Always return valid JSON only and you are going to generate a JSON tree for the given prompt.",
    },
  });

  console.log(response);

  if (!response) {
    throw new Error("Failed to generate JSON");
  }

  const text = response.candidates?.[0]?.content?.parts?.[0]?.text || "";

  const cleanText = text.replace(/```json|```/g, "").trim();

  let jsonResult;
  try {
    jsonResult = JSON.parse(cleanText);
  } catch (err) {
    console.error("Error parsing JSON:", err);
    throw new Error("Model returned invalid JSON");
  }

  return jsonResult;
};
