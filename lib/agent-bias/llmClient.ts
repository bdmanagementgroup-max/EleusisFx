import OpenAI from "openai";

const MODEL_CANDIDATES = [
  "qwen/qwen3-next-80b-a3b-instruct:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "anthropic/claude-sonnet-5",
];

export interface AgentCallResult {
  content: string;
  model: string;
}

export async function callAgentLLM(systemPrompt: string, userPrompt: string): Promise<AgentCallResult> {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY not set");
  }

  const openrouter = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
    maxRetries: 0,
    defaultHeaders: {
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "https://eleusisfx.com",
      "X-Title": "Eleusis FX Agent Bias",
    },
  });

  let lastErr: unknown;
  for (const model of MODEL_CANDIDATES) {
    try {
      const completion = await openrouter.chat.completions.create({
        model,
        max_tokens: 1024,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        ...({ reasoning: { enabled: false } } as object),
      });
      const content = completion.choices[0]?.message?.content ?? "";
      if (content.trim().length > 0) {
        return { content, model };
      }
      console.warn(`[AgentBias] ${model} returned empty content, trying next model`);
    } catch (err) {
      lastErr = err;
      console.warn(`[AgentBias] ${model} failed, trying next model`, err);
    }
  }
  throw lastErr ?? new Error("All models failed or returned empty content");
}
