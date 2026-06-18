export const aiConfig = {
  apiKey: process.env.OPENROUTER_API_KEY,
  model: process.env.OPENROUTER_MODEL || "openrouter/auto", // openrouter/auto or a specific free model
  baseUrl: "https://openrouter.ai/api/v1",
};
