/**
 * Claude Certified Grand Slam Master - Main Application Logic
 */

// Application State
const AppState = {
  currentTab: 'roadmap',
  selectedExam: 'all',
  textbookExam: 'roadmap',
  practiceFilters: {
    exam: 'all',
    difficulty: 'all',
    category: 'all',
    search: ''
  },
  userAnswers: {}, // { questionId: { selected: [indexes], isCorrect: bool, timestamp: number } }
  pendingSelections: {}, // { questionId: [selectedIndexes] } for multi-choice
  bookmarks: new Set(),
  weaknesses: new Set(),
  readChapters: new Set(), // Set of chapterIds marked as read
  mockExam: {
    isActive: false,
    examCode: 'CCAR-F',
    questions: [],
    currentIndex: 0,
    answers: {}, // { questionId: [indexes] }
    flags: new Set(),
    timeRemaining: 120 * 60, // 120 minutes in seconds
    timerInterval: null,
    isSubmitted: false,
    result: null
  },
  theme: 'dark'
};

// Lucide-style SVG Icons helper with explicit width/height
const Icons = {
  compass: '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>',
  book: '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>',
  helpCircle: '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
  clock: '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',
  target: '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>',
  fileText: '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>',
  award: '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>',
  bookmark: '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>',
  flag: '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>',
  checkCircle: '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
  alertTriangle: '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
  sun: '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>',
  moon: '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>',
  chevronRight: '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>',
  refresh: '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>'
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  loadLocalStorage();
  setupEventListeners();
  renderApp();
  updateProgressUI();
});

// Load saved data from LocalStorage
function loadLocalStorage() {
  try {
    const savedAnswers = localStorage.getItem('claude_exam_answers');
    if (savedAnswers) AppState.userAnswers = JSON.parse(savedAnswers);

    const savedBookmarks = localStorage.getItem('claude_exam_bookmarks');
    if (savedBookmarks) AppState.bookmarks = new Set(JSON.parse(savedBookmarks));

    const savedWeaknesses = localStorage.getItem('claude_exam_weaknesses');
    if (savedWeaknesses) AppState.weaknesses = new Set(JSON.parse(savedWeaknesses));

    const savedReadChapters = localStorage.getItem('claude_read_chapters');
    if (savedReadChapters) AppState.readChapters = new Set(JSON.parse(savedReadChapters));

    const savedTheme = localStorage.getItem('claude_app_theme');
    if (savedTheme) {
      AppState.theme = savedTheme;
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  } catch (e) {
    console.error('Failed to load local storage:', e);
  }
}

// Save data to LocalStorage
function saveLocalStorage() {
  try {
    localStorage.setItem('claude_exam_answers', JSON.stringify(AppState.userAnswers));
    localStorage.setItem('claude_exam_bookmarks', JSON.stringify(Array.from(AppState.bookmarks)));
    localStorage.setItem('claude_exam_weaknesses', JSON.stringify(Array.from(AppState.weaknesses)));
    localStorage.setItem('claude_read_chapters', JSON.stringify(Array.from(AppState.readChapters)));
    localStorage.setItem('claude_app_theme', AppState.theme);
  } catch (e) {
    console.error('Failed to save to local storage:', e);
  }
}

// Event Listeners
function setupEventListeners() {
  // Navigation tabs
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      const tab = item.getAttribute('data-tab');
      if (tab) {
        switchTab(tab);
      }
    });
  });

  // Mobile menu toggle
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const sidebar = document.getElementById('sidebar');
  if (mobileBtn && sidebar) {
    mobileBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  // Theme toggle
  const themeBtn = document.getElementById('themeToggleBtn');
  if (themeBtn) {
    themeBtn.addEventListener('click', toggleTheme);
  }

  // Reset progress modal
  const resetBtn = document.getElementById('resetProgressBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', openResetModal);
  }

  // Search input
  const searchInput = document.getElementById('globalSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      handleGlobalSearch(e.target.value);
    });
  }
}

// Toggle Theme (Dark / Light)
function toggleTheme() {
  AppState.theme = AppState.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', AppState.theme);
  const themeBtn = document.getElementById('themeToggleBtn');
  if (themeBtn) {
    themeBtn.innerHTML = AppState.theme === 'dark' ? Icons.sun : Icons.moon;
  }
  saveLocalStorage();
}

// ==========================================================================
// Progress Reset & Modal Management (Exam-specific & Full Reset)
// ==========================================================================

// Open Reset Modal
function openResetModal() {
  const modal = document.getElementById('resetProgressModal');
  if (!modal) return;
  renderResetModalContent();
  modal.classList.add('open');
}

// Close Reset Modal
function closeResetModal() {
  const modal = document.getElementById('resetProgressModal');
  if (modal) modal.classList.remove('open');
}

// Handle Overlay Click
function handleModalOverlayClick(e) {
  if (e.target && e.target.id === 'resetProgressModal') {
    closeResetModal();
  }
}

// Render Modal Content
function renderResetModalContent() {
  const body = document.getElementById('resetModalBody');
  if (!body) return;

  const exams = [
    { code: 'CCDV-F', title: 'CCDV-F (Developer Foundations)', desc: 'API / MCP / Tool Use / Caching' },
    { code: 'CCAO-F', title: 'CCAO-F (Associate Foundations)', desc: 'プロンプト / 活用 / ガバナンス' },
    { code: 'CCAR-F', title: 'CCAR-F (Architect Foundations)', desc: 'エージェント5大設計 / RAG / 耐障害性' },
    { code: 'CCAR-P', title: 'CCAR-P (Architect Professional)', desc: 'マルチクラウド / 評価パイプライン / 安全性' },
    { code: 'minorun', title: '🔥 みのるん式特訓', desc: 'CCAR-F 引っかけ・落とし穴特訓 18問' }
  ];

  let html = `
    <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 6px;">
      再挑戦したい試験の「解いた問題の履歴」を一式リセットできます。<br>
      ※対象試験の解答データ・正誤判定が初期化されます（ブックマークや教本読了状態は保持されます）。
    </p>
  `;

  exams.forEach(item => {
    let questions = [];
    if (item.code === 'minorun') {
      questions = QUESTIONS_DATA.filter(q => q.specialTag === 'みのるん式特訓');
    } else {
      questions = QUESTIONS_DATA.filter(q => q.exam === item.code);
    }
    const totalCount = questions.length;
    const answeredCount = questions.filter(q => AppState.userAnswers[q.id]).length;
    const correctCount = questions.filter(q => AppState.userAnswers[q.id]?.isCorrect).length;
    const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
    const pct = totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;

    html += `
      <div class="reset-exam-card">
        <div class="reset-exam-info">
          <div class="reset-exam-title">
            <span>${item.title}</span>
          </div>
          <div class="reset-exam-stats">
            解答進捗: <strong>${answeredCount}</strong> / ${totalCount}問 (${pct}%) 
            ${answeredCount > 0 ? `| 正答率: <strong>${accuracy}%</strong> (${correctCount}問正解)` : ''}
          </div>
        </div>
        <button class="btn-reset-exam" ${answeredCount === 0 ? 'disabled' : ''} onclick="resetExamProgress('${item.code}')">
          ${Icons.refresh} この試験をリセット
        </button>
      </div>
    `;
  });

  body.innerHTML = html;
}

/**
 * 試験ごとに解いた問題を一式リセットする
 * @param {string} examCode - 'CCAO-F', 'CCDV-F', 'CCAR-F', 'CCAR-P', 'minorun', 'all'
 */
function resetExamProgress(examCode) {
  const examTitles = {
    'CCDV-F': 'CCDV-F (Developer Foundations)',
    'CCAO-F': 'CCAO-F (Associate Foundations)',
    'CCAR-F': 'CCAR-F (Architect Foundations)',
    'CCAR-P': 'CCAR-P (Architect Professional)',
    'minorun': '🔥 みのるん式特訓',
    'all': '全資格（全問題）'
  };

  const displayName = examTitles[examCode] || examCode;
  let targetQuestions = [];

  if (examCode === 'minorun') {
    targetQuestions = QUESTIONS_DATA.filter(q => q.specialTag === 'みのるん式特訓');
  } else if (examCode === 'all') {
    targetQuestions = QUESTIONS_DATA;
  } else {
    targetQuestions = QUESTIONS_DATA.filter(q => q.exam === examCode);
  }

  const targetIds = targetQuestions.map(q => q.id);
  const answeredQuestions = targetQuestions.filter(q => AppState.userAnswers[q.id]);
  const answeredCount = answeredQuestions.length;

  if (answeredCount === 0) {
    alert(`【${displayName}】にはまだ解答履歴がありません。`);
    return;
  }

  const confirmMsg = examCode === 'all'
    ? `【全資格（全問題）】の解答履歴（計 ${answeredCount}問）を一括リセットしますか？\n\n※全問の解答状況と正誤判定が未解答に戻ります。\n※ブックマークや教本読了状態は保持されます。`
    : `【${displayName}】の解答履歴（${answeredCount}問分）を一式リセットしますか？\n\n※この試験の解答状況と正誤判定が初期化され、最初から解き直せます。\n※他試験の解答履歴、ブックマーク、教本の読了状況は保持されます。`;

  if (!confirm(confirmMsg)) return;

  targetIds.forEach(id => {
    delete AppState.userAnswers[id];
    delete AppState.pendingSelections[id];
    AppState.weaknesses.delete(id);
  });

  saveLocalStorage();
  updateProgressUI();
  renderApp();

  const modal = document.getElementById('resetProgressModal');
  if (modal && modal.classList.contains('open')) {
    renderResetModalContent();
  }

  alert(`【${displayName}】の解答履歴（${answeredCount}問）をリセットしました。`);
}

