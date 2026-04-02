// =============================================
// boundary.js — 행정동 경계 레이어 및 토글
// =============================================

// 행정동 라벨 툴팁 레이어 목록
const boundaryTooltipLayers = [];

// ── 줌 레벨에 따라 행정동명 표시/숨김 ────────
function updateBoundaryLabelVisibility() {
  const visible = map.getZoom() >= LABEL_ZOOM_THRESHOLD;
  boundaryTooltipLayers.forEach(tooltip => {
    const el = tooltip.getElement();
    if (el) el.style.display = visible ? 'block' : 'none';
  });
}

// ── 행정동 GeoJSON 로드 ───────────────────────
fetch('data/hwao.geojson')
  .then(res => res.json())
  .then(geojsonData => {
    L.geoJSON(geojsonData, {
      pane: 'overlayPane',
      style: () => ({ className: 'boundary-layer' }),
      onEachFeature: function(feature, layer) {
        const label = feature.properties.adm_nm;

        // 겹침 문제 있는 지역은 고정 좌표 사용, 나머지는 Turf로 자동 계산
        let latlng;
        if (FIXED_TOOLTIP_POSITIONS[label]) {
          latlng = FIXED_TOOLTIP_POSITIONS[label];
        } else {
          const coords = turf.pointOnFeature(feature).geometry.coordinates; // [lng, lat]
          latlng = [coords[1], coords[0]]; // Leaflet 좌표 순서로 변환
        }

        const tooltip = L.tooltip({
          permanent: true,
          direction: 'center',
          className: 'boundary-label'
        })
          .setContent(label)
          .setLatLng(latlng);

        tooltip.addTo(map);
        boundaryTooltipLayers.push(tooltip);
      }
    }).addTo(map);

    map.on('zoomend', updateBoundaryLabelVisibility);
    updateBoundaryLabelVisibility(); // 초기 상태 적용
  })
  .catch(err => console.error('행정동 경계 로드 실패:', err));

// ── 행정동 경계 표시/숨김 토글 ───────────────
document.getElementById('toggle-boundary').addEventListener('change', (e) => {
  const show = e.target.checked;
  document.querySelectorAll('.boundary-layer, .boundary-label').forEach(el => {
    el.style.display = show ? 'block' : 'none';
  });
});
