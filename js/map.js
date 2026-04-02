// =============================================
// map.js — 지도 초기화 및 이동 이벤트
// =============================================

// 지도 초기화
const map = L.map('map', { zoomControl: false }).setView(MAP_CENTER, MAP_ZOOM_DEFAULT);

// 이동 범위 및 줌 제한
const mapBounds = L.latLngBounds(MAP_BOUNDS_SW, MAP_BOUNDS_NE);
map.setMaxBounds(mapBounds);
map.setMinZoom(MAP_ZOOM_MIN);
map.setMaxZoom(MAP_ZOOM_MAX);

// 타일 레이어 (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors',
}).addTo(map);

// ── 컨테이너 높이 동적 조정 ──────────────────
function setContainerHeight() {
  const container = document.querySelector('.container');
  if (container) container.style.height = `${window.innerHeight}px`;
}
window.addEventListener('resize', setContainerHeight);
window.addEventListener('orientationchange', setContainerHeight);
setContainerHeight();

// ── 지도 이동 중 레전드바·툴팁 숨김/복귀 ────
let legendHideTimer;

map.on('movestart zoomstart dragstart', () => {
  document.querySelector('.legend-bar')?.classList.add('slide-out');
  document.querySelectorAll('.balloon-tooltip').forEach(el => {
    el.classList.remove('show');
    el.classList.add('hidden');
  });
  // 검색 결과 닫기
  document.getElementById('search-results')?.classList.add('hidden');
  clearTimeout(legendHideTimer);
});

map.on('moveend zoomend dragend', () => {
  legendHideTimer = setTimeout(() => {
    document.querySelector('.legend-bar')?.classList.remove('slide-out');
    document.querySelectorAll('.balloon-tooltip').forEach(el => {
      el.classList.remove('hidden');
      el.classList.add('show');
    });
  }, LEGEND_RETURN_DELAY);
});
