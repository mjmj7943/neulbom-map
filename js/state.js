// =============================================
// state.js — 공유 상태 및 공통 유틸 함수
// =============================================

// 현재 선택된 필터 유형 (null = 전체 표시)
let currentFilterType = null;

// 전체 마커 객체 배열 (필터링·검색에 사용)
const markers = [];

// 유형별 상세 정보 조회 테이블 { 유형명: { trgt, desc, serv, fee } }
const legendMap = {};

// ── 마커 필터링 ─────────────────────────────
function filterMarkersByType(type) {
  currentFilterType = type;
  markers.forEach(marker => {
    const markerType = marker.feature.properties.type;
    const visible = (type === null || markerType === type);
    if (visible) {
      map.addLayer(marker);
    } else {
      map.removeLayer(marker);
    }
  });

  // 레전드 아이템 선택 상태 표시
  document.querySelectorAll('.legend-item').forEach(item => {
    if (type === null) {
      item.classList.remove('legend-item--active');
    } else {
      item.classList.toggle('legend-item--active', item.dataset.type === type);
    }
  });
}

// ── 유형 상세 정보 모달 표시 ─────────────────
function showTypeInfo(type, trgt, desc, serv, fee) {
  const infoBox = document.getElementById('type-info');
  const content = infoBox.querySelector('.type-info-text');

  let html = '';
  if (type) html += `<div class="type-title">${type}</div>`;

  html += `<table class="type-info-table">`;
  if (trgt) html += `<tr><td class="first-col">이용 대상</td><td>${trgt}</td></tr>`;
  if (desc) html += `<tr><td class="first-col">장소 설명</td><td>${desc}</td></tr>`;
  if (serv) html += `<tr><td class="first-col">지원 내용</td><td>${serv}</td></tr>`;
  if (fee)  html += `<tr><td class="first-col">이용료</td><td>${fee}</td></tr>`;
  html += '</table>';

  content.innerHTML = html;
  infoBox.classList.remove('hidden');
}
