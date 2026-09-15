const SAMPLE = `2026년 3월 5일 오후 2:14, 지훈 : 야 다들 주말에 뭐해 ㅋㅋ
2026년 3월 5일 오후 2:14, 지훈 : 나 새로 생긴 그 카페 가보려고
2026년 3월 5일 오후 2:15, 지훈 : 2호선으로 세 정거장이래 금방이야
2026년 3월 5일 오후 2:20, 수민 : 나는 이번 주 너무 힘들었어서 집에서 쉬려고
2026년 3월 5일 오후 2:20, 수민 : 카페 이름이 뭐야? 영업시간은?
2026년 3월 5일 오후 2:21, 지훈 : 이름은 '모먼트'! 오전 9시부터 밤 11시까지 한대
2026년 3월 5일 오후 2:21, 지훈 : 근데 사람 많으면 어쩌지 벌써 설레
2026년 3월 5일 오후 2:23, 수민 : 사람 많으면 대기 걸고 근처 다른 데 알아보면 되지
2026년 3월 5일 오후 2:24, 예린 : 저도 가고 싶어요
2026년 3월 5일 오후 2:25, 지훈 : 오 예린아 같이 가자!!
2026년 3월 5일 오후 2:25, 지훈 : 우리 셋이면 완벽하다 진짜
2026년 3월 5일 오후 2:26, 수민 : 토요일 오후 3시 어때? 그때가 제일 한산할 거야
2026년 3월 5일 오후 2:27, 지훈 : 난 아무때나 좋아~ 근데 3시면 딱 좋지
2026년 3월 5일 오후 2:28, 예린 : 네 좋아요
2026년 3월 5일 오후 2:30, 수민 : 그럼 토요일 3시, 2번 출구에서 만나자
2026년 3월 5일 오후 2:30, 지훈 : ㅇㅋ!! 나 늦으면 먼저 들어가 있어 진짜 미안
2026년 3월 5일 오후 2:31, 수민 : 또 늦을 생각부터 하는 거야...
2026년 3월 5일 오후 2:32, 지훈 : 아니 그냥 혹시나 해서 ㅋㅋㅋ 나 잘 지켜
2026년 3월 5일 오후 2:33, 수민 : 지난번에도 그랬잖아
2026년 3월 5일 오후 2:34, 지훈 : 이번엔 진짜야 믿어줘
2026년 3월 5일 오후 2:35, 예린 : 저는 아무 때나 괜찮아요
2026년 3월 5일 오후 2:36, 수민 : 카페 앞에서 3시 10분까지 기다릴게
2026년 3월 5일 오후 2:37, 지훈 : 왜 10분이나 기다려 ㅠㅠ 나 감동이야
2026년 3월 5일 오후 2:38, 수민 : 감동 말고 지각하지 마`;

const SAMPLE_LOVE = `2025년 11월 12일 오후 7:15, 지민 : 민재야 오늘 발표 고생 많았어~
2025년 11월 12일 오후 7:18, 민재 : 지민이 너도! 자료 준비하느라 진짜 수고했어
2025년 11월 12일 오후 7:20, 지민 : 나중에 시험 끝나면 맛있는 거 먹으러 가자 내가 살게 ㅋㅋ
2025년 11월 12일 오후 7:22, 민재 : 좋아! 네가 좋아하는 연어초밥 맛집 알아봐 둘게

2025년 12월 24일 오후 8:30, 민재 : 지민아 크리스마스 이브인데 뭐해?
2025년 12월 24일 오후 8:31, 지민 : 나 집에서 넷플릭스 보는데 너는?
2025년 12월 24일 오후 8:35, 민재 : 나 집 앞인데 잠깐 나올 수 있어? 케이크 샀는데 같이 먹자
2025년 12월 24일 오후 8:36, 지민 : 헐 진짜?? 5분만 기다려 바로 나갈게!!
2025년 12월 24일 오후 11:40, 지민 : 오늘 케이크 넘 고마웠어... 진짜 감동이었어 민재야 🥺
2025년 12월 24일 오후 11:42, 민재 : 네가 좋아해줘서 내가 더 고맙지. 따뜻하게 자고 좋은 꿈 꿔!

2026년 1월 1일 오전 12:01, 민재 : 지민아 새해 복 많이 받아!! 올 한 해도 나랑 제일 많이 놀아줘 ㅎㅎ
2026년 1월 1일 오전 12:02, 지민 : 민재도 새해 복 많이 받아! 당연하지 올해도 잘 부탁해 ❤️

2026년 2월 14일 오후 6:10, 지민 : 민재야 초콜릿 직접 만들어봤는데 입에 맞았으면 좋겠다
2026년 2월 14일 오후 6:15, 민재 : 이거 진짜 아까워서 어떻게 먹어 ㅠㅠ 진짜 정성 대박이다
2026년 2월 14일 오후 6:16, 민재 : 지민아 이번 주말에 서울숲 갈래? 너 사진 예쁘게 찍어줄게
2026년 2월 14일 오후 6:20, 지민 : 응응 너무 좋아! 날씨도 풀린다니까 예쁜 옷 입고 갈게!

2026년 3월 5일 오후 10:20, 지민 : 오늘 하루종일 연락 잘 안 돼서 조금 서운했어...
2026년 3월 5일 오후 10:25, 민재 : 미안해 지민아 ㅠㅠ 오늘 외근 나와서 배터리가 나갔었어. 미리 말했어야 했는데 정말 미안해
2026년 3월 5일 오후 10:26, 민재 : 지금 목소리 듣고 싶어서 전화 걸어도 돼?
2026년 3월 5일 오후 10:27, 지민 : 응 전화해줘.. 기다렸어
2026년 3월 5일 오후 11:15, 지민 : 통화하니까 다 풀렸다 ㅎㅎ 항상 내 기분 먼저 챙겨줘서 고마워
2026년 3월 5일 오후 11:16, 민재 : 내가 더 잘할게. 사랑해 지민아 잘 자!`;

const BANDS = {
  high: { key: 'high', label: '확실', glyph: '●' },
  mid: { key: 'mid', label: '보통', glyph: '◐' },
  low: { key: 'low', label: '약함', glyph: '○' },
  none: { key: 'none', label: '판단 불가', glyph: '✕' },
};

const STATUS = {
  pending: { key: 'pending', glyph: '○', label: '대기' },
  running: { key: 'running', glyph: '◐', label: '판독 중' },
  done: { key: 'done', glyph: '●', label: '완료' },
  error: { key: 'error', glyph: '✕', label: '실패' },
};

const $ = (id) => document.getElementById(id);

function el(tag, opts = {}, children = []) {
  const node = document.createElement(tag);
  if (opts.class) node.className = opts.class;
  if (opts.text != null) node.textContent = opts.text;
  for (const [key, value] of Object.entries(opts.attrs || {})) {
    if (value === false || value == null) continue;
    node.setAttribute(key, value === true ? '' : String(value));
  }
  for (const child of children) if (child) node.appendChild(child);
  return node;
}

function bandFor(confidence, estimable) {
  if (estimable) return confidence >= 70 ? BANDS.high : BANDS.mid;
  return confidence >= 25 ? BANDS.low : BANDS.none;
}

function bandPill(band, text) {
  return el('span', { class: `band-pill band-${band.key}` }, [
    el('span', { text: band.glyph, attrs: { 'aria-hidden': 'true' } }),
    el('span', { text }),
  ]);
}

function paragraphs(text) {
  return String(text)
    .split(/\n{2,}|\r\n\r\n/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => el('p', { text: chunk }));
}

/* ==================================================================
   상태 및 제한 설정
   ================================================================== */

const MAX_SELECT_PERSONS = 4; // 2단계 인물 선택 상한 (최대 4명)

const state = {
  models: [],
  defaultModel: '',
  hasServerKey: false,
  busy: false,
  conversation: '',
  speakerData: null,
  selected: new Set(),
  status: new Map(),
  errors: new Map(),
  results: [],
  activeTab: null,
  running: false,
  runStartedAt: 0,
  runTimer: null,
  loadTimer: null,
  cooldownRemaining: 0,
  cooldownTimer: null,
  quotaExhausted: false,
  resetRemainingSec: 0,
  resetTimer: null,
  hasReferralBonus: false,
  currentMode: 'mbti',
  loveBusy: false,
  loveCooldownRemaining: 0,
  loveCooldownTimer: null,
  loveData: null,
  loveChartFilter: 'daily',
  customApiKey: '',
  hasCustomKey: false,
};

let toastTimer = null;
function showToast(message) {
  const toast = $('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.hidden = false;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.hidden = true;
  }, 3400);
}

// 모바일 브라우저, 카카오톡 인앱 브라우저 및 HTTP 환경에서도 안전한 클립보드 복사 유틸
async function copyToClipboard(text, fallbackPromptMsg = '아래 내용을 복사하세요:') {
  if (!text) return false;

  // 1. 최신 Clipboard API 시도
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      console.warn('Clipboard writeText failed, trying fallback', e);
    }
  }

  // 2. execCommand fallback 시도 (모바일 Safari, 인앱 브라우저, 비보안 컨텍스트 호환)
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    ta.style.top = `${window.pageYOffset || document.documentElement.scrollTop || 0}px`;
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    ta.setSelectionRange(0, text.length);
    const success = document.execCommand('copy');
    document.body.removeChild(ta);
    if (success) return true;
  } catch (e) {
    console.warn('execCommand copy failed', e);
  }

  // 3. 사용자 직접 복사 프롬프트
  try {
    window.prompt(fallbackPromptMsg, text);
    return true;
  } catch {
    return false;
  }
}

// 모바일 화면(폭 960px 이하)에서 분석 시작 시 결과 패널로 부드럽게 스크롤
function scrollToResults(targetId = 'results') {
  if (window.innerWidth <= 960) {
    const target = document.getElementById(targetId);
    if (target) {
      setTimeout(() => {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    }
  }
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}분 ${String(s).padStart(2, '0')}초` : `${s}초`;
}

function formatHms(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}시간 ${String(m).padStart(2, '0')}분 ${String(s).padStart(2, '0')}초`;
}

// ==================================================================
// 사용량 초과 및 전역 한도 처리
// ==================================================================

function handleQuotaExhausted(resetInSec) {
  state.quotaExhausted = true;
  state.resetRemainingSec = resetInSec || 32000;

  const banner = $('exhausted-banner');
  const modal = $('quota-modal');
  const timerText = $('quota-modal-timer');
  const resetTimer = $('exhausted-reset-timer');
  const analyzeBtn = $('analyze');

  if (banner) banner.hidden = false;
  if (analyzeBtn) {
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = '오늘 무료 한도 마감 (초기화 대기 중)';
  }

  // 모달 자동 팝업 (이미 열려있지 않은 경우)
  if (modal && typeof modal.showModal === 'function' && !modal.open) {
    try { modal.showModal(); } catch {}
  }

  if (state.resetTimer) clearInterval(state.resetTimer);
  const updateTimer = () => {
    const formatted = formatHms(state.resetRemainingSec);
    if (timerText) timerText.textContent = formatted;
    if (resetTimer) resetTimer.textContent = `내일 자정 초기화까지 약 ${formatted} 남았습니다.`;
  };
  updateTimer();

  state.resetTimer = setInterval(() => {
    state.resetRemainingSec -= 1;
    if (state.resetRemainingSec <= 0) {
      state.quotaExhausted = false;
      clearInterval(state.resetTimer);
      if (banner) banner.hidden = true;
      if (modal && modal.open) modal.close();
      refreshQuota();
    } else {
      updateTimer();
    }
  }, 1000);
}

function getCustomApiKey() {
  return state.customApiKey || $('global-apikey')?.value.trim() || $('love-global-apikey')?.value.trim() || '';
}

function syncModelOptions() {
  const hasKey = state.hasCustomKey;

  const updateSelect = (selectId, badgeId) => {
    const select = $(selectId);
    const badge = $(badgeId);
    if (!select) return;

    const currentVal = select.value;
    select.replaceChildren(
      ...state.models.map((m) => {
        const opt = el('option', { text: m.name, attrs: { value: m.id } });
        if (!hasKey && m.id !== 'deepseek/deepseek-v4-flash') {
          opt.disabled = true;
          opt.textContent = `${m.name} (개인 키 필요)`;
        }
        return opt;
      })
    );

    if (hasKey) {
      if (currentVal && state.models.some((m) => m.id === currentVal)) {
        select.value = currentVal;
      } else {
        select.value = state.models[0]?.id || 'deepseek/deepseek-v4-flash';
      }
      if (badge) {
        badge.textContent = '⚡ 개인 키 (모델 자유 선택)';
        badge.style.color = '#059669';
        badge.style.borderColor = 'rgba(16, 185, 129, 0.35)';
        badge.style.background = 'rgba(16, 185, 129, 0.15)';
      }
    } else {
      select.value = 'deepseek/deepseek-v4-flash';
      if (badge) {
        badge.textContent = '딥시크 V4.1 FLASH 고정';
        badge.style.color = '';
        badge.style.borderColor = '';
        badge.style.background = '';
      }
    }
  };

  updateSelect('model', 'mbti-model-badge');
  updateSelect('love-model', 'love-model-badge');
}

function loadCustomApiKey() {
  const saved = localStorage.getItem('scouter_custom_api_key') || '';
  state.customApiKey = saved;
  state.hasCustomKey = Boolean(saved);

  const input1 = $('global-apikey');
  const clearBtn1 = $('clear-apikey-btn');
  const input2 = $('love-global-apikey');
  const clearBtn2 = $('love-clear-apikey-btn');

  if (input1) input1.value = saved;
  if (clearBtn1) clearBtn1.hidden = !state.hasCustomKey;

  if (input2) input2.value = saved;
  if (clearBtn2) clearBtn2.hidden = !state.hasCustomKey;

  syncModelOptions();
  updateCooldownUI();
  updateLoveCooldownUI();
}

function saveCustomApiKey(explicitKey) {
  const key = (explicitKey || $('global-apikey')?.value || $('love-global-apikey')?.value || '').trim();
  if (!key) {
    showToast('저장할 AI API 키를 입력해 주세요.');
    return;
  }
  localStorage.setItem('scouter_custom_api_key', key);
  loadCustomApiKey();
  refreshQuota();
  showToast('⚡ 본인 API 키 적용 완료! 모델을 자유롭게 선택할 수 있으며 10분 쿨다운 없이 무제한 이용됩니다.');
}

function clearCustomApiKey() {
  localStorage.removeItem('scouter_custom_api_key');
  const input1 = $('global-apikey');
  const input2 = $('love-global-apikey');
  if (input1) input1.value = '';
  if (input2) input2.value = '';
  loadCustomApiKey();
  refreshQuota();
  showToast('개인 키가 해제되어 서버 무료 모드(딥시크 고정, 10분 쿨다운)로 전환되었습니다.');
}

function bindApiKeyEvents() {
  $('save-apikey-btn')?.addEventListener('click', () => saveCustomApiKey());
  $('clear-apikey-btn')?.addEventListener('click', clearCustomApiKey);
  $('global-apikey')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveCustomApiKey();
    }
  });

  $('love-save-apikey-btn')?.addEventListener('click', () => saveCustomApiKey($('love-global-apikey')?.value));
  $('love-clear-apikey-btn')?.addEventListener('click', clearCustomApiKey);
  $('love-global-apikey')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveCustomApiKey($('love-global-apikey')?.value);
    }
  });

  $('model')?.addEventListener('change', (e) => {
    if (!state.hasCustomKey) {
      e.target.value = 'deepseek/deepseek-v4-flash';
    } else {
      if ($('love-model')) $('love-model').value = e.target.value;
    }
  });

  $('love-model')?.addEventListener('change', (e) => {
    if (!state.hasCustomKey) {
      e.target.value = 'deepseek/deepseek-v4-flash';
    } else {
      if ($('model')) $('model').value = e.target.value;
    }
  });
}

