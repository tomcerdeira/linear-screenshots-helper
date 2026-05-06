export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildToastHtml(title: string, body: string, url: string, duration: number): string {
  const hasUrl = url.length > 0;
  const escapedTitle = escapeHtml(title);
  const escapedBody = escapeHtml(body);

  return `<!DOCTYPE html>
<html>
<head>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body {
    width: 100%; height: 100%;
    background: transparent !important;
    -webkit-app-region: no-drag;
    overflow: hidden;
  }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    display: flex;
    align-items: stretch;
    justify-content: stretch;
  }
  .toast {
    flex: 1;
    background: #232326;
    border: 1px solid #3b3b40;
    border-radius: 10px;
    padding: 12px 14px;
    display: flex; flex-direction: column; gap: 4px;
    animation: slideIn 200ms ease-out;
    cursor: default;
  }
  .header { display: flex; align-items: center; gap: 8px; }
  .icon-circle {
    width: 18px; height: 18px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .icon-circle.success { background: rgba(48,164,108,0.15); }
  .icon-circle.error { background: rgba(229,72,77,0.15); }
  .icon-circle svg { width: 11px; height: 11px; }
  .title { font-size: 13px; font-weight: 600; color: #e2e2ea; flex: 1; }
  .icon-btn {
    background: none; border: none; padding: 3px; cursor: pointer;
    color: #5a5e7a; border-radius: 4px;
    display: flex; align-items: center; justify-content: center;
  }
  .icon-btn:hover { color: #e2e2ea; background: #2a2a2e; }
  .icon-btn svg { width: 14px; height: 14px; }
  .icon-btn.copied { color: #30a46c; }
  .body {
    font-size: 12px; color: #9b9ba4;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    padding-left: 26px;
  }
  .footer { padding-left: 26px; padding-top: 2px; display: flex; align-items: center; gap: 10px; }
  .link {
    font-size: 12px; color: #5e6ad2; text-decoration: none; cursor: pointer;
    background: none; border: none; padding: 0; font-family: inherit;
  }
  .link:hover { text-decoration: underline; }
  @keyframes slideIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
  .fade-out { animation: fadeOut 300ms ease-in forwards; }
  @keyframes fadeOut { from { opacity:1; transform:translateY(0); } to { opacity:0; transform:translateY(8px); } }
</style>
</head>
<body>
<div class="toast" id="toast">
  <div class="header">
    <div class="icon-circle ${title === 'Error' ? 'error' : 'success'}">
      ${title === 'Error'
        ? '<svg fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="#e5484d"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>'
        : '<svg fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="#30a46c"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>'
      }
    </div>
    <span class="title">${escapedTitle}</span>
    <button class="icon-btn" id="closeBtn" title="Close">
      <svg fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
      </svg>
    </button>
  </div>
  <div class="body">${escapedBody}</div>
  ${hasUrl ? `<div class="footer">
    <button class="link" id="viewLink">View issue</button>
    <button class="icon-btn" id="copyBtn" title="Copy URL">
      <svg fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m0 0a2.625 2.625 0 1 1 5.25 0"/>
      </svg>
    </button>
  </div>` : ''}
</div>
<script>
  const url = ${JSON.stringify(url)};
  ${hasUrl ? `
  document.getElementById('viewLink').addEventListener('click', () => window.open(url, '_blank'));
  document.getElementById('copyBtn').addEventListener('click', () => {
    const ta = document.createElement('textarea');
    ta.value = url;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    const btn = document.getElementById('copyBtn');
    btn.classList.add('copied');
    btn.innerHTML = '<svg fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>';
    setTimeout(() => {
      btn.classList.remove('copied');
      btn.innerHTML = '<svg fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m0 0a2.625 2.625 0 1 1 5.25 0"/></svg>';
    }, 2000);
  });
  ` : ''}
  document.getElementById('closeBtn').addEventListener('click', () => dismiss());
  function dismiss() {
    document.getElementById('toast').classList.add('fade-out');
    setTimeout(() => window.close(), 300);
  }
  setTimeout(() => dismiss(), ${duration});
</script>
</body>
</html>`;
}
