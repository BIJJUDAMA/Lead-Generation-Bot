export const aiConfig = {
  apiKey: process.env.GROQ_API_KEY,
  model: process.env.GROQ_MODEL || "llama-3.1-70b-versatile",
  baseUrl: "https://api.groq.com/openai/v1",
};
