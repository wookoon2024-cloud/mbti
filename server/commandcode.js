const BASE_URL = 'https://api.commandcode.ai/provider/v1';

export class ApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

function describeError(status, payload) {
  const detail =
    payload?.error?.message || payload?.error?.error?.message || payload?.message || '';
  const code = payload?.error?.code || payload?.error?.type || '';

  if (status === 401) return 'API 키가 올바르지 않습니다. .env 의 COMMANDCODE_API_KEY 를 확인하세요.';
  if (status === 403) return '이 API 키는 Provider API 를 쓸 수 없습니다. GOAT 이상 플랜이 필요합니다.';
  if (status === 429) return '요청이 너무 많습니다. 잠시 후 다시 시도하세요.';
  if (status === 422 && String(code).includes('zdr')) return '이 모델은 ZDR 라우팅을 지원하지 않습니다.';
  if (status === 400 && String(code).includes('unsupported_model')) {
    return `이 모델을 사용할 수 없습니다: ${detail || '모델 ID를 확인하세요.'}`;
  }
  if (status >= 500) return `Command Code 서버 오류입니다.${detail ? ` (${detail})` : ''}`;
  return detail || `요청이 실패했습니다 (HTTP ${status}).`;
}

export async function callModel({ apiKey, model, wire, system, user, temperature = 0.3, maxTokens = 8192, signal }) {
  const anthropic = wire === 'anthropic';
  const url = anthropic ? `${BASE_URL}/messages` : `${BASE_URL}/chat/completions`;

  const body = anthropic
    ? { model, max_tokens: maxTokens, temperature, system, messages: [{ role: 'user', content: user }] }
    : { model, temperature, messages: [{ role: 'system', content: system }, { role: 'user', content: user }] };

  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(body),
      signal,
    });
  } catch (err) {
    if (err?.name === 'AbortError') throw err;
    throw new ApiError('Command Code API 에 연결하지 못했습니다. 네트워크를 확인하세요.', 0, 'network_error');
  }

  const raw = await res.text();
  let payload = null;
  try {
    payload = raw ? JSON.parse(raw) : null;
  } catch {
    payload = null;
  }

  if (!res.ok) {
    throw new ApiError(describeError(res.status, payload), res.status, payload?.error?.code);
  }

  const text = anthropic
    ? (payload?.content || []).filter((b) => b?.type === 'text').map((b) => b.text).join('')
    : payload?.choices?.[0]?.message?.content;

  if (!text || !String(text).trim()) {
    throw new ApiError('모델이 빈 응답을 반환했습니다. 다른 모델로 시도해 보세요.', 0, 'empty_response');
  }

  return String(text);
}
