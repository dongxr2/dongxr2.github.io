(() => {
  const counter = document.getElementById('visit-count');
  if (!counter) return;
  const key = 'dongxr-academic-home-views-v1';
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw === null ? 0 : Number(raw);
    const previous = Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : 0;
    const next = Math.min(previous + 1, Number.MAX_SAFE_INTEGER);
    localStorage.setItem(key, String(next));
    counter.textContent = next.toLocaleString(document.documentElement.lang === 'en' ? 'en-US' : 'zh-CN');
  } catch (_) {
    counter.textContent = '—';
    counter.parentElement.title = document.documentElement.lang === 'en' ? 'Browser storage is unavailable; views cannot be saved.' : '浏览器存储不可用，无法保存访问次数。';
  }
})();
