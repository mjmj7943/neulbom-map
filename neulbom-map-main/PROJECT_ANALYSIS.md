# 늘봄 지도 프로젝트 분석

> **목적:** 구조 개선(JS 모듈화), 포인트 이름 검색 기능 추가, UI 개선 작업 전 현황 파악용 참고 문서

---

## 1. 프로젝트 개요

**화성오산 방과후·돌봄 지도** - 화성오산 교육지원청 늘봄학교 프로그램의 방과후·돌봄 시설을 지도 위에 시각화하는 웹앱.

- 프레임워크 없음, 순수 Vanilla JS + HTML + CSS
- 빌드 툴 없음 (브라우저에서 직접 실행)
- 데이터 소스: Google Sheets (공개 스프레드시트) + 로컬 GeoJSON

---

## 2. 전체 파일 구조

```
neulbom-map-main/
├── index.html              # 메인 HTML (110줄)
├── script.js               # 전체 JS 로직 (475줄, 단일 파일)
├── css/
│   ├── header.css          # 헤더, 토글 버튼
│   ├── layout.css          # 컨테이너, 모달, 도움말 버튼
│   ├── map.css             # 지도, 마커, 팝업, 경계선
│   ├── legend.css          # 레전드 바
│   ├── type.css            # 시설 유형 상세 모달
│   └── tooltip.css         # 인트로 툴팁, 말풍선
├── data/
│   ├── hwao.geojson        # 화성오산 행정동 경계 (309.9 KB)
│   ├── hwao_desc           # GeoJSON 출처 메모
│   └── Geojson출처.txt      # GeoJSON 출처 URL
├── hwaologo.svg            # 화성오산 교육지원청 로고
├── neulbom-logo.jpg        # 늘봄학교 로고
├── CLAUDE.md               # 프로젝트 가이드라인
└── README.md               # 최소한의 README
```

---

## 3. 외부 의존성

| 라이브러리 | 버전 | 역할 |
|---|---|---|
| Leaflet.js | 1.9.3 | 지도 렌더링, 마커, GeoJSON |
| Turf.js | 6.5.0 | 행정동 중심점 좌표 계산 |
| Noto Sans KR | - | 한글 폰트 |
| Google Tag Manager | GTM-KJ22NKND | 사용자 분석 |
| OpenStreetMap | - | 지도 타일 소스 |
| Google Sheets Visualization API | - | 데이터 소스 (3개 시트) |

---

## 4. 데이터 흐름

### Google Sheets 구조 (Sheet ID: `1ZTUWQ7A1WOKYwz4jz5Q09JaxKwdP-cZ_tK8EnupkMMI`)

| GID | 내용 | 주요 컬럼 |
|---|---|---|
| `0` | 시설 포인트 | 유형, 이름, 주소, 좌표, 연락처, 운영시간 |
| `1998815174` | 레전드 정보 | 유형, 모양, 색상, 대상, 설명, 서비스, 이용료 |
| `1804558100` | 도움말 내용 | 제목, 업데이트일, 안내문, 연락처, 다운로드 링크 |

### 데이터 흐름 요약

```
Google Sheets (3개 시트)
    ↓ fetch() → text → JSON.parse()
    ↓
├─ 레전드 시트 → legendMap 객체 (유형별 상세정보 조회용)
├─ 시설 포인트 시트 → GeoJSON → markers 배열 (Leaflet 마커)
└─ 도움말 시트 → 모달 innerHTML 직접 주입

로컬 GeoJSON
    ↓ fetch('data/hwao.geojson')
    ↓
└─ 행정동 경계 폴리곤 + 라벨 툴팁 → Leaflet 레이어
```

---

## 5. script.js 구조 분석 (475줄, 단일 파일)

현재 JS는 한 파일에 모든 로직이 혼재. 아래는 **논리적 역할별 구분** (모듈 분리 기준):

### [A] 전역 상태 변수 (3개)

```js
let currentFilterType = null;  // 현재 선택된 필터 유형
let markers = [];               // 전체 마커 객체 배열 (필터링에 사용)
let legendMap = {};             // { 유형명: { target, desc, serv, fee } }
```

### [B] 지도 초기화 (약 lines 4–15)

- `L.map('map')` 초기화 — 중심 좌표: `[37.196554, 126.911871]`
- 줌 범위: 10–17, 이동 범위: 화성오산 지역으로 제한
- 타일 레이어: OpenStreetMap, CSS `saturate(20%)` 탈색 처리

### [C] 행정동 경계 레이어 (약 lines 21–86)

