// 게시글 로더: 마크다운 로딩 및 파싱, Giscus 로드

(function() {
  'use strict';

  // URL에서 파일명 추출
  function getPostFileFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('file');
  }

  // Front Matter 파싱
  function parseFrontMatter(content) {
    const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    
    if (!frontMatterMatch) {
      return { metadata: {}, content: content };
    }

    const frontMatter = frontMatterMatch[1];
    const postContent = frontMatterMatch[2];
    const metadata = {};

    const lines = frontMatter.split('\n');
    lines.forEach((line) => {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        let value = line.substring(colonIndex + 1).trim();

        // 따옴표 제거
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }

        // 배열 파싱 (tags)
        if (key === 'tags' && value.startsWith('[') && value.endsWith(']')) {
          try {
            value = JSON.parse(value);
          } catch {
            value = value
              .slice(1, -1)
              .split(',')
              .map((tag) => tag.trim().replace(/^['"]|['"]$/g, ''));
          }
        }

        metadata[key] = value;
      }
    });

    return { metadata, content: postContent };
  }

  // 마크다운을 HTML로 변환
  function renderMarkdown(content) {
    if (typeof marked === 'undefined') {
      console.error('marked.js가 로드되지 않았습니다.');
      return '<p>마크다운 파서를 로드할 수 없습니다.</p>';
    }

    // marked 옵션 설정
    marked.setOptions({
      breaks: true,
      gfm: true,
    });

    return marked.parse(content);
  }

  // 코드 하이라이팅 적용
  function highlightCode() {
    if (typeof Prism !== 'undefined') {
      Prism.highlightAll();
    }
  }

  // 게시글 렌더링
  function renderPost(postContent, metadata) {
    const container = document.getElementById('post-content');
    if (!container) return;

    const html = renderMarkdown(postContent);
    
    // 게시글 헤더 생성
    const headerHTML = `
      <div class="post-header">
        <h1>${metadata.title || '제목 없음'}</h1>
        <div class="post-meta">
          <span>${metadata.date || ''}</span>
          ${metadata.category ? `<span>${metadata.category}</span>` : ''}
        </div>
        ${metadata.tags && metadata.tags.length > 0 ? `
          <div class="post-tags">
            ${metadata.tags.map(tag => `<span class="post-tag">${tag}</span>`).join('')}
          </div>
        ` : ''}
      </div>
    `;

    container.innerHTML = headerHTML + html;
    
    // 페이지 제목 업데이트
    const titleEl = document.getElementById('post-title');
    if (titleEl) {
      titleEl.textContent = `${metadata.title || '게시글'} - Lee-Jang-Hwan's Blog`;
    }

    // 코드 하이라이팅 적용
    setTimeout(highlightCode, 100);
  }

  // Base path 감지
  function getBasePath() {
    const path = window.location.pathname;
    if (path.startsWith('/blog/')) {
      return '/blog/';
    }
    return '/';
  }

  // 게시글 로드
  async function loadPost(filename) {
    if (!filename) {
      document.getElementById('post-content').innerHTML = 
        '<p>게시글을 찾을 수 없습니다.</p>';
      return;
    }

    try {
      const basePath = getBasePath();
      const response = await fetch(`${basePath}pages/${filename}`);
      if (!response.ok) {
        throw new Error('게시글을 불러올 수 없습니다.');
      }

      const content = await response.text();
      const { metadata, content: postContent } = parseFrontMatter(content);
      
      renderPost(postContent, metadata);
      
      // Giscus 로드 (게시글 로드 후)
      loadGiscus(filename);
    } catch (error) {
      console.error('게시글 로드 오류:', error);
      document.getElementById('post-content').innerHTML = 
        '<p>게시글을 불러오는 중 오류가 발생했습니다.</p>';
    }
  }

  // Giscus 댓글 시스템 로드
  function loadGiscus(postFile) {
    const container = document.getElementById('giscus-container');
    if (!container) return;

    // 기존 Giscus 제거
    container.innerHTML = '';

    // TODO: Giscus 설정을 완료한 후 아래 값들을 업데이트하세요
    // 1. https://giscus.app/ko 에서 설정 정보 가져오기
    // 2. data-repo-id와 data-category-id 값을 업데이트하세요
    
    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-repo', 'Lee-Jang-Hwan/Lee-Jang-Hwan.github.io');
    script.setAttribute('data-repo-id', 'YOUR_REPO_ID'); // TODO: https://giscus.app/ko 에서 실제 값으로 교체 필요
    script.setAttribute('data-category', 'General');
    script.setAttribute('data-category-id', 'YOUR_CATEGORY_ID'); // TODO: 실제 값으로 교체 필요
    script.setAttribute('data-mapping', 'pathname');
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '1');
    script.setAttribute('data-input-position', 'bottom');
    script.setAttribute('data-theme', 'preferred_color_scheme');
    script.setAttribute('data-lang', 'ko');
    script.setAttribute('crossorigin', 'anonymous');
    script.async = true;

    container.appendChild(script);
  }

  // 초기화
  function init() {
    const filename = getPostFileFromURL();
    if (filename) {
      loadPost(filename);
    } else {
      document.getElementById('post-content').innerHTML = 
        '<p>게시글 파일명이 지정되지 않았습니다.</p>';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

