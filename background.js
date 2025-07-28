chrome.runtime.onMessage.addListener((message, sender) => {
  if (!message.count || !sender.tab || !sender.tab.url) return;

  // 1) Find the bookmark matching this page’s URL
  chrome.bookmarks.search({ url: sender.tab.url }, (results) => {
    if (!results || !results.length) return;
    const bm = results[0];
    const newCount = message.count;

	// 2) Extract the “previous” count:
    //    • If there’s an existing “X → Y”, grab Y
    //    • Otherwise grab any trailing number
    const arrowMatch = bm.title.match(/(\d+)\s*→\s*(\d+)/);
    const prevCount = arrowMatch
      ? arrowMatch[2]
      : (bm.title.match(/(\d+)$/)?.[1] ?? null);

    // 3) If no prevCount or it didn’t change, do nothing
    if (!prevCount || prevCount === newCount) return;
	
	// 4) Strip off any trailing digits/arrow/timestamp so we have a clean base title
    //    This will remove “123”, “123 → 456”, or “123 → 456 @ …”
    const baseTitle = bm.title
      .replace(/\s*\d+(?:\s*→\s*\d+)?(?:\s*@.*)?$/, '')
      .trim();
	
	// 5) Build a fresh two-part diff
    const newTitle = `${baseTitle} ${prevCount} → ${newCount}`;

    // 6) Apply it
    if (newTitle !== bm.title) {
      chrome.bookmarks.update(bm.id, { title: newTitle });
    }
  });
});