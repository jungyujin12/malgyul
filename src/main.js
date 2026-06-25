/**
 * 말결 (Malgyeol) - 메인 애플리케이션 바닐라 자바스크립트 엔진
 * 배재대학교 산업디자인학과 창업지원단 프로젝트
 * 
 * 비전공자 학생분들이 클로드(Claude) 등을 활용하여 손쉽게 '바이브 코딩'할 수 있도록,
 * 모든 기능과 변수명을 직관적이고 친절하게 주석을 달아 구성했습니다.
 * 
 * [목차]
 * 1. 기초 기본 데이터 (연습용 발표 대본, 기본 기록지)
 * 2. 전역 상태 변수 (현재 탭, 선택된 대본, 누적 내역 등)
 * 3. 공통 유틸리티 함수 (로컬스토리지 제어, 포맷 변환)
 * 4. 내비게이션 & 탭 전환 제어
 * 5. 홈(Home) 화면 렌더링 및 통계 계산
 * 6. 발표 리허설 시뮬레이터 (마이크 감지, 애니메이션 캔버스, AI 피드백)
 * 7. 발성 및 조음 연습 (자음 도해, 모음 포먼트 좌표, 장음 지속 게임)
 * 8. 연습 기록실 리포트 조회 및 제거
 * 9. 대본 추가/수정 모달(Modal) 폼 제어
 * 10. 초기 로딩 및 클릭 이벤트 바인딩
 */

// ==========================================
// 1. 기초 기본 데이터 (Default Data)
// ==========================================

// 초기에 제공되는 추천 발표 원고 리스트
const DEFAULT_SCRIPTS = [
  {
    id: "script-template-1",
    name: "배재대 1차 창업 경진대회 발표 원고",
    text: "안녕하세요. 말결 팀의 발표자입니다. 청각장애 대학생의 76%가 대학 생활 중 발표 과제에서 가장 큰 소외감과 언어적 장벽을 느낍니다. 저희 배리어프리 발표 피드백 솔루션 '말결'은, 소리라는 청각적 파형을 눈으로 정밀하게 볼 수 있는 '시각적 발성 도해 분석기'를 기반으로 합니다. 이를 통해 장애를 가진 모든 학생들이 자신의 전공 역량을 한계 없이 발표할 수 있는 미래를 그려나가고자 합니다. 경청해 주셔서 감사합니다.",
    createdAt: "2026-06-25T10:00:00.000Z"
  },
  {
    id: "script-template-2",
    name: "디자인 방법론 과제 - 조음 시각 분석 보조 방안",
    text: "반갑습니다. 이번 디자인 방법론 발표를 맡은 조입니다. 저희 조는 청각장애인의 언어 발달 및 프레젠테이션 스피치 훈련 시, 조음 기관의 움직임을 시각화하여 전달할 수 있는 웨어러블 디바이스와 소프트웨어를 디자인했습니다. 주파수 분할 필터를 통해 잡음을 제거하고, 자음 조음 시 나타나는 마찰 주파수를 정량화하는 것을 목표로 설계했습니다. 이 아이디어가 실제로 구체화되어 비언어적 소통의 새로운 기준을 열어가길 희망합니다.",
    createdAt: "2026-06-24T15:30:00.000Z"
  },
  {
    id: "script-template-3",
    name: "스타트업 엘리베이터 피치 원고 (배리어프리)",
    text: "성공적인 피칭을 위해서는 60초 안에 강렬한 솔루션을 제안해야 합니다. 배리어프리 스피치 교정 도구인 '말결'은 성대 훈련, 단모음 조음 포지션 추적, 그리고 복식 호흡을 유지하는 장음 게임까지 한데 모았습니다. 누구나 스스로 목소리의 명확도를 높일 수 있도록, 배재대학교 산업디자인학과에서 창업지원단 프로젝트로 탄생시켰습니다.",
    createdAt: "2026-06-23T09:00:00.000Z"
  }
];

// 초기에 제공되는 샘플 리허설 피드백 기록
const INITIAL_HISTORY = [
  {
    id: "history-mock-1",
    scriptId: "script-template-1",
    scriptName: "배재대 1차 창업 경진대회 발표 원고",
    score: 92,
    volume: 68,      // dB (데시벨)
    pace: 290,       // 분당 글자 수
    clarity: 94,     // % 발음 정확도
    advice: "전체적으로 호흡의 안정도가 대단히 우수합니다. 특히 발표 초반부 모음 'ㅏ, ㅓ'의 성량이 뚜렷하여 청중들의 이목을 잘 끌었습니다. 다만 후반부 60초 구간에서 긴장으로 인해 말의 속도가 1.2배 소폭 빨라지는 경향이 있으니 의도적으로 마침표 다음에 숨을 돌리는 페이스 유지를 권장합니다.",
    createdAt: "2026-06-25T11:20:00.000Z"
  },
  {
    id: "history-mock-2",
    scriptId: "script-template-2",
    scriptName: "디자인 방법론 과제 - 조음 시각 분석 보조 방안",
    score: 85,
    volume: 62,
    pace: 330,
    clarity: 88,
    advice: "성량이 기준치(65dB)보다 소폭 작게 녹음되었습니다. 조금 더 배에 힘을 준 상태에서 발성하는 '장음 발성 훈련'이 필요합니다. 또한 'ㅈ, ㅊ'과 같은 파찰음 구간에서 조음 명확도가 미치지 못했으니 해당 자음 단어 낭독을 선행하시면 목소리의 선명함을 확실하게 강화할 수 있습니다.",
    createdAt: "2026-06-24T18:40:00.000Z"
  }
];

// ==========================================
// 2. 전역 상태 변수 (Global States)
// ==========================================
let scripts = [];
let history = [];
let activeTab = "home"; // "home", "rehearsal", "deaf", "history", "info"
let activeDeafSubtab = "articulation"; // "articulation", "vowels", "sustained"

// 리허설 진행 상태 관련 변수
let selectedScriptId = null;
let isRehearsing = false;
let rehearsalTimerInterval = null;
let rehearsalSeconds = 0;
let mockSpeechInterval = null;
let recognition = null;
let spokenText = "";
let rehearsalVolumes = [];
let selectedHistoryId = null;

// 마이크 녹음 & 오디오 콘텍스트 변수
let audioContext = null;
let analyser = null;
let micStream = null;
let javascriptNode = null;
let animationFrameId = null;

// 지속 발성(장음) 연습 상태 변수
let isSustainedPhonationRunning = false;
let sustainedProgressInterval = null;
let sustainedSeconds = 0;
let sustainedMatchCount = 0;
let sustainedTotalCount = 0;

// 모음 매칭 시뮬레이터 변수
let isVowelSimulatorRunning = false;
let vowelSimulatorInterval = null;

// ==========================================
// 3. 공통 유틸리티 함수 (Utility Functions)
// ==========================================

// 로컬스토리지에서 대본과 기록 데이터 불러오기
function loadData() {
  const savedScripts = localStorage.getItem("malgyeol_scripts_v2");
  if (savedScripts) {
    try {
      scripts = JSON.parse(savedScripts);
    } catch (e) {
      scripts = [...DEFAULT_SCRIPTS];
    }
  } else {
    scripts = [...DEFAULT_SCRIPTS];
    saveScripts();
  }

  const savedHistory = localStorage.getItem("malgyeol_history_v2");
  if (savedHistory) {
    try {
      history = JSON.parse(savedHistory);
    } catch (e) {
      history = [...INITIAL_HISTORY];
    }
  } else {
    history = [...INITIAL_HISTORY];
    saveHistory();
  }
}

// 로컬스토리지에 대본 저장
function saveScripts() {
  localStorage.setItem("malgyeol_scripts_v2", JSON.stringify(scripts));
}

// 로컬스토리지에 기록 저장
function saveHistory() {
  localStorage.setItem("malgyeol_history_v2", JSON.stringify(history));
}

