// =============================================
// markers.js — 시설 마커 데이터 로드 및 렌더링
// =============================================

fetch(sheetsUrl(GID_POINTS))
  .then(res => res.text())
  .then(text => {
    const rows = parseSheetsJson(text).table.rows;

    // 시트 데이터를 GeoJSON FeatureCollection으로 변환
    const geojson = {
      type: "FeatureCollection",
      features: rows.map(row => {
        const c = row.c;
        return {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [parseFloat(c[2]?.v), parseFloat(c[1]?.v)] // [lng, lat]
          },
          properties: {
            type:  c[3]?.v,
            name:  c[4]?.v,
            adrs:  c[5]?.v,
            capa:  c[6]?.v,
            sem_t: c[7]?.v,
            vac_t: c[8]?.v,
            time:  c[9]?.v,
            phone: c[10]?.v,
            shape: c[11]?.v,
            color: c[12]?.v
          }
        };
      })
    };

    L.geoJSON(geojson, {
      pointToLayer: function(feature, latlng) {
        const shape = feature.properties.shape || '⬤';
        const color = feature.properties.color || '#333';
        const icon = L.divIcon({
          className: 'custom-marker',
          html: `<div class="marker-shape" style="color:${color}">${shape}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });
        const marker = L.marker(latlng, { icon });
        marker.feature = feature; // 필터·검색용 메타데이터 보존
        markers.push(marker);
        return marker;
      },

      onEachFeature: function(feature, layer) {
        const p = feature.properties;
        let popup = `<div class="custom-popup">`;
        if (p.type)  popup += `<span class="popup-type" style="color:${p.color}">${p.type}</span>`;
        if (p.name)  popup += `<span class="popup-name">${p.name}</span><br>`;
        if (p.adrs)  popup += `<span class="popup-adrs">${p.adrs}</span>`;
        popup += `<hr style="border: solid 0.5px #dedede;">`;
        if (p.phone) popup += `<span class="popup-phone"><b style="font-weight:700;font-size:90%;position:relative;top:-1px">• 연락처</b> ${p.phone}</span>`;
        if (p.sem_t) popup += `<span class="popup-time"><b style="font-weight:700;font-size:90%;position:relative;top:-1px">• 학기중</b> ${p.sem_t}</span>`;
        if (p.vac_t) popup += `<span class="popup-time"><b style="font-weight:700;font-size:90%;position:relative;top:-1px">• 방학중</b> ${p.vac_t}</span>`;
        if (p.time)  popup += `<span class="popup-time"><b style="font-weight:700;font-size:90%;position:relative;top:-1px">• 운영 시간</b> ${p.time}</span>`;
        popup += `<button class="popup-more" data-type="${p.type}">더보기</button>`;
        popup += `</div>`;
        layer.bindPopup(popup);

        // 팝업 열릴 때마다 '더보기' 버튼에 이벤트 등록
        // e.popup.getElement()로 현재 팝업 DOM을 정확히 참조
        layer.on('popupopen', (e) => {
          const btn = e.popup.getElement()?.querySelector('.popup-more');
          if (!btn) return;
          btn.addEventListener('click', () => {
            const type = btn.dataset.type;
            const { trgt, desc, serv, fee } = legendMap[type] || {};
            showTypeInfo(type, trgt, desc, serv, fee);
          }, { once: true }); // 중복 등록 방지
        });
      }
    }).addTo(map);
  })
  .catch(err => console.error('시설 데이터 로드 실패:', err));
