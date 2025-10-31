// 검색 기능

(function() {
  'use strict';

  let allPosts = [];
  let filteredPosts = [];
  let currentTagFilter = 'all';

  // 검색 및 필터링 함수
  function filterPosts(searchTerm, tagFilter) {
    let posts = [...allPosts];

    // 태그 필터링
    if (tagFilter && tagFilter !== 'all') {
      posts = posts.filter(post => 
        post.tags && post.tags.includes(tagFilter)
      );
    }

    // 검색어 필터링
    if (searchTerm && searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      posts = posts.filter(post => {
        const title = (post.title || '').toLowerCase();
        const excerpt = (post.excerpt || '').toLowerCase();
        const tags = (post.tags || []).join(' ').toLowerCase();
        const category = (post.category || '').toLowerCase();
        
        return title.includes(term) || 
               excerpt.includes(term) || 
               tags.includes(term) || 
               category.includes(term);
      });
    }

    filteredPosts = posts;
    return posts;
  }

  // 검색 입력 이벤트
  function initSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;

    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      const term = e.target.value;
      
      searchTimeout = setTimeout(() => {
        const posts = filterPosts(term, currentTagFilter);
        if (window.renderPosts) {
          window.renderPosts(posts);
        }
        updateNoResults(posts.length === 0);
      }, 300);
    });
  }

  // 태그 필터 버튼 클릭 이벤트
  function initTagFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // 모든 버튼에서 active 제거
        filterBtns.forEach(b => b.classList.remove('active'));
        // 클릭한 버튼에 active 추가
        btn.classList.add('active');
        
        const tag = btn.dataset.tag || 'all';
        currentTagFilter = tag;
        
        const searchInput = document.getElementById('search-input');
        const searchTerm = searchInput ? searchInput.value : '';
        
        const posts = filterPosts(searchTerm, tag);
        if (window.renderPosts) {
          window.renderPosts(posts);
        }
        updateNoResults(posts.length === 0);
      });
    });
  }

  // 검색 결과 없음 메시지 업데이트
  function updateNoResults(show) {
    const noResults = document.getElementById('no-results');
    if (noResults) {
      noResults.style.display = show ? 'block' : 'none';
    }
  }

  // 외부에서 사용할 수 있도록 함수 내보내기
  window.setPosts = function(posts) {
    allPosts = posts;
    filteredPosts = [...allPosts];
  };

  window.getFilteredPosts = function() {
    return filteredPosts;
  };

  window.setTagFilter = function(tag) {
    currentTagFilter = tag;
  };

  // 초기화
  function init() {
    initSearch();
    initTagFilters();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