- `data/hwao.geojson` 로드 → 경계 폴리곤 렌더링
- Turf.js `pointOnFeature()`로 행정동 라벨 위치 자동 계산
- 겹침 문제 있는 7개 지역: 하드코딩된 고정 좌표 사용
- 줌 레벨 12 이상에서만 라벨 표시 (`updateTooltipVisibility()`)
- 체크박스 토글로 경계선/라벨 show/hide

### [D] 레전드 생성 (약 lines 98–196)

- Google Sheets(GID: 1998815174) 데이터 fetch
- `legendMap` 객체 구성 (유형별 상세정보 저장)
- 레전드 아이템 DOM 생성 (2열 그리드, 이모지/색상 아이콘)
- 클릭 이벤트: `filterMarkersByType()` 호출
- 더블클릭: 전체 보기(필터 해제)

### [E] 시설 마커 생성 (약 lines 235–318)

- Google Sheets(GID: 0) 데이터 fetch
- 각 시설 → `L.divIcon` 커스텀 마커 생성 (이모지/심볼 + 색상)
- `markers` 배열에 저장
- 팝업 HTML: 시설명, 주소, 전화, 운영시간, "더보기" 버튼
- "더보기" 클릭 → `showTypeInfo()` 호출

### [F] UI 유틸 함수

| 함수명 | 역할 |
|---|---|
| `filterMarkersByType(type)` | 마커 필터링 (레이어 추가/제거) |
| `showTypeInfo(type, trgt, desc, serv, fee)` | 유형 상세 모달 표시 |
| `setContainerHeight()` | 뷰포트 높이 동적 조정 |
| `updateTooltipVisibility()` | 줌 레벨 기반 라벨 표시/숨김 |

### [G] 이벤트 핸들러

| 이벤트 | 동작 |
|---|---|
| 레전드 아이템 클릭 | `filterMarkersByType()` |
| 레전드 아이템 더블클릭 | 필터 해제 |
| 마커 클릭 | 팝업 열기 |
| 지도 드래그/줌 시작 | 레전드바 slide-out 숨김 |
| 지도 이동 종료 | 레전드바 1.5초 후 복귀 |
| 체크박스 변경 | 행정동 경계 토글 |
| 도움말 버튼 클릭 | 도움말 모달 열기 |
| Escape / 배경 클릭 | 모달 닫기 |
| 첫 방문 / localStorage | 인트로 툴팁 표시 (현재 HTML에서 비활성화) |

### [H] 도움말 모달 (약 lines 370–430)

- Google Sheets(GID: 1804558100) fetch → 모달 innerHTML 동적 주입
- 제목, 업데이트 날짜, 안내문, 연락처, 다운로드 링크

### [I] 인트로 툴팁 (약 lines 430–475)

- localStorage 기반 첫 방문 감지
- 2개 툴팁 → 모두 닫으면 1시간 쿨다운 저장
- **현재 HTML에서 비활성화됨** (div가 주석처리)

---

## 6. CSS 구조 분석

| 파일 | 역할 | 핵심 패턴 |
|---|---|---|
| `header.css` | 헤더 + 토글 체크박스 | 절대 위치, 커스텀 체크박스 pill 스타일 |
| `layout.css` | 전체 레이아웃, 모달, 도움말 버튼 | `100dvh`, flexbox 컬럼, 오버레이 z-index |
| `map.css` | 지도, 마커, 팝업, 경계선 | `saturate(20%)` 타일, `.custom-marker`, `.boundary-layer` |
| `legend.css` | 레전드 바 | `translateY(100%)` slide-out 애니메이션, 2열 grid |
| `type.css` | 시설 유형 상세 모달 | 테이블 레이아웃, z-index 2200 |
| `tooltip.css` | 말풍선 툴팁 | CSS triangle arrow, opacity transition |

### z-index 레이어 순서

```
헤더/레전드바: 1200
유형 상세 모달: 2200
도움말 모달: 3000
```

---

## 7. index.html 구조

```html
<head>
  Google Tag Manager | Leaflet CSS | CSS 6개 | Noto Sans KR | Turf.js
</head>
<body>
  <!-- GTM noscript -->
  <div id="container">
    <header>        <!-- 로고 + 타이틀 -->
    <button id="help-btn">?</button>
    <div id="boundary-toggle">  <!-- 행정동 표시 체크박스 -->
    <div id="help-modal">       <!-- 도움말 모달 -->
    <div id="type-info">        <!-- 시설 유형 상세 모달 -->
    <!-- #legend-tooltip, #map-tooltip → 주석 처리됨 -->
    <div id="map">              <!-- Leaflet 지도 -->
    <div id="legend-bar">       <!-- 레전드 바 (동적 생성) -->
  </div>
  <script src="script.js">
</body>
```

