import { RSSFeed } from '@/data/rssFeeds';
/**
 * Generates an OPML XML string from a list of RSS feeds.
 */
export function generateOPML(feeds: RSSFeed[]): string {
  const dateStr = new Date().toUTCString();
  const outlines = feeds.map(feed => {
    return `    <outline text="${escapeXml(feed.title)}" title="${escapeXml(feed.title)}" type="rss" xmlUrl="${escapeXml(feed.url)}" htmlUrl="${escapeXml(feed.url)}" category="${escapeXml(feed.category)}" description="${escapeXml(feed.description)}" />`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>Lehigh Valley RSS Feeds Directory</title>
    <dateCreated>${dateStr}</dateCreated>
  </head>
  <body>
    <outline text="Lehigh Valley Feeds" title="Lehigh Valley Feeds">
${outlines}
    </outline>
  </body>
</opml>`;
}
function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&"']/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '"': return '&quot;';
      case "'": return '&apos;';
      default: return c;
    }
  });
}
/**
 * Generates and triggers a download for the OPML file.
 */
export function exportFeedsToOPML(feeds: RSSFeed[]) {
  const opmlContent = generateOPML(feeds);
  const blob = new Blob([opmlContent], { type: 'text/xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'lehigh-valley-feeds.opml';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}