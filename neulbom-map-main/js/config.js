// =============================================
// config.js — 전역 상수 및 설정값
// =============================================

// 지도 초기 설정
const MAP_CENTER = [37.196554, 126.911871];
const MAP_ZOOM_DEFAULT = 10;
const MAP_ZOOM_MIN = 10;
const MAP_ZOOM_MAX = 17;
const MAP_BOUNDS_SW = [36.886521, 126.557641]; // 남서 한계
const MAP_BOUNDS_NE = [37.403725, 127.272064]; // 북동 한계

// 행정동 라벨 표시 줌 임계값 (이 값 이상일 때만 표시)
const LABEL_ZOOM_THRESHOLD = 12;

// 지도 이동 후 레전드바 복귀 딜레이 (ms)
const LEGEND_RETURN_DELAY = 1500;

// 인트로 툴팁 쿨다운 (1시간)
const TOOLTIP_COOLDOWN = 1000 * 60 * 60;

// Google Sheets 공통 ID
const SHEET_ID = '1ZTUWQ7A1WOKYwz4jz5Q09JaxKwdP-cZ_tK8EnupkMMI';
const GID_POINTS = '0';            // 시설 포인트 시트
const GID_LEGEND = '1998815174';   // 범례 시트
const GID_HELP   = '1804558100';   // 도움말 시트

// Google Sheets URL 생성 헬퍼
function sheetsUrl(gid) {
  return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${gid}`;
}

// Google Sheets JSON 응답 파싱 (wrapper 제거)
function parseSheetsJson(text) {
  return JSON.parse(text.substring(47).slice(0, -2));
}

// 행정동 라벨 고정 좌표 (Turf 자동 계산 시 겹치는 지역)
const FIXED_TOOLTIP_POSITIONS = {
  "서신면": [37.167095, 126.696779],
  "새솔동": [37.286120, 126.818398],
  "향남읍": [37.118272, 126.931240],
  "양감면": [37.091685, 126.963835],
  "봉담읍": [37.205030, 126.930070],
  "남촌동": [37.161945, 127.047722],
  "팔탄면": [37.162744, 126.881838]
};