function updateCooldownUI() {
  const banner = $('cooldown-banner');
  const text = $('cooldown-text');
  const btn = $('analyze');

  if (state.hasCustomKey) {
    if (banner) banner.hidden = true;
    if (btn && !state.busy) {
      btn.disabled = false;
      btn.textContent = '대화 참여자 분석하기 (무제한⚡)';
    }
    return;
  }

  if (state.quotaExhausted) return;

  if (state.cooldownRemaining > 0) {
    if (banner) banner.hidden = false;
    if (text) text.textContent = `다음 분석 가능까지 남은 시간: ${formatTime(state.cooldownRemaining)}`;
    if (btn && !state.busy) {
      btn.disabled = true;
      btn.textContent = `분석 대기 중 (${formatTime(state.cooldownRemaining)})`;
    }
  } else {
    if (banner) banner.hidden = true;
    if (btn && !state.busy) {
      btn.disabled = false;
      btn.textContent = '✨ 대화 참여자 분석하기';
    }
  }
}

function setCooldown(seconds) {
  if (state.hasCustomKey) return;
  if (!seconds || seconds <= 0) {
    state.cooldownRemaining = 0;
    if (state.cooldownTimer) {
      clearInterval(state.cooldownTimer);
      state.cooldownTimer = null;
    }
    updateCooldownUI();
    return;
  }
  state.cooldownRemaining = seconds;
  if (state.cooldownTimer) clearInterval(state.cooldownTimer);
  updateCooldownUI();

  let ticks = 0;
  state.cooldownTimer = setInterval(() => {
    state.cooldownRemaining -= 1;
    ticks += 1;
    if (ticks % 3 === 0) {
      refreshQuota();
    }
    if (state.cooldownRemaining <= 0) {
      state.cooldownRemaining = 0;
      clearInterval(state.cooldownTimer);
      state.cooldownTimer = null;
    }
    updateCooldownUI();
  }, 1000);
}

function setBusy(busy, label) {
  state.busy = busy;
  const analyzeBtn = $('analyze');

  if (state.hasCustomKey) {
    if (analyzeBtn) {
      analyzeBtn.disabled = busy;
      analyzeBtn.textContent = busy ? (label || '처리 중…') : '대화 참여자 분석하기 (무제한⚡)';
    }
    $('sample').disabled = busy;
    $('file-btn').disabled = busy;
    document.querySelectorAll('.person-pick input, #run-selected, #select-all, #select-none').forEach((node) => {
      node.disabled = busy;
    });
    return;
  }

  if (state.quotaExhausted) {
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = '오늘 무료 한도 마감 (초기화 대기 중)';
    return;
  }

  analyzeBtn.disabled = busy || state.cooldownRemaining > 0;
  $('sample').disabled = busy;
  $('file-btn').disabled = busy;

  if (busy) {
    analyzeBtn.textContent = label || '처리 중…';
  } else if (state.cooldownRemaining > 0) {
    analyzeBtn.textContent = `분석 대기 중 (${formatTime(state.cooldownRemaining)})`;
  } else {
    analyzeBtn.textContent = '✨ 대화 참여자 분석하기';
  }

  document.querySelectorAll('.person-pick input, #run-selected, #select-all, #select-none').forEach((node) => {
    node.disabled = busy;
  });
}

/* ==================================================================
   공통 블록
   ================================================================== */

function renderError(message, detail) {
  stopTimers();
  $('results-body').replaceChildren(
    el('div', { class: 'state state--error', attrs: { role: 'alert' } }, [
      el('h3', { text: '판독하지 못했습니다' }),
      el('p', { text: message }),
      detail ? el('p', { class: 'state__detail', text: detail }) : null,
    ]),
  );
}

/* ==================================================================
   1단계 — 인물 찾기
   ================================================================== */

function renderLoading(message, note) {
  stopTimers();
  const startedAt = Date.now();
  const stage = el('p', { class: 'loading__stage', text: message, attrs: { 'aria-live': 'polite' } });
  const elapsed = el('p', { class: 'loading__note', text: '경과 0초' });

  $('results-body').replaceChildren(
    el('div', { class: 'loading' }, [
      stage,
      el('div', { class: 'loading__bar' }),
      elapsed,
      note ? el('p', { class: 'loading__note', text: note }) : null,
    ]),
  );

  state.loadTimer = setInterval(() => {
    elapsed.textContent = `경과 ${Math.floor((Date.now() - startedAt) / 1000)}초`;
  }, 1000);
}

function stopTimers() {
  if (state.loadTimer) clearInterval(state.loadTimer);
  if (state.runTimer) clearInterval(state.runTimer);
  state.loadTimer = null;
  state.runTimer = null;
}

function renderEmpty() {
  $('results-body').replaceChildren(
    el('div', { class: 'state state--empty' }, [
      el('h3', { text: '아직 판독한 대화가 없습니다' }),
      el('p', {
        text: '왼쪽에 대화를 붙여넣거나 .txt 파일을 끌어다 놓고 "1단계 · 등장인물 찾기"를 누르세요.',
      }),
      el('ol', { class: 'state__steps' }, [
        el('li', {}, [el('b', { text: '1단계' }), el('span', { text: '대화에서 등장인물 목록을 뽑습니다' })]),
        el('li', {}, [el('b', { text: '2단계' }), el('span', { text: '판독할 사람을 체크합니다 (여러 명 가능)' })]),
        el('li', {}, [el('b', { text: '3단계' }), el('span', { text: '한 명씩 순서대로 판독하며 진행 상황을 보여줍니다' })]),
      ]),
      el('p', {
        class: 'state__aside',
        text: '등장인물이 많아도 한 명씩 처리하기 때문에 한 번에 몰아서 판독할 때보다 실패가 적습니다.',
      }),
    ]),
  );
}

async function findSpeakers() {
  if (state.busy) return;

  if (!state.hasCustomKey) {
    if (state.quotaExhausted) {
      handleQuotaExhausted(state.resetRemainingSec);
      return;
    }

    if (state.cooldownRemaining > 0) {
      showToast(`분석 쿨다운 대기 중입니다. ${formatTime(state.cooldownRemaining)} 후 다시 시도해 주세요. (공유로 친구가 방문하면 5분 단축됩니다!)`);
      return;
    }
  }

  const conversation = $('chat').value.trim();
  if (conversation.length < 20) {
    renderError('대화 내용이 너무 짧습니다. 최소 몇 줄 이상 붙여넣어 주세요.');
    return;
  }

  state.conversation = conversation;
  setBusy(true, '인물 찾는 중…');
  renderLoading('대화에서 등장인물을 찾는 중', '이름과 발화 수만 뽑습니다. 몇 초면 끝납니다.');
  scrollToResults('results');

  try {
    const res = await fetch('/api/speakers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        conversation,
        model: state.defaultModel || 'deepseek/deepseek-v4-flash',
        apiKey: getCustomApiKey() || undefined,
      }),
    });
    const data = await res.json();

    if (!res.ok) {
      if (data?.error?.quotaExhausted || data?.error?.code === 'global_daily_limit') {
        handleQuotaExhausted(data.error.retryAfterSec);
        renderError(data.error.message, data.error.code);
        return;
      }
      if (data?.error?.retryAfterSec && !state.hasCustomKey) {
        setCooldown(data.error.retryAfterSec);
      }
      renderError(data?.error?.message || '등장인물을 찾지 못했습니다.', data?.error?.code);
      if (res.status === 429) refreshQuota();
      return;
    }

    if (!state.hasCustomKey) {
      const cooldownSec = data.usage?.cooldownRemainingSec || data.usage?.step1CooldownSec || 600;
      setCooldown(cooldownSec);
      renderQuota(data);
    } else {
      updateCooldownUI();
    }

    state.speakerData = data;
    // 2단계 판독 대상은 최대 4명까지만 기본 선택
    const topSpeakers = (data.speakers || []).slice(0, MAX_SELECT_PERSONS);
    state.selected = new Set(topSpeakers.map((s) => s.name));
    state.status = new Map(data.speakers.map((s) => [s.name, 'pending']));
    state.errors = new Map();
    state.results = [];
    state.activeTab = null;

    if (data.speakers && data.speakers.length > MAX_SELECT_PERSONS) {
      showToast(`등장인물이 ${data.speakers.length}명 발견되어 상위 4명이 자동 선택되었습니다. (최대 4명)`);
    }

    renderQuota(data);
    stopTimers();
    renderFlow();
  } catch (err) {
    renderError('서버에 연결하지 못했습니다. 서버가 실행 중인지 확인하세요.', String(err?.message || err));
  } finally {
    setBusy(false);
  }
}

/* ==================================================================
   화면 조립
   ================================================================== */

function stepsBar() {
  const hasSpeakers = Boolean(state.speakerData);
  const running = state.running;
  const done = state.results.length > 0 && !running;

  const steps = [
    { n: 1, label: '등장인물 찾기', state: hasSpeakers ? 'done' : 'active' },
    { n: 2, label: '판독 대상 선택', state: hasSpeakers ? (running || done ? 'done' : 'active') : 'idle' },
    { n: 3, label: '한 명씩 판독', state: running ? 'active' : done ? 'done' : 'idle' },
  ];

  return el('ol', { class: 'steps' },
    steps.map((step) =>
      el('li', { class: `steps__item is-${step.state}` }, [
        el('span', { class: 'steps__num', text: String(step.n), attrs: { 'aria-hidden': 'true' } }),
        el('span', { class: 'steps__label', text: step.label }),
      ]),
    ),
  );
}

