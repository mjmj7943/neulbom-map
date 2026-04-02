// =============================================
// tooltip.js — 인트로 말풍선 툴팁 (localStorage)
// =============================================

window.addEventListener('DOMContentLoaded', () => {
  const TOOLTIP_IDS     = ['legend-tooltip', 'map-tooltip'];
  const CLOSED_FLAGS_KEY = 'intro-tooltip-closed-flags';
  const LAST_CLOSED_KEY  = 'intro-tooltip-last-closed';

  const now = Date.now();
  const lastClosed = parseInt(localStorage.getItem(LAST_CLOSED_KEY), 10);
  const withinCooldown = lastClosed && (now - lastClosed < TOOLTIP_COOLDOWN);

  // 쿨다운 중이 아니면 2초 후 툴팁 표시
  if (!withinCooldown) {
    setTimeout(() => {
      TOOLTIP_IDS.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.remove('hidden');
        requestAnimationFrame(() => el.classList.add('show'));
      });
    }, 2000);
  }

  // 닫기 버튼 처리
  document.querySelectorAll('.tooltip-close').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetId = e.target.getAttribute('data-target');
      const el = document.getElementById(targetId);
      if (!el) return;

      el.classList.remove('show');
      el.addEventListener('transitionend', function handler() {
        el.classList.add('hidden');
        el.removeEventListener('transitionend', handler);
      });

      let flags = JSON.parse(localStorage.getItem(CLOSED_FLAGS_KEY) || '{}');
      flags[targetId] = true;
      localStorage.setItem(CLOSED_FLAGS_KEY, JSON.stringify(flags));

      // 두 개 모두 닫았을 때 쿨다운 시작
      const allClosed = TOOLTIP_IDS.every(id => flags[id]);
      if (allClosed) {
        localStorage.setItem(LAST_CLOSED_KEY, now.toString());
        localStorage.removeItem(CLOSED_FLAGS_KEY);
      }
    });
  });
});
