import OpenAI from "openai";

export function getTogetherClient() {
  const apiKey = process.env.TOGETHER_API_KEY;

  if (!apiKey) {
    throw new Error("Missing TOGETHER_API_KEY");
  }

  return new OpenAI({
    apiKey,
    baseURL: "https://api.together.xyz/v1"
  });
}

export function getTogetherModel() {
  return process.env.TOGETHER_MODEL || "meta-llama/Llama-3.3-70B-Instruct-Turbo";
}