---

## 8. 현재 구조 (리팩토링 완료)

### 완료된 모듈 분리 구조

```
js/
├── config.js       # 상수 (Sheet ID, GID, 좌표, 줌 범위 등) + 헬퍼 함수
├── state.js        # 공유 상태 (currentFilterType, markers, legendMap) + 공통 함수
├── map.js          # 지도 초기화, 타일 레이어, 이동 이벤트, 컨테이너 높이
├── boundary.js     # GeoJSON 경계 로드, 라벨 표시, 줌 연동, 토글
├── legend.js       # 레전드 데이터 패치, 렌더링, 필터링
├── markers.js      # 시설 마커 데이터 패치, 생성, 팝업
├── modals.js       # 도움말 모달, 유형 상세 모달
├── tooltip.js      # 인트로 말풍선 툴팁 로직
└── search.js       # 시설명 검색 기능 (하이라이트, flyTo)
```

### 로드 순서 (index.html)
```
config.js → state.js → map.js → boundary.js → legend.js
→ markers.js → modals.js → tooltip.js → search.js
```
의존 관계: config → state → map → 나머지 (모두 전역 스코프 공유)

---

## 9. 검색 기능 구현 내용

### 데이터 접근 방식
- `markers` 배열의 각 마커에 `marker.feature.properties` (Leaflet GeoJSON 표준 방식)로 메타데이터 보존
- `marker.feature.properties.name` 으로 시설명 검색

### 구현된 기능
- 헤더 바로 아래 검색창 (헤더 50px + 8px 여백 = top: 58px)
- 입력 즉시 `markers` 배열 필터링 (한글 includes 방식)
- 검색어 하이라이트 (`<mark class="search-highlight">`)
- 결과 클릭 시 `map.flyTo(latlng, 16)` + 팝업 열기
- 외부 클릭 시 결과 드롭다운 닫기
- 지도 이동 시 결과 드롭다운 자동 닫기

---

## 10. z-index 계층 (리팩토링 완료)

`css/variables.css` 에서 CSS 커스텀 프로퍼티로 일괄 관리:

| 변수 | 값 | 적용 요소 |
|---|---|---|
| `--z-header` | 900 | 헤더 |
| `--z-legend` | 900 | 레전드 바 |
| `--z-controls` | 1000 | 도움말 버튼, 토글, 검색창 |
| `--z-tooltip` | 1100 | 말풍선 툴팁 |
| `--z-search-dropdown` | 1150 | 검색 결과 드롭다운 |
| `--z-type-modal` | 1200 | 유형 상세 모달 |
| `--z-help-modal` | 1300 | 도움말 모달 |

Leaflet 내부 z-index 참고: 타일(200) → 오버레이(400) → 마커(600) → 팝업(700) → 컨트롤(800)

## 11. UI 개선 시 고려사항

### 현재 UI 상태
- 모바일 기준 최대 너비 480px (PC에서도 480px 컨테이너)
- 레전드바: 슬라이드 애니메이션 있으나 2열 고정 그리드
- 팝업: 기본 Leaflet 팝업 스타일 커스터마이징
- 헤더: 고정 높이 50px, 로고 + 타이틀

### 개선 가능 영역
- 레전드바: 수평 스크롤 또는 접기/펼치기
- 팝업: 하단 시트(bottom sheet) 형태로 교체
- 마커 클러스터링: 밀집 지역 가독성 향상 (Leaflet.markercluster)
- 검색창: 헤더 내 통합 or 지도 상단 플로팅
- 로딩 상태: Google Sheets fetch 중 스피너 표시

---

## 11. 참고: 하드코딩된 값들

모듈화/유지보수 시 `config.js`로 분리 필요:

```js
// 지도 설정
const MAP_CENTER = [37.196554, 126.911871];
const ZOOM_DEFAULT = 10;
const ZOOM_MIN = 10, ZOOM_MAX = 17;
const LABEL_ZOOM_THRESHOLD = 12;

// Google Sheets
const SHEET_ID = '1ZTUWQ7A1WOKYwz4jz5Q09JaxKwdP-cZ_tK8EnupkMMI';
const GID_POINTS = '0';
const GID_LEGEND = '1998815174';
const GID_HELP = '1804558100';

// 행정동 라벨 고정 좌표 (겹침 처리)
const FIXED_TOOLTIP_POSITIONS = {
  '진안동': [37.1985, 126.8321], // ... 7개
};

// 레전드바 슬라이드 복귀 딜레이
const LEGEND_RETURN_DELAY = 1500;

// 툴팁 쿨다운
const TOOLTIP_COOLDOWN = 3600000; // 1시간 (ms)
```