// Complete Full Reset (All progress, bookmarks, and chapters)
function confirmFullReset() {
  if (confirm('【警告】すべての試験の解答履歴、ブックマーク、誤答リスト、教本読了状態をすべて完全に初期化しますか？')) {
    AppState.userAnswers = {};
    AppState.pendingSelections = {};
    AppState.bookmarks.clear();
    AppState.weaknesses.clear();
    AppState.readChapters.clear();
    saveLocalStorage();
    updateProgressUI();
    renderApp();
    closeResetModal();
    alert('すべての学習データを完全初期化しました。');
  }
}

// Legacy alias
function confirmResetProgress() {
  openResetModal();
}

// Switch Tab
function switchTab(tabId) {
  AppState.currentTab = tabId;
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.getAttribute('data-tab') === tabId);
  });

  // Close mobile sidebar if open
  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.classList.remove('open');

  renderApp();
}

// Global Render Router
function renderApp() {
  const container = document.getElementById('contentContainer');
  if (!container) return;

  switch (AppState.currentTab) {
    case 'ccdv-special':
      renderCcdvSpecialView(container);
      break;
    case 'roadmap':
      renderRoadmapView(container);
      break;
    case 'textbook':
      renderTextbookView(container);
      break;
    case 'practice':
      renderPracticeView(container);
      break;
    case 'mock':
      renderMockExamView(container);
      break;
    case 'weakness':
      renderWeaknessView(container);
      break;
    case 'cheatsheet':
      renderCheatsheetView(container);
      break;
    default:
      renderRoadmapView(container);
  }
}

// Update Overall Progress
function updateProgressUI() {
  const totalQuestions = QUESTIONS_DATA.length;
  const answeredCount = Object.keys(AppState.userAnswers).length;
  const correctCount = Object.values(AppState.userAnswers).filter(a => a.isCorrect).length;

  const percentage = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;
  const progressBar = document.getElementById('overallProgressBar');
  const progressText = document.getElementById('overallProgressText');

  if (progressBar) progressBar.style.width = `${percentage}%`;
  if (progressText) progressText.textContent = `${percentage}% (${answeredCount}/${totalQuestions}問)`;

  // Update badges
  const weaknessCount = AppState.weaknesses.size;
  const weaknessBadge = document.getElementById('weaknessCountBadge');
  if (weaknessBadge) weaknessBadge.textContent = weaknessCount;
}

// ==========================================================================
// 1. ROADMAP & STRATEGY VIEW
// ==========================================================================
function renderRoadmapView(container) {
  const roadmapData = TEXTBOOKS_DATA.roadmap;
  let html = `
    <div class="view-hero">
      <span class="view-hero-badge">Grand Slam Strategy</span>
      <h2>${roadmapData.title}</h2>
      <p>${roadmapData.subtitle}</p>
    </div>

    <div class="textbook-body">
  `;

  roadmapData.sections.forEach(sec => {
    html += `
      <div class="textbook-chapter-card">
        <div class="chapter-title-group">
          <h2>${sec.title}</h2>
        </div>
        <div class="markdown-content">
          ${renderMarkdown(sec.content)}
        </div>
      </div>
    `;
  });

  html += `
    <div class="textbook-chapter-card" style="border-left: 4px solid var(--accent-primary);">
      <div class="chapter-title-group">
        <h2>4. 今すぐ学習を始める</h2>
      </div>
      <p style="margin-bottom: 16px; color: var(--text-secondary);">
        まずは最平易な「CCDV-F（Developer）」または「CCAO-F（Associate）」の教科書から読み進めるか、実践問題集で現在の実力を試してみましょう。
      </p>
      <div style="display: flex; gap: 12px; flex-wrap: wrap;">
        <button class="btn-primary" onclick="switchTab('ccdv-special')">
          🚀 CCDV-F 特化教本を開く
        </button>
        <button class="btn-secondary" onclick="switchPracticeExam('CCDV-F')">
          ${Icons.helpCircle} CCDV-F 実戦問題を解く
        </button>
      </div>
    </div>
  </div>`;

  container.innerHTML = html;
}

// ==========================================================================
// CCDV-F DEDICATED VIEW (Developer Foundations Special Guide)
// ==========================================================================
function renderCcdvSpecialView(container) {
  const ccdvBook = TEXTBOOKS_DATA.ccdv;
  const totalChapters = ccdvBook.sections.length; // 8
  const readCount = ccdvBook.sections.filter(sec => AppState.readChapters.has(sec.id)).length;
  const readPercent = Math.round((readCount / totalChapters) * 100);

  // Calculate CCDV questions stats
  const ccdvQuestions = QUESTIONS_DATA.filter(q => q.exam === 'CCDV-F');
  const answeredCCDV = ccdvQuestions.filter(q => AppState.userAnswers[q.id]);
  const correctCCDV = answeredCCDV.filter(q => AppState.userAnswers[q.id].isCorrect);
  const ccdvAccuracy = answeredCCDV.length > 0 ? Math.round((correctCCDV.length / answeredCCDV.length) * 100) : 0;

  let html = `
    <!-- Hero Banner with Exam Specs -->
    <div class="ccdv-hero-banner">
      <div class="ccdv-badge-row">
        <span class="badge-dev-tag">Developer Foundations</span>
        <span class="badge-priority-tag">🚀 第一優先推奨・最速合格ルート</span>
        <span style="font-size: 11px; color: var(--text-muted); margin-left: auto;">出題範囲 8大テーマ完全網羅</span>
      </div>

      <h2 style="font-size: 24px; font-weight: 800; color: var(--text-primary); margin-bottom: 8px;">
        CCDV-F 特化完全教本 & 直前対策
      </h2>
      <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 16px;">
        開発者向け公式認定資格「Claude Certified Developer – Foundations」を最短で満点合格するための特化カリキュラム。
        Messages API、ストリーミング(SSE)、Prompt Caching境界値、Tool Use、MCP、Claude Code、Batch APIの全8章を体系的に学習できます。
      </p>

      <!-- Exam Key Metrics Grid -->
      <div class="ccdv-stats-grid">
        <div class="ccdv-stat-card">
          <div class="label">本番出題数</div>
          <div class="value" style="color: var(--accent-primary);">53問</div>
        </div>
        <div class="ccdv-stat-card">
          <div class="label">試験制限時間</div>
          <div class="value">120分</div>
        </div>
        <div class="ccdv-stat-card">
          <div class="label">合格ライン</div>
          <div class="value" style="color: var(--success);">720 / 1000点</div>
        </div>
        <div class="ccdv-stat-card">
          <div class="label">体感難易度</div>
          <div class="value" style="color: #48bb78;">★★☆☆☆ (最平易)</div>
        </div>
        <div class="ccdv-stat-card">
          <div class="label">教本読了進捗</div>
          <div class="value" id="ccdvReadStatus" style="color: var(--accent-primary);">${readCount} / ${totalChapters} 章 (${readPercent}%)</div>
        </div>
        <div class="ccdv-stat-card">
          <div class="label">CCDV問題習熟度</div>
          <div class="value" style="color: var(--accent-primary);">${answeredCCDV.length} / ${ccdvQuestions.length}問 (${ccdvAccuracy}%)</div>
        </div>
      </div>

      <!-- Quick Action Buttons -->
      <div class="ccdv-quick-actions">
        <button class="btn-ccdv-action primary" onclick="goToCcdvPractice()">
          ${Icons.helpCircle} CCDV-F 実践問題集 (${ccdvQuestions.length}問) を解く
        </button>
        <button class="btn-ccdv-action secondary" onclick="goToCcdvMock()">
          ${Icons.clock} CCDV-F 本番模擬試験 (120分) を開始
        </button>
        <button class="btn-ccdv-action secondary" onclick="switchTab('cheatsheet')">
          ${Icons.fileText} 必須チートシート（API早見表）
        </button>
        ${answeredCCDV.length > 0 ? `
          <button class="btn-reset-exam" style="padding: 8px 16px; border-radius: var(--radius-md);" onclick="resetExamProgress('CCDV-F')">
            ${Icons.refresh} CCDV-F 解答リセット (${answeredCCDV.length}問済)
          </button>
        ` : ''}
      </div>
    </div>

    <!-- Layout: TOC on left, Chapters on right -->
    <div class="textbook-layout">
      <!-- Table of Contents -->
      <aside class="textbook-toc">
        <h3>CCDV-F カリキュラム (全8章)</h3>
        <ul class="toc-list">
          ${ccdvBook.sections.map((sec, idx) => {
            const isRead = AppState.readChapters.has(sec.id);
            return `
              <li>
                <a href="#${sec.id}" class="toc-link ${idx === 0 ? 'active' : ''}" onclick="smoothScrollTo(event, '${sec.id}')">
                  <span style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                    <span>${sec.title.split('：')[0]}</span>
                    <span style="font-size: 11px; font-weight: 700; color: ${isRead ? 'var(--success)' : 'var(--text-muted)'};">
                      ${isRead ? '✓ 読了' : '未'}
                    </span>
                  </span>
                </a>
              </li>
            `;
          }).join('')}
        </ul>
      </aside>

      <!-- Main Chapter Cards -->
      <main class="textbook-body">
        ${ccdvBook.sections.map((sec, idx) => {
          const isRead = AppState.readChapters.has(sec.id);
          return `
            <article id="${sec.id}" class="textbook-chapter-card">
              <!-- Chapter Header Bar -->
              <div class="chapter-meta-bar">
                <div>
                  <span class="chapter-weight-pill">${sec.weight || '重要度: ★★★'}</span>
                  ${(sec.keyTopics || []).map(t => `<span style="font-size: 11px; margin-left: 6px; padding: 2px 7px; border-radius: var(--radius-full); background: var(--bg-tertiary); color: var(--text-muted); border: 1px solid var(--border-subtle);">${t}</span>`).join('')}
                </div>
                <button class="read-toggle-btn ${isRead ? 'completed' : ''}" onclick="toggleChapterRead('${sec.id}')">
                  ${isRead ? '✓ 読了済み (完了)' : '◯ 読了済みにする'}
                </button>
              </div>

              <!-- Title -->
              <div class="chapter-title-group" style="margin-bottom: 16px;">
                <h2 style="font-size: 20px; font-weight: 700; color: var(--text-primary);">${sec.title}</h2>
              </div>

              <!-- Markdown Content -->
              <div class="markdown-content">
                ${renderMarkdown(sec.content)}
              </div>

              <!-- Action Link at Bottom of Chapter -->
              <div style="margin-top: 24px; padding-top: 14px; border-top: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                <button class="read-toggle-btn ${isRead ? 'completed' : ''}" onclick="toggleChapterRead('${sec.id}')">
                  ${isRead ? '✓ 読了済み' : '◯ 読了済みにする'}
                </button>
                <button class="btn-secondary" style="font-size: 12.5px; padding: 6px 14px;" onclick="goToCcdvPractice()">
                  ${Icons.helpCircle} CCDV-F 問題集で実力を試す
                </button>
              </div>
            </article>
          `;
        }).join('')}
      </main>
    </div>
  `;

  container.innerHTML = html;
}

