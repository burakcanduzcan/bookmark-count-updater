// background.js
chrome.runtime.onMessage.addListener((message, sender) => {
  if (!message.count || !sender.tab || !sender.tab.url) return;

  chrome.bookmarks.search({ url: sender.tab.url }, (results) => {
    if (!results || !results.length) return;
    const bm = results[0];
    const newCount = message.count;

    // ─── Extract the previous count ───
    let prevCount = null;
    const arrowMatch = bm.title.match(/->\s*(\d+)$/);
    if (arrowMatch) {
      prevCount = arrowMatch[1];
    } else {
      const numMatch = bm.title.match(/(\d+)$/);
      if (numMatch) prevCount = numMatch[1];
    }

    // If nothing changed, bail
    if (!prevCount || prevCount === newCount) return;

    // ─── Extract the base title (stripping off any old numbers/arrows) ───
    const baseMatch = bm.title.match(/^(.*?)(?:\s*(?:\d+\s*->\s*\d+|\d+))$/);
    const baseTitle = baseMatch ? baseMatch[1].trim() : bm.title;

    // ─── Build and apply the new title ───
    const newTitle = `${baseTitle} ${prevCount} → ${newCount}`;
    chrome.bookmarks.update(bm.id, { title: newTitle });
  });
});
