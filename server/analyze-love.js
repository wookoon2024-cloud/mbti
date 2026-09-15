import { callModel, ApiError } from './commandcode.js';
import { saveRawResponse } from './logger.js';

const MAX_INPUT_CHARS = 200_000;
const REQUEST_TIMEOUT_MS = Number(process.env.ANALYZE_TIMEOUT_MS) || 120_000;

const LOVE_SYSTEM_PROMPT = `당신은 카카오톡, DM, 메신저 대화를 스캔하여 두 사람의 관계와 상호 애정도/호감도를 정밀 분석하는 '톡스캐너 1:1 관계 분석기'입니다.

[역할 및 지침]
1. 대화에 등장하는 주 화자 2명(A와 B)을 파악합니다.
2. 대화의 말투, 답장 속도, 이모티콘 사용, 챙겨줌, 질투, 애정 표현, 주도권 등을 분석하여 각자의 애정도/호감도(0~100점)를 산출합니다.
3. 대화 속 날짜/타임스탬프의 흐름을 분석하여 일별(Daily) 애정도 추이 데이터를 추출합니다.
4. 반드시 유효한 단일 JSON 객체로만 응답하세요. 백틱(markdown fences) 없이 순수 JSON만 출력해야 합니다.

[출력 JSON 스키마]
{
  "couple": {
    "personA": "화자 A 이름",
    "personB": "화자 B 이름",
    "relationStatus": "썸 / 연인 / 짝사랑 / 친구 등",
    "balance": "누가 더 좋아하는지 (예: A의 적극적인 애정 공세, 팽팽한 호각지세, B의 은은한 짝사랑 등)",
    "overallScore": 88
  },
  "personA": {
    "name": "화자 A 이름",
    "score": 85,
    "style": "다정헌신형 / 츤데레 직진형 / 댕댕이형 등",
    "traits": ["선톡 장인", "칼답러", "약속 주도"],
    "favoriteQuote": "대화 중 가장 애정이 드러난 대표 대사"
  },
  "personB": {
    "name": "화자 B 이름",
    "score": 92,
    "style": "수줍은 반응형 / 겉차속따형 등",
    "traits": ["은근한 챙김", "감정 숨김", "약속 기대"],
    "favoriteQuote": "대화 중 가장 애정이 드러난 대표 대사"
  },
  "timeline": [
    {
      "date": "YYYY-MM-DD",
      "scoreA": 80,
      "scoreB": 85,
      "messageCount": 14,
      "event": "첫 데이트 약속 잡은 날",
      "note": "지훈의 적극적인 카페 제안에 수민이 흔쾌히 응함"
    }
  ],
  "monthly": [
    {
      "month": "YYYY-MM",
      "scoreA": 82,
      "scoreB": 88,
      "summary": "서로의 일상을 공유하며 급격히 가까워진 시기"
    }
  ],
  "yearly": [
    {
      "year": "YYYY",
      "scoreA": 85,
      "scoreB": 90,
      "summary": "설렘 지수 최고조"
    }
  ],
  "flutterPoints": ["대화 중 가장 설렜던 모먼트나 호감 포인트 1~3개"],
  "cautionPoints": ["갈등 예방을 위해 주의할 점 또는 서운할 수 있는 포인트 1~2개"],
  "scouterVerdict": "톡스캐너 관계 분석 총평 (위트있고 통찰력 있는 AI 종합 분석 멘트)"
}
`;

function extractJson(raw) {
  const text = String(raw || '').trim();
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, text];
  const candidate = (jsonMatch[1] || text).trim();
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start >= 0 && end > start) {
    return JSON.parse(candidate.slice(start, end + 1));
  }
  return JSON.parse(candidate);
}