function summaryBlock(data) {
  const tags = [];
  if (data.format) tags.push(el('span', { class: 'tag', text: data.format }));
  if (data.messageCount) tags.push(el('span', { class: 'tag', text: `메시지 ${data.messageCount}개` }));
  tags.push(el('span', { class: 'tag', text: `등장인물 ${data.speakers.length}명` }));
  if (data.meta?.modelName) tags.push(el('span', { class: 'tag', text: data.meta.modelName }));

  return el('div', { class: 'conv' }, [
    el('div', { class: 'conv__head' }, [
      el('h2', { text: '대화 요약' }),
      el('div', { class: 'conv__tags' }, tags),
    ]),
    data.summary ? el('p', { class: 'conv__summary', text: data.summary }) : null,
    data.meta?.truncated
      ? el('p', { class: 'notice' }, [
          el('span', { text: '⚠', attrs: { 'aria-hidden': 'true' } }),
          el('span', { text: '대화가 길어 앞부분만 분석했습니다.' }),
        ])
      : null,
  ]);
}

function speakerBlock(data) {
  const isOverLimit = data.speakers.length > MAX_SELECT_PERSONS;
  const isAllAllowedSelected = isOverLimit
    ? state.selected.size >= MAX_SELECT_PERSONS
    : state.selected.size === data.speakers.length;

  const hasCompletedResults = Boolean(state.results && state.results.length > 0);

  const rows = data.speakers.map((speaker) => {
    const checked = state.selected.has(speaker.name);
    const input = el('input', {
      attrs: { type: 'checkbox', value: speaker.name, ...(checked ? { checked: true } : {}) },
    });
    input.checked = checked;
    if (state.busy || hasCompletedResults) input.disabled = true;

    input.addEventListener('change', () => {
      if (hasCompletedResults) return;
      if (input.checked) {
        if (state.selected.size >= MAX_SELECT_PERSONS) {
          input.checked = false;
          showToast(`최대 ${MAX_SELECT_PERSONS}명까지만 선택할 수 있습니다.`);
          return;
        }
        state.selected.add(speaker.name);
      } else {
        state.selected.delete(speaker.name);
      }
      renderFlow();
    });

    return el('label', { class: 'person-pick' + (checked ? ' is-on' : '') + (hasCompletedResults ? ' is-locked' : '') }, [
      input,
      el('span', { class: 'person-pick__name', text: speaker.name }),
      speaker.messageCount != null
        ? el('span', { class: 'person-pick__count', text: `${speaker.messageCount}개` })
        : null,
      speaker.note ? el('span', { class: 'person-pick__note', text: speaker.note }) : null,
      speaker.aliases.length
        ? el('span', { class: 'person-pick__alias', text: `= ${speaker.aliases.join(', ')}` })
        : null,
    ]);
  });

  let selectBtnText = '';
  if (state.selected.size > 0) {
    selectBtnText = '선택 해제';
  } else {
    selectBtnText = isOverLimit ? `상위 ${MAX_SELECT_PERSONS}명 선택` : '전체 선택';
  }

  const selectAll = el('button', {
    class: 'btn btn--ghost btn--sm',
    text: selectBtnText,
    attrs: { type: 'button', id: 'select-all' },
  });
  selectAll.disabled = state.busy || hasCompletedResults;
  selectAll.addEventListener('click', () => {
    if (hasCompletedResults) return;
    if (state.selected.size > 0) {
      state.selected = new Set();
    } else {
      const toPick = data.speakers.slice(0, MAX_SELECT_PERSONS);
      state.selected = new Set(toPick.map((s) => s.name));
    }
    renderFlow();
  });

  const start = el('button', {
    class: 'btn btn--primary btn--sm',
    text: hasCompletedResults ? '✅ 판독 완료됨' : `선택한 ${state.selected.size}명 판독 시작`,
    attrs: { type: 'button', id: 'run-selected' },
  });
  start.disabled = state.selected.size === 0 || state.busy || hasCompletedResults;
  if (!hasCompletedResults) {
    start.addEventListener('click', runSelected);
  }

  return el('section', { class: 'pick' }, [
    el('div', { class: 'pick__head' }, [
      el('div', { class: 'pick__title-wrap', style: 'display:flex; align-items:center; gap:8px;' }, [
        el('h3', { class: 'section-title', text: `2단계 · 판독할 사람 선택 (${data.speakers.length}명 발견)` }),
        el('span', { class: 'badge-limit', text: `최대 ${MAX_SELECT_PERSONS}명` }),
      ]),
      el('div', { class: 'pick__actions' }, [selectAll, start]),
    ]),
    el('div', { class: 'pick__list' }, rows),
    el('p', {
      class: 'field__hint',
      text: `체크한 사람만 한 명씩 순서대로 판독합니다. (최대 ${MAX_SELECT_PERSONS}명까지 선택 가능)`,
    }),
  ]);
}

function progressBlock() {
  if (!state.speakerData) return null;
  if (!state.running && state.results.length === 0 && state.errors.size === 0) return null;

  const targets = state.speakerData.speakers.filter((s) => state.status.get(s.name) !== 'pending' || state.selected.has(s.name));
  if (!targets.length) return null;

  const doneCount = targets.filter((s) => state.status.get(s.name) === 'done').length;
  const currentIndex = targets.findIndex((s) => state.status.get(s.name) === 'running');
  const current = currentIndex >= 0 ? targets[currentIndex] : null;

  const headText = state.running
    ? current
      ? `${targets.length}명 중 ${currentIndex + 1}번째 · ${current.name} 판독 중`
      : '준비 중'
    : `판독 완료 · 성공 ${doneCount}명${state.errors.size ? ` · 실패 ${state.errors.size}명` : ''}`;

  const items = targets.map((speaker) => {
    const status = STATUS[state.status.get(speaker.name) || 'pending'];
    const result = state.results.find((r) => r.name === speaker.name);
    const error = state.errors.get(speaker.name);

    return el('li', { class: `progress__item is-${status.key}` }, [
      el('span', { class: 'progress__glyph', text: status.glyph, attrs: { 'aria-hidden': 'true' } }),
      el('span', { class: 'progress__name', text: speaker.name }),
      el('span', { class: 'progress__status', text: status.label, attrs: { 'aria-hidden': 'true' } }),
      result ? el('span', { class: 'progress__type', text: result.type }) : null,
      error ? el('span', { class: 'progress__error', text: error }) : null,
    ]);
  });

  return el('section', { class: 'progress' }, [
    el('div', { class: 'progress__head' }, [
      el('h3', { class: 'section-title', text: '3단계 · 판독 진행' }),
      el('span', { class: 'progress__meta', attrs: { id: 'progress-elapsed' }, text: '' }),
    ]),
    el('p', { class: 'progress__caption', text: headText, attrs: { 'aria-live': 'polite' } }),
    el('ul', { class: 'progress__list' }, items),
  ]);
}

/* ==================================================================
   결과 표시
   ================================================================== */

function legend() {
  const items = [
    ['high', '확실', '70% 이상'],
    ['mid', '보통', '50~69%'],
    ['low', '약함', '25~49%'],
    ['none', '판단 불가', '25% 미만'],
  ];
  return el('div', { class: 'legend', attrs: { 'aria-label': '신뢰도 색상 범례' } },
    items.map(([key, label, range]) =>
      el('span', { class: 'legend__item band-' + key }, [
        el('span', { class: 'dot dot--' + key, attrs: { 'aria-hidden': 'true' } }),
        el('b', { text: label }),
        el('span', { text: range }),
      ]),
    ),
  );
}

function typeLine(person) {
  return el('div', { class: 'typeline', attrs: { 'aria-label': `추정 유형 ${person.type}` } },
    person.axes.map((axis) => {
      const band = bandFor(axis.confidence, axis.estimable);
      return el('span', {
        class: `letter band-${band.key}` + (axis.estimable ? '' : ' letter--unknown'),
        text: axis.estimable ? axis.pole : '?',
        attrs: { 'aria-hidden': 'true' },
      });
    }),
  );
}

function metricsBlock(person) {
  const band = bandFor(person.overallConfidence, person.estimableCount > 0);
  const sufficiencyBand = bandFor(person.dataSufficiency, true);

  return el('div', { class: 'metrics' }, [
    el('div', { class: `metric band-${band.key}` }, [
      el('span', { class: 'metric__label', text: '종합 신뢰도' }),
      el('span', { class: 'metric__value', text: `${person.overallConfidence}%` }),
      bandPill(band, person.estimableCount ? `${band.label} · ${person.estimableCount}/4 축 판정` : '판정된 축 없음'),
    ]),
    el('div', { class: `metric band-${sufficiencyBand.key}` }, [
      el('span', { class: 'metric__label', text: '데이터 충분도' }),
      el('span', { class: 'metric__value', text: `${person.dataSufficiency}%` }),
      el('div', {
        class: 'meter',
        attrs: { role: 'img', 'aria-label': `데이터 충분도 ${person.dataSufficiency}퍼센트` },
      }, [el('span', { attrs: { style: `width:${person.dataSufficiency}%` } })]),
      el('span', {
        class: 'metric__note',
        text: person.dataShortfall > 0 ? `판단에 약 ${person.dataShortfall}% 부족` : '판단에 충분한 데이터',
      }),
    ]),
    el('div', { class: 'metric' }, [
      el('span', { class: 'metric__label', text: '메시지 수' }),
      el('span', { class: 'metric__value', text: person.messageCount != null ? String(person.messageCount) : '—' }),
      el('span', { class: 'metric__note', text: `판정 기준 신뢰도 ${person.axisThreshold}%` }),
    ]),
  ]);
}

function axisCard(axis, threshold) {
  const band = bandFor(axis.confidence, axis.estimable);
  const chosenLeft = axis.pole === axis.left;
  const halfWidth = axis.estimable ? Math.round((axis.confidence / 100) * 50) : 0;

  const badgeText = axis.estimable
    ? `${band.label} · ${axis.confidence}%`
    : band.key === 'none'
      ? '판단 불가'
      : `약함 · 판단까지 약 ${Math.max(1, Math.round(((threshold - axis.confidence) / threshold) * 100))}% 부족`;

  const evidence = axis.evidence.length
    ? el('ul', { class: 'evidence', attrs: { 'aria-label': '판단 근거 발화' } }, [
        el('li', { class: 'evidence__head' }, [el('span', { class: 'evidence__label', text: '근거 발화' })]),
        ...axis.evidence.map((quote) => el('li', { text: `“${quote}”` })),
      ])
    : null;

  return el('article', { class: `axis band-${band.key}` + (axis.estimable ? '' : ' axis--unknown') }, [
    el('div', { class: 'axis__head' }, [
      el('h4', { class: 'axis__title' }, [
        el('span', { text: `${axis.leftLabel} ` }),
        el('span', { text: `${axis.left} ↔ ${axis.right}` }),
        el('span', { text: ` ${axis.rightLabel}` }),
      ]),
      bandPill(band, badgeText),
    ]),
    el('div', { class: 'axis__scale', attrs: { 'aria-hidden': 'true' } }, [
      el('span', { class: 'pole' + (chosenLeft && axis.estimable ? ' pole--on' : ''), text: axis.left }),
      el('div', { class: 'track' }, [
        el('div', { class: 'half half--l' }, [
          el('span', { class: 'fill', attrs: { style: `width:${chosenLeft ? halfWidth : 0}%` } }),
        ]),
        el('div', { class: 'half half--r' }, [
          el('span', { class: 'fill', attrs: { style: `width:${!chosenLeft && axis.estimable ? halfWidth : 0}%` } }),
        ]),
      ]),
      el('span', { class: 'pole' + (!chosenLeft && axis.estimable ? ' pole--on' : ''), text: axis.right }),
    ]),
    el('p', {
      class: 'axis__verdict',
      text: axis.estimable
        ? `${axis.pole} (${chosenLeft ? axis.leftLabel : axis.rightLabel}) 쪽으로 판단 · 신뢰도 ${axis.confidence}%`
        : '이 축은 판단을 보류했습니다.',
    }),
    axis.reasoning ? el('p', { class: 'axis__reason', text: axis.reasoning }) : null,
    evidence,
    axis.dataNote
      ? el('p', { class: 'axis__note' }, [
          el('strong', { text: axis.estimable ? '참고: ' : '더 필요한 것: ' }),
          el('span', { text: axis.dataNote }),
        ])
      : null,
  ]);
}

/* ==================================================================
   공유 기능 (카카오톡 / 클립보드 / Web Share API / 친구 초대 어드밴티지)
   ================================================================== */

function compactMbtiData(shareData) {
  return {
    t: 'm',
    tt: shareData.title,
    s: shareData.singlePerson,
    sp: (shareData.results || []).map((r) => ({
      n: r.name,
      tp: r.type,
      c: r.overallConfidence,
      ds: r.dataSufficiency,
      sm: r.summary,
      ax: (r.axes || []).map((a) => ({
        ax: a.axis,
        p: a.pole,
        c: a.confidence,
        e: a.estimable,
        ev: (a.evidence || []).slice(0, 2),
        r: a.reasoning,
      })),
      tr: r.traits || [],
      cv: r.caveats || '',
    })),
  };
}

