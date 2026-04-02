// =============================================
// search.js — 시설 이름 검색 기능
// =============================================

window.addEventListener('DOMContentLoaded', () => {
  const searchInput   = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');
  if (!searchInput || !searchResults) return;

  // ── 입력값으로 마커 검색 ──────────────────
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim();

    if (!query) {
      searchResults.innerHTML = '';
      searchResults.classList.add('hidden');
      return;
    }

    const matched = markers.filter(m => {
      const name = m.feature?.properties?.name || '';
      return name.includes(query);
    });

    renderResults(matched, query);
  });

  // ── 검색 결과 렌더링 ──────────────────────
  function renderResults(matched, query) {
    if (matched.length === 0) {
      searchResults.innerHTML = '<div class="search-no-result">검색 결과 없음</div>';
      searchResults.classList.remove('hidden');
      return;
    }

    searchResults.innerHTML = '';
    matched.forEach((marker, i) => {
      const p = marker.feature.properties;

      const item = document.createElement('div');
      item.classList.add('search-result-item');

      // 검색어 하이라이트
      const highlighted = p.name.replace(
        new RegExp(escapeRegex(query), 'g'),
        match => `<mark class="search-highlight">${match}</mark>`
      );

      item.innerHTML = `
        <span class="search-result-type" style="color:${p.color}">${p.type}</span>
        <span class="search-result-name">${highlighted}</span>
      `;

      item.addEventListener('click', () => {
        map.flyTo(marker.getLatLng(), 16);
        marker.openPopup();
        searchInput.value = '';
        searchResults.classList.add('hidden');
      });

      searchResults.appendChild(item);
    });

    searchResults.classList.remove('hidden');
  }

  // ── 검색창 외부 클릭 시 결과 닫기 ────────
  document.addEventListener('click', (e) => {
    const searchBar = document.querySelector('.search-bar');
    if (searchBar && !searchBar.contains(e.target)) {
      searchResults.classList.add('hidden');
    }
  });

  // ── 정규식 특수문자 이스케이프 헬퍼 ──────
  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
});
