/**
 * Algorithm for auto-updating bookmark titles:
 *
 * 1. On message (with newCount, time, date, and page URL):
 *    a. Format timestamp as "HH:MM DD.MM.YY"
 *    b. Search bookmarks for this URL.
 *
 * 2. If no bookmark exists:
 *      Create one named "<newCount> <timestamp>" and exit.
 *
 * 3. If a bookmark exists:
 *    a. Let title = existing bookmark title.
 *    b. Try to extract oldCount as the first number in title.
 *       - If no leading number (malformed), overwrite with "<newCount> <timestamp>" and exit.
 *
 *    c. Convert oldCount and newCount to integers.
 *    d. If newCount < oldCount:
 *         Reset title to "<newCount> <timestamp>" and exit.
 *
 *    e. If newCount == oldCount:
 *         Do nothing and exit.
 *
 *    f. Otherwise (newCount > oldCount):
 *         Update title to "<oldCount> → <newCount> <timestamp>"
 */
chrome.runtime.onMessage.addListener((message, sender) => {
  if (!message.count || !sender.tab?.url) return;
  const url = sender.tab.url;
  const newCount = message.count;
  const newCnt = parseInt(newCount, 10);

  const now = new Date();
  const pad = n => n.toString().padStart(2, '0');
  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const date = `${pad(now.getDate())}.${pad(now.getMonth()+1)}.${now.getFullYear().toString().slice(-2)}`;
  const ts = `${time} ${date}`;

  chrome.bookmarks.search({ url }, results => {
    if (!results || results.length === 0) {
      chrome.bookmarks.create({
        parentId: '1',
        title: `${newCount} ${ts}`,
        url
      });
      return;
    }

    const bm = results[0];
    const title = bm.title;

	let oldCount;
	const arrowMatch = title.match(/(\d+)\s*→\s*(\d+)/);
	if (arrowMatch) {
		oldCount = arrowMatch[2];
	} else {
		const m = title.match(/^(\d+)/);
		if (!m) {
			return;
		}
		oldCount = m[1];
	}
	const oldCnt = parseInt(oldCount, 10);

    if (newCnt < oldCnt) {
      chrome.bookmarks.update(bm.id, {
        title: `${newCount} ${ts}`
      });
      return;
    }

    if (newCnt === oldCnt) return;

    const newTitle = `${oldCount} → ${newCount} ${ts}`;
    if (newTitle !== title) {
      chrome.bookmarks.update(bm.id, { title: newTitle });
    }
  });
});