function uncompactMbtiData(c) {
  const results = (c.sp || []).map((r) => ({
    name: r.n,
    type: r.tp,
    overallConfidence: r.c,
    dataSufficiency: r.ds || 60,
    summary: r.sm,
    axes: (r.ax || []).map((a) => ({
      axis: a.ax,
      pole: a.p,
      confidence: a.c,
      estimable: a.e,
      evidence: a.ev || [],
      reasoning: a.r || '',
    })),
    traits: r.tr || [],
    caveats: r.cv || '',
  }));
  return {
    type: 'mbti',
    title: c.tt || '대화 참여자 MBTI 분석 결과',
    singlePerson: c.s,
    results,
    speakerData: {
      speakers: results.map((r) => ({ name: r.name, lines: 10 })),
      summary: c.tt,
    },
  };
}

function compactLoveData(shareData) {
  return {
    t: 'l',
    tt: shareData.title,
    d: shareData.data,
  };
}

function uncompactLoveData(c) {
  return {
    type: 'love',
    title: c.tt || '1:1 애정도 분석 결과',
    data: c.d,
  };
}

function encodeShareData(shareData) {
  try {
    const compact = shareData.type === 'love' ? compactLoveData(shareData) : compactMbtiData(shareData);
    const json = JSON.stringify(compact);
    const bytes = new TextEncoder().encode(json);
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch (e) {
    console.warn('Failed to encode shareData', e);
    return '';
  }
}

function decodeShareData(encoded) {
  try {
    const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const json = new TextDecoder('utf-8').decode(bytes);
    const parsed = JSON.parse(json);
    if (parsed.t === 'l') return uncompactLoveData(parsed);
    if (parsed.t === 'm') return uncompactMbtiData(parsed);
    return parsed;
  } catch (e) {
    console.warn('Failed to decode shareData', e);
    return null;
  }
}

async function getReferralUrl(shareData = null) {
  const base = window.location.origin || `${window.location.protocol}//${window.location.host}`;
  let code = '';
  try {
    const res = await fetch('/api/referral/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shareData }),
    });
    const data = await res.json();
    if (data?.ok && data.code) {
      code = data.code;
    }
  } catch (err) {
    console.warn('Failed to get referral code', err);
  }

  const url = code ? `${base}/?ref=${code}` : base;
  return url;
}

async function shareResult(person = null) {
  const isSingle = Boolean(person);
  const title = isSingle
    ? `[톡스캐너] ${person.name}님의 MBTI 분석 결과`
    : `[톡스캐너] 대화 참여자 MBTI 성향 분석 결과`;

  const shareData = {
    type: 'mbti',
    title,
    speakerData: state.speakerData,
    results: isSingle ? [person] : state.results,
    singlePerson: isSingle ? person.name : null,
  };

  // 추천인 코드가 포함된 URL 발급 (분석 결과 데이터 저장)
  const url = await getReferralUrl(shareData);
  const bonusNotice = `\n🎁 [친구 초대 혜택] 이 링크로 방문하면 대기 시간이 5분 단축됩니다!\n${url}`;

  let text = '';
  if (isSingle) {
    text = `[톡스캐너 · MBTI 분석 결과]\n✨ ${person.name}님의 MBTI: ${person.type}\n📊 종합 신뢰도: ${person.overallConfidence}%\n${person.summary ? `💬 "${person.summary}"\n` : ''}\n🔎 대화로 보는 우리들의 성향 분석하기:${bonusNotice}`;
  } else {
    const summaryLines = (state.results || [])
      .map((r) => `⚡ ${r.name}: ${r.type} (${r.overallConfidence}%)`)
      .join('\n');
    text = `[톡스캐너 · 대화 분석 결과]\n참여자 성향 분석 (${(state.results || []).length}명):\n${summaryLines}\n\n🔎 우리 대화방 MBTI 측정해보기:${bonusNotice}`;
  }

  // 1. Web Share API (모바일 브라우저 카톡/메시지/SNS 연동)
  if (navigator.share && typeof navigator.share === 'function') {
    try {
      await navigator.share({
        title,
        text,
        url,
      });
      showToast('공유 창이 열렸습니다. (친구가 방문하면 5분 단축!)');
      return;
    } catch (err) {
      if (err?.name === 'AbortError') return;
      console.warn('Web Share fallback to clipboard', err);
    }
  }

  // 2. 데스크톱 및 모바일 클립보드 복사
  const copied = await copyToClipboard(text, '아래 분석 결과를 복사하여 카카오톡에 공유하세요:');
  if (copied) {
    showToast('📋 초대 링크가 포함된 분석 결과가 복사되었습니다! 카톡에 공유하여 5분 단축 혜택을 받으세요.');
  } else {
    showToast('결과 복사에 실패했습니다.');
  }
}

function personPanel(person, index) {
  const shareBtn = el('button', {
    class: 'btn btn--ghost btn--sm btn--share',
    attrs: { type: 'button', title: '카카오톡이나 SNS에 이 결과 공유' },
  }, [
    el('span', { text: '💬', attrs: { 'aria-hidden': 'true' } }),
    el('span', { text: `${person.name} 결과 카톡/공유` }),
  ]);
  shareBtn.addEventListener('click', () => shareResult(person));

  const headTop = el('div', { class: 'person__head-bar' }, [
    typeLine(person),
    shareBtn,
  ]);

  const children = [
    el('header', { class: 'person__head' }, [
      headTop,
      el('div', { class: 'person__verdict' }, [
        person.summary ? el('p', { class: 'person__summary', text: person.summary }) : null,
        person.aliases.length
          ? el('p', { class: 'person__alias', text: `같은 사람으로 묶인 표기: ${person.aliases.join(', ')}` })
          : null,
        person.traits.length
          ? el('div', { class: 'chips' }, person.traits.map((t) => el('span', { class: 'chip', text: t })))
          : null,
      ]),
    ]),
    metricsBlock(person),
    legend(),
  ];

  if (person.estimableCount === 0) {
    children.push(
      el('p', { class: 'notice' }, [
        el('span', { text: '⚠', attrs: { 'aria-hidden': 'true' } }),
        el('span', { text: '근거가 부족해 어떤 축도 확정하지 못했습니다. 대화를 더 넣으면 판정됩니다.' }),
      ]),
    );
  }

  children.push(
    el('h3', { class: 'section-title', text: '4개 축 판정' }),
    el('div', { class: 'axes' }, person.axes.map((axis) => axisCard(axis, person.axisThreshold))),
  );

  if (person.analysis) {
    children.push(el('h3', { class: 'section-title', text: '종합 분석' }));
    children.push(el('div', { class: 'prose' }, paragraphs(person.analysis)));
  }

  if (person.caveats) {
    children.push(
      el('div', { class: 'caveat' }, [
        el('strong', { text: '해석 주의 · ' }),
        el('span', { text: person.caveats }),
      ]),
    );
  }

  return el('article', {
    class: 'person',
    attrs: { role: 'tabpanel', id: `panel-${index}`, 'aria-labelledby': `tab-${index}`, tabindex: '0' },
  }, children);
}

function activateTab(index) {
  const tabs = [...document.querySelectorAll('.tab')];
  const panels = [...document.querySelectorAll('.person')];
  tabs.forEach((tab, i) => {
    const on = i === index;
    tab.setAttribute('aria-selected', on ? 'true' : 'false');
    tab.tabIndex = on ? 0 : -1;
  });
  panels.forEach((panel, i) => { panel.hidden = i !== index; });
  if (state.results[index]) state.activeTab = state.results[index].name;
}

function resultsBlock() {
  const activeIndex = Math.max(0, state.results.findIndex((r) => r.name === state.activeTab));

  const list = el('div', { class: 'tabs', attrs: { role: 'tablist', 'aria-label': '판독 결과 탭' } },
    state.results.map((person, i) => {
      const band = bandFor(person.overallConfidence, person.estimableCount > 0);
      return el('button', {
        class: 'tab',
        attrs: {
          type: 'button',
          role: 'tab',
          id: `tab-${i}`,
          'aria-controls': `panel-${i}`,
          'aria-selected': i === activeIndex ? 'true' : 'false',
          tabindex: i === activeIndex ? '0' : '-1',
        },
      }, [
        el('span', { class: 'tab__name', text: person.name }),
        el('span', { class: 'tab__type', text: person.type }),
        el('span', { class: `dot dot--${band.key}`, attrs: { 'aria-hidden': 'true' } }),
      ]);
    }),
  );

  list.addEventListener('click', (event) => {
    const tab = event.target.closest('.tab');
    if (!tab) return;
    activateTab([...list.children].indexOf(tab));
  });

  list.addEventListener('keydown', (event) => {
    const count = list.children.length;
    const current = [...list.children].indexOf(document.activeElement);
    if (current < 0) return;

    let next = null;
    if (event.key === 'ArrowRight') next = (current + 1) % count;
    else if (event.key === 'ArrowLeft') next = (current - 1 + count) % count;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = count - 1;
    if (next == null) return;

    event.preventDefault();
    activateTab(next);
  });

  const panels = el('div', { class: 'panels' },
    state.results.map((person, i) => {
      const panel = personPanel(person, i);
      if (i !== activeIndex) panel.hidden = true;
      return panel;
    }),
  );

  const shareAllBtn = el('button', {
    class: 'btn btn--ghost btn--sm btn--share',
    attrs: { type: 'button', title: '전체 판독 결과 카톡/링크 공유' },
  }, [
    el('span', { text: '🔗', attrs: { 'aria-hidden': 'true' } }),
    el('span', { text: '전체 결과 공유하기' }),
  ]);
  shareAllBtn.addEventListener('click', () => shareResult(null));

  const head = el('div', { class: 'results__head' }, [
    el('h3', { class: 'section-title', text: `판독 결과 (${state.results.length}명)` }),
    shareAllBtn,
  ]);

  return el('section', { class: 'results' }, [
    head,
    list,
    panels,
  ]);
}

function renderFlow() {
  if (!state.speakerData) {
    renderEmpty();
    return;
  }

  const container = el('div', { class: 'flow' }, [
    stepsBar(),
    summaryBlock(state.speakerData),
    speakerBlock(state.speakerData),
    progressBlock(),
    state.results.length ? resultsBlock() : null,
  ]);

  $('results-body').replaceChildren(container);
}

/* ==================================================================
   순차 판독
   ================================================================== */

async function runSelected() {
  if (state.busy || !state.speakerData || (state.results && state.results.length > 0)) return;

  const targets = state.speakerData.speakers.filter((s) => state.selected.has(s.name));
  if (!targets.length) return;

  state.running = true;
  state.results = [];
  state.errors = new Map();
  state.activeTab = null;
  for (const speaker of state.speakerData.speakers) state.status.set(speaker.name, 'pending');

  setBusy(true, '판독 중…');
  scrollToResults('results');
  state.runStartedAt = Date.now();
  if (state.runTimer) clearInterval(state.runTimer);
  state.runTimer = setInterval(() => {
    const node = $('progress-elapsed');
    if (node) node.textContent = `경과 ${Math.floor((Date.now() - state.runStartedAt) / 1000)}초`;
  }, 1000);

  let quotaBlocked = false;

  try {
    for (const speaker of targets) {
      state.status.set(speaker.name, 'running');
      renderFlow();

      try {
        const res = await fetch('/api/analyze-person', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversation: state.conversation,
            person: { name: speaker.name, aliases: speaker.aliases },
            model: state.defaultModel || 'deepseek/deepseek-v4-flash',
            apiKey: getCustomApiKey() || undefined,
          }),
        });
        const data = await res.json();

        if (!res.ok) {
          state.status.set(speaker.name, 'error');
          state.errors.set(speaker.name, data?.error?.message || `실패 (HTTP ${res.status})`);
          if (res.status === 429) {
            quotaBlocked = true;
            break;
          }
        } else {
          state.results.push(data);
          state.status.set(speaker.name, 'done');
          if (!state.activeTab || state.activeTab === speaker.name) state.activeTab = data.name;
          renderQuota(data);
        }
      } catch (err) {
        state.status.set(speaker.name, 'error');
        state.errors.set(speaker.name, String(err?.message || err));
      }

      renderFlow();
    }
  } finally {
    state.running = false;
    if (state.runTimer) clearInterval(state.runTimer);
    state.runTimer = null;
    setBusy(false);
    if (quotaBlocked) await refreshQuota();
    renderFlow();
  }
}

/* ==================================================================
   입력
   ================================================================== */

function updateCount() {
  $('chat-count').textContent = `${$('chat').value.length.toLocaleString('ko-KR')}자`;
}

const MAX_FILE_BYTES = 5 * 1024 * 1024;

async function decodeFile(file) {
  const buffer = await file.arrayBuffer();
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(buffer);
  } catch {
    try {
      return new TextDecoder('euc-kr', { fatal: true }).decode(buffer);
    } catch {
      return new TextDecoder('utf-8').decode(buffer);
    }
  }
}

function setFileInfo(message, isError) {
  const info = $('file-info');
  info.textContent = message;
  info.hidden = false;
  info.classList.toggle('is-error', Boolean(isError));
}

