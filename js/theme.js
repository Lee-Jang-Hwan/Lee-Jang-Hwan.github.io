// 다크/라이트 모드 토글 및 localStorage 저장

(function() {
  'use strict';

  const THEME_KEY = 'blog-theme';
  const THEME_DARK = 'dark';
  const THEME_LIGHT = 'light';

  // 시스템 설정 감지 (다크 모드 선호)
  function getSystemTheme() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? THEME_DARK
      : THEME_LIGHT;
  }

  // 저장된 테마 또는 시스템 설정 가져오기
  function getTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    return saved || getSystemTheme();
  }

  // 테마 적용
  function setTheme(theme) {
    const html = document.documentElement;
    if (theme === THEME_DARK) {
      html.setAttribute('data-theme', THEME_DARK);
      html.classList.add(THEME_DARK);
    } else {
      html.setAttribute('data-theme', THEME_LIGHT);
      html.classList.remove(THEME_DARK);
    }
    localStorage.setItem(THEME_KEY, theme);
    updateThemeIcon(theme);
  }

  // 테마 아이콘 업데이트
  function updateThemeIcon(theme) {
    const icon = document.querySelector('.theme-icon');
    if (icon) {
      icon.textContent = theme === THEME_DARK ? '☀️' : '🌙';
    }
  }

  // 테마 토글
  function toggleTheme() {
    const current = getTheme();
    const newTheme = current === THEME_DARK ? THEME_LIGHT : THEME_DARK;
    setTheme(newTheme);
  }

  // 초기화
  function init() {
    const theme = getTheme();
    setTheme(theme);

    // 토글 버튼 이벤트 리스너
    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', toggleTheme);
    }

    // 시스템 테마 변경 감지
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', (e) => {
        // 저장된 테마가 없을 때만 시스템 설정 따르기
        if (!localStorage.getItem(THEME_KEY)) {
          setTheme(e.matches ? THEME_DARK : THEME_LIGHT);
        }
      });
    }
  }

  // DOM 로드 완료 시 초기화
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

