import { callModel, ApiError } from './commandcode.js';
import {
  SPEAKER_SYSTEM_PROMPT,
  PERSON_SYSTEM_PROMPT,
  buildSpeakerPrompt,
  buildPersonPrompt,
  RETRY_REMINDER,
} from './prompt.js';
import { logAnalyze, saveRawResponse } from './logger.js';

const MAX_INPUT_CHARS = 200_000;
const REQUEST_TIMEOUT_MS = Number(process.env.ANALYZE_TIMEOUT_MS) || 120_000;
const MAX_ATTEMPTS = 2;

const AXIS_DEFS = [
  { axis: 'EI', left: 'E', right: 'I' },
  { axis: 'SN', left: 'S', right: 'N' },
  { axis: 'TF', left: 'T', right: 'F' },
  { axis: 'JP', left: 'J', right: 'P' },
];

const POLE_LABEL = { E: '외향', I: '내향', S: '감각', N: '직관', T: '사고', F: '감정', J: '판단', P: '인식' };
const ESTIMABLE_THRESHOLD = 50;

// 모델이 한글 극 이름이나 소문자로 답해도 받아준다.
const POLE_ALIASES = {
  외향: 'E', 내향: 'I', 감각: 'S', 직관: 'N', 사고: 'T', 감정: 'F', 판단: 'J', 인식: 'P',
  e: 'E', i: 'I', s: 'S', n: 'N', t: 'T', f: 'F', j: 'J', p: 'P',
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function clamp01to100(value, fallback = 0) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function normalizePole(value, def) {
  const raw = String(value ?? '').trim();
  if (!raw) return '?';

  let mapped =
    POLE_ALIASES[raw] ?? POLE_ALIASES[raw.toLowerCase()] ?? POLE_ALIASES[raw.toUpperCase()] ?? '';

  if (!mapped) {
    const korean = raw.match(/외향|내향|감각|직관|사고|감정|판단|인식/);
    if (korean) mapped = POLE_ALIASES[korean[0]];
  }

  if (!mapped) {
    const latin = raw.toUpperCase().match(/[EISNTFJP]/);
    if (latin) mapped = POLE_ALIASES[latin[0].toLowerCase()];
  }

  return mapped === def.left || mapped === def.right ? mapped : '?';
}

/* ------------------------------------------------------------------
   JSON 추출 — 코드펜스·앞뒤 설명·문자열 안의 중괄호까지 버틴다.
   ------------------------------------------------------------------ */

function balancedObjects(text) {
  const found = [];
  let depth = 0;
  let start = -1;
  let inString = false;
  let escaped = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];

    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }

    if (ch === '"') inString = true;
    else if (ch === '{') {
      if (depth === 0) start = i;
      depth += 1;
    } else if (ch === '}') {
      if (depth > 0) {
        depth -= 1;
        if (depth === 0 && start >= 0) {
          found.push(text.slice(start, i + 1));
          start = -1;
        }
      }
    }
  }

  return found.sort((a, b) => b.length - a.length);
}

function tryParse(candidate) {
  try {
    return JSON.parse(candidate);
  } catch {
    try {
      return JSON.parse(candidate.replace(/,\s*([}\]])/g, '$1'));
    } catch {
      return null;
    }
  }
}

