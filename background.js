chrome.runtime.onMessage.addListener((message, sender) => {
  if (!message.count || !sender.tab || !sender.tab.url) return;

  // 1) Find the bookmark matching this page’s URL
  chrome.bookmarks.search({ url: sender.tab.url }, (results) => {
    if (!results || !results.length) return;
    const bm = results[0];
    const newCount = message.count;

    // 2) Pull out the previous count, whether it was "123" or "123 → 456"
    let prevCount = null;
    const arrowMatch = bm.title.match(/->\s*(\d+)$/);
    if (arrowMatch) {
      prevCount = arrowMatch[1];
    } else {
      const numMatch = bm.title.match(/(\d+)$/);
      if (numMatch) prevCount = numMatch[1];
    }

    // 3) If no prevCount or it didn’t change, do nothing
    if (!prevCount || prevCount === newCount) return;
	
	// 4) Strip off any trailing “123” or “123 → 456” from the title
    const baseMatch = bm.title.match(/^(.*?)(?:\s*(?:\d+\s*->\s*\d+|\d+))$/);
    const baseTitle = baseMatch ? baseMatch[1].trim() : bm.title;
	
	// 5) Build “Base Title  OLD → NEW”
    const newTitle = `${baseTitle} ${prevCount} → ${newCount}`;

    // 6) Apply only if it actually differs
    if (bm.title !== newTitle) {
      chrome.bookmarks.update(bm.id, { title: newTitle });
    }
  });
});