async function loadFile(file) {
  if (!file) return;

  if (file.size > MAX_FILE_BYTES) {
    setFileInfo(`파일이 너무 큽니다 (${(file.size / 1024 / 1024).toFixed(1)}MB). 5MB 이하만 됩니다.`, true);
    return;
  }

  try {
    const text = await decodeFile(file);
    $('chat').value = text;
    updateCount();
    setFileInfo(`${file.name} · ${(file.size / 1024).toFixed(1)}KB 불러옴`, false);
  } catch (err) {
    setFileInfo('파일을 읽지 못했습니다.', true);
    console.error(err);
  }
}

function bindDropzone() {
  const zone = $('dropzone');
  const input = $('file');

  const swallow = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  ['dragenter', 'dragover'].forEach((type) =>
    zone.addEventListener(type, (event) => {
      swallow(event);
      zone.classList.add('is-dragover');
    }),
  );

  zone.addEventListener('dragleave', (event) => {
    swallow(event);
    if (event.relatedTarget && zone.contains(event.relatedTarget)) return;
    zone.classList.remove('is-dragover');
  });

  zone.addEventListener('drop', (event) => {
    swallow(event);
    zone.classList.remove('is-dragover');
    const file = event.dataTransfer?.files?.[0];
    if (file) loadFile(file);
  });

  $('file-btn').addEventListener('click', () => input.click());

  input.addEventListener('change', () => {
    const file = input.files?.[0];
    if (file) loadFile(file);
    input.value = '';
  });

  ['dragover', 'drop'].forEach((type) => window.addEventListener(type, (event) => event.preventDefault()));
}

function renderQuota(payload) {
  const node = $('quota');
  if (!node) return;
  const usage = payload?.usage || {};

  // 전체 일일 한도 소진 감지 시 즉시 팝업 및 화면 차단
  if (usage.quotaExhausted || (usage.globalRemaining != null && usage.globalRemaining <= 0)) {
    handleQuotaExhausted(usage.globalResetInSec);
    return;
  }

  // 쿨다운 복원: 서버 DB 쿨다운 복원 (새로고침 시에도 서버 DB 값 기반 유지)
  const serverMbtiCd = usage.cooldownRemainingSec || 0;
  if (serverMbtiCd > 0 && !state.cooldownTimer) {
    setCooldown(serverMbtiCd);
  }

  const serverLoveCd = usage.loveCooldownRemainingSec || 0;
  if (serverLoveCd > 0 && !state.loveCooldownTimer) {
    setLoveCooldown(serverLoveCd);
  }

  node.hidden = false;
  const dailyLimit = usage.dailyLimit ?? 10;
  const dailyRemaining = usage.dailyRemaining != null ? usage.dailyRemaining : Math.max(0, dailyLimit - (usage.runsToday || 0));

  let message = '';
  if (state.hasCustomKey) {
    message = ' · ⚡ 개인 API 키 적용 중 (무제한 이용 가능)';
    node.classList.remove('is-out', 'is-low');
  } else if (dailyRemaining <= 0) {
    message = ` · 오늘 무료 분석 한도(${dailyLimit}회)를 모두 사용하셨습니다 (내일 자정 초기화)`;
    node.classList.add('is-out');
    node.classList.remove('is-low');
    const analyzeBtn = $('analyze');
    const loveBtn = $('analyze-love');
    if (analyzeBtn && !state.busy) {
      analyzeBtn.disabled = true;
      analyzeBtn.textContent = '오늘 무료 한도 마감 (내일 자정 초기화)';
    }
    if (loveBtn && !state.loveBusy) {
      loveBtn.disabled = true;
      loveBtn.textContent = '오늘 무료 한도 마감 (내일 자정 초기화)';
    }
  } else {
    message = ` · 오늘 남은 횟수: ${dailyRemaining}회 / ${dailyLimit}회 (10분 쿨다운)`;
    node.classList.toggle('is-low', dailyRemaining <= 2);
    node.classList.remove('is-out');
  }

  const mainLine = el('div', { class: 'quota__main' }, [
    el('strong', { text: '무료 한도' }),
    el('span', { text: message }),
  ]);

  const children = [mainLine];

  if (!state.hasCustomKey && usage.hasReferralBonus) {
    children.push(
      el('div', { class: 'quota__bonus' }, [
        el('span', { text: '⚡ 친구 초대 쿨다운 5분 단축 적용 중' }),
      ]),
    );
  }

  node.replaceChildren(...children);
}

async function refreshQuota() {
  try {
    const res = await fetch('/api/usage');
    if (!res.ok) return;
    const data = await res.json();
    renderQuota(data);

    if (data?.usage) {
      const serverCooldown = data.usage.cooldownRemainingSec || 0;
      const serverLoveCooldown = data.usage.loveCooldownRemainingSec || 0;

      if (state.cooldownRemaining > serverCooldown) {
        const diff = state.cooldownRemaining - serverCooldown;
        state.cooldownRemaining = serverCooldown;
        if (diff >= 180) {
          showToast('⚡ 친구 초대 방문으로 대기 시간이 5분 단축되었습니다!');
        }
        updateCooldownUI();
      }

      if (state.loveCooldownRemaining > serverLoveCooldown) {
        const diff = state.loveCooldownRemaining - serverLoveCooldown;
        state.loveCooldownRemaining = serverLoveCooldown;
        if (diff >= 180) {
          showToast('⚡ 친구 초대 방문으로 애정 분석 대기 시간이 5분 단축되었습니다!');
        }
        updateLoveCooldownUI();
      }
    }
  } catch {
    /* 한도 표시는 실패해도 로컬 상태로 유지 */
    renderQuota(null);
  }
}

async function copyInviteLink() {
  try {
    let shareData = null;
    if (state.currentMode === 'love' && state.loveData) {
      shareData = {
        type: 'love',
        title: '1:1 애정도 분석 결과',
        data: state.loveData,
      };
    } else if (state.currentMode === 'mbti' && state.results && state.results.length) {
      shareData = {
        type: 'mbti',
        title: '톡방 참여자 MBTI 판독 결과',
        speakerData: state.speakerData,
        results: state.results,
        singlePerson: state.activeTab,
      };
    }

    const res = await fetch('/api/referral/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shareData }),
    });
    const data = await res.json();
    const code = data?.code || '';
    const base = window.location.origin || `${window.location.protocol}//${window.location.host}`;
    const url = code ? `${base}/?ref=${code}` : base;
    const shareText = shareData
      ? `[톡스캐너] ${shareData.title}를 확인해 보세요! (접속 시 대기 5분 단축 ⚡)\n${url}`
      : `[톡스캐너] 이 링크로 접속하면 대기 시간이 5분 단축됩니다! ⚡\n${url}`;

    const copied = await copyToClipboard(shareText, '아래 초대 링크를 복사하여 친구에게 전달하세요:');
    if (copied) {
      showToast('🎉 5분 단축 초대 링크가 복사되었습니다! 친구에게 보내거나 새 탭에서 열면 즉시 5분이 단축됩니다. ⚡');
    } else {
      showToast('초대 링크 복사에 실패했습니다.');
    }
  } catch {
    showToast('초대 링크 생성 중 오류가 발생했습니다.');
  }
}

function clearSharedView() {
  window.history.replaceState({}, '', window.location.pathname);
  if (state.currentMode === 'love') {
    renderLoveEmpty();
  } else {
    state.speakerData = null;
    state.results = [];
    renderEmpty();
  }
  showToast('새로운 대화 분석을 시작하세요!');
}

function renderSharedResult(shareData) {
  if (!shareData) return;

  if (shareData.type === 'love' && shareData.data) {
    switchMode('love');
    renderLoveResults(shareData.data, true /* isShared */);
    showToast('💌 친구가 공유한 1:1 애정 분석 결과가 로드되었습니다.');
  } else if (shareData.type === 'mbti') {
    switchMode('mbti');
    renderSharedMbti(shareData);
    showToast('💬 친구가 공유한 톡방 MBTI 분석 결과가 로드되었습니다.');
  }
}

function renderSharedMbti(shareData) {
  state.speakerData = shareData.speakerData || {
    speakers: (shareData.results || []).map((r) => ({ name: r.name, lines: 10 })),
    summary: shareData.title || '대화 참여자 MBTI 분석 결과',
  };
  state.results = shareData.results || [];
  state.running = false;
  if (shareData.singlePerson) {
    state.activeTab = shareData.singlePerson;
  } else if (state.results.length) {
    state.activeTab = state.results[0].name;
  }
  renderFlow();
  const body = $('results-body');
  if (!body) return;

  const newBtn = el('button', {
    class: 'btn btn--primary btn--sm',
    attrs: { type: 'button' },
    text: '나도 새 대화 분석하기',
  });
  newBtn.addEventListener('click', () => clearSharedView());

  const banner = el('div', { class: 'shared-result-banner' }, [
    el('div', { class: 'shared-result-banner__content' }, [
      el('span', { class: 'shared-result-banner__icon', text: '💬' }),
      el('div', {}, [
        el('strong', { text: '친구가 공유한 톡방 MBTI 분석 결과입니다' }),
        el('p', { text: '참여자들의 4축 MBTI 성향 분석 결과입니다. (초대 혜택 5분 단축 적용됨 ⚡)' }),
      ]),
    ]),
    newBtn,
  ]);
  body.prepend(banner);
}

// 단순 친구 초대 링크로 접속했을 때 상단 안내 배너 표시
function renderInviteWelcomeBanner() {
  const container = document.querySelector('.views-container');
  if (!container || document.getElementById('invite-welcome-banner')) return;

  const banner = el('div', {
    class: 'shared-result-banner',
    attrs: { id: 'invite-welcome-banner', style: 'margin: 12px 14px 0;' },
  }, [
    el('div', { class: 'shared-result-banner__content' }, [
      el('span', { class: 'shared-result-banner__icon', text: '🎁' }),
      el('div', {}, [
        el('strong', { text: '친구 초대 링크로 접속하셨습니다!' }),
        el('p', { text: '분석 대기 시간 5분 단축 혜택이 적용되었습니다. 아래에 대화를 입력하고 무료 분석을 시작해 보세요! ⚡' }),
      ]),
    ]),
  ]);
  container.prepend(banner);
}

async function checkReferralParam() {
  const params = new URLSearchParams(window.location.search);
  const ref = params.get('ref');
  const d = params.get('d');

  let resolvedShareData = null;

  // 1. URL 자체에 포함된 인코딩 데이터가 있으면 즉시 복원 (서버리스 인스턴스 무관하게 100% 보장)
  if (d) {
    resolvedShareData = decodeShareData(d);
  }

  // 2. 서버에 방문 기록 및 쿨다운 단축(5분) 적용 요청
  if (ref) {
    try {
      const res = await fetch('/api/referral/visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refCode: ref }),
      });
      const data = await res.json();
      if (data?.ok) {
        if (data.rewardApplied) {
          showToast('🎉 친구 초대로 접속하셨습니다! 분석 쿨다운 5분 단축 혜택이 적용되었습니다. ⚡');
          refreshQuota();
        } else if (data.isSelf) {
          showToast('ℹ️ 본인 IP 초대 링크로 접속하셨습니다. (친구가 다른 기기/IP에서 접속해야 5분 단축이 적용됩니다)');
        }
      }
      if (!resolvedShareData && data?.shareData) {
        resolvedShareData = data.shareData;
      }
    } catch (err) {
      console.warn('Referral check error', err);
    }
  }

  // 3. 복원된 공유 결과가 있으면 화면에 렌더링하고 모바일 화면에서도 결과창으로 스크롤!
  if (resolvedShareData) {
    renderSharedResult(resolvedShareData);
    if (resolvedShareData.type === 'love') {
      scrollToResults('love-results');
    } else {
      scrollToResults('results');
    }
  } else if (ref && !d) {
    // 결과 데이터가 없는 단순 친구 초대 링크로 들어왔을 때 환영 배너 표시
    renderInviteWelcomeBanner();
  }
}

async function loadModels() {
  try {
    const res = await fetch('/api/models');
    const data = await res.json();
    state.models = data.models || [];
    state.defaultModel = data.defaultModel || '';
    state.hasServerKey = Boolean(data.hasServerKey);

    syncModelOptions();
  } catch {
    $('model')?.replaceChildren(el('option', { text: '모델 목록을 불러오지 못했습니다' }));
    $('love-model')?.replaceChildren(el('option', { text: '모델 목록을 불러오지 못했습니다' }));
  }
}

/* ==================================================================
   이용안내, 개인정보처리방침 및 안내 팝업
   ================================================================== */

