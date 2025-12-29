import { RSSFeed } from '@/data/rssFeeds';
/**
 * Escapes special characters for XML compliance.
 */
function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
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
 * Generates an OPML 2.0 XML string from a list of RSS feeds, grouped by category.
 */
export function generateOPML(feeds: RSSFeed[]): string {
  const dateStr = new Date().toUTCString();
  // Group feeds by category
  const groups: Record<string, RSSFeed[]> = {};
  feeds.forEach(feed => {
    if (!groups[feed.category]) {
      groups[feed.category] = [];
    }
    groups[feed.category].push(feed);
  });
  const categories = Object.keys(groups).sort();
  const bodyContent = categories.map(category => {
    const categoryFeeds = groups[category];
    const categoryTitle = escapeXml(category);
    const feedOutlines = categoryFeeds.map(feed => {
      const title = escapeXml(feed.title);
      const xmlUrl = escapeXml(feed.url);
      const desc = escapeXml(feed.description);
      return `      <outline type="rss" text="${title}" title="${title}" xmlUrl="${xmlUrl}" htmlUrl="${xmlUrl}" description="${desc}" />`;
    }).join('\n');
    return `    <outline text="${categoryTitle}" title="${categoryTitle}">
${feedOutlines}
    </outline>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>Lehigh Valley Regional Intelligence Directory</title>
    <dateCreated>${dateStr}</dateCreated>
    <ownerName>TagFlow AI</ownerName>
  </head>
  <body>
${bodyContent}
  </body>
</opml>`;
}
/**
 * Generates and triggers a download for the professional OPML file.
 */
export function exportFeedsToOPML(feeds: RSSFeed[]) {
  try {
    const opmlContent = generateOPML(feeds);
    const blob = new Blob([opmlContent], { type: 'text/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lehigh-valley-intelligence-${new Date().toISOString().split('T')[0]}.opml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('OPML Export Failed:', error);
    return false;
  }
}