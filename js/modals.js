// =============================================
// modals.js — 도움말 모달 및 유형 상세 모달
// =============================================

// ── 도움말 모달 열기/닫기 ────────────────────
const helpBtn   = document.querySelector('.help-button');
const helpModal = document.getElementById('help-modal');
const helpModalClose = document.getElementById('help-modal-close');

if (helpBtn && helpModal && helpModalClose) {
  helpBtn.addEventListener('click', () => helpModal.classList.remove('hidden'));

  helpModalClose.addEventListener('click', () => helpModal.classList.add('hidden'));

  helpModal.addEventListener('click', (e) => {
    const content = document.querySelector('.modal-content');
    if (content && !content.contains(e.target)) helpModal.classList.add('hidden');
  });
}

// ── 유형 상세 모달 닫기 ──────────────────────
document.querySelector('.type-info-close')?.addEventListener('click', () => {
  document.getElementById('type-info').classList.add('hidden');
});

document.getElementById('type-info')?.addEventListener('click', (e) => {
  const content = document.querySelector('.type-info-content');
  if (content && !content.contains(e.target)) {
    document.getElementById('type-info').classList.add('hidden');
  }
});

// ── 도움말 내용 로드 (Google Sheets) ─────────
fetch(sheetsUrl(GID_HELP))
  .then(res => res.text())
  .then(text => {
    const rows = parseSheetsJson(text).table.rows;
    if (rows.length < 2) return;

    const c = rows[1].c;
    const updateDate  = c[1]?.v || '';
    const helpTitle   = c[2]?.v || '';
    const helpSubtitle = c[3]?.v || '';
    const helpContent = c[4]?.v || '';
    const contact     = c[5]?.v || '';
    const download    = c[6]?.v || '';
    const downloadlink = c[7]?.v || '';

    const modalBody = document.getElementById('help-modal-body');
    let html = '';
    if (helpTitle)    html += `<h2>${helpTitle}</h2>`;
    if (helpSubtitle) html += `<p>${helpSubtitle}</p>`;
    if (helpContent)  html += `<p style="font-size:12px">${helpContent}</p>`;
    if (contact)      html += `<p style="font-size:11px;color:gray">※ 문의 및 오류신고: ${contact}</p>`;
    if (updateDate)   html += `<p style="font-size:11px;color:gray">※ 최근 업데이트: ${updateDate}</p>`;
    if (download)     html += `<div class="modal-download-button"><a href="${downloadlink}" target="_blank" style="color:black;text-decoration:none">${download}</a></div>`;
    modalBody.innerHTML = html;
  })
  .catch(err => console.error('도움말 데이터 로드 실패:', err));
