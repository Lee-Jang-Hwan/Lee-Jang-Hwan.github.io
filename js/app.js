// 메인 애플리케이션 로직: 게시글 목록 렌더링, 라우팅

(function() {
  'use strict';

  let posts = [];

  // posts.json 로드
  async function loadPosts() {
    try {
      const response = await fetch('posts.json');
      if (!response.ok) {
        throw new Error('게시글 목록을 불러올 수 없습니다.');
      }
      posts = await response.json();
      
      // search.js에 posts 전달
      if (window.setPosts) {
        window.setPosts(posts);
      }
      
      renderPosts(posts);
      renderTagFilters(posts);
    } catch (error) {
      console.error('게시글 로드 오류:', error);
      document.getElementById('posts-container').innerHTML = 
        '<p>게시글을 불러오는 중 오류가 발생했습니다.</p>';
    }
  }

  // 게시글 카드 렌더링
  function renderPostCard(post) {
    const date = post.date ? new Date(post.date).toLocaleDateString('ko-KR') : '';
    const tagsHTML = post.tags && post.tags.length > 0
      ? `<div class="post-tags">
          ${post.tags.map(tag => `<span class="post-tag">${tag}</span>`).join('')}
         </div>`
      : '';

    return `
      <article class="post-card" onclick="window.location.href='post.html?file=${post.file}'">
        <h2><a href="post.html?file=${post.file}">${post.title || post.file}</a></h2>
        <div class="post-meta">
          ${date ? `<span>${date}</span>` : ''}
          ${post.category ? `<span>${post.category}</span>` : ''}
        </div>
        ${post.excerpt ? `<p class="post-excerpt">${post.excerpt}</p>` : ''}
        ${tagsHTML}
      </article>
    `;
  }

  // 게시글 목록 렌더링
  function renderPosts(postsToRender) {
    const container = document.getElementById('posts-container');
    if (!container) return;

    if (!postsToRender || postsToRender.length === 0) {
      container.innerHTML = '<p>게시글이 없습니다.</p>';
      return;
    }

    container.innerHTML = postsToRender.map(renderPostCard).join('');
  }

  // 태그 필터 버튼 렌더링
  function renderTagFilters(postsData) {
    const container = document.getElementById('tag-filters');
    if (!container) return;

    // 모든 태그 수집
    const tagSet = new Set();
    postsData.forEach(post => {
      if (post.tags && Array.isArray(post.tags)) {
        post.tags.forEach(tag => tagSet.add(tag));
      }
    });

    // 태그 배열로 변환 및 정렬
    const tags = Array.from(tagSet).sort();

    // 태그 버튼 생성
    const buttonsHTML = tags.map(tag => 
      `<button class="filter-btn" data-tag="${tag}">${tag}</button>`
    ).join('');

    container.innerHTML = buttonsHTML;

    // 태그 필터 이벤트 리스너 재등록
    if (window.initTagFilters) {
      window.initTagFilters();
    } else {
      // search.js의 initTagFilters 호출을 위해 이벤트 재바인딩
      setTimeout(() => {
        const filterBtns = document.querySelectorAll('.filter-btn[data-tag]');
        filterBtns.forEach(btn => {
          btn.addEventListener('click', () => {
            // 모든 버튼에서 active 제거
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            // 클릭한 버튼에 active 추가
            btn.classList.add('active');
            
            const tag = btn.dataset.tag;
            if (window.setTagFilter) {
              window.setTagFilter(tag);
            }
            
            const searchInput = document.getElementById('search-input');
            const searchTerm = searchInput ? searchInput.value : '';
            
            const filtered = window.getFilteredPosts ? 
              window.getFilteredPosts() : 
              posts.filter(p => !tag || tag === 'all' || (p.tags && p.tags.includes(tag)));
            
            const finalFiltered = searchTerm 
              ? filtered.filter(p => {
                  const term = searchTerm.toLowerCase();
                  return (p.title || '').toLowerCase().includes(term) ||
                         (p.excerpt || '').toLowerCase().includes(term) ||
                         (p.tags || []).join(' ').toLowerCase().includes(term);
                })
              : filtered;
            
            renderPosts(finalFiltered);
            
            const noResults = document.getElementById('no-results');
            if (noResults) {
              noResults.style.display = finalFiltered.length === 0 ? 'block' : 'none';
            }
          });
        });
      }, 100);
    }
  }

  // 전역 함수로 내보내기 (search.js에서 사용)
  window.renderPosts = renderPosts;

  // 초기화
  function init() {
    loadPosts();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

