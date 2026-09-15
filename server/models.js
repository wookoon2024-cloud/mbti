export const DEFAULT_MODEL = 'deepseek/deepseek-v4-flash';

export const MODELS = [
  { id: 'deepseek/deepseek-v4-flash', name: 'DeepSeek V4 Flash · 빠르고 저렴', wire: 'openai' },
  { id: 'deepseek/deepseek-v4-pro', name: 'DeepSeek V4 Pro · 정확도 우선', wire: 'openai' },
  { id: 'gpt-5.6-luna', name: 'GPT-5.6 Luna · 저렴', wire: 'openai' },
  { id: 'gpt-5.6-terra', name: 'GPT-5.6 Terra · 균형', wire: 'openai' },
  { id: 'google/gemini-3.5-flash', name: 'Gemini 3.5 Flash', wire: 'openai' },
  { id: 'xai/grok-4.5', name: 'Grok 4.5', wire: 'openai' },
  { id: 'moonshotai/Kimi-K2.6', name: 'Kimi K2.6', wire: 'openai' },
  { id: 'zai-org/GLM-5.2', name: 'GLM-5.2', wire: 'openai' },
  { id: 'MiniMaxAI/MiniMax-M3', name: 'MiniMax M3', wire: 'openai' },
  { id: 'claude-sonnet-5', name: 'Claude Sonnet 5 · Anthropic', wire: 'anthropic' },
];

export function resolveModel(id) {
  const known = MODELS.find((m) => m.id === id);
  if (known) return known;
  return { id, name: id, wire: /^claude/.test(id) ? 'anthropic' : 'openai' };
}
