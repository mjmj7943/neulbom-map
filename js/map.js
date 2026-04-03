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

// ── 핀치 줌 방지 (환경별 대응) ──────────────────────────────────────────────
//
// [모바일] touchstart/touchmove: 두 손가락 터치 → preventDefault
document.addEventListener('touchstart', (e) => {
  if (e.touches.length > 1) e.preventDefault();
}, { passive: false });
document.addEventListener('touchmove', (e) => {
  if (e.touches.length > 1) e.preventDefault();
}, { passive: false });

// [iOS Safari 전용] gesturestart/gesturechange: 위 touchstart보다 먼저 발생
document.addEventListener('gesturestart',  (e) => e.preventDefault());
document.addEventListener('gesturechange', (e) => e.preventDefault());

// [데스크톱/트랙패드] wheel + ctrlKey: 맥 트랙패드 핀치 및 Ctrl+스크롤 줌 방지
// Leaflet의 일반 스크롤 줌(ctrlKey 없음)은 영향 없음
document.addEventListener('wheel', (e) => {
  if (e.ctrlKey) e.preventDefault();
}, { passive: false });

// ── 지도 이동 중 레전드바 숨김/복귀, 검색 결과 닫기 ────
let legendHideTimer;

map.on('movestart zoomstart dragstart', () => {
  document.querySelector('.legend-bar')?.classList.add('slide-out');
  document.getElementById('search-results')?.classList.add('hidden');
  clearTimeout(legendHideTimer);
});

map.on('moveend zoomend dragend', () => {
  legendHideTimer = setTimeout(() => {
    document.querySelector('.legend-bar')?.classList.remove('slide-out');
  }, LEGEND_RETURN_DELAY);
});