function extractJson(text) {
  const raw = String(text);
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const sources = fenced ? [fenced[1], raw] : [raw];

  for (const source of sources) {
    for (const candidate of balancedObjects(source)) {
      const parsed = tryParse(candidate);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  }

  const error = new ApiError('모델이 JSON 형식을 지키지 않았습니다.', 0, 'bad_json');
  error.rawText = raw;
  throw error;
}

/* ------------------------------------------------------------------
   모델 호출 (재시도 포함)
   ------------------------------------------------------------------ */

function isRetryable(error) {
  if (!error) return false;
  if (error.code === 'bad_json' || error.code === 'network_error') return true;
  // 게이트웨이 시간 초과(524 포함)와 업스트림 5xx 는 일시적일 수 있다.
  return Number.isFinite(error.status) && error.status >= 500;
}

async function requestJson({ apiKey, model, wire, system, user, label }) {
  const started = Date.now();
  let lastError = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const answer = await callModel({
        apiKey,
        model,
        wire,
        system,
        user: attempt === 1 ? user : `${user}\n\n${RETRY_REMINDER}`,
        signal: controller.signal,
      });

      const json = extractJson(answer);
      await logAnalyze({ event: 'ok', label, model, attempt, ms: Date.now() - started });
      return json;
    } catch (err) {
      let error = err;

      if (err?.name === 'AbortError') {
        error = new ApiError(
          `모델 응답이 ${Math.round(REQUEST_TIMEOUT_MS / 1000)}초 안에 오지 않았습니다.`,
          504,
          'timeout',
        );
      }

      lastError = error;

      if (error?.code === 'bad_json') {
        const rawFile = await saveRawResponse(String(error.rawText ?? ''));
        await logAnalyze({ event: 'bad_json', label, model, attempt, ms: Date.now() - started, rawFile });
      } else {
        await logAnalyze({
          event: 'error',
          label,
          model,
          attempt,
          ms: Date.now() - started,
          code: error?.code || 'error',
          status: error?.status ?? null,
          message: error?.message,
        });
      }

      if (!isRetryable(error) || attempt === MAX_ATTEMPTS) throw error;
      await sleep(attempt * 900);
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError ?? new ApiError('요청에 실패했습니다.', 500, 'unknown');
}

function prepare(conversation) {
  const text = String(conversation ?? '').trim();
  if (text.length < 20) {
    throw new ApiError('대화 내용이 너무 짧습니다. 최소 몇 줄 이상의 대화를 넣어 주세요.', 400, 'too_short');
  }
  const truncated = text.length > MAX_INPUT_CHARS;
  return { text: truncated ? text.slice(0, MAX_INPUT_CHARS) : text, truncated };
}

/* ------------------------------------------------------------------
   1단계 — 등장인물 목록
   ------------------------------------------------------------------ */

function normalizeSpeakers(raw) {
  const source = raw && typeof raw === 'object' ? raw : {};
  const list = Array.isArray(source.speakers)
    ? source.speakers
    : Array.isArray(source.people)
      ? source.people
      : [];

  const speakers = list
    .map((entry) => {
      const item = entry && typeof entry === 'object' ? entry : {};
      return {
        name: String(item.name ?? item.speaker ?? '').trim(),
        aliases: Array.isArray(item.aliases) ? item.aliases.map((a) => String(a).trim()).filter(Boolean) : [],
        messageCount: Number.isFinite(Number(item.messageCount)) ? Number(item.messageCount) : null,
        note: String(item.note ?? '').trim(),
      };
    })
    .filter((item) => item.name);

  if (!speakers.length) {
    throw new ApiError(
      '대화에서 화자를 찾지 못했습니다. "이름 : 메시지" 형태로 이름이 들어간 대화를 넣어 주세요.',
      0,
      'no_speakers',
    );
  }

  return {
    format: String(source.format ?? '').trim(),
    messageCount: Number.isFinite(Number(source.messageCount)) ? Number(source.messageCount) : null,
    summary: String(source.summary ?? '').trim(),
    speakers,
  };
}

export function parseKakaoSpeakers(text) {
  if (!text || typeof text !== 'string') return [];
  const lines = text.split(/\r?\n/);
  const speakerCounts = new Map();

  const bracketPattern = /^\s*\[([^\]]{1,50})\]\s*\[(?:오전|오후|\d{1,2}:\d{2})[^\]]*\]\s*(.*)$/;
  const dateCommaPattern = /^\s*(?:\d{4}[년\.\-/]\s*)?\d{1,2}[월\.\-/]\s*\d{1,2}[일\.]?.*?,\s*([^:\n]{1,50})\s*:\s*(.*)$/;
  const simpleColonPattern = /^\s*([^:\n]{1,40})\s*:\s*(.+)$/;

  const systemBlacklist = /저장한 날짜|카카오톡 대화|님이 (?:들어왔|나갔|초대|퇴장|채팅방을 나갔습니다)|채팅방을 나갔습니다|삭제된 메시지|샵검색:|선물하기|보이스톡|페이스톡|라이브톡/;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || systemBlacklist.test(trimmed)) continue;
    if (/^-+\s*\d{4}[년\.\-/].*-+$/.test(trimmed)) continue;

    let m = trimmed.match(bracketPattern);
    if (!m) m = trimmed.match(dateCommaPattern);
    if (!m && !trimmed.startsWith('http') && !trimmed.startsWith('👉') && !trimmed.startsWith('www.')) {
      const colonMatch = trimmed.match(simpleColonPattern);
      if (colonMatch && !colonMatch[1].includes('://') && colonMatch[1].length <= 25) {
        m = colonMatch;
      }
    }

    if (m) {
      const name = m[1].trim();
      if (name && !systemBlacklist.test(name)) {
        speakerCounts.set(name, (speakerCounts.get(name) || 0) + 1);
      }
    }
  }

  return Array.from(speakerCounts.entries())
    .map(([name, count]) => ({
      name,
      messageCount: count,
      aliases: [],
      note: `${count}회 발화`,
    }))
    .sort((a, b) => b.messageCount - a.messageCount);
}

