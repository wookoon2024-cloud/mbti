export const DEFAULT_MODEL = 'deepseek/deepseek-v4-flash';

export const MODELS = [
  { id: 'deepseek/deepseek-v4-flash', name: '딥시크 V4.1 FLASH (추천 기본 모델)', wire: 'openai', active: true },
  { id: 'deepseek/deepseek-v4-pro', name: 'DeepSeek V4 Pro', wire: 'openai' },
  { id: 'gpt-5.6-luna', name: 'GPT-5.6 Luna', wire: 'openai' },
  { id: 'gpt-5.6-terra', name: 'GPT-5.6 Terra', wire: 'openai' },
  { id: 'google/gemini-3.5-flash', name: 'Gemini 3.5 Flash', wire: 'openai' },
  { id: 'xai/grok-4.5', name: 'Grok 4.5', wire: 'openai' },
  { id: 'moonshotai/Kimi-K2.6', name: 'Kimi K2.6', wire: 'openai' },
  { id: 'zai-org/GLM-5.2', name: 'GLM-5.2', wire: 'openai' },
  { id: 'MiniMaxAI/MiniMax-M3', name: 'MiniMax M3', wire: 'openai' },
  { id: 'claude-sonnet-5', name: 'Claude Sonnet 5', wire: 'anthropic' },
];

export function resolveModel(id, isCustomKey = false) {
  // 본인 API 키를 사용할 때는 선택한 모델 적용
  if (isCustomKey && id) {
    const found = MODELS.find((m) => m.id === id);
    if (found) return found;
  }
  // 서버 기본 무료 모드일 때는 딥시크 V4.1 FLASH로 고정
  return MODELS[0];
}

