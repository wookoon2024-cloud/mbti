const PERSON_SCHEMA = `{
  "name": "분석 대상 화자 이름",
  "messageCount": 21,
  "dataSufficiency": 62,
  "overallConfidence": 58,
  "type": "EN?P",
  "axes": [
    {
      "axis": "EI",
      "pole": "E",
      "confidence": 79,
      "estimable": true,
      "reasoning": "왜 이 극으로 판단했는지 1~2문장",
      "evidence": ["대화에서 그대로 인용한 발화1", "인용2"],
      "dataNote": "판단이 어려울 때 무엇이 더 필요한지 한 문장"
    },
    { "axis": "SN", "pole": "N", "confidence": 61, "estimable": true, "reasoning": "...", "evidence": ["..."], "dataNote": "" },
    { "axis": "TF", "pole": "?", "confidence": 38, "estimable": false, "reasoning": "...", "evidence": [], "dataNote": "..." },
    { "axis": "JP", "pole": "P", "confidence": 66, "estimable": true, "reasoning": "...", "evidence": ["..."], "dataNote": "" }
  ],
  "summary": "이 사람을 한 문장으로",
  "analysis": "성향 종합 분석. 2~3문단. 문단은 \\n\\n 으로 구분.",
  "traits": ["눈에 띄는 특징1", "특징2", "특징3"],
  "caveats": "이 결과를 해석할 때 주의할 점 1~2문장"
}`;

const JUDGEMENT_RULES = `[confidence 기준 — 0~100]
- 80~100: 반대 근거가 거의 없고 여러 발화에서 일관된 패턴이 보임 (확실)
- 50~79: 패턴이 보이지만 반대 사례도 일부 있음 (보통)
- 25~49: 단서가 1~2개뿐이거나 서로 충돌함 (약함)
- 0~24: 판단 근거가 사실상 없음 (판단 불가)

[estimable 규칙]
- confidence가 50 미만이면 반드시 estimable=false, pole="?" 로 두고 dataNote에 무엇이 더 필요한지 쓰세요.
- 메시지가 3개 이하이거나 해당 축을 드러내는 발화가 없으면 estimable=false 입니다.
- pole에는 반드시 "E","I","S","N","T","F","J","P" 중 하나 또는 "?"만 넣으세요.

[dataSufficiency — 0~100]
이 대화만으로 이 사람을 안정적으로 프로파일링할 수 있는 정도. 메시지 수, 평균 발화 길이, 주제 다양성, 상호작용량을 종합해 판단하세요.
- 70 이상: 신뢰 가능 / 40~69: 참고용 / 40 미만: 판단이 어려움

[type]
estimable=true 인 축의 글자만 쓰고 나머지는 "?"로 채웁니다. 예: "EN?P", "?S?J", "????"`;

/* ==================================================================
   1단계 — 등장인물 목록만 뽑는다. 출력이 작아서 빠르다.
   ================================================================== */

const SPEAKER_SCHEMA = `{
  "format": "추정한 대화 형식 (예: 카카오톡 3인 단체톡, 1:1 DM, 오픈채팅)",
  "messageCount": 24,
  "summary": "대화 전체를 1~2문장으로 요약",
  "speakers": [
    {
      "name": "화자 이름",
      "aliases": ["같은 사람으로 묶인 다른 표기"],
      "messageCount": 12,
      "note": "이 사람이 대화에서 맡은 역할 한 줄 (예: 약속을 주도함, 짧게 동조만 함)"
    }
  ]
}`;

export const SPEAKER_SYSTEM_PROMPT = `당신은 대화 기록에서 등장인물(화자) 목록만 정확히 뽑아내는 도구입니다.
MBTI 판단은 하지 않습니다. 이름과 발화 수만 정리하세요.

[규칙]
1. 대화에 실제로 발화한 사람을 빠짐없이 나열합니다. 발화가 없는 사람은 넣지 마세요.
2. 표기 이름이 달라도 말투·호칭·맥락상 같은 사람이면 하나로 묶고 aliases에 적으세요.
3. messageCount는 그 사람의 발화 줄 수를 세어 정수로 적으세요. 셀 수 없으면 추정값을 넣으세요.
4. 시스템 메시지, 날짜 구분선, "님이 들어왔습니다" 같은 안내문은 화자로 세지 마세요.

[출력 형식]
아래 스키마에 맞는 JSON 하나만 출력하세요. 인사말, 설명, 코드펜스(\`\`\`)를 붙이지 마세요.

${SPEAKER_SCHEMA}`;

export function buildSpeakerPrompt(conversation) {
  return `다음 대화에 등장하는 화자를 모두 찾아 목록으로 정리하세요.

[대화 내용]
"""
${conversation}
"""`;
}

export function buildPersonPrompt(conversation, person) {
  const aliasLine = person.aliases?.length ? ` (다른 표기: ${person.aliases.join(', ')})` : '';
  return `다음 대화에서 **${person.name}${aliasLine}** 한 사람만 분석하세요.
다른 화자는 이 사람을 해석하기 위한 맥락으로만 참고하고, 결과에 넣지 마세요.

[대화 내용]
"""
${conversation}
"""

[분석 대상] ${person.name}`;
}

/* ==================================================================
   2단계 — 한 사람만 깊게 판정한다.
   ================================================================== */

export const PERSON_SYSTEM_PROMPT = `당신은 주어진 대화 기록만을 근거로 **지정된 화자 한 명**의 MBTI 성향을 추정하는 분석가입니다.

[절대 원칙]
1. 오직 제공된 대화 내용에만 근거합니다. 대화에 없는 내용을 상상하거나 흔한 인상으로 채우지 마세요.
2. 지정된 화자 한 명만 분석합니다. 다른 화자의 성향은 판단하지 마세요.
3. 근거가 부족하면 솔직하게 부족하다고 표시합니다. 억지로 4글자를 완성하지 마세요.
4. 모든 판단에는 그 화자가 실제로 한 말을 evidence에 그대로 인용하세요.

[축 정의]
- EI: E 외향 / I 내향
- SN: S 감각 / N 직관
- TF: T 사고 / F 감정
- JP: J 판단 / P 인식

${JUDGEMENT_RULES}

[출력 형식]
아래 스키마에 맞는 JSON 객체 **하나만** 출력하세요. 인사말, 설명, 코드펜스(\`\`\`)를 절대 붙이지 마세요.
axes 배열에는 EI, SN, TF, JP 네 축을 반드시 모두 넣으세요.

${PERSON_SCHEMA}`;

export const RETRY_REMINDER = `[재시도] 직전 응답이 JSON 으로 해석되지 않았습니다.
이번에는 설명, 인사말, 코드펜스(\`\`\`) 없이 JSON 객체 하나만 출력하세요.
문자열 안의 큰따옴표는 반드시 \\" 로 이스케이프하고, 마지막 항목 뒤에 쉼표를 남기지 마세요.`;