function toggleChapterRead(chapterId) {
  if (AppState.readChapters.has(chapterId)) {
    AppState.readChapters.delete(chapterId);
  } else {
    AppState.readChapters.add(chapterId);
  }
  saveLocalStorage();
  renderApp();
}

function goToCcdvPractice() {
  AppState.practiceFilters.exam = 'CCDV-F';
  switchTab('practice');
}

function goToCcdvMock() {
  switchTab('mock');
  startMockExam('CCDV-F');
}

// ==========================================================================
// 2. TEXTBOOK VIEW
// ==========================================================================
function renderTextbookView(container) {
  const examKeys = [
    { key: 'roadmap', label: '攻略ロードマップ', code: 'ALL' },
    { key: 'ccao', label: 'CCAO-F (Associate)', code: 'CCAO-F' },
    { key: 'ccdv', label: 'CCDV-F (Developer)', code: 'CCDV-F' },
    { key: 'ccar_f', label: 'CCAR-F (Architect-F)', code: 'CCAR-F ★最難関' },
    { key: 'ccar_p', label: 'CCAR-P (Architect-P)', code: 'CCAR-P' }
  ];

  const currentBook = TEXTBOOKS_DATA[AppState.textbookExam] || TEXTBOOKS_DATA.ccdv;

  let html = `
    <div class="view-hero">
      <span class="view-hero-badge">${currentBook.badge || 'Textbook'}</span>
      <h2>${currentBook.title}</h2>
      <p>${currentBook.subtitle}</p>
    </div>

    <!-- Exam Selector Pills -->
    <div class="exam-selector-pills">
      <button class="exam-pill" style="border-color: var(--accent-primary); color: var(--accent-primary); font-weight: 700;" onclick="switchTab('ccdv-special')">
        🚀 CCDV-F 特化教本 (最優先)
      </button>
      ${examKeys.map(k => `
        <button class="exam-pill ${AppState.textbookExam === k.key ? 'active' : ''}" onclick="switchTextbookExam('${k.key}')">
          ${k.label}
        </button>
      `).join('')}
    </div>

    <div class="textbook-layout">
      <!-- Table of Contents -->
      <aside class="textbook-toc">
        <h3>目次 (Chapters)</h3>
        <ul class="toc-list">
          ${currentBook.sections.map((sec, idx) => `
            <li>
              <a href="#${sec.id}" class="toc-link ${idx === 0 ? 'active' : ''}" onclick="smoothScrollTo(event, '${sec.id}')">
                ${sec.title}
              </a>
            </li>
          `).join('')}
        </ul>
      </aside>

      <!-- Chapter Contents -->
      <main class="textbook-body">
        ${currentBook.sections.map(sec => `
          <article id="${sec.id}" class="textbook-chapter-card">
            <div class="chapter-title-group">
              <h2>${sec.title}</h2>
            </div>
            <div class="markdown-content">
              ${renderMarkdown(sec.content)}
            </div>
          </article>
        `).join('')}
      </main>
    </div>
  `;

  container.innerHTML = html;
}

function switchTextbookExam(examKey) {
  AppState.textbookExam = examKey;
  AppState.currentTab = 'textbook';
  switchTab('textbook');
}

function smoothScrollTo(e, id) {
  e.preventDefault();
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    document.querySelectorAll('.toc-link').forEach(link => {
      link.classList.remove('active');
    });
    e.target.classList.add('active');
  }
}