const LEGAL_TEXTS = {
  terms: {
    title: '서비스 이용안내 (Terms of Service)',
    html: `
      <h4>제1조 (목적)</h4>
      <p>본 약관은 '톡스캐너'(이하 '서비스')가 제공하는 인공지능 기반 대화 성향(MBTI) 및 1:1 애정도 분석 서비스의 이용 조건, 절차 및 기본 운영 방침을 규정함을 목적으로 합니다.</p>

      <h4>제2조 (서비스의 본질 및 한계 안내)</h4>
      <ul>
        <li>본 서비스는 이용자가 입력한 대화 텍스트의 발화 패턴, 말투, 반응 양식을 대형 언어 모델(LLM)을 통해 통계적으로 추론한 추정치입니다.</li>
        <li><strong>본 결과는 학술적·의학적으로 공인된 정식 MBTI 심리 검사나 전문 연애 심리 평가가 아니며</strong>, 일상 대화의 재미와 친목 도모를 위한 오락성 콘텐츠입니다.</li>
        <li>분석 결과를 타인에 대한 평가, 인사 평가, 법적 판단 등의 결정적인 근거로 활용할 수 없으며, 이로 인해 발생한 직간접적 문제에 대해 서비스 제공자는 법적 책임을 지지 않습니다.</li>
      </ul>

      <h4>제3조 (공정한 자원 이용 및 제한 규칙)</h4>
      <ul>
        <li><strong>10분 쿨다운 규칙:</strong> 고성능 유료 AI API 자원의 특정인 독점 및 남용을 방지하기 위해, <strong>톡방 MBTI 1단계(등장인물 찾기) 및 1:1 애정 분석은 각각 IP당 10분에 1번</strong>으로 호출이 제한됩니다. (단, 친구 초대 링크로 다른 사람이 접속 시 5분 단축 어드밴티지가 부여됩니다.)</li>
        <li><strong>판독 대상 4명 제한:</strong> 효율적이고 정확한 분석 품질 유지를 위해 톡방 분석 <strong>2단계에서 선택 가능한 인원은 1회 최대 4명</strong>까지로 제한됩니다.</li>
        <li>비정상적인 자동화 매크로, 크롤링 프로그램 또는 DDoS 성격의 요청은 사전 통보 없이 접속이 즉각 차단될 수 있습니다.</li>
      </ul>

      <h4>제4조 (서비스의 변경 및 중단)</h4>
      <p>서비스 제공자는 API 공급자의 정책 변경, 시스템 유지보수 또는 서버 부하 상황에 따라 서비스의 내용이나 제공 시간을 변경하거나 일시 중단할 수 있습니다.</p>
    `,
  },
  privacy: {
    title: '개인정보처리방침 (Privacy Policy)',
    html: `
      <h4>제1조 (대화 데이터 미저장 원칙 — 절대 안심 보증)</h4>
      <ul>
        <li><strong>서버 및 데이터베이스 미저장:</strong> 이용자가 웹 화면에 입력하거나 업로드한 대화 원문은 <strong>서비스 제공자의 웹 서버, 하드디스크, 데이터베이스(DB) 등에 일절 영구 저장·보관되지 않습니다.</strong></li>
        <li><strong>즉각 파기:</strong> 입력된 텍스트는 실시간 AI 성향/애정도 추정 처리를 위해 메모리에 일시 로드된 후, 분석 결과가 브라우저에 전송되는 즉시 메모리에서 완전 소멸(삭제)됩니다.</li>
        <li><strong>AI 학습 미활용:</strong> 이용자의 대화 내용은 LLM 모델의 사전 훈련 및 미세 조정(Fine-tuning) 데이터셋으로 절대 활용되지 않습니다.</li>
      </ul>

      <h4>제2조 (수집 및 일시 처리하는 최소 정보)</h4>
      <ul>
        <li><strong>수집 항목:</strong> 접속 IP 주소 (단독으로 개인을 식별할 수 없는 네트워크 식별값)</li>
        <li><strong>처리 목적:</strong> 10분 쿨다운(반복 요청 제한) 준수 확인, 친구 초대 어드밴티지 판별, 악의적 트래픽(과다 호출 방어) 제어</li>
        <li><strong>보유 기간:</strong> 서버 프로세스의 휘발성 메모리(Cache) 내에서 쿨다운 및 일일 한도 산정 기간 동안만 유지되며, 주기적 가비지 컬렉션을 통해 완전 파기됩니다.</li>
      </ul>

      <h4>제3조 (개인정보의 제3자 제공 및 위탁)</h4>
      <ul>
        <li><strong>제공받는 자:</strong> Command Code Provider API (AI 추론 서비스 제공사)</li>
        <li><strong>제공 목적:</strong> 실시간 대화 화자 추출, MBTI 성향 및 1:1 애정도 추론</li>
        <li><strong>제공 항목:</strong> 이용자가 입력한 대화 텍스트 전문</li>
        <li><strong>보유 기간:</strong> API 통신 규약에 따른 실시간 추론 완료 후 즉시 파기 (미보관)</li>
      </ul>

      <h4>제4조 (이용자의 권리 및 데이터 삭제)</h4>
      <p>이용자는 언제든지 텍스트 입력창을 지우거나 웹 브라우저 창을 닫음으로써 대화 입력 및 처리를 즉시 중단할 수 있습니다. 브라우저를 새로고침하면 분석 결과 및 입력 데이터는 브라우저 메모리에서도 즉시 영구 소멸됩니다.</p>
    `,
  },
};

function openLegalModal(type) {
  const modal = $('legal-modal');
  const title = $('legal-title');
  const body = $('legal-content');
  const data = LEGAL_TEXTS[type];
  if (!modal || !data) return;

  title.textContent = data.title;
  body.innerHTML = data.html;
  modal.showModal();
}

function bindModals() {
  const introModal = $('intro-modal');
  const legalModal = $('legal-modal');
  const quotaModal = $('quota-modal');

  // 첫 방문 시 플로팅 팝업 표시 (오늘 하루 보지 않기 확인)
  const dismissedUntil = localStorage.getItem('online_mbti_intro_dismissed_until');
  const now = Date.now();
  if (!dismissedUntil || now > Number(dismissedUntil)) {
    if (introModal && typeof introModal.showModal === 'function') {
      setTimeout(() => introModal.showModal(), 350);
    }
  }

  $('intro-confirm-btn')?.addEventListener('click', () => {
    if ($('intro-dismiss-today')?.checked) {
      localStorage.setItem('online_mbti_intro_dismissed_until', String(Date.now() + 24 * 60 * 60 * 1000));
    }
    introModal?.close();
  });

  $('intro-close-x')?.addEventListener('click', () => introModal?.close());

  // 쿼터 모달 닫기
  $('quota-close-x')?.addEventListener('click', () => quotaModal?.close());
  $('quota-confirm-btn')?.addEventListener('click', () => quotaModal?.close());

  // 모달 바깥 백드롭 클릭 시 닫기
  introModal?.addEventListener('click', (e) => {
    if (e.target === introModal) introModal.close();
  });
  legalModal?.addEventListener('click', (e) => {
    if (e.target === legalModal) legalModal.close();
  });
  quotaModal?.addEventListener('click', (e) => {
    if (e.target === quotaModal) quotaModal.close();
  });

  $('legal-close-btn')?.addEventListener('click', () => legalModal?.close());
  $('legal-confirm-btn')?.addEventListener('click', () => legalModal?.close());

  $('open-terms')?.addEventListener('click', () => openLegalModal('terms'));
  $('open-privacy')?.addEventListener('click', () => openLegalModal('privacy'));
  $('open-intro')?.addEventListener('click', () => introModal?.showModal());

  $('footer-open-terms')?.addEventListener('click', () => openLegalModal('terms'));
  $('footer-open-privacy')?.addEventListener('click', () => openLegalModal('privacy'));
  $('footer-open-intro')?.addEventListener('click', () => introModal?.showModal());
}

/* ==================================================================
   탭 모드 전환 (MBTI vs 1:1 애정 분석)
   ================================================================== */

function switchMode(mode) {
  state.currentMode = mode;
  const isMbti = mode === 'mbti';

  const mbtiTab = $('tab-btn-mbti');
  const loveTab = $('tab-btn-love');
  const mbtiView = $('view-mbti');
  const loveView = $('view-love');

  if (mbtiTab) {
    mbtiTab.classList.toggle('is-active', isMbti);
    mbtiTab.setAttribute('aria-selected', isMbti ? 'true' : 'false');
  }
  if (loveTab) {
    loveTab.classList.toggle('is-active', !isMbti);
    loveTab.setAttribute('aria-selected', !isMbti ? 'true' : 'false');
  }

  if (mbtiView) mbtiView.hidden = !isMbti;
  if (loveView) loveView.hidden = isMbti;
}

/* ==================================================================
   1:1 애정 분석 로직
   ================================================================== */

function updateLoveCount() {
  const node = $('love-chat-count');
  if (!node) return;
  const len = $('love-chat')?.value.length || 0;
  node.textContent = `${len.toLocaleString('ko-KR')}자`;
}

function updateLoveCooldownUI() {
  const banner = $('love-cooldown-banner');
  const text = $('love-cooldown-text');
  const btn = $('analyze-love');

  if (state.hasCustomKey) {
    if (banner) banner.hidden = true;
    if (btn && !state.loveBusy) {
      btn.disabled = false;
      btn.textContent = '❤️ 1:1 애정 분석하기 (무제한⚡)';
    }
    return;
  }

  if (state.quotaExhausted) return;

  if (state.loveCooldownRemaining > 0) {
    if (banner) banner.hidden = false;
    if (text) text.textContent = `다음 분석 가능까지 남은 시간: ${formatTime(state.loveCooldownRemaining)}`;
    if (btn && !state.loveBusy) {
      btn.disabled = true;
      btn.textContent = `애정 분석 대기 중 (${formatTime(state.loveCooldownRemaining)})`;
    }
  } else {
    if (banner) banner.hidden = true;
    if (btn && !state.loveBusy) {
      btn.disabled = false;
      btn.textContent = '❤️ 1:1 애정 분석하기';
    }
  }
}

function setLoveCooldown(seconds) {
  if (state.hasCustomKey) return;
  if (!seconds || seconds <= 0) {
    state.loveCooldownRemaining = 0;
    if (state.loveCooldownTimer) {
      clearInterval(state.loveCooldownTimer);
      state.loveCooldownTimer = null;
    }
    updateLoveCooldownUI();
    return;
  }
  state.loveCooldownRemaining = seconds;
  if (state.loveCooldownTimer) clearInterval(state.loveCooldownTimer);
  updateLoveCooldownUI();

  let ticks = 0;
  state.loveCooldownTimer = setInterval(() => {
    state.loveCooldownRemaining -= 1;
    ticks += 1;
    if (ticks % 3 === 0) {
      refreshQuota();
    }
    if (state.loveCooldownRemaining <= 0) {
      state.loveCooldownRemaining = 0;
      clearInterval(state.loveCooldownTimer);
      state.loveCooldownTimer = null;
    }
    updateLoveCooldownUI();
  }, 1000);
}

function setLoveBusy(busy, label) {
  state.loveBusy = busy;
  const btn = $('analyze-love');
  if (!btn) return;

  if (state.hasCustomKey) {
    btn.disabled = busy;
    if ($('love-sample')) $('love-sample').disabled = busy;
    if ($('love-file-btn')) $('love-file-btn').disabled = busy;
    btn.textContent = busy ? (label || '애정도 정밀 분석 중…') : '❤️ 1:1 애정 분석하기 (무제한⚡)';
    return;
  }

  if (state.quotaExhausted) {
    btn.disabled = true;
    btn.textContent = '오늘 무료 한도 마감 (초기화 대기 중)';
    return;
  }

  btn.disabled = busy || state.loveCooldownRemaining > 0;
  if ($('love-sample')) $('love-sample').disabled = busy;
  if ($('love-file-btn')) $('love-file-btn').disabled = busy;

  if (busy) {
    btn.textContent = label || '애정도 정밀 분석 중…';
  } else if (state.loveCooldownRemaining > 0) {
    btn.textContent = `애정 분석 대기 중 (${formatTime(state.loveCooldownRemaining)})`;
  } else {
    btn.textContent = '❤️ 1:1 애정 분석하기';
  }
}

function renderLoveEmpty() {
  const body = $('love-results-body');
  if (!body) return;
  body.replaceChildren(
    el('div', { class: 'state state--empty' }, [
      el('h3', { text: '아직 판독한 1:1 대화가 없습니다' }),
      el('p', {
        text: '왼쪽에 연인, 썸, 친구와의 대화를 넣고 "❤️ 1:1 애정 분석하기"를 누르세요. 두 사람의 캐릭터 프로필과 호감도 점수, 그리고 일별 · 월별 · 연도별 애정도 변화 추이 그래프를 정밀 분석합니다.',
      }),
      el('ul', { class: 'state__list' }, [
        el('li', {}, [el('span', { class: 'dot dot--high', attrs: { 'aria-hidden': 'true' } }), el('span', { text: '두 사람의 호감도 점수와 감정 밸런스 측정' })]),
        el('li', {}, [el('span', { class: 'dot dot--mid', attrs: { 'aria-hidden': 'true' } }), el('span', { text: '일별 / 월별 / 연도별 기간 설정 시계열 그래프' })]),
        el('li', {}, [el('span', { class: 'dot dot--none', attrs: { 'aria-hidden': 'true' } }), el('span', { text: '대표 설렘 대사 & 갈등 예방 AI 코칭' })]),
      ]),
    ]),
  );
}

