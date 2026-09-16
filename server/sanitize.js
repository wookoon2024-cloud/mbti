/**
 * 개인정보 비식별화(PII Scrubbing) 및 프롬프트 인젝션 방어 모듈
 * 톡스캐너 (TalkScanner) - Data Privacy & AI Security Guard
 */

export function sanitizePII(text) {
  if (!text) return '';
  let s = String(text);

  // 1. 주민등록번호 / 외국인등록번호 (13자리)
  s = s.replace(/\b\d{6}[-\s]?[1-8]\d{6}\b/g, '[주민번호]');

  // 2. 신용카드 번호 (15~16자리 카드 패턴)
  s = s.replace(/\b(?:4\d{3}|5[1-5]\d{2}|6011|3[47]\d{2})[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, '[카드번호]');

  // 3. 이메일 주소
  s = s.replace(/\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g, '[이메일]');

  // 4. 전화번호 / 휴대폰번호 (010, 02, 031, 070 등)
  s = s.replace(/\b(01[016789]|02|0[3-6][1-5]|070)[-\s.]?\d{3,4}[-\s.]?\d{4}\b/g, '[전화번호]');

  // 5. 은행 계좌번호 패턴 (날짜 YYYY-MM-DD 제외)
  s = s.replace(/\b(?!19\d\d|20\d\d)\d{2,6}[-\s]\d{2,6}[-\s]\d{2,6}(?:[-\s]\d{1,5})?\b/g, '[계좌번호]');
  s = s.replace(/\b\d{3,6}[-\s]\d{2,6}[-\s]\d{3,8}\b/g, (match) => {
    if (/^(?:19|20)\d{2}[-\s.](?:0?[1-9]|1[0-2])[-\s.](?:0?[1-9]|[12]\d|3[01])$/.test(match)) {
      return match;
    }
    return '[계좌번호]';
  });

  // 6. 상세 도로명 및 지번 주소 마스킹
  const addrRegex = /(?:서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주)(?:시|특별시|광역시|특별자치시|도|특별자치도)?\s+[가-힣\d\s]+?(?:로|길|동|읍|면|리)\s+\d+(?:-\d+)?(?:\s*[가-힣\d\s()동호층빌딩아파트]+)?/g;
  s = s.replace(addrRegex, '[상세주소]');

  return s;
}

export function sanitizeForSandbox(text) {
  if (!text) return '';
  let s = String(text);
  s = sanitizePII(s);
  s = s.replace(/<\/?(?:user_conversation_sandbox|system_prompt|instructions|system|assistant|admin|prompt)>/gi, (m) => {
    return '[무효화태그:' + m.replace(/[<>]/g, '') + ']';
  });
  s = s.replace(/```/g, "'''");
  return s;
}

export function sanitizeSpeakerName(name) {
  if (!name) return '참여자';
  return String(name)
    .replace(/[<>"'`\r\n]/g, '')
    .trim()
    .slice(0, 40) || '참여자';
}

/**
 * 화자 실명 가명화(Pseudonymization / Tokenization)
 * 대화 내용 속 등장하는 이름들을 [참여자1], [참여자2] 등의 익명 토큰으로 치환하여
 * 외부 AI API로 실명이 단 1글자도 전송되지 않도록 완벽 차단합니다.
 */
export function tokenizeConversation(conversation, speakers = []) {
  if (!conversation) return { tokenizedText: '', tokenMap: new Map(), reverseMap: new Map() };

  // 긴 이름부터 치환해야 부분 일치 오작동 방지 (e.g. '김철수'가 '철수'보다 먼저 치환되도록)
  const uniqueNames = Array.from(new Set(
    speakers.flatMap((s) => (typeof s === 'string' ? [s] : [s?.name, ...(s?.aliases || [])]))
      .filter((n) => typeof n === 'string' && n.trim().length > 0)
      .map((n) => n.trim())
  )).sort((a, b) => b.length - a.length);

  const tokenMap = new Map(); // 원래 이름 -> 화자N
  const reverseMap = new Map(); // [화자N] 및 화자N -> 원래 이름

  uniqueNames.forEach((name, idx) => {
    const token = `화자${idx + 1}`;
    tokenMap.set(name, token);
    reverseMap.set(`[${token}]`, name);
    reverseMap.set(token, name);
  });

  let tokenizedText = String(conversation);
  for (const [name, token] of tokenMap.entries()) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    tokenizedText = tokenizedText.replace(new RegExp(escaped, 'g'), token);
  }

  return { tokenizedText, tokenMap, reverseMap };
}

/**
 * AI 응답 객체 역매핑(De-tokenization)
 * AI가 생성한 분석 결과 JSON 속의 [화자1], 화자1 등의 토큰을 원래 이름으로 완벽 복원합니다.
 */
export function detokenizeObject(obj, reverseMap) {
  if (!obj || !reverseMap || reverseMap.size === 0) return obj;

  const sortedEntries = Array.from(reverseMap.entries()).sort((a, b) => b[0].length - a[0].length);

  function restoreString(str) {
    if (typeof str !== 'string') return str;
    let out = str;
    for (const [token, originalName] of sortedEntries) {
      out = out.split(token).join(originalName);
    }
    return out;
  }

  function recurse(val) {
    if (typeof val === 'string') {
      return restoreString(val);
    }
    if (Array.isArray(val)) {
      return val.map(recurse);
    }
    if (val && typeof val === 'object') {
      const res = {};
      for (const [k, v] of Object.entries(val)) {
        res[k] = recurse(v);
      }
      return res;
    }
    return val;
  }

  return recurse(obj);
}

