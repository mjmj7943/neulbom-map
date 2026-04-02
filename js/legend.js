// =============================================
// legend.js — 범례 데이터 로드, 렌더링, 필터
// =============================================

fetch(sheetsUrl(GID_LEGEND))
  .then(res => res.text())
  .then(text => {
    const rows = parseSheetsJson(text).table.rows;
    const legendContainer = document.getElementById('legend');

    rows.forEach(row => {
      const type  = row.c[1]?.v;
      const shape = row.c[2]?.v;
      const color = row.c[3]?.v;
      const trgt  = row.c[4]?.v;
      const desc  = row.c[5]?.v;
      const serv  = row.c[6]?.v;
      const fee   = row.c[7]?.v;

      // 유형별 상세 정보 저장 (markers.js의 팝업 '더보기'에서 사용)
      legendMap[type] = { trgt, desc, serv, fee };

      const item = document.createElement('div');
      item.classList.add('legend-item');
      item.dataset.type = type;

      const icon = document.createElement('span');
      icon.textContent = shape;
      icon.style.color = color;
      icon.style.marginRight = '8px';

      const label = document.createElement('span');
      label.textContent = type;

      item.appendChild(icon);
      item.appendChild(label);
      legendContainer.appendChild(item);

      // 클릭 시 해당 유형으로 필터, 재클릭 시 해제
      item.addEventListener('click', () => {
        filterMarkersByType(currentFilterType === type ? null : type);
      });
    });

    // 전체 표시 버튼
    const allItem = document.createElement('div');
    allItem.classList.add('legend-item');
    const allIcon = document.createElement('span');
    allIcon.textContent = '🔄';
    allIcon.style.marginRight = '8px';
    const allLabel = document.createElement('span');
    allLabel.textContent = '전체 표시';
    allItem.appendChild(allIcon);
    allItem.appendChild(allLabel);
    legendContainer.appendChild(allItem);

    allItem.addEventListener('click', () => filterMarkersByType(null));
  })
  .catch(err => console.error('범례 데이터 로드 실패:', err));
