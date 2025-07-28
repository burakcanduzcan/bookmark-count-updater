(() => {
  // 1) Grab the <h2> inside .statistics-card → .content
  const el = document.querySelector('.statistics-card .content h2');
  if (!el) return;  

  // 2) Extract its text (the count) and send to background
  const count = el.textContent.trim();
  chrome.runtime.sendMessage({ count });
})();