let loveLoadTimer = null;
function renderLoveLoading(message, note) {
  if (loveLoadTimer) clearInterval(loveLoadTimer);
  const startedAt = Date.now();
  const stage = el('p', { class: 'loading__stage', text: message, attrs: { 'aria-live': 'polite' } });
  const elapsed = el('p', { class: 'loading__note', text: '경과 0초' });

  $('love-results-body')?.replaceChildren(
    el('div', { class: 'loading' }, [
      stage,
      el('div', { class: 'loading__bar' }),
      elapsed,
      note ? el('p', { class: 'loading__note', text: note }) : null,
    ]),
  );

  loveLoadTimer = setInterval(() => {
    elapsed.textContent = `경과 ${Math.floor((Date.now() - startedAt) / 1000)}초`;
  }, 1000);
}

function renderLoveError(message, detail) {
  if (loveLoadTimer) clearInterval(loveLoadTimer);
  loveLoadTimer = null;
  $('love-results-body')?.replaceChildren(
    el('div', { class: 'state state--error', attrs: { role: 'alert' } }, [
      el('h3', { text: '1:1 애정 분석을 완료하지 못했습니다' }),
      el('p', { text: message }),
      detail ? el('p', { class: 'state__detail', text: detail }) : null,
    ]),
  );
}

async function analyzeLove() {
  if (state.loveBusy) return;

  if (!state.hasCustomKey) {
    if (state.quotaExhausted) {
      handleQuotaExhausted(state.resetRemainingSec);
      return;
    }

    if (state.loveCooldownRemaining > 0) {
      showToast(`애정 분석 쿨다운 대기 중입니다. ${formatTime(state.loveCooldownRemaining)} 후 다시 시도해 주세요. (공유 링크로 친구 방문 시 5분 단축)`);
      return;
    }
  }

  const conversation = $('love-chat')?.value.trim() || '';
  if (conversation.length < 20) {
    renderLoveError('대화 내용이 너무 짧습니다. 최소 몇 줄 이상의 대화를 넣어 주세요.');
    return;
  }

  setLoveBusy(true, '1:1 대화 정밀 스캔 중…');
  renderLoveLoading(
    '1:1 대화 속 감정과 호감도를 스캔하는 중입니다…',
    '두 사람의 호칭, 리액션 빈도, 감정 밸런스 및 기간별 애정도 추이를 산출하고 있습니다.',
  );
  scrollToResults('love-results');

  try {
    const res = await fetch('/api/analyze-love', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        conversation,
        model: state.defaultModel || 'deepseek/deepseek-v4-flash',
        apiKey: getCustomApiKey() || undefined,
      }),
    });

    const payload = await res.json();
    if (!res.ok) {
      if (res.status === 429 && !state.hasCustomKey) {
        if (payload.error?.quotaExhausted) {
          handleQuotaExhausted(payload.error?.retryAfterSec);
          return;
        }
        if (payload.error?.retryAfterSec) {
          setLoveCooldown(payload.error.retryAfterSec);
        }
      }
      throw new Error(payload.error?.message || '애정도 분석에 실패했습니다.');
    }

    if (loveLoadTimer) clearInterval(loveLoadTimer);
    loveLoadTimer = null;

    state.loveData = payload;
    if (!state.hasCustomKey) {
      const loveCd = payload.usage?.loveCooldownRemainingSec || 600;
      setLoveCooldown(loveCd);
      renderQuota(payload);
    } else {
      updateLoveCooldownUI();
    }

    renderLoveResults(payload);
    showToast('❤️ 1:1 애정 분석이 성공적으로 완료되었습니다!');
  } catch (err) {
    renderLoveError('분석 중 오류가 발생했습니다.', err.message);
  } finally {
    setLoveBusy(false);
  }
}

/* ==================================================================
   1:1 애정 분석 결과 렌더링 & SVG 차트
   ================================================================== */

function renderLoveResults(data, isShared = false) {
  const body = $('love-results-body');
  if (!body) return;

  const characters = Array.isArray(data.characters) ? data.characters : [];
  const charA = characters[0] || { name: '화자 A', affectionScore: 50, role: '분석 대상', traits: [], quote: '' };
  const charB = characters[1] || { name: '화자 B', affectionScore: 50, role: '분석 대상', traits: [], quote: '' };

  const container = el('div', { class: 'love-results-wrap' });

  if (isShared) {
    const banner = el('div', { class: 'shared-result-banner' }, [
      el('div', { class: 'shared-result-banner__content' }, [
        el('span', { class: 'shared-result-banner__icon', text: '💌' }),
        el('div', {}, [
          el('strong', { text: '친구가 공유한 1:1 애정 분석 결과입니다' }),
          el('p', { text: `${charA.name} ❤️ ${charB.name}의 호감도 지수와 감정 분석 결과입니다. (초대 혜택 5분 단축 적용됨 ⚡)` }),
        ]),
      ]),
      el('button', {
        class: 'btn btn--primary btn--sm',
        attrs: { type: 'button' },
        text: '나도 새 대화 분석하기',
        listeners: {
          click: () => clearSharedView(),
        },
      }),
    ]);
    container.appendChild(banner);
  }

  // 1. 종합 요약 히어로 카드
  const heroCard = el('div', { class: 'love-hero' }, [
    el('div', { class: 'love-hero__badge' }, [
      el('span', { text: '1:1 정밀 애정도 분석' }),
    ]),
    el('h3', { class: 'love-hero__title', text: data.relationshipTitle || '두 사람의 감정 관계' }),
    el('p', { class: 'love-hero__sub', text: data.relationshipSubtitle || '대화 패턴으로 분석한 관계 지수입니다.' }),
    el('div', { class: 'love-hero__stats' }, [
      el('div', { class: 'love-stat-card' }, [
        el('div', { class: 'love-stat-card__label', text: '종합 애정도 지수' }),
        el('div', { class: 'love-stat-card__value love-stat-card__value--love', text: `${data.overallAffectionScore ?? 80}%` }),
      ]),
      el('div', { class: 'love-stat-card' }, [
        el('div', { class: 'love-stat-card__label', text: '감정 밸런스' }),
        el('div', { class: 'love-stat-card__value', text: data.relationshipBalance || '상호 균형' }),
      ]),
      el('div', { class: 'love-stat-card' }, [
        el('div', { class: 'love-stat-card__label', text: `${charA.name} 호감도` }),
        el('div', { class: 'love-stat-card__value', text: `${charA.affectionScore ?? 80}%` }),
      ]),
      el('div', { class: 'love-stat-card' }, [
        el('div', { class: 'love-stat-card__label', text: `${charB.name} 호감도` }),
        el('div', { class: 'love-stat-card__value', text: `${charB.affectionScore ?? 80}%` }),
      ]),
    ]),
  ]);
  container.appendChild(heroCard);

  // 2. 2명의 캐릭터 카드 그리드
  const charGrid = el('div', { class: 'love-char-grid' });

  const renderCharCard = (char, variant, borderCls) => {
    const card = el('div', { class: `love-char-card ${borderCls}` });

    // 헤더 (이름, 역할)
    card.appendChild(
      el('div', { class: 'love-char-card__head' }, [
        el('span', { class: 'love-char-card__name', text: char.name }),
        el('span', { class: 'love-char-card__role', text: char.role || '참여자' }),
      ]),
    );

    // 애정도 미터 바
    const score = char.affectionScore ?? 50;
    const meter = el('div', { class: 'love-meter' }, [
      el('div', { class: 'love-meter__header' }, [
        el('span', { class: 'love-meter__label', text: '상대에 대한 애정도' }),
        el('span', { class: 'love-meter__score', text: `${score}%` }),
      ]),
      el('div', { class: 'love-meter__track' }, [
        el('div', { class: 'love-meter__fill', attrs: { style: `width: ${score}%;` } }),
      ]),
    ]);
    card.appendChild(meter);

    // 특징 태그들
    if (Array.isArray(char.traits) && char.traits.length) {
      const tags = el('div', { class: 'love-char-tags' });
      for (const trait of char.traits) {
        tags.appendChild(el('span', { class: 'love-char-tag', text: `#${trait}` }));
      }
      card.appendChild(tags);
    }

    // 대표 대사
    if (char.quote) {
      card.appendChild(
        el('div', { class: 'love-char-quote', text: `“${char.quote}”` }),
      );
    }

    return card;
  };

  charGrid.appendChild(renderCharCard(charA, 'a', 'love-char-card--a'));
  charGrid.appendChild(renderCharCard(charB, 'b', 'love-char-card--b'));
  container.appendChild(charGrid);

  // 3. 시계열 애정도 그래프 카드 (일별 / 월별 / 연도별)
  const chartCard = el('div', { class: 'love-chart-card', id: 'love-chart-card' });
  const chartHead = el('div', { class: 'love-chart-head' }, [
    el('div', { class: 'love-chart-head__info' }, [
      el('h3', { text: '📈 애정도 시계열 변화 그래프' }),
      el('p', { text: '대화의 흐름 속에서 두 사람의 애정도가 어떻게 변화했는지 기간별로 스캔합니다.' }),
    ]),
    el('div', { class: 'love-chart-controls' }, [
      el('button', {
        type: 'button',
        class: `love-chart-btn ${state.loveChartFilter === 'daily' ? 'is-active' : ''}`,
        text: '일별 (Daily)',
        attrs: { 'data-filter': 'daily' },
      }),
      el('button', {
        type: 'button',
        class: `love-chart-btn ${state.loveChartFilter === 'monthly' ? 'is-active' : ''}`,
        text: '월별 (Monthly)',
        attrs: { 'data-filter': 'monthly' },
      }),
      el('button', {
        type: 'button',
        class: `love-chart-btn ${state.loveChartFilter === 'yearly' ? 'is-active' : ''}`,
        text: '연도별 (Yearly)',
        attrs: { 'data-filter': 'yearly' },
      }),
    ]),
  ]);
  chartCard.appendChild(chartHead);

  // 범례
  const legend = el('div', { class: 'love-chart-legend' }, [
    el('span', { class: 'love-legend-item' }, [
      el('span', { class: 'love-legend-dot love-legend-dot--a' }),
      el('span', { text: `${charA.name}` }),
    ]),
    el('span', { class: 'love-legend-item' }, [
      el('span', { class: 'love-legend-dot love-legend-dot--b' }),
      el('span', { text: `${charB.name}` }),
    ]),
  ]);
  chartCard.appendChild(legend);

  // SVG 차트 컨테이너 및 툴팁
  const chartWrap = el('div', { class: 'love-svg-wrap', id: 'love-svg-wrap' });
  const tooltip = el('div', { class: 'love-chart-tooltip', id: 'love-chart-tooltip', attrs: { hidden: 'true' } });
  chartWrap.appendChild(tooltip);

  const svgNode = buildLoveSvg(data, state.loveChartFilter, charA, charB, tooltip);
  chartWrap.appendChild(svgNode);
  chartCard.appendChild(chartWrap);
  container.appendChild(chartCard);

  // 차트 필터 버튼 이벤트 바인딩
  chartCard.querySelectorAll('.love-chart-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      chartCard.querySelectorAll('.love-chart-btn').forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const filter = btn.getAttribute('data-filter');
      state.loveChartFilter = filter;
      const newSvg = buildLoveSvg(data, filter, charA, charB, tooltip);
      const oldSvg = chartWrap.querySelector('.love-svg');
      if (oldSvg) oldSvg.remove();
      chartWrap.appendChild(newSvg);
    });
  });

  // 4. 세부 분석 (설렘 포인트 & 갈등 주의점)
  const detailsGrid = el('div', { class: 'love-details-grid' });

  // 설렘 포인트
  const flutterPoints = Array.isArray(data.flutterPoints) ? data.flutterPoints : [];
  if (flutterPoints.length) {
    const flutterBox = el('div', { class: 'love-detail-box love-detail-box--flutter' }, [
      el('div', { class: 'love-detail-box__head' }, [
        el('span', { text: '💖 대화 속 설렘 & 호감 모먼트' }),
      ]),
      el('ul', {}, flutterPoints.map((item) => el('li', { text: item }))),
    ]);
    detailsGrid.appendChild(flutterBox);
  }

  // 갈등 주의점
  const cautionPoints = Array.isArray(data.cautionPoints) ? data.cautionPoints : [];
  if (cautionPoints.length) {
    const cautionBox = el('div', { class: 'love-detail-box love-detail-box--caution' }, [
      el('div', { class: 'love-detail-box__head' }, [
        el('span', { text: '⚠️ 주의할 점 & 갈등 예방 팁' }),
      ]),
      el('ul', {}, cautionPoints.map((item) => el('li', { text: item }))),
    ]);
    detailsGrid.appendChild(cautionBox);
  }

  if (flutterPoints.length || cautionPoints.length) {
    container.appendChild(detailsGrid);
  }

  // 5. AI 총평 박스
  if (data.overallVerdict) {
    const verdictBox = el('div', { class: 'love-verdict-box' }, [
      el('h4', {}, [el('span', { text: '⚡ 톡스캐너 관계 분석 총평' })]),
      el('p', { text: data.overallVerdict }),
    ]);
    container.appendChild(verdictBox);
  }

  // 6. 결과 공유하기 버튼
  const shareActions = el('div', { class: 'actions', attrs: { style: 'margin-top: 24px;' } });
  const shareBtn = el('button', {
    type: 'button',
    class: 'btn btn--primary btn--love',
    text: '🔗 애정 분석 결과 공유하고 쿨다운 5분 단축하기',
  });
  shareBtn.addEventListener('click', async () => {
    try {
      const shareData = {
        type: 'love',
        title: `${charA.name} ❤️ ${charB.name} 1:1 애정도 분석`,
        data,
      };
      const res = await fetch('/api/referral/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shareData }),
      });
      const refData = await res.json();
      const code = refData?.code || '';
      const base = `${window.location.origin}${window.location.pathname}`;
      const shareUrl = code ? `${base}?ref=${code}` : base;
      const shareText = `[톡스캐너] ${charA.name} ❤️ ${charB.name} 1:1 애정도 분석 결과 (${data.overallAffectionScore}%)\n${shareUrl}`;

      if (navigator.share && typeof navigator.share === 'function') {
        try {
          await navigator.share({
            title: `[톡스캐너] ${charA.name} ❤️ ${charB.name} 1:1 애정도 분석`,
            text: shareText,
            url: shareUrl,
          });
          showToast('공유 창이 열렸습니다. (친구가 방문하면 5분 단축!)');
          return;
        } catch (e) {
          if (e?.name === 'AbortError') return;
        }
      }

      const copied = await copyToClipboard(shareText, '아래 1:1 애정 분석 결과를 복사하여 공유하세요:');
      if (copied) {
        showToast('🎉 애정 분석 결과와 초대 링크가 복사되었습니다! 친구가 접속 시 대기 시간이 5분 단축됩니다. ⚡');
      } else {
        showToast('링크: ' + shareUrl);
      }
    } catch {
      showToast('공유 링크 생성 중 오류가 발생했습니다.');
    }
  });
  shareActions.appendChild(shareBtn);
  container.appendChild(shareActions);

  body.replaceChildren(container);
}

