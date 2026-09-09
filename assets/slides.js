
(() => {
  'use strict';
  const slides = [...document.querySelectorAll('.slide')];
  if (!slides.length) return;
  const english = document.documentElement.lang === 'en';
  const previous = document.getElementById('previous');
  const next = document.getElementById('next');
  const full = document.getElementById('fullscreen');
  const count = document.getElementById('count');
  const bar = document.getElementById('bar');
  const message = document.getElementById('message');
  let index = 0;
  function readHash() {
    const match = location.hash.match(/^#slide-(\d+)$/);
    return match ? Number(match[1]) - 1 : 0;
  }
  function show(n, save = true) {
    index = Math.max(0, Math.min(slides.length - 1, Number.isFinite(n) ? n : 0));
    slides.forEach((slide, i) => { slide.hidden = i !== index; });
    count.textContent = `${String(index + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    previous.disabled = index === 0;
    next.disabled = index === slides.length - 1;
    bar.style.width = `${(index + 1) / slides.length * 100}%`;
    if (save) {
      try { history.replaceState(null, '', `#slide-${index + 1}`); }
      catch (_) { /* Page navigation remains functional when history is unavailable. */ }
    }
  }
  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
      else message.textContent = english ? 'Fullscreen is unavailable in this browser. Use the browser presentation controls.' : '此浏览器不支持网页全屏，请使用浏览器的全屏功能。';
    } catch (_) {
      message.textContent = english ? 'Fullscreen was not enabled. Try your browser fullscreen command.' : '未能进入全屏，请使用浏览器的全屏功能。';
    }
  }
  document.documentElement.classList.add('js');
  previous.addEventListener('click', () => show(index - 1));
  next.addEventListener('click', () => show(index + 1));
  full.addEventListener('click', toggleFullscreen);
  document.addEventListener('fullscreenchange', () => {
    full.textContent = document.fullscreenElement ? (english ? 'Exit fullscreen' : '退出全屏') : (english ? 'Fullscreen' : '全屏演示');
    full.setAttribute('aria-pressed', String(Boolean(document.fullscreenElement)));
  });
  document.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName) || event.target.isContentEditable) return;
    if (event.key === ' ' && /BUTTON|A/.test(event.target.tagName)) return;
    if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(event.key)) { event.preventDefault(); show(index + 1); }
    else if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(event.key)) { event.preventDefault(); show(index - 1); }
    else if (event.key === 'Home') { event.preventDefault(); show(0); }
    else if (event.key === 'End') { event.preventDefault(); show(slides.length - 1); }
    else if (event.key.toLowerCase() === 'f') { event.preventDefault(); toggleFullscreen(); }
  });
  addEventListener('hashchange', () => show(readHash(), false));
  show(readHash());
})();
