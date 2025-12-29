import { Article, Tag, HubEvent, MorningBriefing, HubLocation, HubCategory } from '@/types/schema';
export async function fetchFeed(url: string): Promise<Article[]> {
  const res = await fetch('/api/rss/fetch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to fetch feed');
  return json.data;
}
export async function analyzeArticle(article: Partial<Article>): Promise<Tag[]> {
  const res = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: article.title, content: article.content }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Analysis failed');
  return json.data;
}
export async function syncToWP(articleId: string, tags: Tag[]): Promise<void> {
  const res = await fetch('/api/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ articleId, tags }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Sync failed');
}
// --- Hub API ---
export async function fetchEvents(location?: HubLocation | null, category?: HubCategory | null, q?: string): Promise<HubEvent[]> {
  const params = new URLSearchParams();
  if (location) params.append('location', location);
  if (category) params.append('category', category);
  if (q) params.append('q', q);
  const res = await fetch(`/api/hub/events?${params.toString()}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to fetch hub events');
  return json.data;
}
export async function fetchBriefing(): Promise<MorningBriefing> {
  const res = await fetch('/api/hub/briefing');
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to fetch morning briefing');
  return json.data;
}
export async function triggerCuration(): Promise<{ count: number }> {
  const res = await fetch('/api/hub/scrape', { method: 'POST' });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Curation trigger failed');
  return json;
}
export async function parseRssToEvents(feedUrl: string): Promise<{ count: number }> {
  const res = await fetch('/api/hub/parse-rss', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ feedUrl }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Bulk parse failed');
  return json;
}