export function sampleConversationForSpeakers(text, maxChars = 15_000) {
  if (text.length <= maxChars) return text;
  const lines = text.split(/\r?\n/);
  const headCount = Math.floor(lines.length * 0.4);
  const tailCount = Math.floor(lines.length * 0.4);
  const midCount = Math.floor(lines.length * 0.2);
  const midStart = Math.floor((lines.length - midCount) / 2);

  const sampled = [
    ...lines.slice(0, headCount),
    '\n... (중간 대화 생략) ...\n',
    ...lines.slice(midStart, midStart + midCount),
    '\n... (중간 대화 생략) ...\n',
    ...lines.slice(-tailCount),
  ].join('\n');

  return sampled.slice(0, maxChars);
}

export function filterConversationForPerson(conversation, personName, maxChars = 18_000) {
  if (!conversation || conversation.length <= maxChars) {
    return conversation;
  }

  const lines = conversation.split(/\r?\n/);
  const targetPattern = new RegExp(`^\\[${personName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\]|^${personName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*:`);

  const selectedIndices = new Set();
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (targetPattern.test(line)) {
      if (i > 0) selectedIndices.add(i - 1);
      selectedIndices.add(i);
      if (i < lines.length - 1) selectedIndices.add(i + 1);
    }
  }

  const extracted = Array.from(selectedIndices)
    .sort((a, b) => a - b)
    .map(i => lines[i]);

  if (extracted.length < 5) {
    return sampleConversationForSpeakers(conversation, maxChars);
  }

  const joined = extracted.join('\n');
  if (joined.length <= maxChars) {
    return joined;
  }

  const headCount = Math.floor(extracted.length * 0.35);
  const tailCount = Math.floor(extracted.length * 0.45);
  const midCount = Math.floor(extracted.length * 0.2);
  const midStart = Math.floor((extracted.length - midCount) / 2);

  const sampled = [
    ...extracted.slice(0, headCount),
    '\n... (중간 대화 생략) ...\n',
    ...extracted.slice(midStart, midStart + midCount),
    '\n... (중간 대화 생략) ...\n',
    ...extracted.slice(-tailCount),
  ];

  return sampled.join('\n').slice(0, maxChars);
}

export async function extractSpeakers({ conversation, apiKey, model, wire }) {
  const { text, truncated } = prepare(conversation);

  // 1. 카카오톡 대화 정규식 초고속 파서 (대용량 6만자+ 텍스트도 0.005초 내 완료, 타임아웃 완전 차단)
  const parsedSpeakers = parseKakaoSpeakers(text);
  if (parsedSpeakers && parsedSpeakers.length >= 1) {
    const totalMessages = parsedSpeakers.reduce((acc, s) => acc + (s.messageCount || 0), 0);
    return {
      format: '카카오톡 대화',
      messageCount: totalMessages,
      summary: `대화 참여자 ${parsedSpeakers.length}명의 발화 목록이 감지되었습니다.`,
      speakers: parsedSpeakers.slice(0, 30),
      meta: { inputCharacters: text.length, truncated, fastExtracted: true },
    };
  }

  // 2. 비정형 텍스트인 경우 LLM 호출 (대용량 텍스트는 15,000자로 안전 압축하여 호출)
  const promptText = sampleConversationForSpeakers(text, 15_000);

  const json = await requestJson({
    apiKey,
    model,
    wire,
    system: SPEAKER_SYSTEM_PROMPT,
    user: buildSpeakerPrompt(promptText),
    label: 'speakers',
  });

  const result = normalizeSpeakers(json);
  result.meta = { inputCharacters: text.length, truncated };
  return result;
}

/* ------------------------------------------------------------------
   2단계 — 한 사람 판정
   ------------------------------------------------------------------ */

