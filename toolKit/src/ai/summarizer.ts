import { AiEnvConfig, getAiEnvConfig } from "../env";

export interface SummaryRequest {
  text: string;
  maxWords?: number;
}

export interface SummaryResult {
  text: string;
  provider: "openai" | "gemini" | "fallback";
}

const FALLBACK_MAX_WORDS = 120;

function fallbackSummarize(request: SummaryRequest): SummaryResult {
  const maxWords = request.maxWords ?? FALLBACK_MAX_WORDS;
  const words = request.text.split(/\s+/).filter(Boolean);
  const clipped = words.slice(0, maxWords).join(" ");
  return { text: clipped, provider: "fallback" };
}

async function summarizeWithOpenAi(request: SummaryRequest, config: AiEnvConfig): Promise<SummaryResult> {
  if (!config.openaiApiKey) {
    return fallbackSummarize(request);
  }
  const baseUrl = config.openaiBaseUrl ?? "https://api.openai.com/v1";
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.openaiApiKey}`
    },
    body: JSON.stringify({
      model: config.openaiModel,
      messages: [
        { role: "system", content: "Summarize the text concisely." },
        { role: "user", content: request.text }
      ]
    })
  });

  if (!response.ok) {
    return fallbackSummarize(request);
  }

  const payload = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = payload.choices?.[0]?.message?.content?.trim();
  if (!content) {
    return fallbackSummarize(request);
  }
  return { text: content, provider: "openai" };
}

async function summarizeWithGemini(request: SummaryRequest, config: AiEnvConfig): Promise<SummaryResult> {
  if (!config.geminiApiKey) {
    return fallbackSummarize(request);
  }
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${config.geminiModel}:generateContent?key=${config.geminiApiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: request.text }] }]
      })
    }
  );

  if (!response.ok) {
    return fallbackSummarize(request);
  }

  const payload = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const content = payload.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!content) {
    return fallbackSummarize(request);
  }
  return { text: content, provider: "gemini" };
}

export async function summarizeText(request: SummaryRequest): Promise<SummaryResult> {
  const config = getAiEnvConfig();
  if (config.provider === "openai") {
    return summarizeWithOpenAi(request, config);
  }
  if (config.provider === "gemini") {
    return summarizeWithGemini(request, config);
  }
  return fallbackSummarize(request);
}