// ==========================================================================
// 3. PRACTICE QUESTIONS VIEW
// ==========================================================================
function renderPracticeView(container) {
  const filtered = getFilteredQuestions();
  const minorunCount = QUESTIONS_DATA.filter(q => q.specialTag === 'みのるん式特訓').length;
  const countCCAO = QUESTIONS_DATA.filter(q => q.exam === 'CCAO-F').length;
  const countCCDV = QUESTIONS_DATA.filter(q => q.exam === 'CCDV-F').length;
  const countCCAR = QUESTIONS_DATA.filter(q => q.exam === 'CCAR-F').length;
  const countCCARP = QUESTIONS_DATA.filter(q => q.exam === 'CCAR-P').length;

  const answeredMinorun = QUESTIONS_DATA.filter(q => q.specialTag === 'みのるん式特訓' && AppState.userAnswers[q.id]).length;
  const answeredCCAO = QUESTIONS_DATA.filter(q => q.exam === 'CCAO-F' && AppState.userAnswers[q.id]).length;
  const answeredCCDV = QUESTIONS_DATA.filter(q => q.exam === 'CCDV-F' && AppState.userAnswers[q.id]).length;
  const answeredCCAR = QUESTIONS_DATA.filter(q => q.exam === 'CCAR-F' && AppState.userAnswers[q.id]).length;
  const answeredCCARP = QUESTIONS_DATA.filter(q => q.exam === 'CCAR-P' && AppState.userAnswers[q.id]).length;
  const totalAnsweredAll = Object.keys(AppState.userAnswers).length;

  // Selected Exam stats for Status & Reset Bar
  const currentExamFilter = AppState.practiceFilters.exam;
  let examTargetQs = [];
  let currentExamLabel = '';
  let currentExamShort = '';

  if (currentExamFilter === 'minorun') {
    examTargetQs = QUESTIONS_DATA.filter(q => q.specialTag === 'みのるん式特訓');
    currentExamLabel = '🔥 みのるん式特訓';
    currentExamShort = 'みのるん式特訓';
  } else if (currentExamFilter === 'all') {
    examTargetQs = QUESTIONS_DATA;
    currentExamLabel = '全資格 総合';
    currentExamShort = '全問題';
  } else {
    examTargetQs = QUESTIONS_DATA.filter(q => q.exam === currentExamFilter);
    currentExamLabel = currentExamFilter;
    currentExamShort = currentExamFilter;
  }

  const answeredInCurrent = examTargetQs.filter(q => AppState.userAnswers[q.id]).length;
  const correctInCurrent = examTargetQs.filter(q => AppState.userAnswers[q.id]?.isCorrect).length;
  const currentAccuracy = answeredInCurrent > 0 ? Math.round((correctInCurrent / answeredInCurrent) * 100) : 0;
  const currentProgressPct = examTargetQs.length > 0 ? Math.round((answeredInCurrent / examTargetQs.length) * 100) : 0;

  let html = `
    <div class="view-hero">
      <span class="view-hero-badge">Question Bank (全${QUESTIONS_DATA.length}問・各試験70問)</span>
      <h2>Claude認定 資格別 実践問題集</h2>
      <p>本番同様のシナリオ問題、XMLプロンプト、エージェント設計、MCP、ガバナンスを徹底演習。全問に公式ドキュメント準拠の詳細解説と引っかけ対策付き。</p>
    </div>

    <!-- Exam Selector Pills -->
    <div class="exam-selector-pills">
      <button class="exam-pill ${AppState.practiceFilters.exam === 'all' ? 'active' : ''}" onclick="setPracticeExamFilter('all')">全資格 (${totalAnsweredAll}/${QUESTIONS_DATA.length})</button>
      <button class="exam-pill ${AppState.practiceFilters.exam === 'minorun' ? 'active' : ''}" style="border-color: #ecc94b; color: ${AppState.practiceFilters.exam === 'minorun' ? 'white' : '#ecc94b'};" onclick="setPracticeExamFilter('minorun')">🔥 みのるん式 (${answeredMinorun}/${minorunCount})</button>
      <button class="exam-pill ${AppState.practiceFilters.exam === 'CCAO-F' ? 'active' : ''}" onclick="setPracticeExamFilter('CCAO-F')">CCAO-F (${answeredCCAO}/${countCCAO})</button>
      <button class="exam-pill ${AppState.practiceFilters.exam === 'CCDV-F' ? 'active' : ''}" onclick="setPracticeExamFilter('CCDV-F')">CCDV-F (${answeredCCDV}/${countCCDV})</button>
      <button class="exam-pill ${AppState.practiceFilters.exam === 'CCAR-F' ? 'active' : ''}" onclick="setPracticeExamFilter('CCAR-F')">CCAR-F (${answeredCCAR}/${countCCAR} ★最難関)</button>
      <button class="exam-pill ${AppState.practiceFilters.exam === 'CCAR-P' ? 'active' : ''}" onclick="setPracticeExamFilter('CCAR-P')">CCAR-P (${answeredCCARP}/${countCCARP})</button>
    </div>

    <!-- Exam Progress & Reset Bar -->
    <div class="practice-exam-status-bar">
      <div class="exam-status-info">
        <span class="status-badge-inline">${currentExamLabel}</span>
        <span class="status-metric-text">
          解答進捗: <strong>${answeredInCurrent}</strong> / ${examTargetQs.length}問 (${currentProgressPct}%)
          ${answeredInCurrent > 0 ? `| 正答率: <strong>${currentAccuracy}%</strong> (${correctInCurrent}問正解)` : ''}
        </span>
      </div>
      <div class="status-actions-group">
        <button class="btn-reset-exam" ${answeredInCurrent === 0 ? 'disabled' : ''} onclick="resetExamProgress('${currentExamFilter}')" title="${currentExamShort}の解答履歴を一式リセット">
          ${Icons.refresh} ${currentExamShort}の解答をリセット
        </button>
        <button class="btn-reset-outline" onclick="openResetModal()" title="全試験の進捗リセット管理を開く">
          試験別リセット管理...
        </button>
      </div>
    </div>

    <!-- Filters Bar -->
    <div class="practice-filters">
      <div class="filter-group">
        <label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">難易度:</label>
        <select class="filter-select" onchange="setPracticeDifficultyFilter(this.value)">
          <option value="all" ${AppState.practiceFilters.difficulty === 'all' ? 'selected' : ''}>すべての難易度</option>
          <option value="基礎" ${AppState.practiceFilters.difficulty === '基礎' ? 'selected' : ''}>基礎</option>
          <option value="標準" ${AppState.practiceFilters.difficulty === '標準' ? 'selected' : ''}>標準</option>
          <option value="発展" ${AppState.practiceFilters.difficulty === '発展' ? 'selected' : ''}>発展</option>
          <option value="超難問" ${AppState.practiceFilters.difficulty === '超難問' ? 'selected' : ''}>超難問</option>
        </select>

        <label style="font-size: 13px; font-weight: 600; color: var(--text-muted); margin-left: 12px;">状態:</label>
        <select class="filter-select" onchange="setPracticeStatusFilter(this.value)">
          <option value="all">すべて</option>
          <option value="unanswered">未解答のみ</option>
          <option value="incorrect">要復習（誤答）のみ</option>
          <option value="bookmarked">ブックマークのみ</option>
        </select>
      </div>

      <div style="font-size: 13px; font-weight: 600; color: var(--text-muted);">
        該当: <span style="color: var(--accent-primary); font-size: 15px;">${filtered.length}</span> 問
      </div>
    </div>

    <!-- Questions Container -->
    <div class="questions-list">
      ${filtered.length === 0 ? `
        <div class="question-card" style="text-align: center; padding: 40px;">
          <p style="color: var(--text-muted); font-size: 15px;">条件に合致する問題が見つかりませんでした。</p>
        </div>
      ` : filtered.map((q, idx) => renderQuestionCard(q, idx)).join('')}
    </div>
  `;

  container.innerHTML = html;
}

function switchPracticeExam(examCode) {
  AppState.practiceFilters.exam = examCode;
  AppState.currentTab = 'practice';
  switchTab('practice');
}

function setPracticeExamFilter(code) {
  AppState.practiceFilters.exam = code;
  renderApp();
}

function setPracticeDifficultyFilter(diff) {
  AppState.practiceFilters.difficulty = diff;
  renderApp();
}

function setPracticeStatusFilter(status) {
  AppState.practiceFilters.status = status;
  renderApp();
}

function getFilteredQuestions() {
  return QUESTIONS_DATA.filter(q => {
    if (AppState.practiceFilters.exam === 'minorun') {
      if (q.specialTag !== 'みのるん式特訓') return false;
    } else if (AppState.practiceFilters.exam !== 'all' && q.exam !== AppState.practiceFilters.exam) {
      return false;
    }

    if (AppState.practiceFilters.difficulty !== 'all' && q.difficulty !== AppState.practiceFilters.difficulty) return false;

    if (AppState.practiceFilters.status === 'unanswered' && AppState.userAnswers[q.id]) return false;
    if (AppState.practiceFilters.status === 'incorrect' && (!AppState.userAnswers[q.id] || AppState.userAnswers[q.id].isCorrect)) return false;
    if (AppState.practiceFilters.status === 'bookmarked' && !AppState.bookmarks.has(q.id)) return false;

    if (AppState.practiceFilters.search) {
      const s = AppState.practiceFilters.search.toLowerCase();
      const matchText = (q.question + q.options.join(' ') + q.category + q.explanation).toLowerCase();
      if (!matchText.includes(s)) return false;
    }

    return true;
  });
}