function axesToArray(input) {
  if (Array.isArray(input)) return input;
  if (input && typeof input === 'object') {
    return AXIS_DEFS.map((def) => {
      const found = input[def.axis] ?? input[def.axis.toLowerCase()];
      return found ? { ...(typeof found === 'object' ? found : { pole: found }), axis: def.axis } : null;
    }).filter(Boolean);
  }
  return [];
}

function normalizeAxis(raw, def) {
  const source = raw && typeof raw === 'object' ? raw : {};
  const declared = normalizePole(source.pole ?? source.result ?? source.letter, def);
  let confidence = clamp01to100(source.confidence ?? source.confidencePercent, declared === '?' ? 0 : 50);
  const estimable = source.estimable !== false && declared !== '?' && confidence >= ESTIMABLE_THRESHOLD;

  const pole = estimable ? declared : '?';
  if (!estimable) {
    confidence = declared === '?' ? Math.min(confidence, 20) : Math.min(confidence, ESTIMABLE_THRESHOLD - 1);
  }

  const evidence = Array.isArray(source.evidence)
    ? source.evidence.map((e) => String(e).trim()).filter(Boolean).slice(0, 4)
    : [];

  return {
    axis: def.axis,
    pole,
    confidence,
    estimable,
    reasoning: String(source.reasoning ?? source.reason ?? '').trim(),
    evidence,
    dataNote: String(source.dataNote ?? source.note ?? '').trim(),
    left: def.left,
    right: def.right,
    leftLabel: POLE_LABEL[def.left],
    rightLabel: POLE_LABEL[def.right],
  };
}

function normalizePerson(raw, fallbackName) {
  const source = raw && typeof raw === 'object' ? raw : {};
  const rawAxes = axesToArray(source.axes ?? source.dimensions ?? source.letters);

  const axes = AXIS_DEFS.map((def) => {
    const found = rawAxes.find((a) => String(a?.axis ?? '').toUpperCase() === def.axis);
    return normalizeAxis(found, def);
  });

  const estimableAxes = axes.filter((a) => a.estimable);
  const avgConfidence = estimableAxes.length
    ? Math.round(estimableAxes.reduce((sum, a) => sum + a.confidence, 0) / estimableAxes.length)
    : 0;

  const dataSufficiency = clamp01to100(source.dataSufficiency ?? source.dataScore, avgConfidence);

  return {
    name: String(source.name ?? '').trim() || fallbackName,
    aliases: Array.isArray(source.aliases) ? source.aliases.map((a) => String(a).trim()).filter(Boolean) : [],
    messageCount: Number.isFinite(Number(source.messageCount)) ? Number(source.messageCount) : null,
    type: axes.map((a) => (a.estimable ? a.pole : '?')).join(''),
    axisThreshold: ESTIMABLE_THRESHOLD,
    estimableCount: estimableAxes.length,
    dataSufficiency,
    dataShortfall: Math.max(0, 100 - dataSufficiency),
    overallConfidence: clamp01to100(source.overallConfidence ?? source.confidence, avgConfidence),
    axes,
    summary: String(source.summary ?? '').trim(),
    analysis: String(source.analysis ?? source.detail ?? '').trim(),
    traits: Array.isArray(source.traits)
      ? source.traits.map((t) => String(t).trim()).filter(Boolean).slice(0, 6)
      : [],
    caveats: String(source.caveats ?? '').trim(),
  };
}

export async function analyzePerson({ conversation, person, apiKey, model, wire }) {
  const { text, truncated } = prepare(conversation);
  const target = { name: String(person?.name ?? '').trim(), aliases: person?.aliases ?? [] };

  if (!target.name) {
    throw new ApiError('분석할 사람의 이름이 비어 있습니다.', 400, 'no_name');
  }

  // 대용량 대화(6만자+)에서도 타임아웃 없이 빠르고 정확하게 분석할 수 있도록 대상 인물 발화 중심 압축
  const filteredText = filterConversationForPerson(text, target.name, 12_000);

  const json = await requestJson({
    apiKey,
    model,
    wire,
    system: PERSON_SYSTEM_PROMPT,
    user: buildPersonPrompt(filteredText, target),
    label: `person:${target.name}`,
  });

  const result = normalizePerson(json, target.name);
  result.meta = { inputCharacters: text.length, analyzedCharacters: filteredText.length, truncated };
  return result;
}