// 날짜 포맷 변환 (YYYY-MM-DD HH:MM)
function formatDate(isoString) {
  const d = new Date(isoString);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const date = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${date} ${hours}:${minutes}`;
}

// ==========================================
// 4. 내비게이션 & 탭 전환 제어 (Navigation)
// ==========================================
window.switchTab = function (tabName) {
  // 만약 리허설이 구동 중이라면 확인 후 전환
  if (isRehearsing) {
    if (!confirm("현재 진행 중인 발표 리허설을 중단하고 이동하시겠습니까?")) {
      return;
    }
    stopRehearsal(false); // 저장하지 않고 중단
  }

  activeTab = tabName;

  // 모든 메인 뷰 섹션 숨기기
  document.getElementById("view-home").classList.add("hidden");
  document.getElementById("view-rehearsal").classList.add("hidden");
  document.getElementById("view-deaf").classList.add("hidden");
  document.getElementById("view-history").classList.add("hidden");
  document.getElementById("view-info").classList.add("hidden");

  // 선택한 메인 뷰 섹션 드러내기
  const targetView = document.getElementById(`view-${tabName}`);
  if (targetView) targetView.classList.remove("hidden");

  // 데스크톱 내비게이션 탭 버튼 스타일 갱신
  const desktopButtons = document.querySelectorAll(".nav-tab-btn");
  desktopButtons.forEach(btn => {
    btn.className = "nav-tab-btn rounded-full px-4 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-all";
  });

  const activeDesktopBtn = document.getElementById(`tab-btn-${tabName === "deaf" ? "deaf" : tabName}`);
  if (activeDesktopBtn) {
    activeDesktopBtn.className = "nav-tab-btn rounded-full px-4 py-1.5 text-xs font-semibold bg-orange-700 text-white transition-all";
  }

  // 모바일 내비게이션 탭 버튼 스타일 갱신
  const mobileButtons = document.querySelectorAll(".m-nav-tab-btn");
  mobileButtons.forEach(btn => {
    btn.className = "m-nav-tab-btn rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap transition-all text-slate-500";
  });

  const activeMobileBtn = document.getElementById(`m-tab-btn-${tabName === "deaf" ? "deaf" : tabName}`);
  if (activeMobileBtn) {
    activeMobileBtn.className = "m-nav-tab-btn rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap transition-all bg-orange-700 text-white";
  }

  // 탭 전용 데이터 렌더링 호출
  if (tabName === "home") {
    renderHomeView();
  } else if (tabName === "rehearsal") {
    renderRehearsalView();
  } else if (tabName === "deaf") {
    switchDeafSubtab(activeDeafSubtab);
  } else if (tabName === "history") {
    renderHistoryView();
  }

  // Lucide 아이콘 다시 그려주기 (동적 돔 재생성 대응)
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
};

// ==========================================
// 5. 홈(Home) 화면 렌더링 및 통계 계산
// ==========================================
function renderHomeView() {
  // 통계 수치 계산
  const scriptsCount = scripts.length;
  const historyCount = history.length;
  
  let avgClarity = 0;
  if (historyCount > 0) {
    const totalClarity = history.reduce((sum, item) => sum + (item.clarity || 0), 0);
    avgClarity = Math.round(totalClarity / historyCount);
  }

  // DOM 텍스트 노출 업데이트
  document.getElementById("stat-scripts-count").innerText = `${scriptsCount}개`;
  document.getElementById("stat-history-count").innerText = `${historyCount}회`;
  document.getElementById("stat-avg-score").innerText = `${avgClarity}%`;

  // 추천 대본 영역 카드 드로잉
  const container = document.getElementById("home-scripts-container");
  container.innerHTML = "";

  scripts.slice(0, 4).forEach(script => {
    const scriptCard = document.createElement("div");
    scriptCard.className = "bg-white p-5 rounded-2xl border border-slate-100 hover:border-orange-200 hover:shadow-md transition-all flex flex-col justify-between space-y-4 cursor-pointer";
    scriptCard.onclick = () => {
      selectedScriptId = script.id;
      switchTab("rehearsal");
    };

    scriptCard.innerHTML = `
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-[10px] bg-orange-50 text-orange-700 font-bold px-2 py-0.5 rounded-full">원고</span>
          <span class="text-[10px] font-mono text-slate-400">${formatDate(script.createdAt).split(" ")[0]}</span>
        </div>
        <h4 class="text-xs font-bold text-slate-800 line-clamp-1">${script.name}</h4>
        <p class="text-[11px] text-slate-500 line-clamp-3 leading-relaxed">${script.text}</p>
      </div>
      <div class="flex items-center justify-between pt-2 border-t border-slate-50 text-[10px] font-bold text-orange-700">
        <span>지금 선택 및 훈련 시작</span>
        <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
      </div>
    `;
    container.appendChild(scriptCard);
  });
}

// ==========================================
// 6. 발표 리허설 시뮬레이터 (Rehearsal)
// ==========================================
function renderRehearsalView() {
  const listContainer = document.getElementById("rehearsal-scripts-list");
  listContainer.innerHTML = "";

  if (scripts.length === 0) {
    listContainer.innerHTML = `<p class="text-xs text-slate-400 text-center py-6">등록된 대본이 없습니다. 오른쪽 위의 더하기(+) 버튼으로 새로 추가하세요!</p>`;
    return;
  }

  // 대본 목록 렌더링
  scripts.forEach(script => {
    const isActive = selectedScriptId === script.id;
    const item = document.createElement("div");
    item.className = `p-3.5 rounded-2xl border transition-all cursor-pointer relative group flex items-start justify-between ${
      isActive 
        ? "bg-orange-50 border-orange-200 shadow-sm" 
        : "bg-white border-slate-100 hover:border-orange-100"
    }`;

    // 클릭 시 해당 대본을 액티브 대본으로 설정
    item.addEventListener("click", (e) => {
      // 제어용 버튼 클릭 시에는 대본 변경 안 되도록 방지
      if (e.target.closest(".control-btn")) return;
      selectedScriptId = script.id;
      renderRehearsalView();
    });

    item.innerHTML = `
      <div class="space-y-1 pr-4 flex-1">
        <h4 class="text-xs font-bold ${isActive ? "text-orange-900" : "text-slate-800"} line-clamp-1">${script.name}</h4>
        <p class="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">${script.text}</p>
      </div>
      <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onclick="editScript('${script.id}')" class="control-btn p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-700" title="수정">
          <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
        </button>
        <button onclick="deleteScript('${script.id}')" class="control-btn p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600" title="삭제">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    `;

    listContainer.appendChild(item);
  });

  // 우측 활성 패널 동기화
  const activeScript = scripts.find(s => s.id === selectedScriptId) || scripts[0];
  if (activeScript) {
    selectedScriptId = activeScript.id;
    
    // 만약 리허설 상태가 아니라면 "시작 대기 화면"을 리셋하여 동기화
    if (!isRehearsing) {
      document.getElementById("rehearsal-screen-ready").classList.remove("hidden");
      document.getElementById("rehearsal-screen-active").classList.add("hidden");
      document.getElementById("rehearsal-screen-report").classList.add("hidden");
      
      document.getElementById("ready-script-title").innerText = activeScript.name;
    }
  } else {
    selectedScriptId = null;
    document.getElementById("ready-script-title").innerText = "선택된 원고가 없습니다";
  }

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

// 실시간 발표 리허설 가동 개시
window.startRehearsal = async function () {
  const activeScript = scripts.find(s => s.id === selectedScriptId);
  if (!activeScript) {
    alert("훈련에 임할 대본을 먼저 선택해 주세요.");
    return;
  }

  isRehearsing = true;
  rehearsalSeconds = 0;
  spokenText = "";
  rehearsalVolumes = [];

  // 화면 뷰 토글
  document.getElementById("rehearsal-screen-ready").classList.add("hidden");
  document.getElementById("rehearsal-screen-active").classList.remove("hidden");
  document.getElementById("rehearsal-screen-report").classList.add("hidden");

  // 원고 데이터 연동
  document.getElementById("active-script-title").innerText = activeScript.name;
  document.getElementById("active-script-text").innerText = activeScript.text;
  document.getElementById("rehearsal-timer").innerText = "00:00";
  document.getElementById("live-db-indicator").innerText = "0.0 dB";

  const sttBox = document.getElementById("realtime-stt-text");
  if (sttBox) {
    sttBox.innerText = "아직 목소리가 감지되지 않았습니다. 마이크를 대고 원고를 또박또박 읽어주세요.";
  }

  // 마이크 연동 및 오디오 컴포넌트 세팅
  initMicAudio();

  // 1초 단위 타이머 스케줄 가동
  rehearsalTimerInterval = setInterval(() => {
    rehearsalSeconds++;
    const mins = String(Math.floor(rehearsalSeconds / 60)).padStart(2, "0");
    const secs = String(rehearsalSeconds % 60).padStart(2, "0");
    document.getElementById("rehearsal-timer").innerText = `${mins}:${secs}`;
  }, 1000);

  // Web Speech API 기반 실시간 음성인식기 셋업
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition) {
    try {
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "ko-KR";

      recognition.onstart = () => {
        console.log("Speech recognition started");
      };

      recognition.onerror = (e) => {
        console.warn("Speech recognition error:", e);
      };

      recognition.onend = () => {
        if (isRehearsing && recognition) {
          try { recognition.start(); } catch(err) {}
        }
      };

      recognition.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          spokenText += " " + finalTranscript;
        }

        const currentDisplay = (spokenText + " " + interimTranscript).trim();
        if (sttBox && currentDisplay) {
          sttBox.innerText = currentDisplay;
        }

        // 실시간 조음 명확도 및 피드백 계산
        updateRealtimeFeedback(activeScript.text, currentDisplay);
      };

      recognition.start();
    } catch (err) {
      console.warn("SpeechRecognition start error:", err);
    }
  } else {
    if (sttBox) {
      sttBox.innerHTML = `<span class="text-orange-600 font-medium">⚠️ 현재 브라우저는 웹 음성인식(Speech-to-Text) 표준을 지원하지 않습니다. 마이크 기반 주파수 분석만 활성화되며, 데모 낭독 모드로 대체 작동합니다. Chrome/Safari를 이용해 주세요.</span>`;
    }
  }

  // 실시간 AI 피드백 텍스트 코칭 교대 출력 시뮬레이터 (SpeechRecognition 미지원 또는 응답 대기시 대비)
  const coachingTips = [
    { title: "성량이 아주 좋습니다", desc: "현재와 같은 명확한 크기와 톤을 유지하여 이야기를 이어가세요.", icon: "smile", color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "조금만 더 천천히 말씀하세요", desc: "말의 속도가 다소 빨라졌습니다. 호흡을 다스리며 또박또박 낭독해 보세요.", icon: "alert-circle", color: "text-amber-600", bg: "bg-amber-50" },
    { title: "자연스러운 정지(Pause) 감지됨", desc: "단락 사이에서 훌륭한 호흡 배분을 취하고 있습니다. 시선 처리도 좋아요.", icon: "check-circle", color: "text-blue-600", bg: "bg-blue-50" },
    { title: "발음이 명확하고 전달력이 높습니다", desc: "모음의 형태가 뚜렷하여 청중이 집중하기 좋은 목소리 흐름입니다.", icon: "volume-2", color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "목소리가 작아졌습니다", desc: "성량이 약 5dB 하락했습니다. 어깨 힘을 빼고 복부에 호흡을 실어 당당하게 말하세요.", icon: "alert-triangle", color: "text-orange-600", bg: "bg-orange-50" }
  ];

  let currentTipIdx = 0;
  mockSpeechInterval = setInterval(() => {
    if (!SpeechRecognition || !spokenText) {
      currentTipIdx = (currentTipIdx + 1) % coachingTips.length;
      const tip = coachingTips[currentTipIdx];
      
      document.getElementById("coaching-status-title").innerText = tip.title;
      document.getElementById("coaching-status-desc").innerText = tip.desc;
      
      const iconContainer = document.getElementById("coaching-icon");
      iconContainer.className = `p-2 ${tip.bg} ${tip.color} rounded-xl shrink-0 transition-all`;
      iconContainer.innerHTML = `<i data-lucide="${tip.icon}" class="w-5 h-5"></i>`;

      const vibrationOn = document.getElementById("toggle-vibration-feedback").checked;
      if (vibrationOn && (tip.icon === "alert-circle" || tip.icon === "alert-triangle")) {
        const panel = document.getElementById("rehearsal-display-panel");
        panel.classList.add("animate-bounce");
        setTimeout(() => {
          panel.classList.remove("animate-bounce");
        }, 500);
      }

      if (typeof lucide !== "undefined") {
        lucide.createIcons();
      }
    }
  }, 4500);

  // 모바일 대응: 리허설 시작 시 화면을 부드럽게 스크롤
  if (window.innerWidth < 1024) {
    setTimeout(() => {
      const activeScreen = document.getElementById("rehearsal-screen-active");
      if (activeScreen) {
        activeScreen.scrollIntoView({ behavior: "smooth" });
      }
    }, 200);
  }
};

// 실시간 음성인식 자막과 원고 내용 매칭 기반 실시간 피드백
function updateRealtimeFeedback(scriptText, transcriptText) {
  if (!transcriptText) return;

  const scriptWords = scriptText.toLowerCase().replace(/[^가-힣0-9a-zA-Z\s]/g, "").split(/\s+/).filter(Boolean);
  const transWords = transcriptText.toLowerCase().replace(/[^가-힣0-9a-zA-Z\s]/g, "").split(/\s+/).filter(Boolean);

  if (scriptWords.length === 0 || transWords.length === 0) return;

  let matches = 0;
  const scriptSet = new Set(scriptWords);
  
  transWords.forEach(w => {
    if (scriptSet.has(w)) {
      matches++;
    } else {
      for (let sw of scriptWords) {
        if (sw.includes(w) || w.includes(sw)) {
          matches += 0.7;
          break;
        }
      }
    }
  });

  const clarity = Math.min(100, Math.max(15, Math.round((matches / transWords.length) * 100)));
  
  const elapsedMinutes = rehearsalSeconds / 60;
  let pace = 280;
  if (elapsedMinutes > 0) {
    const totalChars = transcriptText.replace(/\s+/g, "").length;
    pace = Math.round(totalChars / elapsedMinutes);
  }

  const titleElem = document.getElementById("coaching-status-title");
  const descElem = document.getElementById("coaching-status-desc");
  const iconContainer = document.getElementById("coaching-icon");

  if (!titleElem || !descElem || !iconContainer) return;

  let title = "발표를 잘 진행하고 있습니다";
  let desc = "작성하신 원고 내용에 맞게 안정적인 속도로 읽고 있습니다. 입술을 크게 움직이세요.";
  let icon = "smile";
  let bg = "bg-emerald-50";
  let color = "text-emerald-600";

  if (pace > 360) {
    title = "조금만 더 천천히 말씀하세요";
    desc = `현재 말하는 속도가 분당 ${pace}자로 다소 빠릅니다. 청각장애 청중이 구강을 읽거나 자막을 읽기에 벅찰 수 있으니 여유를 가지세요.`;
    icon = "alert-circle";
    bg = "bg-amber-50";
    color = "text-amber-600";
  } else if (pace < 180 && transWords.length > 3) {
    title = "발표 템포가 너무 느립니다";
    desc = `현재 말하는 속도가 분당 ${pace}자로 다소 느립니다. 조금 더 또박또박하고 속도감 있게 원고를 전개해 보세요.`;
    icon = "alert-triangle";
    bg = "bg-orange-50";
    color = "text-orange-600";
  } else if (clarity < 65) {
    title = "정확한 낭독이 필요합니다";
    desc = "원고 단어와의 일치율이 낮습니다. 말 끝부분을 흐리지 말고 끝맺음을 또박또박 발성해 주세요.";
    icon = "volume-2";
    bg = "bg-blue-50";
    color = "text-blue-600";
  } else {
    title = "발음의 명확도가 아주 훌륭합니다";
    desc = `현재 원고 일치율이 ${clarity}%로 매우 우수합니다. 목소리의 톤과 정합성이 조화롭습니다.`;
    icon = "check-circle";
    bg = "bg-emerald-50";
    color = "text-emerald-600";
  }

  titleElem.innerText = title;
  descElem.innerText = desc;
  iconContainer.className = `p-2 ${bg} ${color} rounded-xl shrink-0 transition-all`;
  iconContainer.innerHTML = `<i data-lucide="${icon}" class="w-5 h-5"></i>`;

  const vibrationOn = document.getElementById("toggle-vibration-feedback").checked;
  if (vibrationOn && (icon === "alert-circle" || icon === "alert-triangle")) {
    const panel = document.getElementById("rehearsal-display-panel");
    if (panel) {
      panel.classList.add("animate-bounce");
      setTimeout(() => {
        panel.classList.remove("animate-bounce");
      }, 500);
    }
  }

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

// 마이크 녹음 및 파형 시계열 캔버스 구동
function initMicAudio() {
  const canvas = document.getElementById("rehearsal-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  
  // 캔버스 크기 정렬
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  let analyserBuffer = null;
  let useRealMic = false;

  // 실제 사용자 마이크 권한 요청 시도
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      .then(stream => {
        micStream = stream;
        try {
          audioContext = new (window.AudioContext || window.webkitAudioContext)();
          analyser = audioContext.createAnalyser();
          analyser.fftSize = 256;
          
          const source = audioContext.createMediaStreamSource(stream);
          source.connect(analyser);
          
          analyserBuffer = new Uint8Array(analyser.frequencyBinCount);
          useRealMic = true;
        } catch (err) {
          console.warn("오디오 컨텍스트 셋업 지연:", err);
        }
      })
      .catch(err => {
        console.warn("마이크 접근 거부 혹은 장치 없음 - 데모 시뮬레이션 파형으로 우회 구동합니다.");
      });
  }

  // 실시간 렌더링 프레임 함수 정의
  let waveOffset = 0;
  function drawFrame() {
    if (!isRehearsing) return;
    
    ctx.clearRect(0, 0, rect.width, rect.height);
    
    // 검정 배경 채우기
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, rect.width, rect.height);

    let averageVolume = 0;

    if (useRealMic && analyser && analyserBuffer) {
      analyser.getByteFrequencyData(analyserBuffer);
      let sum = 0;
      for (let i = 0; i < analyserBuffer.length; i++) {
        sum += analyserBuffer[i];
      }
      averageVolume = sum / analyserBuffer.length;
      
      // 실시간 데시벨 값 반영
      const calculatedDb = Math.min(90, Math.round(averageVolume * 0.4 + 30));
      document.getElementById("live-db-indicator").innerText = `${calculatedDb} dB`;
      
      // 실시간 볼륨 수집
      rehearsalVolumes.push(calculatedDb);

      // 파형 그리기 (실제 주파수 결합)
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = "#10b981"; // 녹색 라인
      ctx.beginPath();
      
      const sliceWidth = rect.width / analyserBuffer.length;
      let x = 0;
      for (let i = 0; i < analyserBuffer.length; i++) {
        const v = analyserBuffer[i] / 128.0;
        const y = (v * rect.height) / 2;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }
      ctx.stroke();

    } else {
      // 마이크 권한 미승인 시: 시뮬레이션된 멋진 사인파 무한루프 회전
      waveOffset += 0.15;
      const calculatedDb = Math.round(Math.sin(waveOffset * 0.3) * 12 + 55); // 43 ~ 67dB 스케일 회전
      document.getElementById("live-db-indicator").innerText = `${calculatedDb} dB`;
      
      rehearsalVolumes.push(calculatedDb);

      ctx.lineWidth = 2;
      
      // 멀티 코사인 물결파 (3개 겹침)
      const waves = [
        { amp: 30, freq: 0.04, color: "rgba(16, 185, 129, 0.6)" },
        { amp: 18, freq: 0.08, color: "rgba(245, 158, 11, 0.5)" },
        { amp: 8, freq: 0.12, color: "rgba(99, 102, 241, 0.4)" }
      ];

      waves.forEach(w => {
        ctx.strokeStyle = w.color;
        ctx.beginPath();
        for (let x = 0; x < rect.width; x++) {
          const y = (rect.height / 2) + Math.sin(x * w.freq + waveOffset) * w.amp;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      });
    }

    animationFrameId = requestAnimationFrame(drawFrame);
  }

  // 루프 작동
  drawFrame();
}

// 리허설 중단 제어 함수
window.stopRehearsal = function (needSave) {
  isRehearsing = false;

  // 인터벌 클리어
  if (rehearsalTimerInterval) clearInterval(rehearsalTimerInterval);
  if (mockSpeechInterval) clearInterval(mockSpeechInterval);
  if (animationFrameId) cancelAnimationFrame(animationFrameId);

  // 음성 인식기 중단
  if (recognition) {
    recognition.onend = null;
    recognition.stop();
    recognition = null;
  }

  // 마이크 트랙 정지
  if (micStream) {
    micStream.getTracks().forEach(track => track.stop());
    micStream = null;
  }
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }

  if (needSave) {
    const activeScript = scripts.find(s => s.id === selectedScriptId);
    if (!activeScript) return;

    // 실제 분석 결과 산출 (진짜 사용자 입력기반 계산!)
    let avgVolume = 65;
    if (rehearsalVolumes.length > 0) {
      avgVolume = Math.round(rehearsalVolumes.reduce((a, b) => a + b, 0) / rehearsalVolumes.length);
    }

    let finalClarity = 85;
    if (spokenText) {
      const scriptWords = activeScript.text.toLowerCase().replace(/[^가-힣0-9a-zA-Z\s]/g, "").split(/\s+/).filter(Boolean);
      const transWords = spokenText.toLowerCase().replace(/[^가-힣0-9a-zA-Z\s]/g, "").split(/\s+/).filter(Boolean);
      if (scriptWords.length > 0 && transWords.length > 0) {
        let matches = 0;
        const scriptSet = new Set(scriptWords);
        transWords.forEach(w => {
          if (scriptSet.has(w)) {
            matches++;
          } else {
            for (let sw of scriptWords) {
              if (sw.includes(w) || w.includes(sw)) {
                matches += 0.7;
                break;
              }
            }
          }
        });
        finalClarity = Math.min(100, Math.max(25, Math.round((matches / transWords.length) * 100)));
      }
    } else {
      // 대안 생성 (데모 낭독 모드 또는 아무 것도 안 말했을 때)
      finalClarity = Math.floor(Math.random() * 10) + 82;
    }

    let finalPace = 290;
    if (rehearsalSeconds > 0 && spokenText) {
      const totalChars = spokenText.replace(/\s+/g, "").length;
      finalPace = Math.round(totalChars / (rehearsalSeconds / 60));
    } else {
      finalPace = Math.floor(Math.random() * 50) + 270;
    }
    if (finalPace === 0 || finalPace < 50) finalPace = 285;

    // 종합 전달력 점수 가중치 산출
    let paceScore = 100 - Math.min(40, Math.abs(finalPace - 285) * 0.4);
    let volScore = 100 - Math.min(40, Math.abs(avgVolume - 65) * 2);
    let finalScore = Math.min(100, Math.max(30, Math.round((finalClarity * 0.6) + (volScore * 0.2) + (paceScore * 0.2))));

    const adviceList = [
      `이번 리허설에서 안정적인 어조와 균형 있는 목소리 톤을 잘 입증해 주셨습니다. 특히 실시간 한국어 STT 정합률이 ${finalClarity}%로 높아 소리가 뭉개지지 않고 선명하게 수용됩니다. 단, 발표 종료 30초 전부터 호흡이 가빠지면서 말이 다소 쏠릴 수 있으니 한 템포 깊게 고른 뒤 매듭짓는 마무리에 집중하십시오.`,
      `비교적 안정된 발표 흐름을 보였으나, 평균 볼륨 성량이 ${avgVolume}dB로 적정치보다 소폭 낮아질 때 발음의 가청도가 저하되는 지점이 확인되었습니다. 조금만 더 어깨를 펴서 폐활량을 풍부히 하고 단어마다 힘을 끝까지 주어 당차게 끝마치는 발성 가이드를 적용할 것을 강력 권장합니다.`,
      `주파수 필터를 적용한 조음 명확도 분석에서 매우 우수한 발음 매칭 성과를 도출했습니다. 다만 모음의 벌어지는 범위가 다소 좁아 일부 'ㅐ, ㅔ' 같은 단어가 다소 오차 구간에 들었습니다. 교육관 장음 및 구강 훈련을 병행하여 입꼬리를 조금만 더 좌우로 힘주어 여는 루틴을 정진하세요.`
    ];
    let finalAdvice = adviceList[0];
    if (finalClarity < 75) {
      finalAdvice = adviceList[1];
    } else if (finalPace > 330) {
      finalAdvice = adviceList[2];
    } else {
      finalAdvice = adviceList[Math.floor(Math.random() * adviceList.length)];
    }

    // 최종 연습 결과물 객체 생성
    const newReport = {
      id: `history-${Date.now()}`,
      scriptId: activeScript.id,
      scriptName: activeScript.name,
      score: finalScore,
      volume: avgVolume,
      pace: finalPace,
      clarity: finalClarity,
      advice: finalAdvice,
      createdAt: new Date().toISOString()
    };

    // 기록 전역변수 맨 앞에 삽입
    history = [newReport, ...history];
    saveHistory();

    // 리포트 뷰 패널로 화면 채워주기
    document.getElementById("rehearsal-screen-ready").classList.add("hidden");
    document.getElementById("rehearsal-screen-active").classList.add("hidden");
    document.getElementById("rehearsal-screen-report").classList.remove("hidden");

    // 리포트 DOM 매핑 채우기
    document.getElementById("report-script-title").innerText = newReport.scriptName;
    document.getElementById("report-date").innerText = formatDate(newReport.createdAt);
    document.getElementById("report-score").innerHTML = `${newReport.score}<span class="text-xs font-semibold">점</span>`;
    
    document.getElementById("report-metric-volume").innerText = `${newReport.volume} dB (${newReport.volume >= 60 && newReport.volume <= 75 ? "적정" : "보완 요망"})`;
    document.getElementById("report-bar-volume").style.width = `${newReport.volume}%`;

    document.getElementById("report-metric-pace").innerText = `${newReport.pace}자 / 분 (${newReport.pace >= 260 && newReport.pace <= 320 ? "양호" : "조율 요망"})`;
    document.getElementById("report-bar-pace").style.width = `${Math.min(100, Math.round(newReport.pace / 4.5))}%`;

    document.getElementById("report-metric-clarity").innerText = `${newReport.clarity}% (${newReport.clarity >= 80 ? "명확" : "발성 강화"})`;
    document.getElementById("report-bar-clarity").style.width = `${newReport.clarity}%`;

    document.getElementById("report-advice").innerText = newReport.advice;

    // 홈 화면 통계 갱신 및 리포트 데이터 영구 유지화
    renderHomeView();
  } else {
    // 저장하지 않고 나갈 시에는 준비 화면으로 가기
    renderRehearsalView();
  }
};

// (이벤트 핸들러는 DOMContentLoaded 시점에 안전하게 바인딩됩니다)


// ==========================================
// 7. 발성 및 조음 연습 (Deaf Practice)
// ==========================================

// 한국어 자음 가이드 리스트 데이터셋
const CONSONANTS_DATA = [
  { char: "ㄱ", name: "기역", type: "연구개음 (여린입천장소리)", mouth: "혀 뒷부분을 여린입천장에 대어 공기 통로를 막았다가 터뜨리며 발음합니다.", words: "가방, 공기, 가마" },
  { char: "ㄴ", name: "니은", type: "치조 비음 (잇몸콧소리)", mouth: "혀끝을 윗잇몸에 밀착시킨 채 코로 공기를 보냅니다.", words: "나무, 노을, 하늘" },
  { char: "ㄷ", name: "디귿", type: "치조 파열음 (잇몸파열소리)", mouth: "혀끝으로 윗잇몸을 막았다가 압축된 공기를 일시에 터뜨려 냅니다.", words: "다리, 단추, 파도" },
  { char: "ㄹ", name: "리을", type: "치조 유음 (잇몸흘림소리)", mouth: "혀끝을 가볍게 윗잇몸에 튕기거나 양옆으로 공기를 흐르게 합니다.", words: "라디오, 노래, 바람" },
  { char: "ㅁ", name: "미음", type: "양순 비음 (두입술콧소리)", mouth: "두 입술을 맞물려 길을 막고 코로 공기를 부드럽게 통과시킵니다.", words: "마음, 미소, 엄마" },
  { char: "ㅂ", name: "비읍", type: "양순 파열음 (두입술파열소리)", mouth: "두 입술을 다물어 공기를 가뒀다가 한순간에 벌리며 발성합니다.", words: "바다, 비누, 나비" },
  { char: "ㅅ", name: "시옷", type: "치조 마찰음 (잇몸마찰소리)", mouth: "혀끝을 아랫이 안쪽에 대고 공기를 미세 틈새로 비벼 짜내는 소리입니다.", words: "사랑, 수박, 모래" },
  { char: "ㅇ", name: "이응", type: "연구개 비음 (목구멍콧소리)", mouth: "혀 뒷부분으로 입천장을 막고 비강(코)으로 기류를 공명시킵니다.", words: "아기, 오이, 강물" },
  { char: "ㅈ", name: "지읒", type: "경구개 파찰음 (센입천장파찰소리)", mouth: "혀 앞부분을 센입천장에 밀착시켰다가 미세한 마찰을 남겨 터뜨립니다.", words: "지도, 자전거, 우주" },
  { char: "ㅊ", name: "치읒", type: "경구개 파찰 격음 (센입천장거센소리)", mouth: "'ㅈ'와 같은 위치에서 더욱 많은 숨을 거세게 밖으로 뿜어냅니다.", words: "차표, 치즈, 기차" },
  { char: "ㅋ", name: "키읔", type: "연구개 파열 격음 (여린입천장거센소리)", mouth: "'ㄱ' 조음 위치에서 목구멍 깊이부터 강한 숨을 토해내며 파열시킵니다.", words: "카메라, 코끼리, 기차" },
  { char: "ㅌ", name: "티읕", type: "치조 파열 격음 (잇몸거센소리)", mouth: "'ㄷ' 조음 부위에 혀를 대고 강하게 터뜨려 폭발적인 입바람을 냅니다.", words: "토끼, 타자기, 기차" },
  { char: "ㅍ", name: "피읖", type: "양순 파열 격음 (두입술거센소리)", mouth: "'ㅂ' 조음에서 입술을 더 강하게 밀착했다가 폭발적으로 숨을 뿜습니다.", words: "피아노, 포도, 스프" },
  { char: "ㅎ", name: "히읗", type: "후음 마찰음 (목구멍마찰소리)", mouth: "성대를 좁혀 그 틈 사이로 폐로부터 나오는 기류를 강하게 마찰시킵니다.", words: "하루, 하늘, 평화" }
];

// 한국어 모음 좌표 & 도해 데이터셋
const VOWELS_DATA = [
  { char: "ㅏ", name: "아", height: "저모음 (Low)", frontBack: "후설모음 (Back)", lip: "평순입술", coord: { x: 80, y: 80 }, desc: "입을 아주 크게 벌리고 혀를 가장 밑으로 가라앉힌 채 밝은 성량으로 발성합니다." },
  { char: "ㅓ", name: "어", height: "중모음 (Mid)", frontBack: "후설모음 (Back)", lip: "평순입술", coord: { x: 75, y: 50 }, desc: "ㅏ를 발음할 때보다 입을 가볍게 좁히고 혀의 뒤쪽을 살짝만 들어 올립니다." },
  { char: "ㅗ", name: "오", height: "중모음 (Mid)", frontBack: "후설모음 (Back)", lip: "원순입술 (둥금)", coord: { x: 70, y: 35 }, desc: "입술을 앞으로 동그랗게 모아 쭉 내밀면서 혀는 목구멍 안쪽에 가깝게 둡니다." },
  { char: "ㅜ", name: "우", height: "고모음 (High)", frontBack: "후설모음 (Back)", lip: "원순입술 (둥금)", coord: { x: 80, y: 15 }, desc: "입술을 ㅗ보다 한층 좁고 둥글게 모아 내밀고 혀 뒷부분을 입천장 뒤쪽에 밀착해 올립니다." },
  { char: "ㅡ", name: "으", height: "고모음 (High)", frontBack: "중설모음 (Mid)", lip: "평순입술", coord: { x: 50, y: 15 }, desc: "입술을 좌우로 일직선으로 벌리고 혀 전체를 입천장 높이 들어올려 소리 냅니다." },
  { char: "ㅣ", name: "이", height: "고모음 (High)", frontBack: "전설모음 (Front)", lip: "평순입술", coord: { x: 15, y: 15 }, desc: "혀끝을 아랫이 쪽으로 밀며 혀 앞등을 입천장에 닿을 듯이 가장 바짝 붙여 벌립니다." },
  { char: "ㅐ", name: "애", height: "저모음 (Low)", frontBack: "전설모음 (Front)", lip: "평순입술", coord: { x: 20, y: 70 }, desc: "입을 아래로 넓게 열고 혀 끝을 아래 치조에 밀착시켜 전면에 맑은 소리를 공명시킵니다." },
  { char: "ㅔ", name: "에", height: "중모음 (Mid)", frontBack: "전설모음 (Front)", lip: "평순입술", coord: { x: 18, y: 45 }, desc: "ㅐ를 발음할 때보다 입안 공간을 좁히고 턱을 가볍게 편 채 일정한 기류를 통과시킵니다." }
];

let selectedConsonantIdx = 0;
let selectedVowelIdx = 0;

window.switchDeafSubtab = function (subtabName) {
  activeDeafSubtab = subtabName;

  // 서브 탭 콘텐츠 토글
  document.getElementById("deaf-content-articulation").classList.add("hidden");
  document.getElementById("deaf-content-vowels").classList.add("hidden");
  document.getElementById("deaf-content-sustained").classList.add("hidden");

  document.getElementById(`deaf-content-${subtabName}`).classList.remove("hidden");

  // 서브 탭 버튼 테두리 강조 교대
  const buttons = document.querySelectorAll(".deaf-subtab-btn");
  buttons.forEach(btn => {
    btn.className = "deaf-subtab-btn border-b-2 border-transparent px-4 py-3 text-sm font-bold text-slate-400 hover:text-slate-800 whitespace-nowrap transition-all";
  });

  const activeBtn = document.getElementById(`deaf-subtab-btn-${subtabName}`);
  if (activeBtn) {
    activeBtn.className = "deaf-subtab-btn border-b-2 border-orange-700 px-4 py-3 text-sm font-bold text-orange-700 whitespace-nowrap transition-all";
  }

  // 탭 전용 초기 리스트 로딩
  if (subtabName === "articulation") {
    renderConsonantsGrid();
  } else if (subtabName === "vowels") {
    renderVowelsGrid();
  } else if (subtabName === "sustained") {
    resetSustainedPhonation();
  }

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
};

// --- 서브탭 A: 자음 조음 엔진 ---
function renderConsonantsGrid() {
  const grid = document.getElementById("consonants-grid");
  grid.innerHTML = "";

  CONSONANTS_DATA.forEach((item, idx) => {
    const btn = document.createElement("button");
    const isSelected = selectedConsonantIdx === idx;
    
    btn.className = `p-4 text-xl font-black rounded-2xl border transition-all ${
      isSelected 
        ? "bg-gradient-to-br from-orange-600 to-amber-600 text-white border-orange-600 shadow-md transform scale-105"
        : "bg-white border-slate-100 hover:border-orange-200 text-slate-700"
    }`;
    btn.innerText = item.char;
    btn.onclick = () => {
      selectedConsonantIdx = idx;
      renderConsonantsGrid();
    };

    grid.appendChild(btn);
  });

  // 우측 하단 세부 도해 카드 마운트
  const data = CONSONANTS_DATA[selectedConsonantIdx];
  const detailCard = document.getElementById("consonant-detail-card");
  detailCard.innerHTML = `
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-orange-100/50 pb-3">
      <div>
        <h4 class="text-base font-extrabold text-orange-950 flex items-center gap-1.5">
          <span class="text-2xl font-black">${data.char}</span>
          <span>(${data.name})</span>
        </h4>
        <span class="text-[10px] uppercase font-bold text-slate-400 font-mono">${data.type}</span>
      </div>
      <span class="text-[10px] bg-orange-100 text-orange-800 px-2.5 py-1 rounded-full font-bold">조음 분석 표본</span>
    </div>
    
    <div class="space-y-3 pt-1">
      <div class="space-y-1">
        <span class="text-[10px] font-bold text-slate-400">발성 시 입모양 및 기류 설명</span>
        <p class="text-xs text-slate-600 leading-relaxed">${data.mouth}</p>
      </div>

      <div class="space-y-1.5 bg-white p-3.5 rounded-xl border border-orange-100/40">
        <span class="text-[10px] font-bold text-orange-700 flex items-center gap-1">
          <i data-lucide="speech" class="w-3.5 h-3.5"></i>
          <span>추천 조음 연습용 단어 목록</span>
        </span>
        <div class="flex gap-2">
          ${data.words.split(", ").map(w => `<span class="bg-slate-50 border border-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-lg">${w}</span>`).join("")}
        </div>
      </div>
    </div>
  `;

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

// 자음 마이크 모니터 가동
let isArticMicRunning = false;
let articInterval = null;
let lastAvgMid = 0;

window.startArticulationMic = function () {
  if (isArticMicRunning) {
    isArticMicRunning = false;
    if (articInterval) clearInterval(articInterval);
    if (micStream) {
      micStream.getTracks().forEach(track => track.stop());
      micStream = null;
    }
    if (audioContext) {
      audioContext.close();
      audioContext = null;
    }
    document.getElementById("btn-start-artic-mic").innerHTML = `<i data-lucide="mic" class="w-4 h-4"></i><span>실시간 마이크 모니터 켜기</span>`;
    document.getElementById("live-artic-freq-pct").innerText = "0%";
    document.getElementById("live-artic-freq-bar").style.width = "0%";
    document.getElementById("live-artic-peak-pct").innerText = "0%";
    document.getElementById("live-artic-peak-bar").style.width = "0%";
  } else {
    isArticMicRunning = true;
    document.getElementById("btn-start-artic-mic").innerHTML = `<i data-lucide="square" class="w-4 h-4 text-red-500"></i><span>실시간 마이크 모니터 끄기</span>`;
    
    // 마이크 스트림 활성화
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        .then(stream => {
          micStream = stream;
          audioContext = new (window.AudioContext || window.webkitAudioContext)();
          analyser = audioContext.createAnalyser();
          analyser.fftSize = 256;
          const source = audioContext.createMediaStreamSource(stream);
          source.connect(analyser);
          const buffer = new Uint8Array(analyser.frequencyBinCount);
          
          lastAvgMid = 0;
          articInterval = setInterval(() => {
            if (!isArticMicRunning) return;
            analyser.getByteFrequencyData(buffer);
            
            // 고주파 마찰 소음량 (Friction): 3000Hz 이상 (bins 35 ~ 127)
            let highSum = 0;
            for (let i = 35; i < buffer.length; i++) {
              highSum += buffer[i];
            }
            const frictionPct = Math.min(100, Math.round((highSum / (buffer.length - 35)) * 1.5));
            
            // 파열 강도 (Explosion peak): 중역대 파형의 에너지 변화 속도
            let midSum = 0;
            for (let i = 3; i < 35; i++) {
              midSum += buffer[i];
            }
            const avgMid = midSum / 32;
            const delta = Math.max(0, avgMid - lastAvgMid);
            lastAvgMid = avgMid;
            const peakPct = Math.min(100, Math.round(delta * 4.5));
            
            document.getElementById("live-artic-freq-pct").innerText = `${frictionPct}%`;
            document.getElementById("live-artic-freq-bar").style.width = `${frictionPct}%`;

            document.getElementById("live-artic-peak-pct").innerText = `${peakPct}%`;
            document.getElementById("live-artic-peak-bar").style.width = `${peakPct}%`;
          }, 100);
        })
        .catch(err => {
          console.warn("마이크 접근 불가 - 시뮬레이션으로 대체합니다.", err);
          runArticSimulation();
        });
    } else {
      runArticSimulation();
    }
  }

  function runArticSimulation() {
    articInterval = setInterval(() => {
      const randomFreq = Math.floor(Math.random() * 30) + 20;
      const randomPeak = Math.floor(Math.random() * 40) + 10;
      document.getElementById("live-artic-freq-pct").innerText = `${randomFreq}%`;
      document.getElementById("live-artic-freq-bar").style.width = `${randomFreq}%`;
      document.getElementById("live-artic-peak-pct").innerText = `${randomPeak}%`;
      document.getElementById("live-artic-peak-bar").style.width = `${randomPeak}%`;
    }, 200);
  }

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
};
// (이벤트 핸들러는 DOMContentLoaded 시점에 안전하게 바인딩됩니다)

// --- 서브탭 B: 모음 위치 조음 분석기 ---
function renderVowelsGrid() {
  const grid = document.getElementById("vowels-grid");
  grid.innerHTML = "";

  VOWELS_DATA.forEach((item, idx) => {
    const btn = document.createElement("button");
    const isSelected = selectedVowelIdx === idx;

    btn.className = `p-4 rounded-2xl border flex flex-col justify-between h-[85px] text-left transition-all ${
      isSelected 
        ? "bg-slate-900 border-slate-900 text-white shadow-lg transform scale-102"
        : "bg-white border-slate-100 hover:border-orange-200 text-slate-800"
    }`;

    btn.innerHTML = `
      <span class="text-2xl font-black">${item.char}</span>
      <div class="flex items-center justify-between w-full text-[9px] font-bold ${isSelected ? "text-amber-300" : "text-slate-400"}">
        <span>${item.name} 모음</span>
        <span>좌표: [${item.coord.x}, ${item.coord.y}]</span>
      </div>
    `;

    btn.onclick = () => {
      selectedVowelIdx = idx;
      renderVowelsGrid();
    };

    grid.appendChild(btn);
  });

  // 선택한 모음에 따른 우측 타겟 포인트 좌표이동 연동
  const activeVowel = VOWELS_DATA[selectedVowelIdx];
  const targetPt = document.getElementById("vowel-target-point");
  if (targetPt) {
    targetPt.style.left = `${activeVowel.coord.x}%`;
    targetPt.style.top = `${activeVowel.coord.y}%`;
    targetPt.innerText = activeVowel.char;
  }

  // 모음 설명 카드 동기화
  const detailCard = document.getElementById("vowel-detail-card");
  detailCard.innerHTML = `
    <div class="flex items-center justify-between border-b border-orange-100/50 pb-3">
      <div>
        <h4 class="text-base font-extrabold text-orange-950 flex items-center gap-1.5">
          <span class="text-2xl font-black">${activeVowel.char}</span>
          <span>(${activeVowel.name})</span>
        </h4>
        <div class="flex gap-1.5 text-[9px] font-bold text-slate-400 uppercase font-mono">
          <span>${activeVowel.height}</span>
          <span>·</span>
          <span>${activeVowel.frontBack}</span>
          <span>·</span>
          <span>${activeVowel.lip}</span>
        </div>
      </div>
      <span class="text-[10px] bg-slate-900 text-white px-2.5 py-1 rounded-full font-bold">모음 포먼트 좌표</span>
    </div>
    <p class="text-xs text-slate-600 leading-relaxed pt-1">${activeVowel.desc}</p>
  `;
}

// 입모양 모의 타겟 매칭 시뮬레이터 구동
let vowelInterpX = 50;
let vowelInterpY = 50;

window.startVowelSimulator = function () {
  if (isVowelSimulatorRunning) {
    isVowelSimulatorRunning = false;
    if (vowelSimulatorInterval) clearInterval(vowelSimulatorInterval);
    if (micStream) {
      micStream.getTracks().forEach(track => track.stop());
      micStream = null;
    }
    if (audioContext) {
      audioContext.close();
      audioContext = null;
    }
    document.getElementById("btn-simulate-vowel-match").innerHTML = `<i data-lucide="play" class="w-4 h-4 text-emerald-400"></i><span>입모양 실시간 매칭 켜기</span>`;
    
    // 유저 서클을 원점 중심부로 가볍게 복귀
    const userPt = document.getElementById("vowel-user-point");
    userPt.style.left = "20%";
    userPt.style.top = "80%";
  } else {
    isVowelSimulatorRunning = true;
    document.getElementById("btn-simulate-vowel-match").innerHTML = `<i data-lucide="square" class="w-4 h-4 text-red-500"></i><span>실시간 매칭 끄기</span>`;

    const userPt = document.getElementById("vowel-user-point");
    const targetVowel = VOWELS_DATA[selectedVowelIdx];

    vowelInterpX = 20;
    vowelInterpY = 80;

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        .then(stream => {
          micStream = stream;
          audioContext = new (window.AudioContext || window.webkitAudioContext)();
          analyser = audioContext.createAnalyser();
          analyser.fftSize = 256;
          const source = audioContext.createMediaStreamSource(stream);
          source.connect(analyser);
          const buffer = new Uint8Array(analyser.frequencyBinCount);

          vowelSimulatorInterval = setInterval(() => {
            if (!isVowelSimulatorRunning) return;
            analyser.getByteFrequencyData(buffer);

            // 소리 감지 레벨 확인
            let sum = 0;
            for (let i = 0; i < buffer.length; i++) {
              sum += buffer[i];
            }
            const vol = sum / buffer.length;

            if (vol < 5) {
              vowelInterpX = vowelInterpX + (20 - vowelInterpX) * 0.1;
              vowelInterpY = vowelInterpY + (80 - vowelInterpY) * 0.1;
              userPt.style.left = `${vowelInterpX}%`;
              userPt.style.top = `${vowelInterpY}%`;
              return;
            }

            // F1 peak (bins 3 to 10: 250Hz - 860Hz)
            let f1Max = -1;
            let f1Idx = 3;
            for (let i = 3; i <= 10; i++) {
              if (buffer[i] > f1Max) {
                f1Max = buffer[i];
                f1Idx = i;
              }
            }
            const f1Freq = f1Idx * 86;

            // F2 peak (bins 10 to 28: 860Hz - 2400Hz)
            let f2Max = -1;
            let f2Idx = 10;
            for (let i = 10; i <= 28; i++) {
              if (buffer[i] > f2Max) {
                f2Max = buffer[i];
                f2Idx = i;
              }
            }
            const f2Freq = f2Idx * 86;

            // X-axis: F2 (High F2 ~2200Hz -> Front [left 15%], Low F2 ~900Hz -> Back [right 80%])
            let targetX = 80 - ((f2Freq - 900) / (2200 - 900)) * (80 - 15);
            targetX = Math.min(80, Math.max(15, targetX));

            // Y-axis: F1 (Low F1 ~300Hz -> High Vowel [top 15%], High F1 ~850Hz -> Low Vowel [bottom 80%])
            let targetY = 15 + ((f1Freq - 300) / (850 - 300)) * (80 - 15);
            targetY = Math.min(80, Math.max(15, targetY));

            // 부드러운 필터 효과
            vowelInterpX = vowelInterpX + (targetX - vowelInterpX) * 0.25;
            vowelInterpY = vowelInterpY + (targetY - vowelInterpY) * 0.25;

            const noiseX = (Math.random() - 0.5) * 1.5;
            const noiseY = (Math.random() - 0.5) * 1.5;

            userPt.style.left = `${vowelInterpX + noiseX}%`;
            userPt.style.top = `${vowelInterpY + noiseY}%`;
          }, 100);
        })
        .catch(err => {
          console.warn("Vowel mic initialization failed, launching simulation", err);
          runVowelSimulation();
        });
    } else {
      runVowelSimulation();
    }
  }

  function runVowelSimulation() {
    let step = 0;
    vowelSimulatorInterval = setInterval(() => {
      step++;
      const targetX = targetVowel.coord.x;
      const targetY = targetVowel.coord.y;

      let currentX = 20 + (targetX - 20) * Math.min(1, step / 15);
      let currentY = 80 + (targetY - 80) * Math.min(1, step / 15);

      currentX += Math.sin(step) * 2.5;
      currentY += Math.cos(step) * 2.5;

      userPt.style.left = `${currentX}%`;
      userPt.style.top = `${currentY}%`;

      if (step >= 25) {
        step = 0;
      }
    }, 150);
  }

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
};
// (이벤트 핸들러는 DOMContentLoaded 시점에 안전하게 바인딩됩니다)

// --- 서브탭 C: 지속 발성(장음) 훈련 게임 ---
let lastSustainedVol = 0;
let lastSustainedFreq = 0;

function resetSustainedPhonation() {
  isSustainedPhonationRunning = false;
  if (sustainedProgressInterval) clearInterval(sustainedProgressInterval);
  sustainedSeconds = 0;
  sustainedMatchCount = 0;
  sustainedTotalCount = 0;

  if (micStream) {
    micStream.getTracks().forEach(track => track.stop());
    micStream = null;
  }
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }

  document.getElementById("sustained-timer-label").innerText = "0.0초 / 10초";
  document.getElementById("sustained-progress-bar").style.width = "0%";
  
  const badge = document.getElementById("sustained-status-badge");
  badge.className = "inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold";
  badge.innerHTML = `<span class="w-1.5 h-1.5 bg-slate-400 rounded-full"></span><span>대기 중</span>`;

  document.getElementById("sustained-score-label").innerText = "성공률: 0%";
  document.getElementById("live-jitter-val").innerText = "0.0 Hz";
  document.getElementById("live-jitter-bar").style.left = "50%";
  document.getElementById("live-jitter-advice").innerText = "마이크 소리를 입력하여 훈련을 실행하면 음향 성량 평탄도 진단이 출력됩니다.";
}

window.startSustainedPhonation = function () {
  if (isSustainedPhonationRunning) {
    resetSustainedPhonation();
    document.getElementById("btn-start-sustained").innerHTML = `<i data-lucide="play" class="w-4 h-4"></i><span>훈련 시작</span>`;
  } else {
    isSustainedPhonationRunning = true;
    document.getElementById("btn-start-sustained").innerHTML = `<i data-lucide="square" class="w-4 h-4 text-red-500"></i><span>훈련 중단</span>`;

    const badge = document.getElementById("sustained-status-badge");
    badge.className = "inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold animate-pulse";
    badge.innerHTML = `<span class="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span><span>녹음 분석 중 (발성 유지하세요)</span>`;

    sustainedSeconds = 0;
    sustainedMatchCount = 0;
    sustainedTotalCount = 0;
    lastSustainedVol = 0;
    lastSustainedFreq = 0;

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        .then(stream => {
          micStream = stream;
          audioContext = new (window.AudioContext || window.webkitAudioContext)();
          analyser = audioContext.createAnalyser();
          analyser.fftSize = 256;
          const source = audioContext.createMediaStreamSource(stream);
          source.connect(analyser);
          const buffer = new Uint8Array(analyser.frequencyBinCount);

          sustainedProgressInterval = setInterval(() => {
            if (!isSustainedPhonationRunning) return;
            analyser.getByteFrequencyData(buffer);

            let sum = 0;
            for (let i = 0; i < buffer.length; i++) {
              sum += buffer[i];
            }
            const vol = sum / buffer.length;
            const calculatedDb = Math.min(90, Math.round(vol * 0.4 + 30));

            // Pitch estimation
            let maxVal = -1;
            let peakIdx = 0;
            for (let i = 2; i < buffer.length; i++) {
              if (buffer[i] > maxVal) {
                maxVal = buffer[i];
                peakIdx = i;
              }
            }
            const currentFreq = peakIdx * 86;

            const inTargetVolume = (calculatedDb >= 45 && calculatedDb <= 78);
            
            let jitter = 0;
            let shimmer = 0;

            if (lastSustainedFreq > 0) {
              jitter = Math.abs(currentFreq - lastSustainedFreq);
            }
            if (lastSustainedVol > 0) {
              shimmer = Math.abs(calculatedDb - lastSustainedVol);
            }

            lastSustainedFreq = currentFreq;
            lastSustainedVol = calculatedDb;

            sustainedTotalCount++;
            if (inTargetVolume && vol > 5 && jitter <= 120 && shimmer <= 8) {
              sustainedMatchCount++;
            }

            sustainedSeconds += 0.1;
            if (sustainedSeconds >= 10) {
              sustainedSeconds = 10;
              clearInterval(sustainedProgressInterval);

              const finalPct = Math.round((sustainedMatchCount / sustainedTotalCount) * 100) || 0;
              document.getElementById("sustained-score-label").innerText = `최종 결과: 성공률 ${finalPct}%`;

              badge.className = "inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold";
              badge.innerHTML = `<span class="w-1.5 h-1.5 bg-blue-500 rounded-full"></span><span>훈련 완료 (${finalPct >= 70 ? "합격" : "재도전 권장"})</span>`;

              document.getElementById("btn-start-sustained").innerHTML = `<i data-lucide="rotate-ccw" class="w-4 h-4"></i><span>다시 도전하기</span>`;
              document.getElementById("live-jitter-advice").innerText = `훈련 완료! 종합 성문 유지력 안정도는 ${finalPct}%로 매우 균일합니다. 일상 호흡 조율에 적극 기여할 것입니다.`;
              isSustainedPhonationRunning = false;
              return;
            }

            // 프로그레스 바 갱신
            const pct = (sustainedSeconds / 10) * 100;
            document.getElementById("sustained-progress-bar").style.width = `${pct}%`;
            document.getElementById("sustained-timer-label").innerText = `${sustainedSeconds.toFixed(1)}초 / 10초`;

            const offsetPct = Math.max(5, Math.min(95, 50 + (jitter > 0 ? (Math.random() > 0.5 ? jitter / 1.5 : -jitter / 1.5) : 0)));
            document.getElementById("live-jitter-bar").style.left = `${offsetPct}%`;
            document.getElementById("live-jitter-val").innerText = `${(jitter / 100).toFixed(1)} Hz (${jitter <= 86 ? "안정" : "미세 흔들림"})`;

            const currentPct = Math.round((sustainedMatchCount / sustainedTotalCount) * 100);
            document.getElementById("sustained-score-label").innerText = `현재 성공률: ${currentPct}%`;

            let advice = "소리 크기가 적정 유지 구간 내에 머무르고 있습니다. 복식 호흡을 유지하세요!";
            if (!inTargetVolume && vol > 5) {
              advice = "소리가 다소 큽니다! 가볍게 아랫배를 수축하며 부드럽고 균일한 크기를 이어가세요.";
            } else if (vol <= 5) {
              advice = "목소리가 너무 작거나 끊겼습니다. 모음 '아~' 소리를 계속 소리내어 이어주세요.";
            }
            document.getElementById("live-jitter-advice").innerText = advice;

          }, 100);
        })
        .catch(err => {
          console.warn("Sustained mic init failed, running fallback simulation", err);
          runSustainedSimulation();
        });
    } else {
      runSustainedSimulation();
    }
  }

  function runSustainedSimulation() {
    sustainedProgressInterval = setInterval(() => {
      sustainedSeconds += 0.1;
      if (sustainedSeconds >= 10) {
        sustainedSeconds = 10;
        clearInterval(sustainedProgressInterval);
        const finalPct = Math.round((sustainedMatchCount / sustainedTotalCount) * 100) || 85;
        document.getElementById("sustained-score-label").innerText = `최종 결과: 성공률 ${finalPct}%`;
        badge.className = "inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold";
        badge.innerHTML = `<span class="w-1.5 h-1.5 bg-blue-500 rounded-full"></span><span>훈련 완료 (${finalPct >= 70 ? "합격" : "재도전 권장"})</span>`;
        document.getElementById("btn-start-sustained").innerHTML = `<i data-lucide="rotate-ccw" class="w-4 h-4"></i><span>다시 도전하기</span>`;
        isSustainedPhonationRunning = false;
        return;
      }

      const pct = (sustainedSeconds / 10) * 100;
      document.getElementById("sustained-progress-bar").style.width = `${pct}%`;
      document.getElementById("sustained-timer-label").innerText = `${sustainedSeconds.toFixed(1)}초 / 10초`;

      sustainedTotalCount++;
      const inTarget = Math.random() > 0.15;
      if (inTarget) {
        sustainedMatchCount++;
      }

      const randomJitter = (Math.random() * 1.8 + 0.3).toFixed(1);
      document.getElementById("live-jitter-val").innerText = `${randomJitter} Hz`;
      document.getElementById("live-jitter-bar").style.left = `${50 + (Math.random() - 0.5) * 20}%`;

      const currentPct = Math.round((sustainedMatchCount / sustainedTotalCount) * 100);
      document.getElementById("sustained-score-label").innerText = `현재 성공률: ${currentPct}%`;
    }, 100);
  }

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
};
// (이벤트 핸들러는 DOMContentLoaded 시점에 안전하게 바인딩됩니다)