function renderQuestionCard(q, displayIndex) {
  const answerState = AppState.userAnswers[q.id];
  const isAnswered = !!answerState;
  const isBookmarked = AppState.bookmarks.has(q.id);
  const isMulti = q.type === 'multiple' || q.answer.length > 1;
  const pending = AppState.pendingSelections[q.id] || [];

  return `
    <div class="question-card" id="qcard-${q.id}">
      <div class="question-card-header">
        <div class="question-meta">
          <span class="badge-exam">${q.exam}</span>
          ${q.specialTag ? `
            <span style="font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: var(--radius-sm); background: rgba(236, 201, 75, 0.2); color: #ecc94b; border: 1px solid rgba(236, 201, 75, 0.4);">
              🔥 ${q.specialTag}
            </span>
          ` : ''}
          <span class="badge-category">${q.category}</span>
          <span class="badge-difficulty diff-${q.difficulty}">${q.difficulty}</span>
          <span style="font-size: 11px; color: ${isMulti ? 'var(--accent-primary)' : 'var(--text-muted)'}; font-weight: 700;">
            ${isMulti ? `【複数選択問題（${q.answer.length}つ選択）】` : '【単一選択問題】'}
          </span>
        </div>
        <div class="question-actions">
          <button class="btn-action-icon ${isBookmarked ? 'active-bookmark' : ''}" title="ブックマーク" onclick="toggleBookmark('${q.id}')">
            ${Icons.bookmark}
          </button>
        </div>
      </div>

      <div class="question-text">
        <span style="color: var(--accent-primary); font-weight: 700; margin-right: 6px;">Q${displayIndex + 1}.</span>
        ${escapeHtml(q.question)}
      </div>

      <div class="options-list">
        ${q.options.map((opt, optIdx) => {
          let itemClass = "option-item";
          let label = String.fromCharCode(65 + optIdx); // A, B, C, D

          if (isAnswered) {
            itemClass += " locked";
            const isUserSelected = answerState.selected.includes(optIdx);
            const isCorrectOption = q.answer.includes(optIdx);

            if (isCorrectOption) {
              itemClass += " correct";
            } else if (isUserSelected && !isCorrectOption) {
              itemClass += " incorrect";
            }
          } else if (isMulti) {
            if (pending.includes(optIdx)) {
              itemClass += " selected";
            }
          }

          return `
            <div class="${itemClass}" onclick="handleOptionSelect('${q.id}', ${optIdx})">
              <div class="option-indicator">${label}</div>
              <div class="option-text">${escapeHtml(opt)}</div>
            </div>
          `;
        }).join('')}
      </div>

      ${!isAnswered && isMulti ? `
        <div style="margin-top: 14px; display: flex; justify-content: space-between; align-items: center; background: var(--bg-secondary); padding: 10px 16px; border-radius: var(--radius-md); border: 1px dashed var(--border-subtle);">
          <span style="font-size: 13px; color: var(--text-secondary);">
            選択中: <strong style="color: var(--accent-primary);">${pending.length}</strong> / ${q.answer.length}
          </span>
          <button class="btn-primary" style="font-size: 13px; padding: 6px 16px; ${pending.length === q.answer.length ? '' : 'opacity: 0.5; cursor: not-allowed;'}" 
            ${pending.length === q.answer.length ? `onclick="submitMultiAnswer('${q.id}')"` : 'disabled'}>
            回答を確定する
          </button>
        </div>
      ` : ''}

      ${isAnswered ? `
        <div class="explanation-box">
          <div class="explanation-header">
            ${answerState.isCorrect ? Icons.checkCircle + ' 正解！' : Icons.alertTriangle + ' 不正解（要復習）'}
          </div>
          <div class="explanation-text">
            <strong>【公式解説】</strong><br>
            ${renderMarkdown(q.explanation)}
          </div>
          ${q.trap ? `
            <div class="trap-callout">
              <strong>⚠️ 引っかけ・落とし穴ポイント:</strong> ${escapeHtml(q.trap)}
            </div>
          ` : ''}
          <div style="margin-top: 14px; display: flex; justify-content: flex-end;">
            <button class="btn-secondary" style="font-size: 12px; padding: 6px 12px;" onclick="retryQuestion('${q.id}')">
              ${Icons.refresh} もう一度解く
            </button>
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

function handleOptionSelect(questionId, optionIdx) {
  const q = QUESTIONS_DATA.find(item => item.id === questionId);
  if (!q) return;

  // If already answered, do nothing
  if (AppState.userAnswers[questionId]) return;

  const isMulti = q.type === 'multiple' || q.answer.length > 1;

  if (isMulti) {
    if (!AppState.pendingSelections[questionId]) {
      AppState.pendingSelections[questionId] = [];
    }
    const cur = AppState.pendingSelections[questionId];
    if (cur.includes(optionIdx)) {
      AppState.pendingSelections[questionId] = cur.filter(i => i !== optionIdx);
    } else {
      if (cur.length < q.answer.length) {
        AppState.pendingSelections[questionId] = [...cur, optionIdx];
      } else {
        AppState.pendingSelections[questionId] = [...cur.slice(1), optionIdx];
      }
    }
    reRenderQuestionCard(q);
    return;
  }

  // Single choice: evaluate immediately
  const selected = [optionIdx];
  const isCorrect = q.answer.length === 1 && q.answer[0] === optionIdx;

  AppState.userAnswers[questionId] = {
    selected: selected,
    isCorrect: isCorrect,
    timestamp: Date.now()
  };

  if (!isCorrect) {
    AppState.weaknesses.add(questionId);
  } else {
    AppState.weaknesses.delete(questionId);
  }

  saveLocalStorage();
  updateProgressUI();
  reRenderQuestionCard(q);
}

function submitMultiAnswer(questionId) {
  const q = QUESTIONS_DATA.find(item => item.id === questionId);
  if (!q) return;
  if (AppState.userAnswers[questionId]) return;

  const selected = AppState.pendingSelections[questionId] || [];
  if (selected.length !== q.answer.length) return;

  const isCorrect = selected.length === q.answer.length &&
    q.answer.every(idx => selected.includes(idx));

  AppState.userAnswers[questionId] = {
    selected: [...selected].sort((a, b) => a - b),
    isCorrect: isCorrect,
    timestamp: Date.now()
  };

  delete AppState.pendingSelections[questionId];

  if (!isCorrect) {
    AppState.weaknesses.add(questionId);
  } else {
    AppState.weaknesses.delete(questionId);
  }

  saveLocalStorage();
  updateProgressUI();
  reRenderQuestionCard(q);
}

function reRenderQuestionCard(q) {
  const card = document.getElementById(`qcard-${q.id}`);
  if (card) {
    const parent = card.parentElement;
    const cards = Array.from(parent.querySelectorAll('.question-card'));
    const idx = cards.indexOf(card);
    card.outerHTML = renderQuestionCard(q, idx);
  }
}

function retryQuestion(questionId) {
  delete AppState.userAnswers[questionId];
  delete AppState.pendingSelections[questionId];
  saveLocalStorage();
  updateProgressUI();
  renderApp();
}

function toggleBookmark(questionId) {
  if (AppState.bookmarks.has(questionId)) {
    AppState.bookmarks.delete(questionId);
  } else {
    AppState.bookmarks.add(questionId);
  }
  saveLocalStorage();
  renderApp();
}

// ==========================================
// 4. MOCK EXAM VIEW (120min Full Simulation)
// ==========================================
function renderMockExamView(container) {
  const mock = AppState.mockExam;

  // If exam is finished and submitted, show Results Dashboard
  if (mock.isSubmitted && mock.result) {
    renderMockResultView(container);
    return;
  }

  // If exam is NOT active, show Exam Selection Screen
  if (!mock.isActive) {
    renderMockSetupView(container);
    return;
  }

  // Active Exam UI (Questions + Timer + Palette)
  renderActiveMockExam(container);
}

function renderMockSetupView(container) {
  let html = `
    <div class="view-hero">
      <span class="view-hero-badge">Simulation Center</span>
      <h2>本番完全シミュレーション試験</h2>
      <p>Pearson VUE本番と同じ120分のカウントダウンタイマー、見直しフラグ（Flag for Review）、1000点満点換算スコア（720点合格ライン判定）を完全再現。</p>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
      ${[
        { code: 'CCDV-F', name: 'Developer - Foundations', badge: '最優先推奨', desc: 'API、MCP、Tool Use、Prompt Cachingの実装問題。最も選択肢を絞りやすく合格しやすい。', time: '120分', pass: '720点' },
        { code: 'CCAO-F', name: 'Associate - Foundations', badge: '基礎固め', desc: 'プロンプト原則、AI Fluency、ハルシネーション対策、業務ワークフロー設計。', time: '120分', pass: '720点' },
        { code: 'CCAR-P', name: 'Architect - Professional', badge: '上級資格', desc: 'Bedrock/Vertex統合、ZDR契約、RSP/ASL安全基準、LLM-as-a-Judge評価パイプライン。', time: '120分', pass: '720点' },
        { code: 'CCAR-F', name: 'Architect - Foundations', badge: '最難関・ラスボス', desc: 'エージェント5大パターン、長文脈配置、Contextual Retrieval、トレードオフの罠が満載。みのるん式特訓18問収録。', time: '120分', pass: '720点' }
      ].map(e => {
        const qCount = QUESTIONS_DATA.filter(q => q.exam === e.code).length;
        const note = e.code === 'CCAR-F' ? ' (特訓18問含)' : '';
        const answeredExamCount = QUESTIONS_DATA.filter(q => q.exam === e.code && AppState.userAnswers[q.id]).length;
        return `
        <div class="question-card" style="display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <span class="badge-exam" style="font-size: 13px;">${e.code}</span>
              <span style="font-size: 11px; padding: 2px 8px; border-radius: var(--radius-full); background: var(--accent-light); color: var(--accent-primary); font-weight: 700;">${e.badge}</span>
            </div>
            <h3 style="font-size: 17px; margin-bottom: 8px; color: var(--text-primary);">${e.name}</h3>
            <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 16px; line-height: 1.6;">${e.desc}</p>
            <div style="font-size: 12px; color: var(--text-muted); display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;">
              <span><strong>問題数:</strong> ${qCount}問${note}</span>
              <span><strong>制限時間:</strong> ${e.time}</span>
              <span><strong>合格ライン:</strong> ${e.pass}</span>
              <span><strong>解答済:</strong> <strong style="color: var(--accent-primary);">${answeredExamCount}</strong>/${qCount}問</span>
            </div>
          </div>
          <div style="display: flex; gap: 8px; flex-direction: column;">
            <button class="btn-primary" style="width: 100%;" onclick="startMockExam('${e.code}')">
              ${Icons.clock} 本番シミュレーション試験を開始
            </button>
            <div style="display: flex; gap: 8px;">
              <button class="btn-secondary" style="flex: 1; font-size: 12px; padding: 7px 10px;" onclick="switchPracticeExam('${e.code}')">
                練習問題を解く
              </button>
              <button class="btn-reset-exam" style="font-size: 12px; padding: 7px 10px;" ${answeredExamCount === 0 ? 'disabled' : ''} onclick="resetExamProgress('${e.code}')" title="この試験の解答履歴をリセット">
                ${Icons.refresh} リセット (${answeredExamCount})
              </button>
            </div>
          </div>
        </div>
      `;}).join('')}
    </div>
  `;

  container.innerHTML = html;
}

function startMockExam(examCode) {
  const questions = QUESTIONS_DATA.filter(q => q.exam === examCode);
  if (questions.length === 0) {
    alert('指定された試験の問題が見つかりません。');
    return;
  }

  // Shuffle questions for fresh exam experience
  const shuffled = [...questions].sort(() => Math.random() - 0.5);

  AppState.mockExam = {
    isActive: true,
    examCode: examCode,
    questions: shuffled,
    currentIndex: 0,
    answers: {},
    flags: new Set(),
    timeRemaining: 120 * 60, // 120 minutes
    timerInterval: null,
    isSubmitted: false,
    result: null
  };

  // Start Timer
  clearInterval(AppState.mockExam.timerInterval);
  AppState.mockExam.timerInterval = setInterval(() => {
    AppState.mockExam.timeRemaining--;
    updateMockTimerUI();

    if (AppState.mockExam.timeRemaining <= 0) {
      clearInterval(AppState.mockExam.timerInterval);
      alert('試験時間が終了しました。自動採点を行います。');
      submitMockExam();
    }
  }, 1000);

  renderApp();
}

function updateMockTimerUI() {
  const timerEl = document.getElementById('mockTimerDisplay');
  if (!timerEl) return;

  const totalSec = AppState.mockExam.timeRemaining;
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  timerEl.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function renderActiveMockExam(container) {
  const mock = AppState.mockExam;
  const q = mock.questions[mock.currentIndex];
  const userSelected = mock.answers[q.id] || [];
  const isFlagged = mock.flags.has(q.id);

  let html = `
    <!-- Sticky Header Bar -->
    <div class="mock-exam-header-bar">
      <div style="display: flex; align-items: center; gap: 14px;">
        <span class="badge-exam" style="font-size: 14px;">${mock.examCode} 模擬試験</span>
        <span style="font-size: 13px; color: var(--text-muted);">
          第 <strong>${mock.currentIndex + 1}</strong> 問 / 全 ${mock.questions.length} 問
        </span>
      </div>

      <div style="display: flex; align-items: center; gap: 16px;">
        <div class="mock-timer">
          ${Icons.clock} <span id="mockTimerDisplay">02:00:00</span>
        </div>
        <button class="btn-primary" style="background: var(--success);" onclick="confirmSubmitMockExam()">
          ${Icons.checkCircle} 試験を終了して採点
        </button>
      </div>
    </div>

    <!-- Main Mock Layout -->
    <div class="mock-layout">
      <!-- Question Card -->
      <div class="question-card" style="padding: 32px;">
        <div class="question-card-header">
          <div class="question-meta">
            <span class="badge-category">${q.category}</span>
            <span class="badge-difficulty diff-${q.difficulty}">${q.difficulty}</span>
            <span style="font-size: 11px; color: ${q.answer.length > 1 ? 'var(--accent-primary)' : 'var(--text-muted)'}; font-weight: 700;">
              ${q.answer.length > 1 ? `【複数選択問題（${q.answer.length}つ選択）】` : '【単一選択問題】'}
            </span>
          </div>
          <button class="btn-secondary" style="font-size: 12px; padding: 6px 12px; color: ${isFlagged ? '#ecc94b' : 'inherit'};" onclick="toggleMockFlag('${q.id}')">
            ${Icons.flag} ${isFlagged ? '見直しフラグ解除' : '見直しフラグを付ける'}
          </button>
        </div>

        <div class="question-text" style="font-size: 16px; margin: 20px 0;">
          ${escapeHtml(q.question)}
        </div>

        <div class="options-list">
          ${q.options.map((opt, optIdx) => {
            const isSelected = userSelected.includes(optIdx);
            return `
              <div class="option-item ${isSelected ? 'selected' : ''}" onclick="selectMockOption('${q.id}', ${optIdx})">
                <div class="option-indicator">${String.fromCharCode(65 + optIdx)}</div>
                <div class="option-text">${escapeHtml(opt)}</div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Navigation Buttons -->
        <div style="display: flex; justify-content: space-between; margin-top: 30px;">
          <button class="btn-secondary" ${mock.currentIndex === 0 ? 'disabled style="opacity: 0.5; pointer-events: none;"' : ''} onclick="navigateMockQuestion(${mock.currentIndex - 1})">
            前の問題
          </button>
          <button class="btn-primary" ${mock.currentIndex === mock.questions.length - 1 ? 'disabled style="opacity: 0.5; pointer-events: none;"' : ''} onclick="navigateMockQuestion(${mock.currentIndex + 1})">
            次の問題 ${Icons.chevronRight}
          </button>
        </div>
      </div>

      <!-- Question Palette -->
      <div class="mock-palette">
        <h3>問題ナビゲーション</h3>
        <div class="palette-grid">
          ${mock.questions.map((item, idx) => {
            const answered = !!mock.answers[item.id] && mock.answers[item.id].length > 0;
            const flagged = mock.flags.has(item.id);
            const current = idx === mock.currentIndex;

            let classes = ['palette-btn'];
            if (current) classes.push('current');
            if (answered) classes.push('answered');
            if (flagged) classes.push('flagged');

            return `
              <button class="${classes.join(' ')}" onclick="navigateMockQuestion(${idx})">
                ${idx + 1}
              </button>
            `;
          }).join('')}
        </div>

        <div style="font-size: 12px; color: var(--text-muted); display: flex; flex-direction: column; gap: 6px;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="width: 12px; height: 12px; background: var(--accent-light); border: 1px solid var(--accent-border); display: inline-block; border-radius: 2px;"></span>
            <span>解答済み (${Object.keys(mock.answers).length})</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="width: 12px; height: 12px; background: var(--bg-secondary); border: 1px solid var(--border-subtle); display: inline-block; border-radius: 2px;"></span>
            <span>未解答 (${mock.questions.length - Object.keys(mock.answers).length})</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="width: 8px; height: 8px; background: #ecc94b; border-radius: 50%; display: inline-block;"></span>
            <span>見直しフラグ (${mock.flags.size})</span>
          </div>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;
  updateMockTimerUI();
}

function selectMockOption(questionId, optIdx) {
  const mock = AppState.mockExam;
  const q = mock.questions.find(item => item.id === questionId);
  if (!q) return;

  const isMulti = q.type === 'multiple' || q.answer.length > 1;
  const current = mock.answers[questionId] || [];

  if (isMulti) {
    if (current.includes(optIdx)) {
      mock.answers[questionId] = current.filter(i => i !== optIdx);
    } else {
      if (current.length < q.answer.length) {
        mock.answers[questionId] = [...current, optIdx].sort((a, b) => a - b);
      } else {
        mock.answers[questionId] = [...current.slice(1), optIdx].sort((a, b) => a - b);
      }
    }
  } else {
    mock.answers[questionId] = [optIdx];
  }
  renderApp();
}

function toggleMockFlag(questionId) {
  if (AppState.mockExam.flags.has(questionId)) {
    AppState.mockExam.flags.delete(questionId);
  } else {
    AppState.mockExam.flags.add(questionId);
  }
  renderApp();
}

function navigateMockQuestion(index) {
  if (index >= 0 && index < AppState.mockExam.questions.length) {
    AppState.mockExam.currentIndex = index;
    renderApp();
  }
}

function confirmSubmitMockExam() {
  const answeredCount = Object.keys(AppState.mockExam.answers).length;
  const totalCount = AppState.mockExam.questions.length;
  const unanswered = totalCount - answeredCount;

  let msg = '模擬試験を終了し、採点を実行しますか？';
  if (unanswered > 0) {
    msg += `\n※ 未解答の問題が ${unanswered} 問あります。`;
  }

  if (confirm(msg)) {
    submitMockExam();
  }
}

function submitMockExam() {
  clearInterval(AppState.mockExam.timerInterval);

  const mock = AppState.mockExam;
  let correctCount = 0;
  const details = [];

  mock.questions.forEach(q => {
    const userSelected = mock.answers[q.id] || [];
    const isCorrect = userSelected.length === q.answer.length &&
      q.answer.every(idx => userSelected.includes(idx));

    if (isCorrect) correctCount++;
    details.push({
      question: q,
      userSelected: userSelected,
      isCorrect: isCorrect
    });

    // Also update main user answers & weaknesses
    AppState.userAnswers[q.id] = {
      selected: userSelected,
      isCorrect: isCorrect,
      timestamp: Date.now()
    };
    if (!isCorrect) AppState.weaknesses.add(q.id);
    else AppState.weaknesses.delete(q.id);
  });

  // Calculate scaled score (1000 scale, baseline 100~1000, passing 720)
  const scoreRatio = correctCount / mock.questions.length;
  const scaledScore = Math.round(scoreRatio * 1000);
  const isPassed = scaledScore >= 720;

  mock.isSubmitted = true;
  mock.result = {
    examCode: mock.examCode,
    totalQuestions: mock.questions.length,
    correctCount: correctCount,
    scaledScore: scaledScore,
    isPassed: isPassed,
    details: details,
    completedAt: new Date().toLocaleString()
  };

  saveLocalStorage();
  updateProgressUI();
  renderApp();
}

function renderMockResultView(container) {
  const res = AppState.mockExam.result;

  let html = `
    <div class="result-card">
      <div>
        ${res.isPassed ? `
          <span class="result-badge-pass">🎉 合格 (PASSED)</span>
        ` : `
          <span class="result-badge-fail">⚠️ 不合格 (NOT PASSED)</span>
        `}
      </div>

      <div class="result-score-number">${res.scaledScore} <span style="font-size: 24px; color: var(--text-muted);">/ 1000</span></div>
      <div class="result-score-sub">
        正答数: <strong>${res.correctCount}</strong> / ${res.totalQuestions} 問 (${Math.round((res.correctCount / res.totalQuestions) * 100)}%) | 合格基準: 720点
      </div>

      <p style="font-size: 14px; color: var(--text-secondary); margin-bottom: 24px;">
        ${res.isPassed ?
          'おめでとうございます！Anthropic認定基準の合格ライン（720点）を突破しました。この調子で他資格も制覇して全冠を目指しましょう！' :
          '合格ライン（720点）まであと少しでした！間違えた問題の解説と引っかけポイントを入念に復習して再挑戦しましょう。'}
      </p>

      <div style="display: flex; gap: 12px; justify-content: center;">
        <button class="btn-primary" onclick="resetMockExam()">
          ${Icons.refresh} 別の模擬試験を受ける
        </button>
        <button class="btn-secondary" onclick="switchTab('weakness')">
          ${Icons.alertTriangle} 間違えた問題を復習する
        </button>
      </div>
    </div>

    <!-- Review Section -->
    <h3 style="font-size: 18px; margin-bottom: 16px; color: var(--text-primary);">問題別の合否・詳細解説</h3>
    <div class="questions-list">
      ${res.details.map((d, idx) => renderQuestionCard(d.question, idx)).join('')}
    </div>
  `;

  container.innerHTML = html;
}

function resetMockExam() {
  clearInterval(AppState.mockExam.timerInterval);
  AppState.mockExam = {
    isActive: false,
    examCode: 'CCAR-F',
    questions: [],
    currentIndex: 0,
    answers: {},
    flags: new Set(),
    timeRemaining: 120 * 60,
    timerInterval: null,
    isSubmitted: false,
    result: null
  };
  renderApp();
}

// ==========================================
// 5. WEAKNESS REVIEW VIEW
// ==========================================
function renderWeaknessView(container) {
  const weakIds = Array.from(AppState.weaknesses);
  const weakQuestions = QUESTIONS_DATA.filter(q => weakIds.includes(q.id));

  let html = `
    <div class="view-hero">
      <span class="view-hero-badge">Weakness Mastery</span>
      <h2>弱点克服・誤答集中特訓</h2>
      <p>過去に間違えた問題や引っかけに引っかかった問題を集中演習します。正解すると自動的に弱点リストから解除されます。</p>
    </div>

    <div class="practice-filters">
      <div style="font-weight: 600; font-size: 14px;">
        現在克服すべき課題: <span style="color: var(--danger); font-size: 16px;">${weakQuestions.length}</span> 問
      </div>
      ${weakQuestions.length > 0 ? `
        <button class="btn-secondary" style="font-size: 12px; padding: 6px 14px;" onclick="clearAllWeaknesses()">
          弱点リストをすべてクリア
        </button>
      ` : ''}
    </div>

    <div class="questions-list">
      ${weakQuestions.length === 0 ? `
        <div class="question-card" style="text-align: center; padding: 48px;">
          <div style="font-size: 40px; margin-bottom: 12px;">🎯</div>
          <h3 style="font-size: 18px; margin-bottom: 8px;">現在、弱点として記録されている問題はありません！</h3>
          <p style="color: var(--text-muted); font-size: 14px;">問題集や模擬試験を解いて、間違えた問題がここに自動集約されます。</p>
        </div>
      ` : weakQuestions.map((q, idx) => renderQuestionCard(q, idx)).join('')}
    </div>
  `;

  container.innerHTML = html;
}

function clearAllWeaknesses() {
  if (confirm('弱点リストをすべてクリアしますか？')) {
    AppState.weaknesses.clear();
    saveLocalStorage();
    updateProgressUI();
    renderApp();
  }
}

// ==========================================
// 6. CHEATSHEET VIEW
// ==========================================
function renderCheatsheetView(container) {
  const sheet = CHEATSHEET_DATA;

  let html = `
    <div class="view-hero">
      <span class="view-hero-badge">Quick Reference</span>
      <h2>Claude認定 必須チートシート & 早見表</h2>
      <p>試験直前の最終確認用。Messages APIパラメータ、Prompt Caching境界値、エージェント5大パターン、MCPプリミティブ、ASL安全レベルを網羅。</p>
    </div>

    <div class="cheatsheet-grid">
      <!-- 1. API Parameters -->
      <div class="cheat-card" style="grid-column: 1 / -1;">
        <h3>${Icons.fileText} Messages API (/v1/messages) 主要パラメータ仕様</h3>
        <div class="markdown-content">
          <table>
            <thead><tr><th>パラメータ</th><th>型</th><th>必須</th><th>仕様・注意点</th></tr></thead>
            <tbody>
              ${sheet.apiParams.map(p => `
                <tr>
                  <td><code>${p.name}</code></td>
                  <td>${p.type}</td>
                  <td><strong style="color: ${p.required === '必須' ? 'var(--accent-primary)' : 'var(--text-muted)'}">${p.required}</strong></td>
                  <td>${p.desc}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- 2. Prompt Caching Specs -->
      <div class="cheat-card">
        <h3>${Icons.clock} Prompt Caching スペック早見表</h3>
        <div class="markdown-content">
          <table>
            <thead><tr><th>項目</th><th>Sonnet / Opus</th><th>Haiku</th></tr></thead>
            <tbody>
              ${sheet.promptCaching.map(c => `
                <tr>
                  <td><strong>${c.item}</strong></td>
                  <td><code>${c.sonnetOpus}</code></td>
                  <td><code>${c.haiku}</code></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <p style="font-size: 12px; color: var(--text-muted); margin-top: 8px;">
            ※静的コンテキスト（システムプロンプト、マニュアル）を先頭に置き、cache_control: {"type": "ephemeral"} を指定。
          </p>
        </div>
      </div>

      <!-- 3. MCP Primitives -->
      <div class="cheat-card">
        <h3>${Icons.target} Model Context Protocol (MCP) 3大要素</h3>
        <div class="markdown-content">
          <table>
            <thead><tr><th>要素</th><th>副作用</th><th>方向</th></tr></thead>
            <tbody>
              ${sheet.mcpPrimitives.map(m => `
                <tr>
                  <td><strong>${m.primitive}</strong></td>
                  <td>${m.effect}</td>
                  <td><code>${m.direction}</code></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <p style="font-size: 12px; color: var(--text-muted); margin-top: 8px;">
            トランスポート: ローカル子プロセスは <code>stdio</code>、リモート通信は <code>SSE over HTTP</code>。
          </p>
        </div>
      </div>

      <!-- 4. Agent Patterns -->
      <div class="cheat-card" style="grid-column: 1 / -1;">
        <h3>${Icons.compass} Anthropic公式「Building Effective Agents」5大パターン比較</h3>
        <div class="markdown-content">
          <table>
            <thead><tr><th>パターン</th><th>動作メカニズム</th><th>最適ユースケース</th><th>弱点・トレードオフ</th></tr></thead>
            <tbody>
              ${sheet.agentPatterns.map(a => `
                <tr>
                  <td><strong style="color: var(--accent-primary);">${a.pattern}</strong></td>
                  <td>${a.mechanism}</td>
                  <td>${a.bestFor}</td>
                  <td>${a.tradeoff}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- 5. ASL Levels -->
      <div class="cheat-card">
        <h3>${Icons.award} Responsible Scaling Policy (ASL) 安全レベル</h3>
        <div class="markdown-content">
          <table>
            <thead><tr><th>レベル</th><th>リスク分類</th><th>要件</th></tr></thead>
            <tbody>
              ${sheet.aslLevels.map(l => `
                <tr>
                  <td><code>${l.level}</code></td>
                  <td>${l.risk}</td>
                  <td>${l.definition}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- 6. 4 Exams Comparison -->
      <div class="cheat-card">
        <h3>${Icons.award} 4資格の比較と攻略アドバイス</h3>
        <div class="markdown-content">
          <table>
            <thead><tr><th>資格</th><th>問数/時間</th><th>難易度</th><th>ポイント</th></tr></thead>
            <tbody>
              ${sheet.examComparison.map(e => `
                <tr>
                  <td><strong>${e.code}</strong></td>
                  <td>${e.questions}</td>
                  <td>${e.diff}</td>
                  <td>${e.tip}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- 7. HTTP Error Codes & Recovery -->
      <div class="cheat-card">
        <h3>${Icons.alertTriangle} HTTPエラーコードと復旧戦略</h3>
        <div class="markdown-content">
          <table>
            <thead><tr><th>コード</th><th>エラー種別</th><th>原因</th><th>推奨アクション</th></tr></thead>
            <tbody>
              ${sheet.errorCodes.map(err => `
                <tr>
                  <td><code style="color: ${err.code === '429' || err.code === '529' ? 'var(--warning)' : 'var(--danger)'}; font-weight: 700;">${err.code}</code></td>
                  <td><strong>${err.type}</strong></td>
                  <td>${err.cause}</td>
                  <td>${err.action}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- 8. Trap & Anti-Pattern List -->
      <div class="cheat-card" style="grid-column: 1 / -1; border-left: 4px solid var(--danger);">
        <h3 style="color: var(--danger);">${Icons.alertTriangle} 合格者が教える「試験の定番引っかけ＆NGアンチパターン10選」</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 14px; margin-top: 12px;">
          ${sheet.trapList.map((t, idx) => `
            <div style="background: var(--bg-secondary); padding: 12px 14px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
              <div style="font-size: 13.5px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">
                ${t.title}
              </div>
              <div style="font-size: 12.5px; color: var(--text-secondary); line-height: 1.5;">
                ${t.desc}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- 9. Minorun Prompt Generator -->
      ${sheet.minorunPromptGenerator ? `
        <div class="cheat-card" style="grid-column: 1 / -1; border-left: 4px solid var(--accent-primary);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; margin-bottom: 12px;">
            <div>
              <h3 style="color: var(--accent-primary); margin: 0 0 6px 0;">
                🔥 ${sheet.minorunPromptGenerator.title}
              </h3>
              <p style="font-size: 13px; color: var(--text-secondary); margin: 0; line-height: 1.6;">
                ${sheet.minorunPromptGenerator.desc}
              </p>
            </div>
            <button class="btn-primary" id="copyPromptBtn" onclick="copyMinorunPrompt(this)" style="font-size: 13px; padding: 8px 16px; white-space: nowrap;">
              ${Icons.fileText} プロンプトをコピー
            </button>
          </div>
          <div style="background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 14px; position: relative;">
            <pre style="white-space: pre-wrap; font-size: 12.5px; color: var(--text-primary); font-family: 'SFMono-Regular', Consolas, Menlo, monospace; margin: 0; line-height: 1.6;"><code>${escapeHtml(sheet.minorunPromptGenerator.prompt)}</code></pre>
          </div>
        </div>
      ` : ''}
    </div>
  `;

  container.innerHTML = html;
}

function copyMinorunPrompt(btn) {
  const promptText = CHEATSHEET_DATA.minorunPromptGenerator ? CHEATSHEET_DATA.minorunPromptGenerator.prompt : '';
  if (!promptText) return;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(promptText).then(() => {
      showCopyFeedback(btn);
    }).catch(err => {
      fallbackCopy(promptText, btn);
    });
  } else {
    fallbackCopy(promptText, btn);
  }
}

function showCopyFeedback(btn) {
  const origHtml = btn.innerHTML;
  btn.innerHTML = `✓ コピー完了！`;
  btn.style.backgroundColor = 'var(--success)';
  setTimeout(() => {
    btn.innerHTML = origHtml;
    btn.style.backgroundColor = '';
  }, 2000);
}

function fallbackCopy(text, btn) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    showCopyFeedback(btn);
  } catch (e) {
    alert('コピーに失敗しました。手動でテキストを選択してコピーしてください。');
  }
  document.body.removeChild(textarea);
}

// ==========================================
// 7. GLOBAL SEARCH LOGIC
// ==========================================
function handleGlobalSearch(keyword) {
  if (!keyword || keyword.trim() === '') {
    AppState.practiceFilters.search = '';
    renderApp();
    return;
  }

  // If in practice view, live filter
  if (AppState.currentTab === 'practice') {
    AppState.practiceFilters.search = keyword.trim();
    renderApp();
  } else {
    // Switch to practice view and search
    AppState.practiceFilters.search = keyword.trim();
    switchTab('practice');
  }
}

// ==========================================
// 8. MARKDOWN MINI RENDERER
// ==========================================
function renderMarkdown(md) {
  if (!md) return '';

  let text = md;

  // Code blocks ```code```
  text = text.replace(/```([a-zA-Z0-9_\-]+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    return `<pre><code class="lang-${lang || 'text'}">${escapeHtml(code.trim())}</code></pre>`;
  });

  // Inline code `code`
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Headings
  text = text.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
  text = text.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  text = text.replace(/^## (.*$)/gim, '<h2>$1</h2>');

  // Bold & Italic
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Blockquotes
  text = text.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');

  // Markdown Tables
  text = text.replace(/\|(.+)\|\n\|[-:| ]+\|\n((?:\|.+\|\n?)+)/g, (match, headerLine, bodyLines) => {
    const headers = headerLine.split('|').map(h => h.trim()).filter(h => h);
    const rows = bodyLines.trim().split('\n').map(row => {
      return row.split('|').map(c => c.trim()).filter(c => c);
    });

    let tableHtml = '<table><thead><tr>';
    headers.forEach(h => { tableHtml += `<th>${h}</th>`; });
    tableHtml += '</tr></thead><tbody>';

    rows.forEach(r => {
      tableHtml += '<tr>';
      r.forEach(c => { tableHtml += `<td>${c}</td>`; });
      tableHtml += '</tr>';
    });

    tableHtml += '</tbody></table>';
    return tableHtml;
  });

  // Unordered lists
  text = text.replace(/^\* (.*$)/gim, '<li>$1</li>');
  text = text.replace(/^- (.*$)/gim, '<li>$1</li>');
  text = text.replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>');

  // Paragraphs
  text = text.split('\n\n').map(p => {
    p = p.trim();
    if (!p) return '';
    if (p.startsWith('<h') || p.startsWith('<pre') || p.startsWith('<table') || p.startsWith('<blockquote') || p.startsWith('<ul')) {
      return p;
    }
    return `<p>${p.replace(/\n/g, '<br>')}</p>`;
  }).join('');

  return text;
}

// HTML escape helper
function escapeHtml(string) {
  if (!string) return '';
  const entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return String(string).replace(/[&<>"']/g, s => entityMap[s]);
}
