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
   상태
   ================================================================== */

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
};

function setBusy(busy, label) {
  state.busy = busy;
  $('analyze').disabled = busy;
  $('sample').disabled = busy;
  $('file-btn').disabled = busy;
  $('analyze').textContent = busy ? label || '처리 중…' : '1단계 · 등장인물 찾기';
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

  const conversation = $('chat').value.trim();
  if (conversation.length < 20) {
    renderError('대화 내용이 너무 짧습니다. 최소 몇 줄 이상 붙여넣어 주세요.');
    return;
  }

  state.conversation = conversation;
  setBusy(true, '인물 찾는 중…');
  renderLoading('대화에서 등장인물을 찾는 중', '이름과 발화 수만 뽑습니다. 몇 초면 끝납니다.');

  try {
    const res = await fetch('/api/speakers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversation,
        model: $('model').value,
        apiKey: $('apikey').value.trim() || undefined,
      }),
    });
    const data = await res.json();

    if (!res.ok) {
      renderError(data?.error?.message || '등장인물을 찾지 못했습니다.', data?.error?.code);
      if (res.status === 429) refreshQuota();
      return;
    }

    state.speakerData = data;
    state.selected = new Set(data.speakers.map((s) => s.name));
    state.status = new Map(data.speakers.map((s) => [s.name, 'pending']));
    state.errors = new Map();
    state.results = [];
    state.activeTab = null;

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
  const allSelected = state.selected.size === data.speakers.length;

  const rows = data.speakers.map((speaker) => {
    const checked = state.selected.has(speaker.name);
    const input = el('input', {
      attrs: { type: 'checkbox', value: speaker.name, ...(checked ? { checked: true } : {}) },
    });
    input.checked = checked;
    if (state.busy) input.disabled = true;
    input.addEventListener('change', () => {
      if (input.checked) state.selected.add(speaker.name);
      else state.selected.delete(speaker.name);
      renderFlow();
    });

    return el('label', { class: 'person-pick' + (checked ? ' is-on' : '') }, [
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

  const selectAll = el('button', {
    class: 'btn btn--ghost btn--sm',
    text: allSelected ? '전체 해제' : '전체 선택',
    attrs: { type: 'button', id: 'select-all' },
  });
  selectAll.disabled = state.busy;
  selectAll.addEventListener('click', () => {
    state.selected = allSelected ? new Set() : new Set(data.speakers.map((s) => s.name));
    renderFlow();
  });

  const start = el('button', {
    class: 'btn btn--primary btn--sm',
    text: `선택한 ${state.selected.size}명 판독 시작`,
    attrs: { type: 'button', id: 'run-selected' },
  });
  start.disabled = state.selected.size === 0 || state.busy;
  start.addEventListener('click', runSelected);

  return el('section', { class: 'pick' }, [
    el('div', { class: 'pick__head' }, [
      el('h3', { class: 'section-title', text: `2단계 · 판독할 사람 선택 (${data.speakers.length}명 발견)` }),
      el('div', { class: 'pick__actions' }, [selectAll, start]),
    ]),
    el('div', { class: 'pick__list' }, rows),
    el('p', {
      class: 'field__hint',
      text: '체크한 사람만 한 명씩 순서대로 판독합니다. 한 번에 몰아서 판독하지 않아 실패가 적습니다.',
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

function personPanel(person, index) {
  const children = [
    el('header', { class: 'person__head' }, [
      typeLine(person),
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

  return el('section', { class: 'results' }, [
    el('h3', { class: 'section-title', text: `판독 결과 (${state.results.length}명)` }),
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
  if (state.busy || !state.speakerData) return;

  const targets = state.speakerData.speakers.filter((s) => state.selected.has(s.name));
  if (!targets.length) return;

  state.running = true;
  state.results = [];
  state.errors = new Map();
  state.activeTab = null;
  for (const speaker of state.speakerData.speakers) state.status.set(speaker.name, 'pending');

  setBusy(true, '판독 중…');
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
            model: $('model').value,
            apiKey: $('apikey').value.trim() || undefined,
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
  const usage = payload?.usage;
  if (!usage) return;

  const personCost = payload.cost?.person ?? 3;
  const perIpRemaining = Math.min(usage.dailyRemaining, usage.hourlyRemaining);
  const remaining = Math.min(perIpRemaining, usage.globalRemaining);
  const peopleLeft = Math.floor(remaining / personCost);

  node.hidden = false;
  node.classList.toggle('is-out', peopleLeft <= 0);
  node.classList.toggle('is-low', peopleLeft > 0 && peopleLeft <= 2);

  const hourlyBound = usage.hourlyRemaining <= usage.dailyRemaining;
  const resetText = hourlyBound && usage.hourlyRemaining < usage.dailyRemaining
    ? '잠시 후 다시 채워집니다'
    : '내일 초기화됩니다';

  const message =
    peopleLeft > 0
      ? ` · 오늘 약 ${peopleLeft}명까지 판독할 수 있습니다 (${resetText})`
      : ` · 오늘 무료 판독을 모두 사용했습니다 (${resetText})`;

  node.replaceChildren(
    el('strong', { text: '무료 한도' }),
    el('span', { text: message }),
  );
}

async function refreshQuota() {
  try {
    const res = await fetch('/api/usage');
    if (!res.ok) return;
    renderQuota(await res.json());
  } catch {
    /* 한도 표시는 실패해도 조용히 넘어간다 */
  }
}

async function loadModels() {
  try {
    const res = await fetch('/api/models');
    const data = await res.json();
    state.models = data.models || [];
    state.defaultModel = data.defaultModel || '';
    state.hasServerKey = Boolean(data.hasServerKey);

    const select = $('model');
    select.replaceChildren(...state.models.map((m) => el('option', { text: m.name, attrs: { value: m.id } })));
    select.value = state.defaultModel || state.models[0]?.id || '';
  } catch {
    $('model').replaceChildren(el('option', { text: '모델 목록을 불러오지 못했습니다' }));
  }
}

function bindEvents() {
  $('chat').addEventListener('input', updateCount);
  $('analyze').addEventListener('click', findSpeakers);
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

loadModels();
refreshQuota();
bindEvents();
bindDropzone();
updateCount();
renderEmpty();
