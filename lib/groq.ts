import AVAILABLE_MODELS, { type GroqModel } from "@/data/models";

type GroqMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type GroqResponse = {
  choices?: Array<{ message?: { content?: string | null } }>;
  error?: { message?: string };
};

export function resolveGroqModel(model: unknown): GroqModel | null {
  const selectedModel = model || AVAILABLE_MODELS[0].id;
  return typeof selectedModel === "string" &&
    AVAILABLE_MODELS.some((available) => available.id === selectedModel)
    ? (selectedModel as GroqModel)
    : null;
}

export async function createGroqReply(
  messages: GroqMessage[],
  model: GroqModel,
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      ...(model.startsWith("openai/")
        ? { include_reasoning: false }
        : { reasoning_format: "hidden" }),
    }),
  });

  const data = (await response.json().catch(() => null)) as GroqResponse | null;
  if (!response.ok) {
    throw new Error(data?.error?.message || `Groq API request failed (${response.status})`);
  }

  const replyContent = data?.choices?.[0]?.message?.content;
  if (typeof replyContent !== "string" || !replyContent.trim()) {
    throw new Error("Groq returned an empty response");
  }

  return replyContent;
}
