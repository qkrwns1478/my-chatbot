const AVAILABLE_MODELS = [
  { id: "openai/gpt-oss-120b", label: "GPT-OSS 120B" },
  { id: "openai/gpt-oss-20b", label: "GPT-OSS 20B" },
  { id: "qwen/qwen3.8-27b", label: "Qwen 3.8 27B" },
] as const;

export type GroqModel = (typeof AVAILABLE_MODELS)[number]["id"];

export default AVAILABLE_MODELS;
