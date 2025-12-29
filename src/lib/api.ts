import { Article, Tag } from '@/types/schema';
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