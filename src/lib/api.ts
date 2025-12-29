import { Article, Tag, HubEvent, MorningBriefing } from '@/types/schema';
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
export async function fetchEvents(): Promise<HubEvent[]> {
  const res = await fetch('/api/hub/events');
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