import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Get Google Generative AI model instance
 * @param {string} modelName - Model name (default: gemini-2.0-flash)
 * @returns {Object} Model instance
 */
export function getGenerativeModel(modelName = "gemini-2.0-flash") {
  return genAI.getGenerativeModel({ model: modelName });
}

/**
 * Generate content using Google Generative AI
 * @param {string} prompt - Prompt text
 * @param {string} modelName - Model name (default: gemini-2.0-flash)
 * @returns {Promise<string>} Generated text
 */
export async function generateContent(prompt, modelName = "gemini-2.0-flash") {
  const model = getGenerativeModel(modelName);
  const result = await model.generateContent(prompt);
  return result.response.text();
}

/**
 * Get Google Generative AI instance (for advanced usage)
 * @returns {Object} GoogleGenerativeAI instance
 */
export function getGenAIInstance() {
  return genAI;
}

export default genAI;