export async function analyzeLove({ conversation, apiKey, model, wire }) {
  const text = String(conversation || '').trim();
  if (text.length < 20) {
    throw new ApiError('대화 내용이 너무 짧습니다. 최소 몇 줄 이상의 대화를 입력해 주세요.', 400, 'too_short');
  }

  const prompt = `다음 대화 내용을 정밀 분석하여 두 사람의 상호 애정도와 시계열 추이를 측정해 주세요:\n\n` +
    text.slice(0, MAX_INPUT_CHARS);

  const start = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let raw;
  try {
    raw = await callModel({
      apiKey,
      model,
      wire,
      system: LOVE_SYSTEM_PROMPT,
      user: prompt,
      signal: controller.signal,
    });
  } catch (err) {
    if (err?.name === 'AbortError') {
      throw new ApiError(`모델 응답이 ${Math.round(REQUEST_TIMEOUT_MS / 1000)}초 안에 오지 않았습니다.`, 504, 'timeout');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }

  try {
    const data = extractJson(raw);
    const elapsedMs = Date.now() - start;

    // timeline 보정
    if (!data.timeline || !data.timeline.length) {
      const today = new Date().toISOString().slice(0, 10);
      data.timeline = [
        {
          date: today,
          scoreA: data.personA?.score || 80,
          scoreB: data.personB?.score || 85,
          messageCount: 20,
          event: '전반적인 대화 분석',
          note: data.couple?.balance || '안정적인 상호 소통'
        }
      ];
    }

    // monthly/yearly 보정
    if (!data.monthly || !data.monthly.length) {
      const ym = data.timeline[0]?.date?.slice(0, 7) || '2026-03';
      data.monthly = [
        {
          month: ym,
          scoreA: data.personA?.score || 80,
          scoreB: data.personB?.score || 85,
          summary: data.couple?.relationStatus || '진행 중'
        }
      ];
    }

    if (!data.yearly || !data.yearly.length) {
      const y = data.timeline[0]?.date?.slice(0, 4) || '2026';
      data.yearly = [
        {
          year: y,
          scoreA: data.personA?.score || 80,
          scoreB: data.personB?.score || 85,
          summary: '종합 애정도 지표',
        },
      ];
    }
    // 날짜 키 통일 (monthly, yearly 도 date 속성을 갖도록)
    data.monthly = (data.monthly || []).map((m) => ({
      ...m,
      date: m.date || m.month || '2026-03',
    }));
    data.yearly = (data.yearly || []).map((y) => ({
      ...y,
      date: y.date || y.year || '2026',
    }));

    // characters 배열 및 일관된 필드 매핑
    const personA = {
      name: data.personA?.name || data.couple?.personA || '화자 A',
      affectionScore: data.personA?.score ?? 80,
      role: data.personA?.style || '대화 참여자',
      traits: Array.isArray(data.personA?.traits) ? data.personA.traits : [],
      quote: data.personA?.favoriteQuote || '',
    };
    const personB = {
      name: data.personB?.name || data.couple?.personB || '화자 B',
      affectionScore: data.personB?.score ?? 85,
      role: data.personB?.style || '대화 참여자',
      traits: Array.isArray(data.personB?.traits) ? data.personB.traits : [],
      quote: data.personB?.favoriteQuote || '',
    };

    data.characters = [personA, personB];
    data.relationshipTitle = data.couple?.relationStatus || '1:1 애정 분석 결과';
    data.relationshipSubtitle = data.couple?.balance || '대화 패턴 기반 관계 분석입니다.';
    data.overallAffectionScore = data.couple?.overallScore ?? Math.round((personA.affectionScore + personB.affectionScore) / 2);
    data.relationshipBalance = data.couple?.balance || '상호 균형';
    data.overallVerdict = data.scouterVerdict || '';
    data.flutterPoints = Array.isArray(data.flutterPoints) ? data.flutterPoints : [];
    data.cautionPoints = Array.isArray(data.cautionPoints) ? data.cautionPoints : [];

    data.meta = {
      elapsedMs,
      model,
    };

    return data;
  } catch (err) {
    saveRawResponse('love-fail', raw);
    throw new ApiError('애정도 분석 결과를 파싱하지 못했습니다. 다시 시도해 주세요.', 502, 'bad_json_response');
  }
}