function buildLoveSvg(data, filter, charA, charB, tooltip) {
  let points = [];
  if (filter === 'monthly' && Array.isArray(data.monthly) && data.monthly.length) {
    points = data.monthly;
  } else if (filter === 'yearly' && Array.isArray(data.yearly) && data.yearly.length) {
    points = data.yearly;
  } else if (Array.isArray(data.timeline) && data.timeline.length) {
    points = data.timeline;
  }

  // 빈 데이터 처리
  if (!points.length) {
    const emptyMsg = el('div', {
      class: 'love-chart-empty-hint',
      text: '해당 기간의 상세 시계열 데이터가 대화 원문에서 추출되지 않았습니다.',
    });
    return emptyMsg;
  }

  const svgW = 680;
  const svgH = 220;
  const padLeft = 45;
  const padRight = 30;
  const padTop = 20;
  const padBottom = 35;
  const plotW = svgW - padLeft - padRight;
  const plotH = svgH - padTop - padBottom;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${svgW} ${svgH}`);
  svg.setAttribute('class', 'love-svg');

  const getY = (val) => padTop + plotH - (Math.max(0, Math.min(100, val || 0)) / 100) * plotH;
  const getX = (idx) => points.length <= 1 ? padLeft + plotW / 2 : padLeft + (idx / (points.length - 1)) * plotW;

  // 1. 가로 그리드선 및 Y축 라벨 (0, 25, 50, 75, 100)
  [0, 25, 50, 75, 100].forEach((level) => {
    const y = getY(level);
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', padLeft);
    line.setAttribute('x2', padLeft + plotW);
    line.setAttribute('y1', y);
    line.setAttribute('y2', y);
    line.setAttribute('stroke', level === 0 ? 'var(--border-strong)' : 'var(--border)');
    line.setAttribute('stroke-width', level === 0 ? '1.5' : '1');
    line.setAttribute('stroke-dasharray', level === 0 ? 'none' : '3 3');
    svg.appendChild(line);

    const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    txt.setAttribute('x', padLeft - 8);
    txt.setAttribute('y', y + 3.5);
    txt.setAttribute('text-anchor', 'end');
    txt.setAttribute('font-size', '10');
    txt.setAttribute('fill', 'var(--muted)');
    txt.textContent = `${level}%`;
    svg.appendChild(txt);
  });

  // 2. 경로 생성 (Path A & Path B)
  const coordsA = points.map((p, i) => [getX(i), getY(p.scoreA ?? 60)]);
  const coordsB = points.map((p, i) => [getX(i), getY(p.scoreB ?? 60)]);

  const pathAStr = coordsA.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c[0]} ${c[1]}`).join(' ');
  const pathBStr = coordsB.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c[0]} ${c[1]}`).join(' ');

  // Path A (charA - pink)
  const pathA = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  pathA.setAttribute('d', pathAStr);
  pathA.setAttribute('fill', 'none');
  pathA.setAttribute('stroke', '#f43f5e');
  pathA.setAttribute('stroke-width', '3');
  pathA.setAttribute('stroke-linecap', 'round');
  pathA.setAttribute('stroke-linejoin', 'round');
  svg.appendChild(pathA);

  // Path B (charB - blue)
  const pathB = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  pathB.setAttribute('d', pathBStr);
  pathB.setAttribute('fill', 'none');
  pathB.setAttribute('stroke', '#0284c7');
  pathB.setAttribute('stroke-width', '3');
  pathB.setAttribute('stroke-linecap', 'round');
  pathB.setAttribute('stroke-linejoin', 'round');
  svg.appendChild(pathB);

  // 3. 점과 툴팁 트리거
  points.forEach((pt, idx) => {
    const x = getX(idx);
    const yA = getY(pt.scoreA ?? 60);
    const yB = getY(pt.scoreB ?? 60);

    // 점 A
    const dotA = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dotA.setAttribute('cx', x);
    dotA.setAttribute('cy', yA);
    dotA.setAttribute('r', '4.5');
    dotA.setAttribute('fill', '#ffffff');
    dotA.setAttribute('stroke', '#f43f5e');
    dotA.setAttribute('stroke-width', '2.5');
    svg.appendChild(dotA);

    // 점 B
    const dotB = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dotB.setAttribute('cx', x);
    dotB.setAttribute('cy', yB);
    dotB.setAttribute('r', '4.5');
    dotB.setAttribute('fill', '#ffffff');
    dotB.setAttribute('stroke', '#0284c7');
    dotB.setAttribute('stroke-width', '2.5');
    svg.appendChild(dotB);

    // X축 날짜 라벨
    const step = points.length > 7 ? Math.ceil(points.length / 6) : 1;
    if (idx % step === 0 || idx === points.length - 1) {
      const xLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      xLabel.setAttribute('x', x);
      xLabel.setAttribute('y', svgH - 10);
      xLabel.setAttribute('text-anchor', 'middle');
      xLabel.setAttribute('font-size', '11');
      xLabel.setAttribute('fill', 'var(--muted)');
      xLabel.textContent = pt.date;
      svg.appendChild(xLabel);
    }

    // 마우스 호버 감지용 영역
    const trigger = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    const w = points.length <= 1 ? plotW : plotW / points.length;
    trigger.setAttribute('x', x - w / 2);
    trigger.setAttribute('y', padTop);
    trigger.setAttribute('width', w);
    trigger.setAttribute('height', plotH);
    trigger.setAttribute('fill', 'transparent');
    trigger.setAttribute('style', 'cursor: pointer;');

    const showTip = () => {
      tooltip.hidden = false;
      const note = pt.event || pt.summary || '';
      tooltip.innerHTML = `
        <strong>📅 ${pt.date}</strong>
        <div>${charA.name}: <b style="color:#f43f5e">${pt.scoreA ?? 60}%</b></div>
        <div>${charB.name}: <b style="color:#38bdf8">${pt.scoreB ?? 60}%</b></div>
        ${note ? `<div style="margin-top:4px;color:#cbd5e1;font-size:10px;">💬 ${note}</div>` : ''}
      `;
      const pctX = (x / svgW) * 100;
      const pctY = ((Math.min(yA, yB) - 10) / svgH) * 100;
      tooltip.style.left = `${pctX}%`;
      tooltip.style.top = `${pctY}%`;
      if (pctX < 22) {
        tooltip.style.transform = 'translate(-10%, -115%)';
      } else if (pctX > 78) {
        tooltip.style.transform = 'translate(-90%, -115%)';
      } else {
        tooltip.style.transform = 'translate(-50%, -115%)';
      }
    };

    const hideTip = () => {
      tooltip.hidden = true;
    };

    trigger.addEventListener('mouseenter', showTip);
    trigger.addEventListener('mouseleave', hideTip);
    trigger.addEventListener('touchstart', () => {
      showTip();
    }, { passive: true });

    svg.appendChild(trigger);
  });

  return svg;
}

function bindLoveDropzone() {
  const zone = $('love-dropzone');
  const input = $('love-file');
  if (!zone || !input) return;

  const swallow = (e) => { e.preventDefault(); e.stopPropagation(); };

  ['dragenter', 'dragover'].forEach((t) =>
    zone.addEventListener(t, (e) => {
      swallow(e);
      zone.classList.add('is-dragover');
    }),
  );

  zone.addEventListener('dragleave', (e) => {
    swallow(e);
    if (e.relatedTarget && zone.contains(e.relatedTarget)) return;
    zone.classList.remove('is-dragover');
  });

  zone.addEventListener('drop', (e) => {
    swallow(e);
    zone.classList.remove('is-dragover');
    const file = e.dataTransfer?.files?.[0];
    if (file) loadLoveFile(file);
  });

  $('love-file-btn')?.addEventListener('click', () => input.click());

  input.addEventListener('change', () => {
    const file = input.files?.[0];
    if (file) loadLoveFile(file);
    input.value = '';
  });
}

async function loadLoveFile(file) {
  const info = $('love-file-info');
  const chat = $('love-chat');
  if (!file || !chat) return;

  if (file.size > MAX_FILE_BYTES) {
    if (info) {
      info.hidden = false;
      info.classList.add('is-error');
      info.textContent = `파일이 너무 큽니다 (${(file.size / 1024 / 1024).toFixed(1)}MB). 5MB 이하만 가능합니다.`;
    }
    return;
  }

  try {
    const text = await decodeFile(file);
    chat.value = text;
    updateLoveCount();
    if (info) {
      info.hidden = false;
      info.classList.remove('is-error');
      info.textContent = `불러온 파일: ${file.name} (${(file.size / 1024).toFixed(1)}KB)`;
    }
  } catch (err) {
    if (info) {
      info.hidden = false;
      info.classList.add('is-error');
      info.textContent = '파일을 읽지 못했습니다. 올바른 텍스트 파일인지 확인해 주세요.';
    }
    console.error(err);
  }
}

function bindLoveEvents() {
  $('tab-btn-mbti')?.addEventListener('click', () => switchMode('mbti'));
  $('tab-btn-love')?.addEventListener('click', () => switchMode('love'));

  $('love-chat')?.addEventListener('input', updateLoveCount);
  $('analyze-love')?.addEventListener('click', analyzeLove);
  $('love-cooldown-copy-btn')?.addEventListener('click', copyInviteLink);

  $('love-sample')?.addEventListener('click', () => {
    const chat = $('love-chat');
    if (chat) {
      chat.value = SAMPLE_LOVE;
      updateLoveCount();
      chat.focus();
    }
  });

  $('love-chat')?.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      analyzeLove();
    }
  });
}

function bindEvents() {
  $('chat').addEventListener('input', updateCount);
  $('analyze').addEventListener('click', findSpeakers);
  $('cooldown-copy-btn')?.addEventListener('click', copyInviteLink);
  $('sample').addEventListener('click', () => {
    $('chat').value = SAMPLE;
    updateCount();
    $('chat').focus();
  });
  $('chat').addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault();
      findSpeakers();
    }
  });
}

loadCustomApiKey();
bindApiKeyEvents();
loadModels();
renderQuota(null); // 로컬 저장된 남은 횟수 및 쿨다운 즉시 복원
refreshQuota();
bindEvents();
bindDropzone();
bindLoveEvents();
bindLoveDropzone();
bindModals();
updateCount();
updateLoveCount();
renderEmpty();
renderLoveEmpty();
checkReferralParam();