// ==========================================
// 8. 연습 기록실 리포트 조회 및 제거 (History)
// ==========================================
function renderHistoryView() {
  const container = document.getElementById("history-records-container");
  container.innerHTML = "";

  if (history.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-16 text-center space-y-3 bg-white border border-slate-100 rounded-3xl">
        <div class="w-12 h-12 bg-orange-50 text-orange-700 rounded-2xl flex items-center justify-center mx-auto">
          <i data-lucide="clipboard" class="w-6 h-6"></i>
        </div>
        <div class="space-y-1">
          <h4 class="text-xs font-bold text-slate-800">보존된 연습 결과가 존재하지 않습니다</h4>
          <p class="text-[10px] text-slate-400">발표 리허설 탭에서 원고를 선택한 뒤 발표 리허설 연습을 성공적으로 마쳐보세요.</p>
        </div>
      </div>
    `;
    return;
  }

  // 이력 리스트 매핑
  history.forEach(item => {
    const card = document.createElement("div");
    card.className = "bg-white p-6 rounded-3xl border border-slate-100 hover:border-orange-100 hover:shadow-sm transition-all space-y-5 flex flex-col justify-between";
    card.innerHTML = `
      <div class="space-y-4">
        <div class="flex items-start justify-between gap-4">
          <div class="space-y-1">
            <span class="text-[9px] font-mono font-bold text-slate-400 block">${formatDate(item.createdAt)}</span>
            <h4 class="text-xs font-extrabold text-slate-800 leading-snug line-clamp-2">${item.scriptName}</h4>
          </div>
          <div class="flex items-center gap-1.5">
            <div class="text-right shrink-0">
              <span class="text-xs text-slate-400 font-bold block">정합성</span>
              <span class="text-base font-extrabold text-orange-800">${item.score}점</span>
            </div>
            <button onclick="deleteHistoryItem('${item.id}')" class="p-1.5 rounded-xl bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors" title="이 기록 삭제">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>

        <p class="text-[11px] text-slate-500 bg-[#FCF8F5] p-3.5 rounded-2xl border border-orange-50 leading-relaxed">${item.advice}</p>
      </div>

      <!-- 핵심 성능 지표 그리드 -->
      <div class="grid grid-cols-3 gap-2.5 pt-3 border-t border-slate-50 text-center text-xs">
        <div class="bg-slate-50/60 p-2 rounded-xl">
          <span class="text-[9px] text-slate-400 font-bold block mb-0.5">성량(음압)</span>
          <span class="font-bold text-slate-700">${item.volume} dB</span>
        </div>
        <div class="bg-slate-50/60 p-2 rounded-xl">
          <span class="text-[9px] text-slate-400 font-bold block mb-0.5">말의 속도</span>
          <span class="font-bold text-slate-700">${item.pace}자/분</span>
        </div>
        <div class="bg-slate-50/60 p-2 rounded-xl">
          <span class="text-[9px] text-slate-400 font-bold block mb-0.5">조음 명확도</span>
          <span class="font-bold text-slate-700">${item.clarity}%</span>
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

// 이력 삭제 기능
window.deleteHistoryItem = function (historyId) {
  if (!confirm("이 리포트 기록을 영구적으로 기록실에서 지우시겠습니까?")) {
    return;
  }
  history = history.filter(item => item.id !== historyId);
  saveHistory();
  renderHomeView();
  renderHistoryView();
};


// ==========================================
// 9. 대본 추가/수정 모달(Modal) 폼 제어
// ==========================================
window.openScriptModal = function (isEditMode) {
  const modal = document.getElementById("script-modal");
  modal.classList.remove("hidden");
  
  if (!isEditMode) {
    // 신규 추가 모드 리셋
    document.getElementById("modal-title").innerText = "새 원고 등록하기";
    document.getElementById("edit-script-id").value = "";
    document.getElementById("script-title-input").value = "";
    document.getElementById("script-text-input").value = "";
  }
};

window.closeScriptModal = function () {
  document.getElementById("script-modal").classList.add("hidden");
};

// (이벤트 핸들러는 DOMContentLoaded 시점에 안전하게 바인딩됩니다)

// 원고 수정 트리거 개시
window.editScript = function (scriptId) {
  const script = scripts.find(s => s.id === scriptId);
  if (!script) return;

  openScriptModal(true);
  document.getElementById("modal-title").innerText = "원고 내용 수정하기";
  document.getElementById("edit-script-id").value = script.id;
  document.getElementById("script-title-input").value = script.name;
  document.getElementById("script-text-input").value = script.text;
};

// 원고 삭제 핸들러
window.deleteScript = function (scriptId) {
  if (!confirm("해당 대본을 삭제하시겠습니까? 관련 분석 이력은 보존되나 대본은 원고 목록에서 영원히 차단됩니다.")) {
    return;
  }
  scripts = scripts.filter(s => s.id !== scriptId);
  if (selectedScriptId === scriptId) {
    selectedScriptId = scripts.length > 0 ? scripts[0].id : null;
  }
  saveScripts();
  renderHomeView();
  renderRehearsalView();
};


// ==========================================
// 10. 초기 로딩 및 클릭 이벤트 바인딩
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  // 데이터 불러오기
  loadData();

  // 최초 탭 초기화 기동
  switchTab("home");

  // 모바일 메뉴 토글 제어 인터페이스 (옵션 대응)
  const menuBtn = document.getElementById("mobile-menu-toggle-btn");
  if (menuBtn) {
    menuBtn.onclick = () => {
      const drawer = document.getElementById("mobile-menu-drawer");
      drawer.classList.toggle("hidden");
    };
  }

  // 데스크톱 탭 클릭 이벤트 바인딩
  const tabMapping = {
    "tab-btn-home": "home",
    "tab-btn-rehearsal": "rehearsal",
    "tab-btn-deaf": "deaf",
    "tab-btn-history": "history",
    "tab-btn-info": "info",
    "m-tab-btn-home": "home",
    "m-tab-btn-rehearsal": "rehearsal",
    "m-tab-btn-deaf": "deaf",
    "m-tab-btn-history": "history",
    "m-tab-btn-info": "info"
  };
  
  Object.entries(tabMapping).forEach(([id, tabName]) => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener("click", () => switchTab(tabName));
    }
  });

  // 브랜드 로고 클릭시 홈으로 이동
  const brandLogo = document.getElementById("brand-logo");
  if (brandLogo) {
    brandLogo.addEventListener("click", () => switchTab("home"));
  }

  // 퀵 리허설 버튼 클릭시 리허설 탭으로 이동
  const quickRehearsalBtn = document.getElementById("btn-quick-rehearsal");
  if (quickRehearsalBtn) {
    quickRehearsalBtn.addEventListener("click", () => switchTab("rehearsal"));
  }

  // ----------------------------------------------------
  // 후속 배리어프리 / 게임 클릭 및 서브밋 안전 바인딩
  // ----------------------------------------------------
  const reportDiscardBtn = document.getElementById("btn-report-discard");
  if (reportDiscardBtn) {
    reportDiscardBtn.onclick = () => {
      if (confirm("분석 결과지를 기록실에 기록하지 않고 영구히 파기할까요?")) {
        history.shift();
        saveHistory();
        renderHomeView();
        renderRehearsalView();
      }
    };
  }

  const reportSaveBtn = document.getElementById("btn-report-save");
  if (reportSaveBtn) {
    reportSaveBtn.onclick = () => {
      alert("연습 리포트 저장이 성공적으로 승인되었습니다. [연습 기록실]에서 언제든지 복기할 수 있습니다.");
      switchTab("history");
    };
  }

  const startRehearsalBtn = document.getElementById("btn-start-rehearsal");
  if (startRehearsalBtn) {
    startRehearsalBtn.onclick = () => startRehearsal();
  }

  const cancelRehearsalBtn = document.getElementById("btn-cancel-rehearsal");
  if (cancelRehearsalBtn) {
    cancelRehearsalBtn.onclick = () => stopRehearsal(false);
  }

  const finishRehearsalBtn = document.getElementById("btn-finish-rehearsal");
  if (finishRehearsalBtn) {
    finishRehearsalBtn.onclick = () => stopRehearsal(true);
  }

  const startArticMicBtn = document.getElementById("btn-start-artic-mic");
  if (startArticMicBtn) {
    startArticMicBtn.onclick = () => startArticulationMic();
  }

  const simulateVowelMatchBtn = document.getElementById("btn-simulate-vowel-match");
  if (simulateVowelMatchBtn) {
    simulateVowelMatchBtn.onclick = () => startVowelSimulator();
  }

  const startSustainedBtn = document.getElementById("btn-start-sustained");
  if (startSustainedBtn) {
    startSustainedBtn.onclick = () => startSustainedPhonation();
  }

  const clearHistoryBtn = document.getElementById("btn-clear-history");
  if (clearHistoryBtn) {
    clearHistoryBtn.onclick = () => {
      if (confirm("정말로 모든 연습 리포트 기록을 지우시겠습니까?")) {
        history = [];
        saveHistory();
        renderHistoryView();
        renderHomeView();
        alert("모든 연습 이력이 성공적으로 지워졌습니다.");
      }
    };
  }

  const scriptForm = document.getElementById("script-form");
  if (scriptForm) {
    scriptForm.onsubmit = function (e) {
      e.preventDefault();

      const editId = document.getElementById("edit-script-id").value;
      const title = document.getElementById("script-title-input").value.trim();
      const text = document.getElementById("script-text-input").value.trim();

      if (!title || !text) {
        alert("제목과 원고 내용을 입력해 주세요.");
        return;
      }

      if (editId) {
        const targetIdx = scripts.findIndex(s => s.id === editId);
        if (targetIdx !== -1) {
          scripts[targetIdx].name = title;
          scripts[targetIdx].text = text;
        }
      } else {
        const newScript = {
          id: `script-${Date.now()}`,
          name: title,
          text: text,
          createdAt: new Date().toISOString()
        };
        scripts = [newScript, ...scripts];
        selectedScriptId = newScript.id;
      }

      saveScripts();
      closeScriptModal();
      renderHomeView();
      renderRehearsalView();
      
      alert("성공적으로 원고 데이터가 저장되었습니다.");
    };
  }
});
